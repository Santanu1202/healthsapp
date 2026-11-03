
from django.db import models


class Doctor(models.Model):
    name = models.CharField(max_length=100)

    # Automatically generated Doctor ID (HD01, HD02...)
    doctor_id = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        null=True
    )

    # Medical Registration Number
    registration_no = models.CharField(
        max_length=50,
        unique=True,
         blank=True,
        null=True
    )

    department = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)

    # Email is optional
    email = models.EmailField(
        unique=True,
        blank=True,
        null=True
    )

    phone_number = models.CharField(
        max_length=20,
        unique=True
    )

    password = models.CharField(max_length=255)

    available_days = models.CharField(max_length=200)
    available_time = models.CharField(max_length=200)

    appointment_limit = models.IntegerField(default=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            last_doctor = Doctor.objects.order_by("-id").first()
            next_number = (last_doctor.id + 1) if last_doctor else 1
            self.doctor_id = f"HD{next_number:02d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.doctor_id} - {self.name}"
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False
