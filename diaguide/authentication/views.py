from .models import User
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate, login
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from patient.serializers import PatientSerializer, PatientUpdateSerializer
from medecin.serializers import MedecinSerializer, MedecinUpdateSerializer, LangageSerializer
from django.core.mail import send_mail
from django.conf import settings

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

        if user.role == 'patient':
            from patient.serializers import PatientSerializer
            profile = PatientSerializer(user.patient_account).data
        elif user.role == 'medecin':
            from medecin.serializers import MedecinSerializer
            profile = MedecinSerializer(user.medecin_account).data
        else:
            profile = {}

        data["profile"] = profile
        return Response(data)

    def put(self, request):
        user = request.user
        user.nom = request.data.get('nom', user.nom)
        user.prenom = request.data.get('prenom', user.prenom)
        user.save()

        if user.role == 'patient':
            serializer = PatientUpdateSerializer(user.patient_account, data=request.data, partial=True)
        elif user.role == 'medecin':
            serializer = MedecinUpdateSerializer(user.medecin_account, data=request.data, partial=True)
        else:
            return Response({"error": "Invalid role"}, status=400)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"})
        return Response(serializer.errors, status=400)


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
