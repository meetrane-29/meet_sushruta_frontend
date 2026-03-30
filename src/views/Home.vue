<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center">
            <span class="text-2xl font-bold text-emerald-600">🏥 Sushruta</span>
          </router-link>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <div class="relative group">
              <button class="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Hospitals
              </button>
              <div class="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <router-link to="/hospitals" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Hospital Directory
                </router-link>
              </div>
            </div>

            <div class="relative group">
              <button class="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Specialties
              </button>
              <div class="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <router-link to="/specialties" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  All Specialties
                </router-link>
              </div>
            </div>

            <div class="relative group">
              <button class="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Doctors
              </button>
              <div class="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <router-link to="/doctors" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  All Doctors
                </router-link>
              </div>
            </div>

            <button class="text-gray-700 hover:text-gray-900 font-medium text-sm">
              Services
            </button>
          </div>

          <!-- Right Section -->
          <div class="hidden md:flex items-center space-x-4">
            <button class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm flex items-center gap-2">
              📞 Request a Callback
            </button>
            <router-link
              to="/doctors"
              class="px-4 py-2 bg-rose-300 text-gray-800 rounded-lg font-medium hover:bg-rose-400 transition text-sm"
            >
              📅 Book Appointment
            </router-link>
            <button class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm flex items-center gap-2">
              💪 Get Health Checkup
            </button>
            <router-link
              to="/login"
              class="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Staff Login
            </router-link>
          </div>

          <!-- Mobile Menu -->
          <div class="md:hidden">
            <router-link
              to="/login"
              class="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Staff Login
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Search -->
    <section class="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Heading -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Today. Tomorrow. Always
          </h1>
        </div>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto mb-12">
          <div class="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for Doctors, Specialities and Hospitals"
              class="flex-1 px-6 py-4 focus:outline-none text-gray-700"
            />
            <button class="px-6 py-4 bg-gray-100 hover:bg-gray-200 transition">
              🔍
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Cards Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Book an Appointment Card -->
          <router-link
            to="/doctors"
            class="bg-amber-50 hover:shadow-lg rounded-lg p-8 border border-amber-100 transition cursor-pointer"
          >
            <div class="text-5xl mb-4">📅</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h3>
            <p class="text-gray-600">With country's leading experts</p>
          </router-link>

          <!-- Hospitals Card -->
          <router-link
            to="/hospitals"
            class="bg-blue-50 hover:shadow-lg rounded-lg p-8 border border-blue-100 transition cursor-pointer"
          >
            <div class="text-5xl mb-4">🏥</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Hospitals</h3>
            <p class="text-gray-600">Health needs under one roof</p>
          </router-link>

          <!-- Specialties Card -->
          <router-link
            to="/specialties"
            class="bg-purple-50 hover:shadow-lg rounded-lg p-8 border border-purple-100 transition cursor-pointer"
          >
            <div class="text-5xl mb-4">⚕️</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Specialties</h3>
            <p class="text-gray-600">Our expertise in Healthcare</p>
          </router-link>

          <!-- Doctors Card -->
          <router-link
            to="/doctors"
            class="bg-pink-50 hover:shadow-lg rounded-lg p-8 border border-pink-100 transition cursor-pointer"
          >
            <div class="text-5xl mb-4">👨‍⚕️</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Doctors</h3>
            <p class="text-gray-600">Top experts for your health</p>
          </router-link>

          <!-- Health Checkups Card -->
          <div class="bg-green-50 hover:shadow-lg rounded-lg p-8 border border-green-100 transition cursor-pointer">
            <div class="text-5xl mb-4">💪</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Health Checkups</h3>
            <p class="text-gray-600">Comprehensive wellness programs</p>
          </div>

          <!-- Tests & Services Card -->
          <div class="bg-yellow-50 hover:shadow-lg rounded-lg p-8 border border-yellow-100 transition cursor-pointer">
            <div class="text-5xl mb-4">🔬</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Tests & Services</h3>
            <p class="text-gray-600">Advanced diagnostic facilities</p>
          </div>
        </div>
      </div>
    </section>

    <!-- We can help section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-12">We can help you book</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg p-8 border border-gray-200">
            <div class="text-4xl mb-4">👨‍⚕️</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Health Checkups</h3>
            <p class="text-gray-600">Complete health screening packages</p>
          </div>
          <div class="bg-white rounded-lg p-8 border border-gray-200">
            <div class="text-4xl mb-4">🔬</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Tests & Services</h3>
            <p class="text-gray-600">Laboratory and diagnostic services</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Doctors -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">Our Featured Doctors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div class="text-center mt-12">
          <router-link
            to="/doctors"
            class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View All Doctors
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">👨‍⚕️</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Doctor Consultations</h3>
            <p class="text-gray-600">Book appointments with qualified doctors</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">�</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Lab Tests</h3>
            <p class="text-gray-600">State-of-the-art diagnostic services</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">💊</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Pharmacy</h3>
            <p class="text-gray-600">Full range of medications available</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div class="text-4xl mb-4">�</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Records</h3>
            <p class="text-gray-600">Digital medical records management</p>
          </div>
        </div>
      </div>


    <!-- CTA Section -->
    <section class="bg-blue-600 text-white py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to book an appointment?</h2>
        <p class="text-blue-100 mb-8">Start your journey to better health today</p>
        <router-link
          to="/doctors"
          class="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Book Now
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
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
          <p>&copy; 2026 MeSushruta Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()
const doctors = ref([])
const searchQuery = ref('')

const loadDoctors = async () => {
  try {
    const res = await api.get('/doctors')
    // res.data is the Axios wrapper, doctor data is at res.data.data
    const rawDoctors = (res.data?.data && Array.isArray(res.data.data)) ? res.data.data : []
    // Transform API response to match frontend expectations
    doctors.value = rawDoctors.slice(0, 6).map(doc => ({
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
      { id: 3, name: 'Dr. Anil Patel', specialization: 'Orthopedics', experience: 18, slug: 'anil-patel' }
    ]
  }
}

onMounted(() => {
  loadDoctors()
})
</script>
