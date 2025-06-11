from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobPosting, UserProfile, Reference, Education, TodoItem
from datetime import datetime, timezone
import json

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = ['id', 'name', 'relation', 'contact']

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
            return self.context['request'].build_absolute_uri(obj.resume.url)
        return None

class JobPostingSerializer(serializers.ModelSerializer):
    requirements = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    custom_questions = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'company_name', 'company_email', 'description', 'salary', 'location', 'job_type', 'requirements', 'custom_questions', 'user', 'status', 'created_at', 'updated_at','grade']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        try:
            representation['requirements'] = json.loads(instance.requirements)
        except (json.JSONDecodeError, TypeError):
            representation['requirements'] = [] # Handle cases where it's not valid JSON

        try:
            representation['custom_questions'] = json.loads(instance.custom_questions)
        except (json.JSONDecodeError, TypeError):
            representation['custom_questions'] = [] # Handle cases where it's not valid JSON

        return representation

    def create(self, validated_data):
        # Debug print to inspect validated_data
        print("Validated Data in create (final attempt to exclude user keyword):", validated_data)

        # Construct the dictionary of arguments for JobPosting.objects.create()
        # This dictionary will contain fields from validated_data, explicitly excluding 'user'.
        create_args_excluding_user = {}
        for key, value in validated_data.items():
            if key != 'user': # Explicitly exclude the 'user' key
                create_args_excluding_user[key] = value

        # Debug print the final arguments for create
        print("Arguments for JobPosting.objects.create() (user excluded):", create_args_excluding_user)

        # Create the job posting instance using the carefully constructed arguments
        # This dictionary should now NOT have the 'user' key
        job_posting = JobPosting.objects.create(**create_args_excluding_user)

        # Set status to pending (assuming this is desired)
        job_posting.status = 'pending'

        # Save the instance to persist changes (status)
        job_posting.save()

        # Debug print the created object
        print("Created Job Posting object (user not set via create args):", job_posting)

        return job_posting

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