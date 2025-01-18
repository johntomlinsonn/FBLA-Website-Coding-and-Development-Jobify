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

# Register the UserProfile model with inlines for Reference and Education
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'resume', 'gpa')
    search_fields = ('user__username',)
    inlines = [ReferenceInline, EducationInline]

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'status', 'user')
    list_filter = ('status', 'job_type')
    search_fields = ('title', 'company_name', 'location')
    actions = ['approve_jobs', 'deny_jobs']

    def approve_jobs(self, request, queryset):
        queryset.update(status='approved')
    approve_jobs.short_description = "Approve selected job postings"

    def deny_jobs(self, request, queryset):
        queryset.update(status='denied')
    deny_jobs.short_description = "Deny selected job postings"
