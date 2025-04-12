from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'patient_id', 'date_of_birth', 'gender', 'weight', 'height')
    search_fields = ('user__email', 'patient_id')
    list_filter = ('gender',)
