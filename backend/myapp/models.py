from django.db import models
from django.contrib.auth.models import User
import json

class TodoItem(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    is_job_provider = models.BooleanField(default=True)
    account_holder_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.user.username

class Reference(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='references')
    name = models.CharField(max_length=255)
    relation = models.CharField(max_length=255)
    contact = models.CharField(max_length=255)

class Education(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='education')
    school_name = models.CharField(max_length=255)
    graduation_date = models.DateField(blank=True, null=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

class JobPosting(models.Model):
    #Saving all of the fields
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    location = models.CharField(max_length=255)
    salary = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50)
    description = models.TextField()
    requirements = models.TextField()
    custom_questions = models.TextField(blank=True, null=True)
    featured = models.BooleanField(default=False)  # Added featured field
  
    #Adding the options ot wether if the job is active on the website or not
    status = models.CharField(
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('denied', 'Denied')], 
        default='pending', 
        max_length=10
    )
    #job grade and date it was made on
    grade = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Ensure requirements and custom_questions are stored as JSON strings
        if isinstance(self.requirements, (list, tuple)):
            self.requirements = json.dumps(self.requirements)
        elif isinstance(self.requirements, str):
            try:
                # Validate that it's proper JSON
                json.loads(self.requirements)
            except json.JSONDecodeError:
                # If not JSON, treat as comma-separated
                self.requirements = json.dumps([r.strip() for r in self.requirements.split(',') if r.strip()])

        if isinstance(self.custom_questions, (list, tuple)):
            self.custom_questions = json.dumps(self.custom_questions)
        elif isinstance(self.custom_questions, str):
            try:
                # Validate that it's proper JSON
                json.loads(self.custom_questions)
            except json.JSONDecodeError:
                # If not JSON, treat as newline-separated
                self.custom_questions = json.dumps([q.strip() for q in self.custom_questions.split('\n') if q.strip()])

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']