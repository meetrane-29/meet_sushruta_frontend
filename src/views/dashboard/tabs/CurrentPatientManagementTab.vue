<template>
  <div class="space-y-6">

    <!-- No patient selected -->
    <div v-if="!selectedAppointment" class="bg-white p-12 rounded-lg shadow text-center text-gray-500">
      <p class="text-5xl mb-4">👆</p>
      <p class="text-xl font-semibold text-gray-700">No patient selected</p>
      <p class="text-gray-500 mt-2">Daily Schedule tab mein kisi patient par click karein</p>
    </div>

    <!-- Patient selected -->
    <div v-else class="space-y-6">

      <!-- Patient Info Card -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 class="text-2xl font-bold">
              {{ selectedAppointment.patient?.user?.first_name }} {{ selectedAppointment.patient?.user?.last_name }}
            </h2>
            <p class="text-blue-100 mt-1">📅 {{ selectedAppointment.appointment_date }} &nbsp;|&nbsp; 🕐 {{ selectedAppointment.appointment_time }}</p>
            <p class="text-blue-100">📝 {{ selectedAppointment.reason || 'No reason provided' }}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold capitalize">
            {{ selectedAppointment.status }}
          </span>
          <p class="text-blue-100 text-xs mt-2">
            {{ selectedAppointment.patient?.user?.first_name }} {{ selectedAppointment.patient?.user?.last_name }}
          </p>
        </div>
      </div>

      <!-- Patient Details Panel -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Left: Patient Profile -->
        <div class="bg-white rounded-lg shadow p-5 space-y-3">
          <h3 class="font-bold text-gray-800 text-lg border-b pb-2">🧑‍⚕️ Patient Profile</h3>
          <div v-if="patientLoading" class="text-center py-4 text-gray-400">Loading...</div>
          <div v-else-if="patientDetail" class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Gender</span>
              <span class="font-medium capitalize">{{ patientDetail.gender || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Date of Birth</span>
              <span class="font-medium">{{ patientDetail.date_of_birth || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Blood Group</span>
              <span class="font-bold text-red-600">{{ patientDetail.blood_group || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Phone</span>
              <span class="font-medium">{{ patientDetail.user?.phone || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Email</span>
              <span class="font-medium text-xs">{{ patientDetail.user?.email || '--' }}</span>
            </div>
            <div v-if="patientDetail.emergency_contact" class="flex justify-between">
              <span class="text-gray-500">Emergency</span>
              <span class="font-medium text-xs">{{ patientDetail.emergency_contact }}</span>
            </div>
            <div v-if="patientDetail.address" class="pt-1">
              <span class="text-gray-500 block">Address</span>
              <span class="font-medium text-xs">{{ patientDetail.address }}</span>
            </div>
            <div v-if="patientDetail.allergies" class="pt-1 bg-red-50 rounded p-2">
              <span class="text-red-600 font-semibold block text-xs">⚠️ Allergies</span>
              <span class="text-red-700 text-xs">{{ patientDetail.allergies }}</span>
            </div>
            <div v-if="patientDetail.medical_history" class="pt-1 bg-yellow-50 rounded p-2">
              <span class="text-yellow-700 font-semibold block text-xs">📋 Medical History</span>
              <span class="text-yellow-800 text-xs">{{ patientDetail.medical_history }}</span>
            </div>
          </div>
          <div v-else class="text-gray-400 text-sm text-center py-4">Patient profile not available</div>
        </div>

        <!-- Middle: Previous Prescriptions -->
        <div class="bg-white rounded-lg shadow p-5 space-y-3">
          <h3 class="font-bold text-gray-800 text-lg border-b pb-2">💊 Previous Prescriptions</h3>
          <div v-if="historyLoading" class="text-center py-4 text-gray-400">Loading...</div>
          <div v-else-if="previousPrescriptions.length === 0" class="text-gray-400 text-sm text-center py-4">No previous prescriptions</div>
          <div v-else class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="rx in previousPrescriptions"
              :key="rx.id"
              class="bg-blue-50 border border-blue-100 rounded p-3 text-xs"
            >
              <p class="font-semibold text-blue-800">{{ formatTs(rx.created_at) }}</p>
              <p class="text-gray-600">Status: <span class="capitalize font-medium">{{ rx.status || 'issued' }}</span></p>
              <p v-if="rx.notes" class="text-gray-500 mt-1 italic">{{ rx.notes }}</p>
              <div v-if="rx.prescription_items?.length" class="mt-1 space-y-1">
                <p v-for="item in rx.prescription_items" :key="item.id" class="text-gray-700">
                  • {{ item.medicine?.name || 'Medicine' }} — {{ item.dosage }}, {{ item.frequency }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Previous Lab Orders -->
        <div class="bg-white rounded-lg shadow p-5 space-y-3">
          <h3 class="font-bold text-gray-800 text-lg border-b pb-2">🧪 Previous Lab Orders</h3>
          <div v-if="historyLoading" class="text-center py-4 text-gray-400">Loading...</div>
          <div v-else-if="previousLabOrders.length === 0" class="text-gray-400 text-sm text-center py-4">No lab orders found</div>
          <div v-else class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="order in previousLabOrders"
              :key="order.id"
              class="bg-teal-50 border border-teal-100 rounded p-3 text-xs"
            >
              <p class="font-semibold text-teal-800">{{ order.test_name }}</p>
              <p class="text-gray-600">{{ order.test_type }} | Priority: <span class="capitalize font-medium">{{ order.priority }}</span></p>
              <p class="text-gray-500">Status: <span class="capitalize font-medium">{{ order.status }}</span></p>
              <p class="text-gray-400 mt-1">{{ formatTs(order.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Success / Error Global Messages -->
      <div v-if="successMsg" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
        <span>✅</span> {{ successMsg }}
      </div>
      <div v-if="globalError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        ❌ {{ globalError }}
      </div>

      <!-- Management Tabs -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex gap-4 flex-wrap">
          <button
            @click="managementTab = 'prescription'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'prescription' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            💊 Prescription
          </button>
          <button
            @click="managementTab = 'lab'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'lab' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            🧪 Lab Tests
          </button>
          <button
            @click="managementTab = 'notes'"
            :class="[
              'px-6 py-2 rounded-lg font-semibold transition-all',
              managementTab === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            📝 SOAP Notes
          </button>
        </div>
      </div>

      <!-- ─── PRESCRIPTION TAB ─── -->
      <div v-if="managementTab === 'prescription'" class="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">💊 Add Prescription</h2>

        <!-- Medicine Search -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Search Medicine</label>
          <div class="relative">
            <input
              v-model="medicineSearch"
              @input="searchMedicines"
              type="text"
              placeholder="Type medicine name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <!-- Dropdown results -->
            <div v-if="medicineResults.length > 0" class="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              <div
                v-for="med in medicineResults"
                :key="med.id"
                @click="selectMedicine(med)"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100"
              >
                <span class="font-medium">{{ med.name }}</span>
                <span class="text-gray-500 ml-2">{{ med.unit }} | Stock: {{ med.stock_quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Medicine Form -->
        <div v-if="selectedMedicine" class="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
          <p class="font-semibold text-blue-800">Selected: {{ selectedMedicine.name }}</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Dosage *</label>
              <input
                v-model="rxForm.dosage"
                type="text"
                placeholder="e.g., 500mg"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Frequency *</label>
              <select v-model="rxForm.frequency" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="once_daily">Once daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="thrice_daily">Thrice daily (TDS)</option>
                <option value="four_times_daily">Four times daily (QID)</option>
                <option value="as_needed">As needed (SOS)</option>
                <option value="at_bedtime">At bedtime (HS)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Duration (days) *</label>
              <input
                v-model="rxForm.duration"
                type="text"
                placeholder="e.g., 7 days"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
              <input
                v-model.number="rxForm.quantity"
                type="number"
                min="1"
                placeholder="e.g., 14"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Time of Day</label>
              <select v-model="rxForm.time_of_day" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="before_food">Before food</option>
                <option value="after_food">After food</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Instructions</label>
              <input
                v-model="rxForm.instructions"
                type="text"
                placeholder="e.g., Take with water"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            @click="addMedicineToList"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            ➕ Add to Prescription
          </button>
        </div>

        <!-- Prescription Items List -->
        <div v-if="prescriptionItems.length > 0" class="space-y-2">
          <h3 class="font-bold text-lg text-gray-800">Medicines Added ({{ prescriptionItems.length }})</h3>
          <div
            v-for="(item, idx) in prescriptionItems"
            :key="idx"
            class="bg-gray-50 border-l-4 border-blue-500 p-3 rounded flex justify-between items-center"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ item._name }}</p>
              <p class="text-sm text-gray-600">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }} · Qty: {{ item.quantity }}</p>
              <p v-if="item.instructions" class="text-xs text-gray-500">{{ item.instructions }}</p>
            </div>
            <button @click="prescriptionItems.splice(idx, 1)" class="text-red-500 hover:text-red-700 text-lg font-bold">✕</button>
          </div>

          <!-- Prescription Notes -->
          <div class="mt-4">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Prescription Notes (optional)</label>
            <textarea
              v-model="prescriptionNotes"
              rows="2"
              placeholder="Any overall notes for pharmacist..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            @click="savePrescription"
            :disabled="savingPrescription"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all disabled:opacity-50"
          >
            {{ savingPrescription ? '💾 Saving...' : '💾 Save Prescription to Database' }}
          </button>
        </div>

        <div v-if="prescriptionItems.length === 0 && !selectedMedicine" class="text-center py-6 text-gray-400">
          <p>Search and add medicines above to create a prescription</p>
        </div>
      </div>

      <!-- ─── LAB TESTS TAB ─── -->
      <div v-if="managementTab === 'lab'" class="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">🧪 Order Lab Tests</h2>

        <form @submit.prevent="orderLabTest" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Test Type *</label>
              <select
                v-model="labForm.testType"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="blood">Blood Test</option>
                <option value="urine">Urine Test</option>
                <option value="radiology">Radiology</option>
                <option value="cardiology">Cardiology</option>
                <option value="microbiology">Microbiology</option>
                <option value="pathology">Pathology</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Test Name *</label>
              <select
                v-model="labForm.testName"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Test</option>
                <optgroup v-if="labForm.testType === 'blood'" label="Blood Tests">
                  <option value="CBC">CBC (Complete Blood Count)</option>
                  <option value="LFT">LFT (Liver Function Test)</option>
                  <option value="KFT">KFT (Kidney Function Test)</option>
                  <option value="Blood Sugar Fasting">Blood Sugar Fasting</option>
                  <option value="HbA1c">HbA1c</option>
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="Thyroid Profile">Thyroid Profile (TSH/T3/T4)</option>
                </optgroup>
                <optgroup v-if="labForm.testType === 'urine'" label="Urine Tests">
                  <option value="Urine Routine">Urine Routine & Microscopy</option>
                  <option value="Urine Culture">Urine Culture & Sensitivity</option>
                  <option value="24hr Urine Protein">24hr Urine Protein</option>
                </optgroup>
                <optgroup v-if="labForm.testType === 'radiology'" label="Radiology">
                  <option value="X-Ray Chest">X-Ray Chest PA</option>
                  <option value="X-Ray Abdomen">X-Ray Abdomen</option>
                  <option value="USG Abdomen">USG Abdomen</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI Brain">MRI Brain</option>
                  <option value="MRI Spine">MRI Spine</option>
                </optgroup>
                <optgroup v-if="labForm.testType === 'cardiology'" label="Cardiology">
                  <option value="ECG">ECG (12 Lead)</option>
                  <option value="2D Echo">2D Echo</option>
                  <option value="Holter Monitor">Holter Monitor</option>
                </optgroup>
                <optgroup v-if="labForm.testType === 'microbiology'" label="Microbiology">
                  <option value="Blood Culture">Blood Culture</option>
                  <option value="Sputum Culture">Sputum Culture</option>
                  <option value="COVID Antigen">COVID Antigen</option>
                  <option value="COVID RT-PCR">COVID RT-PCR</option>
                </optgroup>
                <optgroup v-if="!labForm.testType || labForm.testType === 'other'" label="Other">
                  <option value="Custom">Custom (specify in notes)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select v-model="labForm.priority" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT (Immediate)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
              <input
                v-model="labForm.scheduledDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
            <textarea
              v-model="labForm.notes"
              placeholder="Any special instructions for lab technician..."
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="savingLab"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
          >
            {{ savingLab ? '🔬 Ordering...' : '🔬 Order Lab Test' }}
          </button>
        </form>

        <!-- Ordered Tests Today -->
        <div v-if="orderedTests.length > 0" class="mt-4 space-y-2">
          <h3 class="font-bold text-gray-800">Orders Placed This Session</h3>
          <div v-for="test in orderedTests" :key="test.id" class="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
            <p class="font-semibold text-green-800">✅ {{ test.test_name }} ({{ test.test_type }})</p>
            <p class="text-green-600">Priority: {{ test.priority }} | Order ID: {{ test.id?.slice(0,8) }}...</p>
          </div>
        </div>
      </div>

      <!-- ─── SOAP NOTES TAB ─── -->
      <div v-if="managementTab === 'notes'" class="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 class="text-2xl font-bold text-gray-800">📝 SOAP Notes</h2>
        <p class="text-sm text-gray-500">OPD Consultation notes — saved to patient's medical record</p>

        <form @submit.prevent="saveSoapNotes" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              S — Subjective <span class="text-gray-400 font-normal">(Patient ki complaints)</span>
            </label>
            <textarea
              v-model="soapForm.subjective"
              placeholder="Patient kya bol raha hai? Symptoms, duration, severity..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              O — Objective <span class="text-gray-400 font-normal">(Examination findings)</span>
            </label>
            <textarea
              v-model="soapForm.objective"
              placeholder="Vital signs, physical examination, lab results..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              A — Assessment <span class="text-gray-400 font-normal">(Diagnosis)</span>
            </label>
            <textarea
              v-model="soapForm.assessment"
              placeholder="Diagnosis, differential diagnosis, clinical impression..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              P — Plan <span class="text-gray-400 font-normal">(Treatment plan)</span>
            </label>
            <textarea
              v-model="soapForm.plan"
              placeholder="Medications, investigations, referrals, follow-up date..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Vitals</label>
              <input
                v-model="soapForm.vitals"
                type="text"
                placeholder="BP: 120/80, Temp: 98.6°F, HR: 72..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Next Review Date</label>
              <input
                v-model="soapForm.nextReviewDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="savingNotes"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
          >
            {{ savingNotes ? '💾 Saving...' : '💾 Save SOAP Notes to Database' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useApi } from '../../../composables/useApi.js'
import { useAuthStore } from '../../../stores/authStore.js'
import LoadingSpinner from '../../../components/shared/LoadingSpinner.vue'

export default {
  name: 'CurrentPatientManagementTab',
  components: { LoadingSpinner },
  props: {
    doctorId: {
      type: String,
      default: null
    },
    selectedAppointment: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const apiClient = useApi()
    const authStore = useAuthStore()
    const managementTab = ref('prescription')
    const successMsg = ref('')
    const globalError = ref('')

    // ── Patient details + history ──
    const patientDetail = ref(null)
    const patientLoading = ref(false)
    const historyLoading = ref(false)
    const previousPrescriptions = ref([])
    const previousLabOrders = ref([])

    const formatTs = (ts) => {
      if (!ts) return '--'
      let t = Number(ts)
      if (t < 1e10) t *= 1000
      return new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const loadPatientDetails = async (patientId) => {
      patientLoading.value = true
      try {
        const res = await apiClient.get(`/patients/${patientId}`)
        patientDetail.value = res?.data?.data || res?.data || null
      } catch (e) {
        console.error('Failed to load patient details:', e)
        patientDetail.value = null
      } finally {
        patientLoading.value = false
      }
    }

    const loadPatientHistory = async (patientId) => {
      historyLoading.value = true
      try {
        const [rxRes, labRes] = await Promise.allSettled([
          apiClient.get(`/prescriptions/patient/${patientId}?limit=5`),
          apiClient.get(`/lab/patients/${patientId}/orders?limit=5`)
        ])
        if (rxRes.status === 'fulfilled') {
          const d = rxRes.value?.data?.data
          previousPrescriptions.value = Array.isArray(d) ? d : (d?.prescriptions || [])
        }
        if (labRes.status === 'fulfilled') {
          const d = labRes.value?.data?.data
          previousLabOrders.value = Array.isArray(d) ? d : (d?.orders || [])
        }
      } catch (e) {
        console.error('Failed to load patient history:', e)
      } finally {
        historyLoading.value = false
      }
    }

    // ── Medicine search ──
    const medicineSearch = ref('')
    const medicineResults = ref([])
    const selectedMedicine = ref(null)
    const allMedicines = ref([])

    const rxForm = ref({
      dosage: '',
      frequency: 'once_daily',
      duration: '',
      quantity: 1,
      time_of_day: '',
      instructions: ''
    })

    const prescriptionItems = ref([])
    const prescriptionNotes = ref('')
    const savingPrescription = ref(false)

    // ── Lab ──
    const labForm = ref({
      testType: '',
      testName: '',
      priority: 'normal',
      scheduledDate: '',
      notes: ''
    })
    const savingLab = ref(false)
    const orderedTests = ref([])

    // ── SOAP ──
    const soapForm = ref({
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      vitals: '',
      nextReviewDate: ''
    })
    const savingNotes = ref(false)

    // Load medicines on mount
    const loadMedicines = async () => {
      try {
        const res = await apiClient.get('/pharmacy/medicines?limit=200')
        const data = res?.data?.data || res?.data || []
        allMedicines.value = Array.isArray(data) ? data : (data.medicines || [])
      } catch (e) {
        console.error('Failed to load medicines:', e)
      }
    }

    const searchMedicines = () => {
      const q = medicineSearch.value.toLowerCase().trim()
      if (!q) {
        medicineResults.value = []
        return
      }
      medicineResults.value = allMedicines.value
        .filter(m => m.name?.toLowerCase().includes(q))
        .slice(0, 8)
    }

    const selectMedicine = (med) => {
      selectedMedicine.value = med
      medicineSearch.value = ''
      medicineResults.value = []
      rxForm.value = { dosage: '', frequency: 'once_daily', duration: '', quantity: 1, time_of_day: '', instructions: '' }
    }

    const addMedicineToList = () => {
      if (!rxForm.value.dosage || !rxForm.value.duration || !rxForm.value.quantity) {
        globalError.value = 'Dosage, duration, aur quantity required hain'
        setTimeout(() => { globalError.value = '' }, 3000)
        return
      }
      prescriptionItems.value.push({
        medicine_id: selectedMedicine.value.id,
        _name: selectedMedicine.value.name,
        dosage: rxForm.value.dosage,
        frequency: rxForm.value.frequency,
        duration: rxForm.value.duration,
        quantity: rxForm.value.quantity,
        time_of_day: rxForm.value.time_of_day,
        instructions: rxForm.value.instructions
      })
      selectedMedicine.value = null
      rxForm.value = { dosage: '', frequency: 'once_daily', duration: '', quantity: 1, time_of_day: '', instructions: '' }
    }

    const savePrescription = async () => {
      if (!props.selectedAppointment) return
      if (prescriptionItems.value.length === 0) return

      const items = prescriptionItems.value.map(item => ({
        medicine_id: item.medicine_id,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        time_of_day: item.time_of_day || '',
        instructions: item.instructions || ''
      }))

      savingPrescription.value = true
      globalError.value = ''
      try {
        await apiClient.post('/prescriptions', {
          appointment_id: props.selectedAppointment.id,
          doctor_id: authStore.user?.id,
          items,
          notes: prescriptionNotes.value
        })
        successMsg.value = `Prescription successfully saved — ${items.length} medicine(s)`
        prescriptionItems.value = []
        prescriptionNotes.value = ''
        const pid = props.selectedAppointment.patient_id || props.selectedAppointment.patient?.id
        if (pid) loadPatientHistory(pid)
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (err) {
        globalError.value = err.response?.data?.message || err.message || 'Failed to save prescription'
      } finally {
        savingPrescription.value = false
      }
    }

    const orderLabTest = async () => {
      if (!props.selectedAppointment) return
      if (!labForm.value.testType || !labForm.value.testName) {
        globalError.value = 'Test type aur test name required hain'
        setTimeout(() => { globalError.value = '' }, 3000)
        return
      }

      savingLab.value = true
      globalError.value = ''
      try {
        const payload = {
          patient_id: props.selectedAppointment.patient_id,
          doctor_id: authStore.user?.id,
          test_type: labForm.value.testType,
          test_name: labForm.value.testName,
          priority: labForm.value.priority || 'normal',
          scheduled_date: labForm.value.scheduledDate || null
        }
        const res = await apiClient.post('/lab/orders', payload)
        const saved = res?.data?.data || res?.data
        if (saved) orderedTests.value.push(saved)
        successMsg.value = `Lab order placed: ${labForm.value.testName}`
        labForm.value = { testType: '', testName: '', priority: 'normal', scheduledDate: '', notes: '' }
        const pid = props.selectedAppointment.patient_id || props.selectedAppointment.patient?.id
        if (pid) loadPatientHistory(pid)
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (err) {
        globalError.value = err.response?.data?.message || err.message || 'Failed to order lab test'
      } finally {
        savingLab.value = false
      }
    }

    const saveSoapNotes = async () => {
      if (!props.selectedAppointment) return
      if (!soapForm.value.subjective && !soapForm.value.assessment) {
        globalError.value = 'Kam se kam Subjective ya Assessment fill karein'
        setTimeout(() => { globalError.value = '' }, 3000)
        return
      }

      savingNotes.value = true
      globalError.value = ''
      try {
        const today = new Date().toISOString().split('T')[0]
        const payload = {
          patient_id: props.selectedAppointment.patient_id,
          doctor_id: authStore.user?.id,
          recorded_date: today,
          subjective: soapForm.value.subjective,
          objective: soapForm.value.objective,
          assessment: soapForm.value.assessment,
          plan: soapForm.value.plan,
          vitals: soapForm.value.vitals,
          next_review_date: soapForm.value.nextReviewDate || null
        }
        await apiClient.post('/progress-notes', payload)
        successMsg.value = 'SOAP notes successfully saved to database'
        soapForm.value = { subjective: '', objective: '', assessment: '', plan: '', vitals: '', nextReviewDate: '' }
        setTimeout(() => { successMsg.value = '' }, 4000)
      } catch (err) {
        globalError.value = err.response?.data?.message || err.message || 'Failed to save SOAP notes'
      } finally {
        savingNotes.value = false
      }
    }

    // Reset state when new patient selected
    watch(() => props.selectedAppointment, (newApt) => {
      if (newApt) {
        managementTab.value = 'prescription'
        prescriptionItems.value = []
        orderedTests.value = []
        soapForm.value = { subjective: '', objective: '', assessment: '', plan: '', vitals: '', nextReviewDate: '' }
        successMsg.value = ''
        globalError.value = ''
        patientDetail.value = null
        previousPrescriptions.value = []
        previousLabOrders.value = []
        loadMedicines()
        const pid = newApt.patient_id || newApt.patient?.id
        if (pid) {
          loadPatientDetails(pid)
          loadPatientHistory(pid)
        }
      }
    }, { immediate: true })

    return {
      managementTab,
      successMsg,
      globalError,
      patientDetail,
      patientLoading,
      historyLoading,
      previousPrescriptions,
      previousLabOrders,
      formatTs,
      medicineSearch,
      medicineResults,
      selectedMedicine,
      rxForm,
      prescriptionItems,
      prescriptionNotes,
      savingPrescription,
      labForm,
      savingLab,
      orderedTests,
      soapForm,
      savingNotes,
      searchMedicines,
      selectMedicine,
      addMedicineToList,
      savePrescription,
      orderLabTest,
      saveSoapNotes
    }
  }
}
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
