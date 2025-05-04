from rest_framework import serializers
from .models import Question, Answer
from authentication.serializers import UserSerializer

class AnswerSerializer(serializers.ModelSerializer):
    author   = UserSerializer(read_only=True)
    question = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Answer
        # on inclut 'question' ici
        fields = ['id', 'question', 'author', 'body', 'created_at']
        read_only_fields = ['question', 'author', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    author  = UserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'author', 'title', 'body', 'created_at', 'answers']
        read_only_fields = ['author', 'created_at']
