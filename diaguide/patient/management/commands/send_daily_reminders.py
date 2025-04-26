from django.core.management.base import BaseCommand
from patient.models import Patient, GlucoseRecord, WeightRecord, InsulinRecord
from django.core.mail import send_mail
from django.utils.timezone import now

class Command(BaseCommand):
    help = 'Send daily reminder emails to patients who did not submit health data today'

    def handle(self, *args, **kwargs):
        today = now().date()

        patients = Patient.objects.all()
        for patient in patients:
            missing_data = []

            if not patient.glucose_records.filter(recorded_at__date=today).exists():
                missing_data.append('glucose')

            if not patient.weight_records.filter(recorded_at__date=today).exists():
                missing_data.append('weight')

            if not patient.insulin_records.filter(recorded_at__date=today).exists():
                missing_data.append('insulin')

            if missing_data:
                try:
                    send_mail(
                        subject="Reminder to record your health data for today",
                        message=f"Hello {patient.user.nom} {patient.user.prenom},\n\nYou haven't recorded your {', '.join(missing_data)} today. Please update it!",
                        from_email=None,
                        recipient_list=[patient.user.email],
                        fail_silently=False,
                    )
                    self.stdout.write(self.style.SUCCESS(f"Reminder sent to {patient.user.email}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send to {patient.user.email}: {e}"))
