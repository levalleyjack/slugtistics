import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from typing import Dict, List, Optional, Tuple
from venv import logger
from click import File
import pdfplumber
import requests
import json
quarter = 2252


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

def get_majors():
    
    with open("scraping/majors/cs_bs_2024.json", "r") as file:
        cs_bs_data = json.load(file)

    majors_data = {
        cs_bs_data["program"]["name"]: cs_bs_data
    }
    return majors_data



def parse_prerequisites(prereq_text):
    if "Prerequisite(s):" not in prereq_text:
        return []

    cleaned_text = prereq_text.replace("Prerequisite(s):", "").strip()
    concurrent_reqs = []
    #get concurrent courses
    concurrent_match = re.search(r'[Cc]oncurrent enrollment in ([^.]+)', cleaned_text)
    if concurrent_match:
        cleaned_text = re.split(r"(?i)concurrent", cleaned_text)[0]
        concurrent_text = concurrent_match.group(1).strip()
        #process and/or courses similar to normal courses for concurrent
        concurrent_parts = re.split(r';\s+and\s+|\s*;\s*|\s+and\s+', concurrent_text)
        
        for part in concurrent_parts:
            if " or " in part:
                
                or_courses = []
                #regex for or courses
                or_parts = re.split(r'\s+or\s+', part)
                
                for or_part in or_parts:
                    course_match = re.search(r'([A-Z]{2,4}\s*\d+[A-Z]*)', or_part)
                    if course_match:
                        or_courses.append("Concurrent: " + course_match.group(1).strip())
                
                if or_courses:
                    concurrent_reqs.append(or_courses)
            else:
                #single course
                course_match = re.search(r'([A-Z]{2,4}\s*\d+[A-Z]*)', part)
                if course_match:
                    course = "Concurrent: " + course_match.group(1).strip()
                    concurrent_reqs.append([course])
    if "Enrollment" in cleaned_text:
        cleaned_text = cleaned_text.split("Enrollment")[0].strip()


    #regex for splitting courses by ";" / "and"
    top_level_parts = re.split(r';\s+and\s+|\s*;\s*|\s+and\s+', cleaned_text)
   
    prereq_list = []
    
    for part in top_level_parts:
        if " or " in part:
            
            or_courses = []
            #splits text by or
            or_parts = re.split(r'\s+or\s+', part)
            
            for or_part in or_parts:
                #extract course codes in the or
                course_match = re.search(r'([A-Z]{2,4}\s*\d+[A-Z]*)', or_part)
                if course_match:
                    or_courses.append(course_match.group(1).strip())
            
            if or_courses:
                prereq_list.append(or_courses)
        else:
            #this is a single course requirement (no or)
            #checks if its a course
            course_match = re.search(r'([A-Z]{2,4}\s*\d+[A-Z]*)', part)
            if course_match:
                course = course_match.group(1).strip()
                prereq_list.append([course])
    
    prereq_list.extend(concurrent_reqs)
    
    return prereq_list    

def compute_recommendations(classes_taken):
    needed_classes = {
        # Lower‑division
        "CSE 12": [],
        "CSE 16": [],
        "CSE 20": [],
        "CSE 30": [],
        "CSE 40": [],
        "CSE 13S": [],

        # Calculus options (choose one pair)
        "MATH 19A": ["MATH 20A"],
        "MATH 20A": ["MATH 19A"],
        "MATH 19B": ["MATH 20B"],
        "MATH 20B": ["MATH 19B"],

        # Applied math / vector calc
        "AM 10": ["MATH 21"],
        "MATH 21": ["AM 10"],
        "AM 30": ["MATH 23A"],
        "MATH 23A": ["AM 30"],

        # Engineering science
        "ECE 30": [],

        # Core upper‑division
        "CSE 101": [],
        "CSE 101M": [],
        "CSE 120": [],
        "CSE 130": [],
        "CSE 102": ["CSE 103"],
        "CSE 103": ["CSE 102"],
        "CSE 112": ["CSE 114A"],
        "CSE 114A": ["CSE 112"],

        # Statistics requirement
        "STAT 131": ["CSE 107"],
        "CSE 107": ["STAT 131"],

        # DC requirement (any one of these)
        "CSE 115A": ["CSE 185E", "CSE 185S", "CSE 195"],
        "CSE 185E": ["CSE 115A", "CSE 185S", "CSE 195"],
        "CSE 185S": ["CSE 115A", "CSE 185E", "CSE 195"],
        "CSE 195":  ["CSE 115A", "CSE 185E", "CSE 185S"],

        # Elective‑list courses (no direct equivalents)
        "AM 114": [],
        "AM 147": [],
        "CMPM 120": [],
        "CMPM 131": [],
        "CMPM 146": [],
        "CMPM 163": [],
        "CMPM 164": [],
        "CMPM 164L": [],
        "CMPM 171": [],
        "CMPM 172": [],
        "MATH 110": [],
        "MATH 115": [],
        "MATH 116": [],
        "MATH 117": [],
        "MATH 118": [],
        "MATH 134": [],
        "MATH 145": [],
        "MATH 145L": [],
        "MATH 148": [],
        "MATH 160": [],
        "MATH 161": [],
        "STAT 132": [],

        # Capstone (choose one; no swap‑ins)
        "CSE 110B": [],
        "CSE 115C": [],
        "CSE 115D": [],
        "CSE 121":   [],
        "CSE 134":  [],
        "CSE 138":  [],
        "CSE 140":  [],
        "CSE 143":  [],
        "CSE 144":  [],
        "CSE 145":  [],
        "CSE 156":  [],
        "CSE 156L": [],
        "CSE 157":  [],
        "CSE 160":  [],
        "CSE 161":  [],
        "CSE 161L": [],
        "CSE 162":  [],
        "CSE 162L": [],
        "CSE 163":  [],
        "CSE 168":  [],
        "CSE 181":  [],
        "CSE 183":  [],
        "CSE 184":  [],
        "CSE 187":  [],
    }


    major_prerequsites = {
        'AM 10': ['MATH 3'],
        'AM 114': ['AM 10', 'MATH 21', 'AM 20', 'MATH 24'],
        'AM 147': ['AM 10', 'MATH 21', 'AM 20', 'MATH 24'],
        'AM 30': ['MATH 23A', 'MATH 21', 'PHYS 116A', 'PHYS 5D'],
        'CMPM 120': ['CSE 30', 'CSE 20', 'CSE 13S'],
        'CMPM 131': ['CMPM 120', 'CSE 160'],
        'CMPM 146': ['CMPM 120', 'CSE 160'],
        'CMPM 163': ['CMPM 120', 'CSE 160'],
        'CMPM 164': ['CMPM 120', 'CSE 160'],
        'CMPM 164L': ['CMPM 164'],
        'CMPM 171': ['CMPM 120', 'CSE 160'],
        'CMPM 172': ['CMPM 120', 'CSE 160'],
        'CMPM/MATH/AM electives': ['MATH 21', 'AM 10', 'CMPM 120', 'CSE 160'],
        'CSE 101': ['CSE 12', 'CSE 16', 'CSE 30'],
        'CSE 101M': ['CSE 12', 'CSE 16', 'CSE 30'],
        'CSE 102': ['CSE 101', 'CSE 16'],
        'CSE 103': ['CSE 16', 'CSE 30', 'MATH 19B', 'MATH 20B'],
        'CSE 107': ['CSE 16', 'CSE 12', 'MATH 19B'],
        'CSE 110B': ['CSE 101', 'CSE 120'],
        'CSE 112': ['CSE 101', 'CSE 120'],
        'CSE 114A': ['CSE 101', 'CSE 120'],
        'CSE 115A': ['CSE 101', 'CSE 120'],
        'CSE 115A/185E/185S/195': ['CSE 101', 'CSE 120'],
        'CSE 115C': ['CSE 101', 'CSE 120'],
        'CSE 115D': ['CSE 101', 'CSE 120'],
        'CSE 12': [],
        'CSE 120': ['CSE 12', 'CSE 13S'],
        'CSE 121': ['CSE 101', 'CSE 120'],
        'CSE 130': ['CSE 12', 'CSE 101'],
        'CSE 134': ['CSE 101', 'CSE 120'],
        'CSE 138': ['CSE 101', 'CSE 120'],
        'CSE 13S': ['CSE 12'],
        'CSE 140': ['CSE 101', 'CSE 120'],
        'CSE 143': ['CSE 101', 'CSE 120'],
        'CSE 144': ['CSE 101', 'CSE 120'],
        'CSE 145': ['CSE 101', 'CSE 120'],
        'CSE 156': ['CSE 101', 'CSE 120'],
        'CSE 156L': ['CSE 156'],
        'CSE 157': ['CSE 101', 'CSE 120'],
        'CSE 16': [],
        'CSE 160': ['CSE 101', 'CSE 120'],
        'CSE 161': ['CSE 101', 'CSE 120'],
        'CSE 161L': ['CSE 161'],
        'CSE 162': ['CSE 101', 'CSE 120'],
        'CSE 162L': ['CSE 162'],
        'CSE 163': ['CSE 101', 'CSE 120'],
        'CSE 168': ['CSE 101', 'CSE 120'],
        'CSE 181': ['CSE 101', 'CSE 120'],
        'CSE 183': ['CSE 101', 'CSE 120'],
        'CSE 184': ['CSE 101', 'CSE 120'],
        'CSE 185E': ['CSE 101', 'CSE 120'],
        'CSE 185S': ['CSE 101', 'CSE 120'],
        'CSE 187': ['CSE 101', 'CSE 120'],
        'CSE 195': ['CSE 101', 'CSE 120'],
        'CSE 20': [],
        'CSE 30': ['CSE 20'],
        'CSE 40': ['CSE 30'],
        'Capstones': ['CSE 101', 'CSE 120'],
        'ECE 30': ['PHYS 5A', 'MATH 19B'],
        'MATH 110': ['MATH 21', 'AM 10', 'MATH 23A', 'AM 30'],
        'MATH 115': ['MATH 21', 'AM 10'],
        'MATH 116': ['MATH 21', 'AM 10'],
        'MATH 117': ['MATH 21', 'AM 10'],
        'MATH 118': ['MATH 21', 'AM 10'],
        'MATH 134': ['MATH 21', 'AM 10'],
        'MATH 145': ['MATH 21', 'AM 10'],
        'MATH 145L': ['MATH 145'],
        'MATH 148': ['MATH 21', 'AM 10'],
        'MATH 160': ['MATH 21', 'AM 10'],
        'MATH 161': ['MATH 21', 'AM 10'],
        'MATH 19A': [],
        'MATH 19B': [],
        'MATH 20A': [],
        'MATH 20B': [],
        'MATH 21': ['MATH 19B', 'MATH 20B'],
        'MATH 23A': ['MATH 19B', 'MATH 20B'],
        'STAT 131': ['CSE 16', 'MATH 23A', 'MATH 100', 'MATH 117', 'MATH 148'],
        'STAT 132': ['STAT 131', 'CSE 107'],
    }

    equiv_classes = set()
    for c in classes_taken:
        if c in needed_classes:
            equiv_classes.add(c)
            for next_class in needed_classes.get(c, []):
                equiv_classes.add(next_class)

    recommended_classes = set()
    for item, value in major_prerequsites.items():
        if set(value).issubset(equiv_classes) and item not in equiv_classes:
            recommended_classes.add(item)

    return list(equiv_classes), list(recommended_classes)
