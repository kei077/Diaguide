from rest_framework import generics, permissions
from .serializers import MedecinUpdateSerializer,MedecinSerializer
from .models import Medecin

class MedecinListView(generics.ListAPIView):
    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer
    permission_classes = [permissions.IsAuthenticated]

class MedecinDetailView(generics.RetrieveAPIView):
    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer
    permission_classes = [permissions.IsAuthenticated]

class MedecinUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = MedecinUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.medecin_account
