from dataclasses import dataclass
from flask_cors import CORS
from flask import Flask, jsonify, request, g
from apscheduler.schedulers.background import BackgroundScheduler
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import pytz
import os
import logging
from pathlib import Path
import sqlite3
from ucsc_courses import get_courses
from ratings import search_professor
from helper_functions import find_matching_instructor, get_course_gpa
import uuid

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///courses.db?cache=shared')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_SIZE'] = 1  
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 30
db = SQLAlchemy(app)
migrate = Migrate(app, db)  

current_dir = Path(__file__).parent
slugtistics_db_path = current_dir / "slugtistics.db"

def get_slugtistics_db():
    db = getattr(g, '_slugtistics_db', None)
    if db is None:
        db = g._slugtistics_db = sqlite3.connect(
            str(slugtistics_db_path),
            timeout=30,
            check_same_thread=False,
            isolation_level='IMMEDIATE'
        )
        db.execute('PRAGMA journal_mode=WAL')  
        db.execute('PRAGMA cache_size=-2000')  
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_slugtistics_db(error):
    db = getattr(g, '_slugtistics_db', None)
    if db is not None:
        db.close()

class CourseModel(db.Model):
    __tablename__ = 'course_models'
    id = db.Column(db.Integer, primary_key=True)
    unique_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4())) 
    ge = db.Column(db.String(5))
    subject = db.Column(db.String(5))
    catalog_num = db.Column(db.String(5))
    name = db.Column(db.String(30))
    instructor = db.Column(db.String(20))
    link = db.Column(db.String(200))
    class_count = db.Column(db.Integer)
    enroll_num = db.Column(db.Integer)
    class_type = db.Column(db.String(19))
    schedule = db.Column(db.String(25))
    location = db.Column(db.String(20))
    gpa = db.Column(db.String(10))
    timestamp = db.Column(db.DateTime, default=datetime.now(tz=pytz.utc))
    instructor_ratings = db.Column(db.JSON)
    class_status = db.Column(db.String(10))
    __table_args__ = (
        db.UniqueConstraint('unique_id', name='uq_unique_id'),
    )

courses_cache = None
last_update_time = None

def create_db():
    with app.app_context():
        db.create_all()
        logger.warning("Database tables created successfully")

def store_courses_in_db():
    global last_update_time, courses_cache
    
    with app.app_context():
        try:
            logger.warning("Starting course update process...")
            categories = ["CC", "ER", "IM", "MF", "SI", "SR", "TA", "PE-E", "PE-H", "PE-T", "PR-E", "PR-C", "PR-S", "C"]
            new_courses = get_courses(categories)
            
            if not new_courses:
                return
            
            instructor_cache = {}
            slugtistics_db = get_slugtistics_db()
            cursor = slugtistics_db.cursor()
            
            try:
                batch_size = 50
                courses_to_add = []
                
                CourseModel.query.delete()
                
                for course in new_courses:
                    if not course.instructor or course.instructor.strip().lower() in ['staff', 'n/a', '']:
                        matched_instructor = 'Staff'
                        instructor_ratings = None
                    else:
                        matched_instructor = instructor_cache.get(course.instructor)
                        if not matched_instructor:
                            cursor.execute(
                                'SELECT DISTINCT "Instructors" FROM GradeData WHERE "SubjectCatalogNbr" = ? ORDER BY Instructors LIMIT 10',
                                (course.code,)
                            )
                            historical_instructors = [row[0] for row in cursor.fetchall()]
                            matched_instructor = find_matching_instructor(course.instructor, historical_instructors) or course.instructor
                            instructor_cache[course.instructor] = matched_instructor

                        try:
                            instructor_ratings = search_professor(matched_instructor)
                            if instructor_ratings:
                                instructor_ratings = instructor_ratings.to_dict()
                        except Exception:
                            instructor_ratings = None

                    course_code = course.code.strip()
                    subject, catalog_num = course_code.split(" ", 1)
                    
                    new_course = CourseModel(
                        ge=course.ge,
                        subject=subject,
                        catalog_num=catalog_num,
                        name=course.name,
                        instructor=matched_instructor,
                        link=course.link,
                        class_count=course.class_count,
                        enroll_num=course.enroll_num,
                        class_type=course.class_type,
                        schedule=course.schedule,
                        location=course.location,
                        gpa=get_course_gpa(cursor, course.code,matched_instructor),
                        instructor_ratings=instructor_ratings,
                        class_status=course.class_status
                    )
                    courses_to_add.append(new_course)
                    
                    if len(courses_to_add) >= batch_size:
                        db.session.bulk_save_objects(courses_to_add)
                        courses_to_add = []
                
                if courses_to_add:
                    db.session.bulk_save_objects(courses_to_add)
                
                db.session.commit()
                
                courses_cache = CourseModel.query.all()
                last_update_time = datetime.now(pytz.timezone('America/Los_Angeles'))
                
            except Exception as e:
                db.session.rollback()
                raise e

        except Exception as e:
            logger.error(f"Error storing courses: {str(e)}")
            raise

def schedule_jobs():
    scheduler = BackgroundScheduler()
    scheduler.add_job(store_courses_in_db, 'interval', hours=1, id='store_courses_in_db_job')
    scheduler.start()
    logger.warning("Scheduled jobs started")




@app.route('/api/courses', methods=['GET'])
def get_courses_data():
    global courses_cache
    
    try:
        courses = courses_cache if courses_cache is not None else CourseModel.query.all()
        
        data = {}
        data["AnyGE"] = []
        
        max_id = max((course.id for course in courses), default=0)
        current_id = max_id
        
        for course in courses:
            course_data = {
                "id": course.id,
                "ge":course.ge,
                "unique_id": course.unique_id,
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
            }
            
            if course.ge not in data:
                data[course.ge] = []
            data[course.ge].append(course_data)
            
            anyge_course = course_data.copy()
            current_id += 1
            anyge_course["id"] = current_id
            anyge_course["unique_id"] = str(uuid.uuid4()) 
            anyge_course[""]
            data["AnyGE"].append(anyge_course)
        
        return jsonify({
            "data": data,
            "last_update": last_update_time.isoformat() if last_update_time else None
        })
    
    except Exception as e:
        logger.error(f"Error getting courses: {str(e)}")
        return jsonify({"error": "Cant retrieve courses"}), 500
if __name__ == '__main__':
    create_db()
    try:
        store_courses_in_db()
    except Exception as e:
        logger.error(f"First data load failed: {str(e)}")
    schedule_jobs()
    app.run(host='0.0.0.0', port=5001)