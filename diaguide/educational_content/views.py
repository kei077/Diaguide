from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Contenu
from .serializers import ContenuSerializer
from .permissions import IsAuthorOrReadOnly

class ContenuListCreateView(generics.ListCreateAPIView):
    queryset = Contenu.objects.all().order_by('-date_publication')
    serializer_class = ContenuSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'medecin':
            raise PermissionDenied("Only doctors can create content.")
        serializer.save(auteur=self.request.user)


class ContenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contenu.objects.all()
    serializer_class = ContenuSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
