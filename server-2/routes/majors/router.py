import logging
import re
from flask import Blueprint, jsonify, request
from PyPDF2 import PdfReader, errors as pdf_errors

from .service import MajorsService

logger = logging.getLogger(__name__)

majors_bp = Blueprint("majors", __name__)


@majors_bp.route("/all_majors", methods=["GET", "OPTIONS"])
def get_all_majors():
    """
    Get all available majors parsed from JSON filenames.
    
    Returns:
        JSON response with list of all majors including name, degree, year, and filename
        Example: [{"name": "Computer Science", "degree": "B.S.", "year": "2024", 
                   "full_name": "Computer Science B.S.", "filename": "computer_science_bs_2024"}]
    """
    try:
        logger.info("Received request for /all_majors")
        majors_list = MajorsService.get_majors()
        logger.info(f"Found {len(majors_list)} majors")
        return jsonify({"majors": majors_list, "success": True})
    except Exception as e:
        logger.error(f"Error in get_all_majors: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


@majors_bp.route("/major_courses/<major_filename>", methods=["GET"])
def get_major_classes(major_filename):
    """
    Get all courses required for a specific major from groups structure.
    
    Args:
        major_filename: Major filename from URL path (e.g., "computer_science_bs_2024")
        
    Returns:
        JSON response with list of all course codes across all groups
    """
    try:
        major_courses = MajorsService.get_major_courses(major_filename)
        if not major_courses:
            return jsonify({"error": f"Major '{major_filename}' not found", "success": False}), 404
        return jsonify({"courses": major_courses, "success": True})
    except Exception as e:
        logger.error(f"Error in get_major_classes for {major_filename}: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


@majors_bp.route("/major_groups/<major_filename>", methods=["GET"])
def get_major_groups(major_filename):
    """
    Get all requirement groups for a specific major.
    
    Args:
        major_filename: Major filename from URL path (e.g., "computer_science_bs_2024")
        
    Returns:
        JSON response with all groups (list) and their requirements
        Example: [{"name": "Lower Division CSE", "count": 6, "classes": ["CSE_12", ...]}, ...]
    """
    try:
        groups = MajorsService.get_major_groups(major_filename)
        if not groups:
            return jsonify({"error": f"No groups found for major '{major_filename}'", "success": False}), 404
        return jsonify({"groups": groups, "success": True})
    except Exception as e:
        logger.error(f"Error in get_major_groups for {major_filename}: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


@majors_bp.route("/major_recommendations", methods=["GET"])
def major_recommendations():
    """
    Get course recommendations based on completed classes and major.
    
    Query Parameters:
        classes: Comma-separated list of completed course codes
        major: Major name (default: "Computer Science B.S.")
        
    Returns:
        JSON response with equivalent classes and recommendations
    """
    from routes.courses import prereq_dict  # Import from courses module

    classes_str = request.args.get("classes", "")
    major = request.args.get("major", "") or "Computer Science B.S."

    if not classes_str or not classes_str.strip():
        # Return empty recommendations instead of error for better UX
        return jsonify({
            "equiv_classes": [],
            "recommended_classes": [],
            "success": True
        })

    classes_taken = [c.strip() for c in classes_str.split(",") if c.strip()]

    # If after filtering we have no classes, return empty
    if not classes_taken:
        return jsonify({
            "equiv_classes": [],
            "recommended_classes": [],
            "success": True
        })

    logger.info(f"Computing recommendations for major: {major}")
    logger.info(f"Classes taken: {classes_taken}")
    logger.info(f"Prereq dict has {len(prereq_dict)} courses")

    try:
        equiv, recs = MajorsService.compute_recommendations(
            classes_taken, major, prereq_dict
        )

        logger.info(f"Equivalent classes: {equiv}")
        logger.info(f"Recommended classes: {recs}")

        return jsonify({
            "equiv_classes": equiv,
            "recommended_classes": recs,
            "success": True
        })
    except Exception as e:
        logger.error(f"Error computing recommendations: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


@majors_bp.route("/major_recommendations/parse_transcript", methods=["POST", "PUT"])
def parse_transcript():
    """
    Parse a transcript PDF to extract course codes.
    
    Form Data:
        transcript: PDF file
        
    Query Parameters:
        major: Major name (optional, for future use)
        
    Returns:
        JSON response with parsed text and extracted course codes
    """
    if "transcript" not in request.files:
        return jsonify({"error": "No transcript file provided", "success": False}), 400

    transcript = request.files["transcript"]

    try:
        reader = PdfReader(transcript)

        if reader.is_encrypted:
            try:
                reader.decrypt("")  # Try empty password
            except Exception as e:
                return jsonify({
                    "error": "Transcript PDF is encrypted and cannot be processed.",
                    "success": False
                }), 400

        text = "".join(page.extract_text() or "" for page in reader.pages)

    except pdf_errors.DependencyError:
        return jsonify({
            "error": "PyCryptodome is required to read encrypted transcripts. Please install it.",
            "success": False
        }), 500
    except Exception as e:
        return jsonify({
            "error": f"Failed to read transcript: {str(e)}",
            "success": False
        }), 400

    # Extract course codes like "CSE 12", "MATH 19A", etc.
    courses = re.findall(r"[A-Z]{2,4} \d{2,3}[A-Z]*", text)
    major = request.args.get("major", "Computer Science B.S.")

    return jsonify({
        "parsed_transcript": text,
        "courses": courses,
        "success": True
    })


@majors_bp.route("/recommend_courses", methods=["POST"])
def recommend_courses():
    """
    Recommend courses based on prerequisites and completed courses.
    
    Form/JSON Data:
        major_filename: Major filename (e.g., "computer_science_bs_2025")
        classes_taken: List of completed course codes
        
    Returns:
        JSON response with taken and recommended courses
    """
    try:
        data = request.get_json()
        major_filename = data.get("major_filename")
        classes_taken = data.get("classes_taken", [])
        
        if not major_filename:
            return jsonify({"error": "major_filename is required", "success": False}), 400
        
        result = MajorsService.recommend_courses(major_filename, classes_taken)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in recommend_courses: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


@majors_bp.route("/upload_transcript", methods=["POST"])
def upload_transcript():
    """
    Upload a transcript PDF and mark classes as taken for a specific major.
    
    Form Data:
        transcript: PDF file
        major_filename: Major filename (e.g., "computer_science_bs_2024")
        
    Returns:
        JSON response with course status (taken/not_taken) for all major requirements
    """
    if "transcript" not in request.files:
        return jsonify({"error": "No transcript file provided", "success": False}), 400
    
    major_filename = request.form.get("major_filename")
    if not major_filename:
        return jsonify({"error": "No major_filename provided", "success": False}), 400

    transcript = request.files["transcript"]

    try:
        reader = PdfReader(transcript)

        if reader.is_encrypted:
            try:
                reader.decrypt("")  # Try empty password
            except Exception as e:
                return jsonify({
                    "error": "Transcript PDF is encrypted and cannot be processed.",
                    "success": False
                }), 400

        text = "".join(page.extract_text() or "" for page in reader.pages)

    except pdf_errors.DependencyError:
        return jsonify({
            "error": "PyCryptodome is required to read encrypted transcripts. Please install it.",
            "success": False
        }), 500
    except Exception as e:
        return jsonify({
            "error": f"Failed to read transcript: {str(e)}",
            "success": False
        }), 400

    # Extract course codes like "CSE 12", "MATH 19A", etc.
    courses = re.findall(r"[A-Z]{2,4} \d{2,3}[A-Z]*", text)
    
    logger.info(f"Extracted {len(courses)} courses from transcript: {courses}")
    
    # Mark classes as taken
    try:
        result = MajorsService.mark_classes_taken(major_filename, courses)
        result["success"] = True
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error marking classes as taken: {str(e)}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500
