import json
from typing import List, Dict, Any, Optional



# Sample JSON string (correct the format)
json_string = '''{
    "data": {
        "school": {
            "__typename": "School",
            "avgRating": 4.39344,
            "avgRatingRounded": 4.4,
            "city": "Los Angeles",
            "country": "0-US-United States",
            "id": "U2Nob29sLTEzODE=",
            "legacyId": 1381,
            "name": "University of Southern California",
            "numRatings": 611,
            "ratings": {
                "edges": [
                    {
                        "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
                        "node": {
                            "__typename": "SchoolRating",
                            "clubsRating": 4,
                            "comment": "Love USC",
                            "createdByUser": false,
                            "date": "2024-06-04 08:54:16 +0000 UTC",
                            "facilitiesRating": "4",
                            "flagStatus": "UNFLAGGED",
                            "foodRating": 3,
                            "happinessRating": 5,
                            "id": "U2Nob29sUmF0aW5nLTQ5OTcwNA==",
                            "internetRating": 5,
                            "legacyId": 499704,
                            "locationRating": 4,
                            "opportunitiesRating": 5,
                            "reputationRating": 5,
                            "safetyRating": 3,
                            "socialRating": 5,
                            "thumbsDownTotal": null,
                            "thumbsUpTotal": null,
                            "userThumbs": []
                        }
                    },
                    {
                        "cursor": "YXJyYXljb25uZWN0aW9uOjE=",
                        "node": {
                            "__typename": "SchoolRating",
                            "clubsRating": 5,
                            "comment": "A fantastic school all things considered if you can afford it. Vibrant social and academic scenes, there is a niche for everyone here. So glad I chose to come and proud to be a trojan for life.",
                            "createdByUser": false,
                            "date": "2024-05-07 11:38:54 +0000 UTC",
                            "facilitiesRating": "5",
                            "flagStatus": "UNFLAGGED",
                            "foodRating": 4,
                            "happinessRating": 5,
                            "id": "U2Nob29sUmF0aW5nLTQ5NjgzOA==",
                            "internetRating": 5,
                            "legacyId": 496838,
                            "locationRating": 4,
                            "opportunitiesRating": 5,
                            "reputationRating": 5,
                            "safetyRating": 4,
                            "socialRating": 5,
                            "thumbsDownTotal": null,
                            "thumbsUpTotal": null,
                            "userThumbs": []
                        }
                    },
                    {
                        "cursor": "YXJyYXljb25uZWN0aW9uOjI=",
                        "node": {
                            "__typename": "SchoolRating",
                            "clubsRating": 4,
                            "comment": "great school, terrible area",
                            "createdByUser": false,
                            "date": "2024-05-06 01:14:51 +0000 UTC",
                            "facilitiesRating": "4",
                            "flagStatus": "UNFLAGGED",
                            "foodRating": 3,
                            "happinessRating": 5,
                            "id": "U2Nob29sUmF0aW5nLTQ5NjU2OQ==",
                            "internetRating": 3,
                            "legacyId": 496569,
                            "locationRating": 2,
                            "opportunitiesRating": 5,
                            "reputationRating": 5,
                            "safetyRating": 2,
                            "socialRating": 5,
                            "thumbsDownTotal": null,
                            "thumbsUpTotal": null,
                            "userThumbs": []
                        }
                    },
                    {
                        "cursor": "YXJyYXljb25uZWN0aW9uOjM=",
                        "node": {
                            "__typename": "SchoolRating",
                            "clubsRating":5,
                            "comment": "Overall great experience here at USC. Although it is competitive, there are opportunities.",
                            "createdByUser": false,
                            "date": "2024-04-25 19:34:09 +0000 UTC",
                            "facilitiesRating": "5",
                            "flagStatus": "UNFLAGGED",
                            "foodRating":5,
                            "happinessRating":5,
                            "id": "U2Nob29sUmF0aW5nLTQ5NTAxOQ==",
                            "internetRating":5,
                            "legacyId":495019,
                            "locationRating":5,
                            "opportunitiesRating":5,
                            "reputationRating":5,
                            "safetyRating":5,
                            "socialRating":5,
                            "thumbsDownTotal":null,
                            "thumbsUpTotal":null,
                            "userThumbs":[]
                        }
                    }
                ],
                "pageInfo": {
                    "endCursor":"YXJyYXljb25uZWN0aW9uOjE5",
                   "hasNextPage":true
                }
            },
            "state":"CA",
            "summary":{
                "campusCondition":4.6454,
                "campusLocation":3.8415,
                "careerOpportunities":4.7059,
                "clubAndEventActivities":4.5082,
                "foodQuality":3.9592,
                "internetSpeed":4.1716,
                "schoolReputation":4.6471,
                "schoolSafety":3.5535,
                "schoolSatisfaction":4.6062,
                "socialActivities":4.5866
            }
        }
    }
}'''

# Parse JSON
json_data = json.loads(json_string)

# Parse school data
school = parse_school(json_data)

# Print school details
print(school)