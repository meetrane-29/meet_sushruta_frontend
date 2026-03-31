<template>
  <div class="opd-billing">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">OPD Billing & Payment</h2>

      <!-- Tabs for Generate/Track -->
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          v-for="tab in billingTabs"
          :key="tab.id"
          @click="activeBillingTab = tab.id"
          :class="[
            'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
            activeBillingTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Generate Receipt Tab -->
      <div v-if="activeBillingTab === 'generate'" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Generate OPD Receipt</h3>

        <!-- Patient Info (pre-filled from today's list) -->
        <div v-if="billingForm.patientName" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
          <p class="text-xs text-blue-600 font-semibold uppercase mb-1">Selected Patient</p>
          <p class="font-bold text-gray-800 text-lg">{{ billingForm.patientName }}</p>
          <p class="text-sm text-gray-500" v-if="billingForm.doctorName">Doctor: {{ billingForm.doctorName }}</p>
          <p class="text-sm text-gray-500" v-if="billingForm.appointmentTime">Time: {{ billingForm.appointmentTime }}</p>
          <button @click="clearPatient" class="text-xs text-red-500 hover:text-red-700 mt-1">✕ Clear</button>
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient ID (UUID) *</label>
            <input
              v-model="billingForm.patientId"
              type="text"
              placeholder="Patient UUID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p class="text-xs text-gray-400 mt-1">Ya upar "Patients Today" se patient select karein</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Appointment ID</label>
            <input
              v-model="billingForm.appointmentID"
              type="text"
              placeholder="Appointment ID (optional)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee *</label>
            <input
              v-model.number="billingForm.consultationFee"
              type="number"
              placeholder="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Covered Amount</label>
            <input
              v-model.number="billingForm.insuranceCovered"
              type="number"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              v-model="billingForm.paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
              <option value="insurance">Insurance</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          <div v-if="billingForm.paymentMethod === 'card' || billingForm.paymentMethod === 'upi'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
            <input
              v-model="billingForm.transactionRef"
              type="text"
              placeholder="Transaction ID/Reference"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              v-model="billingForm.notes"
              placeholder="Additional notes..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- Amount Summary -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600">Consultation Fee</p>
              <p class="text-xl font-bold text-gray-800">₹{{ billingForm.consultationFee || 0 }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Insurance Covered</p>
              <p class="text-xl font-bold text-green-600">₹{{ billingForm.insuranceCovered || 0 }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Patient Pays</p>
              <p class="text-xl font-bold text-blue-600">
                ₹{{ (billingForm.consultationFee || 0) - (billingForm.insuranceCovered || 0) }}
              </p>
            </div>
          </div>
        </div>

        <button
          @click="generateReceipt"
          :disabled="isLoading || (!billingForm.patientId && !billingForm.patientName) || !billingForm.consultationFee"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          <span v-if="!isLoading">🧾 Generate Receipt</span>
          <span v-else>Processing...</span>
        </button>
      </div>

      <!-- Receipt History Tab -->
      <div v-if="activeBillingTab === 'history'" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Receipt History</h3>

        <div class="flex gap-4 mb-6">
          <input
            v-model="searchReceiptQuery"
            type="text"
            placeholder="Search by receipt number or patient ID"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            @keyup.enter="searchReceipts"
          />
          <button
            @click="searchReceipts"
            :disabled="isLoading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            🔍 Search
          </button>
        </div>

        <div v-if="receipts.length > 0" class="space-y-3">
          <div
            v-for="receipt in receipts"
            :key="receipt.id"
            class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-bold text-gray-800">{{ receipt.receipt_number }}</h4>
                <p class="text-sm text-gray-600">Date: {{ receipt.receipt_date }}</p>
                <p class="text-sm text-gray-600">Amount: ₹{{ receipt.consultation_fee }}</p>
                <p class="text-sm text-gray-600">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      receipt.payment_method === 'cash'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    {{ receipt.payment_method }}
                  </span>
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="viewReceipt(receipt)"
                  class="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  @click="printReceipt(receipt)"
                  class="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="searchTried && receipts.length === 0" class="text-center py-8 text-gray-600">
          No receipts found
        </div>
      </div>

      <!-- Generated Receipt Display -->
      <div v-if="generatedReceipt" class="mt-8 border-t pt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Receipt Generated Successfully</h3>

        <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div class="text-center mb-6">
            <h4 class="text-2xl font-bold text-gray-800">OPD Receipt</h4>
            <p class="text-sm text-gray-600">Meet Sushruta Hospital</p>
          </div>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p class="text-xs text-gray-600">RECEIPT NUMBER</p>
              <p class="font-bold text-gray-800">{{ generatedReceipt.receipt_number }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">DATE</p>
              <p class="font-bold text-gray-800">{{ generatedReceipt.receipt_date }}</p>
            </div>
          </div>

          <table class="w-full mb-6">
            <tr class="border-b border-gray-300">
              <td class="py-2 text-sm text-gray-600">Consultation Fee</td>
              <td class="py-2 text-sm text-right font-medium">₹{{ generatedReceipt.consultation_fee }}</td>
            </tr>
            <tr class="border-b border-gray-300">
              <td class="py-2 text-sm text-gray-600">Insurance Coverage</td>
              <td class="py-2 text-sm text-right font-medium text-green-600">-₹{{ generatedReceipt.insurance_covered }}</td>
            </tr>
            <tr class="bg-gray-100">
              <td class="py-2 text-sm font-bold text-gray-800">Amount Payable</td>
              <td class="py-2 text-sm text-right font-bold text-gray-800">₹{{ generatedReceipt.patient_payable }}</td>
            </tr>
            <tr>
              <td class="py-3 text-sm font-bold text-gray-800">Amount Paid</td>
              <td class="py-3 text-sm text-right font-bold text-blue-600">₹{{ generatedReceipt.paid_amount }}</td>
            </tr>
          </table>

          <div class="text-sm text-gray-600 mb-4">
            <p><strong>Payment Method:</strong> {{ generatedReceipt.payment_method }}</p>
            <p v-if="generatedReceipt.transaction_ref"><strong>Ref:</strong> {{ generatedReceipt.transaction_ref }}</p>
          </div>

          <div class="pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Thank you for your payment</p>
            <p>For complaints, contact receptionist</p>
          </div>
        </div>

        <div class="mt-4 flex gap-4">
          <button
            @click="printCurrentReceipt"
            class="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            🖨️ Print Receipt
          </button>
          <button
            @click="downloadReceipt"
            class="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ⬇️ Download PDF
          </button>
          <button
            @click="resetBilling"
            class="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ New Receipt
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
        Error: {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useOPDApi } from '@/composables/useOPDApi'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  patientData: {
    type: Object,
    default: null
  }
})

const activeBillingTab = ref('generate')
const billingTabs = [
  { id: 'generate', label: '🧾 Generate Receipt' },
  { id: 'history', label: '📋 Receipt History' }
]

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const generatedReceipt = ref(null)
const receipts = ref([])
const searchReceiptQuery = ref('')
const searchTried = ref(false)

const opdApi = useOPDApi()
const { api } = useApi()

const billingForm = ref({
  patientId: '',
  patientName: '',
  doctorName: '',
  appointmentTime: '',
  appointmentID: '',
  consultationFee: 500,
  insuranceCovered: 0,
  paymentMethod: 'cash',
  transactionRef: '',
  notes: ''
})

// Watch for patient selected from today's modal
watch(() => props.patientData, (data) => {
  if (data) {
    billingForm.value.patientId = data.patientId || ''
    billingForm.value.patientName = data.patientName || ''
    billingForm.value.doctorName = data.doctorName || ''
    billingForm.value.appointmentTime = data.appointmentTime || ''
    billingForm.value.appointmentID = data.appointmentId || ''
    activeBillingTab.value = 'generate'
    generatedReceipt.value = null
    successMessage.value = ''
    errorMessage.value = ''
  }
}, { immediate: true })

const generateReceipt = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const patientId = billingForm.value.patientId
    if (!patientId) {
      errorMessage.value = 'Patient ID required. Upar "Patients Today" se patient select karein.'
      return
    }

    // Step 1: Create Bill in database
    const billRes = await api.post('/billing/generate', {
      patient_id: patientId,
      appointment_id: billingForm.value.appointmentID || undefined,
      items: [{
        item_type: 'consultation',
        description: 'OPD Consultation',
        amount: billingForm.value.consultationFee,
        quantity: 1
      }]
    })

    const bill = billRes.data?.data?.bill
    if (!bill?.id) {
      errorMessage.value = 'Bill create karne mein error aaya'
      return
    }

    // Step 2: Generate OPD Receipt linked to the bill
    const result = await opdApi.generateOPDReceipt({
      bill_id: bill.id,
      appointment_id: billingForm.value.appointmentID || undefined,
      consultation_fee: billingForm.value.consultationFee,
      insurance_covered: billingForm.value.insuranceCovered || 0,
      payment_method: billingForm.value.paymentMethod,
      transaction_ref: billingForm.value.transactionRef,
      notes: billingForm.value.notes
    })

    if (result && result.data) {
      generatedReceipt.value = result.data?.data || result.data
      successMessage.value = 'Receipt generate ho gayi aur database mein save ho gayi!'
    }
  } catch (error) {
    console.error('Receipt generate error:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Receipt generate karne mein error'
  } finally {
    isLoading.value = false
  }
}

const searchReceipts = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    receipts.value = []
    searchTried.value = true

    // Search by patient ID if the query looks like a patient ID
    const result = await opdApi.getPatientOPDReceipts(searchReceiptQuery.value, 20, 0)
    if (result && result.data) {
      receipts.value = result.data.receipts || []
    }
  } catch (error) {
    errorMessage.value = 'Error searching receipts'
  } finally {
    isLoading.value = false
  }
}

const viewReceipt = (receipt) => {
  generatedReceipt.value = receipt
}

const printReceipt = async (receipt) => {
  try {
    await opdApi.printOPDReceipt(receipt.id)
    successMessage.value = 'Receipt printed'
  } catch (error) {
    errorMessage.value = 'Error printing receipt'
  }
}

const printCurrentReceipt = () => {
  if (generatedReceipt.value) {
    window.print()
  }
}

const downloadReceipt = async () => {
  if (generatedReceipt.value) {
    // This would generate a PDF download
    console.log('Download receipt:', generatedReceipt.value.receipt_number)
    successMessage.value = 'Receipt downloaded'
  }
}

const resetBilling = () => {
  billingForm.value = {
    patientId: '',
    patientName: '',
    doctorName: '',
    appointmentTime: '',
    appointmentID: '',
    consultationFee: 500,
    insuranceCovered: 0,
    paymentMethod: 'cash',
    transactionRef: '',
    notes: ''
  }
  generatedReceipt.value = null
  successMessage.value = ''
  errorMessage.value = ''
}

const clearPatient = () => {
  billingForm.value.patientId = ''
  billingForm.value.patientName = ''
  billingForm.value.doctorName = ''
  billingForm.value.appointmentTime = ''
  billingForm.value.appointmentID = ''
}
</script>

<style scoped>
.opd-billing {
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

@media print {
  .opd-billing {
    background: white !important;
  }
}
</style>
