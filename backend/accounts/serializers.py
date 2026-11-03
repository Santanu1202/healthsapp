
from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from .models import Patient


class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )
    address = serializers.CharField(
        max_length=450,
        trim_whitespace=True
    )

    class Meta:
        model = Patient
        fields = [
            "name",
            "phone_number",
            "address",
            "age",
            "password",
            
        ]

    def create(self, validated_data):
        validated_data["password"] = make_password(
            validated_data["password"]
        )

        patient = Patient.objects.create(
            **validated_data
        )

        patient.patient_id = f"HP{patient.id:02d}"
        patient.save(update_fields=["patient_id"])

        return patient
