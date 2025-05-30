# Generated by Django 5.2.1 on 2025-05-27 17:41

import django.db.models.deletion
import django.utils.timezone
import patient.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('medecin', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient_id', models.CharField(default=patient.models.generate_patient_id, editable=False, max_length=10, unique=True)),
                ('date_of_birth', models.DateField()),
                ('gender', models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female')], max_length=10, null=True)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5, null=True)),
                ('height', models.DecimalField(decimal_places=2, max_digits=5, null=True)),
                ('type_diabete', models.CharField(blank=True, max_length=50)),
                ('date_maladie', models.DateField(blank=True, null=True)),
                ('doctor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='patients', to='medecin.medecin')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='patient_account', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MesureGlycemie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_heure', models.DateTimeField()),
                ('contexte', models.CharField(max_length=100)),
                ('valeur', models.FloatField()),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='glycemies', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='Medication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom_medicament', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medications', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='InsulinRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dose', models.FloatField(help_text='Insulin dose in units (UI)')),
                ('recorded_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True, help_text='Optional note (e.g., before meal, after exercise)')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='insulin_records', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='InjectionInsuline',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_heure', models.DateTimeField()),
                ('dose', models.FloatField()),
                ('type_insuline', models.CharField(max_length=50)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='injections', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='GlucoseRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField()),
                ('recorded_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='glucose_records', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='ActiviteSportive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_heure', models.DateTimeField(default=django.utils.timezone.now)),
                ('type_activity', models.CharField(choices=[('walking', 'Walking'), ('running', 'Running'), ('swimming', 'Swimming'), ('cycling', 'Cycling'), ('strength_training', 'Strength Training'), ('other', 'Other')], max_length=100)),
                ('duration', models.PositiveIntegerField(help_text='Duration in minutes')),
                ('description', models.TextField(blank=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='Proche',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100)),
                ('prenom', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('telephone', models.CharField(max_length=20)),
                ('type_relation', models.CharField(max_length=50)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='proches', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='Repas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_repas', models.DateTimeField()),
                ('type_repas', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repas', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='TensionArterielle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_heure', models.DateTimeField()),
                ('diastolique', models.IntegerField()),
                ('systolique', models.IntegerField()),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tensions', to='patient.patient')),
            ],
        ),
        migrations.CreateModel(
            name='WeightRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField(help_text='Weight in kilograms')),
                ('recorded_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='weight_records', to='patient.patient')),
            ],
        ),
    ]
