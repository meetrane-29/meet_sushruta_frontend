<template>
  <div class="outcomes-chart">
    <div v-if="loading" class="loading">
      <p>Loading patient outcomes...</p>
    </div>
    <div v-else-if="outcomes" class="outcomes-display">
      <!-- Discharge Rate -->
      <div class="outcome-metric">
        <h4>Discharge Rate</h4>
        <div class="metric-bar">
          <div class="metric-fill" :style="{ width: (outcomes.dischargeRate || 0) + '%' }"></div>
        </div>
        <div class="metric-info">
          <span class="rate">{{ (outcomes.dischargeRate || 0).toFixed(1) }}%</span>
          <span class="detail">{{ outcomes.totalDischarges || 0 }} patients discharged</span>
        </div>
      </div>

      <!-- Length of Stay -->
      <div class="outcome-metric">
        <h4>Average Length of Stay</h4>
        <div class="los-display">
          <span class="los-value">{{ (outcomes.averageLengthOfStay || 0).toFixed(1) }}</span>
          <span class="los-unit">days</span>
        </div>
        <p class="metric-detail">Average admission duration</p>
      </div>

      <!-- Satisfaction Rate -->
      <div class="outcome-metric">
        <h4>Patient Satisfaction</h4>
        <div class="metric-bar">
          <div class="metric-fill satisfaction" :style="{ width: (outcomes.patientSatisfactionRate || 0) + '%' }"></div>
        </div>
        <div class="metric-info">
          <span class="rate">{{ (outcomes.patientSatisfactionRate || 0).toFixed(1) }}%</span>
          <span class="detail">Based on patient ratings</span>
        </div>
      </div>

      <!-- Current Admissions -->
      <div class="admission-grid">
        <div class="admission-card current">
          <div class="admission-icon">🏥</div>
          <div class="admission-content">
            <p class="admission-label">Currently Admitted</p>
            <p class="admission-count">{{ outcomes.currentAdmissions || 0 }}</p>
          </div>
        </div>

        <div class="admission-card readmission">
          <div class="admission-icon">🔄</div>
          <div class="admission-content">
            <p class="admission-label">Readmission Rate</p>
            <p class="admission-count">{{ (outcomes.readmissionRate || 0).toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <!-- Outcome Categories (if available) -->
      <div v-if="outcomes.outcomeCategories && outcomes.outcomeCategories.length" class="categories-section">
        <h4>Discharge Outcomes</h4>
        <div class="categories-grid">
          <div v-for="category in outcomes.outcomeCategories" :key="category.name" class="category-item">
            <div class="category-badge" :class="getCategoryClass(category.name)">
              {{ getCategoryIcon(category.name) }}
            </div>
            <div class="category-info">
              <p class="category-name">{{ category.name }}</p>
              <p class="category-count">{{ category.count }} patients</p>
              <div class="category-bar">
                <div class="category-fill" :style="{ width: (category.percentage || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <p>No patient outcome data available</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  outcomes: {
    type: Object,
    required: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function getCategoryIcon(category) {
  const icons = {
    'Recovered': '✅',
    'Improved': '📈',
    'Stable': '⚖️',
    'Transferred': '🚑',
    'Discharged': '🏠',
    'LAMA': '🚶',
    'Expired': '⚪',
  };
  return icons[category] || '•';
}

function getCategoryClass(category) {
  const classes = {
    'Recovered': 'recovered',
    'Improved': 'improved',
    'Stable': 'stable',
    'Transferred': 'transferred',
    'Discharged': 'discharged',
    'LAMA': 'lama',
    'Expired': 'expired',
  };
  return classes[category] || '';
}
</script>

<style scoped>
.outcomes-chart {
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.outcomes-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.outcome-metric {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4f8 100%);
  border-radius: 10px;
  border-left: 4px solid #4f46e5;
}

.outcome-metric h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.metric-bar {
  width: 100%;
  height: 10px;
  background: rgba(79, 70, 229, 0.15);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #2563eb);
  transition: width 0.3s ease;
}

.metric-fill.satisfaction {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.metric-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rate {
  font-size: 18px;
  font-weight: bold;
  color: #4f46e5;
}

.detail {
  font-size: 12px;
  color: #666;
}

.metric-detail {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
}

/* LOS Display */
.los-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0;
}

.los-value {
  font-size: 32px;
  font-weight: bold;
  color: #4f46e5;
}

.los-unit {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

/* Admission Grid */
.admission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.admission-card {
  padding: 16px;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-left: 4px solid;
}

.admission-card.current {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left-color: #f59e0b;
}

.admission-card.readmission {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left-color: #3b82f6;
}

.admission-icon {
  font-size: 24px;
}

.admission-content {
  flex: 1;
}

.admission-label {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.admission-count {
  margin: 4px 0 0 0;
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

/* Categories Section */
.categories-section {
  padding: 16px;
  background: linear-gradient(135deg, #f8fce8 0%, #f0fdf4 100%);
  border-radius: 10px;
  border-left: 4px solid #22c55e;
}

.categories-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.category-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.category-badge {
  font-size: 24px;
  min-width: 32px;
  text-align: center;
}

.category-info {
  flex: 1;
}

.category-name {
  margin: 0;
  font-size: 13px;
  color: #555;
  font-weight: 600;
}

.category-count {
  margin: 2px 0;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
}

.category-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
</style>
