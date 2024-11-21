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
class ProfessorData:
    avg_rating: float
    num_ratings: int
    department: str
    would_take_again_percent: float
    difficulty_level: float
    name: str
    all_ratings: List[ProfessorRating]
    rating_distribution: List[int]
    def to_dict(self) -> Dict[str, Any]:
        return {
            "avg_rating": self.avg_rating,
            "num_ratings": self.num_ratings,
            "department": self.department,
            "would_take_again_percent": self.would_take_again_percent,
            "difficulty_level": self.difficulty_level,
            "name": self.name,
            "all_ratings": [rating.to_dict() for rating in self.all_ratings],
            "rating_distribution": self.rating_distribution,
        }

def search_professor(professor_name: str) -> Optional[ProfessorData]:
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
                            ratingsDistribution {
                                r1 r2 r3 r4 r5
                            }
                            ratings(first: 20) {
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

    name_parts = professor_name.split()
    if "." in professor_name:
        search_query = name_parts[-1]
    else:
        search_query = f"{name_parts[0]} {name_parts[-1]}"

    first_initial = name_parts[0][0].lower()
    last_name = name_parts[-1].lower().strip()

    try:
        response = requests.post(
            RMP_URL,
            headers={
                "Authorization": "Basic dGVzdDp0ZXN0",
                "Content-Type": "application/json",
            },
            json={
                "query": query,
                "variables": {"query": {"schoolID": SCHOOL_ID, "text": search_query}},
            },
        )
        response.raise_for_status()
        
        data = response.json()
        if "errors" in data:
            raise ValueError(data["errors"][0].get("message", "GraphQL error"))

        teachers = data.get("data", {}).get("newSearch", {}).get("teachers", {}).get("edges", [])
        if not teachers:
            return None

        matching_professor = None
        for teacher in teachers:
            professor = teacher["node"]
            prof_last_name = professor["lastName"].lower().strip()
            prof_last_name_parts = professor["lastName"].split()
            prof_last_name_hyphen = professor["lastName"].split("-")

            prof_last_name_with_middle = (
                prof_last_name_parts[-1].lower().strip()
                if len(prof_last_name_parts) > 1
                else prof_last_name
            )
            
            prof_last_name_check_hyphen = (
                prof_last_name_hyphen[-1].lower().strip()
                if len(prof_last_name_hyphen) > 1
                else prof_last_name
            )

            prof_first_initial = professor["firstName"][0].lower()

            if (
                (prof_last_name == last_name
                 or prof_last_name_with_middle == last_name
                 or prof_last_name_check_hyphen == last_name)
                and (prof_first_initial == first_initial
                     or ("." in professor_name and prof_first_initial == first_initial))
            ):
                matching_professor = professor
                break

        if not matching_professor:
            return None

        all_ratings = []
        for rating_edge in matching_professor["ratings"]["edges"]:
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
                    flag_status=rating["flagStatus"]
                )
            )

        return ProfessorData(
            avg_rating=matching_professor["avgRating"],
            num_ratings=matching_professor["numRatings"],
            department=matching_professor["department"],
            would_take_again_percent=matching_professor["wouldTakeAgainPercent"],
            difficulty_level=matching_professor["avgDifficulty"],
            name=f"{matching_professor['firstName']} {matching_professor['lastName']}",
            all_ratings=all_ratings,
            rating_distribution=[
                matching_professor["ratingsDistribution"]["r1"],
                matching_professor["ratingsDistribution"]["r2"],
                matching_professor["ratingsDistribution"]["r3"],
                matching_professor["ratingsDistribution"]["r4"],
                matching_professor["ratingsDistribution"]["r5"],
            ]
        )
        
    except requests.RequestException as e:
        print(f"Error making request: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None