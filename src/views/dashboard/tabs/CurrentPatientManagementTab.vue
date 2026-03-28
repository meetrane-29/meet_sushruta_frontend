<template>
  <div class="space-y-6">
    <!-- Patient Selection -->
    <div class="bg-white p-4 rounded-lg shadow">
      <label class="block text-sm font-semibold text-gray-700 mb-2">Select Patient</label>
      <input
        v-model="selectedPatientId"
        type="text"
        placeholder="Enter patient ID or select from list..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner />
      <p class="text-gray-600 mt-2">Loading patient data...</p>
    </div>

    <!-- Patient Management Tabs -->
    <div v-if="!loading" class="space-y-6">
      <!-- Management Tabs -->
      <div class="bg-white p-4 rounded-lg shadow border-b border-gray-200">
        <div class="flex gap-4 flex-wrap">
          <button
            @click="managementTab = 'prescription'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'prescription'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            💊 Prescriptions
          </button>
          <button
            @click="managementTab = 'lab'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'lab'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            🧪 Lab Tests
          </button>
          <button
            @click="managementTab = 'notes'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'notes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            📝 SOAP Notes
          </button>
        </div>
      </div>

      <!-- Prescriptions Tab -->
      <div v-if="managementTab === 'prescription'" class="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">💊 Add Prescription</h2>
        
        <form @submit.prevent="addPrescription" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Medicine</label>
            <input
              v-model="prescriptionForm.medicine"
              type="text"
              placeholder="Medicine name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
              <input
                v-model="prescriptionForm.dosage"
                type="text"
                placeholder="e.g., 500mg"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
              <select
                v-model="prescriptionForm.frequency"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Thrice daily</option>
                <option>As needed</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
            <input
              v-model="prescriptionForm.duration"
              type="number"
              placeholder="Duration in days"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            ➕ Add Medicine
          </button>
        </form>

        <!-- Prescription List -->
        <div v-if="prescriptions.length > 0" class="mt-6">
          <h3 class="font-bold text-lg text-gray-800 mb-3">Current Prescriptions</h3>
          <div class="space-y-2">
            <div
              v-for="(med, idx) in prescriptions"
              :key="idx"
              class="bg-gray-50 p-3 rounded border-l-4 border-blue-500 flex justify-between items-center"
            >
              <div>
                <p class="font-semibold">{{ med.medicine }}</p>
                <p class="text-sm text-gray-600">{{ med.dosage }} - {{ med.frequency }} for {{ med.duration }} days</p>
              </div>
              <button
                @click="prescriptions.splice(idx, 1)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lab Tests Tab -->
      <div v-if="managementTab === 'lab'" class="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">🧪 Order Lab Tests</h2>

        <form @submit.prevent="orderLabTest" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Test Type</label>
            <select
              v-model="labForm.testType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Test</option>
              <option>Blood Test - CBC</option>
              <option>Blood Test - Biochemistry</option>
              <option>X-Ray</option>
              <option>Ultrasound</option>
              <option>CT Scan</option>
              <option>MRI</option>
              <option>ECG</option>
              <option>COVID-19 Test</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              v-model="labForm.priority"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="labForm.notes"
              placeholder="Any special instructions..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            🔬 Order Test
          </button>
        </form>
      </div>

      <!-- SOAP Notes Tab -->
      <div v-if="managementTab === 'notes'" class="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">📝 SOAP Notes</h2>

        <form @submit.prevent="saveSoapNotes" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Subjective (Patient's complaints)</label>
            <textarea
              v-model="soapNotes.subjective"
              placeholder="What does the patient report?"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Objective (Findings, vitals)</label>
            <textarea
              v-model="soapNotes.objective"
              placeholder="Vital signs, physical examination findings..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Assessment (Diagnosis)</label>
            <textarea
              v-model="soapNotes.assessment"
              placeholder="Your diagnosis and impression..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Plan (Treatment)</label>
            <textarea
              v-model="soapNotes.plan"
              placeholder="Treatment plan, medication, follow-up..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            💾 Save Notes
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import LoadingSpinner from '../../../components/shared/LoadingSpinner.vue'
import { useApi } from '../../../composables/useApi.js'

export default {
  name: 'CurrentPatientManagementTab',
  components: {
    LoadingSpinner
  },
  props: {
    doctorId: {
      type: String,
      required: true
    }
  },
  setup() {
    const selectedPatientId = ref('')
    const managementTab = ref('prescription')
    const loading = ref(false)
    const prescriptions = ref([])
    const { post } = useApi()

    const prescriptionForm = ref({
      medicine: '',
      dosage: '',
      frequency: 'Once daily',
      duration: ''
    })

    const labForm = ref({
      testType: '',
      priority: 'normal',
      notes: ''
    })

    const soapNotes = ref({
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    })

    const addPrescription = () => {
      if (prescriptionForm.value.medicine && prescriptionForm.value.dosage && prescriptionForm.value.duration) {
        prescriptions.value.push({ ...prescriptionForm.value })
        prescriptionForm.value = {
          medicine: '',
          dosage: '',
          frequency: 'Once daily',
          duration: ''
        }
      }
    }

    const orderLabTest = async () => {
      try {
        loading.value = true
        // API call would go here
        console.log('Lab test ordered:', labForm.value)
        alert('Lab test ordered successfully!')
        labForm.value = { testType: '', priority: 'normal', notes: '' }
      } catch (err) {
        console.error('Failed to order lab test:', err)
      } finally {
        loading.value = false
      }
    }

    const saveSoapNotes = async () => {
      try {
        loading.value = true
        // API call would go here
        console.log('SOAP notes saved:', soapNotes.value)
        alert('SOAP notes saved successfully!')
        soapNotes.value = { subjective: '', objective: '', assessment: '', plan: '' }
      } catch (err) {
        console.error('Failed to save notes:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      selectedPatientId,
      managementTab,
      loading,
      prescriptions,
      prescriptionForm,
      labForm,
      soapNotes,
      addPrescription,
      orderLabTest,
      saveSoapNotes
    }
  }
}
</script>

<style scoped>
textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
}
</style>
