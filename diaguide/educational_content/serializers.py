from rest_framework import serializers
from .models import Contenu
from authentication.serializers import UserSerializer

class ContenuSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()
    auteur_prenom = serializers.SerializerMethodField()

    class Meta:
        model = Contenu
        fields = [
            'id', 'titre', 'description', 'text', 'image', 'video',
            'keywords', 'date_publication',
            'auteur_nom', 'auteur_prenom'
        ]

    def get_auteur_nom(self, obj):
        return obj.auteur.nom

    def get_auteur_prenom(self, obj):
        return obj.auteur.prenom
