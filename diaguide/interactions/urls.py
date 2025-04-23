from django.urls import path
from .views import (
    CreateDoctorAssignmentRequestView,
    CreateAppointmentRequestView,
    DoctorAssignmentRequestListView,
    ApproveDoctorAssignmentView,
    RejectDoctorAssignmentView,
    MyDoctorAssignmentRequestView,
    MyAppointmentRequestsView,
    ApproveAppointmentRequestView,
    RejectAppointmentRequestView,
    DoctorUpcomingAppointmentsView,
)

urlpatterns = [
    path('assign-doctor/', CreateDoctorAssignmentRequestView.as_view(), name='assign-doctor'),
    path('appointments/', CreateAppointmentRequestView.as_view(), name='request-appointment'),
    path('doctor/appointments/<int:request_id>/approve/', ApproveAppointmentRequestView.as_view(), name='approve-appointment'),
    path('doctor/appointments/<int:request_id>/reject/', RejectAppointmentRequestView.as_view(), name='reject-appointment'),
    path('doctor/appointments/upcoming/', DoctorUpcomingAppointmentsView.as_view(), name='doctor-upcoming-appointments'),

    path('doctor/assignments/', DoctorAssignmentRequestListView.as_view(), name='assignment-list'),
    path('doctor/assignments/<int:request_id>/approve/', ApproveDoctorAssignmentView.as_view(), name='approve-assignment'),
    path('doctor/assignments/<int:request_id>/reject/', RejectDoctorAssignmentView.as_view(), name='reject-assignment'),
   
    path('my/assignment/', MyDoctorAssignmentRequestView.as_view(), name='my-assignment-request'),
    path('my/appointments/', MyAppointmentRequestsView.as_view(), name='my-appointment-requests'),
]
