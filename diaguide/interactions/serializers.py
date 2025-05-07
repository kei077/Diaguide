from rest_framework import serializers
from .models import DoctorAssignmentRequest, AppointmentRequest
from medecin.models import Medecin
import datetime
class DoctorAssignmentRequestSerializer(serializers.ModelSerializer):
    patient_id = serializers.ReadOnlyField(source='patient.id')
    medecin_id = serializers.ReadOnlyField(source='medecin.id')
    medecin_nom = serializers.CharField(source='medecin.user.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.user.prenom', read_only=True)

    class Meta:
        model = DoctorAssignmentRequest
        fields = ['id', 'patient_id', 'medecin_id', 'nom', 'prenom', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class AppointmentRequestSerializer(serializers.ModelSerializer):
    patient_id = serializers.ReadOnlyField(source='patient.id')
    patient_nom = serializers.CharField(source='patient.user.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.user.prenom', read_only=True)
    patient_age = serializers.SerializerMethodField()
    patient_type_diabete = serializers.CharField(source='patient.type_diabete', read_only=True)
    
    medecin_id = serializers.ReadOnlyField(source='medecin.id')
    medecin_nom = serializers.CharField(source='medecin.user.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.user.prenom', read_only=True)

    class Meta:
        model = AppointmentRequest
        fields = [
            'id',
            'patient_id', 'patient_nom', 'patient_prenom', 'patient_age', 'patient_type_diabete',
            'medecin_id', 'medecin_nom', 'medecin_prenom',
            'date', 'reason', 'status', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']
    def get_patient_age(self, obj):
        if obj.patient.date_of_birth:
            today = datetime.date.today()
            return today.year - obj.patient.date_of_birth.year - (
                (today.month, today.day) < (obj.patient.date_of_birth.month, obj.patient.date_of_birth.day)
            )
class MedecinSearchSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='user.nom')
    prenom = serializers.CharField(source='user.prenom')
    email = serializers.CharField(source='user.email')
    langues = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='nom_lang'
    )

    class Meta:
        model = Medecin
        fields = ['id', 'nom', 'prenom', 'email', 'INPE', 'specialty', 
                 'address', 'city', 'consultationPrice', 'description', 
                 'langues', 'horaire_travail', 'jours_disponible']