from flask import g
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
import logging
import sqlite3
import atexit
from flask_compress import Compress
from flask_caching import Cache
from scraping.ucsc_courses import scrape_all_courses, scrape_count
from scraping.ratings import get_basic_professor_info
from helper_functions import (
    find_matching_instructor,
    get_course_gpa,
    parse_prerequisites,
)
from config import app, db, slugtistics_db_path
from models.data_models import CourseModel, LastUpdateModel
from routes import courses_bp, init_prereq_dict

# Initialize Flask extensions
Compress(app)
cache = Cache(app, config={"CACHE_TYPE": "simple", "CACHE_DEFAULT_TIMEOUT": 300})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

courses_cache = {}
instructor_cache = {}
gpa_cache = {}
scheduler = None


# initalize db tables
def init_db():
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        raise


# get the gpa tables
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


# close gpa tables when done
@app.teardown_appcontext
def close_slugtistics_db(exception=None):
    db = g.pop("slugtistics_db", None)
    if db is not None:
        db.close()


# this gets all the up to date info for class count, class status(open, closed, etc)
# also changes discussion count
# (free will to change it to whatever)
def update_course_statuses():
    logger.info("Updating course count and status")
    try:
        with app.app_context():
            LastUpdateModel.query.delete()
            clear_caches()
            updated_courses = scrape_count()
            for course in updated_courses:
                enroll_num = course.enroll_num
                existing_course = CourseModel.query.filter_by(
                    enroll_num=enroll_num
                ).first()
                if existing_course:
                    existing_course.class_status = course.class_status
                    existing_course.class_count = course.class_count
                    existing_course.discussion_sections = course.discussion_sections
            db.session.add(LastUpdateModel())
            db.session.commit()
            logger.info("Course statuses updated successfully.")
    except Exception as e:
        logger.error(f"Trouble updating course statuses: {str(e)}")


# scraping all courses and getting gpa for each class and ratings as well
# prob only need to do every day/two days, information won't change that much
# scraping course count and status and discussion way more important
# tentative, can maybe update even longer
@cache.cached(timeout=300, key_prefix="all_courses")
def get_all_courses():
    global courses_cache, instructor_cache, gpa_cache

    if not courses_cache:
        logger.info("Cache miss - fetching all courses")
        try:
            scraped_courses = scrape_all_courses()
            slugtistics_db = get_slugtistics_db()

            with slugtistics_db:
                cursor = slugtistics_db.cursor()
                cursor.execute(
                    'SELECT DISTINCT "SubjectCatalogNbr", "Instructors" FROM GradeData'
                )
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
                    print(course_code)

                    if teacher != "Staff" and (
                        "." in teacher or teacher not in instructor_cache
                    ):
                        historical_instructors = course_instructors.get(course_code, [])
                        matched_instructor = (
                            find_matching_instructor(teacher, historical_instructors)
                            or teacher
                        )

                        try:
                            instructor_ratings = get_basic_professor_info(
                                matched_instructor, course_code
                            )
                            instructor_ratings = (
                                instructor_ratings.to_dict()
                                if instructor_ratings
                                else None
                            )
                        except Exception as e:
                            logger.error(f"Error fetching instructor ratings: {str(e)}")
                            instructor_ratings = None

                        instructor_cache[teacher] = (
                            matched_instructor,
                            instructor_ratings,
                        )

                    if teacher != "Staff":
                        matched_instructor, instructor_ratings = instructor_cache[
                            teacher
                        ]
                    else:
                        matched_instructor, instructor_ratings = teacher, None

                    gpa_key = (course_code, matched_instructor)

                    if gpa_key not in gpa_cache:
                        gpa_cache[gpa_key] = get_course_gpa(
                            cursor, course_code, matched_instructor
                        )

                    if instructor_ratings and "." in matched_instructor:
                        try:
                            matched_instructor = instructor_ratings["name"]
                        except KeyError:
                            logger.warning(
                                f"No 'name' field found in instructor_ratings for {matched_instructor}"
                            )

                    course_info = {
                        "code": course_code,
                        "name": course.name,
                        "ge": course.ge,
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
                        "enrollment_reqs": {
                            "description": course.enrollment_reqs,
                            "courses": parse_prerequisites(course.enrollment_reqs),
                        },
                        "discussion_sections": course.discussion_sections,
                        "credits": course.credits,
                        "career": course.career,
                        "grading": course.grading,
                        "course_type": course.course_type,
                    }
                    # stores by subject
                    # so {cse: cse 101, cse 30, etc}
                    # not exact values but example
                    courses_cache[subject].append(course_info)

            logger.info(f"Successfully cached {len(scraped_courses)} courses")

        except Exception as e:
            logger.error(f"Error in get_all_courses: {str(e)}")
            raise

    return courses_cache


# clear all cache
def clear_caches():
    global courses_cache, instructor_cache, gpa_cache
    courses_cache = {}
    instructor_cache = {}
    gpa_cache = {}
    cache.clear()
    logger.info("All caches cleared")


# store all of the ready-made courses to db to use
def store_courses_in_db():
    # logger ignore
    logger.info("Starting scheduled course storage process...")
    # clearing cache to work with new info
    clear_caches()

    with app.app_context():
        try:
            # getting the readymade info from scraping and ratings and gpa

            all_courses = get_all_courses()
            # now time to store it

            # logger, ignore
            if not all_courses:
                logger.warning("No courses found to store")
                return
            # clear out db for course info
            CourseModel.query.delete()
            LastUpdateModel.query.delete()

            # count total courses added
            courses_added = 0
            # go through each course
            for subject, courses in all_courses.items():
                for course in courses:
                    try:

                        subject, catalog_num = course["code"].strip().split(" ", 1)

                        has_enrollment_reqs = bool(course.get("enrollment_reqs"))

                        # setting up coursemodel so that
                        # course information can be stored to db
                        new_course = CourseModel(
                            ge=course["ge"],
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
                        # add all courses to db after increments of 100
                        if courses_added % 100 == 0:
                            db.session.commit()
                    # exceptions, ignore
                    except Exception as e:
                        logger.error(f"Error processing course: {str(e)}")
                        continue

            # add new last update time to db
            db.session.add(LastUpdateModel())
            # finally commit the rest of the courses
            # now all courses in db
            db.session.commit()

            # logs and exceptions, ignore from here
            logger.info(f"Successfully stored {courses_added} courses in database")

        except Exception as e:
            logger.error(f"Error storing courses: {str(e)}")
            db.session.rollback()
            raise


# scheduler, this is where daily scraping + hourly enrollment counts is happening
def init_scheduler():
    global scheduler
    if scheduler is None:
        scheduler = BackgroundScheduler()
        scheduler.configure(timezone=pytz.timezone("America/Los_Angeles"))
        scheduler.add_job(
            update_course_statuses,
            "interval",
            hours=1,
            id="update_course_statuses_job",
            misfire_grace_time=None,
            coalesce=True,
            max_instances=1,
        )
        scheduler.add_job(
            store_courses_in_db,
            "interval",
            hours=24,
            id="store_courses_in_db_job",
            misfire_grace_time=None,
            coalesce=True,
            max_instances=1,
        )

        try:
            scheduler.start()

            # logs, ignore
            if not scheduler.running:
                raise RuntimeError("Scheduler failed to start")
            # successfully ran
            atexit.register(lambda: scheduler.shutdown(wait=True))
            logger.info("Scheduler started successfully")
        except Exception as e:
            logger.error(f"Error starting scheduler: {str(e)}")
            raise


def init_app():
    try:
        # chatbot, doesn't work as intended
        # init_course_recommender(app) METHOD!!!

        app.register_blueprint(courses_bp)
        init_db()
        # comment out store_courses_in_db() if you didn't change any
        # of the scraping part and you alr ran once

        #store_courses_in_db()
        init_prereq_dict(app)
        #update_course_statuses() #METHOD!!!
        init_scheduler()
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing application: {str(e)}")
        raise


@app.teardown_appcontext
def teardown_app(exception=None):
    close_slugtistics_db()


# dont use, do python3 wsgi.py instead
# if __name__ == "__main__":
#     init_db()
#     store_courses_in_db()
#     app.register_blueprint(courses_bp)
#     app.run(host="0.0.0.0", port=5001)
