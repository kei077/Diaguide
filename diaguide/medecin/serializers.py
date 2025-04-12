from rest_framework import serializers
from authentication.serializers import UserSerializer
from authentication.models import User
from .models import Medecin, Langage

class LangageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Langage
        fields = ['id', 'nom_lang']

class MedecinSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    languages = serializers.CharField(write_only=True)
    langues = LangageSerializer(many=True, read_only=True)

    class Meta:
        model = Medecin
        fields = [
            'user', 'INPE', 'consultationPrice',
            'specialty', 'address', 'city',
            'languages', 'langues',
            'horaire_travail', 'jours_disponible', 'description' 
        ]
        extra_kwargs = {
            'INPE' : {'required': False},
            'horaire_travail': {'required': False},
            'jours_disponible': {'required': False},
            'description': {'required': False}
        }

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        languages_string = validated_data.pop('languages')
        user = User.objects.create_user(**user_data)

        medecin = Medecin.objects.create(user=user, **validated_data)

        for lang in [l.strip() for l in languages_string.split(',')]:
            lang_obj, _ = Langage.objects.get_or_create(nom_lang=lang)
            medecin.langues.add(lang_obj)

        return medecin
