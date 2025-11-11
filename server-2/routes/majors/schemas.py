from typing import List, Optional
from dataclasses import dataclass


@dataclass
class Major:
    """Model for a major."""
    name: str
    code: Optional[str] = None


@dataclass
class MajorCourse:
    """Model for a course within a major requirement."""
    subject: str
    catalog_num: str
    title: str
    credits: Optional[int] = None
    required: bool = True
    category: Optional[str] = None


@dataclass
class CourseRecommendation:
    """Model for a recommended course."""
    course: str
    reason: Optional[str] = None
    prerequisites_met: bool = True


# Response models as dictionaries (Flask-compatible)
def major_to_dict(major: Major) -> dict:
    """Convert Major to dictionary for JSON response."""
    result = {"name": major.name}
    if major.code:
        result["code"] = major.code
    return result


def course_to_dict(course: MajorCourse) -> dict:
    """Convert MajorCourse to dictionary for JSON response."""
    return {
        "subject": course.subject,
        "catalog_num": course.catalog_num,
        "title": course.title,
        "credits": course.credits,
        "required": course.required,
        "category": course.category,
    }


def recommendation_to_dict(rec: CourseRecommendation) -> dict:
    """Convert CourseRecommendation to dictionary for JSON response."""
    return {
        "course": rec.course,
        "reason": rec.reason,
        "prerequisites_met": rec.prerequisites_met,
    }

