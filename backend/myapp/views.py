from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .serializers import UserProfileSerializer, JobPostingSerializer, UserSerializer, ReferenceSerializer, EducationSerializer
import mimetypes
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from .forms import SignUpForm, SignInForm, UserProfileForm, ReferenceFormSet, EducationFormSet, JobPostingForm
from .models import UserProfile, Reference, Education, JobPosting
from django.db.models import Q
from django.core.mail import EmailMultiAlternatives
from dotenv import find_dotenv, load_dotenv
import os
from .geo_apify import *
from .applicant_checker import *
from .job_grade import *
from django.http import JsonResponse
from django.conf import settings
from django.core.serializers import serialize
import json
from openai import OpenAI, RateLimitError, APIError, APIConnectionError
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from cerebras.cloud.sdk import Cerebras
from rest_framework import status
from django.db.models.functions import TruncMonth
from django.db.models import Count, Avg
from datetime import datetime

Api = os.getenv("API_KEY")

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
                "content": "You are an administrator for a job finder website designed to help high school students find jobs. Your task is to grade how obtainable a job is for high school students on a scale from 1 to 75. The final score should reflect only how attainable the job is, without considering location (location accounts for an additional 25 points, calculated separately).Scoring Criteria:Education Requirements (High Weight): Jobs requiring little to no formal education should score higher. Positions demanding higher education (e.g., college degrees) should be heavily penalized.Typical High School Job (Moderate Weight): If the job is common for high school students (e.g., retail, food service, internships), it should score higher.Experience Requirements (Moderate Weight): Jobs requiring little to no prior work experience should score higher. If minimal experience is needed but attainable through extracurriculars, minor deductions apply.Age Restrictions (Moderate Weight): Jobs with strict age requirements (e.g., must be 18+) should have points deducted.Job Complexity (Low Weight): Highly technical or specialized jobs should lose some points, but only slightly, as long as they remain attainable.Work Hours (Moderate Weight): Jobs requiring work during typical school hours should lose points unless flexible scheduling is mentioned.IMPORTANT:ONLY OUTPUT A SINGLE INTEGER BETWEEN 1 AND 75.DO NOT include any text, explanations, or additional details—ONLY the integer.IF YOU DO INCLUDE ANY DETAILS  OTHER THAN THE INTEGER YOU WILL BE TERMINATED NO MATTER THE CIRCUMSTANCES SO ONLY OUT PUT AN INTTEGER. You must fully reason through all relevant factors to determine the most accurate score, but DO NOT include your reasoning in the output.Focus solely on obtainability, not pay, soft skills, demand, or location.Assume the student has minimal job experience but strong extracurricular involvement and basic job-ready skills.The job description may be unstructured, so interpret details flexibly.Example Outputs:A typical part-time retail job with no education or experience requirements: 75A full-time office job requiring a college degree: 15A seasonal lifeguard job requiring certification and age 18+: 50- Here is the Job to be grader: "
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

def index(request):
    return render(request, 'index.html')

@login_required
def account(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = UserProfile(user=request.user)
        profile.save()

    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        reference_formset = ReferenceFormSet(request.POST, queryset=Reference.objects.filter(user_profile=profile))
        education_formset = EducationFormSet(request.POST, queryset=Education.objects.filter(user_profile=profile))

        if form.is_valid():
            profile = form.save()  # Let the form handle the uploaded file

            # Save references
            if reference_formset.is_valid():
                for reference_form in reference_formset:
                    if reference_form.cleaned_data and not reference_form.cleaned_data.get('DELETE', False):
                        reference = reference_form.save(commit=False)
                        reference.user_profile = profile
                        reference.save()
            else:
                print(reference_formset.errors)

            # Save education
            if education_formset.is_valid():
                for education_form in education_formset:
                    if education_form.cleaned_data and not education_form.cleaned_data.get('DELETE', False):
                        education = education_form.save(commit=False)
                        education.user_profile = profile
                        education.save()
            else:
                print(education_formset.errors)

            return redirect('account')
        else:
            print(form.errors)
    else:
        form = UserProfileForm(instance=profile)
        reference_formset = ReferenceFormSet(queryset=Reference.objects.filter(user_profile=profile))
        education_formset = EducationFormSet(queryset=Education.objects.filter(user_profile=profile))

    return render(request, 'account.html', {
        'form': form,
        'reference_formset': reference_formset,
        'education_formset': education_formset,
    })

def postjob(request):
    #Checking if the request is a post request
    if request.method == 'POST':
        form = JobPostingForm(request.POST)
        #Checking if the form is valid
        if form.is_valid():
            #Saving all of the info from the form
            job_posting = form.save(commit=False)
            job_posting.user = request.user
            job_posting.status = 'pending'
            # Assign the list directly. The model's save method will handle JSON dumping.
            job_posting.requirements = form.cleaned_data['requirements']
            custom_questions = request.POST.getlist('custom_questions')
            # Assign the list directly. The model's save method will handle JSON dumping.
            job_posting.custom_questions = custom_questions
            job_posting.save()
            return redirect('index')
    else:
        #If the request is not a post request then it will render the form as empty
        form = JobPostingForm()
    return render(request, 'postjob.html', {'form': form})

def search(request):
    query = request.GET.get('search')
    sort_by = request.GET.get('sort', '-created_at')  # Default sort by newest
    
    # Map 'date_posted' to 'created_at' since that's the field we have in our model
    if 'date_posted' in sort_by:
        sort_by = sort_by.replace('date_posted', 'created_at')

    if query:
        job_postings = JobPosting.objects.filter(
            Q(title__icontains=query) |
            Q(company_name__icontains=query) |
            Q(location__icontains=query) |
            Q(salary__icontains=query) |
            Q(description__icontains=query) |
            Q(requirements__icontains=query),
            status='approved'
        )
    else:
        job_postings = JobPosting.objects.filter(status='approved')
    
    # Sort the results
    if sort_by == 'salary':
        job_postings = sorted(job_postings, key=lambda x: float(''.join(filter(str.isdigit, x.salary or '0'))) if x.salary else 0, reverse=True)
    else:
        job_postings = job_postings.order_by(sort_by)

    return render(request, 'search.html', {
        'job_postings': job_postings,
        'current_sort': sort_by,
        'current_search': query or '',
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) # Require authentication for both GET and POST
def api_job_list(request):
    """API endpoint for job search and creation"""
    if request.method == 'GET':
        # Start with approved job postings
        queryset = JobPosting.objects.filter(status='approved')
        print(f"Initial approved queryset count: {queryset.count()}")

        # Get query parameters
        search_term = request.query_params.get('search', None)
        job_types = request.query_params.getlist('job_type[]')
        companies = request.query_params.getlist('company[]')
        min_salary = request.query_params.get('min_salary', None)
        max_salary = request.query_params.get('max_salary', None)
        show_favorited_only = request.query_params.get('showFavoritedOnly', 'false').lower() == 'true'

        print(f"Received query params: search={search_term}, job_types={job_types}, companies={companies}, min_salary={min_salary}, max_salary={max_salary}, show_favorited_only={show_favorited_only}")

        # Build up a combined filter using Q objects
        combined_filters = Q()

        # Apply search filter
        if search_term:
            search_q = (
                Q(title__icontains=search_term) |
                Q(company_name__icontains=search_term) |
                Q(location__icontains=search_term) |
                Q(salary__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(requirements__icontains=search_term)
            )
            combined_filters &= search_q
            print(f"After applying search Q object: {queryset.filter(combined_filters).count()}")

        # Apply job type filter
        job_type_q = Q()
        if job_types:
            for job_type in job_types:
                job_type_q |= Q(job_type__icontains=job_type)
            combined_filters &= job_type_q
            print(f"After applying job type Q object ({job_types}): {queryset.filter(combined_filters).count()}")

        # Apply company filter
        company_q = Q()
        if companies:
            for company in companies:
                company_q |= Q(company_name__icontains=company)
            combined_filters &= company_q
            print(f"After applying company Q object ({companies}): {queryset.filter(combined_filters).count()}")

        # Apply salary range filter
        if min_salary is not None or max_salary is not None:
            try:
                if min_salary is not None:
                    min_salary = float(min_salary)
                    combined_filters &= Q(salary__gte=min_salary)
                if max_salary is not None:
                    max_salary = float(max_salary)
                    combined_filters &= Q(salary__lte=max_salary)
                print(f"After applying salary range filter: {queryset.filter(combined_filters).count()}")
            except (ValueError, TypeError) as e:
                print(f"Error parsing salary range: {e}")

        # Apply all combined filters
        queryset = queryset.filter(combined_filters)

        # Apply favorited jobs filter if requested and user is authenticated
        if show_favorited_only and request.user.is_authenticated:
            user_profile = request.user.userprofile
            queryset = queryset.filter(id__in=user_profile.favorited_jobs.all().values_list('id', flat=True))
            print(f"After applying favorited jobs filter: {queryset.count()}")

        print(f"Final queryset count after all filters: {queryset.count()}")

        # Default ordering
        queryset = queryset.order_by('-created_at')

        serializer = JobPostingSerializer(queryset, many=True, context={'request': request})
        
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = JobPostingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Save the serializer. The create method will handle user and status from context
            job_posting = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def signin_view(request):
    signin_form = SignInForm()
    signup_form = SignUpForm()

    if request.method == 'POST':
        if 'signup' in request.POST:
            signup_form = SignUpForm(request.POST)
            if signup_form.is_valid():
                user = signup_form.save()
                login(request, user)
                return redirect('account')
        elif 'signin' in request.POST:
            signin_form = SignInForm(data=request.POST)
            if signin_form.is_valid():
                user = authenticate(username=signin_form.cleaned_data['username'], 
                                 password=signin_form.cleaned_data['password'])
                if user is not None:
                    login(request, user)
                    if user.is_staff or user.is_superuser:
                        return redirect('admin_panel')
                    return redirect('account')
                else:
                    signin_form.add_error(None, 'Invalid username or password')

    return render(request, 'signin.html', {
        'signup_form': signup_form,
        'signin_form': signin_form
    })

def signout_view(request):
    logout(request)
    return redirect('signin')

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('account')
        else:
            print(form.errors)  # Debug statement to print form errors
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

def is_staff_or_admin(user):
    return user.is_staff or user.is_superuser

@user_passes_test(is_staff_or_admin)
def approve_job(request, job_id):
    job_posting = get_object_or_404(JobPosting, id=job_id)
    job_posting.status = 'approved'
    job_posting.save()
    return redirect('admin_panel')

@user_passes_test(is_staff_or_admin)
def deny_job(request, job_id):
    job_posting = get_object_or_404(JobPosting, id=job_id)
    job_posting.status = 'denied'
    job_posting.save()
    return redirect('admin_panel')

@user_passes_test(is_staff_or_admin)
def delete_job(request, job_id):
    job_posting = get_object_or_404(JobPosting, id=job_id)
    job_posting.delete()
    return redirect('admin_panel')

@user_passes_test(is_staff_or_admin)
def admin_panel(request):
    pending_jobs = JobPosting.objects.filter(status='pending')
    approved_jobs = JobPosting.objects.filter(status='approved')
    denied_jobs = JobPosting.objects.filter(status='denied')
    return render(request, 'admin_panel.html', {'pending_jobs': pending_jobs, 'approved_jobs': approved_jobs, 'denied_jobs': denied_jobs})

def apply(request, job_id):
    job_posting = get_object_or_404(JobPosting, id=job_id)
    custom_questions = job_posting.custom_questions.split('\n') if job_posting.custom_questions else []
    requirements = job_posting.requirements.split(',') if job_posting.requirements else []
    
    user_profile = None
    user_references = []
    user_education = []
    
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        user_references = user_profile.references.all()
        user_education = user_profile.education.all()
    
    if request.method == 'POST':
        # 1. Prepare email content
        name = request.POST.get('name')
        email = request.POST.get('email')
        resume = request.FILES.get('resume') or user_profile.resume
        custom_answers = request.POST.getlist('custom_questions[]')
        requirement_answers = {req: request.POST.get(req) for req in requirements}
        
        # Create email subject and content
        subject = f"New Application for {job_posting.title}"
        text_content, html_content = create_email_content(
            job_posting, name, email, resume,
            custom_questions, custom_answers,
            user_references, user_education
        )
        
        # Prepare email object
        mail = EmailMultiAlternatives(subject, text_content, to=[job_posting.company_email])
        mail.attach_alternative(html_content, "text/html")
        
        # Attach resume if present
        if resume:
            attach_resume_to_email(mail, resume)
        
        # 2. Redirect user immediately
        response = redirect('index')
        
        # 3. Send email after redirect
        mail.send()
        
        # Increment num_applications for the user profile
        user_profile.num_applications = (user_profile.num_applications or 0) + 1
        user_profile.save()


        return response
        
    return render(request, 'apply.html', {
        'job_posting': job_posting,
        'custom_questions': custom_questions,
        'requirements': requirements,
        'user': request.user,
        'user_profile': user_profile,
        'user_references': user_references,
        'user_education': user_education
    })

def create_email_content(job_posting, name, email, resume, custom_questions, custom_answers, references, education):
    # Create text content
    text_content = f"""
A new application has been submitted for {job_posting.title}.

Full Name: {name}
Email: {email}
"""
    # Only add resume info if resume exists
    if resume:
        text_content += "Resume Attached: Yes\n"
    
    if custom_questions and custom_answers:
        text_content += "\nCustom Questions and Answers:\n"
        for question, answer in zip(custom_questions, custom_answers):
            text_content += f"Q: {question}\nA: {answer}\n"
    
    if references:
        text_content += "\nReferences:\n"
        for ref in references:
            # Handle both dictionary and QueryDict formats
            ref_name = ref.get('name') if isinstance(ref, dict) else ref
            ref_relation = ref.get('relation') if isinstance(ref, dict) else ''
            ref_contact = ref.get('contact') if isinstance(ref, dict) else ''
            text_content += f"Name: {ref_name}, Relation: {ref_relation}, Contact: {ref_contact}\n"
    
    if education:
        text_content += "\nEducation:\n"
        for edu in education:
            # Handle both dictionary and QueryDict formats
            school = edu.get('school') if isinstance(edu, dict) else edu
            grad_date = edu.get('graduationDate') if isinstance(edu, dict) else ''
            gpa = edu.get('gpa') if isinstance(edu, dict) else ''
            text_content += f"School: {school}, Graduation Date: {grad_date}, GPA: {gpa}\n"

    # Create HTML content
    html_content = f"""
<html>
<body>
<h3>Application for {job_posting.title}</h3>
<p><strong>Name:</strong> {name}</p>
<p><strong>Email:</strong> {email}</p>
"""
    # Only add resume info if resume exists
    if resume:
        html_content += "<p><strong>Resume:</strong> Attached</p>"
    
    if custom_questions and custom_answers:
        html_content += "<h4>Custom Questions and Answers:</h4>"
        for question, answer in zip(custom_questions, custom_answers):
            html_content += f"<p><strong>Q:</strong> {question}<br><strong>A:</strong> {answer}</p>"

    if references:
        html_content += "<h4>References:</h4>"
        for ref in references:
            # Handle both dictionary and QueryDict formats
            ref_name = ref.get('name') if isinstance(ref, dict) else ref
            ref_relation = ref.get('relation') if isinstance(ref, dict) else ''
            ref_contact = ref.get('contact') if isinstance(ref, dict) else ''
            html_content += f"<p>Name: {ref_name}, Relation: {ref_relation}, Contact: {ref_contact}</p>"

    if education:
        html_content += "<h4>Education:</h4>"
        for edu in education:
            # Handle both dictionary and QueryDict formats
            school = edu.get('school') if isinstance(edu, dict) else edu
            grad_date = edu.get('graduationDate') if isinstance(edu, dict) else ''
            gpa = edu.get('gpa') if isinstance(edu, dict) else ''
            html_content += f"<p>School: {school}, Graduation Date: {grad_date}, GPA: {gpa}</p>"

    if resume:
        html_content += "<h4>Applicant Grade:</h4>"
        grade, reason = clean_grade(check_applicant(resume, job_posting.description))
    
        html_content += f"<p>{grade}</p>"
        html_content += "<h6>Reason For Grade:</h6>"
        html_content += f"<p>{reason}</p>"
    
    html_content += "</body></html>"

    return text_content, html_content

def attach_resume_to_email(mail, resume):
    if hasattr(resume, 'path'):
        mime_type, _ = mimetypes.guess_type(resume.path)
        with open(resume.path, 'rb') as f:
            mail.attach(resume.name, f.read(), mime_type)
    else:
        mime_type, _ = mimetypes.guess_type(resume.name)
        mail.attach(resume.name, resume.read(), mime_type)

def grade_job_live(request):
    return grade_job_lv(request)

@api_view(['POST'])
@permission_classes([AllowAny])
def grade_applicant_live(request):
    """API endpoint for grading an applicant's resume against a job description"""
    try:
        resume_url = request.data.get('resume_url')
        description = request.data.get('description')

        if not resume_url or not description:
            return Response({'error': 'Resume URL and job description are required'}, status=400)

        # Get the grade
        grade = clean_grade(check_applicant(resume_url, description))
        
        return Response({'grade': grade})
    except Exception as e:
        print(f"Error in grade_applicant_live: {str(e)}")
        return Response({'error': 'Failed to grade applicant'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_job_detail(request, pk):
    """API endpoint for single job posting details"""
    try:
        job_posting = JobPosting.objects.get(pk=pk, status='approved')
        serializer = JobPostingSerializer(job_posting, context={'request': request})
        return Response(serializer.data)
    except JobPosting.DoesNotExist:
        return Response({'error': 'Job posting not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_apply_job(request, job_id):
    """API endpoint for applying to a job"""
    try:
        job_posting = get_object_or_404(JobPosting, id=job_id, status='approved')
        user = request.user
        user_profile = UserProfile.objects.get(user=user)

        # Get application data from request
        form_data = request.data
        name = form_data.get('name')  # Get the full name
        email = form_data.get('email')  # Get the full email
        resume = request.FILES.get('resume') or user_profile.resume

        # Get references from request data
        references = []
        index = 1
        while f'reference_name_{index}' in form_data:
            references.append({
                'name': form_data.get(f'reference_name_{index}'),
                'relation': form_data.get(f'reference_relation_{index}'),
                'contact': form_data.get(f'reference_contact_{index}')
            })
            index += 1

        # Get education from request data
        education = []
        index = 1
        while f'school_name_{index}' in form_data:
            education.append({
                'school': form_data.get(f'school_name_{index}'),
                'graduationDate': form_data.get(f'graduation_date_{index}'),
                'gpa': form_data.get(f'gpa_{index}')
            })
            index += 1

        # Get custom answers
        custom_answers = form_data.getlist('custom_questions[]', [])  # Use getlist for QueryDict

        # Create email content
        subject = f"New Application for {job_posting.title}"
        text_content, html_content = create_email_content(
            job_posting, name, email, resume,
            job_posting.custom_questions.split('\n') if job_posting.custom_questions else [],
            custom_answers,
            references,
            education
        )
    
        # Prepare email
        mail = EmailMultiAlternatives(subject, text_content, to=[job_posting.company_email])
        mail.attach_alternative(html_content, "text/html")
    
        # Attach resume
        if resume:
            attach_resume_to_email(mail, resume)
    
        # Send email
        mail.send()
    
        # Increment num_applications for the user profile
        user_profile.num_applications = (user_profile.num_applications or 0) + 1
        user_profile.applied_jobs.add(job_posting)
        user_profile.save()

        # Calculate grade if resume is present
        grade = None
        if resume:
            try:
                grade_response = check_applicant(resume, job_posting.description)
                grade = clean_grade(grade_response)
            except Exception as e:
                print(f"Error calculating grade: {str(e)}")
                grade = "75;Error calculating grade"

        return Response({
            'message': 'Application submitted successfully',
            'grade': grade,
            'jobs_applied_to': str(user_profile.applied_jobs)
        }, status=200)

    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    except Exception as e:
        print(f"Error in api_apply_job: {str(e)}")
        print(f"Request data: {request.data}")  # Debug print
        print(f"Request FILES: {request.FILES}")  # Debug print
        return Response({'error': f'Failed to submit application: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    """API endpoint for fetching user profile"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def api_update_profile(request):
    """API endpoint for updating user profile"""
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    
    # Pre-create any new Skill entries so SlugRelatedField can match
    skill_names = request.data.getlist('skills') if hasattr(request.data, 'getlist') else request.data.get('skills')
    if skill_names:
        from .models import Skill
        for name in skill_names:
            Skill.objects.get_or_create(name=name)
    serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        # Save profile fields
        profile_instance = serializer.save()
        # Handle skills m2m explicitly if provided
        skill_names = request.data.getlist('skills') if hasattr(request.data, 'getlist') else request.data.get('skills')
        if skill_names is not None:
            from .models import Skill
            # Set skills by matching names
            skills_qs = Skill.objects.filter(name__in=skill_names)
            profile_instance.skills.set(skills_qs)
        return Response(UserProfileSerializer(profile_instance, context={'request': request}).data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """API endpoint for user registration"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create UserProfile for the new user

        user_profile_serializer = UserProfileSerializer(data=request.data)
        if user_profile_serializer.is_valid():
            user_profile = user_profile_serializer.save(user=user)
            user_profile.is_job_provider = request.data.get("is_job_provider")
            user_profile.save()

        refresh = RefreshToken.for_user(user)
     
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """Login and get auth token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            }
        })
    return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """API endpoint for user logout"""
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out.'}, status=205)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_applications(request):
    """API endpoint for fetching a user's job applications"""
    # This assumes you have a model for tracking applications
    # For now, returning an empty list or a placeholder
    return Response([]) # Replace with actual data if application tracking is implemented

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_references(request):
    """API endpoint for fetching user references"""
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        references = Reference.objects.filter(user_profile=user_profile)
        serializer = ReferenceSerializer(references, many=True)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
         return Response([], status=200) # Return empty list if profile doesn't exist

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_reference(request):
    """API endpoint for adding a reference"""
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    
        serializer = ReferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user_profile=user_profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_reference(request, reference_id):
    """API endpoint for deleting a reference"""
    try:
        reference = Reference.objects.get(id=reference_id, user_profile__user=request.user)
        reference.delete()
        return Response(status=204) # No content status
    except Reference.DoesNotExist:
        return Response({'error': 'Reference not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_education(request):
    """API endpoint for fetching user education"""
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        education = Education.objects.filter(user_profile=user_profile)
        serializer = EducationSerializer(education, many=True)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response([], status=200) # Return empty list if profile doesn't exist

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_education(request):
    """API endpoint for adding education"""
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)
    
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user_profile=user_profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_education(request, education_id):
    """API endpoint for deleting education"""
    try:
        education = Education.objects.get(id=education_id, user_profile__user=request.user)
        education.delete()
        return Response(status=204) # No content status
    except Education.DoesNotExist:
        return Response({'error': 'Education not found'}, status=404)

# --- ADMIN API ENDPOINTS ---

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_admin_list_jobs(request):
    """List all jobs, filterable by status (pending, approved, denied) and search term"""
    status_filter = request.GET.get('status', None)
    search_term = request.GET.get('search', None)

    jobs = JobPosting.objects.all()

    if status_filter:
        jobs = jobs.filter(status=status_filter)

    if search_term:
        # Filter by search term across multiple fields
        jobs = jobs.filter(
            Q(title__icontains=search_term) |
            Q(company_name__icontains=search_term) |
            Q(description__icontains=search_term) |
            Q(location__icontains=search_term)
        )

    serializer = JobPostingSerializer(jobs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_admin_approve_job(request, job_id):
    job = get_object_or_404(JobPosting, id=job_id)
    job.status = 'approved'
    job.save()
    return Response({'message': 'Job approved.'})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_admin_deny_job(request, job_id):
    job = get_object_or_404(JobPosting, id=job_id)
    job.status = 'denied'
    job.save()
    return Response({'message': 'Job denied.'})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_admin_delete_job(request, job_id):
    job = get_object_or_404(JobPosting, id=job_id)
    job.delete()
    return Response({'message': 'Job deleted.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_favorite_job(request):
    job_id = request.data.get('job_id')
    if not job_id:
        return Response({'error': 'Job ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        job = JobPosting.objects.get(id=job_id)
    except JobPosting.DoesNotExist:
        return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

    user_profile = request.user.userprofile

    if job in user_profile.favorited_jobs.all():
        user_profile.favorited_jobs.remove(job)
        message = 'Job removed from favorites.'
    else:
        user_profile.favorited_jobs.add(job)
        message = 'Job added to favorites.'
    
    return Response({'message': message}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_favorited_jobs_list(request):
    user_profile = request.user.userprofile
    favorited_jobs = user_profile.favorited_jobs.all()
    serializer = JobPostingSerializer(favorited_jobs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_check_is_staff(request):
    """API endpoint to check if the authenticated user is staff"""
    return Response({'is_staff': request.user.is_staff}, status=status.HTTP_200_OK)


# --- NEW ADMIN DASHBOARD STATS ENDPOINTS ---

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_admin_dashboard_stats(request):
    """API endpoint for admin dashboard statistics"""
    try:
        # Total job submissions
        total_job_submissions = JobPosting.objects.count()

        # Approved job postings
        approved_postings = JobPosting.objects.filter(status='approved').count()

        # Job submissions per month
        monthly_submissions = JobPosting.objects.annotate(month=TruncMonth('created_at')) \
                                               .values('month') \
                                               .annotate(count=Count('id')) \
                                               .order_by('month')
        # Format for frontend consumption (e.g., 'YYYY-MM')
        formatted_monthly_submissions = [{'month': item['month'].strftime('%B-%Y'), 'count': item['count']} for item in monthly_submissions]

        # Breakdown by job categories
        job_category_breakdown = JobPosting.objects.values('job_type') \
                                               .annotate(count=Count('id')) \
                                               .order_by('-count')
        # Filter out entries where job_type is empty or None
        job_category_breakdown = [item for item in job_category_breakdown if item['job_type']]

        # Total student accounts (proxy for student applications if no dedicated Application model)
        total_student_accounts = UserProfile.objects.filter(is_job_provider=False).count()
        # Note: For accurate application counts, a dedicated JobApplication model linking UserProfile to JobPosting
        # would be required, along with updates to the api_apply_job endpoint to create these entries.

        # Total employer accounts
        total_employer_accounts = UserProfile.objects.filter(is_job_provider=True).count()

        # Salary Distribution
        salary_bins = {
            '$0-16/hr': 0,
            '$16-35/hr': 0,
            '$35+/hr': 0,
        }

        # Helper to parse salary (removes non-numeric, converts to int) and convert to hourly
        def parse_salary_to_hourly(salary_str):
            if not salary_str: return None
            # Clean string to get only digits, assuming it's a numerical salary
            cleaned_salary = int(salary_str)
            return cleaned_salary

        for job in JobPosting.objects.all():
            hourly_rate = parse_salary_to_hourly(job.salary)
            if hourly_rate is not None:
                if (hourly_rate < 17): 
                    salary_bins['$0-16/hr'] += 1
                elif (hourly_rate < 35): 
                    salary_bins['$16-35/hr'] += 1
                else: 
                    salary_bins['$35+/hr'] += 1
        
        formatted_salary_distribution = [{'name': k, 'count': v} for k, v in salary_bins.items()]

        # Average Job Grade
        total_grades = []
        for job in JobPosting.objects.all():
            try:
                grade = float(job.grade) # Assuming job.grade is a string that can be converted to float
                total_grades.append(grade)
            except (ValueError, TypeError):
                # Handle cases where grade is not a valid number (e.g., 'N/A')
                continue
        
        average_job_grade = sum(total_grades) / len(total_grades) if total_grades else None

        return Response({
            'total_job_submissions': total_job_submissions,
            'approved_postings': approved_postings,
            'monthly_submissions': formatted_monthly_submissions,
            'job_category_breakdown': job_category_breakdown,
            'total_student_accounts': total_student_accounts,
            'total_employer_accounts': total_employer_accounts,
            'salary_distribution': formatted_salary_distribution,
            'average_job_grade': average_job_grade,
        })
    except Exception as e:
        return Response({'error': f'Failed to retrieve dashboard stats: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_admin_student_account_stats(request):
    """API endpoint to view statistics per student account, including number of applications and favorited jobs."""
    try:
        student_profiles = UserProfile.objects.filter(is_job_provider=False)
        student_stats_list = []

        for profile in student_profiles:
            # Number of favorited jobs is directly available
            num_favorited_jobs = profile.favorited_jobs.count()

            #
            num_applications = profile.num_applications

            student_stats_list.append({
                'id': profile.id,
                'username': profile.user.username,
                'num_applications': num_applications,
                'num_favorited_jobs': num_favorited_jobs,
                'is_active': profile.user.is_active, # Example: could indicate active students
            })
        return Response({'student_stats': student_stats_list})
    except Exception as e:
        return Response({'error': f'Failed to retrieve student stats: {str(e)}'}, status=500)

@api_view(['GET'])
def job_post_success_rate(request):
    job_provider_profiles = UserProfile.objects.filter(is_job_provider=True)
    provider_stat_list = []

    for provider in job_provider_profiles:
        provider_stat_list.append({
            'id': provider.id,
            'username': provider.user.username,
            'job_post_success_rate': provider.get_job_post_success_rate(),
        })

    return Response({'job_provider_stats':provider_stat_list})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applicants(request):
    """
    Get a list of applicants with filtering and sorting capabilities.
    Only accessible by job providers.
    """
    # Check if the user is a job provider
    if not request.user.userprofile.is_job_provider:
        return Response(
            {"error": "Only job providers can access this endpoint"},
            status=403
        )

    # Get query parameters
    skill_filter = request.query_params.get('skill', '')
    job_filter = request.query_params.get('job', '')
    sort_by = request.query_params.get('sort_by', 'recent')

    # Base queryset - get all users who are not job providers
    applicants = UserProfile.objects.filter(is_job_provider=False)

    # Apply filters
    if skill_filter:
        # Filter by skills in requirements
        applicants = applicants.filter(
            Q(education__school_name__icontains=skill_filter) |
            Q(user__first_name__icontains=skill_filter) |
            Q(user__last_name__icontains=skill_filter)
        ).distinct()

    if job_filter:
        # Filter by jobs they've applied to
        applicants = applicants.filter(
            applied_jobs__title__icontains=job_filter
        ).distinct()

    # Apply sorting
    if sort_by == 'alphabetical':
        applicants = applicants.order_by('user__last_name', 'user__first_name')
    else:  # default to 'recent'
        applicants = applicants.order_by('-user__date_joined')

    # Serialize the data
    serializer = UserProfileSerializer(
        applicants,
        many=True,
        context={'request': request}
    )

    # Add additional data for each applicant
    enhanced_data = []
    for applicant_data in serializer.data:
        # Get the applicant's applied jobs
        applied_jobs = JobPosting.objects.filter(
            applicants=applicant_data['id']
        ).values_list('title', flat=True)

        # Get the applicant's education info
        education = applicant_data.get('education', [])
        graduation_year = None
        school_year = None
        if education:
            latest_education = max(education, key=lambda x: x.get('graduation_date', ''))
            if latest_education.get('graduation_date'):
                graduation_year = latest_education['graduation_date'][:4]
                # Calculate school year based on graduation date
                current_year = datetime.now().year
                years_until_graduation = int(graduation_year) - current_year
                if years_until_graduation > 0:
                    school_year = f"Class of {graduation_year}"
                else:
                    school_year = "Graduated"

        # Enhance the applicant data
        enhanced_data.append({
            **applicant_data,
            'applied_jobs': list(applied_jobs),
            'graduation_year': graduation_year,
            'school_year': school_year,
            'profile_picture': f"https://ui-avatars.com/api/?name={applicant_data['user']['first_name']}+{applicant_data['user']['last_name']}&background=FF6B00&color=fff"
        })

    return Response({
        'applicants': enhanced_data,
        'total': len(enhanced_data)
    })