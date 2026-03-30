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
        <OPDBilling v-if="activeTab === 'billing'" />
      </div>

      <!-- Sidebar - Quick Stats -->
      <div class="lg:col-span-1">
        <!-- Quick Stats Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Patients Today</p>
              <p class="text-2xl font-bold text-blue-600">{{ stats.patientsToday }}</p>
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
              🔍 Search Patient
            </button>
            <button
              @click="activeTab = 'waiting-list'"
              class="w-full text-left px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors"
            >
              📋 Waiting List
            </button>
            <button
              @click="activeTab = 'billing'"
              class="w-full text-left px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors"
            >
              💰 Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import PatientRegistration from './tabs/PatientRegistration.vue'
import PatientSearch from './tabs/PatientSearch.vue'
import AppointmentManagement from './tabs/AppointmentManagement.vue'
import WaitingListManager from './tabs/WaitingListManager.vue'
import OPDBilling from './tabs/OPDBilling.vue'

const api = useApi()
const activeTab = ref('registration')
const currentDateTime = ref('')
const todayAppointments = ref([])
const loading = ref(false)

const tabs = [
  { id: 'registration', label: 'Patient Registration', icon: 'fas fa-user-plus' },
  { id: 'search', label: 'Search Patient', icon: 'fas fa-search' },
  { id: 'appointments', label: 'Appointments', icon: 'fas fa-calendar' },
  { id: 'waiting-list', label: 'Waiting List', icon: 'fas fa-list' },
  { id: 'billing', label: 'Billing', icon: 'fas fa-receipt' }
]

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

onMounted(async () => {
  updateDateTime()
  await loadTodayAppointments()
  // Update time every minute
  setInterval(updateDateTime, 60000)
})
</script>

<style scoped>
.reception-dashboard {
  padding: 20px;
}
</style>
