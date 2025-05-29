from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from .views import (
    grade_job_live, grade_applicant_live,
    api_job_list, api_job_detail, api_apply_job, 
    api_user_profile, api_update_profile, api_register,
    api_login, api_logout, api_user_applications
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
    path('api/jobs/', api_job_list, name='api_job_list'),
    path('api/jobs/<int:pk>/', api_job_detail, name='api_job_detail'),
    path('api/jobs/<int:job_id>/apply/', api_apply_job, name='api_apply_job'),
    path('api/profile/', api_user_profile, name='api_user_profile'),
    path('api/profile/update/', api_update_profile, name='api_update_profile'),
    path('api/register/', api_register, name='api_register'),
    path('api/login/', api_login, name='api_login'),
    path('api/logout/', api_logout, name='api_logout'),
    path('api/my-applications/', api_user_applications, name='api_user_applications'),
    path('api/profile/references/', views.api_references, name='api_references'),
    path('api/profile/references/add/', views.api_add_reference, name='api_add_reference'),
    path('api/profile/references/<int:reference_id>/', views.api_delete_reference, name='api_delete_reference'),
    path('api/profile/education/', views.api_education, name='api_education'),
    path('api/profile/education/add/', views.api_add_education, name='api_add_education'),
    path('api/profile/education/<int:education_id>/', views.api_delete_education, name='api_delete_education'),
    path('api/grade_applicant_live/', grade_applicant_live, name='grade_applicant_live'),
    
    # Frontend routes - redirect to appropriate existing views or API endpoints
    # Fixed routes to address 404 errors
    path('jobs/', views.search, name='frontend_jobs'),  # Redirect to search view instead of api_job_list
    path('jobs/<int:job_id>/', views.apply, name='frontend_job_detail'),  # Redirect to apply view
    path('profile/', views.account, name='frontend_profile'),  # Direct mapping to account view
    path('logout/', views.signout_view, name='frontend_logout'),  # Direct mapping to signout view
    # Include API router URLs (for JWT and DRF ViewSets)
    path('api/', include('myapp.api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)