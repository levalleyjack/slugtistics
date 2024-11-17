import requests
from lxml import html
import re
import json

# Function to fetch professor's unique id
def get_professor_unique_id(url_professor_id):

    url = 'https://www.ratemyprofessors.com/professor/' + str(url_professor_id)
    
    response = requests.get(url)

    if response.status_code == 200:

        tree = html.fromstring(response.content)
        
        # Use XPath to find the <script> tag containing 'window.__RELAY_STORE__'
        script_content = tree.xpath("//script[contains(text(), 'window.__RELAY_STORE__')]/text()")
        
        json_data = None
        
        if script_content:
            match = re.search(r'window\.__RELAY_STORE__ = (.*);', script_content[0])
            if match:
                json_data = match.group(1)
        
        if json_data:
            json_data = json.loads(json_data)

            for key, value in json_data.items():
                if isinstance(value, dict) and value.get('legacyId') == int(url_professor_id):
                    return key
            raise ValueError(f"Unique ID for numerical ID {numerical_id} not found.")

        else:
            print("JSON data not found.")
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")



# Function to fetch school's unique id
def get_school_unique_id(url_school_id):

    url = 'https://www.ratemyprofessors.com/school/' + str(url_school_id)
    
    response = requests.get(url)

    if response.status_code == 200:

        tree = html.fromstring(response.content)
        
        # Use XPath to find the <script> tag containing 'window.__RELAY_STORE__'
        script_content = tree.xpath("//script[contains(text(), 'window.__RELAY_STORE__')]/text()")
        
        json_data = None
        
        if script_content:
            match = re.search(r'window\.__RELAY_STORE__ = (.*);', script_content[0])
            if match:
                json_data = match.group(1)
        
        if json_data:
            json_data = json.loads(json_data)

            for key, value in json_data.items():
                if isinstance(value, dict) and value.get('legacyId') == int(url_school_id):
                    return key
            raise ValueError(f"Unique ID for numerical ID {numerical_id} not found.")

        else:
            print("JSON data not found.")
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
