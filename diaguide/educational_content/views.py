from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Contenu
from .serializers import ContenuSerializer
from .permissions import IsAuthorOrReadOnly
import feedparser
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime
from django.utils import timezone
from authentication.models import User
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

def strip_html(raw_html):
    """Supprime toutes les balises HTML et retourne du texte brut."""
    if not raw_html:
        return ""
    return BeautifulSoup(raw_html, 'html.parser').get_text(separator=" ", strip=True)

# Utilisateur auteur : "Diabetologie Pratique"
AUTEUR_EMAIL = "diabetologie@pratique.com"
user = User.objects.get(email=AUTEUR_EMAIL)

url = "https://www.diabetologie-pratique.com/journal/feed.xml"
feed = feedparser.parse(url)

added = 0
for entry in feed.entries:
    summary_html = entry.get('summary', '')
    soup = BeautifulSoup(summary_html, 'html.parser')

    # Image
    img_tag = soup.find('img')
    image_url = img_tag['src'] if img_tag else ''

    # Thématique
    thematique_div = soup.find('div', class_="field-name-field-thematique")
    thematique = strip_html(str(thematique_div)) if thematique_div else ""

    # Chapeau/intro
    chapeau_div = soup.find('div', class_="field-name-field-chapeau-article-journal")
    chapeau = strip_html(str(chapeau_div)) if chapeau_div else ""

    titre = strip_html(entry.get("title", ""))
    auteur = strip_html(entry.get("author", ""))

    lien = entry.get("link", "")
    date_pub = None
    if "published_parsed" in entry:
        date_pub = datetime(*entry.published_parsed[:6])
    else:
        date_pub = timezone.now()

    # Vérifier doublon par titre
    if Contenu.objects.filter(titre=titre).exists():
        print(f"Doublon ignoré : {titre}")
        continue

    # Ajouter le lien à la fin du texte
    texte_final = chapeau + "\n\nLire l'article complet : " + lien

    article = Contenu(
        auteur=user,
        titre=titre,
        description=chapeau,
        text=texte_final,
        image=image_url,
        video="",
        keywords=thematique,
        date_publication=date_pub,
    )
    article.save()
    print(f"Ajouté : {titre}")
    added += 1

print(f"\nTotal ajouté : {added}")