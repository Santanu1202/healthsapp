
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import Patient


class PatientJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        patient_db_id = validated_token.get("user_id")

        if patient_db_id is None:
            raise AuthenticationFailed("Patient ID missing from token.")

        try:
            patient_db_id = int(patient_db_id)
            patient = Patient.objects.get(pk=patient_db_id)
        except (Patient.DoesNotExist, ValueError, TypeError):
            raise AuthenticationFailed("Patient not found.")

        print("Patient JWT authentication succeeded:", patient.patient_id)

        return patient
