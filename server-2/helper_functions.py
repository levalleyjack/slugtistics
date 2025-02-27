import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional, Tuple
from venv import logger
import requests


quarter = 2250


def normalize_instructor_name(name: str) -> str:
    if not isinstance(name, str):
        return ""

    cleaned_name = " ".join(name.strip().split())

    parts = cleaned_name.split()
    if len(parts) < 2:
        return cleaned_name

    return cleaned_name.lower()


def get_initials(name: str) -> list:
    parts = name.split()
    if len(parts) <= 1:
        return []
    return [part[0].upper() for part in parts[:-1]]


def calculate_gpa(grade_distribution):
    if not grade_distribution:
        return "N/A"

    grade_points = {
        "A+": 4.0,
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D+": 1.3,
        "D": 1.0,
        "D-": 0.7,
        "F": 0.0,
    }

    total_points = 0
    total_students = 0

    for grade, count in grade_distribution.items():
        if count is None:
            count = 0

        count = int(count)

        if grade in grade_points and count > 0:
            total_points += grade_points[grade] * count
            total_students += count

    if total_students == 0:
        return "N/A"

    gpa = total_points / total_students
    return f"{gpa:.2f}"


def get_course_gpa(cursor, course_code: str, instructor: str = None) -> float:
    """
    Retrieve GPA for a specific course, trying instructor-specific first then falling back to overall course GPA

    Args:
        cursor: Database cursor
        course_code: Course code (e.g., "MATH 19A")
        instructor: Instructor name to filter by (optional)

    Returns:
        float: Calculated GPA based on grade distribution
    """
    base_query = """
        SELECT 
            COALESCE(SUM("A+"), 0) as "A+", COALESCE(SUM("A"), 0) as "A", COALESCE(SUM("A-"), 0) as "A-",
            COALESCE(SUM("B+"), 0) as "B+", COALESCE(SUM("B"), 0) as "B", COALESCE(SUM("B-"), 0) as "B-",
            COALESCE(SUM("C+"), 0) as "C+", COALESCE(SUM("C"), 0) as "C", COALESCE(SUM("C-"), 0) as "C-",
            COALESCE(SUM("D+"), 0) as "D+", COALESCE(SUM("D"), 0) as "D", COALESCE(SUM("D-"), 0) as "D-",
            COALESCE(SUM("F"), 0) as "F"
        FROM GradeData 
        WHERE "SubjectCatalogNbr" = ?
    """

    try:
        if instructor and instructor.lower() != "staff" and "." not in instructor:
            instructor_query = base_query + ' AND "Instructors" = ?'
            cursor.execute(instructor_query, (course_code, instructor))
            result = cursor.fetchone()

            if result:
                grade_distribution = {k: v for k, v in dict(result).items() if v > 0}
                if grade_distribution:
                    return calculate_gpa(grade_distribution)

        cursor.execute(base_query, (course_code,))
        result = cursor.fetchone()

        if result:
            grade_distribution = {k: v for k, v in dict(result).items() if v > 0}
            if grade_distribution:
                return calculate_gpa(grade_distribution)

        return None

    except Exception as e:
        return None


def find_matching_instructor(instructor: str, historical_instructors: list) -> str:

    if not instructor or not isinstance(historical_instructors, list):
        return instructor

    current_instructor = normalize_instructor_name(instructor)

    if not current_instructor:
        return instructor

    current_parts = current_instructor.split()

    if len(current_parts) < 2:
        return instructor

    current_last = current_parts[-1]
    current_initials = [part[0].upper() for part in current_parts[:-1]]

    for full_name in historical_instructors:
        if normalize_instructor_name(full_name) == current_instructor:
            return full_name

    for full_name in historical_instructors:
        hist_name = normalize_instructor_name(full_name)
        hist_parts = hist_name.split()

        if len(hist_parts) < 2:
            continue

        hist_last = hist_parts[-1]
        hist_initials = [part[0].upper() for part in hist_parts[:-1]]

        if hist_last != current_last:
            continue

        if (
            len(current_initials) > 0
            and len(hist_initials) >= len(current_initials)
            and all(c == h for c, h in zip(current_initials, hist_initials))
        ):
            return full_name

    return instructor


def split_course_code(course_code: str) -> Tuple[str, str]:
    """Split course code into subject and catalog number, handling both space and dash formats"""
    parts = course_code.split(" ", 1)
    if len(parts) == 2:
        return parts[0], parts[1]

    parts = course_code.split("-", 1)
    if len(parts) == 2:
        return parts[0], parts[1]

    return course_code, ""


def fetch_courses_parallel(
    course_codes: List[str], max_workers: int = 10
) -> Dict[str, dict]:
    api_cache = {}

    def fetch_single_course(course_code: str) -> Tuple[str, dict]:
        try:
            result = None
            subject, catalog_num = split_course_code(course_code)
            if not catalog_num:
                result = fetch_course_from_api(subject)
            else:
                result = fetch_course_from_api(subject, catalog_num)

            return course_code, result
        except Exception as e:
            logger.error(f"Error processing course {course_code}: {e}")
            return course_code, None

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch_single_course, code): code for code in course_codes
        }

        for future in as_completed(futures):
            try:
                course_code, result = future.result()
                if result is not None:
                    api_cache[course_code] = result
            except Exception as e:
                logger.error(f"Error in future processing: {e}")
                course_code = futures[future]
                logger.error(f"Failed course code: {course_code}")

    return api_cache


def generate_class_url(class_nbr: int):

    # create the php-style serialized data string
    class_data = (
        f'a:2:{{s:5:":STRM";s:4:"{quarter}";s:10:":CLASS_NBR";s:5:"{class_nbr}";}}'
    )

    # base 64
    encoded_class_data = base64.b64encode(class_data.encode()).decode()

    return f"https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data={encoded_class_data}"

def fetch_course_from_api(subject: str, catalog_nbr: Optional[str] = None) -> dict:
    try:
        url = f"https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/{quarter}"

        params = {"subject": subject}
        if catalog_nbr is not None:
            params["catalog_nbr"] = catalog_nbr

        response = requests.get(url, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()

            if catalog_nbr is not None:
                matching_courses = [
                    course
                    for course in data
                    if course.get("catalog_nbr") == catalog_nbr
                ]
                return matching_courses[0] if matching_courses else None

            return data  

        logger.error(f"API request failed for {subject} {catalog_nbr}. Status code: {response.status_code}")
        logger.error(f"Response content: {response.text}")
        return None

    except Exception as e:
        logger.error(f"API error for {subject} {catalog_nbr}: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        return None
