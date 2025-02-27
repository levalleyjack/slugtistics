class Course:
    def __init__(self, code, name="N/A", instructor="Staff", link="", description="", 
                 class_notes="", enrollment_reqs="", discussion_sections=None, 
                 class_status="", credits=None, career=None, grading=None, 
                 course_type=None, class_count="N/A", schedule="", location="", 
                 enroll_num="", class_type="", ge=None):
        self.code = code
        self.name = name if name else "N/A"  # Ensure name is never None
        self.instructor = instructor
        self.link = link
        self.description = description
        self.class_notes = class_notes
        self.enrollment_reqs = enrollment_reqs
        self.discussion_sections = discussion_sections or []
        self.class_status = class_status
        self.credits = credits
        self.career = career
        self.grading = grading
        self.course_type = course_type
        self.class_count = class_count
        self.schedule = schedule
        self.location = location
        self.enroll_num = enroll_num
        self.class_type = class_type
        self.ge = ge
        
    def to_dict(self):
        return {
            'code': self.code,
            'name': self.name,
            'instructor': self.instructor,
            'link': self.link,
            'description': self.description,
            'class_notes': self.class_notes,
            'enrollment_reqs': self.enrollment_reqs,
            'discussion_sections': self.discussion_sections,
            'class_status': self.class_status,
            'credits': self.credits,
            'career': self.career,
            'grading': self.grading,
            'course_type': self.course_type,
            'class_count': self.class_count,
            'schedule': self.schedule,
            'location': self.location,
            'enroll_num': self.enroll_num,
            'class_type': self.class_type,
            'ge': self.ge
        }