<template>
  <div class="performance-summary">
    <div v-if="loading" class="loading">
      <p>Loading performance data...</p>
    </div>
    <div v-else-if="stats || outcomes" class="summary-display">
      <!-- Performance Indicators -->
      <div class="indicators-grid">
        <!-- Appointment Efficiency -->
        <div class="indicator">
          <div class="indicator-header">
            <h4>Appointment Efficiency</h4>
            <span class="indicator-badge good">Good</span>
          </div>
          <div class="indicator-metrics">
            <div class="metric">
              <span class="label">Completion Rate</span>
              <span class="value">{{ (stats?.completionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric">
              <span class="label">Total Appts</span>
              <span class="value">{{ stats?.totalAppointments || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Patient Care -->
        <div class="indicator">
          <div class="indicator-header">
            <h4>Patient Care Quality</h4>
            <span class="indicator-badge excellent">Excellent</span>
          </div>
          <div class="indicator-metrics">
            <div class="metric">
              <span class="label">Patient Satisfaction</span>
              <span class="value">{{ (outcomes?.patientSatisfactionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="metric">
              <span class="label">Discharge Rate</span>
              <span class="value">{{ (outcomes?.dischargeRate || 0).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <!-- Prescription Practices -->
        <div class="indicator">
          <div class="indicator-header">
            <h4>Prescription Practices</h4>
            <span class="indicator-badge good">Good</span>
          </div>
          <div class="indicator-metrics">
            <div class="metric">
              <span class="label">Total Prescriptions</span>
              <span class="value">{{ stats?.totalPrescriptions || 0 }}</span>
            </div>
            <div class="metric">
              <span class="label">Avg per Patient</span>
              <span class="value">{{ prescriptionsPerPatient }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Performance Score -->
      <div class="performance-score">
        <div class="score-circle">
          <div class="score-value">{{ overallScore }}</div>
          <div class="score-label">Overall Score</div>
        </div>
        <div class="score-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">Appointments</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" :style="{ width: '85%' }"></div>
            </div>
            <span class="breakdown-value">85/100</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Patient Care</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" :style="{ width: '92%' }"></div>
            </div>
            <span class="breakdown-value">92/100</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Lab Orders</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" :style="{ width: '78%' }"></div>
            </div>
            <span class="breakdown-value">78/100</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Revenue</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" :style="{ width: '88%' }"></div>
            </div>
            <span class="breakdown-value">88/100</span>
          </div>
        </div>
      </div>

      <!-- Key Insights -->
      <div class="insights-section">
        <h4>Key Performance Insights</h4>
        <div class="insights-list">
          <div class="insight good">
            <span class="insight-icon">✅</span>
            <span class="insight-text">Strong patient satisfaction at {{ (outcomes?.patientSatisfactionRate || 0).toFixed(1) }}%</span>
          </div>
          <div class="insight good">
            <span class="insight-icon">✅</span>
            <span class="insight-text">High appointment completion rate at {{ (stats?.completionRate || 0).toFixed(1) }}%</span>
          </div>
          <div v-if="(outcomes?.averageLengthOfStay || 0) > 5" class="insight warning">
            <span class="insight-icon">⚠️</span>
            <span class="insight-text">Average stay is {{ (outcomes?.averageLengthOfStay || 0).toFixed(1) }} days - monitor for efficiency</span>
          </div>
          <div v-if="prescriptionsPerPatient > 3" class="insight warning">
            <span class="insight-icon">⚠️</span>
            <span class="insight-text">Average {{ prescriptionsPerPatient }} prescriptions per patient</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <p>No performance data available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: {
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

const prescriptionsPerPatient = computed(() => {
  if (!props.stats || props.stats.totalPatients === 0) return 0;
  return (props.stats.totalPrescriptions / props.stats.totalPatients).toFixed(1);
});

const overallScore = computed(() => {
  let score = 0;
  let count = 0;

  if (props.stats?.completionRate) {
    score += (props.stats.completionRate / 100) * 100;
    count++;
  }

  if (props.outcomes?.patientSatisfactionRate) {
    score += (props.outcomes.patientSatisfactionRate / 100) * 100;
    count++;
  }

  if (props.outcomes?.dischargeRate) {
    score += (props.outcomes.dischargeRate / 100) * 100;
    count++;
  }

  if (count === 0) return 0;
  return Math.round(score / count);
});
</script>

<style scoped>
.performance-summary {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.summary-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Indicators Grid */
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.indicator {
  padding: 16px;
  background: white;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.indicator:hover {
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.indicator-header h4 {
  margin: 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.indicator-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.indicator-badge.good {
  background: #dcfce7;
  color: #16a34a;
}

.indicator-badge.excellent {
  background: #c7f0d8;
  color: #065f46;
}

.indicator-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric .label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.metric .value {
  font-size: 16px;
  font-weight: bold;
  color: #4f46e5;
}

/* Performance Score */
.performance-score {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 10px;
  border-left: 4px solid #4f46e5;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
  align-items: start;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.score-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  font-weight: 600;
}

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.breakdown-label {
  min-width: 90px;
  color: #555;
  font-weight: 600;
}

.breakdown-bar {
  flex: 1;
  height: 6px;
  background: rgba(79, 70, 229, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #2563eb);
}

.breakdown-value {
  min-width: 50px;
  text-align: right;
  color: #666;
  font-weight: 600;
}

/* Insights Section */
.insights-section {
  padding: 16px;
  background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%);
  border-radius: 10px;
  border-left: 4px solid #f59e0b;
}

.insights-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insight {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 13px;
}

.insight-icon {
  font-size: 18px;
  min-width: 24px;
}

.insight.good {
  border-left: 3px solid #22c55e;
}

.insight.warning {
  border-left: 3px solid #f59e0b;
}

.insight-text {
  color: #555;
  flex: 1;
}

@media (max-width: 768px) {
  .performance-score {
    grid-template-columns: 1fr;
  }

  .indicators-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .indicators-grid {
    grid-template-columns: 1fr;
  }

  .score-circle {
    width: 80px;
    height: 80px;
  }

  .score-value {
    font-size: 28px;
  }
}
</style>
