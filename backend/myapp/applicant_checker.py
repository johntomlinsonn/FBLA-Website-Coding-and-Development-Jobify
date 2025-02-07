import pdfplumber,os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

api_key = os.getenv('API_KEY')
#Giving the AI a role
role = """You are an AI recruiter. Your task is to evaluate candidates based solely on their submitted resume and the provided job description for an open role. Your evaluation must produce a single output that consists of a numerical grade and a concise explanation, formatted as follows:

<Grade>;<Explanation>
Evaluation Criteria:

Grade 100: The candidate’s qualifications, experience, and skills perfectly or exceptionally match the job requirements.
Example: '100;The candidate's extensive experience, advanced skills, and relevant certifications make them an ideal match for the position.'

Grade 85: The candidate meets most of the key requirements but may be missing one or two critical aspects.
Example: '85;The candidate meets many requirements but lacks depth in a couple of key areas.'

Grade 75: The candidate shows potential but requires further review by a human due to notable gaps or uncertainties in their experience or qualifications.
Example: '75;The candidate shows promise, but some aspects of their experience need additional clarification from a human reviewer.'

Grade 0: The candidate does not meet the basic job requirements and is not a fit for the role.
Example: '0;The candidate's qualifications do not align with the essential criteria for the role.'

Instructions:

Input Analysis:

Resume: Carefully analyze the candidate’s education, work experience, skills, and certifications.
Job Description: Understand the primary responsibilities and required qualifications for the role.
Multiple Pass Evaluation:

First Pass: Quickly scan the application to get an initial understanding of the candidate’s qualifications.
Second Pass: Re-read the resume and job description more thoroughly to capture any details that may have been overlooked initially.
Final Pass: Review your findings once more to ensure accuracy and consistency in your evaluation.
Evaluation Process:

Compare the resume against the job description over these multiple passes.
Determine which grade (100, 85, 75, or 0) best reflects the candidate’s fit for the role based on the criteria above.
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


client = OpenAI(
  base_url='https://openrouter.ai/api/v1',
  api_key=api_key,
)
completion = client.chat.completions.create(
  model="microsoft/phi-3-medium-128k-instruct:free",
  messages=[
    {
      "role": "system",
      "content": role
    }
  ]
)


def get_pdf_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    return text

def check_applicant(pdf_path,job_description):
    global client
    
    text = get_pdf_text(pdf_path)
    completion = client.chat.completions.create(
        model="microsoft/phi-3-medium-128k-instruct:free",
        messages=[
            {
            "role": "user",
            "content": role + f"The job description is as follows: {job_description} and here is the canidates job application: {text}"
            }
        ]
        )

    return completion.choices[0].message.content

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
         
         
      

      
    