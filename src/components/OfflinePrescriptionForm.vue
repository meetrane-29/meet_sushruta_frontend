<template>
  <div class="offline-prescription-form">
    <div class="form-header">
      <h3>💊 {{ isOffline ? 'Draft Prescription (Offline)' : 'New Prescription' }}</h3>
      <span v-if="isOffline" class="offline-badge">📡 Offline Mode</span>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <form @submit.prevent="savePrescription" class="form-content">
      <!-- Patient Selection -->
      <div class="form-group">
        <label>Patient<span class="required">*</span></label>
        <input
          v-model="form.patientName"
          type="text"
          placeholder="Search or enter patient name"
          @input="searchPatients"
          class="form-control"
          required
        />
        <div v-if="patientSuggestions.length > 0" class="suggestions">
          <div
            v-for="patient in patientSuggestions"
            :key="patient.id"
            class="suggestion-item"
            @click="selectPatient(patient)"
          >
            {{ patient.name }} ({{ patient.uhid }})
          </div>
        </div>
      </div>

      <!-- Medicines -->
      <div class="form-group">
        <label>Medicines<span class="required">*</span></label>
        <div class="medicines-list">
          <div
            v-for="(medicine, idx) in form.medicines"
            :key="idx"
            class="medicine-row"
          >
            <input
              v-model="medicine.name"
              type="text"
              placeholder="Medicine name"
              class="form-control"
              required
            />
            <input
              v-model="medicine.dosage"
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              class="form-control"
              required
            />
            <select v-model="medicine.frequency" class="form-control" required>
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Thrice daily</option>
              <option>As needed</option>
            </select>
            <input
              v-model="medicine.duration"
              type="text"
              placeholder="Duration (e.g., 7 days)"
              class="form-control"
              required
            />
            <button
              type="button"
              @click="removeMedicine(idx)"
              class="btn-remove"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          type="button"
          @click="addMedicine"
          class="btn-secondary"
        >
          + Add Medicine
        </button>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label>Additional Notes</label>
        <textarea
          v-model="form.notes"
          placeholder="Additional instructions or notes..."
          class="form-control"
          rows="3"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button 
          type="submit"
          :class="['btn-primary', { disabled: !isFormValid }]"
          :disabled="!isFormValid"
        >
          {{ isOffline ? '💾 Save Draft' : '✓ Create Prescription' }}
        </button>
        <button type="button" @click="cancelForm" class="btn-secondary">
          Cancel
        </button>
      </div>

      <!-- Status -->
      <div v-if="isOffline" class="offline-notice">
        <p>
          📡 You are currently offline. This prescription will be saved locally
          and synced automatically when you're back online.
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOfflineStorage } from '@/composables/useOfflineStorage'
import { usePatientApi } from '@/composables/usePatientApi'

const props = defineProps({
  patientId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['saved', 'cancelled'])

const { saveDraftPrescription, searchPatientsOffline, isOffline } = useOfflineStorage()
const { fetchPatients } = usePatientApi()

const error = ref(null)
const patientSuggestions = ref([])
const form = ref({
  patientId: props.patientId || null,
  patientName: '',
  medicines: [{ name: '', dosage: '', frequency: 'Once daily', duration: '' }],
  notes: ''
})

const isFormValid = computed(() => {
  return (
    form.value.patientName && 
    form.value.medicines.some(m => m.name && m.dosage && m.frequency && m.duration)
  )
})

const addMedicine = () => {
  form.value.medicines.push({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    duration: ''
  })
}

const removeMedicine = (idx) => {
  form.value.medicines.splice(idx, 1)
  if (form.value.medicines.length === 0) {
    addMedicine()
  }
}

const searchPatients = async (event) => {
  const query = event.target.value
  if (query.length < 2) {
    patientSuggestions.value = []
    return
  }

  try {
    if (isOffline.value) {
      // Search in offline index
      patientSuggestions.value = searchPatientsOffline(query)
    } else {
      // Search via API
      const response = await fetchPatients(1, 5, query)
      patientSuggestions.value = response.patients || []
    }
  } catch (err) {
    console.error('Search failed:', err)
    patientSuggestions.value = []
  }
}

const selectPatient = (patient) => {
  form.value.patientId = patient.id
  form.value.patientName = patient.name
  patientSuggestions.value = []
}

const savePrescription = () => {
  try {
    error.value = null

    if (!form.value.patientId) {
      error.value = 'Please select a patient'
      return
    }

    const prescription = {
      patientId: form.value.patientId,
      patientName: form.value.patientName,
      medicines: form.value.medicines.filter(m => m.name),
      notes: form.value.notes,
      createdAt: new Date().toISOString()
    }

    const storageKey = saveDraftPrescription(prescription)
    
    emit('saved', {
      ...prescription,
      storageKey,
      isSyncedLocally: true
    })

    // Reset form
    form.value = {
      patientId: null,
      patientName: '',
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', duration: '' }],
      notes: ''
    }

    if (isOffline.value) {
      alert('✓ Prescription saved locally. It will be synced when you\'re back online.')
    } else {
      alert('✓ Prescription saved successfully!')
    }
  } catch (err) {
    error.value = err.message || 'Failed to save prescription'
  }
}

const cancelForm = () => {
  emit('cancelled')
}
</script>

<style scoped>
.offline-prescription-form {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.form-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.offline-badge {
  background: #fff3cd;
  color: #856404;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.alert {
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.required {
  color: #dc3545;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.suggestions {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.medicines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medicine-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 50px;
  gap: 10px;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .medicine-row {
    grid-template-columns: 1fr;
  }

  .btn-remove {
    width: 100%;
  }
}

.btn-remove {
  padding: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-remove:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #28a745;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(.disabled) {
  background: #1e7e34;
}

.btn-primary.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  flex: 1;
}

.btn-secondary:hover {
  background: #5a6268;
}

.offline-notice {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 12px;
  margin-top: 15px;
  color: #856404;
  font-size: 13px;
  line-height: 1.5;
}

.offline-notice p {
  margin: 0;
}
</style>
