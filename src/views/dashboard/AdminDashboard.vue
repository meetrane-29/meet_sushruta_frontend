<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-gray-600 mt-1">Hospital management overview and statistics</p>
        </div>
        <button
          @click="showRegisterDoctorModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          + Register Doctor
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" :cols="4" />

    <!-- Error State -->
    <ErrorMessage 
      v-if="error" 
      :message="error"
      :onRetry="fetchDashboardData"
    />

    <!-- Dashboard Content -->
    <div v-if="!isLoading && !error" class="space-y-8">
      <!-- SECTION 1: Stats Grid (4 columns) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Patients -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Patients</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_patients }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-4">
              <span class="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <!-- Total Doctors -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Active Doctors</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_doctors }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-4">
              <span class="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <!-- Today's Appointments -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-purple-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.today_appointments }}</p>
            </div>
            <div class="bg-purple-100 rounded-full p-4">
              <span class="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-orange-500 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Users</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ dashboardData.stats.total_users }}</p>
            </div>
            <div class="bg-orange-100 rounded-full p-4">
              <span class="text-2xl">👤</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Recent Patients Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Recent Patients</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Age</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="patient in dashboardData.recent_patients" 
                :key="patient.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {{ patient.id.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.age }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ patient.department }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge :status="patient.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(patient.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 3: Top Doctors + Department Load (2 columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Doctors -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Top Doctors Today</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="(doctor, index) in dashboardData.top_doctors" 
              :key="doctor.id"
              class="px-6 py-4 hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ doctor.name }}</p>
                      <p class="text-xs text-gray-600">{{ doctor.specialization }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">{{ doctor.today_appointments }}</p>
                  <p class="text-xs text-gray-600">appointments</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs text-gray-600">Rating:</span>
                <div class="flex items-center">
                  <span v-for="i in 5" :key="i" :class="i <= Math.round(doctor.rating * 5) ? 'text-yellow-400' : 'text-gray-300'">
                    ⭐
                  </span>
                </div>
              </div>
            </div>

            <div v-if="dashboardData.top_doctors.length === 0" class="px-6 py-8 text-center text-gray-500">
              No doctor data available
            </div>
          </div>
        </div>

        <!-- Department Load -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Department Load</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="dept in dashboardData.department_load" 
              :key="dept.department"
              class="px-6 py-4"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="font-medium text-gray-900">{{ dept.department }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-900">{{ dept.count }}</span>
                  <span class="text-xs text-gray-600">patients</span>
                </div>
              </div>
              <div class="relative bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  :style="{ width: dept.percentage + '%' }"
                  class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                />
              </div>
              <div class="flex justify-end mt-1">
                <span class="text-xs font-semibold text-gray-600">{{ dept.percentage }}%</span>
              </div>
            </div>

            <div v-if="dashboardData.department_load.length === 0" class="px-6 py-8 text-center text-gray-500">
              No department data available
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Doctor Modal -->
    <div v-if="showRegisterDoctorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Register Doctor</h2>
          <button @click="showRegisterDoctorModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form @submit.prevent="registerDoctor" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="doctorForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter doctor name"
              required
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="doctorForm.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="doctor@hospital.com"
              required
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="doctorForm.password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="doctorForm.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mobile number"
              required
            />
          </div>

          <!-- Specialization -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              v-model="doctorForm.specialization"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Cardiology, Surgery"
              required
            />
          </div>

          <!-- License Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              v-model="doctorForm.licenseNumber"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Medical License Number"
              required
            />
          </div>

          <!-- Department -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
            <input
              v-model="doctorForm.department"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., General, Surgical"
            />
          </div>

          <!-- Consultation Fee -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
            <input
              v-model.number="doctorForm.fees"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500"
              required
            />
          </div>

          <!-- Error Message -->
          <ErrorMessage v-if="doctorFormError" :message="doctorFormError" />

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showRegisterDoctorModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
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
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const api = useApi()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref(null)
const showRegisterDoctorModal = ref(false)
const registering = ref(false)
const doctorFormError = ref('')
const doctorForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  licenseNumber: '',
  department: '',
  fees: 500
})
const dashboardData = ref({
  stats: {
    total_patients: 0,
    total_doctors: 0,
    today_appointments: 0,
    total_users: 0
  },
  recent_patients: [],
  top_doctors: [],
  department_load: []
})

// Format timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/admin/dashboard')
    dashboardData.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load dashboard data. Please try again.'
    console.error('Dashboard fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

// Register new doctor
const registerDoctor = async () => {
  doctorFormError.value = ''
  registering.value = true

  try {
    // Parse name into first_name and last_name
    const nameParts = doctorForm.value.name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: doctorForm.value.email,
      password: doctorForm.value.password,
      phone: doctorForm.value.phone,
      specialization: doctorForm.value.specialization,
      license_number: doctorForm.value.licenseNumber,
      department: doctorForm.value.department || '',
      fees: doctorForm.value.fees
    }

    const response = await api.post('/admin/doctors/register', payload)
    
    // Success! Close modal and refresh data
    showRegisterDoctorModal.value = false
    resetDoctorForm()
    await fetchDashboardData()
    
    // Show success message (optional)
    console.log('Doctor registered successfully:', response.data)
  } catch (err) {
    doctorFormError.value = err.response?.data?.message || 'Failed to register doctor. Please try again.'
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
    fees: 500
  }
}

// Load data on component mount
onMounted(() => {
  // Verify user is admin
  if (authStore.role !== 'admin') {
    error.value = 'Unauthorized: Admin access required'
    isLoading.value = false
    return
  }

  fetchDashboardData()
})
</script>
