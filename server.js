require('dotenv').config(); // 10. Load DB config from env vars
const express = require('express');
const app = express();

app.use(express.json());

// 08. Consistent JSON Envelope Helper
const sendResponse = (res, statusCode, success, data = null, error = null, meta = null) => {
    return res.status(statusCode).json({ success, data, meta, error });
};

// --- Mock Databases for Verification ---
const patients = [
    { id: 1, name: "Alice Smith", status: "active", allergies: ["Peanuts"], prescriptions: [], appointments: [], password_hash: "secret_123" },
    { id: 2, name: "Bob Jones", status: "inactive", allergies: [], prescriptions: [], appointments: [], password_hash: "secret_456" }
];
const appointments = [
    { id: 1, patientId: 1, doctorId: 1, dateTime: "2026-06-25T10:00:00", status: "booked" }
];
const prescriptions = [];
const auditLogs = [];
const departments = [
    { id: 101, name: "Cardiology", doctors: [{ id: 1, name: "Dr. Dave", availability: "9AM-5PM", todayLoad: 4 }] }
];
const revenueData = [
    { date: "2026-05-15", total: 5000, dept_id: 101 },
    { date: "2026-06-20", total: 7500, dept_id: 101 }
];

// 01. GET /api/patients
app.get('/api/patients', (req, res) => {
    let { name, status, page = 1, limit = 10 } = req.query;
    let results = patients;

    if (name) results = results.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (status) results = results.filter(p => p.status === status);

    // Filter out password_hash for list views too
    const cleanResults = results.map(({ password_hash, ...rest }) => rest);

    sendResponse(res, 200, true, cleanResults, null, { page: Number(page), limit: Number(limit), total: cleanResults.length });
});

// 02. GET /api/patients/:id
app.get('/api/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === parseInt(req.params.id));
    if (!patient) return sendResponse(res, 404, false, null, "Patient not found");
    
    // 10. Never expose password_hash
    const secureProfile = { ...patient };
    delete secureProfile.password_hash; 

    sendResponse(res, 200, true, secureProfile);
});

// 03. POST /api/appointments
app.post('/api/appointments', (req, res) => {
    const { patientId, doctorId, dateTime } = req.body;

    // 09. Field-level error messages on 422
    if (!patientId || !doctorId || !dateTime) {
        return res.status(422).json({
            success: false,
            data: null,
            meta: null,
            error: {
                message: "Validation Failed",
                fields: {
                    ...( !patientId && { patientId: "Patient ID is required" }),
                    ...( !doctorId && { doctorId: "Doctor ID is required" }),
                    ...( !dateTime && { dateTime: "Appointment date and time are required" })
                }
            }
        });
    }

    // Conflict Check (Double-booking)
    const hasConflict = appointments.some(appt => appt.doctorId === parseInt(doctorId) && appt.dateTime === dateTime);
    if (hasConflict) {
        return sendResponse(res, 409, false, null, "Double-booking conflict detected");
    }

    const newAppointment = { id: appointments.length + 1, patientId, doctorId, dateTime, status: 'booked' };
    appointments.push(newAppointment);
    sendResponse(res, 201, true, newAppointment);
});

// 04. PUT /api/appointments/:id/status
app.put('/api/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    const apptId = parseInt(req.params.id);
    
    if (!status) return sendResponse(res, 422, false, null, { status: "Status field is required" });

    const appointment = appointments.find(a => a.id === apptId);
    if (!appointment) return sendResponse(res, 404, false, null, "Appointment not found");

    const oldStatus = appointment.status;
    appointment.status = status;

    // Write an Audit Log Entry
    const logEntry = {
        id: auditLogs.length + 1,
        appointmentId: apptId,
        oldStatus: oldStatus,
        newStatus: status,
        timestamp: new Date().toISOString()
    };
    auditLogs.push(logEntry);

    sendResponse(res, 200, true, { appointment, auditLog: logEntry });
});

// 05. POST /api/prescriptions
app.post('/api/prescriptions', (req, res) => {
    const { patientId, items } = req.body;
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
        return sendResponse(res, 422, false, null, { items: "Must provide patientId and an array of prescription items" });
    }

    // Atomic single-transaction simulator loop
    const preparedItems = [];
    for (let item of items) {
        if (!item.medicine || !item.dosage) {
            return sendResponse(res, 422, false, null, "Transaction aborted: Item missing medicine name or dosage.");
        }
        preparedItems.push(item);
    }

    const newPrescription = { id: prescriptions.length + 1, patientId, items: preparedItems };
    prescriptions.push(newPrescription);
    sendResponse(res, 201, true, newPrescription);
});

// 06. GET /api/departments/:id/doctors
app.get('/api/departments/:id/doctors', (req, res) => {
    const dept = departments.find(d => d.id === parseInt(req.params.id));
    if (!dept) return sendResponse(res, 404, false, null, "Department not found");

    sendResponse(res, 200, true, dept.doctors);
});

// 07. GET /api/reports/revenue
app.get('/api/reports/revenue', (req, res) => {
    const { from, to, dept_id } = req.query;
    let report = revenueData;

    if (dept_id) report = report.filter(r => r.dept_id === parseInt(dept_id));
    if (from) report = report.filter(r => r.date >= from);
    if (to) report = report.filter(r => r.date <= to);

    sendResponse(res, 200, true, report);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));