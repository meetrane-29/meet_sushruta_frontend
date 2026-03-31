<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Nurses Management</h1>
        <p class="text-gray-600 mt-1">View and manage all nurses in the system</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showRegisterNurseModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          + Register Nurse
        </button>
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorMessage v-if="error && !loading" :message="error" @retry="refreshData" />

    <!-- Search -->
    <div v-if="!loading && !error" class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Nurses Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="nurse in filteredNurses"
            :key="nurse.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 text-sm font-medium text-gray-900">
              {{ nurse.user?.first_name }} {{ nurse.user?.last_name }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ nurse.user?.phone || '--' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ nurse.user?.email || '--' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ nurse.department || 'General' }}
            </td>
            <td class="px-6 py-4 text-sm">
              <span
                :class="{
                  'bg-green-100 text-green-800': nurse.user?.active,
                  'bg-gray-100 text-gray-800': !nurse.user?.active
                }"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ nurse.user?.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button
                @click="viewNurseDetails(nurse)"
                class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
              >
                View
              </button>
              <button
                @click="deleteNurse(nurse.id)"
                class="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-xs font-medium"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No Results -->
      <div v-if="filteredNurses.length === 0" class="py-12 text-center text-gray-600">
        <p class="text-lg">No nurses found</p>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error && nurses.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Total Nurses</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ nurses.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Active Nurses</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ activeNurses }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Departments</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ uniqueDepartments }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Shifts</p>
        <p class="text-3xl font-bold text-purple-600 mt-2">{{ uniqueShifts }}</p>
      </div>
    </div>

    <!-- Nurse Details Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Nurse Details</h2>
            <button
              @click="closeModal"
              class="text-gray-600 hover:text-gray-900 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">First Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedNurse?.user?.first_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Last Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedNurse?.user?.last_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Email</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedNurse?.user?.email }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">License Number</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedNurse?.license_number }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Department</label>
              <div class="flex items-center gap-2 mt-1">
                <input
                  v-model="editForm.department"
                  type="text"
                  class="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">Shift</label>
              <select
                v-model="editForm.shift"
                class="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Certification URL</label>
            <input
              v-model="editForm.certification_url"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- HR Fields -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <h4 class="font-semibold text-gray-900 mb-4">Employment & Attendance</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Joining Date</label>
                <input
                  v-model="editForm.joining_date"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Salary (₹)</label>
                <input
                  v-model.number="editForm.salary"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Attendance %</label>
                <input
                  v-model.number="editForm.attendance_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600">Leave Balance (days)</label>
                <input
                  v-model.number="editForm.leave_balance"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Status</label>
            <p class="text-lg font-semibold" :class="selectedNurse?.user?.active ? 'text-green-600' : 'text-gray-600'">
              {{ selectedNurse?.user?.active ? 'Active' : 'Inactive' }}
            </p>
          </div>

          <div class="flex gap-2 pt-4">
            <button
              @click="updateNurse"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
            <button
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Nurse Modal -->
    <div v-if="showRegisterNurseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-pink-600 to-pink-700 px-8 py-4 text-white rounded-t-lg">
          <h2 class="text-2xl font-bold">Register Nurse</h2>
          <p class="text-pink-100 text-sm mt-1">Step {{ nurseCurrentStep }} of 2</p>
        </div>

        <!-- Progress Bar -->
        <div class="px-8 pt-6 pb-2">
          <div class="flex gap-2">
            <div
              :class="nurseCurrentStep >= 1 ? 'bg-pink-600' : 'bg-gray-300'"
              class="flex-1 h-2 rounded-full transition"
            />
            <div
              :class="nurseCurrentStep >= 2 ? 'bg-pink-600' : 'bg-gray-300'"
              class="flex-1 h-2 rounded-full transition"
            />
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="registerNurse" class="space-y-4 px-8 py-6">
          <!-- Step 1: Basic Info -->
          <div v-if="nurseCurrentStep === 1" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                v-model="nurseForm.name"
                type="text"
                placeholder="Enter nurse name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <p v-if="nurseErrors.name" class="text-red-500 text-xs mt-1">{{ nurseErrors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="nurseForm.email"
                type="email"
                placeholder="nurse@hospital.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <p v-if="nurseErrors.email" class="text-red-500 text-xs mt-1">{{ nurseErrors.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                v-model="nurseForm.password"
                type="password"
                placeholder="Minimum 6 characters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <p v-if="nurseErrors.password" class="text-red-500 text-xs mt-1">{{ nurseErrors.password }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                v-model="nurseForm.phone"
                type="tel"
                placeholder="Mobile number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <p v-if="nurseErrors.phone" class="text-red-500 text-xs mt-1">{{ nurseErrors.phone }}</p>
            </div>
          </div>

          <!-- Step 2: Professional Details -->
          <div v-if="nurseCurrentStep === 2" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
              <input
                v-model="nurseForm.licenseNumber"
                type="text"
                placeholder="Nursing License Number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <p v-if="nurseErrors.licenseNumber" class="text-red-500 text-xs mt-1">{{ nurseErrors.licenseNumber }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                v-model="nurseForm.department"
                type="text"
                placeholder="e.g., ICU, General Ward"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
              <select
                v-model="nurseForm.shift"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
              <p v-if="nurseErrors.shift" class="text-red-500 text-xs mt-1">{{ nurseErrors.shift }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                v-model="nurseForm.joining_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <!-- Error Message -->
          <ErrorMessage v-if="nurseFormError" :message="nurseFormError" />

          <!-- Buttons -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showRegisterNurseModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>

            <button
              v-if="nurseCurrentStep > 1"
              type="button"
              @click="nurseCurrentStep--"
              class="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              ← Back
            </button>

            <button
              v-if="nurseCurrentStep < 2"
              type="button"
              @click="nextNurseStep"
              :disabled="registering"
              class="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium disabled:opacity-50"
            >
              Next →
            </button>

            <button
              v-if="nurseCurrentStep === 2"
              type="submit"
              :disabled="registering"
              class="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ registering ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const nurses = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const showModal = ref(false)
const selectedNurse = ref(null)
const showRegisterNurseModal = ref(false)
const registering = ref(false)
const nurseFormError = ref('')
const nurseCurrentStep = ref(1)
const nurseErrors = ref({})
const nurseForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  licenseNumber: '',
  department: '',
  shift: '',
  joining_date: ''
})
const editForm = ref({
  department: '',
  shift: '',
  certification_url: '',
  joining_date: 0,
  salary: 0,
  attendance_percentage: 0,
  leave_balance: 0
})

// Computed: Filter nurses by name and email
const filteredNurses = computed(() => {
  return nurses.value.filter(nurse => {
    const fullName = `${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.toLowerCase()
    const email = (nurse.user?.email || '').toLowerCase()
    const search = searchQuery.value.toLowerCase()

    return fullName.includes(search) || email.includes(search)
  })
})

const activeNurses = computed(() => {
  return nurses.value.filter(nurse => nurse.user?.active).length
})

const uniqueDepartments = computed(() => {
  const depts = new Set()
  nurses.value.forEach(nurse => {
    if (nurse.department) {
      depts.add(nurse.department)
    }
  })
  return depts.size
})

const uniqueShifts = computed(() => {
  const shifts = new Set()
  nurses.value.forEach(nurse => {
    if (nurse.shift) {
      shifts.add(nurse.shift)
    }
  })
  return shifts.size
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'Not set'

  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return 'Not set'

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (!value || Number.isNaN(numeric)) return 'Not set'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric)
}

const formatShift = (value) => {
  if (!value) return 'Not set'
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatAttendance = (value) => {
  if (value === null || value === undefined || value === '') return 'Not set'

  const numeric = Number(value)
  if (!Number.isNaN(numeric)) {
    return `${numeric}%`
  }

  return String(value)
}

const formatLeaveRecords = (value) => {
  if (value === null || value === undefined || value === '') return 'Not set'
  if (Array.isArray(value)) return `${value.length} record(s)`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// Fetch nurses from API
const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/nurses')
    // Extract array from nested data structure
    const data = response.data.data?.data || response.data.data || response.data || []
    nurses.value = Array.isArray(data) ? data.filter(n => n.user) : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load nurses. Please try again.'
    console.error('Nurses fetch error:', err)
  } finally {
    loading.value = false
  }
}

const toDateInputValue = (seconds) => {
  if (!seconds || seconds <= 0) return ''
  return new Date(Number(seconds) * 1000).toISOString().split('T')[0]
}

const viewNurseDetails = (nurse) => {
  selectedNurse.value = nurse
  editForm.value = {
    department: nurse.department || '',
    shift: nurse.shift || '',
    certification_url: nurse.certification_url || '',
    joining_date: toDateInputValue(nurse.joining_date),
    salary: nurse.salary || 0,
    attendance_percentage: nurse.attendance_percentage || 0,
    leave_balance: nurse.leave_balance || 0
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedNurse.value = null
  editForm.value = {}
}

const updateNurse = async () => {
  if (!selectedNurse.value) return

  try {
    const payload = {
      ...editForm.value,
      joining_date: editForm.value.joining_date
        ? Math.floor(new Date(editForm.value.joining_date).getTime() / 1000)
        : 0
    }
    const response = await api.patch(`/nurses/${selectedNurse.value.id}`, payload)
    const updatedNurse = response.data.data
    const index = nurses.value.findIndex(n => n.id === selectedNurse.value.id)
    if (index !== -1) {
      nurses.value[index] = { ...nurses.value[index], ...updatedNurse }
    }
    closeModal()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update nurse'
    console.error('Update error:', err)
  }
}

const deleteNurse = async (nurseId) => {
  if (!confirm('Are you sure you want to delete this nurse?')) {
    return
  }

  try {
    await api.delete(`/nurses/${nurseId}`)
    nurses.value = nurses.value.filter(n => n.id !== nurseId)
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete nurse'
    console.error('Delete error:', err)
  }
}

// Validate nurse form step 1
const validateNurseStep1 = () => {
  nurseErrors.value = {}
  
  if (!nurseForm.value.name.trim()) {
    nurseErrors.value.name = 'Name is required'
  }
  if (!nurseForm.value.email.trim()) {
    nurseErrors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nurseForm.value.email)) {
    nurseErrors.value.email = 'Invalid email format'
  }
  if (!nurseForm.value.password) {
    nurseErrors.value.password = 'Password is required'
  } else if (nurseForm.value.password.length < 6) {
    nurseErrors.value.password = 'Password must be at least 6 characters'
  }
  if (!nurseForm.value.phone.trim()) {
    nurseErrors.value.phone = 'Phone is required'
  }
  
  return Object.keys(nurseErrors.value).length === 0
}

// Validate nurse form step 2
const validateNurseStep2 = () => {
  nurseErrors.value = {}
  
  if (!nurseForm.value.licenseNumber.trim()) {
    nurseErrors.value.licenseNumber = 'License number is required'
  }
  if (!nurseForm.value.shift) {
    nurseErrors.value.shift = 'Shift is required'
  }
  
  return Object.keys(nurseErrors.value).length === 0
}

const nextNurseStep = () => {
  if (nurseCurrentStep.value === 1) {
    if (validateNurseStep1()) {
      nurseCurrentStep.value = 2
    }
  }
}

// Register new nurse
const registerNurse = async () => {
  if (!validateNurseStep2()) {
    return
  }
  
  nurseFormError.value = ''
  registering.value = true

  try {
    const fullName = nurseForm.value.name.trim()
    const nameParts = fullName.split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    // Step 1: Create user account first
    const userPayload = {
      first_name: firstName,
      last_name: lastName,
      email: nurseForm.value.email.trim().toLowerCase(),
      password: nurseForm.value.password,
      phone: nurseForm.value.phone.trim(),
      role: 'nurse'
    }
    
    const userResponse = await api.post('/admin-register', userPayload)
    const userId = userResponse.data.data.id
    
    // Convert joining_date string to Unix timestamp
    let joining_date_timestamp = 0
    if (nurseForm.value.joining_date) {
      const date = new Date(nurseForm.value.joining_date)
      joining_date_timestamp = Math.floor(date.getTime() / 1000)
    }

    // Step 2: Create nurse record with nursing-specific fields
    const nursePayload = {
      user_id: userId,
      license_number: nurseForm.value.licenseNumber.trim(),
      department: nurseForm.value.department?.trim() || '',
      shift: nurseForm.value.shift,
      joining_date: joining_date_timestamp
    }
    
    const response = await api.post('/nurses', nursePayload)
    
    // Success! Close modal and refresh data
    showRegisterNurseModal.value = false
    resetNurseForm()
    await refreshData()
    
  } catch (err) {
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to register nurse. Please try again.'
    nurseFormError.value = errorMsg
    console.error('Nurse registration error:', err)
    
  } finally {
    registering.value = false
  }
}

// Reset nurse form
const resetNurseForm = () => {
  nurseForm.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    department: '',
    shift: '',
    joining_date: ''
  }
  nurseCurrentStep.value = 1
  nurseErrors.value = {}
  nurseFormError.value = ''
}

// Load nurses on component mount
onMounted(() => {
  refreshData()
})
</script>
