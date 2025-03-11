from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, session
from contextlib import contextmanager
from sqlalchemy import func, case
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
from scraping.ratings import get_detailed_professor_info
from models.data_models import CourseModel, LastUpdateModel, VisitorModel, db
from config import app
from helper_functions import get_majors
from chatbot.course_recommender import CourseRecommender
logger = logging.getLogger(__name__)
courses_bp = Blueprint("courses", __name__)
#chatbot, ignore
# course_recommender = None
# def init_course_recommender(app):
#     """Initialize the global CourseRecommender instance"""
#     global course_recommender
#     try:
#         with app.app_context():
#             session = db.session()
#             try:
#                 courses = session.query(CourseModel).all()
#                 course_recommender = CourseRecommender(courses=courses)
#                 logger.info("CourseRecommender initialized successfully")
#             finally:
#                 session.close()
#     except Exception as e:
#         logger.error(f"Error initializing CourseRecommender: {str(e)}")
#         raise


prereq_dict = {}
def init_prereq_dict(app):
    "make prereq dict"
    global prereq_dict
    with app.app_context():
        session = db.session()
        try:
            courses = session.query(CourseModel).all()
            for course in courses:
                key = f"{course.subject} {course.catalog_num}"
                prereq_dict[key] = course.enrollment_reqs["courses"]
            print(prereq_dict["CSE 101"])
            return prereq_dict
            
        except Exception as e:
            logger.error(f"Error initializing prereq_list: {str(e)}")
            raise

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

@courses_bp.route("/instructor_ratings", methods=["GET"])
def get_instructor_ratings():
    instructor = request.args.get("instructor")
    course = request.args.get("course")
    instructor_ratings = get_detailed_professor_info(instructor, course)
    return instructor_ratings.to_dict() if instructor_ratings else None

@courses_bp.route("/all_majors", methods=["GET"])
def get_all_majors():
    majors_data = get_majors()
    all_majors = [
        {
            "name": major_name,
        }
        for major_name in majors_data.keys()
    ]
    return jsonify(all_majors)


@courses_bp.route("/major_courses/<major>", methods=["GET"])
def get_major_classes(major):
    majors_data = get_majors()
    return jsonify(majors_data[major])

@courses_bp.route("/prereq/<prereq>", methods=["GET"])
def get_prereq(prereq):
    return jsonify(prereq_dict[prereq])
    


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

# @courses_bp.route("/recommend_class", methods=["POST"])
# def recommend_class():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part in the request"}), 400

#     transcript = request.files['file']
#     if transcript.filename == '':
#         return jsonify({"error": "No file selected"}), 400
    
#     preferences = request.form.get('preferences', '')

#     courses = scrape_transcript(transcript)
#     print(courses)
#     if course_recommender is None:
#         return jsonify({"error": "Course recommender not initialized"}), 500
    
#     try:
#         recommended_class = course_recommender.get_recommendations(transcript=courses)
#         return jsonify({"recommended_class": recommended_class, "success": True}), 200
#     except Exception as e:
#         logger.error(f"Error getting recommendations: {str(e)}")
#         return jsonify({
#             "error": "Failed to get recommendations",
#             "message": str(e),
#             "success": False
#         }), 500
    
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

# FIll out what classes have been taken
@courses_bp.route("/major_recommendations", methods=["GET"])
def major_recommendations():
    # Get classes 
    classes_str = request.args.get('classes', '')
    if not classes_str:
        return jsonify({
            "error": "No classes provided in request",
            "success": False
        }), 400
    
    # Parse string for classes
    classes_taken = [c.strip() for c in classes_str.split(',')]
    
    # replace with mongodb fetching
    needed_classes = {
        "CSE 20": [],
        "CSE 30": [],
        "MATH 19A": ["MATH 20A"],
        "MATH 19B": ["MATH 20B"]
    }
    
    result = set()
    for c in classes_taken:
        if c in needed_classes:
            result.add(c)
            for next_class in needed_classes.get(c, []):
                result.add(next_class)
    
    return jsonify({
        "recommended_classes": list(result),
        "success": True
    })