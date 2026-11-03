
from django.db import migrations, models


def assign_patient_ids(apps, schema_editor):
    Patient = apps.get_model("accounts", "Patient")
    database = schema_editor.connection.alias

    patients = (
        Patient.objects.using(database)
        .filter(patient_id__isnull=True)
        .order_by("id")
    )

    for patient in patients:
        patient.patient_id = f"HP{patient.id:02d}"
        patient.save(using=database, update_fields=["patient_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="patient",
            name="age",
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="patient",
            name="patient_id",
            field=models.CharField(
                max_length=10,
                null=True,
                blank=True,
            ),
        ),
        migrations.RunPython(
            assign_patient_ids,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="patient",
            name="patient_id",
            field=models.CharField(
                max_length=10,
                unique=True,
                blank=True,
            ),
        ),
    ]
