from django.db import models
from authentication.models import User
import uuid
from medecin.models import Medecin
from django.utils import timezone
from django.db.models import Q
def generate_patient_id():
    return f"PT{uuid.uuid4().hex[:6].upper()}"  # e.g. PT3A1B9F

class Patient(models.Model):
    patient_id = models.CharField(max_length=10, unique=True, default=generate_patient_id, editable=False)
    
    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female')],
        blank=True,
        null=True
    )
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    type_diabete = models.CharField(max_length=50, blank=True)
    date_maladie = models.DateField(blank=True, null=True) 

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_account")
    doctor = models.ForeignKey(
        Medecin, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients'
    )

    def __str__(self):
        return f"{self.user.email} - {self.patient_id}"

## Tension Arterielle class
class TensionArterielle(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tensions')
    date_heure = models.DateTimeField()
    diastolique = models.IntegerField()
    systolique = models.IntegerField()

## Injection Insuline class 
class InjectionInsuline(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='injections')
    date_heure = models.DateTimeField()
    dose = models.FloatField()
    type_insuline = models.CharField(max_length=50)

## classe repas
class Repas(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='repas')
    date_repas = models.DateTimeField()
    type_repas = models.CharField(max_length=50)
    description = models.TextField(blank=True)

## classe Medication
class Medication(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medications')
    nom_medicament = models.CharField(max_length=100)
    description = models.TextField(blank=True)

## classe activite sportive 
class ActiviteSportive(models.Model):
    ACTIVITY_CHOICES = [
        ('walking', 'Walking'),
        ('running', 'Running'),
        ('swimming', 'Swimming'),
        ('cycling', 'Cycling'),
        ('strength_training', 'Strength Training'),
        ('other', 'Other'),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    date_heure = models.DateTimeField(default=timezone.now)
    type_activity = models.CharField(
        max_length=100,
        choices=ACTIVITY_CHOICES
    )
    duration = models.PositiveIntegerField(
        help_text="Duration in minutes"
    )
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_activity_type_display()} on {self.date_time:%Y-%m-%d %H:%M}"

## classe mesure glycemie
class MesureGlycemie(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='glycemies')
    date_heure = models.DateTimeField()
    contexte = models.CharField(max_length=100)
    valeur = models.FloatField()

## classe proche 
class Proche(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='proches')
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    type_relation = models.CharField(max_length=50)


## For timeline Data

class GlucoseRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='glucose_records')
    value = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.user.username}: {self.value} mg/dL at {self.recorded_at}"
    
class WeightRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='weight_records')
    value = models.FloatField(help_text="Weight in kilograms")
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.user.email} - {self.value} kg at {self.recorded_at}"

class InsulinRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='insulin_records')
    dose = models.FloatField(help_text="Insulin dose in units (UI)")
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional note (e.g., before meal, after exercise)")

    def __str__(self):
        return f"{self.patient.user.email} - {self.dose} UI at {self.recorded_at}"
