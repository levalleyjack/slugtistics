import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Sequence

logger = logging.getLogger(__name__)


class MajorsService:
    """Service class for handling majors-related operations."""

    @staticmethod
    def json_path_exists(json_obj: dict | list, json_path: Sequence[str | int]) -> bool:
        """Validate multi-layer deep indexing operations on JSON objects ahead of time"""
        json_obj_trace = "json_obj"

        for field in json_path:
            # handle when json_obj is an invalid type & when nesting list exceeds json_obj
            if not isinstance(json_obj, (dict, list)):
                logger.error(
                    f"Typing: expected {json_obj_trace} to be dict or list, got {type(json_obj).__name__}"
                )
                return False

            # handle when json_obj is a list
            if isinstance(json_obj, list):
                if not isinstance(field, int):
                    logger.error(
                        f"Typing: expected {json_obj_trace} (dtype=list) to be indexed with int, instead got {field}"
                    )
                    return False
                if field >= len(json_obj):
                    logger.error(
                        f"Indexing: index {field} out of bounds for {json_obj_trace} (dtype=list) of len={len(json_obj)}"
                    )
                    return False

            # handle when json_obj is a dict
            if isinstance(json_obj, dict):
                if not isinstance(field, str):
                    logger.error(
                        f"Typing: expected {json_obj_trace} (dtype=dict) to be indexed with str, instead got {field}"
                    )
                    return False
                if field not in json_obj.keys():
                    logger.error(
                        f"Indexing: key {field} not in {json_obj_trace} (dtype=dict) keys"
                    )
                    return False

            json_obj_trace += f"[{repr(field)}]"
            json_obj = json_obj[field]

        return True

    @staticmethod
    def get_majors() -> List[Dict[str, str]]:
        """
        Load all majors from JSON files in the scraping/majors directory.
        Parse filenames to extract major names and degree types.
        
        Filename format: major_name_with_underscores_DEGREE.json
        Example: computer_science_bs_2024.json -> "Computer Science", "B.S.", 2024
        
        Returns:
            List of dictionaries with major name, degree type, year, and filename
        """
        # Use absolute path relative to this file's location
        current_dir = Path(__file__).parent.parent.parent
        majors_path = current_dir / "scraping" / "majors"
        majors_list = []

        if not majors_path.exists():
            logger.error(f"Majors directory not found: {majors_path}")
            return majors_list

        for majorfp in majors_path.iterdir():
            if majorfp.is_dir() or not majorfp.suffix == '.json':
                continue

            try:
                # Parse filename: everything before last underscore is major name
                # Last part is degree type + year (e.g., "bs_2024")
                filename = majorfp.stem  # filename without extension
                parts = filename.split('_')
                
                if len(parts) < 2:
                    logger.warning(f"Invalid filename format: {filename}")
                    continue
                
                # Last part should be year (e.g., "2024")
                year = parts[-1]
                
                # Second to last should be degree type (bs/ba)
                degree_type = parts[-2].upper()
                if len(degree_type) == 2:
                    degree_type = f"{degree_type[0]}.{degree_type[1]}."
                
                # Everything before is the major name
                major_name_parts = parts[:-2]
                major_name = ' '.join(word.capitalize() for word in major_name_parts)
                
                majors_list.append({
                    "name": major_name,
                    "degree": degree_type,
                    "year": year,
                    "full_name": f"{major_name} {degree_type}",
                    "filename": filename
                })
                
            except Exception as e:
                logger.error(f"Error parsing major file {majorfp}: {str(e)}")
                continue

        return majors_list

    @staticmethod
    def get_major_data_by_filename(filename: str) -> Dict[str, Any]:
        """
        Load a specific major's data from its JSON file.
        
        Args:
            filename: The filename (without .json extension)
            
        Returns:
            Dictionary containing the major's data
        """
        current_dir = Path(__file__).parent.parent.parent
        majors_path = current_dir / "scraping" / "majors"
        filepath = majors_path / f"{filename}.json"
        
        if not filepath.exists():
            logger.error(f"Major file not found: {filepath}")
            return {}
        
        try:
            with open(filepath, "r") as fp:
                return json.load(fp)
        except Exception as e:
            logger.error(f"Error loading major file {filepath}: {str(e)}")
            return {}
    
    @staticmethod
    def get_major_courses(major_name: str) -> List[str]:
        """
        Get all course codes for a specific major from the groups structure.
        
        Args:
            major_name: The major filename (e.g., "computer_science_bs_2024")
            
        Returns:
            List of all course codes across all groups
        """
        major_data = MajorsService.get_major_data_by_filename(major_name)
        
        if not major_data or "groups" not in major_data:
            logger.warning(f"No groups found for major: {major_name}")
            return []
        
        all_courses = []
        groups = major_data.get("groups", [])
        
        # Groups is now a list of dicts
        for group in groups:
            if "classes" in group:
                classes = group["classes"]
                for item in classes:
                    if isinstance(item, str):
                        all_courses.append(item)
                    elif isinstance(item, list):
                        # For nested lists (OR conditions), add all options
                        all_courses.extend(item)
        
        return all_courses
    
    @staticmethod
    def get_major_groups(major_name: str) -> List[Dict[str, Any]]:
        """
        Get all groups and their requirements for a specific major.
        
        Args:
            major_name: The major filename (e.g., "computer_science_bs_2024")
            
        Returns:
            List of group objects, each containing name, count, and classes
        """
        major_data = MajorsService.get_major_data_by_filename(major_name)
        
        if not major_data or "groups" not in major_data:
            logger.warning(f"No groups found for major: {major_name}")
            return []
        
        return major_data.get("groups", [])

    @staticmethod
    def mark_classes_taken(major_name: str, classes_taken: List[str]) -> Dict[str, Any]:
        """
        Mark classes as taken for a specific major and return status for all required courses.
        
        Args:
            major_name: The major filename
            classes_taken: List of course codes that have been completed
            
        Returns:
            Dictionary with all courses and their completion status
        """
        all_courses = MajorsService.get_major_courses(major_name)
        groups = MajorsService.get_major_groups(major_name)
        
        # Normalize course codes for comparison (handle spaces vs underscores)
        def normalize_course(course: str) -> str:
            return course.replace(" ", "_").upper()
        
        taken_normalized = set(normalize_course(c) for c in classes_taken)
        
        result = {
            "major": major_name,
            "groups": [],
            "overall_status": {
                "total_courses": len(all_courses),
                "completed": 0,
                "remaining": len(all_courses)
            }
        }
        
        completed_count = 0
        
        # Groups is now a list
        for group in groups:
            group_result = {
                "name": group.get("name", "Unknown"),
                "count_required": group.get("count", 0),
                "courses": []
            }
            
            if "classes" in group:
                for item in group["classes"]:
                    if isinstance(item, str):
                        is_taken = normalize_course(item) in taken_normalized
                        group_result["courses"].append({
                            "code": item,
                            "status": "taken" if is_taken else "not_taken",
                            "is_choice": False
                        })
                        if is_taken:
                            completed_count += 1
                    elif isinstance(item, list):
                        # OR condition - mark as taken if any option is completed
                        any_taken = any(normalize_course(c) in taken_normalized for c in item)
                        group_result["courses"].append({
                            "code": " OR ".join(item),
                            "options": item,
                            "status": "taken" if any_taken else "not_taken",
                            "is_choice": True
                        })
                        if any_taken:
                            completed_count += 1
            
            result["groups"].append(group_result)
        
        result["overall_status"]["completed"] = completed_count
        result["overall_status"]["remaining"] = len(all_courses) - completed_count
        
        return result
    
    @staticmethod
    def compute_recommendations(
        classes_taken: List[str], major: str, prereq_dict: Dict[str, List]
    ) -> tuple[List[str], List[str]]:
        """
        Compute course recommendations based on completed courses and major requirements.
        
        Args:
            classes_taken: List of completed course codes
            major: The major name
            prereq_dict: Dictionary mapping course codes to their prerequisites
            
        Returns:
            Tuple of (equivalent_classes, recommended_classes)
        """
        major_data = MajorsService.get_major_data_by_filename(major)
        needed_classes = major_data.get("needed_classes", {})

        # All classes that unlock others or are part of the needed structure
        major_classes = set(needed_classes.keys())

        equiv_classes = set()
        for c in classes_taken:
            if c in major_classes:
                equiv_classes.add(c)
                for next_class in needed_classes.get(c, []):
                    equiv_classes.add(next_class)
            else:
                equiv_classes.add(c)  # still track all classes taken

        recommended_classes = set()
        for course, prereq_groups in prereq_dict.items():
            # Recommend only if it's part of the major
            if course not in major_classes or course in equiv_classes:
                continue

            # Check if any group of prereqs is satisfied
            for group in prereq_groups:
                if set(group).issubset(equiv_classes):
                    recommended_classes.add(course)
                    break

        return list(equiv_classes), list(recommended_classes)

