<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white">Sushruta</h1>
        <p class="text-blue-100 mt-2">Hospital Management System</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Error Message with Suggestions -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700 font-medium mb-2">{{ error }}</p>
            <div v-if="error.includes('already registered')" class="text-xs text-red-600 mt-2 space-y-1">
              <p>💡 Suggestions:</p>
              <ul class="list-disc list-inside">
                <li>
                  <router-link to="/login" class="text-blue-600 hover:underline">Try logging in</router-link>
                  if you already have an account
                </li>
                <li>Use a different email address</li>
                <li>
                  <router-link to="/login" class="text-blue-600 hover:underline">Reset your password</router-link>
                  if you forgot it
                </li>
              </ul>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>

          <!-- Full Name Row -->
          <div class="grid grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
              <input
                v-model="formData.first_name"
                type="text"
                placeholder="John"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                :class="{ 'border-red-500': errors.first_name }"
              />
              <p v-if="errors.first_name" class="text-xs text-red-600 mt-1">{{ errors.first_name }}</p>
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
              <input
                v-model="formData.last_name"
                type="text"
                placeholder="Doe"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                :class="{ 'border-red-500': errors.last_name }"
              />
              <p v-if="errors.last_name" class="text-xs text-red-600 mt-1">{{ errors.last_name }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="john@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="9876543210"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="text-xs text-red-600 mt-1">{{ errors.phone }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Password *</label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                :class="{ 'border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                <span v-if="!showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Confirm Password *</label>
            <div class="relative">
              <input
                v-model="formData.confirm_password"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                :class="{ 'border-red-500': errors.confirm_password }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                <span v-if="!showConfirmPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
            <p v-if="errors.confirm_password" class="text-xs text-red-600 mt-1">{{ errors.confirm_password }}</p>
          </div>

          <!-- Additional Details Section -->
          <div class="pt-4 border-t-2 border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Patient Information (Optional)</h3>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Date of Birth</label>
              <input
                v-model="formData.date_of_birth"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <!-- Gender & Blood Group Row -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <!-- Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Gender</label>
                <select
                  v-model="formData.gender"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Blood Group -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Blood Group</label>
                <select
                  v-model="formData.blood_group"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-900 mb-2">Address</label>
              <textarea
                v-model="formData.address"
                placeholder="123 Main Street, City, State, Postal Code"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                rows="3"
              ></textarea>
            </div>

            <!-- Medical History -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-900 mb-2">Medical History</label>
              <textarea
                v-model="formData.medical_history"
                placeholder="Any previous medical conditions or surgeries"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                rows="2"
              ></textarea>
            </div>

            <!-- Allergies -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-900 mb-2">Allergies</label>
              <textarea
                v-model="formData.allergies"
                placeholder="Any known allergies to medications or substances"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                rows="2"
              ></textarea>
            </div>

            <!-- Emergency Contact -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Emergency Contact Name</label>
                <input
                  v-model="formData.emergency_contact_name"
                  type="text"
                  placeholder="Contact person name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Emergency Contact Phone</label>
                <input
                  v-model="formData.emergency_contact_phone"
                  type="tel"
                  placeholder="Contact number"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-semibold disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-2"
          >
            <LoadingSpinner v-if="isLoading" class="w-4 h-4" />
            <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
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
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  medical_history: '',
  allergies: '',
})

const errors = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
})

const validateForm = () => {
  errors.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  }

  let isValid = true

  // First Name validation
  if (!formData.value.first_name.trim()) {
    errors.value.first_name = 'First name is required'
    isValid = false
  } else if (formData.value.first_name.trim().length < 2) {
    errors.value.first_name = 'First name must be at least 2 characters'
    isValid = false
  }

  // Last Name validation
  if (!formData.value.last_name.trim()) {
    errors.value.last_name = 'Last name is required'
    isValid = false
  } else if (formData.value.last_name.trim().length < 2) {
    errors.value.last_name = 'Last name must be at least 2 characters'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  // Phone validation
  if (!formData.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  } else if (formData.value.phone.trim().length < 10) {
    errors.value.phone = 'Phone number must be at least 10 digits'
    isValid = false
  }

  // Password validation
  if (!formData.value.password) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (formData.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  // Confirm Password validation
  if (!formData.value.confirm_password) {
    errors.value.confirm_password = 'Confirm password is required'
    isValid = false
  } else if (formData.value.password !== formData.value.confirm_password) {
    errors.value.confirm_password = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  error.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    error.value = 'Please fix the errors above'
    return
  }

  isLoading.value = true

  try {
    const registerData = {
      first_name: formData.value.first_name.trim(),
      last_name: formData.value.last_name.trim(),
      email: formData.value.email.toLowerCase().trim(),
      phone: formData.value.phone.trim(),
      password: formData.value.password,
      role: 'patient', // Default role for registration
      date_of_birth: formData.value.date_of_birth,
      gender: formData.value.gender,
      blood_group: formData.value.blood_group,
      address: formData.value.address,
      emergency_contact_name: formData.value.emergency_contact_name,
      emergency_contact_phone: formData.value.emergency_contact_phone,
      medical_history: formData.value.medical_history,
      allergies: formData.value.allergies,
    }

    await authStore.register(registerData)

    successMessage.value = 'Account created successfully! Redirecting to login...'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    console.error('Registration failed:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
