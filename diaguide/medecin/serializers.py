from rest_framework import serializers
from authentication.models import User
from authentication.serializers import UserSerializer
from .models import Medecin

class MedecinSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Medecin
        fields = '__all__'

    def create(self,validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        medecin = Medecin.objects.create(user=user, **validated_data)
        return medecin
    