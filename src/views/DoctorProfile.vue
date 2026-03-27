<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back Button -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-700 font-medium">← Back to Home</router-link>
      </div>
    </div>

    <!-- Doctor Profile -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          <!-- Doctor Image/Avatar -->
          <div class="flex items-center justify-center">
            <div class="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-7xl">
              👨‍⚕️
            </div>
          </div>

          <!-- Doctor Info -->
          <div class="md:col-span-2">
            <h1 class="text-4xl font-bold text-gray-900">{{ doctor.name }}</h1>
            <p class="text-2xl text-blue-600 font-semibold mt-2">{{ doctor.specialization }}</p>

            <div class="mt-6 space-y-3">
              <div class="flex items-center space-x-2 text-gray-700">
                <span class="font-medium">Experience:</span>
                <span>{{ doctor.experience || 10 }} years</span>
              </div>
              <div class="flex items-center space-x-2 text-gray-700">
                <span class="font-medium">Qualifications:</span>
                <span>{{ doctor.qualifications || 'MD, MBBS, DM' }}</span>
              </div>
              <div class="flex items-center space-x-2 text-gray-700">
                <span class="font-medium">Status:</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Available</span>
              </div>
            </div>

            <button
              @click="goToBook"
              class="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">About</h2>
        <p class="text-gray-700 leading-relaxed">
          {{ doctor.bio || 'Experienced healthcare professional with a passion for patient care and clinical excellence. Specializing in ' + doctor.specialization + ' with expertise in diagnosis and treatment.' }}
        </p>
      </div>

      <!-- Availability Section -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Working Hours</h3>
            <div class="space-y-2 text-gray-700">
              <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
              <p>Saturday: 10:00 AM - 2:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Consultation Fee</h3>
            <p class="text-3xl font-bold text-blue-600">₹{{ doctor.consultationFee || 500 }}</p>
            <p class="text-sm text-gray-600 mt-2">Per consultation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const api = useApi()

const doctor = ref({
  name: 'Dr. Loading...',
  specialization: 'Loading...',
  experience: 0
})

const loadDoctor = async () => {
  try {
    const res = await api.get(`/doctors?slug=${route.params.slug}`)
    if (res.data.data && res.data.data.length > 0) {
      doctor.value = res.data.data[0]
    }
  } catch (error) {
    console.error('Failed to load doctor profile:', error)
  }
}

const goToBook = () => {
  // Extract doctor ID from doctor object or route
  const doctorId = doctor.value.id || 1
  router.push(`/book/${doctorId}`)
}

onMounted(() => {
  loadDoctor()
})
</script>
