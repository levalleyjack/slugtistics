from datetime import datetime
import uuid
import pytz
from sqlalchemy import Boolean
from config import db
import json
from sqlalchemy.types import TypeDecorator, TEXT

class JSONType(TypeDecorator):
    impl = TEXT
    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None
        
    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None
    
class LastUpdateModel(db.Model):
    __tablename__ = 'last_update'
    id = db.Column(db.Integer, primary_key=True)
    update_time = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(pytz.timezone('America/Los_Angeles')))
class VisitorModel(db.Model):
    __tablename__ = 'visitors'
    
    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('America/Los_Angeles')))
    ip_address = db.Column(db.String(45), nullable=True)  # Changed from 64 to 45 since we're not hashing
    user_agent = db.Column(db.String(255), nullable=True)
    referrer = db.Column(db.String(255), nullable=True)
    is_unique = db.Column(db.Boolean, default=True)
    
class Degree(db.Model):
    __tablename__ = 'degrees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    courses = db.relationship('Course', backref='degree', lazy='joined')

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(1000), nullable=False)
    course_type = db.Column(db.String(50), nullable=False)
    degree_id = db.Column(db.Integer, db.ForeignKey('degrees.id'), nullable=False)
    classes_info = db.Column(JSONType, default=list)
    name = db.Column(db.String(200))
    gpa = db.Column(db.String(10))
class CourseModel(db.Model):
    __tablename__ = 'course_models'
    id = db.Column(db.Integer, primary_key=True)

    
    ge = db.Column(db.String(5))  # General Education requirement (e.g., 'GE-A')
    subject = db.Column(db.String(5))  # Subject code (e.g., 'MATH')
    catalog_num = db.Column(db.String(5))  # Catalog number (e.g., '101')
    name = db.Column(db.String(30))  # Course name/title
    instructor = db.Column(db.String(20))  # Name of the instructor
    link = db.Column(db.String(200))  # Link to course information or enrollment page
    class_count = db.Column(db.String(10))  # Number of classes or sections
    enroll_num = db.Column(db.Integer)  # Number of enrolled students
    class_type = db.Column(db.String(19))  # Type of class (e.g., 'Lecture', 'Lab', 'Seminar')
    schedule = db.Column(db.String(25))  # Class schedule (e.g., 'MWF 10:00-10:50 AM')
    location = db.Column(db.String(20))  # Class location (e.g., 'Building 1, Room 101')
    gpa = db.Column(db.Float)  # Average GPA for the course
    instructor_ratings = db.Column(JSONType)  # JSON field to store instructor ratings
    class_status = db.Column(db.String(10))  # Status of the class (e.g., 'Open', 'Closed', 'Waitlist')
    description = db.Column(db.Text)  
    class_notes = db.Column(db.Text) 
    enrollment_reqs = db.Column(db.Text)
    discussion_sections = db.Column(JSONType) 
    credits = db.Column(db.Integer)  
    career = db.Column(db.String(20)) 
    grading = db.Column(db.String(20)) 
    course_type = db.Column(db.String(20))
    has_enrollment_reqs = db.Column(db.Boolean, nullable=False, default=False)
