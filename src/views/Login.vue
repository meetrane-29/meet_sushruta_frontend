<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white">Sushruta</h1>
        <p class="text-blue-100 mt-2">Hospital Management System</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Login</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
            <input
              v-model="credentials.email"
              type="email"
              placeholder="admin@hospital.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Password</label>
            <input
              v-model="credentials.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-semibold disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
          >
            <LoadingSpinner v-if="isLoading" class="w-4 h-4" />
            <span>{{ isLoading ? 'Logging in...' : 'Login' }}</span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</p>
          <div class="text-xs text-gray-600 space-y-1">
            <p><span class="font-mono">admin@test.com</span> (Admin)</p>
            <p><span class="font-mono">doctor@test.com</span> (Doctor)</p>
            <p><span class="font-mono">nurse@test.com</span> (Nurse)</p>
            <p><span class="font-mono">pharmacy@test.com</span> (Pharmacy)</p>
            <p><span class="font-mono">lab@test.com</span> (Lab)</p>
            <p class="mt-2"><span class="font-mono">password123</span> for all</p>
          </div>
        </div>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref('')

const credentials = ref({
  email: '',
  password: ''
})

const DASHBOARD_ROUTES = {
  admin:    '/dashboard/admin',
  doctor:   '/dashboard/doctor',
  nurse:    '/dashboard/nurse',
  pharmacy: '/dashboard/pharmacy',
  lab:      '/dashboard/lab',
  patient:  '/dashboard/patient',
}

const handleLogin = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    error.value = 'Please enter email and password'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(credentials.value.email, credentials.value.password)

    const role = authStore.role
    const destination = DASHBOARD_ROUTES[role]

    console.log('[Login] role from store:', role, '→ navigating to:', destination)

    if (destination) {
      await router.push(destination)
    } else {
      // Unexpected role returned by API — show it clearly
      error.value = `Unknown role received: "${role}". Contact admin.`
      console.error('[Login] No dashboard route for role:', role)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
    console.error('[Login] error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
