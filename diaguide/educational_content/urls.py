from django.urls import path
from .views import ContenuListCreateView, ContenuDetailView

urlpatterns = [
    path('articles/', ContenuListCreateView.as_view(), name='contenu-list-create'),
    path('articles/<int:pk>/', ContenuDetailView.as_view(), name='contenu-detail'),
]
