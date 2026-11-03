
from django.urls import path
from .views import doctor_list,register_doctor,doctor_login


urlpatterns = [
    path(
        '',
        doctor_list,
        name='doctor_list'
    ),
    path(
        "register/",
        register_doctor,
        name="register_doctor",
    ),
    path("login/", doctor_login, name="doctor_login"),
]
