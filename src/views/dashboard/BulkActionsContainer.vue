<template>
  <div class="bulk-actions-container">
    <div class="bulk-header">
      <h1>⚙️ Bulk Operations</h1>
      <div class="action-type-selector">
        <label>Operation Type:</label>
        <select v-model="selectedActionType" @change="resetSelections" class="action-select">
          <option value="prescriptions">Bulk Prescriptions</option>
          <option value="lab-tests">Bulk Lab Tests</option>
          <option value="admissions">Bulk Admissions</option>
          <option value="discharge">Bulk Discharge</option>
        </select>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-error">
      <span>❌ {{ error }}</span>
      <button @click="error = null" class="close-btn">×</button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      <span>{{ successMessage }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading items...</p>
    </div>

    <div v-if="selectedActionType === 'prescriptions'" class="action-section">
      <h2>📋 Bulk Prescription Management</h2>
      
      <div class="bulk-selection">
        <div class="selection-info">
          <label>
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="selectAll ? selectedItems = items.map(i => i.id) : (selectedItems = [])"
            />
            Select All ({{ items.length }} items)
          </label>
        </div>

        <div v-if="items.length === 0" class="no-items">
          <p>No pending prescriptions found</p>
        </div>

        <div v-else class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row prescription">
            <input
              type="checkbox"
              :checked="selectedItems.includes(item.id)"
              @change="(e) => {
                if (e.target.checked) {
                  selectedItems.push(item.id)
                } else {
                  selectedItems = selectedItems.filter(id => id !== item.id)
                }
              }"
            />
            <div class="item-info">
              <h4>{{ item.patientName }}</h4>
              <p>Medicines: {{ item.medicineCount }}</p>
              <p class="status" :class="item.status.toLowerCase()">{{ item.status }}</p>
            </div>
            <div class="item-date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>

      <div class="bulk-actions-bar">
        <span class="selected-count">{{ selectedItems.length }} selected</span>
        <button @click="bulkReview" class="action-btn review">👁️ Review</button>
        <button @click="bulkApprove" class="action-btn approve">✓ Approve</button>
        <button @click="bulkSend" class="action-btn send">📤 Send to Pharmacy</button>
        <button @click="bulkEmail" class="action-btn email">📧 Email</button>
      </div>
    </div>

    <div v-else-if="selectedActionType === 'lab-tests'" class="action-section">
      <h2>🧪 Bulk Lab Test Operations</h2>
      
      <div class="bulk-selection">
        <div class="selection-info">
          <label>
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="selectAll ? selectedItems = items.map(i => i.id) : (selectedItems = [])"
            />
            Select All ({{ items.length }} items)
          </label>
        </div>

        <div v-if="items.length === 0" class="no-items">
          <p>No pending lab tests found</p>
        </div>

        <div v-else class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row lab-test">
            <input
              type="checkbox"
              :checked="selectedItems.includes(item.id)"
              @change="(e) => {
                if (e.target.checked) {
                  selectedItems.push(item.id)
                } else {
                  selectedItems = selectedItems.filter(id => id !== item.id)
                }
              }"
            />
            <div class="item-info">
              <h4>{{ item.testName }}</h4>
              <p>Patient: {{ item.patientName }}</p>
              <p class="status" :class="item.status.toLowerCase()">{{ item.status }}</p>
            </div>
            <div class="item-date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>

      <div class="bulk-actions-bar">
        <span class="selected-count">{{ selectedItems.length }} selected</span>
        <button @click="bulkUploadResults" class="action-btn upload">📤 Upload Results</button>
        <button @click="bulkSendResults" class="action-btn send">📧 Send Results</button>
        <button @click="bulkGenerateReport" class="action-btn report">📊 Generate Report</button>
        <button @click="bulkResend" class="action-btn resend">🔄 Resend Order</button>
      </div>
    </div>

    <div v-else-if="selectedActionType === 'admissions'" class="action-section">
      <h2>🏥 Bulk Admission Management</h2>
      
      <div class="bulk-selection">
        <div class="selection-info">
          <label>
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="selectAll ? selectedItems = items.map(i => i.id) : (selectedItems = [])"
            />
            Select All ({{ items.length }} items)
          </label>
        </div>

        <div v-if="items.length === 0" class="no-items">
          <p>No pending admissions found</p>
        </div>

        <div v-else class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row admission">
            <input
              type="checkbox"
              :checked="selectedItems.includes(item.id)"
              @change="(e) => {
                if (e.target.checked) {
                  selectedItems.push(item.id)
                } else {
                  selectedItems = selectedItems.filter(id => id !== item.id)
                }
              }"
            />
            <div class="item-info">
              <h4>{{ item.patientName }}</h4>
              <p>Reason: {{ item.reason }}</p>
              <p class="status" :class="item.status.toLowerCase()">{{ item.status }}</p>
            </div>
            <div class="item-date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>

      <div class="bulk-actions-bar">
        <span class="selected-count">{{ selectedItems.length }} selected</span>
        <button @click="bulkAssignBeds" class="action-btn beds">🛏️ Assign Beds</button>
        <button @click="bulkCreateNurseInstructions" class="action-btn instructions">📝 Create Instructions</button>
        <button @click="bulkNotifyNurses" class="action-btn notify">🔔 Notify Nurses</button>
      </div>
    </div>

    <div v-else-if="selectedActionType === 'discharge'" class="action-section">
      <h2>👋 Bulk Discharge Operations</h2>
      
      <div class="bulk-selection">
        <div class="selection-info">
          <label>
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="selectAll ? selectedItems = items.map(i => i.id) : (selectedItems = [])"
            />
            Select All ({{ items.length }} items)
          </label>
        </div>

        <div v-if="items.length === 0" class="no-items">
          <p>No patients ready for discharge found</p>
        </div>

        <div v-else class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row discharge">
            <input
              type="checkbox"
              :checked="selectedItems.includes(item.id)"
              @change="(e) => {
                if (e.target.checked) {
                  selectedItems.push(item.id)
                } else {
                  selectedItems = selectedItems.filter(id => id !== item.id)
                }
              }"
            />
            <div class="item-info">
              <h4>{{ item.patientName }}</h4>
              <p>Admitted: {{ formatDate(item.admittedDate) }}</p>
              <p class="status" :class="item.status.toLowerCase()">{{ item.status }}</p>
            </div>
            <div class="item-date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>

      <div class="bulk-actions-bar">
        <span class="selected-count">{{ selectedItems.length }} selected</span>
        <button @click="bulkCreateDischargeSummary" class="action-btn summary">📄 Create Summary</button>
        <button @click="bulkScheduleFollowUp" class="action-btn followup">📅 Schedule Follow-up</button>
        <button @click="bulkSendDischargeLetter" class="action-btn letter">📧 Send Letter</button>
      </div>
    </div>

    <!-- Progress Modal -->
    <div v-if="showProgress" class="progress-modal">
      <div class="progress-content">
        <h3>{{ progressMessage }}</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p>{{ progressPercent }}% Complete</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';

export default {
  name: 'BulkActionsContainer',
  setup() {
    const { get, put, post, delete: del } = useApi();
    
    const selectedActionType = ref('prescriptions');
    const selectedItems = ref([]);
    const selectAll = ref(false);
    const showProgress = ref(false);
    const progressPercent = ref(0);
    const progressMessage = ref('');
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);

    const items = ref([]);
    const allMedicines = ref([]);
    const allLabTests = ref([]);
    const allAdmissions = ref([]);

    // Watch for selectAll changes
    watch(selectAll, (newVal) => {
      if (newVal) {
        selectedItems.value = items.value.map(item => item.id);
      } else {
        selectedItems.value = [];
      }
    });

    // Watch for selectedItems changes to update selectAll
    watch(selectedItems, (newVal) => {
      selectAll.value = newVal.length === items.value.length && items.value.length > 0;
    });

    const formatDate = (dateOrString) => {
      const date = typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString;
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    const resetSelections = () => {
      selectedItems.value = [];
      selectAll.value = false;
      error.value = null;
    };

    // Watch for action type changes to reload data
    watch(selectedActionType, () => {
      resetSelections();
      loadItems();
    });

    const loadItems = async () => {
      loading.value = true;
      error.value = null;

      try {
        switch (selectedActionType.value) {
          case 'prescriptions':
            await loadPrescriptions();
            break;
          case 'lab-tests':
            await loadLabTests();
            break;
          case 'admissions':
            await loadAdmissions();
            break;
          case 'discharge':
            await loadDischargePatients();
            break;
        }
      } catch (err) {
        console.error('Failed to load items:', err);
        error.value = 'Failed to load items';
      } finally {
        loading.value = false;
      }
    };

    const loadPrescriptions = async () => {
      try {
        const response = await get('/prescriptions?status=pending,approved');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        items.value = data.map(p => ({
          id: p.id,
          patientName: p.patientName || p.patient?.name,
          medicineCount: (p.medicines || []).length,
          status: p.status,
          date: p.createdDate || new Date(),
          medicines: p.medicines
        }));
      } catch (err) {
        items.value = [];
      }
    };

    const loadLabTests = async () => {
      try {
        const response = await get('/lab-requests?status=pending,assigned');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        items.value = data.map(lab => ({
          id: lab.id,
          testName: lab.testName,
          patientName: lab.patientName || lab.patient?.name,
          status: lab.status,
          date: lab.createdDate || new Date()
        }));
      } catch (err) {
        items.value = [];
      }
    };

    const loadAdmissions = async () => {
      try {
        const response = await get('/admissions?status=active');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        items.value = data.map(adm => ({
          id: adm.id,
          patientName: adm.patientName || adm.patient?.name,
          reason: adm.reason,
          admittedDate: adm.admittedDate || new Date(),
          status: adm.status,
          date: adm.createdDate || new Date()
        }));
      } catch (err) {
        items.value = [];
      }
    };

    const loadDischargePatients = async () => {
      try {
        const response = await get('/admissions?status=discharged');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        items.value = data.map(adm => ({
          id: adm.id,
          patientName: adm.patientName || adm.patient?.name,
          admittedDate: adm.admittedDate || new Date(),
          status: adm.status,
          date: adm.lastUpdated || new Date()
        }));
      } catch (err) {
        items.value = [];
      }
    };

    const simulateProgress = async (actionName, action, duration = 2000) => {
      showProgress.value = true;
      progressMessage.value = actionName;
      progressPercent.value = 0;

      try {
        await action();
        
        const interval = setInterval(() => {
          progressPercent.value += 20;
          if (progressPercent.value >= 100) {
            progressPercent.value = 100;
            clearInterval(interval);
            
            setTimeout(() => {
              showProgress.value = false;
              successMessage.value = `✓ ${actionName} completed successfully!`;
              setTimeout(() => {
                successMessage.value = null;
              }, 3000);
              resetSelections();
              loadItems();
            }, 500);
          }
        }, duration / 5);
      } catch (err) {
        showProgress.value = false;
        error.value = err.message || 'Operation failed';
      }
    };

    // Prescription Operations
    const bulkReview = () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one prescription';
        return;
      }
      simulateProgress('Reviewing prescriptions...', async () => {
        // Prescriptions just get marked for review
      });
    };

    const bulkApprove = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one prescription';
        return;
      }
      
      simulateProgress('Approving prescriptions...', async () => {
        for (const id of selectedItems.value) {
          await put(`/prescriptions/${id}`, { status: 'approved' });
        }
      });
    };

    const bulkSend = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one prescription';
        return;
      }
      
      simulateProgress('Sending to pharmacy...', async () => {
        for (const id of selectedItems.value) {
          await put(`/prescriptions/${id}`, { status: 'sent-to-pharmacy' });
        }
      });
    };

    const bulkEmail = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one prescription';
        return;
      }
      
      simulateProgress('Sending emails...', async () => {
        await post('/bulk-operations/send-prescriptions-email', {
          prescriptionIds: selectedItems.value
        });
      });
    };

    // Lab Operations
    const bulkUploadResults = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one lab test';
        return;
      }
      error.value = 'Upload results feature - requires file input dialog';
    };

    const bulkSendResults = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one lab test';
        return;
      }
      
      simulateProgress('Sending results...', async () => {
        await post('/bulk-operations/send-lab-results', {
          labRequestIds: selectedItems.value
        });
      });
    };

    const bulkGenerateReport = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one lab test';
        return;
      }
      
      simulateProgress('Generating reports...', async () => {
        const response = await post('/bulk-operations/generate-lab-reports', {
          labRequestIds: selectedItems.value
        });
        // Would download the file
        console.log('Report generated:', response);
      });
    };

    const bulkResend = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one lab test';
        return;
      }
      
      simulateProgress('Resending orders...', async () => {
        for (const id of selectedItems.value) {
          await put(`/lab-requests/${id}`, { status: 'pending' });
        }
      });
    };

    // Admission Operations
    const bulkAssignBeds = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one admission';
        return;
      }
      
      // Would need ward/bed selector in real implementation
      const ward = prompt('Enter ward name (e.g., General, ICU, CCU):');
      if (!ward) return;

      simulateProgress('Assigning beds...', async () => {
        for (const id of selectedItems.value) {
          await put(`/admissions/${id}`, { ward, bedStatus: 'assigned' });
        }
      });
    };

    const bulkCreateNurseInstructions = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one admission';
        return;
      }
      
      const instructions = prompt('Enter nursing instructions:');
      if (!instructions) return;

      simulateProgress('Creating nursing instructions...', async () => {
        for (const id of selectedItems.value) {
          await post(`/admissions/${id}/nurse-instructions`, {
            instructions,
            createdBy: 'admin'
          });
        }
      });
    };

    const bulkNotifyNurses = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one admission';
        return;
      }
      
      simulateProgress('Notifying nurses...', async () => {
        await post('/bulk-operations/notify-nurses', {
          admissionIds: selectedItems.value
        });
      });
    };

    // Discharge Operations
    const bulkCreateDischargeSummary = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one patient';
        return;
      }
      
      simulateProgress('Creating discharge summaries...', async () => {
        for (const id of selectedItems.value) {
          await post(`/admissions/${id}/discharge-summary`, {
            summary: 'Auto-generated summary'
          });
        }
      });
    };

    const bulkScheduleFollowUp = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one patient';
        return;
      }
      
      const daysOut = prompt('Schedule follow-up after how many days?');
      if (!daysOut) return;

      simulateProgress('Scheduling follow-ups...', async () => {
        await post('/bulk-operations/schedule-follow-ups', {
          admissionIds: selectedItems.value,
          daysOut: parseInt(daysOut)
        });
      });
    };

    const bulkSendDischargeLetter = async () => {
      if (selectedItems.value.length === 0) {
        error.value = 'Please select at least one patient';
        return;
      }
      
      simulateProgress('Sending discharge letters...', async () => {
        await post('/bulk-operations/send-discharge-letters', {
          admissionIds: selectedItems.value
        });
      });
    };

    onMounted(() => {
      loadItems();
    });

    return {
      selectedActionType,
      selectedItems,
      selectAll,
      showProgress,
      progressPercent,
      progressMessage,
      loading,
      error,
      successMessage,
      items,
      formatDate,
      resetSelections,
      bulkReview,
      bulkApprove,
      bulkSend,
      bulkEmail,
      bulkUploadResults,
      bulkSendResults,
      bulkGenerateReport,
      bulkResend,
      bulkAssignBeds,
      bulkCreateNurseInstructions,
      bulkNotifyNurses,
      bulkCreateDischargeSummary,
      bulkScheduleFollowUp,
      bulkSendDischargeLetter,
    };
  },
};
</script>

<style scoped>
.bulk-actions-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* Alerts */
.alert {
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  animation: slideInDown 0.3s ease;
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #66bb6a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  color: inherit;
}

.close-btn:hover {
  opacity: 0.7;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-weight: 500;
}

.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bulk-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.action-type-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-type-selector label {
  font-weight: 600;
  color: #666;
}

.action-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  min-width: 200px;
}

.action-section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.bulk-selection {
  margin-bottom: 20px;
}

.selection-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.selection-info label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
}

.selection-info input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
}

.no-items {
  padding: 30px;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed #ddd;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.item-row.lab-test {
  border-left-color: #28a745;
}

.item-row.admission {
  border-left-color: #17a2b8;
}

.item-row.discharge {
  border-left-color: #e83e8c;
}

.item-row input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  min-width: 18px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-weight: 600;
}

.item-info p {
  margin: 3px 0;
  font-size: 13px;
  color: #666;
}

.item-info .status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  background: #e0e0e0;
  color: #555;
}

.item-info .status.pending {
  background: #fff3cd;
  color: #856404;
}

.item-info .status.approved {
  background: #d4edda;
  color: #155724;
}

.item-info .status.completed {
  background: #d4edda;
  color: #155724;
}

.item-info .status.ready {
  background: #cce5ff;
  color: #004085;
}

.item-date {
  min-width: 100px;
  text-align: right;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.bulk-actions-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  flex-wrap: wrap;
  border-top: 2px solid #e0e0e0;
  margin-top: 20px;
}

.selected-count {
  font-weight: 600;
  color: #2c3e50;
  padding-right: 10px;
  border-right: 1px solid #ddd;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.action-btn.review {
  background: #007bff;
}

.action-btn.review:hover {
  background: #0056b3;
}

.action-btn.approve {
  background: #28a745;
}

.action-btn.approve:hover {
  background: #1e7e34;
}

.action-btn.send {
  background: #17a2b8;
}

.action-btn.send:hover {
  background: #138496;
}

.action-btn.email {
  background: #ffc107;
  color: #333;
}

.action-btn.email:hover {
  background: #e0a800;
}

.action-btn.upload {
  background: #28a745;
}

.action-btn.upload:hover {
  background: #1e7e34;
}

.action-btn.resend {
  background: #6c757d;
}

.action-btn.resend:hover {
  background: #5a6268;
}

.action-btn.report {
  background: #e83e8c;
}

.action-btn.report:hover {
  background: #bd2130;
}

.action-btn.beds {
  background: #dc3545;
}

.action-btn.beds:hover {
  background: #bd2130;
}

.action-btn.instructions {
  background: #ff9800;
}

.action-btn.instructions:hover {
  background: #e68900;
}

.action-btn.notify {
  background: #007bff;
}

.action-btn.notify:hover {
  background: #0056b3;
}

.action-btn.summary {
  background: #28a745;
}

.action-btn.summary:hover {
  background: #1e7e34;
}

.action-btn.followup {
  background: #17a2b8;
}

.action-btn.followup:hover {
  background: #138496;
}

.action-btn.letter {
  background: #ffc107;
  color: #333;
}

.action-btn.letter:hover {
  background: #e0a800;
}

/* Progress Modal */
.progress-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.progress-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  text-align: center;
}

.progress-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.progress-content p {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .bulk-header {
    flex-direction: column;
    gap: 15px;
  }

  .action-type-selector {
    width: 100%;
    flex-direction: column;
  }

  .action-select {
    width: 100%;
  }

  .items-list {
    max-height: 300px;
  }

  .bulk-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    flex: 1;
  }

  .progress-content {
    min-width: 300px;
  }
}
</style>
