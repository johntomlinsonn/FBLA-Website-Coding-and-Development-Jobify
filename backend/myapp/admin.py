from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.forms import ModelMultipleChoiceField, CheckboxSelectMultiple
from .models import TodoItem, UserProfile, JobPosting, Reference, Education

# Register your models here.
admin.site.register(TodoItem)

# Create a custom admin class for the User model
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')

# Unregister the default User model
admin.site.unregister(User)

# Register the User model with the custom admin class
admin.site.register(User, CustomUserAdmin)

# Inline admin classes for Reference and Education
class ReferenceInline(admin.TabularInline):
    model = Reference
    extra = 1

class EducationInline(admin.TabularInline):
    model = Education
    extra = 1

class JobPostingInline(admin.TabularInline):
    model = JobPosting
    extra = 1 # Allow adding new job postings directly
    fields = ('title', 'status', 'created_at') # Display relevant fields
    readonly_fields = ('created_at',) # Keep created_at read-only
    can_delete = True # Allow deleting job postings from UserProfile inline

# Register the UserProfile model with inlines for Reference and Education
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_job_provider', 'account_holder_name')
    list_filter = ('is_job_provider',)
    search_fields = ('user__username', 'account_holder_name')
    inlines = [ReferenceInline, EducationInline, JobPostingInline,]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Only show this field for job providers
        if obj and obj.is_job_provider:
            # Show all job postings in the selection field
            form.base_fields['managed_jobs'] = ModelMultipleChoiceField(
                queryset=JobPosting.objects.all(), # All jobs
                required=False,
                widget=CheckboxSelectMultiple,
                label="Manage Job Postings for this Profile"
            )
            # Pre-select jobs already assigned to this user
            form.initial['managed_jobs'] = obj.posted_jobs.all()
        return form

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        if obj and obj.is_job_provider and 'managed_jobs' in form.cleaned_data:
            selected_jobs = set(form.cleaned_data['managed_jobs'])
            current_jobs_by_this_user = set(obj.posted_jobs.all())

            # Jobs to assign (newly selected that were not previously assigned to this user)
            jobs_to_assign = selected_jobs - current_jobs_by_this_user
            for job in jobs_to_assign:
                job.posted_by = obj
                job.save()

            # Jobs to unassign (previously assigned to this user, but now not selected)
            jobs_to_unassign = current_jobs_by_this_user - selected_jobs
            for job in jobs_to_unassign:
                job.posted_by = None # Set to None to unassign. Consider setting to a default user if applicable.
                job.save()

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'created_at', 'status','grade')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'company_name', 'description')
    fields = ('title', 'company_name', 'company_email', 'location', 'salary', 'job_type', 'description', 'requirements', 'custom_questions', 'featured', 'status', 'grade', 'created_at','posted_by')
    actions = ['approve_jobs', 'deny_jobs']

    def approve_jobs(self, request, queryset):
        queryset.update(status='approved')
    approve_jobs.short_description = "Approve selected job postings"

    def deny_jobs(self, request, queryset):
        queryset.update(status='denied')
    deny_jobs.short_description = "Deny selected job postings"
