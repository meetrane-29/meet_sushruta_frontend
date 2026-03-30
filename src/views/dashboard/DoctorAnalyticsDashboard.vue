<template>
  <div class="doctor-analytics-dashboard">
    <div class="dashboard-header">
      <h1>📊 Doctor Analytics & Reports</h1>
      <div class="date-range-selector">
        <input 
          v-model="selectedDateRange.from" 
          type="date" 
          class="date-input"
          @change="updateAnalytics"
        >
        <span class="date-separator">to</span>
        <input 
          v-model="selectedDateRange.to" 
          type="date" 
          class="date-input"
          @change="updateAnalytics"
        >
        <select v-model="selectedPeriod" @change="updateAnalytics" class="period-select">
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>

    <ErrorMessage v-if="error" :message="error" />

    <div v-if="loading" class="loading-state">
      <p>⏳ Loading analytics...</p>
    </div>

    <div v-else class="analytics-container">
      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card appointments">
          <div class="metric-icon">📅</div>
          <div class="metric-content">
            <h3>Total Appointments</h3>
            <p class="metric-value">{{ doctorStats?.totalAppointments || 0 }}</p>
            <p class="metric-label">This period</p>
          </div>
        </div>

        <div class="metric-card completion">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <h3>Completion Rate</h3>
            <p class="metric-value">{{ doctorStats?.completionRate || 0 }}%</p>
            <p class="metric-label">Completed appointments</p>
          </div>
        </div>

        <div class="metric-card patients">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <h3>Total Patients</h3>
            <p class="metric-value">{{ doctorStats?.totalPatients || 0 }}</p>
            <p class="metric-label">Unique patients</p>
          </div>
        </div>

        <div class="metric-card revenue">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>Revenue</h3>
            <p class="metric-value">₹{{ formatNumber(revenueStats?.totalRevenue || 0) }}</p>
            <p class="metric-label">This period</p>
          </div>
        </div>
      </div>

      <!-- Secondary Metrics -->
      <div class="metrics-grid">
        <div class="metric-card prescriptions">
          <div class="metric-icon">💊</div>
          <div class="metric-content">
            <h3>Total Prescriptions</h3>
            <p class="metric-value">{{ doctorStats?.totalPrescriptions || 0 }}</p>
            <p class="metric-label">Issued</p>
          </div>
        </div>

        <div class="metric-card labs">
          <div class="metric-icon">🧪</div>
          <div class="metric-content">
            <h3>Lab Orders</h3>
            <p class="metric-value">{{ doctorStats?.totalLabOrders || 0 }}</p>
            <p class="metric-label">Ordered</p>
          </div>
        </div>

        <div class="metric-card admissions">
          <div class="metric-icon">🏥</div>
          <div class="metric-content">
            <h3>Total Admissions</h3>
            <p class="metric-value">{{ doctorStats?.totalAdmissions || 0 }}</p>
            <p class="metric-label">IPD patients</p>
          </div>
        </div>

        <div class="metric-card outstanding">
          <div class="metric-icon">📝</div>
          <div class="metric-content">
            <h3>Outstanding Bills</h3>
            <p class="metric-value">₹{{ formatNumber(revenueStats?.outstandingBills || 0) }}</p>
            <p class="metric-label">Unpaid</p>
          </div>
        </div>
      </div>

      <!-- Performance Metrics Section -->
      <div class="section performance-metrics">
        <h2>📈 Patient Outcomes & Performance</h2>
        <div v-if="patientOutcomes" class="metrics-detail-grid">
          <div class="detail-metric">
            <h4>Discharge Rate</h4>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (patientOutcomes.dischargeRate || 0) + '%' }"></div>
            </div>
            <p class="percentage">{{ (patientOutcomes.dischargeRate || 0).toFixed(1) }}%</p>
            <p class="count">{{ patientOutcomes.totalDischarges || 0 }} discharged</p>
          </div>

          <div class="detail-metric">
            <h4>Average Length of Stay</h4>
            <p class="metric-highlight">{{ (patientOutcomes.averageLengthOfStay || 0).toFixed(1) }} days</p>
            <p class="count">Average admission duration</p>
          </div>

          <div class="detail-metric">
            <h4>Current Admissions</h4>
            <div class="case-count">{{ patientOutcomes.currentAdmissions || 0 }}</div>
            <p class="label">Patients admitted now</p>
          </div>

          <div class="detail-metric">
            <h4>Patient Satisfaction</h4>
            <div class="progress-bar">
              <div class="progress-fill satisfaction" :style="{ width: (patientOutcomes.patientSatisfactionRate || 0) + '%' }"></div>
            </div>
            <p class="percentage">{{ (patientOutcomes.patientSatisfactionRate || 0).toFixed(1) }}%</p>
            <p class="count">Based on ratings</p>
          </div>
        </div>
      </div>

      <!-- Appointment Trends Section -->
      <div class="section trends-section">
        <h2>📊 Appointment Trends</h2>
        <div v-if="appointmentTrends && appointmentTrends.length > 0" class="trends-container">
          <table class="trends-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Scheduled</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>No-Show</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trend in appointmentTrends.slice(0, 10)" :key="trend.date">
                <td>{{ formatDate(trend.date) }}</td>
                <td class="scheduled">{{ trend.scheduledCount || 0 }}</td>
                <td class="completed">{{ trend.completedCount || 0 }}</td>
                <td class="cancelled">{{ trend.cancelledCount || 0 }}</td>
                <td class="no-show">{{ trend.noShowCount || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lab Completion Metrics -->
      <div class="section lab-metrics-section">
        <h2>🧪 Lab Completion Metrics</h2>
        <div v-if="labMetrics" class="lab-metrics-grid">
          <div class="lab-metric">
            <h4>Completion Rate</h4>
            <div class="progress-bar">
              <div class="progress-fill lab" :style="{ width: (labMetrics.completionRate || 0) + '%' }"></div>
            </div>
            <p class="percentage">{{ (labMetrics.completionRate || 0).toFixed(1) }}%</p>
          </div>

          <div class="lab-metric">
            <h4>Average Turnaround</h4>
            <p class="metric-highlight">{{ (labMetrics.averageTurnaroundTime || 0).toFixed(1) }} hrs</p>
            <p class="label">Average completion time</p>
          </div>

          <div class="lab-metric">
            <h4>Pending Tests</h4>
            <p class="metric-highlight">{{ labMetrics.pendingCount || 0 }}</p>
            <p class="label">Awaiting results</p>
          </div>

          <div class="lab-metric">
            <h4>Completed Tests</h4>
            <p class="metric-highlight">{{ labMetrics.completedCount || 0 }}</p>
            <p class="label">Successfully completed</p>
          </div>
        </div>
      </div>

      <!-- Revenue Collection -->
      <div class="section revenue-section">
        <h2>💵 Revenue Analysis</h2>
        <div v-if="revenueStats" class="revenue-grid">
          <div class="revenue-item">
            <h4>Total Revenue</h4>
            <p class="revenue-value">₹{{ formatNumber(revenueStats.totalRevenue || 0) }}</p>
          </div>
          <div class="revenue-item">
            <h4>Paid Amount</h4>
            <p class="revenue-value">₹{{ formatNumber((revenueStats.totalRevenue || 0) - (revenueStats.outstandingBills || 0)) }}</p>
          </div>
          <div class="revenue-item">
            <h4>Outstanding Bills</h4>
            <p class="revenue-value">₹{{ formatNumber(revenueStats.outstandingBills || 0) }}</p>
          </div>
          <div class="revenue-item">
            <h4>Collection Rate</h4>
            <p class="revenue-value">{{ (revenueStats.collectionRate || 0).toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="section export-section">
        <h2>📥 Export Reports</h2>
        <div class="export-buttons">
          <button @click="exportAppointmentsExcel" class="export-btn excel">
            📊 Export Appointments (Excel)
          </button>
          <button @click="exportPrescriptionsExcel" class="export-btn excel">
            💊 Export Prescriptions (Excel)
          </button>
          <button @click="exportLabOrdersExcel" class="export-btn excel">
            🧪 Export Lab Orders (Excel)
          </button>
          <button @click="printReport" class="export-btn print">
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import ErrorMessage from '@/components/shared/ErrorMessage.vue';


export default {
  name: 'DoctorAnalyticsDashboard',
  components: {
    ErrorMessage,
  },
  setup() {
    const { get } = useApi();
    const route = useRoute();
    const loading = ref(true);
    const error = ref(null);
    const selectedPeriod = ref('month');
    
    // Date range
    const selectedDateRange = ref({
      from: getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      to: getDateString(new Date())
    });

    // Analytics data
    const doctorStats = ref(null);
    const appointmentTrends = ref([]);
    const labMetrics = ref(null);
    const patientOutcomes = ref(null);
    const revenueStats = ref(null);

    function getDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function formatNumber(num) {
      return Math.floor(num).toLocaleString('en-IN');
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN');
      } catch {
        return dateStr;
      }
    }

    const fetchAnalytics = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Get doctor ID from localStorage or route
        const doctorId = localStorage.getItem('doctorId') || route.params.doctor_id;
        
        if (!doctorId) {
          throw new Error('Doctor ID not found. Please log in again.');
        }

        // Fetch all analytics in parallel
        const [statsRes, trendsRes, labRes, outcomeRes, revenueRes] = await Promise.allSettled([
          get(`/api/v1/advanced-analytics/doctors/${doctorId}/statistics`),
          get(`/api/v1/advanced-analytics/appointments/trends?from_date=${selectedDateRange.value.from}&to_date=${selectedDateRange.value.to}&group_by=day`),
          get(`/api/v1/advanced-analytics/lab/completion?time_range=30`),
          get(`/api/v1/advanced-analytics/patients/outcomes`),
          get(`/api/v1/advanced-analytics/doctors/${doctorId}/revenue?from_date=${selectedDateRange.value.from}&to_date=${selectedDateRange.value.to}`)
        ]);

        // Handle results
        if (statsRes.status === 'fulfilled') doctorStats.value = statsRes.value?.data;
        if (trendsRes.status === 'fulfilled') appointmentTrends.value = trendsRes.value?.data || [];
        if (labRes.status === 'fulfilled') labMetrics.value = labRes.value?.data;
        if (outcomeRes.status === 'fulfilled') patientOutcomes.value = outcomeRes.value?.data;
        if (revenueRes.status === 'fulfilled') revenueStats.value = revenueRes.value?.data;

      } catch (err) {
        console.error('Analytics error:', err);
        error.value = err.message || 'Failed to load analytics data';
      } finally {
        loading.value = false;
      }
    };

    const updateAnalytics = () => {
      fetchAnalytics();
    };

    const exportAppointmentsExcel = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        window.open(`/api/v1/exports/appointments/excel?doctor_id=${doctorId}&from_date=${selectedDateRange.value.from}&to_date=${selectedDateRange.value.to}`, '_blank');
      } catch (err) {
        console.error('Export error:', err);
      }
    };

    const exportPrescriptionsExcel = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        window.open(`/api/v1/exports/prescriptions/excel?doctor_id=${doctorId}&from_date=${selectedDateRange.value.from}&to_date=${selectedDateRange.value.to}`, '_blank');
      } catch (err) {
        console.error('Export error:', err);
      }
    };

    const exportLabOrdersExcel = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        window.open(`/api/v1/exports/lab-orders/excel?doctor_id=${doctorId}&from_date=${selectedDateRange.value.from}&to_date=${selectedDateRange.value.to}`, '_blank');
      } catch (err) {
        console.error('Export error:', err);
      }
    };

    const printReport = () => {
      window.print();
    };

    onMounted(() => {
      fetchAnalytics();
    });

    return {
      loading,
      error,
      selectedPeriod,
      selectedDateRange,
      doctorStats,
      appointmentTrends,
      labMetrics,
      patientOutcomes,
      revenueStats,
      updateAnalytics,
      exportAppointmentsExcel,
      exportPrescriptionsExcel,
      exportLabOrdersExcel,
      printReport,
      formatNumber,
      formatDate,
    };
  },
};
</script>

<style scoped>
.doctor-analytics-dashboard {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #d4e0f7 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 15px;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.date-range-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.date-input,
.period-select {
  padding: 8px 12px;
  border: 2px solid #e0e7ff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  background: white;
}

.date-input:focus,
.period-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.date-separator {
  color: #999;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.analytics-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 10px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 15px;
  align-items: center;
  border-left: 5px solid #4f46e5;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.metric-card.completion {
  border-left-color: #22c55e;
}

.metric-card.patients {
  border-left-color: #8b5cf6;
}

.metric-card.revenue {
  border-left-color: #f59e0b;
}

.metric-card.prescriptions {
  border-left-color: #ec4899;
}

.metric-card.labs {
  border-left-color: #06b6d4;
}

.metric-card.admissions {
  border-left-color: #ef4444;
}

.metric-card.outstanding {
  border-left-color: #f97316;
}

.metric-icon {
  font-size: 32px;
  min-width: 50px;
  text-align: center;
}

.metric-content h3 {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
}

.metric-label {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #aaa;
}

/* Sections */
.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.section:hover {
  transform: translateY(-2px);
}

.section h2 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 20px 0;
  border-bottom: 3px solid #f0f4f8;
  padding-bottom: 12px;
}

/* Performance Metrics Grid */
.metrics-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-metric {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 10px;
  border-left: 4px solid #4f46e5;
}

.detail-metric h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #2563eb);
  transition: width 0.3s ease;
}

.progress-fill.satisfaction {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.progress-fill.lab {
  background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.percentage {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.count {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #aaa;
}

.metric-highlight {
  font-size: 24px;
  font-weight: bold;
  color: #4f46e5;
  margin: 10px 0;
}

.case-count {
  font-size: 32px;
  font-weight: bold;
  color: #4f46e5;
  margin: 10px 0;
}

.label {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #aaa;
}

/* Trends Table */
.trends-container {
  overflow-x: auto;
}

.trends-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.trends-table thead {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
}

.trends-table th,
.trends-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.trends-table th {
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.trends-table tbody tr:hover {
  background: #f9fafb;
}

.trends-table td.scheduled {
  color: #4f46e5;
  font-weight: 600;
}

.trends-table td.completed {
  color: #22c55e;
  font-weight: 600;
}

.trends-table td.cancelled {
  color: #ef4444;
  font-weight: 600;
}

.trends-table td.no-show {
  color: #f59e0b;
  font-weight: 600;
}

/* Lab Metrics Grid */
.lab-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.lab-metric {
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f5ff 100%);
  border-radius: 10px;
  border-left: 4px solid #06b6d4;
  text-align: center;
}

.lab-metric h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #555;
  font-weight: 600;
}

/* Revenue Grid */
.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.revenue-item {
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
  border-left: 4px solid #f59e0b;
  text-align: center;
}

.revenue-item h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.revenue-value {
  font-size: 22px;
  font-weight: bold;
  color: #d97706;
  margin: 0;
}

/* Export Buttons */
.export-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.export-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.export-btn.excel {
  background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
  color: white;
}

.export-btn.excel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
}

.export-btn.print {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.export-btn.print:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-header h1 {
    width: 100%;
  }

  .date-range-selector {
    width: 100%;
    justify-content: flex-start;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .metrics-detail-grid {
    grid-template-columns: 1fr;
  }

  .export-buttons {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    padding: 12px;
  }

  .dashboard-header h1 {
    font-size: 22px;
  }

  .metric-card {
    padding: 12px;
  }

  .metric-icon {
    font-size: 24px;
  }

  .metric-value {
    font-size: 20px;
  }
}
</style>
  color: white;
  text-align: center;

.stat-box:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-box:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-box:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-box h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  text-transform: uppercase;
  opacity: 0.9;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
}

/* Export Section */
.export-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.export-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn.pdf {
  background: #ff7675;
  color: white;
}

.export-btn.pdf:hover {
  background: #d63031;
  transform: translateY(-2px);
}

.export-btn.excel {
  background: #00b894;
  color: white;
}

.export-btn.excel:hover {
  background: #00a383;
  transform: translateY(-2px);
}

.export-btn.print {
  background: #0984e3;
  color: white;
}

.export-btn.print:hover {
  background: #0770c9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metrics-detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .export-buttons {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
  }
}

@media print {
  .dashboard-header,
  .export-section,
  .period-select {
    display: none;
  }

  .analytics-container {
    gap: 10px;
  }

  .section {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
