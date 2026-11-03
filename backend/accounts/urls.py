
from django.urls import path
from .views import register_patient,patient_login,admin_login


urlpatterns = [
    path(
        "register/",
        register_patient,
        name="register_patient",
    ),
     path(
        "login/",
        patient_login,
        name="patient_login",
    ),
    path(
    "admin-login/",
    admin_login,
    name="admin_login",
    ), 
]

    