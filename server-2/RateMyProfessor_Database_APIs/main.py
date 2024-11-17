import requests
from tqdm import tqdm

from .helper_queries import fetch_a_professors_query_string, fetch_professors_single_page_query_string, fetch_a_school_query_string
from .helper_functions import get_professor_unique_id, get_school_unique_id
from .helper_classes import parse_professor, parse_school, parse_professor_gist

GRAPHQL_ENDPOINT = 'https://www.ratemyprofessors.com/graphql'

HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "Content-Type": "application/json"
}

# Helper functions
def fetch_professors_in_a_page(count, cursor, query, school_id):

    FETCH_ALL_TEACHERS_HEADERS = HEADERS.copy()

    FETCH_ALL_TEACHERS_HEADERS["Referer"] = f"https://www.ratemyprofessors.com/search/professors/{school_id}?q=*"

    query_string = fetch_professors_single_page_query_string
    
    variables = {
        "count": count,
        "cursor": cursor,
        "query": query
    }

    response = requests.post(
        GRAPHQL_ENDPOINT,
        json={'query': query_string, 'variables': variables},
        headers=FETCH_ALL_TEACHERS_HEADERS
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with status code {response.status_code}: {response.content}")



# {Exposed Functions} ---------------

def search_professor(school_id : str or int, prof_name: str):
    if not school_id:
        raise ValueError("school_id cannot be empty")
    if not prof_name or not isinstance(prof_name, str):
        raise ValueError("prof_name must be a non-empty string")

    has_next_page = True
    cursor = None
    batch_size = 500  
    prof_name = prof_name.lower().strip()  


    query = {
        "text": prof_name,  
        "schoolID": get_school_unique_id(school_id),
        "fallback": True,
        "departmentID": None
    }

    
    with tqdm(desc="Searching for professor") as progress_bar:
        while has_next_page:
            try:
                result = fetch_professors_in_a_page(
                    count=batch_size,
                    cursor=cursor,
                    query=query,
                    school_id=school_id
                )
                
                if progress_bar.total is None:
                    total_teachers = result["data"]["search"]["teachers"]["resultCount"]
                    progress_bar.total = total_teachers

                # Process current batch
                teachers_batch = result["data"]["search"]["teachers"]["edges"]
                progress_bar.update(len(teachers_batch))

                for professor in teachers_batch:
                    prof_data = parse_professor_gist(professor['node'])
                    
                    if prof_name in (prof_data.first_name + " " + prof_data.last_name).lower():
                        print(prof_data.legacy_id)
                        prof_data=fetch_a_professor(prof_data.legacy_id)
                        progress_bar.close()
                        return prof_data

                page_info = result["data"]["search"]["teachers"]["pageInfo"]
                has_next_page = page_info["hasNextPage"]
                cursor = page_info["endCursor"]

            except Exception as e:
                progress_bar.close()
                raise RuntimeError(f"Error fetching professor data: {str(e)}")

    return None

# Fetch all the professors from a schoo
# l
def fetch_all_professors_from_a_school(school_id : str or int):
    """
    [TODO] : Write description

    """
    has_next_page = True
    cursor = None
    all_professors_raw = []

    # [TODO] Find a optimal batch size number
    batch_size = 500

    query = {
        "text": "",
        "schoolID": get_school_unique_id(school_id),
        "fallback": True,
        "departmentID": None
    }

    total_teachers = None

    while has_next_page:
        result = fetch_professors_in_a_page(count=batch_size, cursor=cursor, query=query, school_id=school_id)
        teachers_batch = result["data"]["search"]["teachers"]["edges"]

        if total_teachers is None:
            total_teachers = result["data"]["search"]["teachers"]["resultCount"]
            progress_bar = tqdm(total = total_teachers, desc="Fetching teachers")

        all_professors_raw.extend(teachers_batch)
        progress_bar.update(len(teachers_batch))

        has_next_page = result["data"]["search"]["teachers"]["pageInfo"]["hasNextPage"]
        cursor = result["data"]["search"]["teachers"]["pageInfo"]["endCursor"]
    
    progress_bar.close()

    all_professors = []
    for professor in all_professors_raw:
        all_professors.append(parse_professor_gist(professor['node']))

    return all_professors

# Fetch a Professor
def fetch_a_professor(professor_id : str or int):

    """
    [TODO] : Write description

    """

    FETCH_A_PROFESSOR_HEADERS = HEADERS.copy()

    FETCH_A_PROFESSOR_HEADERS["Referer"] = f"https://www.ratemyprofessors.com/professor/{professor_id}"

    query_string = fetch_a_professors_query_string

    variables = {
        "id": get_professor_unique_id(professor_id)
    }

    response = requests.post(
        GRAPHQL_ENDPOINT,
        json={'query': query_string, 'variables': variables},
        headers=FETCH_A_PROFESSOR_HEADERS
    )
    
    if response.status_code == 200:
        return parse_professor(response.json())
    else:
        raise Exception(f"Query failed with status code {response.status_code}: {response.content}")

# Fetch a School
def fetch_a_school(school_id : str or int) :

    """
    [TODO] : Write description

    """
    FETCH_A_SCHOOL_HEADERS = HEADERS.copy()

    FETCH_A_SCHOOL_HEADERS["Referer"] = f"https://www.ratemyprofessors.com/school/{school_id}"

    query_string = fetch_a_school_query_string

    variables = {
        "id": get_school_unique_id(school_id)
    }

    response = requests.post(
        GRAPHQL_ENDPOINT,
        json={'query': query_string, 'variables': variables},
        headers=FETCH_A_SCHOOL_HEADERS
    )
    
    if response.status_code == 200:
        return parse_school(response.json())
    else:
        raise Exception(f"Query failed with status code {response.status_code}: {response.content}")



# Sample Usage
# if __name__ == '__main__':
#     try:
#         school_id = '1381'
#         all_professors = fetch_all_professors(school_id)
#         print(f"Fetched {len(all_professors)} professors")

#         for prof in all_professors[:10]:
#             print(parse_professor_gist(prof))
#             print("-----------------------")
            
#     except Exception as e:
#         print(f"An error occurred: {e}")


"""
Sample response 

Fetching teachers: 100%|█████████████████████████████████████████████████████████████████████████████████████████████████████| 4952/4952 [00:33<00:00, 149.33it/s]
Fetched 4952 professors
Professor(Anna Wyatt, Department: Economics, School: University of Southern California, Avg Rating: 0, Avg Difficulty: 0, Num Ratings: 0, Would Take Again: -1%)
-----------------------
Professor(Lewis Rothbart, Department: Communication, School: University of Southern California, Avg Rating: 0, Avg Difficulty: 0, Num Ratings: 0, Would Take Again: -1%)
-----------------------
Professor(John Swain, Department: East Asian Languages, School: University of Southern California, Avg Rating: 0, Avg Difficulty: 0, Num Ratings: 0, Would Take Again: -1%)
-----------------------
Professor(Sunkyung Kim, Department: Art History, School: University of Southern California, Avg Rating: 4.5, Avg Difficulty: 4, Num Ratings: 1, Would Take Again: -1%)
-----------------------
Professor(Rong Wang, Department: Communication, School: University of Southern California, Avg Rating: 0, Avg Difficulty: 0, Num Ratings: 0, Would Take Again: -1%)
-----------------------
Professor(Sandra Chrystal, Department: Business, School: University of Southern California, Avg Rating: 3.8, Avg Difficulty: 3.7, Num Ratings: 12, Would Take Again: -1%)
-----------------------
Professor(Faezah Bagheri-Tar, Department: Engineering, School: University of Southern California, Avg Rating: 0, Avg Difficulty: 0, Num Ratings: 0, Would Take Again: -1%)
-----------------------
"""