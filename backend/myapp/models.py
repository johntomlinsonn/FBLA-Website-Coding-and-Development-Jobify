from django.db import models
from django.contrib.auth.models import User

class TodoItem(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    is_job_provider = models.BooleanField(default=False)
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
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    location = models.CharField(max_length=255)
    salary = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50)
    description = models.TextField()
    requirements = models.TextField()
    custom_questions = models.TextField(blank=True, null=True)
    null=True,  # Allow null temporarily
    blank=True  # Allow blank temporarily
    status = models.CharField(
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('denied', 'Denied')], 
        default='pending', 
        max_length=10
    )
    grade = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the provider's posting counts

    def __str__(self):
        return f"{self.title} at {self.company_name}"

    class Meta:
        ordering = ['-created_at']