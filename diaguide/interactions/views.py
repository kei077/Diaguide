from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import DoctorAssignmentRequest, AppointmentRequest
from .serializers import DoctorAssignmentRequestSerializer, AppointmentRequestSerializer
from patient.models import Patient
from medecin.models import Medecin
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from datetime import datetime

class DoctorUpcomingAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Only doctors can view this.")

        return self.request.user.medecin_account.appointments.filter(
            status='confirmed',
            date__gte=datetime.now()
        ).order_by('date')

class CreateDoctorAssignmentRequestView(generics.CreateAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

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
            return Response({"error": "Only patients can request appointments."}, status=403)

        patient = request.user.patient_account
        medecin_id = request.data.get('medecin_id')
        date = request.data.get('date')
        reason = request.data.get('reason', '')

        if not medecin_id or not date:
            return Response({"error": "medecin_id and date are required."}, status=400)

        try:
            medecin = Medecin.objects.get(id=medecin_id)
        except Medecin.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=404)

        appointment = AppointmentRequest.objects.create(
            patient=patient, medecin=medecin, date=date, reason=reason
        )
        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=201)

class DoctorAssignmentRequestListView(generics.ListAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DoctorAssignmentRequest.objects.filter(medecin=self.request.user.medecin_account, status='pending')

class ApproveDoctorAssignmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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

        return Response({"message": "Assignment approved."})

class RejectDoctorAssignmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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

        return Response({"message": "Assignment request rejected."})

class MyDoctorAssignmentRequestView(generics.RetrieveAPIView):
    serializer_class = DoctorAssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view their assignment request.")
        return self.request.user.patient_account.assignment_request

class MyAppointmentRequestsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'patient':
            raise PermissionDenied("Only patients can view their appointments.")
        return self.request.user.patient_account.appointments.all().order_by('-date')

class DoctorAppointmentRequestsView(generics.ListAPIView):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Only doctors can view appointments.")

        status = self.request.query_params.get('status')
        queryset = self.request.user.medecin_account.appointments.all()

        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by('-date')

class ApproveAppointmentRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can approve appointments."}, status=403)

        try:
            appointment = AppointmentRequest.objects.get(id=request_id, medecin=request.user.medecin_account)
        except AppointmentRequest.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=404)

        appointment.status = 'confirmed'
        appointment.save()
        return Response({"message": "Appointment confirmed."})


class RejectAppointmentRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        if request.user.role != 'medecin':
            return Response({"error": "Only doctors can reject appointments."}, status=403)

        try:
            appointment = AppointmentRequest.objects.get(id=request_id, medecin=request.user.medecin_account)
        except AppointmentRequest.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=404)

        appointment.status = 'rejected'
        appointment.save()
        return Response({"message": "Appointment rejected."})

