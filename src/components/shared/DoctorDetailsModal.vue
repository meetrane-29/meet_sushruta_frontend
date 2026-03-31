<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ isEditMode ? 'Edit Doctor' : 'Doctor Details' }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div v-else-if="doctor">
          <!-- View Mode -->
          <div v-if="!isEditMode" class="space-y-6">
            <!-- Doctor Avatar -->
            <div class="flex justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-5xl">
                👨‍⚕️
              </div>
            </div>

            <!-- Doctor Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600">First Name</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.user?.first_name || '--' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Last Name</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.user?.last_name || '--' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600">Specialization</label>
                <p class="text-lg font-semibold text-blue-600 mt-1">{{ doctor.specialization }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Department</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.department || '--' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600">License Number</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.license_number }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Consultation Fee</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">₹{{ doctor.consultation_fee || '--' }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Bio</label>
              <p class="text-gray-900 mt-1 whitespace-pre-wrap">{{ doctor.bio || 'No bio provided' }}</p>
            </div>

            <!-- HR Details -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Employment & Attendance</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Joining Date</label>
                  <p class="text-lg font-semibold text-gray-900 mt-1">{{ formatDate(doctor.joining_date || doctor.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Salary (₹)</label>
                  <p class="text-lg font-semibold text-gray-900 mt-1">{{ formatCurrency(doctor.salary) }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Attendance %</label>
                  <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.attendance_percentage || '--' }}%</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Leave Balance (days)</label>
                  <p class="text-lg font-semibold text-gray-900 mt-1">{{ doctor.leave_balance || '--' }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Status</label>
              <span
                :class="{
                  'bg-green-100 text-green-800': doctor.user?.active,
                  'bg-gray-100 text-gray-800': !doctor.user?.active
                }"
                class="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1"
              >
                {{ doctor.user?.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveChanges" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                v-model="editForm.specialization"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                v-model="editForm.department"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
              <input
                v-model.number="editForm.consultation_fee"
                type="number"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="editForm.bio"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- HR Fields -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Employment & Attendance</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input
                  v-model="editForm.joining_date"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 mt-4">Salary (₹)</label>
                <input
                  v-model.number="editForm.salary"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 mt-4">Attendance %</label>
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
                <label class="block text-sm font-medium text-gray-700 mb-1 mt-4">Leave Balance (days)</label>
                <input
                  v-model.number="editForm.leave_balance"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Save Button -->
            <button
              type="submit"
              :disabled="savingChanges"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {{ savingChanges ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
        <button
          v-if="!isEditMode"
          @click="toggleEditMode"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <!-- Pencil Icon SVG -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
          </svg>
          Edit
        </button>

        <button
          v-if="isEditMode"
          @click="cancelEdit"
          class="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Cancel
        </button>

        <button
          v-if="!isEditMode"
          @click="confirmDelete"
          :disabled="deleting"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <!-- Trash Icon SVG -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>

        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  isOpen: Boolean,
  doctor: Object
})

const emit = defineEmits(['close', 'updated', 'deleted'])

const api = useApi()
const loading = ref(false)
const error = ref('')
const isEditMode = ref(false)
const savingChanges = ref(false)
const deleting = ref(false)

const editForm = ref({
  specialization: '',
  department: '',
  consultation_fee: 0,
  bio: '',
  joining_date: 0,
  salary: 0,
  attendance_percentage: 0,
  leave_balance: 0
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'Not set'
  let ts = Number(timestamp)
  if (Number.isNaN(ts) || ts <= 0) return 'Not set'
  // joining_date is stored in seconds, created_at is in milliseconds
  // If ts < 1e10, it's in seconds — convert to ms
  if (ts < 1e10) ts = ts * 1000
  const date = new Date(ts)
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

const closeModal = () => {
  isEditMode.value = false
  error.value = ''
  emit('close')
}

const toDateInputValue = (seconds) => {
  if (!seconds || seconds <= 0) return ''
  return new Date(Number(seconds) * 1000).toISOString().split('T')[0]
}

const toggleEditMode = () => {
  if (!isEditMode.value) {
    editForm.value = {
      specialization: props.doctor.specialization || '',
      department: props.doctor.department || '',
      consultation_fee: props.doctor.consultation_fee || 0,
      bio: props.doctor.bio || '',
      joining_date: toDateInputValue(props.doctor.joining_date),
      salary: props.doctor.salary || 0,
      attendance_percentage: props.doctor.attendance_percentage || 0,
      leave_balance: props.doctor.leave_balance || 0
    }
  }
  isEditMode.value = !isEditMode.value
  error.value = ''
}

const cancelEdit = () => {
  isEditMode.value = false
  error.value = ''
}

const saveChanges = async () => {
  savingChanges.value = true
  error.value = ''

  try {
    const payload = {
      ...editForm.value,
      joining_date: editForm.value.joining_date
        ? Math.floor(new Date(editForm.value.joining_date).getTime() / 1000)
        : 0
    }
    const response = await api.patch(`/doctors/${props.doctor.id}`, payload)
    emit('updated', response.data.data || response.data)
    isEditMode.value = false
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update doctor'
    console.error('Update doctor error:', err)
  } finally {
    savingChanges.value = false
  }
}

const confirmDelete = () => {
  if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
    deleteDoctor()
  }
}

const deleteDoctor = async () => {
  deleting.value = true
  error.value = ''

  try {
    await api.delete(`/doctors/${props.doctor.id}`)
    emit('deleted', props.doctor.id)
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete doctor'
    console.error('Delete doctor error:', err)
  } finally {
    deleting.value = false
  }
}
</script>
