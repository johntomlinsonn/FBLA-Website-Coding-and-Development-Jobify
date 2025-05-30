from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import JobPosting, UserProfile, Reference, Education
import logging

logger = logging.getLogger(__name__)

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
    grade = serializers.IntegerField(required=False, allow_null=True)
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
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert string back to list for requirements and custom_questions
        if isinstance(instance.requirements, str):
            data['requirements'] = instance.requirements.split(',') if instance.requirements else []
        if isinstance(instance.custom_questions, str):
            data['custom_questions'] = instance.custom_questions.split('\n') if instance.custom_questions else []
        # Ensure grade is included in the response
        data['grade'] = instance.grade
        return data

    def to_internal_value(self, data):
        # Convert lists to strings for requirements and custom_questions
        if 'requirements' in data:
            if isinstance(data['requirements'], list):
                data['requirements'] = ','.join(data['requirements'])
            elif isinstance(data['requirements'], str):
                data['requirements'] = data['requirements']
        if 'custom_questions' in data:
            if isinstance(data['custom_questions'], list):
                data['custom_questions'] = '\n'.join(data['custom_questions'])
            elif isinstance(data['custom_questions'], str):
                data['custom_questions'] = data['custom_questions']
        # Ensure grade is properly handled
        if 'grade' in data:
            try:
                data['grade'] = int(data['grade'])
            except (TypeError, ValueError):
                data['grade'] = 0
        return super().to_internal_value(data)

    def create(self, validated_data):
        print("Creating job with validated data:", validated_data)
        # Ensure grade is included in the creation
        if 'grade' not in validated_data:
            validated_data['grade'] = 0
        return super().create(validated_data)

    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'company_name', 'company_email', 'location',
            'salary', 'job_type', 'description', 'requirements',
            'custom_questions', 'status', 'grade', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at'] 