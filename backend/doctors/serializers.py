
from rest_framework import serializers
from .models import Doctor


class DoctorRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "doctor_id",
            "name",
            "registration_no",
            "department",
            "degree",
            "phone_number",
            "available_days",
            "available_time",
            "password",
        ]

        read_only_fields = ["id", "doctor_id"]

    def validate_registration_no(self, value):
        value = value.strip()

        if Doctor.objects.filter(registration_no=value).exists():
            raise serializers.ValidationError(
                "This medical registration number is already registered."
            )

        return value

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password

        validated_data["password"] = make_password(
            validated_data["password"]
        )

        return Doctor.objects.create(**validated_data)

    def validate_registration_no(self, value):
     value = value.strip()

     if not value:
        raise serializers.ValidationError(
            "Medical registration number is required."
        )

     if len(value) > 20:
        raise serializers.ValidationError(
            "Medical registration number cannot exceed 20 digits."
        )

     if Doctor.objects.filter(registration_no=value).exists():
        raise serializers.ValidationError(
            "This medical registration number is already registered."
        )

     return value


def validate_phone_number(self, value):
    value = value.strip()

    if not value.isdigit():
        raise serializers.ValidationError(
            "Phone number must contain digits only."
        )

    if len(value) != 10:
        raise serializers.ValidationError(
            "Phone number must be exactly 10 digits."
        )

    return value