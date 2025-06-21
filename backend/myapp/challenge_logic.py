import math
from django.utils import timezone
from django.db.models import Sum
from .models import UserProfile, Challenge, UserChallenge, Message

def recalculate_and_update_user_points(user_profile: UserProfile):
    """
    Recalculates the user's total points from all completed challenges.
    This provides a single source of truth for the user's score.
    """
    total_points = UserChallenge.objects.filter(
        user=user_profile,
        is_completed=True
    ).aggregate(
        total=Sum('challenge__points')
    )['total'] or 0

    user_profile.points = total_points

def calculate_profile_completion(user_profile: UserProfile) -> int:
    """Calculates the profile completion percentage based on actual model fields."""
    fields_to_check = [
        # User model fields
        user_profile.user.first_name,
        user_profile.user.last_name,
        user_profile.user.email,
        # UserProfile model fields
        user_profile.profile_picture,
        user_profile.resume,
        user_profile.gpa,
        user_profile.skills.exists(),
        user_profile.references.exists(),
        user_profile.education.exists(),
    ]
    total_fields = len(fields_to_check)
    
    # Count how many of the fields are filled/present
    completed_fields = 0
    for field in fields_to_check:
        if isinstance(field, bool): # For .exists() which returns True/False
            if field:
                completed_fields += 1
        elif field: # For other fields that can be None, empty string, etc.
            completed_fields += 1

    return math.floor((completed_fields / total_fields) * 100) if total_fields > 0 else 0


def check_application_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks challenges related to applying for jobs."""
    try:
        # Assumes criteria is like {'action': 'apply_to_jobs', 'count': 3}
        target_count = int(user_challenge.challenge.criteria.get('count', 1))
        current_count = user_profile.num_applications
        
        user_challenge.progress = {'current': min(current_count, target_count), 'target': target_count}
        
        if not user_challenge.is_completed and current_count >= target_count:
            user_challenge.is_completed = True
            user_challenge.completed_at = timezone.now()
            # Award points etc. can be handled by signals or here
            
        user_challenge.save()
    except (ValueError, TypeError):
        # Handle cases where criteria is not set or malformed
        pass


def check_profile_completion_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks challenges related to profile completion."""
    try:
        target_percentage = int(user_challenge.challenge.criteria.get('percentage', 100))
        current_percentage = calculate_profile_completion(user_profile)

        user_challenge.progress = {'current': min(current_percentage, 100), 'target': target_percentage}

        if not user_challenge.is_completed and current_percentage >= target_percentage:
            user_challenge.is_completed = True
            user_challenge.completed_at = timezone.now()
            
        user_challenge.save()
    except (ValueError, TypeError):
        pass


def check_first_challenge_completed(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has completed their first challenge of any type."""
    # Count all completed challenges, including meta-challenges.
    completed_challenges_count = UserChallenge.objects.filter(
        user=user_profile,
        is_completed=True
    ).exclude(id=user_challenge.id).count() # Exclude itself to prevent self-completion

    user_challenge.progress = {'current': min(completed_challenges_count, 1), 'target': 1}

    if not user_challenge.is_completed and completed_challenges_count >= 1:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
    
    user_challenge.save()

def check_multiple_challenges_completed(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has completed a specific number of challenges of any type."""
    try:
        # Expects criteria like {'count': 5}
        target_count = int(user_challenge.challenge.criteria.get('count', 1))

        # Count all completed challenges, including other meta-challenges.
        completed_challenges_count = UserChallenge.objects.filter(
            user=user_profile,
            is_completed=True
        ).exclude(id=user_challenge.id).count() # Exclude itself from the count

        user_challenge.progress = {'current': min(completed_challenges_count, target_count), 'target': target_count}

        if not user_challenge.is_completed and completed_challenges_count >= target_count:
            user_challenge.is_completed = True
            user_challenge.completed_at = timezone.now()

        user_challenge.save()
    except (ValueError, TypeError):
        pass # Fail gracefully if criteria is malformed

def check_inbox_zero(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has read all their messages."""
    unread_count = Message.objects.filter(recipient=user_profile, is_read=False).count()
    
    # This challenge is binary: either you have 0 unread, or you don't.
    # Progress can be shown as 1 (done) or 0 (not done).
    current_progress = 1 if unread_count == 0 else 0
    user_challenge.progress = {'current': current_progress, 'target': 1}

    if not user_challenge.is_completed and unread_count == 0:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
        
    user_challenge.save()


def check_resume_upload_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has uploaded a resume."""
    has_resume = bool(user_profile.resume)
    
    user_challenge.progress = {'current': 1 if has_resume else 0, 'target': 1}

    if not user_challenge.is_completed and has_resume:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
        
    user_challenge.save()

def check_received_message_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has received at least one message."""
    has_message = Message.objects.filter(recipient=user_profile).exists()
    
    user_challenge.progress = {'current': 1 if has_message else 0, 'target': 1}

    if not user_challenge.is_completed and has_message:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
        
    user_challenge.save()

def check_references_added_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has added at least one reference."""
    has_references = user_profile.references.exists()
    
    user_challenge.progress = {'current': 1 if has_references else 0, 'target': 1}

    if not user_challenge.is_completed and has_references:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
        
    user_challenge.save()

def check_favorited_job_challenge(user_profile: UserProfile, user_challenge: UserChallenge):
    """Checks if the user has favorited at least one job."""
    has_favorited = user_profile.favorited_jobs.exists()
    
    user_challenge.progress = {'current': 1 if has_favorited else 0, 'target': 1}

    if not user_challenge.is_completed and has_favorited:
        user_challenge.is_completed = True
        user_challenge.completed_at = timezone.now()
        
    user_challenge.save()


# --- Main Dispatcher ---

# A list of tuples guarantees the order of checks.
# More specific keywords should come before more general ones.
CHALLENGE_CHECKERS = [
    ('first challenge', check_first_challenge_completed),
    ('challenge', check_multiple_challenges_completed), # Catches "Challenge Champion" and "Complete 5 Challenges"
    ('apply', check_application_challenge),
    ('profile', check_profile_completion_challenge),
    ('inbox zero', check_inbox_zero),
    ('resume', check_resume_upload_challenge),
    ('message', check_received_message_challenge),
    ('reference', check_references_added_challenge),
    ('favorite', check_favorited_job_challenge),
]

def update_all_challenges_for_user(user_profile: UserProfile):
    """
    Iterates through all of a user's active challenges, updates their progress,
    recalculates total points, and saves the profile.
    """
    user_challenges = UserChallenge.objects.filter(user=user_profile, is_completed=False).select_related('challenge')

    for user_challenge in user_challenges:
        challenge_name = user_challenge.challenge.name.lower()
        
        # Find the appropriate checker function from the prioritized list
        for key, checker_function in CHALLENGE_CHECKERS:
            if key in challenge_name:
                checker_function(user_profile, user_challenge)
                break # Move to the next user_challenge after finding the first match
    
    # After checking challenges, recalculate points from the single source of truth.
    recalculate_and_update_user_points(user_profile)
    
    # Save the profile once to persist all changes (points, etc.)
    user_profile.save() 