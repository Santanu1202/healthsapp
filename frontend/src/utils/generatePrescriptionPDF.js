
import jsPDF from "jspdf";

const generatePrescriptionPDF = (prescription) => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    const teal = [0, 112, 105];
    const dark = [35, 48, 58];
    const grey = [105, 115, 125];

    let y = 18;

    // Header
    doc.setFillColor(...teal);
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text("HealthsApp", margin, 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("HEALTHCARE & MEDICAL SERVICES", margin, 25);

    doc.setFontSize(10);
    doc.text("MEDICAL PRESCRIPTION", pageWidth - margin, 17, {
        align: "right",
    });

    y = 47;

    // Doctor details
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(prescription.doctor_name || "", margin, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
        prescription.doctor_degree || "",
        margin,
        y
    );

    y += 6;
    doc.setTextColor(...grey);
    doc.setFontSize(9);
    doc.text(
        `Registration No: ${prescription.doctor_registration_no || "—"}`,
        margin,
        y
    );

    y += 8;
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    // Patient details
    y += 10;
    doc.setTextColor(...teal);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PATIENT DETAILS", margin, y);

    y += 7;
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Name: ${prescription.patient_name || "—"}`, margin, y);
    doc.text(
        `Age: ${prescription.patient_age ?? "—"} years`,
        110,
        y
    );

    y += 7;
    doc.text(
        `Gender: ${prescription.patient_gender || "—"}`,
        margin,
        y
    );

    doc.text(
        `Date: ${new Date(prescription.created_at).toLocaleDateString("en-IN")}`,
        110,
        y
    );

    y += 7;
    doc.text(
        `Booking ID: ${prescription.booking_code || "—"}`,
        margin,
        y
    );

    // Section helper
    const addSection = (heading, value) => {
        y += 11;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...teal);
        doc.text(heading.toUpperCase(), margin, y);

        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...dark);

        const lines = doc.splitTextToSize(
            value || "—",
            contentWidth
        );

        if (y + lines.length * 5 > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, margin, y);
        y += lines.length * 5;
    };

    addSection("Diagnosis", prescription.diagnosis);
    addSection("Prescribed Medicines", prescription.medicines);
    addSection("Instructions", prescription.instructions);
    addSection("Tests Advised", prescription.tests_advised);
    addSection("Follow-up Date", prescription.follow_up_date);

    // Doctor signature area
    y += 15;

    if (y > 255) {
        doc.addPage();
        y = 30;
    }

    doc.setDrawColor(...grey);
    doc.line(135, y, pageWidth - margin, y);

    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text("Doctor's Signature", 145, y);

    // Footer
    doc.setDrawColor(...teal);
    doc.line(margin, 280, pageWidth - margin, 280);

    doc.setFontSize(8);
    doc.setTextColor(...grey);
    doc.text(
        "HealthsApp | Computer-generated medical prescription",
        pageWidth / 2,
        287,
        { align: "center" }
    );

    const fileName = `Prescription_${prescription.booking_code || prescription.id}.pdf`;

    doc.save(fileName);
};

export default generatePrescriptionPDF;
