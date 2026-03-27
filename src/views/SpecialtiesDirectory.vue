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
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Medical Specialties</h1>
        <p class="text-gray-600 text-lg">Explore our comprehensive range of medical specializations</p>
      </div>
    </section>

    <!-- Specialties Grid -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="specialty in specialties"
            :key="specialty.id"
            class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
          >
            <div class="h-40 bg-gradient-to-br flex items-center justify-center text-5xl" :style="{ backgroundImage: specialty.gradient }">
              {{ specialty.icon }}
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900">{{ specialty.name }}</h3>
              <p class="text-gray-600 mt-2 text-sm">{{ specialty.description }}</p>
              <div class="mt-4 flex gap-2">
                <router-link
                  :to="`/doctors?specialty=${specialty.id}`"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center text-sm"
                >
                  View Doctors
                </router-link>
                <router-link
                  to="/book/1"
                  class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-center text-sm"
                >
                  Book Now
                </router-link>
              </div>
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
import { ref } from 'vue'

const specialties = ref([
  {
    id: 1,
    name: 'Cardiology',
    icon: '❤️',
    description: 'Heart and cardiovascular health specialists',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'
  },
  {
    id: 2,
    name: 'Pediatrics',
    icon: '👶',
    description: 'Child and infant healthcare professionals',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
  },
  {
    id: 3,
    name: 'Orthopedics',
    icon: '🦴',
    description: 'Bone and joint specialists',
    gradient: 'linear-gradient(135deg, rgba(102, 51, 153, 0.2), rgba(102, 51, 153, 0.1))'
  },
  {
    id: 4,
    name: 'Dermatology',
    icon: '🧴',
    description: 'Skin health and treatment experts',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1))'
  },
  {
    id: 5,
    name: 'Neurology',
    icon: '🧠',
    description: 'Brain and nervous system specialists',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'
  },
  {
    id: 6,
    name: 'Oncology',
    icon: '🔬',
    description: 'Cancer care and treatment specialists',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))'
  },
  {
    id: 7,
    name: 'Ophthalmology',
    icon: '👁️',
    description: 'Eye care and vision specialists',
    gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(248, 113, 113, 0.1))'
  },
  {
    id: 8,
    name: 'ENT',
    icon: '👂',
    description: 'Ear, nose and throat specialists',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
  },
  {
    id: 9,
    name: 'Gastroenterology',
    icon: '🍽️',
    description: 'Digestive system and digestive health specialists',
    gradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.1))'
  }
])
</script>
