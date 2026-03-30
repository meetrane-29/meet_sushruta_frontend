<template>
  <div class="waiting-list-manager">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">OPD Waiting List</h2>

      <!-- Doctor Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
        <select
          v-model="selectedDoctorID"
          @change="loadWaitingList"
          class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">{{ doctors.length === 0 ? 'No doctors available' : 'Choose a doctor' }}</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            Dr. {{ doctor.user?.first_name }} {{ doctor.user?.last_name }} — {{ doctor.specialization }}
          </option>
        </select>
      </div>

      <!-- Waiting List Statistics -->
      <div v-if="selectedDoctorID" class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <p class="text-sm text-gray-600">Waiting</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats.waiting }}</p>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg text-center">
          <p class="text-sm text-gray-600">Called</p>
          <p class="text-2xl font-bold text-orange-600">{{ stats.called }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <p class="text-sm text-gray-600">Completed</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.completed }}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <p class="text-sm text-gray-600">Est. Wait</p>
          <p class="text-2xl font-bold text-purple-600">{{ estimatedWaitTime }}m</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="selectedDoctorID" class="flex gap-4 mb-6">
        <button
          @click="callNextPatient"
          :disabled="isLoading || waitingList.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
        >
          📢 Call Next Patient
        </button>
        <button
          @click="loadWaitingList"
          :disabled="isLoading"
          class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Waiting List Table -->
      <div v-if="selectedDoctorID && waitingList.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Token</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Patient Name</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Age</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Arrival</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, idx) in waitingList"
              :key="entry.id"
              :class="[
                'border-b border-gray-200 hover:bg-gray-50',
                entry.status === 'called' ? 'bg-yellow-50' : '',
                entry.status === 'completed' ? 'bg-green-50' : ''
              ]"
            >
              <td class="px-4 py-3">
                <span class="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {{ entry.token_number }}
                </span>
              </td>
              <td class="px-4 py-3 font-medium text-gray-800">
                {{ entry.patient?.user?.first_name }} {{ entry.patient?.user?.last_name }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ getAge(entry.patient?.date_of_birth) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatTime(entry.arrival_time) }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    entry.status === 'waiting'
                      ? 'bg-blue-100 text-blue-800'
                      : entry.status === 'called'
                      ? 'bg-yellow-100 text-yellow-800'
                      : entry.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ formatStatus(entry.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    v-if="entry.status === 'called' || entry.status === 'waiting'"
                    @click="markPatientSeen(entry)"
                    class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Seen
                  </button>
                  <button
                    v-if="entry.status === 'seen' || entry.status === 'called'"
                    @click="completeConsultation(entry)"
                    class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Done
                  </button>
                  <button
                    v-if="entry.status !== 'completed' && entry.status !== 'cancelled'"
                    @click="cancelEntry(entry)"
                    class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="selectedDoctorID && waitingList.length === 0" class="text-center py-12">
        <p class="text-lg text-gray-600">No patients in waiting list</p>
        <p class="text-sm text-gray-500 mt-2">Patients will appear here once appointments are confirmed</p>
      </div>

      <!-- Add to Waiting List Form -->
      <div v-if="selectedDoctorID" class="mt-8 border-t pt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Add Patient to Waiting List</h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment ID *</label>
            <input
              v-model="newWaitingForm.appointmentID"
              type="text"
              placeholder="Enter appointment ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
            <input
              v-model="newWaitingForm.patientID"
              type="text"
              placeholder="Enter patient ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <button
          @click="addToWaitingList"
          :disabled="isLoading || !newWaitingForm.appointmentID || !newWaitingForm.patientID"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          ➕ Add to Waiting List
        </button>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
        Error: {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOPDApi } from '@/composables/useOPDApi'
import { useApi } from '@/composables/useApi'

const selectedDoctorID = ref('')
const doctors = ref([])
const waitingList = ref([])
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const estimatedWaitTime = ref(0)

const opdApi = useOPDApi()
const { api } = useApi()

const newWaitingForm = ref({
  appointmentID: '',
  patientID: ''
})

const stats = computed(() => {
  return {
    waiting: waitingList.value.filter(e => e.status === 'waiting').length,
    called: waitingList.value.filter(e => e.status === 'called').length,
    completed: waitingList.value.filter(e => e.status === 'completed').length
  }
})

onMounted(async () => {
  // Load doctors
  try {
    const result = await api.get('/doctors')
    if (result && result.data) {
      // API returns { success: true, data: [...] }
      doctors.value = Array.isArray(result.data) ? result.data : (result.data.data || [])
    }
  } catch (error) {
    console.error('Error loading doctors:', error)
    doctors.value = []
  }
})

const loadWaitingList = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const result = await opdApi.getDoctorWaitingList(selectedDoctorID.value)
    if (result && result.data) {
      waitingList.value = result.data.data?.waiting_list || []
    }

    // Get estimated wait time
    const timeResult = await opdApi.getEstimatedWaitTime(selectedDoctorID.value)
    if (timeResult && timeResult.data) {
      estimatedWaitTime.value = timeResult.data.estimated_wait_time_minutes
    }
  } catch (error) {
    errorMessage.value = 'Error loading waiting list'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const callNextPatient = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const result = await opdApi.callNextPatient(selectedDoctorID.value)
    if (result && result.data) {
      successMessage.value = `Token ${result.data.token_number} - ${result.data.patient?.user?.first_name} called!`
      await loadWaitingList()
    }
  } catch (error) {
    errorMessage.value = error.message || 'No more patients to call'
  } finally {
    isLoading.value = false
  }
}

const markPatientSeen = async (entry) => {
  try {
    await opdApi.markPatientSeen(entry.id)
    successMessage.value = 'Patient marked as seen'
    await loadWaitingList()
  } catch (error) {
    errorMessage.value = 'Error updating status'
  }
}

const completeConsultation = async (entry) => {
  try {
    await opdApi.completeConsultation(entry.id)
    successMessage.value = 'Consultation marked completed'
    await loadWaitingList()
  } catch (error) {
    errorMessage.value = 'Error updating status'
  }
}

const cancelEntry = async (entry) => {
  if (confirm('Cancel this waiting list entry?')) {
    try {
      await opdApi.cancelWaitingListEntry(entry.id)
      successMessage.value = 'Entry cancelled'
      await loadWaitingList()
    } catch (error) {
      errorMessage.value = 'Error cancelling entry'
    }
  }
}

const addToWaitingList = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const result = await opdApi.addToWaitingList(
      newWaitingForm.value.appointmentID,
      newWaitingForm.value.patientID,
      selectedDoctorID.value
    )

    if (result && result.data) {
      successMessage.value = `Patient added to waiting list with token ${result.data.token_number}`
      newWaitingForm.value = { appointmentID: '', patientID: '' }
      await loadWaitingList()
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error adding to waiting list'
  } finally {
    isLoading.value = false
  }
}

const getAge = (dob) => {
  if (!dob) return 'N/A'
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const month = today.getMonth() - birthDate.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const formatStatus = (status) => {
  const statusMap = {
    waiting: 'Waiting',
    called: 'Called',
    seen: 'In Consultation',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.waiting-list-manager {
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
