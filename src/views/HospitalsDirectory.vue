<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center">
            <span class="text-2xl font-bold text-emerald-600">🏥 Sushruta</span>
          </router-link>
          <router-link
            to="/login"
            class="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Staff Login
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <section class="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Hospital Directory</h1>
        <p class="text-gray-600 text-lg">Find the best healthcare facilities near you</p>
      </div>
    </section>

    <!-- Hospitals Grid -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="hospital in hospitals"
            :key="hospital.id"
            class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
          >
            <div class="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-5xl">
              🏥
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900">{{ hospital.name }}</h3>
              <p class="text-emerald-600 font-medium mt-2">{{ hospital.type }}</p>
              <p class="text-sm text-gray-600 mt-2">📍 {{ hospital.location }}</p>
              <p class="text-sm text-gray-600 mt-1">🏨 {{ hospital.beds }} Beds</p>
              
              <div class="mt-4 flex gap-2">
                <button
                  class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                  View Details
                </button>
                <router-link
                  to="/doctors"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                >
                  Book Now
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">Hospital Services</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">🏨</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">In-Patient Care</h3>
            <p class="text-gray-600 text-sm">24/7 hospital accommodation and care</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">🚑</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Emergency Services</h3>
            <p class="text-gray-600 text-sm">Round-the-clock emergency response</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Advanced Surgery</h3>
            <p class="text-gray-600 text-sm">State-of-the-art surgical facilities</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">🧬</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Diagnostic Labs</h3>
            <p class="text-gray-600 text-sm">Comprehensive laboratory services</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 class="text-white font-bold mb-4">About Sushruta</h4>
            <p class="text-sm">Leading healthcare provider with excellence in patient care.</p>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Quick Links</h4>
            <ul class="text-sm space-y-2">
              <li><router-link to="/" class="hover:text-white">Home</router-link></li>
              <li><router-link to="/doctors" class="hover:text-white">Doctors</router-link></li>
              <li><router-link to="/hospitals" class="hover:text-white">Hospitals</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Services</h4>
            <ul class="text-sm space-y-2">
              <li>Hospital Admission</li>
              <li>Emergency Services</li>
              <li>Diagnostic Services</li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Contact</h4>
            <p class="text-sm">Email: info@sushruta.com<br>Phone: +91 1234567890</p>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 Sushruta Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()
const hospitals = ref([])

const loadHospitals = async () => {
  try {
    // For now, use mock data as no hospital API endpoint is visible
    hospitals.value = [
      { id: 1, name: 'Sushruta Medical Center', type: 'Multi-Specialty', location: 'Downtown', beds: 500 },
      { id: 2, name: 'Sushruta Care Hospital', type: 'Super-Specialty', location: 'Midtown', beds: 750 },
      { id: 3, name: 'Sushruta Advanced Care', type: 'Multi-Specialty', location: 'Uptown', beds: 400 },
      { id: 4, name: 'Sushruta Emergency Plus', type: 'General Hospital', location: 'West District', beds: 300 },
      { id: 5, name: 'Sushruta Heart Center', type: 'Specialty', location: 'East District', beds: 200 },
      { id: 6, name: 'Sushruta Wellness Hub', type: 'Multi-Specialty', location: 'Central Area', beds: 350 }
    ]
  } catch (error) {
    console.error('Failed to load hospitals:', error)
  }
}

onMounted(() => {
  loadHospitals()
})
</script>
