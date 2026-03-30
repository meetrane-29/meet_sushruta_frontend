<template>
  <div class="detailed-metrics">
    <div v-if="loading" class="loading">
      <p>Loading detailed metrics...</p>
    </div>
    <div v-else-if="stats || revenue || outcomes" class="metrics-content">
      <div class="metrics-sections">
        <!-- Doctor Statistics Section -->
        <section class="metrics-section" v-if="stats">
          <h3>📊 Doctor Statistics</h3>
          <div class="metrics-cards">
            <div class="metric-card">
              <span class="metric-label">Total Appointments</span>
              <span class="metric-value">{{ stats.totalAppointments || 0 }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Completion Rate</span>
              <span class="metric-value">{{ (stats.completionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Total Patients</span>
              <span class="metric-value">{{ stats.totalPatients || 0 }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Total Prescriptions</span>
              <span class="metric-value">{{ stats.totalPrescriptions || 0 }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Total Lab Orders</span>
              <span class="metric-value">{{ stats.totalLabOrders || 0 }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Total Admissions</span>
              <span class="metric-value">{{ stats.totalAdmissions || 0 }}</span>
            </div>
          </div>
        </section>

        <!-- Revenue Section -->
        <section class="metrics-section" v-if="revenue">
          <h3>💵 Revenue Metrics</h3>
          <div class="metrics-cards">
            <div class="metric-card revenue-card">
              <span class="metric-label">Total Revenue</span>
              <span class="metric-value">₹{{ formatNumber(revenue.totalRevenue || 0) }}</span>
            </div>
            <div class="metric-card revenue-card">
              <span class="metric-label">Outstanding Bills</span>
              <span class="metric-value">₹{{ formatNumber(revenue.outstandingBills || 0) }}</span>
            </div>
            <div class="metric-card revenue-card">
              <span class="metric-label">Collection Rate</span>
              <span class="metric-value">{{ (revenue.collectionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric-card revenue-card">
              <span class="metric-label">Paid Amount</span>
              <span class="metric-value">₹{{ formatNumber((revenue.totalRevenue || 0) - (revenue.outstandingBills || 0)) }}</span>
            </div>
          </div>
        </section>

        <!-- Patient Outcomes Section -->
        <section class="metrics-section" v-if="outcomes">
          <h3>🏥 Patient Outcomes</h3>
          <div class="metrics-cards">
            <div class="metric-card outcome-card">
              <span class="metric-label">Discharge Rate</span>
              <span class="metric-value">{{ (outcomes.dischargeRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric-card outcome-card">
              <span class="metric-label">Avg Length of Stay</span>
              <span class="metric-value">{{ (outcomes.averageLengthOfStay || 0).toFixed(1) }} days</span>
            </div>
            <div class="metric-card outcome-card">
              <span class="metric-label">Current Admissions</span>
              <span class="metric-value">{{ outcomes.currentAdmissions || 0 }}</span>
            </div>
            <div class="metric-card outcome-card">
              <span class="metric-label">Patient Satisfaction</span>
              <span class="metric-value">{{ (outcomes.patientSatisfactionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric-card outcome-card">
              <span class="metric-label">Readmission Rate</span>
              <span class="metric-value">{{ (outcomes.readmissionRate || 0).toFixed(1) }}%</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Comparative Insights -->
      <div class="insights-box">
        <h3>📈 Key Insights & Recommendations</h3>
        <ul class="insights-list">
          <li v-if="(stats?.completionRate || 0) > 80" class="insight-good">
            ✅ <strong>Excellent Completion Rate:</strong> {{ (stats.completionRate || 0).toFixed(1) }}% - Keep up the good work!
          </li>
          <li v-else-if="(stats?.completionRate || 0) > 60" class="insight-warning">
            ⚠️ <strong>Moderate Completion Rate:</strong> {{ (stats.completionRate || 0).toFixed(1) }}% - Consider ways to improve
          </li>
          
          <li v-if="(revenue?.collectionRate || 0) > 75" class="insight-good">
            ✅ <strong>Strong Collection Rate:</strong> {{ (revenue.collectionRate || 0).toFixed(1) }}% - Revenue management is effective
          </li>
          <li v-else class="insight-warning">
            ⚠️ <strong>Collection Rate:</strong> {{ (revenue.collectionRate || 0).toFixed(1) }}% - Follow up on outstanding bills
          </li>

          <li v-if="(outcomes?.patientSatisfactionRate || 0) > 85" class="insight-good">
            ✅ <strong>High Patient Satisfaction:</strong> {{ (outcomes.patientSatisfactionRate || 0).toFixed(1) }}% - Excellent patient care
          </li>
          <li v-else class="insight-warning">
            ⚠️ <strong>Patient Satisfaction:</strong> {{ (outcomes.patientSatisfactionRate || 0).toFixed(1) }}% - Work on improving patient experience
          </li>

          <li v-if="(outcomes?.dischargeRate || 0) > 70" class="insight-good">
            ✅ <strong>Good Discharge Rate:</strong> {{ (outcomes.dischargeRate || 0).toFixed(1) }}% - Efficient IPD management
          </li>

          <li class="insight-neutral">
            📊 <strong>Patient Load:</strong> You're managing {{ stats?.totalPatients || 0 }} patients with {{ stats?.totalAppointments || 0 }} appointments
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="no-data">
      <p>No detailed metrics available</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: false,
  },
  revenue: {
    type: Object,
    required: false,
  },
  outcomes: {
    type: Object,
    required: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function formatNumber(num) {
  if (!num) return '0';
  return Math.floor(num).toLocaleString('en-IN');
}
</script>

<style scoped>
.detailed-metrics {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.metrics-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-section {
  padding: 20px;
  background: white;
  border-radius: 10px;
  border-left: 4px solid #4f46e5;
}

.metrics-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 8px;
  border-left: 3px solid #4f46e5;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.1);
}

.metric-card.revenue-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left-color: #f59e0b;
}

.metric-card.outcome-card {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-left-color: #22c55e;
}

.metric-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

/* Insights Box */
.insights-box {
  padding: 20px;
  background: linear-gradient(135deg, #f9fce8 0%, #f0fdf4 100%);
  border-radius: 10px;
  border-left: 4px solid #22c55e;
}

.insights-box h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.insights-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insights-list li {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  background: white;
  border-left: 3px solid #22c55e;
}

.insights-list li.insight-good {
  border-left-color: #22c55e;
  color: #15803d;
}

.insights-list li.insight-warning {
  border-left-color: #f59e0b;
  color: #b45309;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.5), transparent);
}

.insights-list li.insight-neutral {
  border-left-color: #4f46e5;
  color: #4c1d95;
}

.insights-list strong {
  font-weight: 600;
}

@media (max-width: 768px) {
  .metrics-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .metrics-section {
    padding: 16px;
  }

  .metric-card {
    padding: 12px;
  }

  .metric-value {
    font-size: 18px;
  }
}
</style>
