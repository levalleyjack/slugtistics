from dataclasses import dataclass
from flask_cors import CORS
from flask import Flask, jsonify, request
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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///courses.db')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://')

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

current_dir = Path(__file__).parent
slugtistics_db_path = current_dir / "slugtistics.db"

class Degree(db.Model):
    __tablename__ = 'degrees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    courses = db.relationship('Course', backref='degree', lazy=True)

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(1000), nullable=False)
    course_type = db.Column(db.String(50), nullable=False)
    degree_id = db.Column(db.Integer, db.ForeignKey('degrees.id'), nullable=False)

class CourseModel(db.Model):
    __tablename__ = 'course_models'
    
    id = db.Column(db.Integer, primary_key=True)
    ge = db.Column(db.String(5))
    code = db.Column(db.String(10))
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

def get_slugtistics_db_connection():
    conn = sqlite3.connect(str(slugtistics_db_path))
    conn.row_factory = sqlite3.Row
    return conn

def create_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        logger.info("Database tables created successfully")

last_update_time = None


def store_courses_in_db():
    global last_update_time
    
    with app.app_context():
        try:
            logger.info("Starting course update process...")
            categories = [
                "CC", "ER", "IM", "MF", "SI", "SR", "TA", "PE-E", "PE-H", "PE-T", 
                "PR-E", "PR-C", "PR-S","C"]
            new_courses = get_courses(categories)
            
            if not new_courses:
                logger.warning("No new courses retrieved, skipping update")
                return
            
            conn = get_slugtistics_db_connection()
            cursor = conn.cursor()
            
            instructor_cache = {}
            gpa_cache = {}
            
            CourseModel.query.delete()
            
            for course in new_courses:
                if not course.instructor or course.instructor.strip().lower() in ['staff', 'n/a', '']:
                    matched_instructor = 'Staff'
                    instructor_ratings = None
                else:
                    if course.instructor not in instructor_cache:
                        cursor.execute(
                            'SELECT DISTINCT "Instructors" FROM GradeData WHERE "SubjectCatalogNbr" = ? ORDER BY Instructors',
                            (course.code,)
                        )
                        historical_instructors = [row[0] for row in cursor.fetchall()]
                        
                        matched_instructor = find_matching_instructor(
                            course.instructor,
                            historical_instructors
                        ) or course.instructor
                        
                        instructor_cache[course.instructor] = matched_instructor

                    matched_instructor = instructor_cache.get(course.instructor, course.instructor)
                    
                    try:
                        instructor_ratings = search_professor(matched_instructor)
                        if instructor_ratings:
                            instructor_ratings = instructor_ratings.to_dict()
                    except Exception as rating_error:
                        logger.warning(f"Could not retrieve ratings for {matched_instructor}: {rating_error}")
                        instructor_ratings = None

                course_gpa = get_course_gpa(cursor,course.code)
                
                new_course = CourseModel(
                    ge=course.ge,
                    code=course.code,
                    name=course.name,
                    instructor=matched_instructor,
                    link=course.link,
                    class_count=course.class_count,
                    enroll_num=course.enroll_num,
                    class_type=course.class_type,
                    schedule=course.schedule,
                    location=course.location,
                    gpa=course_gpa,
                    instructor_ratings=instructor_ratings,  
                    class_status = course.class_status
                )
                db.session.add(new_course)
            
            conn.close()
            db.session.commit()
            last_update_time = datetime.now(pytz.timezone('America/Los_Angeles'))
            logger.info(f"Courses updated successfully. Total courses: {len(new_courses)}")
        
        except Exception as e:
            logger.error(f"Error storing courses: {str(e)}")
            db.session.rollback()
            raise

def schedule_jobs():
    scheduler = BackgroundScheduler()
    scheduler.add_job(store_courses_in_db, 'interval', hours=1, id='store_courses_in_db_job')
    scheduler.start()
    logger.info("Scheduled jobs started")

@app.route('/api/courses', methods=['GET'])
def get_courses_data():
    try:
        courses = CourseModel.query.all()
        
        data = {}
        for course in courses:
            if course.ge not in data:
                data[course.ge] = []  
            data[course.ge].append({
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "instructor": course.instructor,
                "link": course.link,
                "class_count": course.class_count,
                "enroll_num": course.enroll_num,
                "class_type": course.class_type,
                "schedule": course.schedule,
                "location": course.location,
                "gpa": course.gpa,
                "instructor_ratings":course.instructor_ratings,
                "class_status": course.class_status,
            })
        
        return jsonify({
            "data": data,
            "last_update": last_update_time.isoformat() if last_update_time else None
        })
    
    except Exception as e:
        logger.error(f"Error retrieving courses: {str(e)}")
        return jsonify({"error": "Failed to retrieve courses"}), 500

if __name__ == '__main__':
    create_db()
    
    try:
        store_courses_in_db()
    except Exception as e:
        logger.error(f"Initial data load failed: {str(e)}")
    
    schedule_jobs()
    app.run(host='0.0.0.0', port=5001)