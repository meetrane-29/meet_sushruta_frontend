<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900">💰 Bills & Outstanding Payments</h2>
    </div>

    <div v-if="loading" class="p-8 text-center">Loading...</div>
    <div v-else-if="error" class="p-8 text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div class="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">🔴 Outstanding</p>
          <p class="text-2xl font-bold text-red-600 mt-1">₹{{ totalOutstanding.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">📋 Pending Bills</p>
          <p class="text-2xl font-bold text-yellow-600 mt-1">{{ pendingCount }}</p>
        </div>
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">✅ Paid</p>
          <p class="text-2xl font-bold text-green-600 mt-1">₹{{ totalPaid.toFixed(2) }}</p>
        </div>
      </div>

      <div v-if="bills.length === 0" class="p-8 text-center text-gray-600">
        <p>No bills found</p>
      </div>
      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold">Bill ID</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Amount</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="b in bills" :key="b.id" class="hover:bg-gray-50">
            <td class="px-6 py-3 font-medium">{{ b.bill_number || b.id.slice(0, 8) }}</td>
            <td class="px-6 py-3 text-sm">{{ formatDate(b.created_at) }}</td>
            <td class="px-6 py-3 font-semibold">₹{{ b.total_amount?.toFixed(2) || '0' }}</td>
            <td class="px-6 py-3 text-sm" :class="{'text-red-600 font-bold': isOverdue(b)}">{{ formatDate(b.due_date) }} {{ isOverdue(b) ? '⚠️ Overdue' : '' }}</td>
            <td class="px-6 py-3">
              <span :class="['px-2 py-1 text-xs font-semibold rounded', b.status === 'paid' ? 'bg-green-100 text-green-800' : b.status === 'partially_paid' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800']">{{ b.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/authStore'

const api = useApi()
const authStore = useAuthStore()
const bills = ref([])
const loading = ref(false)
const error = ref('')

const formatDate = (d) => {
  if (!d) return '--'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

const isOverdue = (b) => {
  if (!b.due_date || b.status === 'paid') return false
  return new Date(b.due_date) < new Date()
}

const pendingCount = computed(() => bills.value.filter(b => b.status !== 'paid').length)
const totalOutstanding = computed(() => bills.value.filter(b => b.status !== 'paid').reduce((s, b) => s + (b.total_amount - (b.paid_amount || 0)), 0))
const totalPaid = computed(() => bills.value.reduce((s, b) => s + (b.paid_amount || 0), 0))

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get(`/billing?patient_id=${authStore.userId}`)
    bills.value = res.data?.bills || res.data || []
  } catch (e) {
    error.value = 'Failed to load bills'
  } finally {
    loading.value = false
  }
})
</script>