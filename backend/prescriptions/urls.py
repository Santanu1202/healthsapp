from django.urls import path

from .views import create_prescription,doctor_patient_prescription_history,patient_today_prescriptions,patient_medical_history
urlpatterns = [
    path(
        "create/<int:appointment_id>/",
        create_prescription,
        name="create-prescription",
    ),
    path(
         "doctor-history/<int:patient_id>/",
         doctor_patient_prescription_history,
         name="doctor-patient-prescription-history",
    ),
    path(
    "patient-today/",
    patient_today_prescriptions,
    name="patient-today-prescriptions",
    ),
    path(
        "medical-history/",
        patient_medical_history,
        name="patient-medical-history",
    )
]