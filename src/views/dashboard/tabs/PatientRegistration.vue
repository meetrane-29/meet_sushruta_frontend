<template>
  <div class="patient-registration">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">New Patient Registration</h2>

      <!-- Form Steps Indicator -->
      <div class="flex items-center justify-between mb-8">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="flex items-center"
          :class="{ 'flex-1': idx < steps.length - 1 }"
        >
          <div
            :class="[
              'flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm',
              currentStep > idx
                ? 'bg-green-500 text-white'
                : currentStep === idx
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            ]"
          >
            {{ idx + 1 }}
          </div>
          <p class="ml-2 text-sm font-medium text-gray-600">{{ step }}</p>
          <div v-if="idx < steps.length - 1" class="flex-1 h-1 bg-gray-300 mx-4"></div>
        </div>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Step 1: Personal Information -->
        <div v-if="currentStep === 1" class="space-y-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                v-model="formData.firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                v-model="formData.lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter last name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                v-model="formData.dateOfBirth"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                v-model="formData.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                v-model="formData.address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter full address"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Step 2: Medical Information -->
        <div v-if="currentStep === 2" class="space-y-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Medical Information</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                v-model="formData.bloodGroup"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select blood group</option>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
              <input
                v-model="formData.allergies"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Penicillin, Nuts"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                v-model="formData.medicalHistory"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Previous illnesses, surgeries, chronic conditions"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Step 3: Contact Information -->
        <div v-if="currentStep === 3" class="space-y-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Emergency Contact</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name *</label>
              <input
                v-model="formData.emergencyName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Emergency contact name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
              <input
                v-model="formData.emergencyRelationship"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Spouse, Parent"
                required
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number *</label>
              <input
                v-model="formData.emergencyContact"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Emergency contact phone"
                required
              />
            </div>
          </div>

          <!-- Insurance Information (Optional) -->
          <div class="mt-6 border-t pt-6">
            <h4 class="text-md font-bold text-gray-800 mb-4">Insurance Information (Optional)</h4>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                <input
                  v-model="formData.insuranceProvider"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Insurance company name"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                  <input
                    v-model="formData.policyNumber"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Policy number"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                  <input
                    v-model="formData.memberID"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Member ID"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Coverage Amount</label>
                  <input
                    v-model.number="formData.coverageAmount"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Valid Upto</label>
                  <input
                    v-model="formData.insuranceValidUpto"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between mt-8">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            type="button"
            class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ← Previous
          </button>

          <div></div>

          <button
            v-if="currentStep < steps.length"
            @click="nextStep"
            type="button"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Next →
          </button>

          <button
            v-if="currentStep === steps.length"
            type="submit"
            @click="registerPatient"
            :disabled="isLoading"
            class="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            <span v-if="!isLoading">✓ Register Patient</span>
            <span v-else>Processing...</span>
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-800 rounded-lg" @click="successMessage = ''">
        <p class="font-medium">{{ successMessage }}</p>
        <p class="text-sm mt-1">UHID: <span class="font-bold">{{ generatedUHID }}</span></p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg" @click="errorMessage = ''">
        <p class="font-medium">Error: {{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePatientApi } from '@/composables/usePatientApi'
import { useOPDApi } from '@/composables/useOPDApi'

const currentStep = ref(1)
const steps = ['Personal Info', 'Medical Info', 'Emergency Contact']
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const generatedUHID = ref('')

const patientApi = usePatientApi()
const opdApi = useOPDApi()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  bloodGroup: '',
  allergies: '',
  medicalHistory: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyContact: '',
  insuranceProvider: '',
  policyNumber: '',
  memberID: '',
  coverageAmount: 0,
  insuranceValidUpto: ''
})

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const registerPatient = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // First, create user and patient record
    const patientData = {
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      date_of_birth: formData.value.dateOfBirth,
      gender: formData.value.gender,
      address: formData.value.address,
      blood_group: formData.value.bloodGroup || '',
      allergies: formData.value.allergies || '',
      medical_history: formData.value.medicalHistory || '',
      emergency_contact: formData.value.emergencyContact || ''
    }

    // Assuming the patient registration API exists
    // This should return patientID
    const result = await patientApi.createPatient(patientData)
    
    if (result && result.data && result.data.id) {
      const patientID = result.data.id

      // Generate UHID
      const uhidResult = await opdApi.generateUHID(patientID)
      if (uhidResult && uhidResult.data && uhidResult.data.uhid) {
        generatedUHID.value = uhidResult.data.uhid

        // Create insurance policy if provided
        if (formData.value.insuranceProvider && formData.value.policyNumber) {
          const insuranceData = {
            patient_id: patientID,
            provider_name: formData.value.insuranceProvider,
            policy_number: formData.value.policyNumber,
            member_id: formData.value.memberID,
            coverage_amount: formData.value.coverageAmount,
            valid_from: new Date().toISOString().split('T')[0],
            valid_upto: formData.value.insuranceValidUpto || new Date().toISOString().split('T')[0]
          }
          await opdApi.createInsurancePolicy(insuranceData)
        }

        successMessage.value = `Patient registered successfully! UHID has been generated.`
        // Reset form
        resetForm()
      }
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error registering patient'
    console.error('Registration error:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyContact: '',
    insuranceProvider: '',
    policyNumber: '',
    memberID: '',
    coverageAmount: 0,
    insuranceValidUpto: ''
  }
  currentStep.value = 1
}

const submitForm = () => {
  registerPatient()
}
</script>

<style scoped>
.patient-registration {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
