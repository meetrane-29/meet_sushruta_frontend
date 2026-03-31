<template>
  <div class="admin-registration-container">
    <div class="registration-card">
      <h1>🔐 Admin Registration Portal</h1>
      <p class="subtitle">Register new staff members with different roles</p>

      <!-- Alert Messages -->
      <div v-if="successMessage" class="alert alert-success">
        ✅ {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-error">
        ❌ {{ errorMessage }}
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="registerUser" class="registration-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <h2>👤 Personal Information</h2>

          <div class="form-group">
            <label for="firstName">First Name *</label>
            <input
              v-model="form.firstName"
              type="text"
              id="firstName"
              placeholder="Enter first name"
              required
              minlength="2"
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name *</label>
            <input
              v-model="form.lastName"
              type="text"
              id="lastName"
              placeholder="Enter last name"
              required
              minlength="2"
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              placeholder="user@meetsushruta.com"
              required
            />
            <small>Must be unique across the system</small>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input
              v-model="form.phone"
              type="tel"
              id="phone"
              placeholder="9876543210"
              required
              maxlength="10"
              @input="form.phone = form.phone.replace(/[^0-9]/g, '')"
            />
            <small>Must be exactly 10 digits</small>
          </div>
        </div>

        <!-- Role Selection Section -->
        <div class="form-section">
          <h2>👨‍💼 Role Selection</h2>

          <div class="form-group">
            <label for="role">Select Role *</label>
            <select v-model="form.role" id="role" required>
              <option value="">-- Choose a Role --</option>
              <option value="admin">👑 Admin (System Administrator)</option>
              <option value="doctor">🩺 Doctor (Medical Professional)</option>
              <option value="nurse">👩‍⚕️ Nurse (Nursing Staff)</option>
              <option value="receptionist">📞 Receptionist (Reception Desk)</option>
              <option value="pharmacy">💊 Pharmacy Staff (Pharmacy)</option>
              <option value="lab">🧪 Lab Technician (Laboratory)</option>
              <option value="patient">🧑‍🤝‍🧑 Patient (Patient Account)</option>
            </select>
            <small v-if="form.role" class="role-info">
              {{ getRoleDescription(form.role) }}
            </small>
          </div>
        </div>

        <!-- Credentials Section -->
        <div class="form-section">
          <h2>🔑 Credentials</h2>

          <div class="form-group">
            <label for="password">Password *</label>
            <input
              v-model="form.password"
              type="password"
              id="password"
              placeholder="Minimum 8 characters"
              required
              minlength="8"
            />
            <small>Use strong passwords with mix of letters, numbers, and symbols</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              id="confirmPassword"
              placeholder="Re-enter password"
              required
              :class="{ 'input-error': form.password !== form.confirmPassword }"
            />
            <small v-if="form.password !== form.confirmPassword" class="error-text">
              ⚠️ Passwords do not match
            </small>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="form-section">
          <h2>📋 Additional Information (Optional)</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="gender">Gender</label>
              <select v-model="form.gender" id="gender">
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="bloodGroup">Blood Group</label>
              <select v-model="form.bloodGroup" id="bloodGroup">
                <option value="">Not specified</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading || form.password !== form.confirmPassword"
          >
            <span v-if="!isLoading">✅ Register User</span>
            <span v-else>⏳ Registering...</span>
          </button>
          <button type="reset" class="btn btn-secondary" @click="resetForm">
            🔄 Clear Form
          </button>
        </div>
      </form>

      <!-- Recently Registered Users -->
      <div v-if="registeredUsers.length > 0" class="registered-users-section">
        <h3>📊 Recently Registered Users</h3>
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Registration Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in registeredUsers" :key="user.email">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><span :class="`role-badge role-${user.role}`">{{ user.role }}</span></td>
                <td>{{ user.phone }}</td>
                <td>{{ formatTime(user.registeredAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reference Section -->
      <div class="reference-section">
        <h3>📖 User Roles Reference</h3>
        <div class="roles-grid">
          <div class="role-card">
            <h4>👑 Admin</h4>
            <p>Full system access, user management, configuration</p>
          </div>
          <div class="role-card">
            <h4>🩺 Doctor</h4>
            <p>Patient consultations, prescriptions, medical history</p>
          </div>
          <div class="role-card">
            <h4>👩‍⚕️ Nurse</h4>
            <p>Patient care, vitals monitoring, ward management</p>
          </div>
          <div class="role-card">
            <h4>📞 Receptionist</h4>
            <p>Appointment booking, patient registration, queues</p>
          </div>
          <div class="role-card">
            <h4>💊 Pharmacy</h4>
            <p>Medicine dispensing, inventory management</p>
          </div>
          <div class="role-card">
            <h4>🧪 Lab</h4>
            <p>Lab test ordering, sample management, reports</p>
          </div>
          <div class="role-card">
            <h4>🧑‍🤝‍🧑 Patient</h4>
            <p>Medical records, appointment booking, health info</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: '',
  gender: '',
  bloodGroup: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const registeredUsers = ref([])

const { post } = useApi()

// Role descriptions
const roleDescriptions = {
  admin: 'Full system access and administrative privileges',
  doctor: 'Medical professional access with patient consultation features',
  nurse: 'Nursing staff access for patient care and vital monitoring',
  receptionist: 'Reception desk access for appointment and patient registration',
  pharmacy: 'Pharmacy department access for medicine dispensing',
  lab: 'Laboratory access for test ordering and reporting',
  patient: 'Patient account for accessing personal health information',
}

const getRoleDescription = (role) => {
  return roleDescriptions[role] || 'Select a role to see description'
}

const registerUser = async () => {
  // Validate passwords match
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (!form.value.role) {
    errorMessage.value = 'Please select a role'
    return
  }

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Call admin registration endpoint
    const response = await post('/auth/admin-register', {
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      role: form.value.role,
      gender: form.value.gender || undefined,
      blood_group: form.value.bloodGroup || undefined,
    })

    if (response.success) {
      successMessage.value = `✅ ${form.value.firstName} ${form.value.lastName} registered successfully as ${form.value.role}!`

      // Add to recently registered list
      registeredUsers.value.unshift({
        name: `${form.value.firstName} ${form.value.lastName}`,
        email: form.value.email,
        phone: form.value.phone,
        role: form.value.role,
        registeredAt: new Date(),
      })

      // Keep only last 5 registrations
      registeredUsers.value = registeredUsers.value.slice(0, 5)

      // Reset form after successful registration
      resetForm()
    }
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    gender: '',
    bloodGroup: '',
  }
  successMessage.value = ''
  errorMessage.value = ''
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<style scoped>
.admin-registration-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 700px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

/* Alerts */
.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Form Sections */
.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

/* Form Groups */
.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.input-error {
  border-color: #dc3545;
  background: #fff5f5;
}

small {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.error-text {
  color: #dc3545;
}

.role-info {
  color: #667eea;
  font-style: italic;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* Recently Registered Users */
.registered-users-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.registered-users-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
}

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 14px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.role-admin {
  background: #ffe0e0;
  color: #c00;
}

.role-doctor {
  background: #e0f0ff;
  color: #006;
}

.role-nurse {
  background: #e0ffe0;
  color: #060;
}

.role-receptionist {
  background: #fff0e0;
  color: #660;
}

.role-pharmacy {
  background: #ffe0f0;
  color: #600;
}

.role-lab {
  background: #f0e0ff;
  color: #600;
}

.role-patient {
  background: #e0ffff;
  color: #006;
}

/* Reference Grid */
.reference-section {
  margin-top: 40px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reference-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.role-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.role-card h4 {
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.role-card p {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 600px) {
  .registration-card {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
