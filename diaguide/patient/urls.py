from django.urls import path
from .views import *

urlpatterns = [
    path('tensions/', TensionArterielleListCreateView.as_view(), name='tension-list-create'),
    path('tensions/<int:pk>/', TensionArterielleDetailView.as_view(), name='tension-detail'),

    path('injections/', InjectionInsulineListCreateView.as_view(), name='injection-list-create'),
    path('injections/<int:pk>/', InjectionInsulineDetailView.as_view(), name='injection-detail'),

    path('repas/', RepasListCreateView.as_view(), name='repas-list-create'),
    path('repas/<int:pk>/', RepasDetailView.as_view(), name='repas-detail'),

    path('medications/', MedicationListCreateView.as_view(), name='medication-list-create'),
    path('medications/<int:pk>/', MedicationDetailView.as_view(), name='medication-detail'),

    path('activities/', ActiviteSportiveListCreateView.as_view(), name='activity-list-create'),
    path('activities/<int:pk>/', ActiviteSportiveDetailView.as_view(), name='activity-detail'),

    path('glycemies/', MesureGlycemieListCreateView.as_view(), name='glycemie-list-create'),
    path('glycemies/<int:pk>/', MesureGlycemieDetailView.as_view(), name='glycemie-detail'),

    path('proches/', ProcheListCreateView.as_view(), name='proche-list-create'),
    path('proches/<int:pk>/', ProcheDetailView.as_view(), name='proche-detail'),
]
