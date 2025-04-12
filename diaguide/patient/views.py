from rest_framework import generics, permissions
from .models import (
    TensionArterielle, InjectionInsuline, Repas,
    Medication, ActiviteSportive, MesureGlycemie, Proche
)
from .serializers import (
    TensionArterielleSerializer, InjectionInsulineSerializer,
    RepasSerializer, MedicationSerializer, ActiviteSportiveSerializer,
    MesureGlycemieSerializer, ProcheSerializer
)

# Helper to get the current user's patient
def get_patient_from_user(user):
    return getattr(user, 'patient_account', None)


# Tension Arterielle
class TensionArterielleListCreateView(generics.ListCreateAPIView):
    serializer_class = TensionArterielleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TensionArterielle.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class TensionArterielleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TensionArterielleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TensionArterielle.objects.filter(patient__user=self.request.user)


# Injection Insuline
class InjectionInsulineListCreateView(generics.ListCreateAPIView):
    serializer_class = InjectionInsulineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InjectionInsuline.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class InjectionInsulineDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InjectionInsulineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InjectionInsuline.objects.filter(patient__user=self.request.user)


# Repas
class RepasListCreateView(generics.ListCreateAPIView):
    serializer_class = RepasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Repas.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_account)

class RepasDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RepasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Repas.objects.filter(patient__user=self.request.user)


# Medication
class MedicationListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient__user=self.request.user)


# Activite Sportive
class ActiviteSportiveListCreateView(generics.ListCreateAPIView):
    serializer_class = ActiviteSportiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActiviteSportive.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class ActiviteSportiveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ActiviteSportiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActiviteSportive.objects.filter(patient__user=self.request.user)


# Mesure Glycemie
class MesureGlycemieListCreateView(generics.ListCreateAPIView):
    serializer_class = MesureGlycemieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MesureGlycemie.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class MesureGlycemieDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MesureGlycemieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MesureGlycemie.objects.filter(patient__user=self.request.user)


# Proche
class ProcheListCreateView(generics.ListCreateAPIView):
    serializer_class = ProcheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proche.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=get_patient_from_user(self.request.user))

class ProcheDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProcheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Proche.objects.filter(patient__user=self.request.user)
