def normalize_instructor_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    
    cleaned_name = ' '.join(name.strip().split())
    
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
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "D-": 0.7,
        "F": 0.0
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

def get_course_gpa(cursor, course_code):
    """
    Retrieve GPA for a specific course
    """
    query = '''
        SELECT 
            COALESCE(SUM("A+"), 0) as "A+", COALESCE(SUM("A"), 0) as "A", COALESCE(SUM("A-"), 0) as "A-",
            COALESCE(SUM("B+"), 0) as "B+", COALESCE(SUM("B"), 0) as "B", COALESCE(SUM("B-"), 0) as "B-",
            COALESCE(SUM("C+"), 0) as "C+", COALESCE(SUM("C"), 0) as "C", COALESCE(SUM("C-"), 0) as "C-",
            COALESCE(SUM("D+"), 0) as "D+", COALESCE(SUM("D"), 0) as "D", COALESCE(SUM("D-"), 0) as "D-",
            COALESCE(SUM("F"), 0) as "F"
        FROM GradeData 
        WHERE "SubjectCatalogNbr" = ?
    '''
    cursor.execute(query, (course_code,))
    
    result = cursor.fetchone()
    
    grade_distribution = {k: v for k, v in dict(result).items() if v > 0}
    
    return calculate_gpa(grade_distribution)

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
        
        if (len(current_initials) > 0 and 
            len(hist_initials) >= len(current_initials) and 
            all(c == h for c, h in zip(current_initials, hist_initials))):
            return full_name
    
    return instructor