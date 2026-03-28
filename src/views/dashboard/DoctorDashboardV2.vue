<template>
  <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">👨‍⚕️ Doctor's Dashboard</h1>
            <p class="text-blue-100 mt-2">Manage patients, appointments, and medical records</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold">{{ currentDoctor?.user?.name || 'Dr. ...' }}</p>
            <p class="text-blue-100">{{ currentDoctor?.specialization }}</p>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white p-4 rounded-lg shadow border-b border-gray-200">
        <div class="flex gap-4 flex-wrap">
          <button
            @click="activeTab = 'schedule'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            📅 Daily Schedule
          </button>
          <button
            @click="activeTab = 'records'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              activeTab === 'records'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            📋 Patient Records
          </button>
          <button
            @click="activeTab = 'management'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              activeTab === 'management'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            💊 Current Patient
          </button>
          <button
            @click="activeTab = 'ipd'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              activeTab === 'ipd'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            🏥 IPD Patients
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Daily Schedule Tab -->
        <DailyScheduleTab v-if="activeTab === 'schedule'" :doctor-id="currentDoctorId" />

        <!-- Patient Records Tab -->
        <PatientRecordsTab v-if="activeTab === 'records'" :doctor-id="currentDoctorId" />

        <!-- Current Patient Management Tab -->
        <CurrentPatientManagementTab v-if="activeTab === 'management'" :doctor-id="currentDoctorId" />

        <!-- IPD Patients Tab -->
        <IPDPatientsTab v-if="activeTab === 'ipd'" :doctor-id="currentDoctorId" />
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import DailyScheduleTab from './tabs/DailyScheduleTab.vue'
import PatientRecordsTab from './tabs/PatientRecordsTab.vue'
import CurrentPatientManagementTab from './tabs/CurrentPatientManagementTab.vue'
import IPDPatientsTab from './tabs/IPDPatientsTab.vue'
import { useApi } from '../../composables/useApi.js'

export default {
  name: 'DoctorDashboardV2',
  components: {
    DailyScheduleTab,
    PatientRecordsTab,
    CurrentPatientManagementTab,
    IPDPatientsTab
  },
  setup() {
    const activeTab = ref('schedule')
    const currentDoctor = ref(null)
    const currentDoctorId = ref(null)
    const { get } = useApi()
    const loading = ref(false)
    const error = ref(null)

    const fetchCurrentDoctor = async () => {
      try {
        loading.value = true
        const response = await get('/doctors/me')
        currentDoctor.value = response
        currentDoctorId.value = response.id
      } catch (err) {
        console.error('Failed to fetch doctor info:', err)
        error.value = 'Unable to fetch doctor information'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCurrentDoctor()
    })

    return {
      activeTab,
      currentDoctor,
      currentDoctorId,
      loading,
      error
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
}
</style>
