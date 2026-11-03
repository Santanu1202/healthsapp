
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Doctor


class DoctorJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        if validated_token.get("role") != "doctor":
            raise AuthenticationFailed(
                "Doctor access token required."
            )

        doctor_db_id = validated_token.get("doctor_db_id")

        if not doctor_db_id:
            raise AuthenticationFailed(
                "Doctor ID missing from token."
            )

        try:
            doctor = Doctor.objects.get(id=doctor_db_id)
        except Doctor.DoesNotExist:
            raise AuthenticationFailed(
                "Doctor not found."
            )

        return doctor
