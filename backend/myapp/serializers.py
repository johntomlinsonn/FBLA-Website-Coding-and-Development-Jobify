from rest_framework import serializers
from django.contrib.auth.models import User # Keep for UserProfile.user relation if UserProfile is AUTH_USER_MODEL
# Or preferably: from django.contrib.auth import get_user_model
# User = get_user_model() # This would be UserProfile if set as AUTH_USER_MODEL
from .models import JobPosting, UserProfile, Reference, Education, TodoItem, Skill, Message # Ensure UserProfile is imported
from datetime import datetime, timezone
import json

class UserBasicInfoSerializer(serializers.ModelSerializer):
    # Assuming 'obj' passed to methods will be a UserProfile instance
    username = serializers.CharField(source='user.username', read_only=True)
    profile_picture = serializers.SerializerMethodField() # Will call get_profile_picture
    profile_name = serializers.SerializerMethodField()    # Will call get_profile_name

    class Meta:
        model = UserProfile # Changed from User, assuming UserProfile is the active user model
        fields = [
            'id',                   # This will be UserProfile.id
            'username',             # Sourced from UserProfile.user.username
            'profile_picture',      # Method field
            'profile_name'          # Method field
        ]


    def get_profile_picture(self, obj: UserProfile):
        # obj is expected to be a UserProfile instance
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_profile_name(self, obj: UserProfile):
        # obj is expected to be a UserProfile instance
        if obj.account_holder_name:
            return obj.account_holder_name
        
        # Fallback to username from the related User model
        if hasattr(obj, 'user') and obj.user: # Check if UserProfile has 'user' and it's not None
            name = obj.user.get_full_name()
            if name:
                return name
            return obj.user.username # obj.user is the Django User instance
        return None # Should ideally not happen if UserProfile always has a user

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
    skills = serializers.SlugRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        slug_field='name',
        required=False,
    )
    user = UserSerializer(read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    resume_url = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField() # Add this line
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'resume', 'resume_url', 'profile_picture', 'profile_picture_url', 'gpa', # Add 'profile_picture' and 'profile_picture_url'
            'is_job_provider', 'account_holder_name', 'skills',
            'references', 'education'
        ]
    
    def get_resume_url(self, obj):
        if obj.resume:
            return self.context['request'].build_absolute_uri(obj.resume.url)
        return None

    def get_profile_picture_url(self, obj): # Add this method
        if obj.profile_picture:
            return self.context['request'].build_absolute_uri(obj.profile_picture.url)
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
    posted_by = serializers.PrimaryKeyRelatedField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'company_name', 'company_email', 'description', 'salary', 'location', 'job_type', 'requirements', 'custom_questions', 'posted_by', 'status', 'created_at', 'updated_at','grade']
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
        # Ensure 'user' is not in validated_data if it's meant to be set automatically
        # validated_data.pop('user', None) # Example: remove if it causes issues

        # Convert lists to JSON strings if they are not already
        if 'requirements' in validated_data and isinstance(validated_data['requirements'], list):
            validated_data['requirements'] = json.dumps(validated_data['requirements'])
        if 'custom_questions' in validated_data and isinstance(validated_data['custom_questions'], list):
            validated_data['custom_questions'] = json.dumps(validated_data['custom_questions'])
        
        # Set the user from the request context
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated: # request.user is AUTH_USER_MODEL instance
            validated_data['posted_by'] = request.user.userprofile 
        else:
            # Handle cases where user is not available in context
            pass 

        return super().create(validated_data)

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
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicInfoSerializer(read_only=True)
    recipient = UserBasicInfoSerializer(read_only=True)
    
    # Assuming Message.sender and Message.recipient are ForeignKeys to UserProfile (settings.AUTH_USER_MODEL)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), # Changed from User.objects.all()
        source='sender', 
        write_only=True, 
        required=False # Sender is set from request.user
    )
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), # Changed from User.objects.all()
        source='recipient', 
        write_only=True
    )
    timestamp_display = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'sender_id', 'recipient_id', 'content', 'timestamp', 'timestamp_display', 'is_read']
        read_only_fields = ['sender', 'recipient', 'timestamp', 'timestamp_display', 'is_read']

    def get_timestamp_display(self, obj):
        return obj.timestamp.strftime("%B %d, %Y, %I:%M %p")

    def create(self, validated_data):
        request = self.context.get('request')
        # request.user is an instance of settings.AUTH_USER_MODEL (assumed to be UserProfile)
        # Message.sender is an FK to settings.AUTH_USER_MODEL
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['sender'] = request.user
        else:
            # This should be caught by authentication_classes at the view level
            raise serializers.ValidationError("User not authenticated for sending message.")
        
        # 'recipient' will be set from 'recipient_id' by PrimaryKeyRelatedField's source mapping
        return super().create(validated_data)


class ConversationSerializer(serializers.Serializer): # Use serializers.Serializer for custom structure
    other_user = UserBasicInfoSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    last_message_timestamp = serializers.DateTimeField(read_only=True)
    unread_count = serializers.IntegerField(read_only=True)
    # Use other_user.id as the unique identifier for a conversation on the frontend
    id = serializers.IntegerField(source='other_user.id', read_only=True) 

    def to_representation(self, instance):
        # instance is expected to be a dictionary prepared in the view
        return super().to_representation(instance)