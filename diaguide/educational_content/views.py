from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Contenu
from .serializers import ContenuSerializer
from .permissions import IsAuthorOrReadOnly

class ContenuListCreateView(generics.ListCreateAPIView):
    serializer_class = ContenuSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contenu.objects.select_related('auteur').order_by('-date_publication')

    def perform_create(self, serializer):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Seuls les médecins peuvent créer du contenu.")
        serializer.save(auteur=self.request.user)

class ContenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contenu.objects.select_related('auteur')
    serializer_class = ContenuSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]