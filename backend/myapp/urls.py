from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='index'),
    path('account/', views.account, name='account'),
    path('postjob/', views.postjob, name='postjob'),
    path('search/', views.search, name='search'),
    path('signin/', views.signin_view, name='signin'),
    path('signup/', views.signup_view, name='signup'),  # Fix route to signup_view
    path('signout/', views.signout_view, name='signout'),
    path('approve_job/<int:job_id>/', views.approve_job, name='approve_job'),
    path('deny_job/<int:job_id>/', views.deny_job, name='deny_job'),
    path('delete_job/<int:job_id>/', views.delete_job, name='delete_job'),
    path('apply/<int:job_id>/', views.apply, name='apply'),
    path('admin_panel/', views.admin_panel, name='admin_panel'),  # Add this line
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)