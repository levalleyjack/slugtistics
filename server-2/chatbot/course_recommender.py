import json
from typing import Dict, List
from models.data_models import CourseModel
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv
import os
load_dotenv()


class CourseRecommender:
    def __init__(self, courses: List[CourseModel]):
        # Load environment variables from .env file
        api_key = os.getenv("API_KEY")
        genai.configure(api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')


        self.chroma_client = chromadb.Client()


        #chromadb client has its own embedding service

        self.collection = self.chroma_client.create_collection("courses")
        self._load_courses(courses)
    def _load_courses(self, courses: List[CourseModel]):       
        #this embeds all of the courses and ratings/gpa, prereqs, and if it is open/waitlist/closed

        documents = []
        metadatas = []
        ids = []
        for i, course in enumerate(courses):
            
            doc = f"{course.subject} {course.catalog_num}: {course.name}. {course.enrollment_reqs}"
            metadata = {
                "subject":course.subject,
                "name": course.name,
                "catalog_num": course.catalog_num,
                "instructor":course.instructor,
                "rating": (float(course.instructor_ratings['avg_rating']) if course.instructor_ratings is not None and 'avg_rating' in course.instructor_ratings else 0),
                "gpa": (float(course.gpa) if course.gpa is not None else 0),
                "requirements": course.enrollment_reqs,
                "status":course.class_status
            }
            documents.append(doc)
            metadatas.append(metadata)
            ids.append(f"course_{i}")
        self.collection.add(documents=documents, metadatas=metadatas, ids=ids)
    def get_recommendations(self, transcript: List) -> Dict:

    #unique courses

        taken_courses = set(transcript)

        #getting similar courses
        results = self.collection.query(
        query_texts=[" ".join(transcript)],
        where={
            "$and": [
                # Only CSE or MATH courses
                {"$or": [
                    {"subject": "CSE"},
                    {"subject": "MATH"}
                ]},
                # Only open or waitlist status
                {"$or": [
                    {"status": "Open"},
                    {"status": "Wait List"}
                ]}
            ]
        },
        n_results=8
    )
        

        filtered = []
        for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
            course_code = f"{metadata['subject']} {metadata['catalog_num']}: {metadata["name"]}"
            if course_code not in taken_courses:
                filtered.append((doc, metadata))
        context = "Based on these relevant courses:\n\n"
        for doc, metadata in filtered:
            context += f"""
    - {metadata['subject']} {metadata['catalog_num']}
    Instructor: {metadata['instructor']} (Rating: {metadata['rating']})
    GPA: {metadata['gpa']}
    Requirements: {metadata['requirements']}
    Status: {metadata['status']}
    Details: {doc}
    """

        #prompt with explicit instructions not to recommend courses already taken.
        prompt = f"""Given a student's transcript (list of course codes): {transcript}

    {context}

    Recommend 2 specific courses they should take next that are NOT already present in their transcript. Ensure 100% that any recommended course is new to the student. If there are less than two, generate one or zero. DO NOT HALLUCINATE COURSES. For each course:
    1. Specify the exact course code (e.g., CSE 101)
    2. Explain why it's a good next step in their academic progression
    3. Note the best instructor based on ratings and GPA
    4. Consider prerequisites and course progression

    Format your response as JSON with this structure:
    {{
        "recommendations": [
            {{
                "course_code": "subject code",
                "reason": "explanation",
                "instructor": "name",
                "confidence": <0-1 score>
            }}
        ]
    }}"""

        response = self.model.generate_content(prompt)
        response_text = response.text.strip()
        if response_text.startswith("```json") and response_text.endswith("```"):
            response_text = response_text[7:-3].strip()
        recommendations = json.loads(response_text)

       
        return recommendations
