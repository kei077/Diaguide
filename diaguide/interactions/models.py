from django.db import models
from patient.models import Patient
from medecin.models import Medecin

class DoctorAssignmentRequest(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='assignment_request')
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='assignment_requests')

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} → {self.medecin} ({self.status})"

class AppointmentRequest(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='appointments')

    date = models.DateTimeField()
    reason = models.TextField(blank=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} → {self.medecin} on {self.date} ({self.status})"
