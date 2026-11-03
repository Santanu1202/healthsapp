
from rest_framework import serializers
from datetime import date, timedelta

from .models import Appointment



class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(
        source="doctor.name",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = [
            "patient",
            "status",
            "queue_position",
            "original_appointment_date",
            "created_at",
            "booking_id",
            "booking_code",
        ]

    def validate_appointment_date(self, value):
        today = date.today()
        max_date = today + timedelta(days=60)

        if value < today:
            raise serializers.ValidationError(
                "Past appointment dates are not allowed."
            )

        if value > max_date:
            raise serializers.ValidationError(
                "Appointments can only be booked within the next 60 days."
            )

        return value

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = [
            "patient",
            "status",
            "queue_position",
            "original_appointment_date",
            "created_at",
        ]

    def validate_appointment_date(self, value):
        today = date.today()
        max_date = today + timedelta(days=60)

        if value < today:
            raise serializers.ValidationError(
                "Past appointment dates are not allowed."
            )

        if value > max_date:
            raise serializers.ValidationError(
                "Appointments can only be booked within the next 60 days."
            )

        return value

class DoctorDashboardAppointmentSerializer(serializers.ModelSerializer):

    patient_id = serializers.CharField(source="patient.patient_id", read_only=True)
    patient_name = serializers.CharField(source="patient.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_id",
            "patient_name",
            "appointment_date",
            "time_slot",
            "symptoms",
            "status",
        ]