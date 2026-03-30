<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back Button -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-700 font-medium">← Back to Home</router-link>
      </div>
    </div>

    <!-- Booking Form -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p class="text-gray-600 mb-8">Schedule a consultation with {{ doctor.name }}</p>

        <form @submit.prevent="submitBooking" class="space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-700">{{ success }}</p>
          </div>

          <!-- Doctor Info -->
          <div class="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 class="font-semibold text-gray-900">{{ doctor.name }}</h3>
            <p class="text-blue-600">{{ doctor.specialization }}</p>
            <p class="text-sm text-gray-600 mt-2">Consultation Fee: ₹{{ doctor.consultationFee || 500 }}</p>
          </div>

          <!-- Appointment Date -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Appointment Date</label>
            <input
              v-model="booking.appointmentDate"
              type="date"
              :min="todayDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <!-- Appointment Time -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Preferred Time</label>
            <select
              v-model="booking.appointmentTime"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Select a time</option>
              <option value="09:00">09:00 AM</option>
              <option value="09:30">09:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="14:30">02:30 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
          </div>

          <!-- Reason for Appointment -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Reason for Appointment *</label>
            <textarea
              v-model="booking.reason"
              placeholder="Describe your symptoms or reason for visit..."
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            ></textarea>
          </div>

          <!-- Additional Notes (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Additional Notes (Optional)</label>
            <textarea
              v-model="booking.notes"
              placeholder="Any additional information like medical history, allergies, or previous treatments..."
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            ></textarea>
          </div>

          <!-- Terms -->
          <div class="flex items-start space-x-2">
            <input
              v-model="booking.agreeTerms"
              type="checkbox"
              id="terms"
              class="mt-1"
              required
            />
            <label for="terms" class="text-sm text-gray-700">
              I agree to the hospital's terms and conditions
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Booking...' : 'Book Appointment' }}
          </button>
        </form>
      </div>

      <!-- Info Box -->
      <div class="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-3">Important Information</h3>
        <ul class="text-sm text-gray-700 space-y-2">
          <li>✓ Please arrive 10 minutes before your appointment</li>
          <li>✓ You will receive a confirmation email with appointment details</li>
          <li>✓ To cancel or reschedule, contact us at least 24 hours in advance</li>
          <li>✓ Bring valid ID and insurance card if applicable</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const api = useApi()
const doctorId = route.params.doctorId

const doctor = ref({
  name: 'Doctor',
  specialization: 'Specialist',
  consultationFee: 500,
  id: ''
})

const booking = ref({
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  notes: '',
  agreeTerms: false
})

const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const todayDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() + 1) // Minimum tomorrow
  return today.toISOString().split('T')[0]
})

const loadDoctor = async () => {
  try {
    const res = await api.get(`/doctors/${doctorId}`)
    if (res.data?.data) {
      doctor.value = res.data.data
    } else {
      error.value = 'Doctor not found'
      setTimeout(() => {
        router.push('/doctors')
      }, 2000)
    }
  } catch (err) {
    console.error('Failed to load doctor:', err)
    error.value = 'Failed to load doctor details. Please select a doctor from the list.'
    setTimeout(() => {
      router.push('/doctors')
    }, 2000)
  }
}

const submitBooking = async () => {
  // Check authentication
  if (!authStore.isLoggedIn || !authStore.userId) {
    error.value = 'Please log in to book an appointment'
    router.push('/login')
    return
  }

  // Validate userId is a UUID
  if (!isValidUUID(authStore.userId)) {
    error.value = 'Invalid user session. Please log in again.'
    console.error('[BookAppointment] Invalid userId:', authStore.userId)
    router.push('/login')
    return
  }

  // Validate doctorId is a UUID
  if (!isValidUUID(doctorId)) {
    error.value = 'Invalid doctor selected. Please select a doctor.'
    console.error('[BookAppointment] Invalid doctorId:', doctorId)
    router.push('/doctors')
    return
  }

  if (!booking.value.agreeTerms) {
    error.value = 'Please accept the terms and conditions'
    return
  }

  if (!booking.value.appointmentDate || !booking.value.appointmentTime) {
    error.value = 'Please select date and time'
    return
  }

  if (!booking.value.reason) {
    error.value = 'Please enter reason for appointment'
    return
  }

  isSubmitting.value = true
  error.value = ''
  success.value = ''

  try {
    console.log('[BookAppointment] Step 1: Check userId')
    console.log('  - authStore.userId:', authStore.userId)
    console.log('  - typeof:', typeof authStore.userId)
    console.log('  - isLoggedIn:', authStore.isLoggedIn)
    
    // Verify we have valid IDs before sending
    if (!authStore.userId || authStore.userId === 'undefined' || authStore.userId === '') {
      console.error('[BookAppointment] FAILED: userId is empty, shows as:', authStore.userId)
      error.value = 'User session corrupted. Please log in again.'
      authStore.logout()
      router.push('/login')
      return
    }

    console.log('[BookAppointment] Step 2: Check doctorId')
    console.log('  - doctorId:', doctorId)
    
    if (!doctorId || doctorId === 'undefined' || doctorId === '') {
      console.error('[BookAppointment] FAILED: doctorId is empty')
      error.value = 'Doctor ID corrupted. Please select a doctor again.'
      router.push('/doctors')
      return
    }

    console.log('[BookAppointment] Step 3: Build request data')
    // Send request with correct data structure matching backend
    const patientId = authStore.userId.toString().trim()
    const docId = doctorId.toString().trim()
    const appDate = booking.value.appointmentDate.toString().trim()
    const appTime = booking.value.appointmentTime.toString().trim()
    const appReason = booking.value.reason.toString().trim()
    const appNotes = (booking.value.notes || '').toString().trim()
    
    console.log('  - patientId:', patientId)
    console.log('  - docId:', docId)
    console.log('  - appDate:', appDate)
    console.log('  - appTime:', appTime)
    console.log('  - appReason:', appReason)
    
    const requestData = {
      patient_id: patientId,
      doctor_id: docId,
      appointment_date: appDate,
      appointment_time: appTime,
      reason: appReason,
      notes: appNotes
    }
    
    console.log('[BookAppointment] FINAL REQUEST DATA:', JSON.stringify(requestData, null, 2))
    console.log('[BookAppointment] Keys in request:', Object.keys(requestData))
    
    const response = await api.post('/appointments', requestData)

    success.value =
      'Appointment booked successfully! Check your email for confirmation details.'
    
    // Reset form and redirect after 3 seconds
    setTimeout(() => {
      booking.value = {
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        notes: '',
        agreeTerms: false
      }
      router.push('/dashboard/patient')
    }, 3000)
  } catch (err) {
    console.error('Booking error:', err)
    
    // Handle different error types
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please log in again'
      authStore.logout()
      router.push('/login')
    } else if (err.response?.status === 400) {
      error.value = err.response?.data?.message || 'Invalid appointment details'
    } else {
      error.value = err.response?.data?.message || 'Failed to book appointment. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Validate if string is a valid UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

onMounted(() => {
  // First, initialize auth store from sessionStorage
  authStore.initializeFromStorage()
  
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    console.warn('[BookAppointment] User not logged in')
    router.push('/login')
    return
  }

  console.log('[BookAppointment] User logged in:', {
    userId: authStore.userId,
    role: authStore.role
  })

  // Validate doctor ID is a proper UUID
  if (!doctorId || !isValidUUID(doctorId)) {
    error.value = 'Please select a doctor first'
    console.warn('[BookAppointment] Invalid doctorId:', doctorId)
    setTimeout(() => {
      router.push('/doctors')
    }, 2000)
    return
  }

  loadDoctor()
})
</script>
