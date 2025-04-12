from rest_framework import serializers
from .models import Patient
from authentication.serializers import UserSerializer
from .models import (
    TensionArterielle,
    InjectionInsuline,
    Repas,
    Medication,
    ActiviteSportive,
    MesureGlycemie,
    Proche
)
from authentication.models import User


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Patient
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient


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
