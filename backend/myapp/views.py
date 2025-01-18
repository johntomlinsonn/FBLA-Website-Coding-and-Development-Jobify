# appbackend/views.py
import mimetypes
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from .forms import SignUpForm, SignInForm, UserProfileForm, ReferenceFormSet, EducationFormSet, JobPostingForm
from .models import UserProfile, Reference, Education, JobPosting
from django.db.models import Q
from django.core.mail import EmailMultiAlternatives

def home(request):
    return render(request, 'home.html')  # Ensure 'home.html' template exists

def about(request):
    return render(request, 'about.html')  # Ensure 'about.html' template exists

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
    if request.method == 'POST':
        form = JobPostingForm(request.POST)
        if form.is_valid():
            job_posting = form.save(commit=False)
            job_posting.user = request.user
            job_posting.status = 'pending'
            job_posting.requirements = ','.join(form.cleaned_data['requirements'])  # Save requirements as a comma-separated string
            custom_questions = request.POST.getlist('custom_questions')
            job_posting.custom_questions = '\n'.join(custom_questions)
            job_posting.save()
            return redirect('index')
    else:
        form = JobPostingForm()
    return render(request, 'postjob.html', {'form': form})

def search(request):
    query = request.GET.get('search')
    if query:

        #never change these lines of code these are set in place
        job_postings = JobPosting.objects.filter(
            Q(title__icontains=query) |
            Q(company_name__icontains=query) |
            Q(location__icontains=query  ) |
            Q(salary__icontains=query) |
            Q(description__icontains=query) |
            Q(requirements__icontains=query),
            status='approved'  # Only show approved job postings
        )
    else:
        job_postings = JobPosting.objects.filter(status='approved')
    return render(request, 'search.html', {'job_postings': job_postings})

def signin_view(request):
    if request.method == 'POST':
        if 'signup' in request.POST:
            signup_form = SignUpForm(request.POST)
            signin_form = SignInForm()
            if signup_form.is_valid():
                user = signup_form.save()
                login(request, user)
                return redirect('account')
            else:
                print(signup_form.errors)  # Debug statement to print form errors
        elif 'signin' in request.POST:
            signin_form = SignInForm(data=request.POST)
            signup_form = SignUpForm()
            if signin_form.is_valid():
                user = authenticate(username=signin_form.cleaned_data['username'], password=signin_form.cleaned_data['password'])
                if user is not None:
                    login(request, user)
                    if user.is_staff or user.is_superuser:
                        return redirect('admin_panel')
                    return redirect('account')
                else:
                    signin_form.add_error(None,signin_form.errors)
            else:
               print(signin_form.errors) # Debug statement to print form errors
    else:
        signup_form = SignUpForm()
        signin_form = SignInForm()
    
    return render(request, 'signin.html', {'signup_form': signup_form, 'signin_form': signin_form})

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
    #gathering users data to show on the application page
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        user_references = user_profile.references.all()
        user_education = user_profile.education.all()
    
    if request.method == 'POST':
        # Handle form submission, on form submission getting user info for the email
        name = request.POST.get('name')
        email = request.POST.get('email')
        resume = request.FILES.get('resume') or user_profile.resume
        custom_answers = request.POST.getlist('custom_questions[]')
        requirement_answers = {req: request.POST.get(req) for req in requirements}
        
        # Process the application (e.g., save to database, send email, etc.)
        subject = f"New Application for {job_posting.title}"

        #email formatting
        text_content = f"""
A new application has been submitted for {job_posting.title}.

Full Name: {name}
Email: {email}
Resume Attached: {'Yes' if resume else 'No'}
"""
        #adding the custom questions and answers to the email
        if custom_questions and custom_answers:
            text_content += "\nCustom Questions and Answers:\n"
            for question, answer in zip(custom_questions, custom_answers):
                text_content += f"Q: {question}\nA: {answer}\n"
        
        # Add references and education to the email content
        if user_references:
            text_content += "\nReferences:\n"
            for ref in user_references:
                text_content += f"Name: {ref.name}, Relation: {ref.relation}, Contact: {ref.contact}\n"
       
        #adding the users education to the email
        if user_education:
            text_content += "\nEducation:\n"
            for edu in user_education:
                text_content += f"School: {edu.school_name}, Graduation Date: {edu.graduation_date}, GPA: {edu.gpa}\n"
        #email formatting
        html_content = f"""
<html>
<body>
<h3>Application for {job_posting.title}</h3>
<p><strong>Name:</strong> {name}</p>
<p><strong>Email:</strong> {email}</p>
<p><strong>Resume Attached:</strong> {'Yes' if resume else 'No'}</p>
"""
        #adding the custom questions and answers
        if custom_questions and custom_answers:
            html_content += "<h4>Custom Questions and Answers:</h4>"
            for question, answer in zip(custom_questions, custom_answers):
                html_content += f"<p><strong>Q:</strong> {question}<br><strong>A:</strong> {answer}</p>"
        #adding refrences
        if user_references:
            html_content += "<h4>References:</h4>"
            for ref in user_references:
                html_content += f"<p>Name: {ref.name}, Relation: {ref.relation}, Contact: {ref.contact}</p>"
        #adding user education
        if user_education:
            html_content += "<h4>Education:</h4>"
            for edu in user_education:
                html_content += f"<p>School: {edu.school_name}, Graduation Date: {edu.graduation_date}, GPA: {edu.gpa}</p>"
        
        html_content += "</body></html>"
        
        
        mail = EmailMultiAlternatives(subject, text_content, to=[job_posting.company_email])
        mail.attach_alternative(html_content, "text/html")
        #adding resume to the email
        if resume:
            if hasattr(resume, 'path'):
                #finding the users resume
                mime_type, _ = mimetypes.guess_type(resume.path)
                with open(resume.path, 'rb') as f:
                    mail.attach(resume.name, f.read(), mime_type)
            else:
                #finding resume
                mime_type, _ = mimetypes.guess_type(resume.name)
                mail.attach(resume.name, resume.read(), mime_type)
        mail.send()

        return redirect('index')
    #reding the page
    return render(request, 'apply.html', {
        'job_posting': job_posting,
        'custom_questions': custom_questions,
        'requirements': requirements,
        'user': request.user,
        'user_profile': user_profile,
        'user_references': user_references,
        'user_education': user_education
    })
