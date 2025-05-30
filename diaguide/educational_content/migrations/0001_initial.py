# Generated by Django 5.2.1 on 2025-05-27 17:41

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Contenu',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titre', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('text', models.TextField(blank=True, null=True)),
                ('image', models.CharField(blank=True, max_length=500, null=True)),
                ('video', models.CharField(blank=True, max_length=500, null=True)),
                ('keywords', models.CharField(blank=True, max_length=255)),
                ('date_publication', models.DateTimeField(auto_now_add=True)),
                ('auteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contenus', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
