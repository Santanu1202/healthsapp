
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Patient
from .serializers import PatientRegistrationSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_patient(request):
    serializer = PatientRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        patient = serializer.save()

        return Response(
            {
                "message": "Patient registered successfully",
                "patient_id": patient.patient_id,
                "name": patient.name,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def patient_login(request):
    patient_id = request.data.get("patient_id", "").strip()
    password = request.data.get("password", "")

    if not patient_id or not password:
        return Response(
            {"error": "Patient ID and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    patient = Patient.objects.filter(patient_id=patient_id).first()

    if not patient or not check_password(password, patient.password):
        return Response(
            {"error": "Invalid patient ID or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken()
    refresh["user_id"] = str(patient.id)
    # refresh["token_type"] = "refresh"
    print("Patient database ID:", patient.id)
    print("JWT user_id claim:", refresh.get("user_id"))

    return Response(
        {
            "message": "Patient login successful.",
            "patient_id": patient.patient_id,
            "name": patient.name,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_200_OK,
    )
from django.contrib.auth import authenticate


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None or not user.is_active or not user.is_staff:
        return Response(
            {"error": "Invalid admin username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    refresh["role"] = "admin"
    return Response(
        {
            "message": "Admin login successful.",
            "username": user.username,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_200_OK,
    )
