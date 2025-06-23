from django.db import models
from django.contrib.auth.models import User
import json
from django.utils import timezone

class TodoItem(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    is_job_provider = models.BooleanField(default=True)
    account_holder_name = models.CharField(max_length=255, blank=True, null=True)
    currently_working = models.BooleanField(default=False)
    favorited_jobs = models.ManyToManyField('JobPosting', related_name='favorited_by', blank=True)
    num_applications = models.IntegerField(blank=True, null=True,default=0)
    applied_jobs = models.ManyToManyField('JobPosting', related_name='applicants', blank=True)
    skills = models.ManyToManyField('Skill', related_name='users', blank=True)
    # --- Gamification fields ---
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    profile_completion = models.FloatField(default=0.0)  # 0-100 percent
    opt_in_leaderboard = models.BooleanField(default=True)
    badges = models.ManyToManyField('Badge', related_name='users', blank=True)
    challenges = models.ManyToManyField('Challenge', related_name='participants', blank=True)

    def __str__(self):
        return self.user.username

    def get_job_post_success_rate(self):
        total_jobs_posted = self.posted_jobs.count()
        if total_jobs_posted == 0:
            return 0.0

        approved_jobs = self.posted_jobs.filter(status='approved').count()
        return (approved_jobs / total_jobs_posted) * 100
    
    def calculate_profile_completion(self):
        # Example: count filled fields for progress
        fields = [self.profile_picture, self.resume, self.gpa, self.account_holder_name]
        filled = sum(1 for f in fields if f)
        total = len(fields)
        # Add more fields as needed
        return (filled / total) * 100 if total > 0 else 0

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
    """
    JobPosting Model for managing job postings on the platform.
    This model stores all the information related to job opportunities posted by employers
    or recruiters. It includes details about the job, the company, application requirements,
    and administrative metadata.
    
    Notes:
        - The requirements field accepts various input formats and normalizes them to JSON
        - The custom_questions field similarly accepts various formats and normalizes them
        - All job postings start with 'pending' status and require approval to be visible
    """
    posted_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='posted_jobs',default=1)
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    location = models.CharField(max_length=255)
    salary = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50)
    description = models.TextField()
    requirements = models.TextField()
    custom_questions = models.TextField(blank=True, null=True)
    featured = models.BooleanField(default=False) 
    grade = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
  
    #Adding the options ot wether if the job is active on the website or not
    status = models.CharField(
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('denied', 'Denied')], 
        default='pending', 
        max_length=10
    )
    #job grade and date it was made on
    

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

class Skill(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    sender = models.ForeignKey(UserProfile, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(UserProfile, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.user.username} to {self.recipient.user.username} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=255, blank=True, null=True)  # Path or name for frontend icon
    criteria = models.TextField(blank=True, null=True)  # JSON or text description of how to earn

    def __str__(self):
        return self.name

class Challenge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    points = models.IntegerField(default=0)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    # New field to define criteria for completion
    # Examples: {'action': 'apply_to_jobs', 'count': 5}
    #           {'action': 'complete_profile', 'percentage': 100}
    criteria = models.JSONField(default=dict)

    def __str__(self):
        return self.name

class UserChallenge(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='user_challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='user_challenges')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    # progress can store things like {'applications': 2}
    progress = models.JSONField(default=dict) 

    class Meta:
        unique_together = ('user', 'challenge') # Each user can only have one instance of a challenge

    def __str__(self):
        return f"{self.user.user.username}'s {self.challenge.name} - {'Completed' if self.is_completed else 'In Progress'}"

# Example badge types for gamification system:
# - First Application
# - 5 Applications
# - 10 Applications
# - 20 Applications
# - 50 Applications
# - First Challenge Completed
# - 5 Challenges Completed
# - 10 Challenges Completed
# - Profile 50% Complete
# - Profile 100% Complete
# - Application Streak (5+ in a week)
# - Challenge Streak (3+ in a month)
# - Early Bird (first to complete a challenge)
# - All-Star Profile
# - Custom badges for special events