import os
from openai import OpenAI
from openai import RateLimitError, APIError, APIConnectionError
from .geo_apify import *
from django.http import JsonResponse
from cerebras.cloud.sdk import Cerebras

Api = os.getenv("API_KEY")
prompt = "You are an administrator for a job finder website designed to help high school students find jobs. Your task is to grade how obtainable a job is for high school students on a scale from 1 to 75. The final score should reflect only how attainable the job is, without considering location (location accounts for an additional 25 points, calculated separately).Scoring Criteria:Education Requirements (High Weight): Jobs requiring little to no formal education should score higher. Positions demanding higher education (e.g., college degrees) should be heavily penalized.Typical High School Job (Moderate Weight): If the job is common for high school students (e.g., retail, food service, internships), it should score higher.Experience Requirements (Moderate Weight): Jobs requiring little to no prior work experience should score higher. If minimal experience is needed but attainable through extracurriculars, minor deductions apply.Age Restrictions (Moderate Weight): Jobs with strict age requirements (e.g., must be 18+) should have points deducted.Job Complexity (Low Weight): Highly technical or specialized jobs should lose some points, but only slightly, as long as they remain attainable.Work Hours (Moderate Weight): Jobs requiring work during typical school hours should lose points unless flexible scheduling is mentioned.IMPORTANT:ONLY OUTPUT A SINGLE INTEGER BETWEEN 1 AND 75.DO NOT include any text, explanations, or additional details—ONLY the integer.IF YOU DO INCLUDE ANY DETAILS  OTHER THAN THE INTEGER YOU WILL BE TERMINATED NO MATTER THE CIRCUMSTANCES SO ONLY OUT PUT AN INTTEGER. You must fully reason through all relevant factors to determine the most accurate score, but DO NOT include your reasoning in the output.Focus solely on obtainability, not pay, soft skills, demand, or location.Assume the student has minimal job experience but strong extracurricular involvement and basic job-ready skills.The job description may be unstructured, so interpret details flexibly.Example Outputs:A typical part-time retail job with no education or experience requirements: 75A full-time office job requiring a college degree: 15A seasonal lifeguard job requiring certification and age 18+: 50- Here is the Job to be grader: "

# Initialize Cerebras client
client = Cerebras(
    api_key=Api,
)

# Initialize with a default response in case of API failure
try:
    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": prompt
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
except Exception as e:
    print(f"Warning: Unexpected error in initial API call: {str(e)}")
    completion = None

def grade_job(job_posting):
    global prompt
    try:
        stream = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt + job_posting.description
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
        
        grade = int(full_response.replace("*",""))
    except (RateLimitError, APIError, APIConnectionError) as e:
        print(f"API error in grade_job: {str(e)}")
        grade = 50  # Default middle grade if API fails
    except Exception as e:
        print(f"Unexpected error in grade_job: {str(e)}")
        grade = 50  # Default middle grade for any other error

    try:
        travel_time = get_travel_time(job_posting.location, "3900 E Raab Rd, Normal, IL 61761")
        travel_grade = 0
        if travel_time > 15:
            travel_grade += 25 - (2*(25 - travel_time))
            if travel_grade < 0:
                travel_grade = 0
        else:
            travel_grade += 25
    except Exception as e:
        print(f"Error calculating travel grade: {str(e)}")
        travel_grade = 25  # Default middle travel grade if calculation fails

    return grade + travel_grade

def grade_job_lv(request):
    global prompt
    description = request.GET.get("description", "") 
    location = request.GET.get("location")
    
    try:
        stream = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt + description
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
        
        grade = int(full_response.replace("*",""))
    except (RateLimitError, APIError, APIConnectionError) as e:
        print(f"API error in grade_job_lv: {str(e)}")
        grade = 50  # Default middle grade if API fails
    except Exception as e:
        print(f"Unexpected error in grade_job_lv: {str(e)}")
        grade = 50  # Default middle grade for any other error

    try:
        travel_time = get_travel_time(location, "3900 E Raab Rd, Normal, IL 61761")
        travel_grade = 0
        if travel_time > 15:
            travel_grade += 25 - (2*(25 - travel_time))
            if travel_grade < 0:
                travel_grade = 0
        else:
            travel_grade += 25
    except Exception as e:
        print(f"Error calculating travel grade: {str(e)}")
        travel_grade = 25  # Default middle travel grade if calculation fails
    
    total_grade = grade + travel_grade
    print(total_grade)
    return JsonResponse({
        'grade': total_grade
    })