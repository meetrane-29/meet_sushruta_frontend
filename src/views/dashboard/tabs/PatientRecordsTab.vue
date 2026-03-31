<template>
  <div class="space-y-6">

    <!-- No patient selected -->
    <div v-if="!selectedAppointment && !patient" class="bg-white p-12 rounded-lg shadow text-center">
      <p class="text-5xl mb-4">👆</p>
      <p class="text-xl font-semibold text-gray-700">No patient selected</p>
      <p class="text-gray-500 mt-2">Click on a patient in Daily Schedule tab</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-2">Loading patient records...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      ❌ {{ error }}
    </div>

    <!-- Patient Records -->
    <div v-if="!loading && patient" class="space-y-6">

      <!-- Patient Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl">👤</div>
          <div>
            <h2 class="text-2xl font-bold">
              {{ patient.user?.first_name }} {{ patient.user?.last_name }}
            </h2>
            <p class="text-blue-100 mt-1">{{ patient.gender || '--' }} &nbsp;|&nbsp; DOB: {{ patient.date_of_birth || '--' }}</p>
            <p class="text-blue-100">📞 {{ patient.user?.phone || '--' }} &nbsp;|&nbsp; ✉️ {{ patient.user?.email || '--' }}</p>
          </div>
        </div>
        <div class="text-right space-y-1">
          <p class="text-2xl font-bold text-red-300">{{ patient.blood_group || '--' }}</p>
          <p class="text-blue-100 text-sm">Blood Group</p>
        </div>
      </div>

      <!-- Alerts Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="patient.allergies" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="font-bold text-red-800">⚠️ ALLERGIES</p>
          <p class="text-red-700 mt-1">{{ patient.allergies }}</p>
        </div>
        <div v-if="patient.medical_history" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p class="font-bold text-yellow-800">📋 Medical History</p>
          <p class="text-yellow-700 mt-1 text-sm">{{ patient.medical_history }}</p>
        </div>
        <div v-if="patient.emergency_contact" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p class="font-bold text-blue-800">🆘 Emergency Contact</p>
          <p class="text-blue-700 mt-1">{{ patient.emergency_contact }}</p>
        </div>
        <div v-if="patient.address" class="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
          <p class="font-bold text-gray-700">🏠 Address</p>
          <p class="text-gray-600 mt-1 text-sm">{{ patient.address }}</p>
        </div>
      </div>

      <!-- Prescriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">💊 Prescription History</h3>
        <div v-if="rxLoading" class="text-center py-4 text-gray-400">Loading...</div>
        <div v-else-if="prescriptions.length === 0" class="text-center py-6 text-gray-400">
          No prescriptions found
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="rx in prescriptions"
            :key="rx.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <p class="font-semibold text-gray-800">{{ formatTs(rx.created_at) }}</p>
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">{{ rx.status || 'issued' }}</span>
            </div>
            <p v-if="rx.notes" class="text-gray-500 text-sm mb-2 italic">{{ rx.notes }}</p>
            <div v-if="rx.prescription_items?.length" class="space-y-1">
              <div
                v-for="item in rx.prescription_items"
                :key="item.id"
                class="bg-blue-50 rounded px-3 py-2 text-sm flex justify-between"
              >
                <span class="font-medium text-blue-800">{{ item.medicine?.name || 'Medicine' }}</span>
                <span class="text-gray-600">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lab Orders -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">🧪 Lab Order History</h3>
        <div v-if="labLoading" class="text-center py-4 text-gray-400">Loading...</div>
        <div v-else-if="labOrders.length === 0" class="text-center py-6 text-gray-400">
          No lab orders found
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="order in labOrders"
            :key="order.id"
            class="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ order.test_name }}</p>
              <p class="text-sm text-gray-500">{{ order.test_type }} &nbsp;|&nbsp; {{ formatTs(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <span
                :class="{
                  'bg-green-100 text-green-700': order.status === 'completed',
                  'bg-yellow-100 text-yellow-700': order.status === 'pending',
                  'bg-red-100 text-red-700': order.priority === 'urgent' || order.priority === 'stat',
                  'bg-gray-100 text-gray-700': !['completed','pending'].includes(order.status)
                }"
                class="px-2 py-1 rounded text-xs font-medium capitalize"
              >{{ order.status }}</span>
              <p class="text-xs text-gray-400 mt-1 capitalize">{{ order.priority }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useApi } from '../../../composables/useApi.js'

const props = defineProps({
  doctorId: { type: String, default: null },
  selectedAppointment: { type: Object, default: null }
})

const apiClient = useApi()
const patient = ref(null)
const loading = ref(false)
const error = ref(null)
const prescriptions = ref([])
const labOrders = ref([])
const rxLoading = ref(false)
const labLoading = ref(false)

const formatTs = (ts) => {
  if (!ts) return '--'
  let t = Number(ts)
  if (t < 1e10) t *= 1000
  return new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const loadPatient = async (patientId) => {
  loading.value = true
  error.value = null
  try {
    const res = await apiClient.get(`/patients/${patientId}`)
    patient.value = res?.data?.data || res?.data || null
  } catch (e) {
    error.value = 'Failed to load patient details'
    patient.value = null
  } finally {
    loading.value = false
  }
}

const loadHistory = async (patientId) => {
  rxLoading.value = true
  labLoading.value = true
  try {
    const [rxRes, labRes] = await Promise.allSettled([
      apiClient.get(`/prescriptions/patient/${patientId}?limit=20`),
      apiClient.get(`/lab/patients/${patientId}/orders?limit=20`)
    ])
    if (rxRes.status === 'fulfilled') {
      const d = rxRes.value?.data?.data
      prescriptions.value = Array.isArray(d) ? d : (d?.prescriptions || [])
    }
    if (labRes.status === 'fulfilled') {
      const d = labRes.value?.data?.data
      labOrders.value = Array.isArray(d) ? d : (d?.orders || [])
    }
  } finally {
    rxLoading.value = false
    labLoading.value = false
  }
}

watch(() => props.selectedAppointment, (apt) => {
  if (apt) {
    const pid = apt.patient_id || apt.patient?.id
    if (pid) {
      loadPatient(pid)
      loadHistory(pid)
    }
  }
}, { immediate: true })
</script>
