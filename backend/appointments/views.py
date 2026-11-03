
from datetime import date, datetime, timedelta

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.models import Patient
from doctors.models import Doctor
from .models import Appointment
from .serializers import AppointmentSerializer,DoctorDashboardAppointmentSerializer
from doctors.authentication import DoctorJWTAuthentication

def doctor_is_available(doctor, appointment_date, time_slot):
    available_days = {
        day.strip().lower()
        for day in doctor.available_days.split(",")
        if day.strip()
    }

    requested_day = appointment_date.strftime("%A").lower()

    if requested_day not in available_days:
        return False, (
            f"This doctor is not available on "
            f"{appointment_date.strftime('%A')}."
        )

    try:
        start_text, end_text = doctor.available_time.split("-")

        doctor_start = datetime.strptime(
            start_text.strip().upper().replace(" ", ""),  "%I:%M%p"
        ).time()

        doctor_end = datetime.strptime(
            end_text.strip().upper().replace(" ", ""),  "%I:%M%p"
        ).time()
    except ValueError:
        return False, "The doctor's available-time format is invalid."

    try:
        slot_start_text, slot_end_text = time_slot.split("-")

        slot_start = datetime.strptime(
            slot_start_text.strip(), "%I:%M %p"
        ).time()

        slot_end = datetime.strptime(
            slot_end_text.strip(), "%I:%M %p"
        ).time()
    except ValueError:
        return False, (
            "Invalid time-slot format. "
            "Use '10:00 AM - 10:30 AM'."
        )

    if slot_start >= slot_end:
        return False, "The appointment end time must be after its start time."

    if slot_start < doctor_start or slot_end > doctor_end:
        return False, (
            f"This doctor is available only between "
            f"{doctor.available_time}."
        )

    if slot_start.minute not in (0, 30) or slot_end.minute not in (0, 30):
        return False, "Appointments must use 30-minute time slots."

    if slot_start.second or slot_end.second:
        return False, "Invalid appointment time."

    slot_start_minutes = slot_start.hour * 60 + slot_start.minute
    slot_end_minutes = slot_end.hour * 60 + slot_end.minute

    if slot_end_minutes - slot_start_minutes != 30:
        return False, "Each appointment must be exactly 30 minutes."

    return True, None



def get_available_slots(doctor, requested_date):
    valid_day = {
        day.strip().lower()
        for day in doctor.available_days.split(",")
        if day.strip()
    }

    if requested_date.strftime("%A").lower() not in valid_day:
        return []

    try:
        start_text, end_text = doctor.available_time.split("-")

        start_time = datetime.strptime(
            start_text.strip().upper().replace(" ", ""),
            "%I:%M%p"
        ).time()

        end_time = datetime.strptime(
            end_text.strip().upper().replace(" ", ""),
            "%I:%M%p"
        ).time()

    except ValueError:
        return []

    current = datetime.combine(requested_date, start_time)
    finish = datetime.combine(requested_date, end_time)
    slots = []

    while current + timedelta(minutes=30) <= finish:
        slot_end = current + timedelta(minutes=30)

        slot_label = (
            f"{current.strftime('%I:%M %p')} - "
            f"{slot_end.strftime('%I:%M %p')}"
        )

        slots.append(slot_label)
        current = slot_end

    return slots

    valid_day = {
        day.strip().lower()
        for day in doctor.available_days.split(",")
        if day.strip()
    }

    if requested_date.strftime("%A").lower() not in valid_day:
        return []

    try:
        start_text, end_text = doctor.available_time.split("-")

        start_time = datetime.strptime(
            start_text.strip(), "%I.%M%p"
        ).time()

        end_time = datetime.strptime(
            end_text.strip(), "%I.%M%p"
        ).time()
    except ValueError:
        return []

    current = datetime.combine(requested_date, start_time)
    finish = datetime.combine(requested_date, end_time)
    slots = []

    while current + timedelta(minutes=30) <= finish:
        slot_end = current + timedelta(minutes=30)

        slot_label = (
            f"{current.strftime('%I:%M %p')} - "
            f"{slot_end.strftime('%I:%M %p')}"
        )

        slots.append(slot_label)
        current = slot_end

    return slots


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_availability(request):
    doctor_id = request.query_params.get("doctor_id")
    date_text = request.query_params.get("date")

    if not doctor_id or not date_text:
        return Response(
            {"error": "doctor_id and date are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        doctor = Doctor.objects.get(pk=doctor_id)
    except (Doctor.DoesNotExist, ValueError):
        return Response(
            {"error": "Doctor not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        requested_date = date.fromisoformat(date_text)
    except ValueError:
        return Response(
            {"error": "Invalid date. Use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if requested_date < date.today():
        return Response(
            {"error": "Past dates cannot be booked."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if requested_date > date.today() + timedelta(days=60):
        return Response(
            {"error": "Appointments can only be checked within 60 days."},
            status=status.HTTP_400_BAD_REQUEST
        )

    slots = get_available_slots(doctor, requested_date)

    approved_count = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=requested_date,
        status="Approved"
    ).count()

    available_slots = []

    if approved_count < doctor.appointment_limit:
        for slot in slots:
            occupied = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=requested_date,
                time_slot=slot,
                status__in=["Approved", "Pending"]
            ).exists()

            if not occupied:
                available_slots.append(slot)

    return Response(
        {
            "doctor": doctor.name,
            "date": str(requested_date),
            "available_slots": available_slots,
            "message": (
                "Available slots found."
                if available_slots
                else "No available slots. Please choose another working day."
            )
        },
        status=status.HTTP_200_OK
    )



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    if not isinstance(request.user, Patient):
        return Response(
            {"error": "Patient account required to book an appointment."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = AppointmentSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    doctor = serializer.validated_data["doctor"]
    patient = request.user
    appointment_date = serializer.validated_data["appointment_date"]
    time_slot = serializer.validated_data["time_slot"]

    if appointment_date < date.today():
        return Response(
            {"error": "Past dates cannot be booked."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if appointment_date > date.today() + timedelta(days=60):
        return Response(
            {"error": "Appointments can only be booked within 60 days."},
            status=status.HTTP_400_BAD_REQUEST
        )

    is_available, error_message = doctor_is_available(
        doctor, appointment_date, time_slot
    )

    if not is_available:
        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        doctor = Doctor.objects.select_for_update().get(pk=doctor.pk)

        # Find existing active appointments for this patient and doctor.
        active_appointments = Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            status__in=["Pending", "Approved"]
        )

        # Reject another active booking for the same date.
        if active_appointments.filter(
            appointment_date=appointment_date
        ).exists():
            return Response(
                {
                    "error": "You already have an active appointment with this doctor on this date."
                },
                status=status.HTTP_409_CONFLICT
            )

        approved_count = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            status="Approved"
        ).count()

        if approved_count >= doctor.appointment_limit:
            return Response(
                {
                    "error": "The doctor's daily limit has been reached.",
                    "message": (
                        "No appointment was created. Check available slots "
                        "and let the patient choose an alternative."
                    )
                },
                status=status.HTTP_409_CONFLICT
            )

        duplicate_slot = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            time_slot=time_slot,
            status__in=["Approved", "Pending"]
        ).exists()

        if duplicate_slot:
            return Response(
                {
                    "error": "This time slot is no longer available.",
                    "message": (
                        "No appointment was created. "
                        "Check availability and select another slot."
                    )
                },
                status=status.HTTP_409_CONFLICT
            )

        # Generate the patient-facing Booking ID.
        patient_digits = patient.patient_id[-2:]
        doctor_digits = doctor.doctor_id[-2:]

        booking_code = f"HB{patient_digits}{doctor_digits}"

        # Add date suffix if another active appointment exists
        # with the same doctor on a different date.
        if active_appointments.exists():
            date_suffix = appointment_date.strftime("%d%m%y")
            booking_code += date_suffix

        appointment = serializer.save(
            doctor=doctor,
            patient=patient,
            status="Approved",
            queue_position=None,
            original_appointment_date=appointment_date,
            booking_code=booking_code
        )

    return Response(
        {
            "message": "Appointment booked successfully.",
            "booking_code": appointment.booking_code,
            "status": appointment.status,
            "data": AppointmentSerializer(appointment).data
        },
        status=status.HTTP_201_CREATED
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_appointments(request, doctor_id):
    appointments = Appointment.objects.filter(
        doctor_id=doctor_id
    ).order_by("appointment_date", "time_slot")

    return Response(
        AppointmentSerializer(appointments, many=True).data,
        status=status.HTTP_200_OK
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, appointment_id):
    appointment = get_object_or_404(Appointment, pk=appointment_id)
    new_status = request.data.get("status")

    valid_statuses = [
        "Pending", "Approved", "Rejected", "Completed", "Canceled"
    ]

    if new_status not in valid_statuses:
        return Response(
            {
                "error": "Invalid status.",
                "valid_statuses": valid_statuses
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_status == "Approved":
        is_available, error_message = doctor_is_available(
            appointment.doctor,
            appointment.appointment_date,
            appointment.time_slot
        )

        if not is_available:
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        conflicting = Appointment.objects.filter(
            doctor=appointment.doctor,
            appointment_date=appointment.appointment_date,
            time_slot=appointment.time_slot,
            status="Approved"
        ).exclude(pk=appointment.pk).exists()

        if conflicting:
            return Response(
                {"error": "This time slot is already occupied."},
                status=status.HTTP_409_CONFLICT
            )

        approved_count = Appointment.objects.filter(
            doctor=appointment.doctor,
            appointment_date=appointment.appointment_date,
            status="Approved"
        ).exclude(pk=appointment.pk).count()

        if approved_count >= appointment.doctor.appointment_limit:
            return Response(
                {"error": "The doctor's daily limit has been reached."},
                status=status.HTTP_409_CONFLICT
            )

    appointment.status = new_status
    appointment.save(update_fields=["status"])

    return Response(
        {
            "message": "Appointment status updated successfully.",
            "data": AppointmentSerializer(appointment).data
        },
        status=status.HTTP_200_OK
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_appointments(request):

    if not isinstance(request.user, Patient):
        return Response(
            {"error": "Patient account required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    appointments = Appointment.objects.filter(
        patient=request.user
    ).select_related(
        "doctor"
    ).order_by(
        "-appointment_date",
        "-created_at"
    )

    return Response(
        AppointmentSerializer(
            appointments,
            many=True
        ).data,
        status=status.HTTP_200_OK,
    )



@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):

    # Only patient accounts can cancel appointments.
    if not isinstance(request.user, Patient):
        return Response(
            {"error": "Patient account required."},
            status=status.HTTP_403_FORBIDDEN
        )

    appointment = get_object_or_404(
        Appointment,
        pk=appointment_id,
        patient=request.user
    )

    if appointment.status in ["Canceled", "Rejected", "Completed"]:
        return Response(
            {
                "error": (
                    f"An appointment with status '{appointment.status}' "
                    "cannot be canceled."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    appointment.status = "Canceled"
    appointment.save(update_fields=["status"])

    return Response(
        {
            "message": "Appointment canceled successfully.",
            "data": AppointmentSerializer(appointment).data
        },
        status=status.HTTP_200_OK
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def total_appointments(request):
    total = Appointment.objects.count()

    return Response(
        {"total_appointments": total},
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@authentication_classes([DoctorJWTAuthentication])
@permission_classes([IsAuthenticated])
def doctor_dashboard_appointments(request):

    doctor = request.user
    today = date.today()

    today_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=today
    ).select_related("patient").order_by("time_slot")

     # Upcoming appointments (future dates)
    upcoming_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date__gt=today,
        status__in=["Pending", "Approved"]
    ).select_related("patient").order_by(
        "appointment_date",
        "time_slot"
    )

    previous_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date__lt=today
    ).select_related("patient").order_by(
        "-appointment_date",
        "-time_slot"
    )

    return Response(
        {
            "today_appointments": DoctorDashboardAppointmentSerializer(
                today_appointments,
                many=True
            ).data,
            
            "upcoming_appointments": DoctorDashboardAppointmentSerializer(
                upcoming_appointments,
                many=True
            ).data,

            "previous_appointments": DoctorDashboardAppointmentSerializer(
                previous_appointments,
                many=True
            ).data,
        },
        status=status.HTTP_200_OK
    )
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):

    # Allow only Admin JWT tokens
    if not request.user.is_staff or request.auth.get("role") != "admin":
        return Response(
            {"error": "Access denied. Admin only."},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_bookings = Appointment.objects.count()
    total_patients = Patient.objects.count()
    total_doctors = Doctor.objects.count()

    total_departments = (
        Doctor.objects
        .exclude(department="")
        .values("department")
        .distinct()
        .count()
    )

    return Response({
        "total_bookings": total_bookings,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_departments": total_departments,
    }, status=status.HTTP_200_OK)