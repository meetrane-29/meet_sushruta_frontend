<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pharmacy Staff Management</h1>
        <p class="text-gray-600 mt-1">View and manage all pharmacy staff in the system</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showRegisterModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          + Register Staff
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
    <div v-if="!loading && !error" class="flex flex-col md:flex-row gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Staff Table -->
    <div v-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="filteredStaff.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="member in filteredStaff" :key="member.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ member.first_name }} {{ member.last_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ member.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ member.phone }}</td>
              <td class="px-6 py-4 text-sm">
                <span
                  :class="{
                    'bg-green-100 text-green-800': member.active,
                    'bg-gray-100 text-gray-800': !member.active
                  }"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ member.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm flex gap-2">
                <button
                  @click="viewStaffDetails(member)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                >
                  View
                </button>
                <button
                  @click="deleteStaff(member.id)"
                  class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="py-12 text-center text-gray-600">
        <p class="text-lg">No pharmacy staff found</p>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!loading && !error && staff.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Total Staff</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ staff.length }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-gray-600 text-sm">Active Staff</p>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ activeStaff }}</p>
      </div>
    </div>

    <!-- Register Staff Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-white rounded-t-lg">
          <h2 class="text-2xl font-bold">Register Pharmacy Staff</h2>
          <p class="text-purple-100 text-sm mt-1">Add a new pharmacy staff member</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="registerStaff" class="space-y-4 px-8 py-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              v-model="registerForm.name"
              type="text"
              placeholder="Enter full name"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              :class="formErrors.name ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="staff@hospital.com"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              :class="formErrors.email ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.email" class="text-red-500 text-xs mt-1">{{ formErrors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="Minimum 8 characters"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              :class="formErrors.password ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.password" class="text-red-500 text-xs mt-1">{{ formErrors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              v-model="registerForm.phone"
              type="tel"
              placeholder="9876543210"
              maxlength="10"
              @input="registerForm.phone = registerForm.phone.replace(/[^0-9]/g, '')"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              :class="formErrors.phone ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.phone" class="text-red-500 text-xs mt-1">{{ formErrors.phone }}</p>
          </div>

          <!-- API Error -->
          <ErrorMessage v-if="registerError" :message="registerError" />

          <!-- Buttons -->
          <div class="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              @click="closeRegisterModal"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="registering"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ registering ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Staff Details Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Staff Details</h2>
            <button @click="closeModal" class="text-gray-600 hover:text-gray-900 text-2xl leading-none">×</button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">First Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.first_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Last Name</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.last_name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Email</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.email }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Phone</label>
              <p class="text-lg font-semibold text-gray-900">{{ selectedStaff?.phone }}</p>
            </div>
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

          <div class="flex gap-2 pt-4">
            <button
              @click="updateStaff"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@/components/shared/ErrorMessage.vue'

const api = useApi()
const staff = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const showModal = ref(false)
const selectedStaff = ref(null)
const showRegisterModal = ref(false)
const registering = ref(false)
const registerError = ref('')
const formErrors = ref({})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  phone: ''
})

const editForm = ref({
  joining_date: '',
  salary: 0,
  attendance_percentage: 0,
  leave_balance: 0
})

const filteredStaff = computed(() => {
  return staff.value.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase()
    const email = (member.email || '').toLowerCase()
    const query = searchQuery.value.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })
})

const activeStaff = computed(() => {
  return staff.value.filter(s => s.active).length
})

const fetchPharmacyStaff = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/users?role=pharmacy')
    const data = response.data?.data || []
    staff.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load pharmacy staff.'
  } finally {
    loading.value = false
  }
}

const refreshData = () => fetchPharmacyStaff()

const validateForm = () => {
  formErrors.value = {}

  const nameParts = registerForm.value.name.trim().split(/\s+/)
  if (!registerForm.value.name.trim()) {
    formErrors.value.name = 'Full name is required'
  } else if (nameParts[0].length < 2) {
    formErrors.value.name = 'First name must be at least 2 characters'
  } else if (nameParts.length < 2 || nameParts[1].length < 2) {
    formErrors.value.name = 'Please enter both first and last name'
  }

  if (!registerForm.value.email.trim()) {
    formErrors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
    formErrors.value.email = 'Invalid email format'
  }

  if (!registerForm.value.password) {
    formErrors.value.password = 'Password is required'
  } else if (registerForm.value.password.length < 8) {
    formErrors.value.password = 'Password must be at least 8 characters'
  }

  if (!registerForm.value.phone.trim()) {
    formErrors.value.phone = 'Phone number is required'
  } else if (registerForm.value.phone.trim().length < 10) {
    formErrors.value.phone = 'Phone must be at least 10 digits'
  }

  return Object.keys(formErrors.value).length === 0
}

const registerStaff = async () => {
  if (!validateForm()) return

  registerError.value = ''
  registering.value = true

  try {
    const nameParts = registerForm.value.name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    await api.post('/admin-register', {
      first_name: firstName,
      last_name: lastName,
      email: registerForm.value.email.trim().toLowerCase(),
      password: registerForm.value.password,
      phone: registerForm.value.phone.trim(),
      role: 'pharmacy'
    })

    closeRegisterModal()
    await fetchPharmacyStaff()
  } catch (err) {
    registerError.value =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to register staff. Please try again.'
  } finally {
    registering.value = false
  }
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
  registerForm.value = { name: '', email: '', password: '', phone: '' }
  formErrors.value = {}
  registerError.value = ''
}

const viewStaffDetails = (member) => {
  selectedStaff.value = member
  const jd = member.joining_date
  editForm.value = {
    joining_date: (jd && jd > 0) ? new Date(jd < 1e10 ? jd * 1000 : jd).toISOString().split('T')[0] : '',
    salary: member.salary || 0,
    attendance_percentage: member.attendance_percentage || 0,
    leave_balance: member.leave_balance || 0
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedStaff.value = null
}

const updateStaff = async () => {
  if (!selectedStaff.value) return
  try {
    const payload = {
      ...editForm.value,
      joining_date: editForm.value.joining_date
        ? Math.floor(new Date(editForm.value.joining_date).getTime() / 1000)
        : 0
    }
    const response = await api.patch(`/users/${selectedStaff.value.id}`, payload)
    const index = staff.value.findIndex(s => s.id === selectedStaff.value.id)
    if (index !== -1) {
      staff.value[index] = { ...staff.value[index], ...(response.data?.data || response.data) }
    }
    closeModal()
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update staff'
  }
}

const deleteStaff = async (staffId) => {
  if (!confirm('Are you sure you want to delete this staff member?')) return
  try {
    await api.delete(`/users/${staffId}`)
    staff.value = staff.value.filter(s => s.id !== staffId)
    error.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete staff'
  }
}

onMounted(() => fetchPharmacyStaff())
</script>
