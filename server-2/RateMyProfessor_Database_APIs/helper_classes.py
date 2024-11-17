# [Class]
from typing import List, Dict, Any, Optional

class Rating:
    def __init__(self, clubs_rating: int, comment: str, created_by_user: bool, date: str, facilities_rating: int,
                 flag_status: str, food_rating: int, happiness_rating: int, id: str, internet_rating: int,
                 legacy_id: int, location_rating: int, opportunities_rating: int, reputation_rating: int,
                 safety_rating: int, social_rating: int, thumbs_down_total: Optional[int], thumbs_up_total: Optional[int], user_thumbs: List[Dict[str, Any]]):
        self.clubs_rating = clubs_rating
        self.comment = comment
        self.created_by_user = created_by_user
        self.date = date
        self.facilities_rating = facilities_rating
        self.flag_status = flag_status
        self.food_rating = food_rating
        self.happiness_rating = happiness_rating
        self.id = id
        self.internet_rating = internet_rating
        self.legacy_id = legacy_id
        self.location_rating = location_rating
        self.opportunities_rating = opportunities_rating
        self.reputation_rating = reputation_rating
        self.safety_rating = safety_rating
        self.social_rating = social_rating
        self.thumbs_down_total = thumbs_down_total
        self.thumbs_up_total = thumbs_up_total
        self.user_thumbs = user_thumbs

class School:
    def __init__(self, id: str, legacy_id: int, name: str, city: str, state: str, country: str, avg_rating: float,
                 avg_rating_rounded: float, num_ratings: int, ratings: List[Rating], summary: Dict[str, float]):
        self.id = id
        self.legacy_id = legacy_id
        self.name = name
        self.city = city
        self.state = state
        self.country = country
        self.avg_rating = avg_rating
        self.avg_rating_rounded = avg_rating_rounded
        self.num_ratings = num_ratings
        self.ratings = ratings
        self.summary = summary
    
    def __repr__(self):
        ratings_info = "\n\t".join([f"Comment: {r.comment}\n\tHappiness: {r.happiness_rating}, Clubs: {r.clubs_rating}, Date: {r.date}" for r in self.ratings])
        summary_info = ", ".join([f"{key}: {value}" for key, value in self.summary.items()])
        
        return (f"School({self.name}, City: {self.city}, State: {self.state}, Country: {self.country})\n"
                f"Average Rating: {self.avg_rating} (Rounded: {self.avg_rating_rounded})\n"
                f"Number of Ratings: {self.num_ratings}\n"
                f"Summary: {self.summary}\n"
                f"Ratings:\n\t{ratings_info}")

def parse_school(json_data: Dict[str, Any]) -> School:
    school_data = json_data['data']['school']
    
    # Extract ratings
    ratings_data = school_data["ratings"]["edges"]
    ratings = [
        Rating(
            clubs_rating=int(rating["node"]["clubsRating"]),
            comment=rating["node"]["comment"],
            created_by_user=rating["node"]["createdByUser"],
            date=rating["node"]["date"],
            facilities_rating=int(rating["node"]["facilitiesRating"]),
            flag_status=rating["node"]["flagStatus"],
            food_rating=int(rating["node"]["foodRating"]),
            happiness_rating=int(rating["node"]["happinessRating"]),
            id=rating["node"]["id"],
            internet_rating=int(rating["node"]["internetRating"]),
            legacy_id=int(rating["node"]["legacyId"]),
            location_rating=int(rating["node"]["locationRating"]),
            opportunities_rating=int(rating["node"]["opportunitiesRating"]),
            reputation_rating=int(rating["node"]["reputationRating"]),
            safety_rating=int(rating["node"]["safetyRating"]),
            social_rating=int(rating["node"]["socialRating"]),
            thumbs_down_total=rating["node"]["thumbsDownTotal"],
            thumbs_up_total=rating["node"]["thumbsUpTotal"],
            user_thumbs=rating["node"]["userThumbs"]
        )
        for rating in ratings_data
    ]
    
    # Extract summary
    summary = school_data["summary"]
    
    # Create the School object
    school = School(
        id=school_data["id"],
        legacy_id=school_data["legacyId"],
        name=school_data["name"],
        city=school_data["city"],
        state=school_data["state"],
        country=school_data["country"],
        avg_rating=float(school_data["avgRating"]),
        avg_rating_rounded=float(school_data["avgRatingRounded"]),
        num_ratings=int(school_data["numRatings"]),
        ratings=ratings,
        summary=summary
    )
    return school

# Define the Professor class
class Professor:
    def __init__(self, id, legacy_id, first_name, last_name, department, school, lock_status, is_saved, num_ratings, avg_rating, department_id, is_prof_current_user, avg_difficulty, would_take_again_percent, ratings_distribution, related_teachers, course_codes, ratings):
        self.id = id
        self.legacy_id = legacy_id
        self.first_name = first_name
        self.last_name = last_name
        self.department = department
        self.school = school
        self.lock_status = lock_status
        self.is_saved = is_saved
        self.num_ratings = num_ratings
        self.avg_rating = avg_rating
        self.department_id = department_id
        self.is_prof_current_user = is_prof_current_user
        self.avg_difficulty = avg_difficulty
        self.would_take_again_percent = would_take_again_percent
        self.ratings_distribution = ratings_distribution
        self.related_teachers = related_teachers
        self.course_codes = course_codes
        self.ratings = ratings
    
    def __repr__(self):
        school_info = f"{self.school['name']}, {self.school['city']}, {self.school['state']}, {self.school['country']}"
        related_teachers_info = "\n\t".join([f"{rt['firstName']} {rt['lastName']} (Avg Rating: {rt['avgRating']})" for rt in self.related_teachers])
        course_codes_info = "\n\t".join([f"{cc['courseName']} (Count: {cc['courseCount']})" for cc in self.course_codes])
        ratings_info = "\n\t".join([f"Comment: {r['comment']}\n\tHelpful: {r['helpfulRating']}, Clarity: {r['clarityRating']}, Difficulty: {r['difficultyRating']}\n\tClass: {r['class']}, Date: {r['date']}" for r in self.ratings])
        
        return (f"Professor({self.first_name} {self.last_name}, Department: {self.department})\n"
                f"School: {school_info}\n"
                f"Ratings Distribution: {self.ratings_distribution}\n"
                f"Average Rating: {self.avg_rating}\n"
                f"Average Difficulty: {self.avg_difficulty}\n"
                f"Number of Ratings: {self.num_ratings}\n"
                f"Would Take Again Percent: {self.would_take_again_percent}\n"
                f"Related Teachers:\n\t{related_teachers_info}\n"
                f"Course Codes:\n\t{course_codes_info}\n"
                f"Ratings:\n\t{ratings_info}")

# Function to parse professor data from JSON
def parse_professor(json_data) -> Professor:
    professor_data = json_data['data']['node']
    
    # Main details
    id = professor_data["id"]
    legacy_id = professor_data["legacyId"]
    first_name = professor_data["firstName"]
    last_name = professor_data["lastName"]
    department = professor_data["department"]
    lock_status = professor_data["lockStatus"]
    is_saved = professor_data["isSaved"]
    num_ratings = professor_data["numRatings"]
    avg_rating = professor_data["avgRating"]
    department_id = professor_data["departmentId"]
    is_prof_current_user = professor_data["isProfCurrentUser"]
    avg_difficulty = professor_data["avgDifficulty"]
    would_take_again_percent = professor_data["wouldTakeAgainPercent"]
    
    # School details
    school_data = professor_data['school']
    school = {
        "legacyId": school_data["legacyId"],
        "name": school_data["name"],
        "city": school_data["city"],
        "state": school_data["state"],
        "country": school_data["country"],
        "id": school_data["id"],
        "avgRating": school_data["avgRating"],
        "numRatings": school_data["numRatings"]
    }
    
    # Ratings distribution
    ratings_distribution = professor_data["ratingsDistribution"]
    
    # Related teachers
    related_teachers = professor_data["relatedTeachers"]
    
    # Course codes
    course_codes = professor_data["courseCodes"]
    
    # Ratings
    ratings_edges = professor_data["ratings"]["edges"]
    ratings = [{
        "comment": edge["node"]["comment"],
        "flagStatus": edge["node"]["flagStatus"],
        "createdByUser": edge["node"]["createdByUser"],
        "date": edge["node"]["date"],
        "class": edge["node"]["class"],
        "helpfulRating": edge["node"]["helpfulRating"],
        "clarityRating": edge["node"]["clarityRating"],
        "isForOnlineClass": edge["node"]["isForOnlineClass"],
        "difficultyRating": edge["node"]["difficultyRating"],
        "attendanceMandatory": edge["node"]["attendanceMandatory"],
        "textbookUse": edge["node"]["textbookUse"],
        "isForCredit": edge["node"]["isForCredit"]
    } for edge in ratings_edges]

    # Create the Professor object
    professor = Professor(
        id, legacy_id, first_name, last_name, department, school, lock_status, is_saved,
        num_ratings, avg_rating, department_id, is_prof_current_user, avg_difficulty,
        would_take_again_percent, ratings_distribution, related_teachers, course_codes, ratings
    )
    return professor

# Professor Gist Class
class Professor_Gist:
    def __init__(self, avg_difficulty, avg_rating, department, first_name, id, is_saved, last_name, legacy_id, num_ratings, school, would_take_again_percent):
        self.avg_difficulty = avg_difficulty
        self.avg_rating = avg_rating
        self.department = department
        self.first_name = first_name
        self.id = id
        self.is_saved = is_saved
        self.last_name = last_name
        self.legacy_id = legacy_id
        self.num_ratings = num_ratings
        self.school = school
        self.would_take_again_percent = would_take_again_percent

    @staticmethod
    def from_json(json_data):
        return Professor_Gist(
            json_data['avgDifficulty'],
            json_data['avgRating'],
            json_data['department'],
            json_data['firstName'],
            json_data['id'],
            json_data['isSaved'],
            json_data['lastName'],
            json_data['legacyId'],
            json_data['numRatings'],
            json_data['school'],
            json_data['wouldTakeAgainPercent']
        )

    def __repr__(self):
        return (f"Professor({self.first_name} {self.last_name}, Professor_ID : {self.legacy_id}, Department: {self.department}, "
                f"School: {self.school['name']}, Avg Rating: {self.avg_rating}, "
                f"Avg Difficulty: {self.avg_difficulty}, Num Ratings: {self.num_ratings}, "
                f"Would Take Again: {self.would_take_again_percent}%)")

def parse_professor_gist(json_data):

    professor = Professor_Gist.from_json(json_data)
    
    return professor