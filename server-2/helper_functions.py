def normalize_instructor_name(name: str) -> str:
    return ' '.join(name.split()).lower()
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
        if grade in grade_points and count:
            total_points += grade_points[grade] * count
            total_students += count
    
    if total_students == 0:
        return "N/A"
        
    gpa = total_points / total_students
    return f"{gpa:.2f}"


def find_matching_instructor(instructor: str, historical_instructors: list) -> str:
    current_instructor = normalize_instructor_name(instructor)

    if not current_instructor or not historical_instructors:
        return instructor
    
    current_name = ' '.join(current_instructor.split()).lower()
    current_parts = current_name.split()
    
    if len(current_parts) == 0:
        return instructor
    
    current_last = current_parts[-1]
    
    current_initials = []
    for part in current_parts[:-1]:
        cleaned_part = part.replace('.', '').strip()
        if cleaned_part:
            current_initials.append(cleaned_part[0].upper())
    
    for full_name in historical_instructors:
        if normalize_instructor_name(full_name) == current_name:
            return full_name
    
    for full_name in historical_instructors:
        hist_name = normalize_instructor_name(full_name)
        hist_parts = hist_name.split()
        
        if len(hist_parts) < 2:
            continue
        
        hist_last = hist_parts[-1]
        
        if hist_last != current_last:
            continue
        
        hist_initials = [part[0].upper() for part in hist_parts[:-1]]
        
        if len(current_initials) > 0 and len(hist_initials) >= len(current_initials):
            if all(c == h for c, h in zip(current_initials, hist_initials)):
                return full_name
    
    return instructor
