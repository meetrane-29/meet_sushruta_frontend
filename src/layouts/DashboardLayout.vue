<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Left Sidebar -->
    <aside class="w-64 bg-blue-900 text-white shadow-lg overflow-y-auto">
      <!-- Hospital Logo/Name -->
      <div class="p-6 border-b border-blue-800">
        <h1 class="text-2xl font-bold">Sushruta</h1>
        <p class="text-sm text-blue-200 mt-1">Hospital Management</p>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-4 space-y-2">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{
            'bg-blue-700 text-white font-medium': isActive(item.to),
            'text-blue-100 hover:bg-blue-800': !isActive(item.to)
          }"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Header Bar -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-8 py-4 h-16">
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">Welcome,</span>
            <span class="font-semibold text-gray-900">{{ authStore.userName || 'User' }}</span>
          </div>

          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2">
              <span
                class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize"
              >
                {{ authStore.role }}
              </span>
            </div>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const navItems = computed(() => {
  const role = authStore.role

  const roleSpecificRoutes = {
    admin: [
      { label: 'Dashboard', to: '/dashboard/admin', icon: '📊' },
      { label: 'Patients', to: '/dashboard/patients', icon: '👥' },
      { label: 'Doctors', to: '/dashboard/doctors', icon: '👨‍⚕️' },
      { label: 'Nurses', to: '/dashboard/nurses', icon: '👩‍⚕️' },
      { label: 'Pharmacy Staff', to: '/dashboard/pharmacy-staff', icon: '💊' },
      { label: 'Lab Staff', to: '/dashboard/lab-staff', icon: '🔬' },
      { label: 'Appointments', to: '/dashboard/appointments', icon: '📅' }
    ],
    doctor: [
      { label: 'My Dashboard', to: '/dashboard/doctor', icon: '📊' }
    ],
    patient: [
      { label: 'My Dashboard', to: '/dashboard/patient', icon: '📊' }
    ],
    nurse: [
      { label: 'My Dashboard', to: '/dashboard/nurse', icon: '📊' }
    ],
    pharmacy: [
      { label: 'Dashboard', to: '/dashboard/pharmacy', icon: '📊' },
      { label: 'Medicines', to: '/dashboard/pharmacy/medicines', icon: '💊' },
      { label: 'Stock Management', to: '/dashboard/pharmacy/stock', icon: '📦' },
      { label: 'Low Stock Alerts', to: '/dashboard/pharmacy/low-stock', icon: '⚠️' },
      { label: 'Expiring Medicines', to: '/dashboard/pharmacy/expiring', icon: '⏰' },
      { label: 'Dispensing', to: '/dashboard/pharmacy/dispensing', icon: '🩹' },
      { label: 'Reports', to: '/dashboard/pharmacy/reports', icon: '📈' }
    ],
    lab: [
      { label: 'My Dashboard', to: '/dashboard/lab', icon: '📊' },
      { label: 'Lab Orders', to: '/dashboard/lab-orders', icon: '🔬' }
    ]
  }

  return roleSpecificRoutes[role] || []
})

const isActive = (to) => {
  return router.currentRoute.value.path === to
}

const handleLogout = async () => {
  authStore.logout()
  await router.push('/login')
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
