from django.contrib import admin
from django.urls import path, include
from authentication.views import PatientRegistrationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('forum/', include('forum.urls')),
]
