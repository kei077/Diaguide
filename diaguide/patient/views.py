from rest_framework import generics, permissions
from .models import (
    TensionArterielle, InjectionInsuline, Repas,
    Medication, ActiviteSportive, MesureGlycemie, Proche, Patient
)
from django.db.models import OuterRef, Subquery
from medecin.models import Medecin
from .serializers import PatientSummarySerializer
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    TensionArterielleSerializer, InjectionInsulineSerializer,
    RepasSerializer, MedicationSerializer, ActiviteSportiveSerializer,
    MesureGlycemieSerializer, ProcheSerializer, PatientUpdateSerializer, 
    GlucoseRecordSerializer, WeightRecordSerializer, InsulinRecordSerializer
)
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from io import BytesIO
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from interactions.models import AppointmentRequest
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

class PatientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({"error": "Only patients can access the dashboard."}, status=403)

        patient = request.user.patient_account

        latest_glucose = patient.glucose_records.order_by('-recorded_at').first()

        latest_weight = patient.weight_records.order_by('-recorded_at').first()

        latest_insulin = patient.insulin_records.order_by('-recorded_at').first()
        bmi = None
        if patient.height and latest_weight:
            try:
                height_meters = float(patient.height) / 100
                weight_kg = float(latest_weight.value)
                bmi = round(weight_kg / (height_meters ** 2), 1)
            except (TypeError, ValueError):
                bmi = None
        doctor_info = None
        if patient.doctor:
            doctor_info = {
                "name": f"Dr. {patient.doctor.user.nom} {patient.doctor.user.prenom}",
                "specialty": patient.doctor.specialty,
                "city": patient.doctor.city
            }

        next_appointment = AppointmentRequest.objects.filter(
            patient=patient,
            status__in=['confirmed', 'approved'],    # ← filtre sur les deux statuts
            date__gte=timezone.now()
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
                "bmi": bmi if bmi else None,
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

class DoctorPatientsListView(generics.ListAPIView):
    """
    GET /api/patient/doctor/patients/?email=<email_medecin>
    """
    serializer_class = PatientSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'medecin':
            raise PermissionDenied("Accès réservé aux médecins.")

        # 1) lecture du paramètre email
        email = self.request.query_params.get('email')
        if not email:
            raise PermissionDenied("Le paramètre 'email' est requis.")

        # 2) on récupère l'objet Medecin depuis l'adresse
        try:
            medecin = Medecin.objects.get(user__email=email)
        except Medecin.DoesNotExist:
            raise PermissionDenied("Médecin introuvable.")

        # 3) sécurité : l'utilisateur doit être ce même médecin
        if medecin != user.medecin_account:
            raise PermissionDenied("Vous ne pouvez consulter que vos propres patients.")

        # 4) filtrage des patients assignés ou avec RDV confirmed/approved
        return Patient.objects.filter(
            Q(doctor=medecin) |
            Q(
                appointments__medecin=medecin,
                appointments__status__in=['confirmed', 'approved']
            )
        ).distinct()

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Patient, GlucoseRecord, InsulinRecord, WeightRecord, Repas, Medication, ActiviteSportive
from medecin.models import Medecin

class DoctorPatientHealthView(APIView):
    """
    GET /api/patient/doctor/patients/health/?email=<email_medecin>
    Retourne pour chaque patient :
      - toutes les mesures de glycémie, insuline, poids, repas, activité, médication
      - calcul du BMI (à partir du poids et de la taille enregistrés sur le patient)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1) Vérification rôle
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can access this view."}, status=403)

        # 2) Vérification email
        email = request.query_params.get('email')
        if not email or email != request.user.email:
            return Response({"error": "Invalid email parameter"}, status=400)

        medecin = request.user.medecin_account

        # 3) Récupération des patients assignés ou avec RDV
        patients = Patient.objects.filter(
            Q(doctor=medecin) |
            Q(appointments__medecin=medecin, appointments__status__in=['confirmed', 'approved'])
        ).distinct()
        
        data = []
        for patient in patients:
            # 4) Récupérer tous les enregistrements
            print("type diabete:", patient.type_diabete)
            glucose_qs  = GlucoseRecord.objects.filter(patient=patient).order_by('-recorded_at')
            insulin_qs  = InsulinRecord.objects.filter(patient=patient).order_by('-recorded_at')
            weight_qs   = WeightRecord.objects.filter(patient=patient).order_by('-recorded_at')
            meal_qs     = Repas.objects.filter(patient=patient).order_by('-date_repas')
            activity_qs = ActiviteSportive.objects.filter(patient=patient).order_by('-date_heure')
            meds_qs     = Medication.objects.filter(patient=patient)
            tension_qs  = TensionArterielle.objects.filter(patient=patient).order_by('-date_heure')

            # 5) Calcul du BMI si possible
            bmi = None
            if patient.height and patient.weight:
                try:
                    h_m = float(patient.height) / 100
                    w_kg = float(patient.weight)
                    bmi = round(w_kg / (h_m * h_m), 1)
                except (TypeError, ValueError):
                    pass
            tensions_data = [
                {
                    'id': t.id,
                    'systolique': t.systolique,
                    'diastolique': t.diastolique,
                    'date_heure': t.date_heure,
                } for t in tension_qs
            ] 
            # 6) Construire le dictionnaire de réponse
            data.append({
                'id': patient.id,
                'nom': patient.user.nom,
                'prenom': patient.user.prenom,
                'type_diabete': patient.type_diabete,
                'health_metrics': {
                    'glucose_records': [
                        {
                            'id': g.id,
                            'value': g.value,
                            'date': g.recorded_at,
                            'notes': getattr(g, 'notes', None)
                        } for g in glucose_qs
                    ],
                    'insulin_records': [
                        {
                            'id': i.id,
                            'dose': i.dose,
                            'date': i.recorded_at,
                            'notes': getattr(i, 'notes', None)
                        } for i in insulin_qs
                    ],
                    'tension_records': tensions_data,
                    'weight_records': [
                        {
                            'id': w.id,
                            'value': w.value,
                            'date': w.recorded_at
                        } for w in weight_qs
                    ],
                    'meal_records': [
                        {
                            'id': r.id,
                            'type': r.type_repas,
                            'description': r.description,
                            'carbs': getattr(r, 'glucides', None),
                            'date': r.date_repas
                        } for r in meal_qs
                    ],
                    'activity_records': [
                        {
                            'id': a.id,
                            'type': a.type_activity,
                            'duration': a.duration,
                            'date': a.date_heure,
                            'notes': getattr(a, 'notes', None)
                        } for a in activity_qs
                    ],
                    'medication_records': [
                        {
                            'name': m.nom_medicament,
                            'description': m.description
                        } for m in meds_qs
                    ],
                    'bmi': bmi
                },
                'is_assigned': (patient.doctor == medecin)
            })

        return Response(data)

