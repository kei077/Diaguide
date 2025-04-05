from django.urls import path, include
from authentication.views import UserRegistrationView, UserLoginView, UserLogoutView, PatientRegistrationView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('register/patient/', PatientRegistrationView.as_view(), name='patient-registration'),
]