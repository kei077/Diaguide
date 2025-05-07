from rest_framework import serializers
from .models import Contenu
from authentication.models import User

class AuteurSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    id = serializers.IntegerField()
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Combine nom et prenom de l'utilisateur"""
        return f"{obj.prenom or ''} {obj.nom or ''}".strip() or obj.email

class ContenuSerializer(serializers.ModelSerializer):
    auteur = AuteurSerializer(read_only=True)
    
    class Meta:
        model = Contenu
        fields = [
            'id',
            'titre',
            'description',
            'text',
            'image',
            'video',
            'keywords',
            'date_publication',
            'auteur'
        ]
        read_only_fields = ['date_publication', 'auteur']