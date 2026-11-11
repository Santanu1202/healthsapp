from django.utils import timezone
from accounts.authentication import PatientJWTAuthentication
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from appointments.models import Appointment
from doctors.authentication import DoctorJWTAuthentication
from .models import Prescription
from .serializers import PrescriptionSerializer
from accounts.models import Patient


@api_view(["POST"])
@authentication_classes([DoctorJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_prescription(request, appointment_id):

    with transaction.atomic():

        # Find the appointment assigned to the logged-in doctor
        appointment = get_object_or_404(
            Appointment.objects.select_for_update(),
            id=appointment_id,
            doctor=request.user,
        )

        # Only approved or completed appointments can receive a prescription
        if appointment.status not in ["Approved", "Completed"]:
            return Response(
                {"error": "Prescription cannot be created for this appointment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate prescriptions
        if Prescription.objects.filter(appointment=appointment).exists():
            return Response(
                {"error": "Prescription already exists for this appointment."},
                status=status.HTTP_409_CONFLICT,
            )

        patient = appointment.patient
        doctor = appointment.doctor

        serializer = PrescriptionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save prescription immediately
        prescription = serializer.save(
            appointment=appointment,
            patient=patient,
            doctor=doctor,
            booking_code=appointment.booking_code or "",
            patient_name=patient.name,
            patient_age=patient.age,
            patient_gender=patient.gender,
            doctor_name=doctor.name,
            doctor_degree=doctor.degree,
            doctor_registration_no=doctor.registration_no or "",
        )

        # Automatically complete the appointment
        if appointment.status != "Completed":
            appointment.status = "Completed"
            appointment.save(update_fields=["status"])

    return Response(
        {
            "message": "Prescription saved successfully. Appointment marked as Completed.",
            "prescription": PrescriptionSerializer(prescription).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@authentication_classes([DoctorJWTAuthentication])
@permission_classes([IsAuthenticated])
def doctor_patient_prescription_history(request, patient_id):

    doctor = request.user

    prescriptions = Prescription.objects.filter(
        doctor=doctor,
        patient_id=patient_id,
        appointment__status="Completed",
    ).order_by("-created_at")

    serializer = PrescriptionSerializer(
        prescriptions,
        many=True
    )

    return Response(
        {
            "count": prescriptions.count(),
            "prescriptions": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

@api_view(["GET"])
@authentication_classes([PatientJWTAuthentication])
@permission_classes([IsAuthenticated])
def patient_today_prescriptions(request):

    patient = request.user
    today = timezone.localdate()

    prescriptions = Prescription.objects.filter(
        patient=patient,
        appointment__appointment_date=today,
    ).order_by("-created_at")

    serializer = PrescriptionSerializer(
        prescriptions,
        many=True
    )

    return Response(
        {
            "count": prescriptions.count(),
            "prescriptions": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

@api_view(["GET"])
@authentication_classes([PatientJWTAuthentication])
@permission_classes([IsAuthenticated])
def patient_medical_history(request):

    patient = request.user

    prescriptions = Prescription.objects.filter(
        patient=patient
    ).order_by("-created_at")

    serializer = PrescriptionSerializer(
        prescriptions,
        many=True
    )

    return Response(
        {
            "count": prescriptions.count(),
            "prescriptions": serializer.data,
        },
        status=status.HTTP_200_OK,
    )
@api_view(["GET"])
@authentication_classes([DoctorJWTAuthentication])
@permission_classes([IsAuthenticated])
def doctor_patient_details(request, patient_id, appointment_id):

    doctor = request.user

    # Verify that this appointment belongs to the logged-in doctor
    appointment = get_object_or_404(
        Appointment.objects.select_related("patient", "doctor"),
        id=appointment_id,
        doctor=doctor,
        patient__patient_id=patient_id,
    )

    patient = appointment.patient

    # Get previous prescriptions for this patient
    previous_prescriptions = Prescription.objects.filter(
        patient=patient,
        appointment__status="Completed",
    ).exclude(
        appointment=appointment
    ).order_by("-created_at")

    return Response(
        {
            "patient": {
                "patient_id": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "phone_number": patient.phone_number,
                "address": patient.address,
            },
            "appointment": {
                "id": appointment.id,
                "booking_code": appointment.booking_code,
                "appointment_date": appointment.appointment_date,
                "time_slot": appointment.time_slot,
                "symptoms": appointment.symptoms,
                "status": appointment.status,
            },
            "previous_prescriptions": PrescriptionSerializer(
                previous_prescriptions,
                many=True
            ).data,
            "is_first_visit": not previous_prescriptions.exists(),
        },
        status=status.HTTP_200_OK,
    )

