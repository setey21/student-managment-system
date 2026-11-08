const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'students.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));

function ensureDataFile() {
  const defaultStudents = [
    {
      id: 'std-1001',
      studentId: 'STU-1001',
      fullName: 'Aisha Noor',
      email: 'aisha.noor@campus.edu',
      phone: '+1 (555) 123-4501',
      course: 'Computer Science',
      year: 'Year 2',
      dob: '2004-05-12',
      address: 'New York, USA',
      status: 'Active',
      createdAt: '2025-01-15T09:30:00.000Z'
    },
    {
      id: 'std-1002',
      studentId: 'STU-1002',
      fullName: 'Daniel Kim',
      email: 'daniel.kim@campus.edu',
      phone: '+1 (555) 123-4502',
      course: 'Business Administration',
      year: 'Year 3',
      dob: '2003-09-08',
      address: 'Chicago, USA',
      status: 'Active',
      createdAt: '2025-02-22T11:20:00.000Z'
    },
    {
      id: 'std-1003',
      studentId: 'STU-1003',
      fullName: 'Marta Silva',
      email: 'marta.silva@campus.edu',
      phone: '+1 (555) 123-4503',
      course: 'Architecture',
      year: 'Year 1',
      dob: '2005-01-18',
      address: 'Miami, USA',
      status: 'Pending',
      createdAt: '2025-03-12T08:10:00.000Z'
    },
    {
      id: 'std-1004',
      studentId: 'STU-1004',
      fullName: 'Samuel Addo',
      email: 'samuel.addo@campus.edu',
      phone: '+1 (555) 123-4504',
      course: 'Electrical Engineering',
      year: 'Year 4',
      dob: '2002-11-28',
      address: 'Dallas, USA',
      status: 'Graduated',
      createdAt: '2024-08-30T13:40:00.000Z'
    },
    {
      id: 'std-1005',
      studentId: 'STU-1005',
      fullName: 'Priya Nair',
      email: 'priya.nair@campus.edu',
      phone: '+1 (555) 123-4505',
      course: 'Digital Media',
      year: 'Year 2',
      dob: '2004-04-03',
      address: 'Boston, USA',
      status: 'On Leave',
      createdAt: '2025-04-05T10:00:00.000Z'
    }
  ];

  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStudents, null, 2));
  }
}

function readStudents() {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return 0;
  const diffMs = Date.now() - birth.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function validateStudentPayload(payload) {
  const requiredFields = ['studentId', 'fullName', 'email', 'course', 'year', 'status'];
  const missing = requiredFields.filter((field) => !String(payload[field] || '').trim());

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Please enter a valid email address.';
  }

  return null;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student registration API is running' });
});

app.get('/api/students', (req, res) => {
  const students = readStudents();
  res.json(students);
});

app.get('/api/students/summary', (req, res) => {
  const students = readStudents();

  const total = students.length;
  const active = students.filter((student) => student.status === 'Active').length;
  const pending = students.filter((student) => student.status === 'Pending').length;
  const avgAge = students.length
    ? Math.round(
        students.reduce((sum, student) => sum + calculateAge(student.dob), 0) / students.length
      )
    : 0;

  res.json({ total, active, pending, avgAge });
});

app.post('/api/students', (req, res) => {
  const students = readStudents();
  const payload = req.body || {};
  const validationError = validateStudentPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const normalizedStudentId = String(payload.studentId).trim();
  if (students.some((student) => student.studentId.toLowerCase() === normalizedStudentId.toLowerCase())) {
    return res.status(409).json({ message: 'A student with this student ID already exists.' });
  }

  const student = {
    id: crypto.randomUUID(),
    studentId: normalizedStudentId,
    fullName: String(payload.fullName).trim(),
    email: String(payload.email).trim().toLowerCase(),
    phone: String(payload.phone || '').trim(),
    course: String(payload.course).trim(),
    year: String(payload.year).trim(),
    dob: payload.dob || '',
    address: String(payload.address || '').trim(),
    status: String(payload.status).trim(),
    createdAt: new Date().toISOString()
  };

  students.unshift(student);
  writeStudents(students);
  res.status(201).json(student);
});

app.put('/api/students/:id', (req, res) => {
  const students = readStudents();
  const payload = req.body || {};
  const studentIndex = students.findIndex((student) => student.id === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const validationError = validateStudentPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const updatedStudent = {
    ...students[studentIndex],
    studentId: String(payload.studentId).trim(),
    fullName: String(payload.fullName).trim(),
    email: String(payload.email).trim().toLowerCase(),
    phone: String(payload.phone || '').trim(),
    course: String(payload.course).trim(),
    year: String(payload.year).trim(),
    dob: payload.dob || '',
    address: String(payload.address || '').trim(),
    status: String(payload.status).trim()
  };

  students[studentIndex] = updatedStudent;
  writeStudents(students);
  res.json(updatedStudent);
});

app.delete('/api/students/:id', (req, res) => {
  const students = readStudents();
  const studentIndex = students.findIndex((student) => student.id === req.params.id);

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const [removedStudent] = students.splice(studentIndex, 1);
  writeStudents(students);
  res.json({ message: `${removedStudent.fullName} deleted successfully.` });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Student Management System running at http://localhost:${PORT}`);
});
