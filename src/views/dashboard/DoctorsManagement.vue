<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Doctors Management</h1>
        <p class="text-gray-600 mt-1">View and manage all doctors in the system</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showRegisterDoctorModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          + Register Doctor
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

    <!-- Search and Filter -->
    <div v-if="!loading && !error" class="flex flex-col md:flex-row gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or specialization..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="selectedSpecialization"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Specializations</option>
        <option v-for="spec in specializations" :key="spec" :value="spec">
          {{ spec }}
        </option>
      </select>
      <!-- Debug info -->
      <div v-if="doctors.length > 0" class="text-xs text-gray-500 ml-2 py-2">
        Showing {{ filteredDoctors.length }} of {{ doctors.length }} doctors
      </div>
    </div>

    <!-- Doctors Grid -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-if="filteredDoctors.length > 0">
        <div
          v-for="(doctor, index) in filteredDoctors"
          :key="doctor.id || index"
          class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
        >
          <!-- Doctor Avatar -->
          <div class="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl">
            👨‍⚕️
          </div>

          <!-- Doctor Info -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ doctor.user?.first_name ? `${doctor.user.first_name} ${doctor.user.last_name || ''}`.trim() : 'Unknown Doctor' }}
            </h3>
            <p class="text-blue-600 font-medium mt-1">{{ doctor.specialization || 'Uncategorized' }}</p>
            <p class="text-sm text-gray-600 mt-2">{{ doctor.department || 'General' }}</p>
          
            <!-- Consultation Fee -->
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-sm text-gray-600">Consultation Fee</p>
              <p class="text-lg font-semibold text-gray-900">₹{{ doctor.consultation_fee || '--' }}</p>
            </div>

            <!-- Employment & Attendance -->
            <div class="mt-3 space-y-1 text-sm">
              <p class="text-gray-700"><span class="font-medium">Joining Date:</span> {{ formatDate(doctor.joining_date || doctor.created_at || doctor.user?.created_at) }}</p>
              <p class="text-gray-700"><span class="font-medium">Salary:</span> {{ formatCurrency(doctor.salary || doctor.monthly_salary || doctor.user?.salary) }}</p>
              <p class="text-gray-700"><span class="font-medium">Shift Timings:</span> {{ formatShift(doctor.shift_timing || doctor.shift || doctor.shift_timings) }}</p>
              <p class="text-gray-700"><span class="font-medium">Attendance:</span> {{ formatAttendance(doctor.attendance_percentage || doctor.attendance_rate || doctor.attendance) }}</p>
              <p class="text-gray-700"><span class="font-medium">Leave Records:</span> {{ formatLeaveRecords(doctor.leave_records || doctor.leaves || doctor.leave_count || doctor.leave_balance) }}</p>
            </div>

            <!-- Status Badge -->
            <div class="mt-4">
              <span
                :class="{
                  'bg-green-100 text-green-800': doctor.user?.active,
                  'bg-gray-100 text-gray-800': !doctor.user?.active
                }"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ doctor.user?.active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 flex gap-2">
              <button
                @click="viewDoctorDetails(doctor)"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- No Results -->
      <div v-if="filteredDoctors.length === 0" class="col-span-full py-12 text-center text-gray-600">
        <p class="text-lg">No doctors found</p>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error && doctors.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Total Doctors</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ doctors.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Active Doctors</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ activeDoctors }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Specializations</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ uniqueSpecializations }}</p>
      </div>
    </div>

    <!-- Doctor Details Modal -->
    <DoctorDetailsModal
      :is-open="showModal"
      :doctor="selectedDoctor"
      @close="closeModal"
      @updated="handleDoctorUpdated"
      @deleted="handleDoctorDeleted"
    />

    <!-- Register Doctor Modal -->
    <div v-if="showRegisterDoctorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-8 py-4 text-white rounded-t-lg">
          <h2 class="text-2xl font-bold">Register Doctor</h2>
          <p class="text-green-100 text-sm mt-1">Step {{ doctorCurrentStep }} of 2</p>
        </div>

        <!-- Progress Bar -->
        <div class="px-8 pt-6 pb-2">
          <div class="flex gap-2">
            <div
              :class="doctorCurrentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'"
              class="flex-1 h-2 rounded-full transition"
            />
            <div
              :class="doctorCurrentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'"
              class="flex-1 h-2 rounded-full transition"
            />
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="registerDoctor" class="space-y-4 px-8 py-6">
          <!-- Step 1: Basic Info -->
          <div v-if="doctorCurrentStep === 1" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                v-model="doctorForm.name"
                type="text"
                placeholder="Enter doctor name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.name" class="text-red-500 text-xs mt-1">{{ doctorErrors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="doctorForm.email"
                type="email"
                placeholder="doctor@hospital.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.email" class="text-red-500 text-xs mt-1">{{ doctorErrors.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                v-model="doctorForm.password"
                type="password"
                placeholder="Minimum 8 characters"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.password" class="text-red-500 text-xs mt-1">{{ doctorErrors.password }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                v-model="doctorForm.phone"
                type="tel"
                placeholder="Mobile number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.phone" class="text-red-500 text-xs mt-1">{{ doctorErrors.phone }}</p>
            </div>
          </div>

          <!-- Step 2: Professional Details -->
          <div v-if="doctorCurrentStep === 2" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
              <input
                v-model="doctorForm.specialization"
                type="text"
                placeholder="e.g., Cardiology, Surgery"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.specialization" class="text-red-500 text-xs mt-1">{{ doctorErrors.specialization }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
              <input
                v-model="doctorForm.licenseNumber"
                type="text"
                placeholder="Medical License Number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.licenseNumber" class="text-red-500 text-xs mt-1">{{ doctorErrors.licenseNumber }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                v-model="doctorForm.department"
                type="text"
                placeholder="e.g., General, Surgical"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹) *</label>
              <input
                v-model.number="doctorForm.fees"
                type="number"
                placeholder="500"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p v-if="doctorErrors.fees" class="text-red-500 text-xs mt-1">{{ doctorErrors.fees }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                v-model="doctorForm.joining_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <!-- Error Message -->
          <ErrorMessage v-if="doctorFormError" :message="doctorFormError" />

          <!-- Buttons -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showRegisterDoctorModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>

            <button
              v-if="doctorCurrentStep > 1"
              type="button"
              @click="doctorCurrentStep--"
              class="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              ← Back
            </button>

            <button
              v-if="doctorCurrentStep < 2"
              type="button"
              @click="nextDoctorStep"
              :disabled="registering"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
            >
              Next →
            </button>

            <button
              v-if="doctorCurrentStep === 2"
              type="submit"
              :disabled="registering"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
import DoctorDetailsModal from '@/components/shared/DoctorDetailsModal.vue'

const api = useApi()
const doctors = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedSpecialization = ref('')
const showModal = ref(false)
const selectedDoctor = ref(null)
const showRegisterDoctorModal = ref(false)
const registering = ref(false)
const doctorFormError = ref('')
const doctorCurrentStep = ref(1)
const doctorErrors = ref({})
const doctorForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  licenseNumber: '',
  department: '',
  fees: 500,
  joining_date: ''
})

const specializations = computed(() => {
  const specs = new Set()
  doctors.value.forEach(doc => {
    if (doc.specialization) {
      specs.add(doc.specialization)
    }
  })
  return Array.from(specs).sort()
})

const filteredDoctors = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const spec = selectedSpecialization.value
  
  return doctors.value.filter(doc => {
    // If no filters applied, show all
    if (!query && !spec) {
      return true
    }
    
    const doctorName = `${doc.user?.first_name || ''} ${doc.user?.last_name || ''}`.toLowerCase()
    const doctorSpec = (doc.specialization || '').toLowerCase()
    const doctorDept = (doc.department || '').toLowerCase()
    
    let matchesSearch = true
    let matchesSpec = true
    
    // Check search
    if (query) {
      matchesSearch = doctorName.includes(query) || doctorSpec.includes(query) || doctorDept.includes(query) || doc.specialization === query
    }
    
    // Check specialization filter
    if (spec) {
      matchesSpec = doc.specialization === spec
    }
    
    return matchesSearch && matchesSpec
  })
})

const activeDoctors = computed(() => {
  return doctors.value.filter(doc => doc.user?.active).length
})

const uniqueSpecializations = computed(() => {
  return specializations.value.length
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

const refreshData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/doctors')
    console.log('Doctors API Response:', response)
    
    // Extract data from response
    let data = response.data?.data
    if (!data) {
      data = response.data instanceof Array ? response.data : []
    }
    
    // Ensure it's an array
    if (!Array.isArray(data)) {
      console.error('Expected array of doctors, got:', data)
      data = []
    }
    
    console.log(`✓ Loaded ${data.length} doctors`)
    
    // Store doctors
    doctors.value = data
    
    // Log first doctor details for debugging
    if (data.length > 0) {
      console.log('First doctor:', data[0])
      console.log('Doctor user field:', data[0].user)
    }
    
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load doctors'
    console.error('❌ Error loading doctors:', err)
  } finally {
    loading.value = false
  }
}

const viewDoctorDetails = (doctor) => {
  selectedDoctor.value = doctor
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDoctor.value = null
}

const handleDoctorUpdated = (updatedDoctor) => {
  const index = doctors.value.findIndex(d => d.id === updatedDoctor.id)
  if (index !== -1) {
    doctors.value[index] = updatedDoctor
  }
}

const handleDoctorDeleted = (doctorId) => {
  doctors.value = doctors.value.filter(d => d.id !== doctorId)
}

// Validate doctor form step 1
const validateDoctorStep1 = () => {
  doctorErrors.value = {}
  
  if (!doctorForm.value.name.trim()) {
    doctorErrors.value.name = 'Name is required'
  } else {
    // Split name into parts to validate individually
    const nameParts = doctorForm.value.name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName
    
    if (firstName.length < 2) {
      doctorErrors.value.name = 'First name must be at least 2 characters'
    } else if (lastName.length < 2) {
      doctorErrors.value.name = 'Last name must be at least 2 characters'
    }
  }
  
  if (!doctorForm.value.email.trim()) {
    doctorErrors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.value.email)) {
    doctorErrors.value.email = 'Invalid email format'
  }
  if (!doctorForm.value.password) {
    doctorErrors.value.password = 'Password is required'
  } else if (doctorForm.value.password.length < 8) {
    doctorErrors.value.password = 'Password must be at least 8 characters'
  }
  if (!doctorForm.value.phone.trim()) {
    doctorErrors.value.phone = 'Phone is required'
  }
  
  return Object.keys(doctorErrors.value).length === 0
}

// Validate doctor form step 2
const validateDoctorStep2 = () => {
  doctorErrors.value = {}
  
  if (!doctorForm.value.specialization.trim()) {
    doctorErrors.value.specialization = 'Specialization is required'
  }
  if (!doctorForm.value.licenseNumber.trim()) {
    doctorErrors.value.licenseNumber = 'License number is required'
  }
  if (!doctorForm.value.fees || doctorForm.value.fees <= 0) {
    doctorErrors.value.fees = 'Consultation fee must be greater than 0'
  }
  
  return Object.keys(doctorErrors.value).length === 0
}

const nextDoctorStep = () => {
  if (doctorCurrentStep.value === 1) {
    if (validateDoctorStep1()) {
      doctorCurrentStep.value = 2
    }
  }
}

// Register new doctor
const registerDoctor = async () => {
  if (!validateDoctorStep2()) {
    return
  }
  
  doctorFormError.value = ''
  registering.value = true

  try {
    const fullName = doctorForm.value.name.trim()
    const nameParts = fullName.split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    // Convert joining_date string to Unix timestamp
    let joining_date_timestamp = 0
    if (doctorForm.value.joining_date) {
      const date = new Date(doctorForm.value.joining_date)
      joining_date_timestamp = Math.floor(date.getTime() / 1000)
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: doctorForm.value.email.trim().toLowerCase(),
      password: doctorForm.value.password,
      phone: doctorForm.value.phone.trim(),
      specialization: doctorForm.value.specialization.trim(),
      license_number: doctorForm.value.licenseNumber.trim(),
      department: doctorForm.value.department?.trim() || '',
      fees: Number(doctorForm.value.fees),
      joining_date: joining_date_timestamp
    }
    
    const response = await api.post('/admin/doctors/register', payload)
    
    // Success! Close modal and refresh data
    showRegisterDoctorModal.value = false
    resetDoctorForm()
    await refreshData()
    
  } catch (err) {
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to register doctor. Please try again.'
    doctorFormError.value = errorMsg
    console.error('Doctor registration error:', err)
    
  } finally {
    registering.value = false
  }
}

// Reset doctor form
const resetDoctorForm = () => {
  doctorForm.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    department: '',
    fees: 500,
    joining_date: ''
  }
  doctorCurrentStep.value = 1
  doctorErrors.value = {}
  doctorFormError.value = ''
}

onMounted(() => {
  refreshData()
})
</script>
