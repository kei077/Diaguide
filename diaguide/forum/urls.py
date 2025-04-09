from django.urls import path
from .views import (
    QuestionListCreateView, QuestionDetailView,
    AnswerListCreateView, AnswerDetailView
)

urlpatterns = [
    path('questions/', QuestionListCreateView.as_view(), name='question-list-create'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),

    path('questions/<int:question_id>/answers/', AnswerListCreateView.as_view(), name='answer-list-create'),

    path('answers/<int:pk>/', AnswerDetailView.as_view(), name='answer-detail'),
]
