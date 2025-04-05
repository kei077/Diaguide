from django.db import models
from authentication.models import User

class Patient(models.Model):
    patient_id = models.CharField(max_length=10, unique=True)
    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female')],
        blank=True,
        null=True
    )
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in kg
    height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in cm
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_account")

    def __str__(self):
        return f"{self.user.email} - {self.patient_id}"
