from django.db import models
from authentication.models import User

class Medecin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='medecin_account')
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"Dr. {self.user.username} ({self.specialty})"
