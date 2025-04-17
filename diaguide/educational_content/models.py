from django.db import models
from authentication.models import User

class Contenu(models.Model):
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    text = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)  # URL or path
    video = models.CharField(max_length=500, blank=True, null=True)  # URL or path

    keywords = models.CharField(max_length=255, blank=True)
    date_publication = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre
