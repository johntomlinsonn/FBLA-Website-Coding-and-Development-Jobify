from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import JobPosting, UserProfile, Reference, Education
import logging
import json

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
    is_job_provider = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'resume', 'gpa', 'is_job_provider', 'account_holder_name', 'references', 'education']

    def validate_is_job_provider(self, value):
        if value is None:
            return False
        if isinstance(value, str):
            normalized_value = value.lower()
            if normalized_value in ['false', '0', 'no']:
                return False
            elif normalized_value in ['true', '1', 'yes']:
                return True
            # If it's a string not explicitly 'true' or 'false', treat as True
            # This handles cases where unexpected non-empty strings are sent
            return True
        return bool(value)

    def create(self, validated_data):
        return super().create(validated_data)

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
            try:
                # Try to parse as JSON first
                data['requirements'] = json.loads(instance.requirements)
            except json.JSONDecodeError:
                # If not JSON, split by comma
                data['requirements'] = [r.strip() for r in instance.requirements.split(',') if r.strip()]
        
        if isinstance(instance.custom_questions, str):
            try:
                # Try to parse as JSON first
                data['custom_questions'] = json.loads(instance.custom_questions)
            except json.JSONDecodeError:
                # If not JSON, split by newline
                data['custom_questions'] = [q.strip() for q in instance.custom_questions.split('\n') if q.strip()]
        
        # Ensure grade is included in the response
        data['grade'] = instance.grade
        return data

    def to_internal_value(self, data):
        # Convert lists to strings for requirements and custom_questions
        if 'requirements' in data:
            if isinstance(data['requirements'], list):
                # Store the list directly as JSON
                data['requirements'] = json.dumps(data['requirements'])
            elif isinstance(data['requirements'], str):
                try:
                    # Validate that it's proper JSON
                    json.loads(data['requirements'])
                    data['requirements'] = data['requirements']
                except json.JSONDecodeError:
                    # If not JSON, treat as comma-separated
                    data['requirements'] = json.dumps([r.strip() for r in data['requirements'].split(',') if r.strip()])
        
        if 'custom_questions' in data:
            if isinstance(data['custom_questions'], list):
                # Store the list directly as JSON
                data['custom_questions'] = json.dumps(data['custom_questions'])
            elif isinstance(data['custom_questions'], str):
                try:
                    # Validate that it's proper JSON
                    json.loads(data['custom_questions'])
                    data['custom_questions'] = data['custom_questions']
                except json.JSONDecodeError:
                    # If not JSON, treat as newline-separated
                    data['custom_questions'] = json.dumps([q.strip() for q in data['custom_questions'].split('\n') if q.strip()])
        
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