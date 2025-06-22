from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from .views import (
    grade_job_live, grade_applicant_live,
    api_job_list, api_job_detail, api_apply_job, 
    api_user_profile, api_update_profile, api_register,
    api_login, api_logout, api_user_applications,
    get_applicants, api_inbox, api_sent_messages, api_send_message, 
    api_mark_message_read, api_unread_message_count, api_get_conversations
)

urlpatterns = [
    # Regular web routes
    path('', views.index, name='index'),
    path('account/', views.account, name='account'),
    path('postjob/', views.postjob, name='postjob'),
    path('search/', views.search, name='search'),
    path('signin/', views.signin_view, name='signin'),
    path('signup/', views.signup_view, name='signup'),  
    path('signout/', views.signout_view, name='signout'),
    path('approve_job/<int:job_id>/', views.approve_job, name='approve_job'),
    path('deny_job/<int:job_id>/', views.deny_job, name='deny_job'),
    path('delete_job/<int:job_id>/', views.delete_job, name='delete_job'),
    path('apply/<int:job_id>/', views.apply, name='apply'),
    path('admin_panel/', views.admin_panel, name='admin_panel'),
    path('grade_job_live/', grade_job_live, name='grade_job_live'),
    
    # REST API endpoints
    path('jobs/', api_job_list, name='api_job_list'),
    path('jobs/<int:pk>/', api_job_detail, name='api_job_detail'),
    path('jobs/<int:job_id>/apply/', api_apply_job, name='api_apply_job'),
    path('profile/', api_user_profile, name='api_user_profile'),
    path('profile/update/', api_update_profile, name='api_update_profile'),
    path('register/', api_register, name='api_register'),
    path('login/', api_login, name='api_login'),
    path('logout/', api_logout, name='api_logout'),
    path('my-applications/', api_user_applications, name='api_user_applications'),
    path('profile/references/', views.api_references, name='api_references'),
    path('profile/references/add/', views.api_add_reference, name='api_add_reference'),
    path('profile/references/<int:reference_id>/delete/', views.api_delete_reference, name='api_delete_reference'),
    path('profile/education/', views.api_education, name='api_education'),
    path('profile/education/add/', views.api_add_education, name='api_add_education'),
    path('profile/education/<int:education_id>/delete/', views.api_delete_education, name='api_delete_education'),
    path('grade_applicant_live/', grade_applicant_live, name='grade_applicant_live'),
    path('grade_job_live/', views.grade_job_live, name='api_grade_job_live'),
    path('favorite-job/', views.api_favorite_job, name='api_favorite_job'),
    path('favorited-jobs/', views.api_favorited_jobs_list, name='api_favorited_jobs_list'),
    path('check-is-staff/', views.api_check_is_staff, name='api_check_is_staff'),
    path('job-post-success-rate/', views.job_post_success_rate, name='api_job_post_success_rate'),
    path('applicants/', get_applicants, name='get_applicants'),
      # Message API endpoints
    path('conversations/', api_get_conversations, name='api_get_conversations'),
    path('inbox/', api_inbox, name='api_inbox'),
    path('sent-messages/', api_sent_messages, name='api_sent_messages'),
    path('send-message/', api_send_message, name='api_send_message'),
    path('messages/<int:message_id>/read/', api_mark_message_read, name='api_mark_message_read'),
    path('messages/unread-count/', api_unread_message_count, name='api_unread_message_count'),
    
    # Frontend routes - redirect to appropriate existing views or API endpoints
    path('jobs/', views.search, name='frontend_jobs'),  # Redirect to search view instead of api_job_list
    path('jobs/<int:job_id>/', views.apply, name='frontend_job_detail'),  # Redirect to apply view
    path('profile/', views.account, name='frontend_profile'),  # Direct mapping to account view
    path('logout/', views.signout_view, name='frontend_logout'),  # Direct mapping to signout view
    # Include API router URLs (for JWT and DRF ViewSets)
    path('', include('myapp.api.urls')),

    # --- ADMIN API ENDPOINTS ---
    path('admin/jobs/', views.api_admin_list_jobs, name='api_admin_list_jobs'),
    path('admin/jobs/<int:job_id>/approve/', views.api_admin_approve_job, name='api_admin_approve_job'),
    path('admin/jobs/<int:job_id>/deny/', views.api_admin_deny_job, name='api_admin_deny_job'),
    path('admin/jobs/<int:job_id>/', views.api_admin_delete_job, name='api_admin_delete_job'),
    path('admin/dashboard-stats/', views.api_admin_dashboard_stats, name='api_admin_dashboard_stats'),
    path('admin/student-account-stats/', views.api_admin_student_account_stats, name='api_admin_student_account_stats'),
    path('gamification/profile/', views.api_gamification_profile, name='api_gamification_profile'),
    path('gamification/badges/', views.api_gamification_badges, name='api_gamification_badges'),
    path('gamification/challenges/', views.api_gamification_challenges, name='api_gamification_challenges'),
    path('gamification/leaderboard/', views.api_gamification_leaderboard, name='api_gamification_leaderboard'),
    path('admin/challenges/overhaul/', views.admin_overhaul_challenges, name='admin-overhaul-challenges'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)