
from django.db import models
from accounts.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment


class Prescription(models.Model):

    # Database relationships
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="prescription"
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="prescriptions"
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="prescriptions"
    )

    # Booking and patient details snapshot
    booking_code = models.CharField(max_length=30)

    patient_name = models.CharField(max_length=100)
    patient_age = models.PositiveIntegerField(null=True, blank=True)
    patient_gender = models.CharField(max_length=10, blank=True)

    # Doctor details snapshot
    doctor_name = models.CharField(max_length=100)
    doctor_degree = models.CharField(max_length=100)
    doctor_registration_no = models.CharField(
        max_length=50,
        blank=True
    )

    # Prescription content
    diagnosis = models.TextField()
    medicines = models.TextField()
    instructions = models.TextField(blank=True)
    tests_advised = models.TextField(blank=True)

    follow_up_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_code} - {self.patient_name}"
