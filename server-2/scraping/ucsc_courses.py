from bs4 import BeautifulSoup
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class Course:
    def __init__(
        self,
        code=None,
        name=None,
        instructor=None,
        link=None,
        class_count=None,
        enroll_num=None,
        class_type=None,
        schedule=None,
        location=None,
        class_status=None,
        ge=None,
        description=None,
        class_notes=None,
        enrollment_reqs=None,
        discussion_sections=None,
        credits=None,
        career=None,
        grading=None,
        course_type=None,
    ):
        self.code = code
        self.name = name
        self.instructor = instructor
        self.link = link
        self.class_count = class_count
        self.enroll_num = enroll_num
        self.class_type = class_type
        self.schedule = schedule
        self.location = location
        self.class_status = class_status
        self.ge = ge
        self.description = description or ""
        self.class_notes = class_notes or ""
        self.enrollment_reqs = enrollment_reqs or ""
        self.discussion_sections = discussion_sections or []
        self.credits = credits
        self.career = career
        self.grading = grading
        self.course_type = course_type

    def to_dict(self):
        return {
            "code": self.code,
            "name": self.name,
            "instructor": self.instructor,
            "link": self.link,
            "class_count": self.class_count,
            "enroll_num": self.enroll_num,
            "class_type": self.class_type,
            "schedule": self.schedule,
            "location": self.location,
            "class_status": self.class_status,
            "ge": self.ge,
            "description": self.description,
            "class_notes": self.class_notes,
            "enrollment_reqs": self.enrollment_reqs,
            "discussion_sections": self.discussion_sections,
            "credits": self.credits,
            "career": self.career,
            "grading": self.grading,
            "course_type": self.course_type,
        }


def create_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session



def parse_course_panel(panel):
    link_element = panel.find("a")
    relative_url = link_element["href"]
    link_url = f"https://pisa.ucsc.edu/class_search/{relative_url}"

    full_text = link_element.text.strip()
    parts = full_text.split(" - ", 1)
    class_code = parts[0].strip()
    class_name = parts[1].strip() if len(parts) > 1 else ""
    class_name = " ".join(word for word in class_name.split() if not word[0].isdigit())

    status_element = panel.find("span", class_="sr-only")
    class_status = status_element.text if status_element else "Unknown"

    cols = panel.find_all("div", class_=["col-xs-6 col-sm-3", "col-xs-6 col-sm-6"])

    enroll_num = None
    for col in cols:
        if "Class Number: " in col.text:
            enroll_num = col.text.replace("Class Number: ", "").strip()
            break

    teacher_name = "Staff"
    for col in cols:
        if "Instructor: " in col.text:
            teacher_name = col.text.replace("Instructor: ", "").strip()
            if "," in teacher_name:
                names = teacher_name.split(",")
                teacher_name = f"{names[1].strip()} {names[0].strip()}"
            break

    class_type = ""
    hide_print_divs = panel.find_all("div", class_="col-xs-6 col-sm-3 hide-print")
    for div in hide_print_divs:
        if "Instruction Mode:" in div.text:
            class_type = div.find("b").text.strip()
            break

    class_count = "N/A"
    for col in cols:
        count_text = col.text.strip()
        if "Enrolled" in count_text:
            try:
                nums = [int(s) for s in count_text.split() if s.isdigit()]
                if len(nums) >= 2:
                    class_count = f"{nums[0]}/{nums[1]}"
            except (ValueError, IndexError):
                pass
            break

    schedule = "Asynchronous"
    for col in cols:
        if "Day and Time: " in col.text:
            schedule_text = col.text.replace("Day and Time: ", "").strip()
            schedule = schedule_text if schedule_text else "Asynchronous"
            break

    location = ""
    for col in cols:
        if "Location: " in col.text:
            location = col.text.replace("Location: ", "").strip()
            break

    return Course(
        code=class_code,
        name=class_name,
        instructor=teacher_name,
        link=link_url,
        class_count=class_count,
        enroll_num=enroll_num,
        class_type=class_type,
        schedule=schedule,
        location=location,
        class_status=class_status,
    )



def process_course_page(session, url):
    course_details = {
        "description": "",
        "class_notes": "",
        "enrollment_reqs": "",
        "discussion_sections": [],
        "general_education": None,
        "credits": None,
        "career": None,
        "grading": None,
        "type": None,
    }

    try:
        response = session.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        panels = soup.find_all("div", class_="panel panel-default row")

        for panel in panels:
            header = None
            header_div = panel.find("div", class_="panel-heading panel-heading-custom")

            if header_div:
                header_elem = header_div.find("h2")
                if header_elem:
                    header = header_elem.text.strip()
            else:
                header_elem = panel.find("h2")
                if header_elem:
                    header = header_elem.text.strip()

            if not header:
                continue

            panel_body = panel.find(class_="panel-body")
            if not panel_body:
                continue

            if "Associated Discussion Sections or Labs" in header:
                discussion_sections = []
                section_divs = panel_body.find_all("div", class_="col-xs-6 col-sm-3")

                for i in range(0, len(section_divs), 7):
                    section_group = section_divs[i : i + 7]
                    if len(section_group) == 7:
                        try:
                            section_code = section_group[0].text.strip()
                            enroll_num = section_code.split()[0].replace("#", "")
                            code = " ".join(section_code.split()[1:])

                            section = {
                                "code": code,
                                "enroll_num": enroll_num,
                                "schedule": section_group[1].text.strip(),
                                "instructor": section_group[2].text.strip(),
                                "location": section_group[3]
                                .text.replace("Loc: ", "")
                                .strip(),
                                "class_count": section_group[4]
                                .text.replace("Enrl: ", "")
                                .strip(),
                                "wait_count": section_group[5]
                                .text.replace("Wait: ", "")
                                .strip(),
                                "class_status": section_group[6].text.strip(),
                            }
                            discussion_sections.append(section)
                        except Exception:
                            continue

                course_details["discussion_sections"] = discussion_sections

            elif panels.index(panel) == 0:  # First panel contains course info
                dl_elements = panel_body.find_all(class_="dl-horizontal")
                for dl in dl_elements:
                    dt_elements = dl.find_all("dt")
                    dd_elements = dl.find_all("dd")

                    for dt, dd in zip(dt_elements, dd_elements):
                        label = dt.text.strip()
                        value = dd.text.strip()

                        if label == "Credits":
                            course_details["credits"] = (
                                value.replace(" units", "").replace("units", "").strip()
                            )
                        elif label == "Career":
                            course_details["career"] = value
                        elif label == "General Education":
                            course_details["general_education"] = value
                        elif label == "Grading":
                            course_details["grading"] = value
                        elif label == "Type":
                            course_details["type"] = value

            elif "Description" in header:
                course_details["description"] = panel_body.text.strip()
            elif "Class Notes" in header:
                course_details["class_notes"] = panel_body.text.strip()
            elif "Enrollment Requirements" in header:
                course_details["enrollment_reqs"] = panel_body.text.strip()

    except Exception as e:
        print(f"Error processing course page: {e}")

    return course_details

def scrape_all_courses():
    session = create_session()
    course_list = []
    page = 1
    count = 0

    try:
        response = session.get("https://pisa.ucsc.edu/class_search/")
        soup = BeautifulSoup(response.text, "html.parser")

        data = {
            "action": "results",
            "binds[:term]": 2252,
            "binds[:reg_status]": "all",
            "binds[:subject]": "",
            "binds[:ge]": "",
            "binds[:crse_units]": "",
            "binds[:instrct_mode]": "",
            "rec_dur": 2000,  # Increase this to fetch more courses per request
        }

        while True:
            response = session.post(
                "https://pisa.ucsc.edu/class_search/index.php", data=data
            )
            soup = BeautifulSoup(response.text, "html.parser")

            # Process the current page
            course_panels = soup.find_all("div", class_="panel panel-default row")

            if not course_panels:
                print(f"No courses found on page {page}. Ending search.")
                break
            for panel in course_panels:
                course = parse_course_panel(panel)
                if course:
                    course_details = process_course_page(session, course.link)
                    course.description = course_details.get("description", "")
                    course.class_notes = course_details.get("class_notes", "")
                    course.enrollment_reqs = course_details.get("enrollment_reqs", "")
                    course.discussion_sections = course_details.get(
                        "discussion_sections", []
                    )
                    course.ge = course_details.get("general_education")
                    course.credits = course_details.get("credits")
                    course.career = course_details.get("career")
                    course.grading = course_details.get("grading")
                    course.course_type = course_details.get("type")
                    course_list.append(course)

            next_button = soup.find("a", {"onclick": lambda x: x and "next" in x})
            if not next_button:
                print(f"No next button found on page {page}. Ending search.")
                break

            # Prepare for the next page
            data["action"] = "next"
            page += 1

    except Exception as e:
        print(f"Error scraping all courses: {e}")

    print(f"Finished scraping. Total courses found: {len(course_list)}")
    return course_list



def scrape_count():
    session = create_session()
    course_list = []
    page = 1
    count = 0

    try:
        response = session.get("https://pisa.ucsc.edu/class_search/")
        soup = BeautifulSoup(response.text, "html.parser")

        data = {
            "action": "results",
            "binds[:term]": 2252,
            "binds[:reg_status]": "all",
            "binds[:subject]": "",
            "binds[:ge]": "",
            "binds[:crse_units]": "",
            "binds[:instrct_mode]": "",
            "rec_dur": 2000,  # Increase this to fetch more courses per request
        }

        while True:
            response = session.post(
                "https://pisa.ucsc.edu/class_search/index.php", data=data
            )
            soup = BeautifulSoup(response.text, "html.parser")

            #process current page
            course_panels = soup.find_all("div", class_="panel panel-default row")

            if not course_panels:
                print(f"No courses found on page {page}. Ending search.")
                break
            for panel in course_panels:
                course = reduced_parse_course_panel(panel)
                if course:
                    course_details = reduced_process_course_page(session, course.link)
                    course.discussion_sections = course_details.get(
                        "discussion_sections", []
                    )
                    course_list.append(course)

            next_button = soup.find("a", {"onclick": lambda x: x and "next" in x})
            if not next_button:
                print(f"No next button found on page {page}. Ending search.")
                break

            
            data["action"] = "next"
            page += 1

    except Exception as e:
        print(f"Error scraping all courses: {e}")

    print(f"Finished scraping. Total courses found: {len(course_list)}")
    return course_list

def reduced_process_course_page(session, url):
    course_details = {
        "discussion_sections": [],
    }

    try:
        response = session.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        panels = soup.find_all("div", class_="panel panel-default row")

        for panel in panels:
            header = None
            header_div = panel.find("div", class_="panel-heading panel-heading-custom")

            if header_div:
                header_elem = header_div.find("h2")
                if header_elem:
                    header = header_elem.text.strip()
            else:
                header_elem = panel.find("h2")
                if header_elem:
                    header = header_elem.text.strip()

            if not header:
                continue

            panel_body = panel.find(class_="panel-body")
            if not panel_body:
                continue

            if "Associated Discussion Sections or Labs" in header:
                discussion_sections = []
                section_divs = panel_body.find_all("div", class_="col-xs-6 col-sm-3")

                for i in range(0, len(section_divs), 7):
                    section_group = section_divs[i : i + 7]
                    if len(section_group) == 7:
                        try:
                            section_code = section_group[0].text.strip()
                            enroll_num = section_code.split()[0].replace("#", "")
                            code = " ".join(section_code.split()[1:])

                            section = {
                                "code": code,
                                "enroll_num": enroll_num,
                                "schedule": section_group[1].text.strip(),
                                "instructor": section_group[2].text.strip(),
                                "location": section_group[3]
                                .text.replace("Loc: ", "")
                                .strip(),
                                "class_count": section_group[4]
                                .text.replace("Enrl: ", "")
                                .strip(),
                                "wait_count": section_group[5]
                                .text.replace("Wait: ", "")
                                .strip(),
                                "class_status": section_group[6].text.strip(),
                            }
                            discussion_sections.append(section)
                        except Exception:
                            continue

                course_details["discussion_sections"] = discussion_sections
    except Exception as e:
        print(f"Error processing course page: {e}")
    return course_details


def reduced_parse_course_panel(panel):
    link_element = panel.find("a")
    relative_url = link_element["href"]
    link_url = f"https://pisa.ucsc.edu/class_search/{relative_url}"

    status_element = panel.find("span", class_="sr-only")
    class_status = status_element.text if status_element else "Unknown"

    cols = panel.find_all("div", class_=["col-xs-6 col-sm-3", "col-xs-6 col-sm-6"])

    enroll_num = None
    for col in cols:
        if "Class Number: " in col.text:
            enroll_num = col.text.replace("Class Number: ", "").strip()
            break


    class_count = "N/A"
    for col in cols:
        count_text = col.text.strip()
        if "Enrolled" in count_text:
            try:
                nums = [int(s) for s in count_text.split() if s.isdigit()]
                if len(nums) >= 2:
                    class_count = f"{nums[0]}/{nums[1]}"
            except (ValueError, IndexError):
                pass
            break

    return Course(
        link=link_url,
        class_count=class_count,
        enroll_num=enroll_num,
        class_status=class_status,
    )


if __name__ == "__main__":
    print("Starting scraping process...")

    # To scrape all courses
    courses = scrape_all_courses()
    print(f"Total courses scraped: {len(courses)}")

    # Alternatively, to scrape specific GE courses:
    # courses = get_courses(ge_choices)
    # print(f"Total GE courses scraped: {len(courses)}")
