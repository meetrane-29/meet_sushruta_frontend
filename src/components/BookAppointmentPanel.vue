<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900">📅 Book Appointment</h2>
    </div>

    <div class="p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Specialization</label>
          <select v-model="selectedSpec" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Select Specialization</option>
            <option v-for="spec in specs" :key="spec.name" :value="spec.name">{{ spec.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Doctor</label>
          <select v-model="selectedDoctor" :disabled="!selectedSpec" class="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
            <option value="">{{ filteredDocs.length === 0 && selectedSpec ? 'No doctors available' : 'Select Doctor' }}</option>
            <option v-for="doc in filteredDocs" :key="doc.id" :value="doc.id">{{ getDocName(doc) }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Date</label>
          <input v-model="apptDate" type="date" :min="minDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Time</label>
          <input v-model="apptTime" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">Reason</label>
        <textarea v-model="reason" placeholder="Why are you visiting?" class="w-full px-3 py-2 border border-gray-300 rounded-lg h-20 resize-none"></textarea>
      </div>

      <div class="flex gap-2">
        <button @click="bookAppt" :disabled="!canBook || booking" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ booking ? 'Booking...' : '📅 Book Appointment' }}
        </button>
        <button @click="resetForm" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Clear</button>
      </div>
      <p v-if="bookMsg" :class="['text-sm', bookMsg.includes('success') ? 'text-green-600' : 'text-red-600']">{{ bookMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['appointment-booked'])

const api = useApi()
const authStore = useAuthStore()
const specs = ref([])
const docs = ref([])
const selectedSpec = ref('')
const selectedDoctor = ref('')
const apptDate = ref('')
const apptTime = ref('')
const reason = ref('')
const booking = ref(false)
const bookMsg = ref('')

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const canBook = computed(() => selectedDoctor.value && apptDate.value && apptTime.value)

const filteredDocs = computed(() => {
  if (!selectedSpec.value) return []
  return docs.value.filter(d => d.specialization === selectedSpec.value)
})

const getDocName = (doc) => {
  const firstName = doc.user?.first_name || 'Dr'
  const lastName = doc.user?.last_name || ''
  return `Dr. ${firstName} ${lastName}`.trim()
}

onMounted(async () => {
  try {
    const specRes = await api.get('/specializations')
    // API returns { success: true, data: { specializations: [...], total, page, limit } }
    specs.value = specRes.data?.data?.specializations || specRes.data?.specializations || []
    
    const docRes = await api.get('/doctors')
    // API returns { success: true, data: [...] }
    docs.value = Array.isArray(docRes.data?.data) ? docRes.data.data : []
  } catch (e) {
    console.error('Failed to load specializations/doctors', e)
  }
})

const bookAppt = async () => {
  if (!canBook.value) return
  booking.value = true
  bookMsg.value = ''
  try {
    const requestData = {
      patient_id: authStore.userId,
      doctor_id: selectedDoctor.value,
      appointment_date: apptDate.value,
      appointment_time: apptTime.value,
      reason: reason.value || 'Consultation'
    }
    
    console.log('[BookAppointmentPanel] Booking appointment:', requestData)
    console.log('[BookAppointmentPanel] Auth Status:', {
      userId: authStore.userId,
      token: authStore.accessToken ? 'Present' : 'Missing',
      role: authStore.role
    })
    
    const res = await api.post('/appointments', requestData)
    
    console.log('[BookAppointmentPanel] Success response:', res)
    bookMsg.value = 'Appointment booked successfully! ✓'
    resetForm()
    emit('appointment-booked')
  } catch (e) {
    console.error('[BookAppointmentPanel] Error caught:', e)
    console.error('[BookAppointmentPanel] Response status:', e.response?.status)
    console.error('[BookAppointmentPanel] Response headers:', e.response?.headers)
    console.error('[BookAppointmentPanel] Response data:', e.response?.data)
    
    const errorMsg = e.response?.data?.message || e.response?.data?.error || e.message || 'Try again'
    console.error('[BookAppointmentPanel] Final error message:', errorMsg)
    bookMsg.value = 'Failed to book appointment: ' + errorMsg
  } finally {
    booking.value = false
  }
}

const resetForm = () => {
  selectedSpec.value = ''
  selectedDoctor.value = ''
  apptDate.value = ''
  apptTime.value = ''
  reason.value = ''
}
</script>