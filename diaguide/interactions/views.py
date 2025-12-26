from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import DoctorAssignmentRequest, AppointmentRequest
from .serializers import DoctorAssignmentRequestSerializer, AppointmentRequestSerializer, MedecinSearchSerializer
from patient.models import Patient
from medecin.models import Medecin
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from datetime import datetime
from notifications.models import Notification
from .serializers import MedecinSearchSerializer

class MedecinSearchView(generics.ListAPIView):
    serializer_class = MedecinSearchSerializer

    def get_queryset(self):
        queryset = Medecin.objects.all()
        
        # Filtres
        specialty = self.request.query_params.get('specialty')
        city = self.request.query_params.get('city')
        langues = self.request.query_params.getlist('langues')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if specialty:
            queryset = queryset.filter(specialty__icontains=specialty)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if langues:
            queryset = queryset.filter(langues__nom_lang__in=langues).distinct()
        if min_price:
            queryset = queryset.filter(consultationPrice__gte=min_price)
        if max_price:
            queryset = queryset.filter(consultationPrice__lte=max_price)

        return queryset.order_by('user_id')
    
class DoctorUpcomingAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        if self.request.user.role != 'doctor':
            raise PermissionDenied("Only doctors can view this.")

        return self.request.user.medecin_account.appointments.filter(
            status='confirmed',
            date__gte=datetime.now()
        ).order_by('date')

class CreateDoctorAssignmentRequestView(generics.CreateAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    

    def post(self, request):
        if request.user.role != 'patient':
            return Response({"error": "Only patients can assign doctors."}, status=403)

        patient = request.user.patient_account
        medecin_id = request.data.get('medecin_id')

        if not medecin_id:
            return Response({"error": "medecin_id is required."}, status=400)

        if hasattr(patient, 'assignment_request'):
            return Response({"error": "You already have a pending or accepted request."}, status=400)

        try:
            medecin = Medecin.objects.get(id=medecin_id)
        except Medecin.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=404)

        request_obj = DoctorAssignmentRequest.objects.create(patient=patient, medecin=medecin)
        serializer = self.get_serializer(request_obj)
        return Response(serializer.data, status=201)

class CreateAppointmentRequestView(generics.CreateAPIView):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'patient':
            return Response({"error": "Only patients can request appointments."}, status=status.HTTP_403_FORBIDDEN)

        patient = request.user.patient_account
        medecin_id = request.data.get('medecin_id')
        date_str = request.data.get('date')
        reason = request.data.get('reason', '')

        # Validation des champs requis
        if not medecin_id or not date_str:
            return Response(
                {"error": "medecin_id and date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Conversion de la date
            date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            if date <= datetime.now():
                return Response(
                    {"error": "Appointment date must be in the future."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            medecin = Medecin.objects.get(id=medecin_id)
        except Medecin.DoesNotExist:
            return Response(
                {"error": "Doctor not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier si le patient a déjà un rendez-vous en attente avec ce médecin
        existing_appointment = AppointmentRequest.objects.filter(
            patient=patient,
            medecin=medecin,
            status='pending'
        ).exists()
        
        if existing_appointment:
            return Response(
                {"error": "You already have a pending appointment with this doctor."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les conflits de dates
        conflicting_appointments = AppointmentRequest.objects.filter(
            medecin=medecin,
            date=date,
            status='confirmed'
        ).exists()
        
        if conflicting_appointments:
            return Response(
                {"error": "This time slot is already taken."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Création du rendez-vous
        appointment = AppointmentRequest.objects.create(
            patient=patient,
            medecin=medecin,
            date=date,
            reason=reason
        )

        # Création d'une notification pour le médecin
        Notification.objects.create(
            recipient=medecin.user,
            title="New Appointment Request",
            message=f"You have a new appointment request from {patient.user.nom} {patient.user.prenom} for {date}."
        )

        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DoctorAssignmentRequestListView(generics.ListAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DoctorAssignmentRequest.objects.filter(medecin=self.request.user.medecin_account, status='pending')

class ApproveDoctorAssignmentView(APIView):
    

    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can approve requests."}, status=403)

        try:
            assignment = DoctorAssignmentRequest.objects.get(id=request_id, medecin=request.user.medecin_account)
        except DoctorAssignmentRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=404)

        patient = assignment.patient
        patient.doctor = assignment.medecin  
        patient.save()

        assignment.status = 'approved'
        assignment.save()
        
        Notification.objects.create(
            recipient=patient.user,
            title="Doctor Assignment Approved",
            message=f"Dr. {assignment.medecin.user.nom} {assignment.medecin.user.prenom} has accepted to be your doctor."
        )

        return Response({"message": "Assignment approved."})

class RejectDoctorAssignmentView(APIView):
   

    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can reject requests."}, status=403)

        try:
            assignment = DoctorAssignmentRequest.objects.get(
                id=request_id, medecin=request.user.medecin_account, status='pending'
            )
        except DoctorAssignmentRequest.DoesNotExist:
            return Response({"error": "Request not found or already handled."}, status=404)

        assignment.status = 'rejected'
        assignment.save()

        Notification.objects.create(
            recipient=assignment.patient.user,
            title="Doctor Assignment Rejected",
            message=f"Dr. {assignment.medecin.user.nom} {assignment.medecin.user.prenom} has rejected your doctor assignment request."
        )

        return Response({"message": "Assignment request rejected."})

class MyDoctorAssignmentRequestView(generics.RetrieveAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    

    def get_object(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view their assignment request.")
        return self.request.user.patient_account.assignment_request

class MyAppointmentRequestsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
    

    def get_queryset(self):
        if self.request.user.role == 'patient':
            return self.request.user.patient_account.appointments.all().order_by('-date')
        elif self.request.user.role == 'medecin':
            return self.request.user.medecin_account.appointments.all().order_by('-date')
        else:
            raise PermissionDenied("Only patients or doctors can view appointments.")

class DoctorAppointmentRequestsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
   

    def get_queryset(self):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Only doctors can view appointments.")

        status = self.request.query_params.get('status')
        queryset = self.request.user.medecin_account.appointments.all()

        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by('-date')

class ApproveAppointmentRequestView(APIView):
  

    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can approve appointments."}, status=403)

        try:
            appointment = AppointmentRequest.objects.get(id=request_id, medecin=request.user.medecin_account)
        except AppointmentRequest.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=404)

        appointment.status = 'confirmed'
        appointment.save()

        Notification.objects.create(
            recipient=appointment.patient.user,
            title="Appointment Confirmed",
            message=f"Your appointment with Dr. {appointment.medecin.user.nom} {appointment.medecin.user.prenom} has been confirmed for {appointment.date}."
        )

        return Response({"message": "Appointment confirmed."})


class RejectAppointmentRequestView(APIView):
    
    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can reject appointments."}, status=403)

        try:
            appointment = AppointmentRequest.objects.get(id=request_id, medecin=request.user.medecin_account)
        except AppointmentRequest.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=404)

        appointment.status = 'rejected'
        appointment.save()

        Notification.objects.create(
            recipient=appointment.patient.user,
            title="Appointment Rejected",
            message=f"Your appointment request with Dr. {appointment.medecin.user.nom} {appointment.medecin.user.prenom} has been rejected."
        )

        return Response({"message": "Appointment rejected."})

