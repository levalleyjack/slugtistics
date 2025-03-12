import re
import requests
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class ProfessorRating:
    class_name: str
    date: str
    helpful_rating: float
    clarity_rating: float
    difficulty_rating: float
    overall_rating: float
    comment: str
    thumbs_up: int
    thumbs_down: int
    would_take_again: bool
    is_online: bool
    is_for_credit: bool
    attendance_mandatory: bool
    textbook_use: str
    tags: List[str]
    flag_status: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "class_name": self.class_name,
            "date": self.date,
            "helpful_rating": self.helpful_rating,
            "clarity_rating": self.clarity_rating,
            "difficulty_rating": self.difficulty_rating,
            "overall_rating": self.overall_rating,
            "comment": self.comment,
            "thumbs_up": self.thumbs_up,
            "thumbs_down": self.thumbs_down,
            "would_take_again": self.would_take_again,
            "is_online": self.is_online,
            "is_for_credit": self.is_for_credit,
            "attendance_mandatory": self.attendance_mandatory,
            "textbook_use": self.textbook_use,
            "tags": self.tags,
            "flag_status": self.flag_status,
        }


@dataclass
class BasicProfessorInfo:
    avg_rating: float
    num_ratings: int
    department: str
    would_take_again_percent: float
    difficulty_level: float
    name: str
    rating_distribution: List[int]
    course_codes: List[Dict[str, Any]]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "avg_rating": self.avg_rating,
            "num_ratings": self.num_ratings,
            "department": self.department,
            "would_take_again_percent": self.would_take_again_percent,
            "difficulty_level": self.difficulty_level,
            "name": self.name,
            "rating_distribution": self.rating_distribution,
            "course_codes": self.course_codes,
        }


@dataclass
class DetailedProfessorData(BasicProfessorInfo):
    all_ratings: List[ProfessorRating]

    def to_dict(self) -> Dict[str, Any]:
        basic_info = super().to_dict()
        basic_info["all_ratings"] = [rating.to_dict() for rating in self.all_ratings]
        return basic_info


def get_basic_professor_info(professor_name: str, course_code:str) -> Optional[BasicProfessorInfo]:
    """Get basic professor information without detailed ratings."""
    if not professor_name or professor_name.lower() == "staff":
        raise ValueError("Invalid professor name")

    SCHOOL_ID = "U2Nob29sLTEwNzg="
    RMP_URL = "https://www.ratemyprofessors.com/graphql"

    query = """
        query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
            newSearch {
                teachers(query: $query) {
                    edges {
                        node {
                            id
                            firstName
                            lastName
                            department
                            avgRating
                            avgDifficulty
                            numRatings
                            wouldTakeAgainPercent
                            courseCodes {
                                courseCount
                                courseName
                            }
                            ratingsDistribution {
                                r1 r2 r3 r4 r5
                            }
                        }
                    }
                }
            }
        }
    """

    professor_data = _search_professor(professor_name, query, SCHOOL_ID, RMP_URL, course_code=course_code)
    if not professor_data:
        return None

    return BasicProfessorInfo(
        avg_rating=professor_data["avgRating"],
        num_ratings=professor_data["numRatings"],
        department=professor_data["department"],
        would_take_again_percent=professor_data["wouldTakeAgainPercent"],
        difficulty_level=professor_data["avgDifficulty"],
        name=f"{professor_data['firstName']} {professor_data['lastName']}",
        rating_distribution=[
            professor_data["ratingsDistribution"]["r1"],
            professor_data["ratingsDistribution"]["r2"],
            professor_data["ratingsDistribution"]["r3"],
            professor_data["ratingsDistribution"]["r4"],
            professor_data["ratingsDistribution"]["r5"],
        ],
        course_codes=professor_data["courseCodes"],
    )


def get_detailed_professor_info(
    professor_name: str, course_code: Optional[str] = None
) -> Optional[DetailedProfessorData]:
    """Get detailed professor information including ratings."""
    if not professor_name or professor_name.lower() == "staff":
        raise ValueError("Invalid professor name")

    SCHOOL_ID = "U2Nob29sLTEwNzg="
    RMP_URL = "https://www.ratemyprofessors.com/graphql"

    query = """
        query NewSearchTeachersQuery($query: TeacherSearchQuery!, $courseFilter: String) {
            newSearch {
                teachers(query: $query) {
                    edges {
                        node {
                            id
                            firstName
                            lastName
                            department
                            avgRating
                            avgDifficulty
                            numRatings
                            wouldTakeAgainPercent
                            courseCodes {
                                courseCount
                                courseName
                            }
                            ratingsDistribution {
                                r1 r2 r3 r4 r5
                            }
                            ratings(first: 10, courseFilter: $courseFilter) {
                                edges {
                                    node {
                                        comment
                                        date
                                        class
                                        helpfulRating
                                        clarityRating
                                        difficultyRating
                                        thumbsUpTotal
                                        thumbsDownTotal
                                        wouldTakeAgain
                                        isForCredit
                                        isForOnlineClass
                                        attendanceMandatory
                                        ratingTags
                                        flagStatus
                                        textbookUse
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    """

    professor_data = _search_professor(
        professor_name, query, SCHOOL_ID, RMP_URL, course_filter=course_code
    )
    if not professor_data:
        return None

    all_ratings = []
    for rating_edge in professor_data["ratings"]["edges"]:
        rating = rating_edge["node"]
        all_ratings.append(
            ProfessorRating(
                class_name=rating["class"],
                date=rating["date"],
                helpful_rating=rating["helpfulRating"],
                clarity_rating=rating["clarityRating"],
                difficulty_rating=rating["difficultyRating"],
                overall_rating=(rating["helpfulRating"] + rating["clarityRating"]) / 2,
                comment=rating["comment"],
                thumbs_up=rating["thumbsUpTotal"],
                thumbs_down=rating["thumbsDownTotal"],
                would_take_again=rating["wouldTakeAgain"] == 1,
                is_online=rating["isForOnlineClass"],
                is_for_credit=rating["isForCredit"],
                attendance_mandatory=rating["attendanceMandatory"],
                textbook_use=rating["textbookUse"],
                tags=rating["ratingTags"],
                flag_status=rating["flagStatus"],
            )
        )

    return DetailedProfessorData(
        avg_rating=professor_data["avgRating"],
        num_ratings=professor_data["numRatings"],
        department=professor_data["department"],
        would_take_again_percent=professor_data["wouldTakeAgainPercent"],
        difficulty_level=professor_data["avgDifficulty"],
        name=f"{professor_data['firstName']} {professor_data['lastName']}",
        rating_distribution=[
            professor_data["ratingsDistribution"]["r1"],
            professor_data["ratingsDistribution"]["r2"],
            professor_data["ratingsDistribution"]["r3"],
            professor_data["ratingsDistribution"]["r4"],
            professor_data["ratingsDistribution"]["r5"],
        ],
        course_codes=professor_data["courseCodes"],
        all_ratings=all_ratings,
    )

import re
import requests
from typing import Optional, Dict, Any, List

def _search_professor(
    professor_name: str,
    query: str,
    school_id: str,
    rmp_url: str,
    course_code: Optional[str] = None,
    course_filter: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    name_parts = professor_name.split()
    if len(name_parts) >= 2 and "." in name_parts[0]:
        first_initial = name_parts[0][0].lower()
        last_name = name_parts[-1].lower().strip()
    else:
        #fallback if not like j. lee
        first_initial = name_parts[0][0].lower()
        last_name = name_parts[-1].lower().strip()

    #search query formatted to rmp
    search_query = f"{last_name} {first_initial}"
    
    #format class code and extract department prefix
    class_name = ""
    class_prefix = ""
    if course_code:
        #change to stats7
        class_name = course_code.replace(" ", "")
        class_prefix = re.sub(r"\d.*", "", class_name)

    try:
        variables = {
            "query": {"schoolID": school_id, "text": search_query, "fallback": True, },
        }
        #filter by course code if any
        if course_filter is not None:
            variables["courseFilter"] = course_filter

        #query RMP using graphQL
        response = requests.post(
            rmp_url,
            headers = {
            "Authorization": "Basic dGVzdDp0ZXN0",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
            "Content-Type": "application/json",
            "Referer": f"https://www.ratemyprofessors.com/search/teachers/{school_id.replace('U2Nob29sLQ==', '')}?q={search_query}"
        },
            json={
                "query": query,
                "variables": variables,
            },
        )
        response.raise_for_status()

        data = response.json()
        if "errors" in data:
            raise ValueError(data["errors"][0].get("message", "GraphQL error"))

        teachers = (
            data.get("data", {})
            .get("newSearch", {})
            .get("teachers", {})
            .get("edges", [])
        )
        if not teachers:
            return None

        professors = [teacher["node"] for teacher in teachers]
        
        
        #calculate similarity scores for all professors so that 
        #we get the teacher with same subject and same name
        similarity_scores = []
        for professor in professors:
            score = 0
            
            
            #check if last name matches (case insensitive)
            prof_last_name = professor["lastName"].lower()
            if prof_last_name.endswith(last_name):
                score += 1
            else:
                continue
                
            #check if first initial matches 
            prof_first_initial = professor["firstName"][0].lower() if professor["firstName"] else ""
            if prof_first_initial == first_initial:
                score += 1
            else:
                continue
            
            #check course matches
            if "courseCodes" in professor and class_name:
                has_similar_course = False
                has_exact_course = False
                broader_dept_match = False
                
                #check if taught before
                higher_level_courses = []
                
                for course in professor["courseCodes"]:
                    course_name = course["courseName"]
                    
                    #check exact course match
                    if course_name == class_name:
                        has_exact_course = True
                    
                    # Extract course prefix for matching (e.g., "Stats" from "Stats131")
                    course_prefix = re.sub(r"\d.*", "", course_name)
                    
                    #check if department is same
                    if course_prefix.lower() == class_prefix.lower():
                        has_similar_course = True
                        
                        #if it's a higher-level course in the same department
                        if class_name and course_name != class_name:
                            #get course number as well
                            try:
                                class_num = int(re.search(r"\d+", class_name).group())
                                course_num = int(re.search(r"\d+", course_name).group())
                                
                                if course_num > class_num:
                                    higher_level_courses.append(course_name)
                            except (AttributeError, ValueError):
                                pass
                
                #score course matches
                if has_similar_course:
                    score += 1
                else:
                    score -= 1
                
                if has_exact_course:
                    score += 5
                else:
                    score -= 1
                
                if higher_level_courses and not has_exact_course:
                    score += 2
                    
            similarity_scores.append(score)
        
        #get the professor with the highest similarity score
        if similarity_scores:
            best_match_index = similarity_scores.index(max(similarity_scores))
            best_match = professors[best_match_index]
            
            
            #last sanity check, checking first inital and last name
            if (not best_match["lastName"].lower().endswith(last_name) or 
                best_match["firstName"][0].lower() != first_initial):
                return None
                
            return best_match

        return None

    except requests.RequestException as e:
        print(f"Error making request: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None