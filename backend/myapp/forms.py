from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile, Reference, Education, JobPosting
from django.forms import modelformset_factory

class SignUpForm(UserCreationForm):
    full_name = forms.CharField(required=True, widget=forms.TextInput(attrs={
        'class': 'form-control custom-input',
        'placeholder': 'Enter your full name',
        'id': 'full-name-input'
    }))
    email = forms.EmailField(required=False, widget=forms.EmailInput(attrs={
        'class': 'form-control custom-input',
        'placeholder': 'Enter your email',
        'id': 'email-input'
    }))
    is_job_provider = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input',
        'id': 'job-provider-checkbox'
    }))
    account_holder_name = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'form-control custom-input',
        'placeholder': 'Enter account holder name',
        'id': 'account-holder-input'
    }))
    username = forms.CharField(required=False)
    password1 = forms.CharField(required=False, widget=forms.PasswordInput())
    password2 = forms.CharField(required=False, widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ('full_name', 'username', 'email', 'is_job_provider', 'account_holder_name', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        full_name = self.cleaned_data.get('full_name')
        first_name, last_name = full_name.split(' ', 1)
        user.first_name = first_name
        user.last_name = last_name
        
        if commit:
            user.save()
            # Create UserProfile with job provider fields
            UserProfile.objects.create(
                user=user,
                is_job_provider=self.cleaned_data.get('is_job_provider', False),
                account_holder_name=self.cleaned_data.get('account_holder_name', '')
            )
        return user

class SignInForm(AuthenticationForm):
    username = forms.CharField(required=False)
    password = forms.CharField(required=False, widget=forms.PasswordInput(attrs={
        'class': 'form-control custom-input',
        'placeholder': 'Enter your password',
        'id': 'password-input'
    }))

class UserProfileForm(forms.ModelForm):
    resume = forms.FileField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
    )

    def clean_resume(self):
        resume = self.cleaned_data.get('resume')
        
        return resume

    class Meta:
        model = UserProfile
        fields = ['resume']
        required = {
            'resume': False,
        }

class ReferenceForm(forms.ModelForm):
    class Meta:
        model = Reference
        fields = ['name', 'relation', 'contact']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Reference Name'}),
            'relation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Reference Relation'}),
            'contact': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Reference Contact'}),
        }
        required = {
            'name': False,
            'relation': False,
            'contact': False,
        }

class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = ['school_name', 'graduation_date', 'gpa']
        widgets = {
            'school_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'School Name'}),
            'graduation_date': forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'Graduation Date', 'type': 'date'}),
            'gpa': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'GPA','step':'0.01','min':'0'}),
        }
        required = {
            'school_name': False,
            'graduation_date': False,
            'gpa': False,
        }

ReferenceFormSet = modelformset_factory(Reference, form=ReferenceForm, extra=1, max_num=1, can_delete=True)
EducationFormSet = modelformset_factory(Education, form=EducationForm, extra=1, max_num=1, can_delete=True)

class JobPostingForm(forms.ModelForm):
    REQUIREMENTS_CHOICES = [
        ('resume', 'Resume'),
        ('references', 'References'),
        ('education', 'Education'),
    ]
    requirements = forms.MultipleChoiceField(
        choices=REQUIREMENTS_CHOICES,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
        required=False
    )
    custom_questions = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Enter custom questions'}),
        required=False
    )

    class Meta:
        model = JobPosting
        fields = ['title', 'company_name', 'company_email', 'location', 'salary', 'description', 'requirements', 'custom_questions']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter the job title'}),
            'company_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your company\'s name'}),
            'company_email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Enter your company\'s email'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter the job location'}),
            'salary': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter the salary'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Enter the job description'}),
        }