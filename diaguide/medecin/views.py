from rest_framework import generics, permissions
from .serializers import MedecinUpdateSerializer
from .models import Medecin

# Create your views here.
class MedecinUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = MedecinUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.medecin_account
