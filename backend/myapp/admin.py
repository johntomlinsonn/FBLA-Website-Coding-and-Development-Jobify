from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
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
    extra = 0 # Set to 0 to not show empty forms for new job postings by default
    fields = ('title', 'status', 'created_at') # Display relevant fields
    readonly_fields = ('title', 'status', 'created_at') # Make them read-only
    can_delete = False # Prevent deleting job postings from UserProfile inline

# Register the UserProfile model with inlines for Reference and Education
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_job_provider', 'account_holder_name')
    list_filter = ('is_job_provider',)
    search_fields = ('user__username', 'account_holder_name')
    inlines = [ReferenceInline, EducationInline, JobPostingInline,]

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
