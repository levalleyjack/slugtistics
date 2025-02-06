from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, session
from contextlib import contextmanager
from sqlalchemy import func, case
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import uuid
import hashlib
from scraping.ratings import get_detailed_professor_info
from models.data_models import CourseModel, LastUpdateModel, VisitorModel, db
from config import app

logger = logging.getLogger(__name__)
courses_bp = Blueprint("courses", __name__)


@contextmanager
def session_scope():
    with app.app_context():
        session = db.session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            session.close()


def monitor_pool_status():
    with app.app_context():
        engine = db.engine
        if hasattr(engine.pool, "size"):
            logger.info(f"Connection pool size: {engine.pool.size()}")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def execute_with_retry(query_func):
    with app.app_context():
        return query_func()




@courses_bp.before_app_request
def track_visitor():
    if not request.path.startswith(('/static/', '/favicon.ico')):
        try:
            ip = request.remote_addr
            user_agent = request.user_agent.string
            visitor_signature = f"{ip}_{user_agent}"
            
            yesterday = datetime.now() - timedelta(days=1)
            with session_scope() as session:
                recent_visit = session.query(VisitorModel).filter(
                    VisitorModel.ip_address == ip,
                    VisitorModel.user_agent == user_agent, 
                    VisitorModel.path == request.path,
                    VisitorModel.timestamp >= yesterday
                ).first()
                
                is_unique = recent_visit is None

                visitor = VisitorModel(
                    path=request.path,
                    ip_address=ip,
                    user_agent=user_agent,
                    referrer=request.referrer,
                    is_unique=is_unique
                )
                session.add(visitor)
        except Exception as e:
            logger.error(f"Error tracking visitor: {str(e)}")
            

@courses_bp.route("/api/pyback/visitors/stats", methods=["GET"])
def get_visitor_stats():
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.now() - timedelta(days=days)
        
        with session_scope() as session:
            # Total visits
            total_visits = session.query(func.count(VisitorModel.id))\
                .filter(VisitorModel.timestamp >= start_date).scalar()

            # Unique visits
            unique_visits = session.query(func.count(VisitorModel.id))\
                .filter(
                    VisitorModel.timestamp >= start_date,
                    VisitorModel.is_unique == True
                ).scalar()
                
            # Daily visits (total and unique)
            daily_stats = session.query(
                func.date(VisitorModel.timestamp).label('date'),
                func.count(VisitorModel.id).label('total_visits'),
                func.sum(case((VisitorModel.is_unique == True, 1), else_=0)).label('unique_visits')
            ).filter(VisitorModel.timestamp >= start_date)\
             .group_by(func.date(VisitorModel.timestamp))\
             .all()
                
            # Most visited pages
            popular_pages = session.query(
                VisitorModel.path,
                func.count(VisitorModel.id).label('total_visits'),
                func.sum(case((VisitorModel.is_unique == True, 1), else_=0)).label('unique_visits')
            ).filter(VisitorModel.timestamp >= start_date)\
             .group_by(VisitorModel.path)\
             .order_by(func.count(VisitorModel.id).desc())\
             .limit(10)\
             .all()
            
            return jsonify({
                'success': True,
                'data': {
                    'total_visits': total_visits,
                    'unique_visits': unique_visits,
                    'daily_stats': [{
                        'date': str(date),
                        'total_visits': total,
                        'unique_visits': unique
                    } for date, total, unique in daily_stats],
                    'popular_pages': [{
                        'path': path,
                        'total_visits': total,
                        'unique_visits': unique
                    } for path, total, unique in popular_pages]
                }
            })

    except Exception as e:
        logger.error(f"Error retrieving visitor stats: {str(e)}")
        return jsonify({
            'error': "Failed to retrieve visitor statistics",
            'message': str(e),
            'success': False
        }), 500


@courses_bp.route("/instructor_ratings", methods=["GET"])
def get_instructor_ratings():
    instructor = request.args.get("instructor")
    course = request.args.get("course")
    instructor_ratings = get_detailed_professor_info(instructor, course)
    return instructor_ratings.to_dict() if instructor_ratings else None


@courses_bp.route("/course_details/<enroll_num>", methods=["GET"])
def get_course_details(enroll_num):
    try:
        with app.app_context():
            session = db.session()
            try:
                course = (
                    session.query(CourseModel)
                    .filter(CourseModel.enroll_num == enroll_num)
                    .first()
                )

                if not course:
                    return jsonify({
                        "error": "Course not found",
                        "message": f"No course found with num: {enroll_num}",
                        "success": False,
                    }), 404

                course_details = {
                    "id": course.id,
                    "description": course.description,
                    "class_notes": course.class_notes,
                    "enrollment_reqs": course.enrollment_reqs,
                    "discussion_sections": course.discussion_sections,
                }

                return jsonify({"data": course_details, "success": True})

            finally:
                session.close()

    except Exception as e:
        logger.error(f"Error retrieving course details: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve course details",
            "message": str(e),
            "success": False,
        }), 500

@courses_bp.route("/google_maps_api_key", methods=["GET"])
def get_google_maps_api():
    return jsonify({
        "key": "AIzaSyBnCh2ugCrcyKDKT3HHry5KjkjS4ps4PT0"
    })

@courses_bp.route("/ge_courses", methods=["GET"])
def get_ge_courses():
    try:
        with app.app_context():
            session = db.session()
            try:
                courses = (
                    session.query(CourseModel)
                    .filter(CourseModel.ge.isnot(None))
                    .all()
                )

                last_update = session.query(LastUpdateModel).first()
                formatted_last_update = None
                if last_update:
                    formatted_last_update = last_update.update_time.strftime("%Y-%m-%d %H:%M:%S %Z")

                response_data = {"AnyGE": []}
                for course in courses:
                    # Base course data with original ID
                    course_data = {
                        "id": course.id,
                        "ge": course.ge,
                        "subject": course.subject,
                        "catalog_num": course.catalog_num,
                        "name": course.name,
                        "instructor": course.instructor,
                        "link": course.link,
                        "class_count": course.class_count,
                        "enroll_num": course.enroll_num,
                        "class_type": course.class_type,
                        "schedule": course.schedule,
                        "location": course.location,
                        "gpa": course.gpa,
                        "instructor_ratings": course.instructor_ratings,
                        "class_status": course.class_status,
                        "credits": course.credits,
                        "career": course.career,
                        "grading": course.grading,
                        "course_type": course.course_type,
                        "has_enrollment_reqs": course.has_enrollment_reqs,
                    }

                    # Create AnyGE entry with modified ID
                    anyge_course = course_data.copy()
                    anyge_course['id'] = course.id + 5000  # Add 5000 to ID for AnyGE entries
                    response_data["AnyGE"].append(anyge_course)

                    # Add to specific GE category with original ID
                    if course.ge not in response_data:
                        response_data[course.ge] = []
                    response_data[course.ge].append(course_data)

                return jsonify({
                    "data": response_data,
                    "last_update": formatted_last_update,
                    "success": True,
                })

            finally:
                session.close()

    except Exception as e:
        logger.error(f"Error retrieving GE courses: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve GE courses",
            "message": str(e),
            "success": False,
        }), 500


@courses_bp.route("/all_courses", methods=["GET"])
def get_all_courses():
    try:
        with app.app_context():
            session = db.session()
            try:
                courses = session.query(CourseModel).all()
                last_update = session.query(LastUpdateModel).first()
                
                formatted_last_update = None
                if last_update:
                    formatted_last_update = last_update.update_time.strftime("%Y-%m-%d %H:%M:%S %Z")

                courses_list = [{
                    "id": course.id,
                    "ge": course.ge,
                    "subject": course.subject,
                    "catalog_num": course.catalog_num,
                    "name": course.name,
                    "instructor": course.instructor,
                    "link": course.link,
                    "class_count": course.class_count,
                    "enroll_num": course.enroll_num,
                    "class_type": course.class_type,
                    "schedule": course.schedule,
                    "location": course.location,
                    "gpa": course.gpa,
                    "instructor_ratings": course.instructor_ratings,
                    "class_status": course.class_status,
                    "credits": course.credits,
                    "career": course.career,
                    "grading": course.grading,
                    "course_type": course.course_type,
                    "has_enrollment_reqs": course.has_enrollment_reqs,
                } for course in courses]

                return jsonify({
                    "data": courses_list,
                    "last_update": formatted_last_update,
                    "success": True,
                })

            finally:
                session.close()

    except Exception as e:
        logger.error(f"Error retrieving all courses: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve all courses",
            "message": str(e),
            "success": False,
        }), 500


@courses_bp.teardown_app_request
def cleanup_request(exception=None):
    if hasattr(db, "session"):
        db.session.remove()
    if exception:
        logger.error(f"Exception during request teardown: {str(exception)}")
