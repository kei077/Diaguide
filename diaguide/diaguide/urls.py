from django.contrib import admin
from django.urls import path, include
from authentication.views import PatientRegistrationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('forum/', include('forum.urls')),
    path('api/patient/', include('patient.urls')), 
    path('content/', include('educational_content.urls')),
    path('interactions/', include('interactions.urls')),
    path('api/medecin/', include('medecin.urls')),
    path('api/notif', include('notifications.urls')),
]


