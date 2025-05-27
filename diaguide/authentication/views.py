from .models import User
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate, login
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from patient.serializers import PatientSerializer, PatientUpdateSerializer,PatientProfileSerializer
from medecin.serializers import MedecinSerializer, MedecinUpdateSerializer, LangageSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.http import condition
from django.utils.decorators import method_decorator
from medecin.models import Langage
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

class MyProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "email": user.email,
            "nom": user.nom,
            "prenom": user.prenom,
            "role": user.role,
        }

        try:
            if user.role == 'patient' and hasattr(user, 'patient_account'):
                from patient.serializers import PatientProfileSerializer
                data["profile"] = PatientProfileSerializer(
                    user.patient_account,
                    context={'request': request}  # Important pour les URLs absolues
                ).data

            elif user.role == 'medecin' and hasattr(user, 'medecin_account'):
                from medecin.serializers import MedecinProfileSerializer
                data["profile"] = MedecinProfileSerializer(user.medecin_account).data
        except Exception as e:
            print(f"Error getting profile: {str(e)}")
            data["profile"] = {}

        return Response(data)

    def put(self, request):
        user = request.user
        response_data = {"message": "Profile updated successfully"}
        
        try:
            # Update user fields
            if 'nom' in request.data:
                user.nom = request.data['nom']
            if 'prenom' in request.data:
                user.prenom = request.data['prenom']
            user.save()

            # Update profile
            if 'profile' in request.data:
                if user.role == 'patient' and hasattr(user, 'patient_account'):
                    serializer = PatientUpdateSerializer(
                        user.patient_account,
                        data=request.data['profile'],
                        partial=True
                    )
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(serializer.errors, status=400)
                
                elif user.role == 'medecin' and hasattr(user, 'medecin_account'):
                    # Gestion spéciale pour les langues
                    profile_data = request.data['profile'].copy()
                    langues_data = profile_data.pop('langues', None)
                    
                    serializer = MedecinUpdateSerializer(
                        user.medecin_account,
                        data=profile_data,
                        partial=True
                    )
                    
                    if serializer.is_valid():
                        medecin = serializer.save()
                        
                        # Mise à jour des langues si fournies
                        if langues_data is not None:
                            if isinstance(langues_data, str):
                                # Cas où les langues sont envoyées comme string séparée par virgules
                                langues = [l.strip() for l in langues_data.split(',') if l.strip()]
                                medecin.langues.clear()
                                for lang in langues:
                                    lang_obj, _ = Langage.objects.get_or_create(nom_lang=lang)
                                    medecin.langues.add(lang_obj)
                            elif isinstance(langues_data, list):
                                # Cas où les langues sont envoyées comme liste d'IDs
                                medecin.langues.set(langues_data)
                        
                    else:
                        return Response(serializer.errors, status=400)

        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            return Response({"error": str(e)}, status=400)

        return Response(response_data)

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            if not created:
                token.delete()
                token = Token.objects.create(user=user)

            response_data = {
                'token': token.key,
                'email': user.email,
                'nom': user.nom,
                'prenom': user.prenom,
                'role': user.role,
            }

            if user.role == 'patient':
                try:
                    patient = user.patient_account
                    patient_data = PatientSerializer(patient).data
                    response_data['data'] = patient_data
                except:
                    response_data['data'] = None

            return Response(response_data)
        else:
            return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    def get(self, request, *args, **kwargs):
        return Response({
            "message": "Use POST with 'email' and 'password' to log in."
        })


class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token_key = request.auth.key
        token = Token.objects.get(key=token_key)
        token.delete()
        return Response({'detail': 'Successfully logged out.'})


class PatientRegistrationView(APIView):
    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            patient = serializer.save()

            try:
                subject = "Welcome to Diaguide 🎉"
                message = f"Hello {patient.user.prenom},\n\nThank you for registering as a patient at Diaguide. We're glad to have you onboard!"
                recipient_list = [patient.user.email]

                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
            except Exception as e:
                print(f"Failed to send email: {e}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedecinRegistrationView(APIView):
    def post(self, request):
        serializer = MedecinSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
