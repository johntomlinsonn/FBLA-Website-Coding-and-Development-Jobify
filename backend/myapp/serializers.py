from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobPosting, UserProfile, Reference, Education, TodoItem
from datetime import datetime, timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        extra_kwargs = {'password': {'write_only': True}}

class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = ['id', 'name', 'contact', 'relation']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'school_name', 'graduation_date', 'gpa']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'resume', 'resume_url', 'gpa', 
            'is_job_provider', 'account_holder_name', 'references', 'education'
        ]
    
    def get_resume_url(self, obj):
        if obj.resume:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url
        return None

class JobPostingSerializer(serializers.ModelSerializer):
    days_since_posting = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company_name', 'company_email', 'location',
            'salary', 'job_type', 'description', 'requirements',
            'custom_questions', 'status', 'grade', 'featured',
            'created_at', 'updated_at', 'days_since_posting', 'is_new'
        ]
    
    def get_days_since_posting(self, obj):
        now = datetime.now(timezone.utc)
        time_diff = now - obj.created_at
        return time_diff.days
    
    def get_is_new(self, obj):
        # Mark jobs as new if they're less than 3 days old
        now = datetime.now(timezone.utc)
        time_diff = now - obj.created_at
        return time_diff.days < 3

class JobSearchSerializer(serializers.Serializer):
    """
    Serializer for job search parameters
    """
    query = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    job_type = serializers.CharField(required=False, allow_blank=True)
    salary_min = serializers.CharField(required=False, allow_blank=True)
    salary_max = serializers.CharField(required=False, allow_blank=True)
    sort_by = serializers.CharField(required=False, allow_blank=True)

class JobApplicationSerializer(serializers.Serializer):
    """
    Serializer for job applications
    """
    job_id = serializers.IntegerField()
    user_profile_id = serializers.IntegerField()
    cover_letter = serializers.CharField(required=False, allow_blank=True)
    custom_answers = serializers.JSONField(required=False)
    
class TodoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItem
        fields = ['id', 'title', 'completed']

class ApplicationStatusSerializer(serializers.Serializer):
    """
    Serializer for tracking application status
    """
    JOB_STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted')
    ]
    
    job = JobPostingSerializer(read_only=True)
    status = serializers.ChoiceField(choices=JOB_STATUS_CHOICES)
    applied_date = serializers.DateTimeField()
    last_updated = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True)

class FilterOptionSerializer(serializers.Serializer):
    """
    Serializer for job filter options on the frontend
    """
    id = serializers.CharField()
    value = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()
    group = serializers.CharField()