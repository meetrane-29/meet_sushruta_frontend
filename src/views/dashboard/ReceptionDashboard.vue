<template>
  <div class="reception-dashboard">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">OPD Reception Desk</h1>
          <p class="text-blue-100 mt-2">Manage patient registration, appointments, and billing</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-blue-100">{{ currentDateTime }}</p>
          <p class="mt-2"><span class="bg-blue-500 px-3 py-1 rounded-full text-sm">Today</span></p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
          activeTab === tab.id
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-800'
        ]"
      >
        <span class="flex items-center gap-2">
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content Area -->
      <div class="lg:col-span-3">
        <!-- Patient Registration Tab -->
        <PatientRegistration v-if="activeTab === 'registration'" />

        <!-- Patient Search Tab -->
        <PatientSearch v-if="activeTab === 'search'" />

        <!-- Appointment Management Tab -->
        <AppointmentManagement v-if="activeTab === 'appointments'" />

        <!-- Waiting List Tab -->
        <WaitingListManager v-if="activeTab === 'waiting-list'" />

        <!-- OPD Billing Tab -->
        <OPDBilling v-if="activeTab === 'billing'" :patientData="selectedPatient" />

        <!-- Bed Management Tab -->
        <BedManagementTab v-if="activeTab === 'beds'" />

        <!-- IPD Requests Tab -->
        <IPDRequestsTab v-if="activeTab === 'ipd'" />
      </div>

      <!-- Sidebar - Quick Stats -->
      <div class="lg:col-span-1">
        <!-- Quick Stats Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
          
          <div class="space-y-4">
            <div
              class="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              @click="showTodayModal = true"
              title="Click to see today's patients"
            >
              <p class="text-sm text-gray-600">Patients Today</p>
              <p class="text-2xl font-bold text-blue-600 underline">{{ stats.patientsToday }}</p>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">In Waiting List</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.waitingCount }}</p>
            </div>

            <div class="bg-orange-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.completedCount }}</p>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Pending Billing</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.pendingBilling }}</p>
            </div>
          </div>
        </div>

        <!-- Shortcuts Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <button
              @click="activeTab = 'registration'"
              class="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            >
              + New Patient
            </button>
            <button
              @click="activeTab = 'search'"
              class="w-full text-left px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
            >
              Search Patient
            </button>
            <button
              @click="activeTab = 'waiting-list'"
              class="w-full text-left px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors"
            >
              Waiting List
            </button>
            <button
              @click="activeTab = 'billing'"
              class="w-full text-left px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors"
            >
              Billing
            </button>
            <button
              @click="activeTab = 'beds'"
              class="w-full text-left px-4 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded transition-colors"
            >
              Bed Management
            </button>
            <button
              @click="activeTab = 'ipd'"
              class="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
            >
              IPD Requests
            </button>
          </div>
        </div>

        <!-- Today's Active Doctors Card -->
        <div class="bg-white rounded-lg shadow-sm p-5 mt-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-gray-800">Today's Active Doctors</h3>
            <span class="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {{ activeDoctors.length }}
            </span>
          </div>
          <div v-if="activeDoctors.length === 0" class="text-sm text-gray-400 text-center py-3">
            No doctors logged in yet
          </div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="doc in activeDoctors"
              :key="doc.doctor_id"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
            >
              <span class="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">Dr. {{ doc.first_name }} {{ doc.last_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ doc.specialization }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Today's Patients Modal -->
  <div v-if="showTodayModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-5 border-b">
        <h3 class="text-lg font-bold text-gray-800">Aaj ke Appointments ({{ todayAppointments.length }})</h3>
        <button @click="showTodayModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      <div class="overflow-y-auto flex-1 p-4">
        <div v-if="todayAppointments.length === 0" class="text-center text-gray-500 py-8">
          Aaj koi appointment nahi hai
        </div>
        <div
          v-for="appt in todayAppointments"
          :key="appt.id"
          class="flex items-center justify-between p-3 mb-2 border rounded-lg hover:bg-gray-50"
        >
          <div class="flex-1">
            <p class="font-semibold text-gray-800">
              {{ appt.patient?.user?.first_name }} {{ appt.patient?.user?.last_name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ appt.appointment_time }} &nbsp;|&nbsp;
              Dr. {{ appt.doctor?.user?.first_name }} {{ appt.doctor?.user?.last_name }}
            </p>
            <span :class="['text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block', statusClass(appt.status)]">
              {{ appt.status }}
            </span>
          </div>
          <button
            @click="openBilling(appt)"
            class="ml-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            💰 Billing
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useApi } from '@/composables/useApi'
import PatientRegistration from './tabs/PatientRegistration.vue'
import PatientSearch from './tabs/PatientSearch.vue'
import AppointmentManagement from './tabs/AppointmentManagement.vue'
import WaitingListManager from './tabs/WaitingListManager.vue'
import OPDBilling from './tabs/OPDBilling.vue'
import BedManagementTab from './tabs/BedManagementTab.vue'
import IPDRequestsTab from './tabs/IPDRequestsTab.vue'

const api = useApi()
const activeTab = ref('registration')
const currentDateTime = ref('')
const todayAppointments = ref([])

const showTodayModal = ref(false)
const selectedPatient = ref(null)

const tabs = [
  { id: 'registration', label: 'Patient Registration', icon: 'fas fa-user-plus' },
  { id: 'search', label: 'Search Patient', icon: 'fas fa-search' },
  { id: 'appointments', label: 'Appointments', icon: 'fas fa-calendar' },
  { id: 'waiting-list', label: 'Waiting List', icon: 'fas fa-list' },
  { id: 'billing', label: 'Billing', icon: 'fas fa-receipt' },
  { id: 'beds', label: 'Bed Management', icon: 'fas fa-bed' },
  { id: 'ipd', label: 'IPD Requests', icon: 'fas fa-hospital' }
]

const activeDoctors = ref([])
let activeDoctorsPollInterval = null

const stats = ref({
  patientsToday: 0,
  waitingCount: 0,
  completedCount: 0,
  pendingBilling: 0
})

// Update current date and time
const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value = now.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load today's active doctors
const loadActiveDoctors = async () => {
  try {
    const res = await api.get('/doctors/active-today')
    activeDoctors.value = res.data?.data?.doctors || []
  } catch (err) {
    console.error('Failed to load active doctors:', err)
  }
}

// Load today's appointments
const loadTodayAppointments = async () => {
  try {
    const res = await api.get('/appointments/today?limit=100')
    const apptsData = res.data?.data?.appointments || res.data?.appointments || []
    todayAppointments.value = Array.isArray(apptsData) ? apptsData : []
    stats.value.patientsToday = todayAppointments.value.length
  } catch (err) {
    console.error('Failed to load today appointments:', err)
    stats.value.patientsToday = 0
  }
}

const statusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const openBilling = (appt) => {
  selectedPatient.value = {
    patientId: appt.patient_id,
    appointmentId: appt.id,
    patientName: `${appt.patient?.user?.first_name || ''} ${appt.patient?.user?.last_name || ''}`.trim(),
    doctorName: `${appt.doctor?.user?.first_name || ''} ${appt.doctor?.user?.last_name || ''}`.trim(),
    appointmentTime: appt.appointment_time,
    status: appt.status
  }
  showTodayModal.value = false
  activeTab.value = 'billing'
}

onMounted(async () => {
  updateDateTime()
  await Promise.all([loadTodayAppointments(), loadActiveDoctors()])
  // Update time every minute
  setInterval(updateDateTime, 60000)
  // Poll active doctors every 30 seconds
  activeDoctorsPollInterval = setInterval(loadActiveDoctors, 30000)

  // Listen for tab switching events from PatientSearch
  window.addEventListener('switchTab', (event) => {
    if (event.detail && event.detail.tab) {
      activeTab.value = event.detail.tab
    }
  })
})

onUnmounted(() => {
  clearInterval(activeDoctorsPollInterval)
})
</script>

<style scoped>
.reception-dashboard {
  padding: 20px;
}
</style>
