<template>
  <div class="trends-chart">
    <div v-if="loading" class="loading">
      <p>Loading trends...</p>
    </div>
    <div v-else-if="trends && trends.length > 0" class="chart-content">
      <div class="legend">
        <div class="legend-item scheduled">📅 Scheduled</div>
        <div class="legend-item completed">✅ Completed</div>
        <div class="legend-item cancelled">❌ Cancelled</div>
        <div class="legend-item no-show">⏭️ No-Show</div>
      </div>
      
      <table class="trends-table">
        <thead>
          <tr>
            <th>Date</th>
            <th class="scheduled">Scheduled</th>
            <th class="completed">Completed</th>
            <th class="cancelled">Cancelled</th>
            <th class="no-show">No-Show</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trend in trends.slice(0, 7)" :key="trend.date">
            <td class="date">{{ formatDate(trend.date) }}</td>
            <td class="scheduled">{{ trend.scheduledCount || 0 }}</td>
            <td class="completed">{{ trend.completedCount || 0 }}</td>
            <td class="cancelled">{{ trend.cancelledCount || 0 }}</td>
            <td class="no-show">{{ trend.noShowCount || 0 }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-label">Total Appointments</div>
          <div class="stat-value">{{ totalAppointments }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Completion Rate</div>
          <div class="stat-value">{{ completionRate }}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">Cancellation Rate</div>
          <div class="stat-value">{{ cancellationRate }}%</div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <p>No appointment trends data available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  trends: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

const totalAppointments = computed(() => {
  return props.trends.reduce((sum, t) => sum + (t.scheduledCount || 0), 0);
});

const completionRate = computed(() => {
  if (totalAppointments.value === 0) return 0;
  const completed = props.trends.reduce((sum, t) => sum + (t.completedCount || 0), 0);
  return Math.round((completed / totalAppointments.value) * 100);
});

const cancellationRate = computed(() => {
  if (totalAppointments.value === 0) return 0;
  const cancelled = props.trends.reduce((sum, t) => sum + (t.cancelledCount || 0), 0);
  return Math.round((cancelled / totalAppointments.value) * 100);
});
</script>

<style scoped>
.trends-chart {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend {
  display: flex;
  gap: 20px;
  font-size: 14px;
  flex-wrap: wrap;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.legend-item.scheduled {
  color: #4f46e5;
}

.legend-item.completed {
  color: #22c55e;
}

.legend-item.cancelled {
  color: #ef4444;
}

.legend-item.no-show {
  color: #f59e0b;
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
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.trends-table th:first-child,
.trends-table td:first-child {
  text-align: left;
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

.trends-table td.date {
  font-weight: 500;
  color: #2c3e50;
}

.trends-table th.scheduled,
.trends-table td.scheduled {
  color: #4f46e5;
  font-weight: 600;
}

.trends-table th.completed,
.trends-table td.completed {
  color: #22c55e;
  font-weight: 600;
}

.trends-table th.cancelled,
.trends-table td.cancelled {
  color: #ef4444;
  font-weight: 600;
}

.trends-table th.no-show,
.trends-table td.no-show {
  color: #f59e0b;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 8px;
}

.stat {
  text-align: center;
  padding: 8px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #4f46e5;
}
</style>
