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
        <h1 class="text-4xl font-bold text-gray-900 mb-4">All Doctors</h1>
        <p class="text-gray-600 text-lg">Browse our network of experienced healthcare professionals</p>
      </div>
    </section>

    <!-- Filters and Doctors -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Filters -->
          <div class="bg-gray-50 rounded-lg p-6 h-fit">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Filter By</h3>
            
            <!-- Specialization Filter -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-800 mb-3">Specialization</h4>
              <div class="space-y-2">
                <label v-for="spec in specializations" :key="spec" class="flex items-center">
                  <input type="checkbox" class="w-4 h-4 text-blue-600" />
                  <span class="ml-2 text-sm text-gray-700">{{ spec }}</span>
                </label>
              </div>
            </div>

            <!-- Experience Filter -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-800 mb-3">Experience</h4>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" class="w-4 h-4 text-blue-600" />
                  <span class="ml-2 text-sm text-gray-700">5+ years</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="w-4 h-4 text-blue-600" />
                  <span class="ml-2 text-sm text-gray-700">10+ years</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="w-4 h-4 text-blue-600" />
                  <span class="ml-2 text-sm text-gray-700">15+ years</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Doctors Grid -->
          <div class="lg:col-span-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <router-link
                v-for="doctor in doctors"
                :key="doctor.id"
                :to="`/doctor/${doctor.slug}`"
                class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-5xl">
                  👨‍⚕️
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-semibold text-gray-900">{{ doctor.name }}</h3>
                  <p class="text-blue-600 font-medium mt-1">{{ doctor.specialization }}</p>
                  <p class="text-sm text-gray-600 mt-2">{{ doctor.experience }} years experience</p>
                  <button
                    class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View Profile
                  </button>
                </div>
              </router-link>
            </div>
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
              <li>Doctor Consultations</li>
              <li>Lab Tests</li>
              <li>Pharmacy</li>
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
const doctors = ref([])
const specializations = ref(['Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology', 'Oncology'])

const loadDoctors = async () => {
  try {
    const res = await api.get('/doctors')
    // res.data is the Axios wrapper, doctor data is at res.data.data
    const rawDoctors = (res.data?.data && Array.isArray(res.data.data)) ? res.data.data : []
    // Transform API response to match frontend expectations
    doctors.value = rawDoctors.map(doc => ({
      id: doc.id,
      name: `Dr. ${doc.user?.first_name || 'Dr'} ${doc.user?.last_name || ''}`.trim(),
      specialization: doc.specialization,
      experience: 10, // Default since API doesn't have experience field
      slug: doc.user?.first_name ? doc.user.first_name.toLowerCase() + '-' + (doc.user.last_name || '').toLowerCase() : 'unknown'
    }))
  } catch (error) {
    console.error('Failed to load doctors:', error)
    // Fallback demo data
    doctors.value = [
      { id: 1, name: 'Dr. Raj Kumar', specialization: 'Cardiology', experience: 15, slug: 'raj-kumar' },
      { id: 2, name: 'Dr. Priya Sharma', specialization: 'Pediatrics', experience: 12, slug: 'priya-sharma' },
      { id: 3, name: 'Dr. Anil Patel', specialization: 'Orthopedics', experience: 18, slug: 'anil-patel' },
      { id: 4, name: 'Dr. Meera Singh', specialization: 'Dermatology', experience: 10, slug: 'meera-singh' },
      { id: 5, name: 'Dr. Vikram Reddy', specialization: 'Neurology', experience: 20, slug: 'vikram-reddy' },
      { id: 6, name: 'Dr. Anjali Verma', specialization: 'Oncology', experience: 14, slug: 'anjali-verma' }
    ]
  }
}

onMounted(() => {
  loadDoctors()
})
</script>
