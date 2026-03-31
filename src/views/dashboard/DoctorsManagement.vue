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

    <!-- Search Box -->
    <div v-if="!loading && !error" class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div v-if="doctors.length > 0" class="text-sm text-gray-600 py-2 whitespace-nowrap">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredDoctors.length) }} of {{ filteredDoctors.length }}
      </div>
    </div>

    <!-- Doctors Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="filteredDoctors.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialization</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(doctor, index) in paginatedDoctors"
              :key="doctor.id || index"
              class="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
              @click="viewDoctorDetails(doctor)"
            >
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">
                {{ doctor.user?.first_name ? `${doctor.user.first_name} ${doctor.user.last_name || ''}`.trim() : 'Unknown' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ doctor.specialization || '--' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ doctor.user?.phone || '--' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ doctor.user?.email || '--' }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="{
                    'bg-green-100 text-green-800': doctor.user?.active,
                    'bg-gray-100 text-gray-800': !doctor.user?.active
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ doctor.user?.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Results -->
      <div v-if="filteredDoctors.length === 0" class="py-12 text-center text-gray-600">
        <p class="text-lg">No doctors found</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredDoctors.length > 0 && totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div class="text-sm text-gray-600">
          Page <span class="font-medium">{{ currentPage }}</span> of <span class="font-medium">{{ totalPages }}</span>
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
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
                placeholder="9876543210"
                maxlength="10"
                @input="doctorForm.phone = doctorForm.phone.replace(/[^0-9]/g, '')"
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
              <select
                v-model="doctorForm.specialization"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">-- Select Specialization --</option>
                <option
                  v-for="specialty in specialties"
                  :key="specialty.id"
                  :value="specialty.name"
                >
                  {{ specialty.name }}
                </option>
              </select>
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

// Core data
const doctors = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const specialties = ref([])
const currentPage = ref(1)
const pageSize = 10

// Modal states
const showModal = ref(false)
const selectedDoctor = ref(null)
const showRegisterDoctorModal = ref(false)
const registering = ref(false)
const doctorFormError = ref('')
const doctorCurrentStep = ref(1)
const doctorErrors = ref({})

// Doctor registration form
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

// Filter doctors by name or email
const filteredDoctors = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  
  if (!query) {
    return doctors.value
  }
  
  return doctors.value.filter(doc => {
    const fullName = `${doc.user?.first_name || ''} ${doc.user?.last_name || ''}`.toLowerCase()
    const email = (doc.user?.email || '').toLowerCase()
    
    return fullName.includes(query) || email.includes(query)
  })
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredDoctors.value.length / pageSize)
})

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDoctors.value.slice(start, end)
})

// Count active doctors
const activeDoctors = computed(() => {
  return doctors.value.filter(doc => doc.user?.active).length
})

// Pagination functions
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Fetch doctors from API
const refreshData = async () => {
  loading.value = true
  error.value = ''
  currentPage.value = 1

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
    doctors.value = data
    
    if (data.length > 0) {
      console.log('First doctor:', data[0])
    }
    
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load doctors'
    console.error('❌ Error loading doctors:', err)
  } finally {
    loading.value = false
  }
}

// Modal functions
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

// Doctor registration validation
const validateDoctorStep1 = () => {
  doctorErrors.value = {}
  
  if (!doctorForm.value.name.trim()) {
    doctorErrors.value.name = 'Name is required'
  } else {
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

// Load data on component mount
onMounted(async () => {
  // Fetch specialties directly from API
  try {
    const specRes = await api.get('/specializations')
    // API returns { success: true, data: { specializations: [...], total, page, limit } }
    specialties.value = specRes.data?.data?.specializations || specRes.data?.specializations || []
    console.log('Loaded specializations:', specialties.value)
  } catch (err) {
    console.error('Failed to load specializations:', err)
  }
  
  // Fetch doctors
  refreshData()
})
</script>
