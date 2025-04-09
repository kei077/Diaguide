from django.contrib import admin
from .models import Medecin

@admin.register(Medecin)
class MedecinAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialty', 'phone_number')
    search_fields = ('user__username', 'specialty')
