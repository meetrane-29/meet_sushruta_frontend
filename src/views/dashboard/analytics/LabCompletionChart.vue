<template>
  <div class="lab-chart">
    <div v-if="loading" class="loading">
      <p>Loading lab metrics...</p>
    </div>
    <div v-else-if="metrics" class="metrics-display">
      <!-- Completion Rate Bar -->
      <div class="metric-section">
        <div class="metric-header">
          <h4>Completion Rate</h4>
          <span class="percentage">{{ (metrics.completionRate || 0).toFixed(1) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (metrics.completionRate || 0) + '%' }"></div>
        </div>
        <p class="metric-detail">{{ metrics.completedCount || 0 }} of {{ (metrics.completedCount || 0) + (metrics.pendingCount || 0) }} tests completed</p>
      </div>

      <!-- Test Status Grid -->
      <div class="test-status-grid">
        <div class="status-card completed">
          <div class="status-icon">✅</div>
          <div class="status-info">
            <p class="status-label">Completed</p>
            <p class="status-count">{{ metrics.completedCount || 0 }}</p>
          </div>
        </div>

        <div class="status-card pending">
          <div class="status-icon">⏳</div>
          <div class="status-info">
            <p class="status-label">Pending</p>
            <p class="status-count">{{ metrics.pendingCount || 0 }}</p>
          </div>
        </div>

        <div class="status-card rejected">
          <div class="status-icon">❌</div>
          <div class="status-info">
            <p class="status-label">Rejected</p>
            <p class="status-count">{{ metrics.rejectedCount || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Average Turnaround Time -->
      <div class="metric-section turnaround">
        <h4>Average Turnaround Time</h4>
        <div class="turnaround-display">
          <span class="turnaround-value">{{ (metrics.averageTurnaroundTime || 0).toFixed(1) }}</span>
          <span class="turnaround-unit">hours</span>
        </div>
        <p class="metric-detail">Average time from order to completion</p>
      </div>

      <!-- Test Type Breakdown (if available) -->
      <div v-if="metrics.testTypeBreakdown && metrics.testTypeBreakdown.length" class="breakdown-section">
        <h4>Test Type Breakdown</h4>
        <div class="breakdown-list">
          <div v-for="test in metrics.testTypeBreakdown" :key="test.type" class="breakdown-item">
            <span class="test-type">{{ test.type }}</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" :style="{ width: (test.percentage || 0) + '%' }"></div>
            </div>
            <span class="test-count">{{ test.count }} tests</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <p>No lab metrics available</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metrics: {
    type: Object,
    required: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.lab-chart {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.metrics-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-section {
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f5ff 100%);
  border-radius: 10px;
  border-left: 4px solid #06b6d4;
}

.metric-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-header h4 {
  margin: 0;
}

.percentage {
  font-size: 20px;
  font-weight: bold;
  color: #06b6d4;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(6, 182, 212, 0.2);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  transition: width 0.3s ease;
}

.metric-detail {
  margin: 0;
  font-size: 12px;
  color: #666;
}

/* Test Status Grid */
.test-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.status-card {
  padding: 16px;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-left: 4px solid;
}

.status-card.completed {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-left-color: #22c55e;
}

.status-card.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left-color: #f59e0b;
}

.status-card.rejected {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-left-color: #ef4444;
}

.status-icon {
  font-size: 24px;
}

.status-info {
  flex: 1;
}

.status-label {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.status-count {
  margin: 4px 0 0 0;
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

/* Turnaround Time */
.turnaround {
  text-align: center;
}

.turnaround-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0;
}

.turnaround-value {
  font-size: 32px;
  font-weight: bold;
  color: #06b6d4;
}

.turnaround-unit {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

/* Breakdown Section */
.breakdown-section {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 10px;
}

.breakdown-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.test-type {
  min-width: 100px;
  font-weight: 600;
  color: #555;
}

.breakdown-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.test-count {
  min-width: 80px;
  text-align: right;
  color: #999;
  font-size: 12px;
}
</style>
