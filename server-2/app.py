from datetime import datetime
from flask import g
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
import logging
import sqlite3
import atexit
from flask_compress import Compress
from flask_caching import Cache
from scraping.ucsc_courses import get_courses, scrape_all_courses
from scraping.ratings import get_basic_professor_info
from helper_functions import find_matching_instructor, get_course_gpa
from config import app, db, slugtistics_db_path
from models.data_models import CourseModel, LastUpdateModel
from routes import courses_bp

# Initialize Flask extensions
Compress(app)
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300
})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

courses_cache = {}
instructor_cache = {}
gpa_cache = {}
ge_cache = {}
scheduler = None


def init_db():
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        raise


def get_slugtistics_db():
    if "slugtistics_db" not in g:
        g.slugtistics_db = sqlite3.connect(
            str(slugtistics_db_path),
            timeout=30,
            check_same_thread=False,
            isolation_level="IMMEDIATE",
        )
        g.slugtistics_db.execute("PRAGMA journal_mode=WAL")
        g.slugtistics_db.execute("PRAGMA cache_size=-2000")
        g.slugtistics_db.row_factory = sqlite3.Row
    return g.slugtistics_db


@app.teardown_appcontext
def close_slugtistics_db(exception=None):
    db = g.pop("slugtistics_db", None)
    if db is not None:
        db.close()


@cache.cached(timeout=300, key_prefix='all_courses')
def get_all_courses():
    global courses_cache, instructor_cache, gpa_cache

    if not courses_cache:
        logger.info("Cache miss - fetching all courses")
        try:
            scraped_courses = scrape_all_courses()
            slugtistics_db = get_slugtistics_db()

            with slugtistics_db:
                cursor = slugtistics_db.cursor()
                cursor.execute('SELECT DISTINCT "SubjectCatalogNbr", "Instructors" FROM GradeData')
                historical_data = cursor.fetchall()
                course_instructors = {}

                for course_code, instructor in historical_data:
                    if course_code not in course_instructors:
                        course_instructors[course_code] = []
                    course_instructors[course_code].append(instructor)

                for course in scraped_courses:
                    subject = course.code.split()[0]

                    if subject not in courses_cache:
                        courses_cache[subject] = []

                    teacher = course.instructor
                    course_code = course.code

                    if teacher != "Staff" and teacher not in instructor_cache:
                        historical_instructors = course_instructors.get(course_code, [])
                        matched_instructor = find_matching_instructor(teacher, historical_instructors) or teacher

                        try:
                            instructor_ratings = get_basic_professor_info(matched_instructor)
                            instructor_ratings = instructor_ratings.to_dict() if instructor_ratings else None
                        except Exception as e:
                            logger.error(f"Error fetching instructor ratings: {str(e)}")
                            instructor_ratings = None

                        instructor_cache[teacher] = (matched_instructor, instructor_ratings)

                    if teacher != "Staff":
                        matched_instructor, instructor_ratings = instructor_cache[teacher]
                    else:
                        matched_instructor, instructor_ratings = teacher, None

                    gpa_key = (course_code, matched_instructor)

                    if gpa_key not in gpa_cache:
                        gpa_cache[gpa_key] = get_course_gpa(cursor, course_code, matched_instructor)

                    if instructor_ratings and "." in matched_instructor:
                        try:
                            matched_instructor = instructor_ratings["name"]
                        except KeyError:
                            logger.warning(f"No 'name' field found in instructor_ratings for {matched_instructor}")

                    course_info = {
                        "code": course_code,
                        "name": course.name,
                        "instructor": matched_instructor,
                        "instructor_rating": instructor_ratings,
                        "gpa": gpa_cache[gpa_key],
                        "schedule": course.schedule,
                        "location": course.location,
                        "enroll_num": course.enroll_num,
                        "class_status": course.class_status,
                        "class_count": course.class_count,
                        "link": course.link,
                        "class_type": course.class_type,
                        "description": course.description,
                        "class_notes": course.class_notes,
                        "enrollment_reqs": course.enrollment_reqs,
                        "discussion_sections": course.discussion_sections,
                        "credits": course.credits,
                        "career": course.career,
                        "grading": course.grading,
                        "course_type": course.course_type,
                    }

                    courses_cache[subject].append(course_info)

            logger.info(f"Successfully cached {len(scraped_courses)} courses")

        except Exception as e:
            logger.error(f"Error in get_all_courses: {str(e)}")
            raise

    return courses_cache


@cache.cached(timeout=300, key_prefix='ge_courses')
def get_ge_courses():
    global ge_cache

    if not ge_cache:
        try:
            logger.info("Cache miss - fetching GE courses")
            ge_categories = [
                "CC", "ER", "IM", "MF", "SI", "SR", "TA",
                "PE-E", "PE-H", "PE-T", "PR-E", "PR-C", "PR-S", "C",
            ]
            ge_courses = get_courses(ge_categories)

            for ge_course in ge_courses:
                course_key = ge_course.code
                if course_key not in ge_cache:
                    ge_cache[course_key] = []
                ge_cache[course_key].append({
                    "instructor": ge_course.instructor,
                    "ge": ge_course.ge
                })

            logger.info(f"Successfully cached {len(ge_courses)} GE courses")

        except Exception as e:
            logger.error(f"Error in get_ge_courses: {str(e)}")
            raise

    return ge_cache

def clear_caches():
    global courses_cache, instructor_cache, gpa_cache, ge_cache
    courses_cache = {}
    instructor_cache = {}
    gpa_cache = {}
    ge_cache = {}
    cache.clear()
    logger.info("All caches cleared")


def store_courses_in_db():
    logger.info("Starting scheduled course storage process...")

    clear_caches()

    with app.app_context():
        try:
            all_courses = get_all_courses()
            ge_lookup = get_ge_courses()

            if not all_courses:
                logger.warning("No courses found to store")
                return

            CourseModel.query.delete()
            LastUpdateModel.query.delete()
            
            courses_added = 0
            for subject, courses in all_courses.items():
                for course in courses:
                    try:
                        subject, catalog_num = course["code"].strip().split(" ", 1)

                        ge_category = None
                        if course["code"] in ge_lookup:
                            ge_matches = ge_lookup[course["code"]]
                            for ge_match in ge_matches:
                                if ge_match["instructor"].lower() == course["instructor"].lower():
                                    ge_category = ge_match["ge"]
                                    break
                            if ge_category is None and ge_matches:
                                ge_category = ge_matches[0]["ge"]
                                
                        has_enrollment_reqs = bool(course.get("enrollment_reqs"))

                        new_course = CourseModel(
                            ge=ge_category,
                            subject=subject,
                            catalog_num=catalog_num,
                            name=course["name"],
                            instructor=course["instructor"],
                            link=course["link"],
                            class_count=course["class_count"],
                            enroll_num=course["enroll_num"],
                            class_type=course.get("class_type", ""),
                            schedule=course["schedule"],
                            location=course["location"],
                            gpa=course["gpa"],
                            instructor_ratings=course["instructor_rating"],
                            class_status=course["class_status"],
                            description=course["description"],
                            class_notes=course["class_notes"],
                            enrollment_reqs=course["enrollment_reqs"],
                            discussion_sections=course["discussion_sections"],
                            credits=course["credits"],
                            career=course["career"],
                            grading=course["grading"],
                            course_type=course["course_type"],
                            has_enrollment_reqs=has_enrollment_reqs,
                        )

                        db.session.add(new_course)
                        courses_added += 1

                        if courses_added % 100 == 0:
                            db.session.commit()

                    except Exception as e:
                        logger.error(f"Error processing course: {str(e)}")
                        continue

            # Add new last update time
            db.session.add(LastUpdateModel())
            db.session.commit()

            logger.info(f"Successfully stored {courses_added} courses in database")

        except Exception as e:
            logger.error(f"Error storing courses: {str(e)}")
            db.session.rollback()
            raise


def init_scheduler():
    global scheduler

    if scheduler is None:
        scheduler = BackgroundScheduler()
        scheduler.configure(timezone=pytz.timezone("America/Los_Angeles"))

        scheduler.add_job(
            store_courses_in_db,
            "interval",
            hours=1,
            id="store_courses_in_db_job",
            misfire_grace_time=None,
            coalesce=True,
            max_instances=1,
        )

        try:
            scheduler.start()
            if not scheduler.running:
                raise RuntimeError("Scheduler failed to start")
            atexit.register(lambda: scheduler.shutdown(wait=True))
            logger.info("Scheduler started successfully")
        except Exception as e:
            logger.error(f"Error starting scheduler: {str(e)}")
            raise


@app.route("/scheduler-status")
def scheduler_status():
    with app.app_context():
        last_update = db.session.query(LastUpdateModel).first()
    
    return {
        "running": scheduler.running if scheduler else False,
        "last_update": last_update.update_time.isoformat() if last_update else None,
        "jobs": [
            {
                "id": job.id,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            }
            for job in (scheduler.get_jobs() if scheduler else [])
        ],
    }


def init_app():
    try:
        app.register_blueprint(courses_bp)
        init_db()
        store_courses_in_db()
        init_scheduler()
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing application: {str(e)}")
        raise


@app.teardown_appcontext
def teardown_app(exception=None):
    close_slugtistics_db()


if __name__ == "__main__":
    init_db()
    store_courses_in_db()
    app.register_blueprint(courses_bp)
    app.run(host="0.0.0.0", port=5001)

