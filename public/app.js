const form = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const summaryFields = {
  total: document.getElementById('totalStudents'),
  active: document.getElementById('activeStudents'),
  pending: document.getElementById('pendingStudents'),
  avgAge: document.getElementById('avgAge')
};

const studentFormInputs = {
  studentId: document.getElementById('studentId'),
  studentIdField: document.getElementById('studentIdField'),
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  course: document.getElementById('course'),
  year: document.getElementById('year'),
  dob: document.getElementById('dob'),
  status: document.getElementById('status'),
  address: document.getElementById('address')
};

let allStudents = [];
let editingStudentId = null;

function formatStatus(status) {
  const normalized = status || 'Pending';
  const classMap = {
    Active: 'active',
    Pending: 'pending',
    'On Leave': 'leave',
    Graduated: 'graduated'
  };

  return `<span class="badge ${classMap[normalized] || 'pending'}">${normalized}</span>`;
}

async function fetchStudents() {
  const response = await fetch('/api/students');
  const data = await response.json();
  allStudents = Array.isArray(data) ? data : [];
  renderTable();
  updateSummary();
}

async function updateSummary() {
  const response = await fetch('/api/students/summary');
  const summary = await response.json();

  summaryFields.total.textContent = summary.total ?? 0;
  summaryFields.active.textContent = summary.active ?? 0;
  summaryFields.pending.textContent = summary.pending ?? 0;
  summaryFields.avgAge.textContent = `${summary.avgAge ?? 0} yrs`;
}

function getFilteredStudents() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return allStudents.filter((student) => {
    const matchesText = !searchTerm || [
      student.studentId,
      student.fullName,
      student.email,
      student.course
    ].some((value) => String(value || '').toLowerCase().includes(searchTerm));

    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
    return matchesText && matchesStatus;
  });
}

function renderTable() {
  const filteredStudents = getFilteredStudents();

  if (!filteredStudents.length) {
    studentTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No students match your search.</td></tr>';
    return;
  }

  studentTableBody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
          <td>${student.studentId}</td>
          <td>
            <strong>${student.fullName}</strong><br>
            <small>${student.email}</small>
          </td>
          <td>${student.course}</td>
          <td>${student.year}</td>
          <td>${formatStatus(student.status)}</td>
          <td>
            <div class="action-group">
              <button class="action-btn edit" data-action="edit" data-id="${student.id}">Edit</button>
              <button class="action-btn delete" data-action="delete" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

function resetForm() {
  form.reset();
  editingStudentId = null;
  formTitle.textContent = 'Register New Student';
  submitBtn.textContent = 'Save Student';
  cancelEditBtn.classList.add('hidden');
  studentFormInputs.studentIdField.value = '';
}

function populateForm(student) {
  editingStudentId = student.id;
  studentFormInputs.studentIdField.value = student.id;
  studentFormInputs.studentId.value = student.studentId;
  studentFormInputs.fullName.value = student.fullName;
  studentFormInputs.email.value = student.email;
  studentFormInputs.phone.value = student.phone || '';
  studentFormInputs.course.value = student.course;
  studentFormInputs.year.value = student.year;
  studentFormInputs.dob.value = student.dob || '';
  studentFormInputs.status.value = student.status;
  studentFormInputs.address.value = student.address || '';

  formTitle.textContent = 'Edit Student Record';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    studentId: studentFormInputs.studentId.value,
    fullName: studentFormInputs.fullName.value,
    email: studentFormInputs.email.value,
    phone: studentFormInputs.phone.value,
    course: studentFormInputs.course.value,
    year: studentFormInputs.year.value,
    dob: studentFormInputs.dob.value,
    status: studentFormInputs.status.value,
    address: studentFormInputs.address.value
  };

  const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students';
  const method = editingStudentId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    alert(result.message || 'There was a problem saving the student record.');
    return;
  }

  resetForm();
  await fetchStudents();
  alert(editingStudentId ? 'Student updated successfully.' : 'Student registered successfully.');
}

async function handleDelete(studentId) {
  const student = allStudents.find((item) => item.id === studentId);
  if (!student) return;

  const confirmed = window.confirm(`Delete ${student.fullName}? This action cannot be undone.`);
  if (!confirmed) return;

  const response = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
  const result = await response.json();

  if (!response.ok) {
    alert(result.message || 'Unable to delete student.');
    return;
  }

  if (editingStudentId === studentId) {
    resetForm();
  }

  await fetchStudents();
  alert(result.message || 'Student deleted successfully.');
}

studentTableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const studentId = target.dataset.id;

  if (!action || !studentId) return;

  if (action === 'edit') {
    const student = allStudents.find((item) => item.id === studentId);
    if (student) {
      populateForm(student);
    }
  }

  if (action === 'delete') {
    await handleDelete(studentId);
  }
});

searchInput.addEventListener('input', renderTable);
statusFilter.addEventListener('change', renderTable);
form.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', resetForm);

fetchStudents();
