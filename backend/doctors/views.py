from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import DoctorRegistrationSerializer
from accounts.admin_authentication import AdminJWTAuthentication
from rest_framework.permissions import IsAdminUser
from .models import Doctor


@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_list(request):
    doctors = Doctor.objects.all().order_by('name')

    data = [
        {
            "id": doctor.id,
            "name": doctor.name,
            "department": doctor.department,
            "degree": doctor.degree,
            "available_days": doctor.available_days,
            "available_time": doctor.available_time,
            "appointment_limit": doctor.appointment_limit,
        }
        for doctor in doctors
    ]

    return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAdminUser])
def register_doctor(request):

    serializer = DoctorRegistrationSerializer(
        data=request.data
    )

    if serializer.is_valid():
        doctor = serializer.save()

        return Response(
            {
                "message": "Doctor registered successfully.",
                "doctor_id": doctor.doctor_id,
                "name": doctor.name,
                "registration_no": doctor.registration_no,
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def doctor_login(request):
    doctor_id = request.data.get("doctor_id", "").strip().upper()
    password = request.data.get("password", "")

    if not doctor_id or not password:
        return Response(
            {"error": "Doctor ID and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        doctor = Doctor.objects.get(doctor_id=doctor_id)
    except Doctor.DoesNotExist:
        return Response(
            {"error": "Invalid Doctor ID or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, doctor.password):
        return Response(
            {"error": "Invalid Doctor ID or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken()
    refresh["doctor_db_id"] = doctor.id
    refresh["role"] = "doctor"
    refresh["doctor_id"] = doctor.doctor_id

    return Response(
        {
            "message": "Doctor login successful.",
            "doctor_id": doctor.doctor_id,
            "name": doctor.name,
            "department": doctor.department,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_200_OK
    )
