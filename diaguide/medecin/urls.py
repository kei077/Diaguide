from django.urls import path
from .views import MedecinListView, MedecinDetailView

urlpatterns = [
    path('medecins/', MedecinListView.as_view(), name='medecin-list'),
    path('medecins/<int:pk>/', MedecinDetailView.as_view(), name='medecin-detail'),
]
