
from django.urls import path

from .views import (
    book_appointment,
    check_availability,
    doctor_appointments,
    update_appointment_status,
    patient_appointments,
    cancel_appointment,
    total_appointments,
    doctor_dashboard_appointments,
    admin_dashboard_stats,
    track_booking,
)

urlpatterns = [
    path(
        "book-appointment/",
        book_appointment,
        name="book-appointment"
    ),
    path(
        "check_availability/",
        check_availability,
        name="check_availability"
    ),
    path(
        "doctor-appointments/<int:doctor_id>/",
        doctor_appointments,
        name="doctor_appointments"
    ),
    path(
        "update-appointment-status/<int:appointment_id>/",
        update_appointment_status,
        name="update_appointment_status"
    ),
    path(
        "patient-appointments/",
        patient_appointments,
        name="patient_appointments"
    ),
    path(
        "cancel-appointment/<int:appointment_id>/",
        cancel_appointment,
        name="cancel_appointment"
    ),
    path(
        "total-appointments/",
        total_appointments,
        name="total_appointments"
    ),
    path(
        "doctor-dashboard/",
        doctor_dashboard_appointments,
        name="doctor_dashboard_appointments"
    ),
    path(
        "admin-dashboard-stats/",
        admin_dashboard_stats,
        name="admin-dashboard-stats"
    ),
    path(
        "track-booking/",
        track_booking,
        name="track-booking"
    )
]
