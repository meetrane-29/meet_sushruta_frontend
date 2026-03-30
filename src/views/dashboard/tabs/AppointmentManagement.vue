<template>
  <div class="appointment-management">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Appointment Management</h2>

      <!-- Tabs for Book/Reschedule/Cancel -->
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          v-for="tab in appointmentTabs"
          :key="tab.id"
          @click="activeAppointmentTab = tab.id"
          :class="[
            'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
            activeAppointmentTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Book New Appointment -->
      <div v-if="activeAppointmentTab === 'book'" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">New Appointment</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient ID/UHID *</label>
            <input
              v-model="appointmentForm.patientID"
              type="text"
              placeholder="Enter patient ID or UHID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
            <select
              v-model="appointmentForm.doctorID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Choose a doctor</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.user?.first_name }} {{ doctor.user?.last_name }} ({{ doctor.specialization }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
            <input
              v-model="appointmentForm.appointmentDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Time *</label>
            <input
              v-model="appointmentForm.appointmentTime"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              v-model="appointmentForm.reason"
              placeholder="e.g., General checkup, Flu symptoms..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="3"
            ></textarea>
          </div>
        </div>

        <button
          @click="bookAppointment"
          :disabled="isLoading"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          <span v-if="!isLoading">📅 Book Appointment</span>
          <span v-else>Booking...</span>
        </button>
      </div>

      <!-- Reschedule Appointment -->
      <div v-if="activeAppointmentTab === 'reschedule'" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Reschedule Appointment</h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment ID *</label>
            <input
              v-model="appointmentForm.appointmentID"
              type="text"
              placeholder="Enter appointment ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <button
              @click="findAppointment"
              class="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Find
            </button>
          </div>
        </div>

        <div v-if="currentAppointment" class="bg-gray-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-600 mb-2">Current Details:</p>
          <p class="font-medium">{{ currentAppointment.appointment_date }} at {{ currentAppointment.appointment_time }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Date *</label>
            <input
              v-model="appointmentForm.newDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Time *</label>
            <input
              v-model="appointmentForm.newTime"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <button
          @click="rescheduleAppointment"
          :disabled="isLoading || !currentAppointment"
          class="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 mt-4"
        >
          <span v-if="!isLoading">🔄 Reschedule</span>
          <span v-else>Processing...</span>
        </button>
      </div>

      <!-- Cancel Appointment -->
      <div v-if="activeAppointmentTab === 'cancel'" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Cancel Appointment</h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment ID *</label>
            <input
              v-model="appointmentForm.cancelAppointmentID"
              type="text"
              placeholder="Enter appointment ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <button
              @click="findCancelAppointment"
              class="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Find
            </button>
          </div>
        </div>

        <div v-if="appointmentToCancel" class="bg-red-50 p-4 rounded-lg mb-4">
          <p class="text-red-800 font-medium">Confirm cancellation of this appointment?</p>
          <p class="text-sm text-red-700 mt-2">
            {{ appointmentToCancel.appointment_date }} at {{ appointmentToCancel.appointment_time }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
          <textarea
            v-model="appointmentForm.cancelReason"
            placeholder="Reason for cancellation..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="3"
          ></textarea>
        </div>

        <button
          @click="cancelAppointment"
          :disabled="isLoading || !appointmentToCancel"
          class="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 mt-4"
        >
          <span v-if="!isLoading">❌ Cancel Appointment</span>
          <span v-else>Processing...</span>
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
        Error: {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { usePatientApi } from '@/composables/usePatientApi'

const activeAppointmentTab = ref('book')
const appointmentTabs = [
  { id: 'book', label: '+ Book New' },
  { id: 'reschedule', label: '🔄 Reschedule' },
  { id: 'cancel', label: '❌ Cancel' }
]

const doctors = ref([])
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const currentAppointment = ref(null)
const appointmentToCancel = ref(null)

const { api } = useApi()
const patientApi = usePatientApi()

const appointmentForm = ref({
  patientID: '',
  doctorID: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  appointmentID: '',
  newDate: '',
  newTime: '',
  cancelAppointmentID: '',
  cancelReason: ''
})

onMounted(async () => {
  // Load doctors
  try {
    const result = await api.get('/doctors')
    if (result && result.data) {
      doctors.value = result.data
    }
  } catch (error) {
    console.error('Error loading doctors:', error)
  }
})

const bookAppointment = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const response = await api.post('/appointments', {
      patient_id: appointmentForm.value.patientID,
      doctor_id: appointmentForm.value.doctorID,
      appointment_date: appointmentForm.value.appointmentDate,
      appointment_time: appointmentForm.value.appointmentTime,
      reason: appointmentForm.value.reason
    })

    if (response && response.data) {
      successMessage.value = `Appointment booked successfully for ${appointmentForm.value.appointmentDate}`
      // Reset form
      appointmentForm.value = {
        patientID: '',
        doctorID: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      }
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error booking appointment'
  } finally {
    isLoading.value = false
  }
}

const findAppointment = async () => {
  try {
    const response = await api.get(`/api/v1/appointments/${appointmentForm.value.appointmentID}`)
    if (response && response.data) {
      currentAppointment.value = response.data
    }
  } catch (error) {
    errorMessage.value = 'Appointment not found'
  }
}

const rescheduleAppointment = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Update appointment
    const response = await api.patch(`/api/v1/appointments/${appointmentForm.value.appointmentID}/status`, {
      status: 'pending',
      appointment_date: appointmentForm.value.newDate,
      appointment_time: appointmentForm.value.newTime
    })

    successMessage.value = 'Appointment rescheduled successfully'
    currentAppointment.value = null
  } catch (error) {
    errorMessage.value = error.message || 'Error rescheduling appointment'
  } finally {
    isLoading.value = false
  }
}

const findCancelAppointment = async () => {
  try {
    const response = await api.get(`/api/v1/appointments/${appointmentForm.value.cancelAppointmentID}`)
    if (response && response.data) {
      appointmentToCancel.value = response.data
    }
  } catch (error) {
    errorMessage.value = 'Appointment not found'
  }
}

const cancelAppointment = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await api.patch(`/api/v1/appointments/${appointmentForm.value.cancelAppointmentID}/status`, {
      status: 'cancelled'
    })

    successMessage.value = 'Appointment cancelled successfully'
    appointmentToCancel.value = null
  } catch (error) {
    errorMessage.value = error.message || 'Error cancelling appointment'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.appointment-management {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
