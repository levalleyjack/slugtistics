from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from course import Course
import concurrent.futures
import threading
import time

class WebDriverManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.driver_pool = []
        self.max_drivers = 1

    def get_driver(self):
        with self.lock:
            if self.driver_pool:
                return self.driver_pool.pop()
            elif len(self.driver_pool) < self.max_drivers:
                return self.create_driver()
            else:
                return None

    def create_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--remote-debugging-port=9222")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-setuid-sandbox")
        
        return webdriver.Chrome(options=chrome_options)

    def return_driver(self, driver):
        with self.lock:
            self.driver_pool.append(driver)

    def close_all(self):
        with self.lock:
            for driver in self.driver_pool:
                driver.quit()
            self.driver_pool.clear()

driver_manager = WebDriverManager()

def wait_for_element(driver, by, value, timeout=10):
    ignored_exceptions = (NoSuchElementException, StaleElementReferenceException)
    wait = WebDriverWait(driver, timeout, ignored_exceptions=ignored_exceptions)
    return wait.until(EC.presence_of_element_located((by, value)))

def wait_for_elements(driver, by, value, timeout=10):
    ignored_exceptions = (NoSuchElementException, StaleElementReferenceException)
    wait = WebDriverWait(driver, timeout, ignored_exceptions=ignored_exceptions)
    return wait.until(EC.presence_of_all_elements_located((by, value)))

def get_text_safely(element, selector, prefix="", index=0):
    try:
        text = element.find_elements(By.CSS_SELECTOR, selector)[index].text
        return text.replace(prefix, "").replace('\n', ' ').strip()
    except (IndexError, StaleElementReferenceException):
        return ""

def process_page(driver, class_list,ge):
    try:
        class_rows = wait_for_elements(driver, By.CSS_SELECTOR, 'div.panel.panel-default.row')

        for row in class_rows:
            try:
                link_element = wait_for_element(row, By.TAG_NAME, 'a')
                link_url = link_element.get_attribute('href')
                link_text = link_element.text.split("   ")
                class_code = link_text[0].split(" - ")[0]
                class_name = link_text[1] if len(link_text) > 1 else ""
                status_element = row.find_element(By.XPATH, ".//span[@class='sr-only']")
                class_status = status_element.text if status_element else "Unknown"
                enroll_num = get_text_safely(row, 'div.col-xs-6.col-sm-3', "Class Number: ")
                print(class_status)
                teacher_name = get_text_safely(row, 'div.col-xs-6.col-sm-3', "Instructor: ", 1)
                teacher_name = teacher_name.split(": ")[1]
                names = teacher_name.split(",")
                teacher_name = names[1].strip() + " " + names[0].strip() if len(names) > 1 else teacher_name
                
                class_type = get_text_safely(row, 'div.col-xs-6.col-sm-3.hide-print', "Instruction Mode: ", 2)
                class_type = class_type.split("Instruction Mode: ")[1]
                
                # Handle class count
                class_count_text = get_text_safely(row, 'div.col-xs-6.col-sm-3', index=2)
                try:
                    enrolled, total = map(int, class_count_text.split(" ")[0:3:2])
                    class_count = f"{enrolled}/{total}"
                except (ValueError, IndexError):
                    class_count = "N/A"

                
                schedule = get_text_safely(row, 'div.col-xs-6.col-sm-6', "Day and Time: ", 1)
                if "Day and Time: " in schedule:
                    schedule = schedule.split("Day and Time: ")[1] or "Asynchronous"
                else:
                    schedule = "Asynchronous"
                location = get_text_safely(row, 'div.col-xs-6.col-sm-6', "Location: ")
                location = location.split("Location: ")[1]
                

                class_list.append(Course(
                    ge = ge,
                    code=class_code,
                    name=class_name,
                    instructor=teacher_name,
                    link=link_url,
                    class_count=class_count,
                    enroll_num=enroll_num,
                    class_type=class_type,
                    schedule=schedule,
                    location=location,
                    class_status=class_status.lower()
                ))

            except Exception as e:
                print(f"Error processing row: {e}")
                continue

        return True
    except Exception as e:
        print(f"Error processing page: {e}")
        return False

def scrape_courses(ge_choice):
    driver = driver_manager.get_driver()
    if not driver:
        print(f"No available driver for {ge_choice}. Skipping.")
        return []

    class_list = []
    max_retries = 1

    try:
        driver.get("https://pisa.ucsc.edu/class_search/index.php")

        term_dropdown = wait_for_element(driver, By.ID, 'term_dropdown')
        selected_option = term_dropdown.find_element(By.CSS_SELECTOR, 'option:checked')
        print(f"Current Quarter: {selected_option.text}")
        class_dropdown = wait_for_element(driver, By.ID, 'reg_status')
        class_dropdown.click()
        class_option = wait_for_element(driver, By.XPATH, f"//option[@value='all']")
        class_option.click()
        
        

        ge_dropdown = wait_for_element(driver, By.ID, 'ge')
        ge_dropdown.click()
        
        ge_option = wait_for_element(driver, By.XPATH, f"//option[@value='{ge_choice}']")
        ge_option.click()

        submit_button = wait_for_element(driver, By.XPATH, "//input[@type='submit' and @value='Search']")
        submit_button.click()

        while True:
            retry_count = 0
            while retry_count < max_retries:
                try:
                    if process_page(driver, class_list, ge_choice):
                        break
                    retry_count += 1
                    time.sleep(1)
                except Exception as e:
                    print(f"Error on attempt {retry_count + 1}: {e}")
                    retry_count += 1
                    if retry_count == max_retries:
                        raise

            try:
                next_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//a[contains(@onclick, 'next')]"))
                )
                next_button.click()
                time.sleep(1)  
            except Exception:
                break

    except Exception as e:
        print(f"An error occurred while scraping {ge_choice}: {e}")
    finally:
        driver_manager.return_driver(driver)

    return class_list

def get_courses(ge_choices):
    all_courses = []
    max_retries = 3
    retry_delay = 5

    with concurrent.futures.ThreadPoolExecutor(max_workers=driver_manager.max_drivers) as executor:
        future_to_ge = {executor.submit(scrape_courses, ge): ge for ge in ge_choices}
        for future in concurrent.futures.as_completed(future_to_ge):
            ge = future_to_ge[future]
            for attempt in range(max_retries):
                try:
                    courses = future.result()
                    all_courses.extend(courses)
                    print(f"Finished scraping {ge} courses. Total courses: {len(courses)}")
                    break
                except Exception as exc:
                    print(f'{ge} generated an exception on attempt {attempt + 1}: {exc}')
                    if attempt < max_retries - 1:
                        print(f"Retrying {ge} in {retry_delay} seconds...")
                        time.sleep(retry_delay)
                    else:
                        print(f"Failed to scrape {ge} after {max_retries} attempts.")

    driver_manager.close_all()
    return all_courses

if __name__ == "__main__":
    ge_choices = ["CC", "ER", "IM", "MF", "SI", "SR", "TA", "PE-E", "PE-H", "PE-T", "PR-E", "PR-C", "PR-S", "C1", "C2"]
    print("Starting scraping process...")
    courses = get_courses(ge_choices)
    print(f"Total courses scraped: {len(courses)}")