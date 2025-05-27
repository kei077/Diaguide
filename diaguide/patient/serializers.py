from rest_framework import serializers
from .models import Patient
from django.utils import timezone
from interactions.models import AppointmentRequest
from authentication.serializers import UserSerializer
from .models import (
    TensionArterielle,
    InjectionInsuline,
    Repas,
    Medication,
   ActiviteSportive,
    MesureGlycemie,
    Proche,
    WeightRecord,
)
from authentication.models import User
from .models import GlucoseRecord, InsulinRecord

class InsulinRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsulinRecord
        fields = ['id', 'dose', 'recorded_at', 'notes']


class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ['id', 'value', 'recorded_at']

class GlucoseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlucoseRecord
        fields = ['id', 'value', 'recorded_at']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Patient
        fields = '__all__'
        extra_kwargs = {
            'patient_id': {'read_only': True} 
        }

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'date_of_birth', 'gender', 'weight', 'height',
            'type_diabete', 'date_maladie'
        ]

class TensionArterielleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TensionArterielle
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }


class InjectionInsulineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InjectionInsuline
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }


class RepasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repas
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }

class ActiviteSportiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActiviteSportive
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }

class MesureGlycemieSerializer(serializers.ModelSerializer):
    class Meta:
        model = MesureGlycemie
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }

class ProcheSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proche
        fields = '__all__'
        extra_kwargs = {
            'patient': {'read_only': True}
        }
class PatientDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['weight', 'height']

class PatientSummarySerializer(serializers.ModelSerializer):
    # on expose ici l'email du User lié
    email = serializers.EmailField(source='user.email', read_only=True)
    # champs personnalisés
    age              = serializers.SerializerMethodField()
    type_diabete     = serializers.CharField(read_only=True)
    last_appointment = serializers.SerializerMethodField()
    last_reason      = serializers.SerializerMethodField()
    last_status      = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id',
            'patient_id',
            'email',
            'age',
            'type_diabete',
            'last_appointment',
            'last_reason',
            'last_status',
        ]

    def get_age(self, obj):
        dob = obj.date_of_birth
        if not dob:
            return None
        today = timezone.now().date()
        # calcul d'âge classique
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def _get_last_appt(self, patient):
        return (
            AppointmentRequest.objects
            .filter(
                patient=patient,
                status__in=['confirmed', 'approved'],
                date__lte=timezone.now()
            )
            .order_by('-date')
            .first()
        )

    def get_last_appointment(self, obj):
        appt = self._get_last_appt(obj)
        return appt.date if appt else None

    def get_last_reason(self, obj):
        appt = self._get_last_appt(obj)
        return appt.reason if appt else None

    def get_last_status(self, obj):
        appt = self._get_last_appt(obj)
        return appt.status if appt else None
class PatientProfileSerializer(serializers.ModelSerializer):
    weight_records = WeightRecordSerializer(many=True, read_only=True)
    glucose_records = GlucoseRecordSerializer(many=True, read_only=True)
    insulin_records = InsulinRecordSerializer(many=True, read_only=True)
    tensions = TensionArterielleSerializer(many=True, read_only=True)  # Correspond à related_name='tensions'
    injections = InjectionInsulineSerializer(many=True, read_only=True)  # Correspond à related_name='injections'
    repas = RepasSerializer(many=True, read_only=True)  # Correspond à related_name='repas'
    medications = MedicationSerializer(many=True, read_only=True)  # Correspond à related_name='medications'
    activities = ActiviteSportiveSerializer(many=True, read_only=True)  # Correspond à related_name='activities'
    glycemies = MesureGlycemieSerializer(many=True, read_only=True)  # Correspond à related_name='glycemies'
    proches = ProcheSerializer(many=True, read_only=True)  # Correspond à related_name='proches'

    class Meta:
        model = Patient
        fields = [
            'patient_id', 'date_of_birth', 'gender', 
            'weight', 'height', 'type_diabete', 'date_maladie',
            'weight_records', 'glucose_records', 'insulin_records',
            'tensions', 'injections', 'repas', 'medications',
            'activities', 'glycemies', 'proches'
        ]