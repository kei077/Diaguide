from rest_framework import serializers
from .models import DoctorAssignmentRequest, AppointmentRequest

class DoctorAssignmentRequestSerializer(serializers.ModelSerializer):
    patient_id = serializers.ReadOnlyField(source='patient.id')
    medecin_id = serializers.ReadOnlyField(source='medecin.id')
    medecin_nom = serializers.CharField(source='medecin.user.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.user.prenom', read_only=True)

    class Meta:
        model = DoctorAssignmentRequest
        fields = ['id', 'patient_id', 'medecin_id', 'medecin_nom', 'medecin_prenom', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class AppointmentRequestSerializer(serializers.ModelSerializer):
    patient_id = serializers.ReadOnlyField(source='patient.id')
    medecin_id = serializers.ReadOnlyField(source='medecin.id')
    medecin_nom = serializers.CharField(source='medecin.user.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='medecin.user.prenom', read_only=True)

    class Meta:
        model = AppointmentRequest
        fields = ['id', 'patient_id', 'medecin_id', 'medecin_nom', 'medecin_prenom', 'date', 'reason', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']
