from rest_framework import generics, permissions
from .models import Question, Answer
from .serializers import AnswerSerializer, QuestionSerializer
from .permissions import IsOwnerOrReadOnly
from django.shortcuts import get_object_or_404
from django.db import models

class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.select_related('author')\
                             .prefetch_related('answers__author')\
                             .order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Question.objects.select_related('author') \
                             .prefetch_related(
                                 models.Prefetch(
                                     'answers',
                                     queryset=Answer.objects.select_related('author')
                                 )
                             )

class AnswerListCreateView(generics.ListCreateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Answer.objects.filter(question_id=self.kwargs['question_id'])\
                           .select_related('author', 'question')\
                           .order_by('-created_at')

    def perform_create(self, serializer):
        question = get_object_or_404(Question, id=self.kwargs['question_id'])
        serializer.save(author=self.request.user, question=question)

class AnswerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Answer.objects.select_related('author', 'question')