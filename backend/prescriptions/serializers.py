
from rest_framework import serializers
from .models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_department = serializers.CharField(
        source="doctor.department",
        read_only=True
    )
    class Meta:
        model = Prescription
        fields = [
            "id",
            "appointment",
            "booking_code",
            "patient_name",
            "patient_age",
            "patient_gender",
            "doctor_name",
            "doctor_name",
            "doctor_department",
            "doctor_degree",   
            "doctor_degree",
            "doctor_registration_no",
            "diagnosis",
            "medicines",
            "instructions",
            "tests_advised",
            "follow_up_date",
            "created_at",
            "doctor_department",
        ]

        read_only_fields = [
            "id",
            "appointment",
            "booking_code",
            "patient_name",
            "patient_age",
            "patient_gender",
            "doctor_name",
            "doctor_degree",
            "doctor_registration_no",
            "created_at",
        ]
