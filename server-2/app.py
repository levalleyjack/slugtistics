from flask_cors import CORS
from flask import Flask, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import pytz
import os
import logging
from ucsc_courses import get_courses
import RateMyProfessor_Database_APIs


# Set up logging
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
    timestamp = db.Column(db.DateTime, default=datetime.now(tz=pytz.utc))

def create_db():
    """Create all database tables and ensure they exist"""
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
                "PR-E", "PR-C", "PR-S", "C1", "C2"
            ]
            
            new_courses = get_courses(categories)
            
            if not new_courses:
                logger.warning("No new courses retrieved, skipping update")
                return
            
            CourseModel.query.delete()
            
            for course in new_courses:
                new_course = CourseModel(
                    ge=course.ge,
                    code=course.code,
                    name=course.name,
                    instructor=course.instructor,
                    link=course.link,
                    class_count=course.class_count,
                    enroll_num=course.enroll_num,
                    class_type=course.class_type,
                    schedule=course.schedule,
                    location=course.location,
                )
                db.session.add(new_course)
            
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
        course_filter = request.args.get('course', 'AnyGE')
        
        query = CourseModel.query
        if course_filter != 'AnyGE':
            query = query.filter_by(ge=course_filter)
        
        courses = query.all()
        
        data = [{
            "ge": course.ge,
            "code": course.code,
            "name": course.name,
            "instructor": course.instructor,
            "link": course.link,
            "class_count": course.class_count,
            "enroll_num": course.enroll_num,
            "class_type": course.class_type,
            "schedule": course.schedule,
            "location": course.location,
        } for course in courses]
        
        return jsonify({
            "data": data,
            "last_update": last_update_time.isoformat() if last_update_time else None
        })
    
    except Exception as e:
        logger.error(f"Error retrieving courses: {str(e)}")
        return jsonify({"error": "Failed to retrieve courses"}), 500

@app.route('/search_professor', methods=['GET'])
def search_professor():
    school_id = request.args.get('school_id')
    professor_name = request.args.get('professor_name')

    if not school_id or not professor_name:
        return jsonify({"error": "Please provide both school_id and professor_name"}), 400

    professor = RateMyProfessor_Database_APIs.search_professor(school_id, professor_name)
    if professor:
        return jsonify({
            "first_name": professor.first_name,
            "last_name": professor.last_name,
            "department": professor.department,
            "average_rating": professor.avg_rating,
            "average_difficulty": professor.avg_difficulty,
            "lock_status": professor.lock_status,
            "number_of_ratings": professor.num_ratings,
            "course_codes": professor.course_codes,
            "all_ratings": professor.ratings
        })
    else:
        return jsonify({"error": "Professor not found"}), 404
    

if __name__ == '__main__':
    create_db()
    
    try:
        store_courses_in_db()
    except Exception as e:
        logger.error(f"Initial data load failed: {str(e)}")
    
    schedule_jobs()
    
    app.run(host='0.0.0.0', port=5001)