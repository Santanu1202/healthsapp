import uuid
from django.db import models

# Create your models here.
from accounts.models import Patient
from doctors.models import Doctor
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed','Completed'),
        ('Canceled', 'Canceled'),

    ]
    booking_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )
    booking_code = models.CharField(
    max_length=30,
    null=True,
    blank=True
    )
    patient = models.ForeignKey(
        Patient,
        on_delete = models.CASCADE
    
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete = models.CASCADE
    
    )
    appointment_date = models.DateField()
    time_slot =models.CharField(max_length = 100)
    status = models.CharField(
        max_length = 20,
        choices = STATUS_CHOICES,
        default = 'Pending'
    )
    symptoms = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    original_appointment_date = models.DateField(
        null=True,
        blank=True
    )

    queue_position = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    def __str__(self):
        return(
            f"{self.patient.name} - {self.doctor.name} - "
            f"{self.appointment_date} - {self.time_slot}"
        )
    