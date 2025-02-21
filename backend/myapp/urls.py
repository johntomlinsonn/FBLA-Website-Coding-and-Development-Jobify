from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import grade_job_live,grade_applicant_live
urlpatterns = [
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
    path('grade_applicant_live/', grade_applicant_live, name='grade_applicant_live'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)