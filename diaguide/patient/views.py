from rest_framework import generics, permissions
from .models import (
    TensionArterielle, InjectionInsuline, Repas,
    Medication, ActiviteSportive, MesureGlycemie, Proche, Patient
)
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    TensionArterielleSerializer, InjectionInsulineSerializer,
    RepasSerializer, MedicationSerializer, ActiviteSportiveSerializer,
    MesureGlycemieSerializer, ProcheSerializer, PatientUpdateSerializer, 
    GlucoseRecordSerializer, WeightRecordSerializer, InsulinRecordSerializer
)
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from interactions.models import AppointmentRequest
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

class PatientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({"error": "Only patients can access the dashboard."}, status=403)

        patient = request.user.patient_account

        latest_glucose = patient.glucose_records.order_by('-recorded_at').first()

        latest_weight = patient.weight_records.order_by('-recorded_at').first()

        latest_insulin = patient.insulin_records.order_by('-recorded_at').first()

        doctor_info = None
        if patient.doctor:
            doctor_info = {
                "name": f"Dr. {patient.doctor.user.nom} {patient.doctor.user.prenom}",
                "specialty": patient.doctor.specialty,
                "city": patient.doctor.city
            }

        next_appointment = AppointmentRequest.objects.filter(
            patient=patient,
            status='confirmed',
            date__gte=datetime.now()
        ).order_by('date').first()

        appointment_info = None
        if next_appointment:
            appointment_info = {
                "date": next_appointment.date,
                "reason": next_appointment.reason
            }

        data = {
            "metrics": {
                "glucose": latest_glucose.value if latest_glucose else None,
                "weight": latest_weight.value if latest_weight else None,
                "insulin": latest_insulin.dose if latest_insulin else None,
            },
            "doctor": doctor_info,
            "next_appointment": appointment_info
        }

        return Response(data)

class DoctorPatientGlucoseView(ListAPIView):
    serializer_class = GlucoseRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Only doctors can view this data.")

        patient_id = self.kwargs.get('patient_id')
        try:
            patient = Patient.objects.get(id=patient_id, doctor=self.request.user.medecin_account)
        except Patient.DoesNotExist:
            raise PermissionDenied("You do not have access to this patient's data.")

        return patient.glucose_records.order_by('-recorded_at')

class InsulinRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = InsulinRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view insulin records.")
        return self.request.user.patient_account.insulin_records.order_by('-recorded_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can add insulin records.")
        serializer.save(patient=self.request.user.patient_account)

class WeightRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = WeightRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view weight records.")
        return self.request.user.patient_account.weight_records.order_by('-recorded_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can add weight records.")
        serializer.save(patient=self.request.user.patient_account)

class GlucoseRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = GlucoseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view their data.")
        return self.request.user.patient_account.glucose_records.order_by('-recorded_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can submit data.")
        serializer.save(patient=self.request.user.patient_account)

# Helper to get the current user's patient
def get_patient_from_user(user):
    return getattr(user, 'patient_account', None)

class PatientUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.patient_account


# Tension Arterielle
class TensionArterielleListCreateView(generics.ListCreateAPIView):
    serializer_class = TensionArterielleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TensionArterielle.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class TensionArterielleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TensionArterielleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TensionArterielle.objects.filter(patient__user=self.request.user)


# Injection Insuline
class InjectionInsulineListCreateView(generics.ListCreateAPIView):
    serializer_class = InjectionInsulineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InjectionInsuline.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class InjectionInsulineDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InjectionInsulineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InjectionInsuline.objects.filter(patient__user=self.request.user)


# Repas
class RepasListCreateView(generics.ListCreateAPIView):
    serializer_class = RepasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Repas.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_account)

class RepasDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RepasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Repas.objects.filter(patient__user=self.request.user)


# Medication
class MedicationListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient__user=self.request.user)


# Activite Sportive
class ActiviteSportiveListCreateView(generics.ListCreateAPIView):
    serializer_class = ActiviteSportiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActiviteSportive.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class ActiviteSportiveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ActiviteSportiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActiviteSportive.objects.filter(patient__user=self.request.user)


# Mesure Glycemie
class MesureGlycemieListCreateView(generics.ListCreateAPIView):
    serializer_class = MesureGlycemieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MesureGlycemie.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class MesureGlycemieDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MesureGlycemieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MesureGlycemie.objects.filter(patient__user=self.request.user)


# Proche
class ProcheListCreateView(generics.ListCreateAPIView):
    serializer_class = ProcheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proche.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        proche = serializer.save(patient=get_patient_from_user(self.request.user))
        
        try:
            subject = "You have been added as an emergency contact"
            from_email = None  
            recipient_list = [proche.email]

            html_content = render_to_string('emails/proche_notification.html', {
                'proche': proche,
                'patient': proche.patient.user,
            })

            msg = EmailMultiAlternatives(subject, '', from_email, recipient_list)
            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print(f"Failed to send email to proche: {e}")

class ProcheDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProcheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proche.objects.filter(patient__user=self.request.user)
