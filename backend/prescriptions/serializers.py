
from rest_framework import serializers
from .models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):

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
            "doctor_degree",
            "doctor_registration_no",
            "diagnosis",
            "medicines",
            "instructions",
            "tests_advised",
            "follow_up_date",
            "created_at",
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
