from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import JobPosting, UserProfile, Reference, Education

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
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
    references = ReferenceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'resume', 'gpa', 'is_job_provider', 'account_holder_name', 'references', 'education']

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company_name', 'company_email', 'location',
            'salary', 'job_type', 'description', 'requirements',
            'custom_questions', 'status', 'grade', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'grade', 'created_at', 'updated_at'] 