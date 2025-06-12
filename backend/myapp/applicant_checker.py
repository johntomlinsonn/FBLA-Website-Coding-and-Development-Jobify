import pdfplumber,os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from openai import RateLimitError, APIError, APIConnectionError
import requests
from urllib.parse import urlparse
from io import BytesIO
import PyPDF2


api_key_me = os.getenv('API_KEY')
#Giving the AI a role
role = """You are an AI recruiter. Your task is to evaluate candidates based solely on their submitted resume and the provided job description for an open role. Your evaluation must produce a single output that consists of a numerical grade and a concise explanation, formatted as follows:

<Grade>;<Explanation>
Evaluation Criteria:

Grade 100: The candidate's qualifications, experience, and skills perfectly or exceptionally match the job requirements.
Example: '100;The candidate's extensive experience, advanced skills, and relevant certifications make them an ideal match for the position.'

Grade 85: The candidate meets most of the key requirements but may be missing one or two critical aspects.
Example: '85;The candidate meets many requirements but lacks depth in a couple of key areas.'

Grade 75: The candidate shows potential but requires further review by a human due to notable gaps or uncertainties in their experience or qualifications.
Example: '75;The candidate shows promise, but some aspects of their experience need additional clarification from a human reviewer.'

Grade 0: The candidate does not meet the basic job requirements and is not a fit for the role.
Example: '0;The candidate's qualifications do not align with the essential criteria for the role.'

Instructions:

Input Analysis:

Resume: Carefully analyze the candidate's education, work experience, skills, and certifications.
Job Description: Understand the primary responsibilities and required qualifications for the role.
Multiple Pass Evaluation:

First Pass: Quickly scan the application to get an initial understanding of the candidate's qualifications.
Second Pass: Re-read the resume and job description more thoroughly to capture any details that may have been overlooked initially.
Final Pass: Review your findings once more to ensure accuracy and consistency in your evaluation.
Evaluation Process:

Compare the resume against the job description over these multiple passes.
Determine which grade (100, 85, 75, or 0) best reflects the candidate's fit for the role based on the criteria above.
Provide a concise explanation justifying your grading decision in a single sentence.
Output Format:

Your final output must be on a single line, formatted as:
<Grade>;<Explanation>
There should be no additional punctuation or commentary beyond the grade, the semicolon, and the explanation.
Begin your evaluation by analyzing the provided resume and job description now.
Your response must be in this format: <Grade>;<Explanation>.
Here is the job desctiption and the resume
"""

#setting up client

from cerebras.cloud.sdk import Cerebras


# Initialize with a default response in case of API failure
try:
    client = Cerebras(
    api_key=api_key_me,  # This is the default and can be omitted
    
    )
    stream = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": role
        }
    ],
    model="llama-4-scout-17b-16e-instruct",
    stream=True,
    max_completion_tokens=16382,
    temperature=0.7,
    top_p=0.95
)
except (RateLimitError, APIError, APIConnectionError) as e:
    print(f"Warning: Initial API call failed: {str(e)}")
    completion = None

def get_pdf_text(pdf_path):
    try:
        # Handle Django FieldFile object
        if hasattr(pdf_path, 'path'):
            pdf_path = pdf_path.path
        elif hasattr(pdf_path, 'url'):
            pdf_path = pdf_path.url
        elif hasattr(pdf_path, 'file'):
            pdf_path = pdf_path.file

        # If it's a URL, download it first
        if isinstance(pdf_path, str) and pdf_path.startswith(('http://', 'https://')):
            response = requests.get(pdf_path)
            pdf_file = BytesIO(response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
        elif isinstance(pdf_path, str):
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF file not found at {pdf_path}")
            pdf_reader = PyPDF2.PdfReader(pdf_path)
        elif isinstance(pdf_path, BytesIO):
            pdf_reader = PyPDF2.PdfReader(pdf_path)
        else:
            raise ValueError(f"Unsupported PDF path type: {type(pdf_path)}")

        # Extract text from PDF
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

    except Exception as e:
        print(f"Error reading PDF: {str(e)}")
        return ""

import functools

@functools.cache
def check_applicant(pdf_path, job_description):
    global client
    
    text = get_pdf_text(pdf_path)
    try:
        stream = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": role + f"The job description is as follows: {job_description} and here is the canidates job application: {text}"
                }
            ],
            model="llama-4-scout-17b-16e-instruct",
            stream=True,
            max_completion_tokens=16382,
            temperature=0.7,
            top_p=0.95
        )
        
        # Collect the streamed response
        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                full_response += chunk.choices[0].delta.content
        
        return full_response
    except RateLimitError as e:
        print(f"Rate limit exceeded: {str(e)}")
        return "75;Rate limit exceeded. Please try again later or contact support."
    except APIError as e:
        print(f"API error occurred: {str(e)}")
        return "75;API error occurred. Please try again later or contact support."
    except APIConnectionError as e:
        print(f"Connection error: {str(e)}")
        return "75;Connection error. Please check your internet connection and try again."
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return "75;An unexpected error occurred. Please try again later or contact support."

def clean_grade(grade_response):
    grade = ""
    grade_done = False
    reason = ""
    for i in grade_response:
      if i == ";":
        grade_done = True
      if grade_done and i != ";":
        reason += i
      else:
        grade += i
    return grade,reason
         
         
      

      
    