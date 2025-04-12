from django.db import models
from authentication.models import User

class Langage(models.Model):
    nom_lang = models.CharField(max_length=50)

    def __str__(self):
        return self.nom_lang

class Medecin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='medecin_account')
    
    INPE = models.CharField(max_length=20, blank=True)
    horaire_travail = models.CharField(max_length=100, blank=True)  
    consultationPrice = models.DecimalField(max_digits=8, decimal_places=2, default=100.00)
    jours_disponible = models.CharField(max_length=100, blank=True)  
    specialty = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=100)
    description = models.TextField(blank=True) 

    langues = models.ManyToManyField(Langage, related_name='medecins')

    def __str__(self):
        return f"Dr. {self.user.username} ({self.specialty})"
