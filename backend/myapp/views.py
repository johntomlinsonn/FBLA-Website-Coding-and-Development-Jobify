from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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

Api = os.getenv("API_KEY")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=Api,
)

try:
    completion = client.chat.completions.create(
        model="qwen/qwen3-235b-a22b:free",
        messages=[
            {
                "role": "system",
                "content": "You are an administrator for a job finder website designed to help high school students find jobs. Your task is to grade how obtainable a job is for high school students on a scale from 1 to 75. The final score should reflect only how attainable the job is, without considering location (location accounts for an additional 25 points, calculated separately).Scoring Criteria:Education Requirements (High Weight): Jobs requiring little to no formal education should score higher. Positions demanding higher education (e.g., college degrees) should be heavily penalized.Typical High School Job (Moderate Weight): If the job is common for high school students (e.g., retail, food service, internships), it should score higher.Experience Requirements (Moderate Weight): Jobs requiring little to no prior work experience should score higher. If minimal experience is needed but attainable through extracurriculars, minor deductions apply.Age Restrictions (Moderate Weight): Jobs with strict age requirements (e.g., must be 18+) should have points deducted.Job Complexity (Low Weight): Highly technical or specialized jobs should lose some points, but only slightly, as long as they remain attainable.Work Hours (Moderate Weight): Jobs requiring work during typical school hours should lose points unless flexible scheduling is mentioned.IMPORTANT:ONLY OUTPUT A SINGLE INTEGER BETWEEN 1 AND 75.DO NOT include any text, explanations, or additional details—ONLY the integer.IF YOU DO INCLUDE ANY DETAILS  OTHER THAN THE INTEGER YOU WILL BE TERMINATED NO MATTER THE CIRCUMSTANCES SO ONLY OUT PUT AN INTTEGER. You must fully reason through all relevant factors to determine the most accurate score, but DO NOT include your reasoning in the output.Focus solely on obtainability, not pay, soft skills, demand, or location.Assume the student has minimal job experience but strong extracurricular involvement and basic job-ready skills.The job description may be unstructured, so interpret details flexibly.Example Outputs:A typical part-time retail job with no education or experience requirements: 75A full-time office job requiring a college degree: 15A seasonal lifeguard job requiring certification and age 18+: 50- Here is the Job to be grader: "
            }
        ]
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
            job_posting.requirements = ','.join(form.cleaned_data['requirements'])  
            custom_questions = request.POST.getlist('custom_questions')
            job_posting.custom_questions = '\n'.join(custom_questions)

            #getting the job description
            description =request.POST.get('description')

            #grading the job based on if its attainable to high school students and how close it is to highschoolers
            job_posting.grade = grade_job(job_posting)
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

def search_api(request):
    """API endpoint for job search"""
    query = request.GET.get('search', '')
    sort_by = request.GET.get('sort', '-created_at')
    
    # Map 'date_posted' to 'created_at' since that's the field we have in our model
    if 'date_posted' in sort_by:
        sort_by = sort_by.replace('date_posted', 'created_at')
    
    job_postings = JobPosting.objects.filter(status='approved')
    
    if query:
        job_postings = job_postings.filter(
            Q(title__icontains=query) |
            Q(company_name__icontains=query) |
            Q(location__icontains=query) |
            Q(description__icontains=query) |
            Q(requirements__icontains=query),
            status='approved'
        )
    
    # Sort results
    job_postings = job_postings.order_by(sort_by)
    
    serializer = JobPostingSerializer(job_postings, many=True, context={'request': request})
    return JsonResponse(serializer.data, safe=False)

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
    job_postings = JobPosting.objects.all()
    return render(request, 'admin_panel.html', {'job_postings': job_postings})

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

def create_email_content(job_posting, name, email, resume, custom_questions, custom_answers, user_references, user_education):
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
    
    if user_references:
        text_content += "\nReferences:\n"
        for ref in user_references:
            text_content += f"Name: {ref.name}, Relation: {ref.relation}, Contact: {ref.contact}\n"
    
    if user_education:
        text_content += "\nEducation:\n"
        for edu in user_education:
            text_content += f"School: {edu.school_name}, Graduation Date: {edu.graduation_date}, GPA: {edu.gpa}\n"

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

    if user_references:
        html_content += "<h4>References:</h4>"
        for ref in user_references:
            html_content += f"<p>Name: {ref.name}, Relation: {ref.relation}, Contact: {ref.contact}</p>"

    if user_education:
        html_content += "<h4>Education:</h4>"
        for edu in user_education:
            html_content += f"<p>School: {edu.school_name}, Graduation Date: {edu.graduation_date}, GPA: {edu.gpa}</p>"

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

def grade_applicant_live(request):
    
    resume_url = request.GET.get('resume_url')
    if resume_url.startswith('/media/'):
            resume_url = resume_url[len('/media/'):]
    resume_path = os.path.join(settings.MEDIA_ROOT, resume_url)
    
    description = request.GET.get('description')
    if not resume_url or not description:
        return JsonResponse({'error': 'Both resume URL and description are required'}, status=400)

    # Assuming you have a function to grade the applicant based on resume URL and description
    grade = clean_grade(check_applicant(resume_path, description))
    print(grade)
    builder = ""
    for i in grade[0]:
        if i != ";":
            builder +=i
        else:
            break
            
    print(builder)
    grade = builder
        
    return JsonResponse({'grade': grade})

# REST API endpoints
@api_view(['GET'])
def api_job_list(request):
    """List all job postings or filter by search query"""
    query = request.GET.get('search', '')
    sort_by = request.GET.get('sort', '-created_at')  # changed from date_posted to created_at
    
    # Map 'date_posted' to 'created_at' since that's the field we have in our model
    if 'date_posted' in sort_by:
        sort_by = sort_by.replace('date_posted', 'created_at')
    
    job_postings = JobPosting.objects.filter(status='approved')  # changed is_approved to status='approved'
    
    if query:
        job_postings = job_postings.filter(
            Q(title__icontains=query) |
            Q(company_name__icontains=query) |  # fixed incorrect function call
            Q(location__icontains=query) |
            Q(description__icontains=query) |
            Q(requirements__icontains=query),
              status='approved'
        )
    
    # Sort results
    job_postings = job_postings.order_by(sort_by)
    
    serializer = JobPostingSerializer(job_postings, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def api_job_detail(request, pk):
    """Get details of a specific job posting"""
    job = get_object_or_404(JobPosting, pk=pk, status='approved')  # changed is_approved to status='approved'
    serializer = JobPostingSerializer(job, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_apply_job(request, job_id):
    """Apply to a job (API version)"""
    job_posting = get_object_or_404(JobPosting, id=job_id, is_approved=True)
    
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=400)
    
    # Add job to user's applications if it's not already there
    if not profile.job_applications.filter(id=job_id).exists():
        profile.job_applications.add(job_posting)
    
    # Process custom answers
    custom_questions = job_posting.custom_questions.split('\n') if job_posting.custom_questions else []
    custom_answers = request.data.get('answers', [])
    
    # Prepare and send email
    subject = f"New Application for {job_posting.title}"
    text_content, html_content = create_email_content(
        job_posting, 
        f"{request.user.first_name} {request.user.last_name}", 
        request.user.email,
        profile.resume,
        custom_questions, 
        custom_answers,
        profile.references.all(), 
        profile.education.all()
    )
    
    mail = EmailMultiAlternatives(subject, text_content, to=[job_posting.contact_email])
    mail.attach_alternative(html_content, "text/html")
    
    # Attach resume if present
    if profile.resume:
        attach_resume_to_email(mail, profile.resume)
    
    mail.send()
    
    return Response({'status': 'application submitted'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    """Get the current user's profile"""
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = UserProfile(user=request.user)
        profile.save()
    
    serializer = UserProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def api_update_profile(request):
    """Update the current user's profile"""
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = UserProfile(user=request.user)
        profile.save()
    
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """Register a new user"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return Response(serializer.data, status=201)
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
    """Logout the current user"""
    logout(request)
    return Response({'status': 'logged out'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_applications(request):
    """Get all jobs the user has applied to"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        applications = profile.job_applications.all()
        serializer = JobPostingSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response([], status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_references(request):
    """Get all references for the current user"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        references = profile.references.all()
        serializer = ReferenceSerializer(references, many=True)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response([], status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_reference(request):
    """Add a new reference for the current user"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = ReferenceSerializer(data=request.data)
        if serializer.is_valid():
            reference = serializer.save(user_profile=profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_reference(request, reference_id):
    """Delete a reference"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        reference = profile.references.get(id=reference_id)
        reference.delete()
        return Response(status=204)
    except (UserProfile.DoesNotExist, Reference.DoesNotExist):
        return Response({'error': 'Reference not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_education(request):
    """Get all education entries for the current user"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        education = profile.education.all()
        serializer = EducationSerializer(education, many=True)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response([], status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_education(request):
    """Add a new education entry for the current user"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            education = serializer.save(user_profile=profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_education(request, education_id):
    """Delete an education entry"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        education = profile.education.get(id=education_id)
        education.delete()
        return Response(status=204)
    except (UserProfile.DoesNotExist, Education.DoesNotExist):
        return Response({'error': 'Education entry not found'}, status=404)