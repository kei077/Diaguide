from django.core.management.base import BaseCommand
from patient.models import Patient
from django.utils.timezone import now
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        today = now().date()

        patients = Patient.objects.all()
        for patient in patients:
            subject = "⏰ Daily Health Reminder"
            from_email = None  
            to = [patient.user.email]

            html_content = render_to_string('emails/daily_reminder.html', {
                'patient': patient.user,
            })

            msg = EmailMultiAlternatives(subject, '', from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
