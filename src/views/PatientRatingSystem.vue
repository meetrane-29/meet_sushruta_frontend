<template>
  <div class="patient-rating-system">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading ratings...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="$router.go(0)" class="retry-btn">Retry</button>
    </div>

    <!-- Content -->
    <div v-if="!loading && !error">
      <div class="rating-header">
        <h1>⭐ Patient Satisfaction & Ratings</h1>
        <div class="rating-filter">
          <select v-model="selectedDoctor" @change="filterRatings" class="filter-select">
            <option value="">All Doctors</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.name || doctor.user?.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="rating-summary-cards">
      <!-- Overall Rating -->
      <div class="rating-card overall">
        <div class="rating-value">{{ overallRating.toFixed(1) }}</div>
        <div class="star-display">
          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(overallRating) }">★</span>
        </div>
        <p class="rating-label">Overall Rating</p>
        <p class="rating-count">Based on {{ totalRatings }} ratings</p>
      </div>

      <!-- Average Response Time -->
      <div class="rating-card response-time">
        <div class="metric-value">{{ averageResponseTime }}</div>
        <p class="metric-label">Avg Response</p>
        <p class="metric-unit">Time</p>
      </div>

      <!-- Patient Satisfaction -->
      <div class="rating-card satisfaction">
        <div class="metric-value">{{ satisfactionPercentage }}%</div>
        <div class="satisfaction-bar">
          <div class="satisfaction-fill" :style="{ width: satisfactionPercentage + '%' }"></div>
        </div>
        <p class="metric-label">Patient Satisfaction</p>
      </div>

      <!-- Recommendation Rate -->
      <div class="rating-card recommendation">
        <div class="metric-value">{{ recommendationRate }}%</div>
        <p class="metric-label">Would Recommend</p>
        <p class="metric-unit">To Others</p>
      </div>
    </div>

    <!-- Rating Distribution -->
    <div class="distribution-section">
      <h2>📊 Rating Distribution</h2>
      <div class="distribution-chart">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-row">
          <span class="star-label">{{ star }} ⭐</span>
          <div class="distribution-bar">
            <div class="distribution-fill" :style="{ width: (ratingCounts[star] / totalRatings * 100) + '%' }"></div>
          </div>
          <span class="count-label">{{ ratingCounts[star] }}</span>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-section">
      <h2>💬 Recent Patient Reviews</h2>
      <div class="reviews-filter">
        <button
          v-for="rating in [5, 4, 3, 2, 1]"
          :key="rating"
          :class="['filter-btn', { active: selectedRating === rating }]"
          @click="selectedRating = rating"
        >
          {{ rating }} ⭐
        </button>
        <button
          :class="['filter-btn', { active: selectedRating === 0 }]"
          @click="selectedRating = 0"
        >
          All
        </button>
      </div>

      <div class="reviews-list">
        <div v-for="review in filteredReviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <h4>{{ review.patientName }}</h4>
              <p class="review-date">{{ formatDate(review.date) }}</p>
            </div>
            <div class="review-rating">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
              <span class="rating-number">({{ review.rating }}.0)</span>
            </div>
          </div>

          <p class="review-text">{{ review.comment }}</p>

          <div class="review-categories">
            <span v-if="review.professionalism" class="category-tag professionalism">
              👨‍⚕️ Professionalism: {{ review.professionalism }}/5
            </span>
            <span v-if="review.communication" class="category-tag communication">
              💬 Communication: {{ review.communication }}/5
            </span>
            <span v-if="review.punctuality" class="category-tag punctuality">
              ⏰ Punctuality: {{ review.punctuality }}/5
            </span>
            <span v-if="review.cleanliness" class="category-tag cleanliness">
              🧼 Cleanliness: {{ review.cleanliness }}/5
            </span>
          </div>

          <div class="review-actions">
            <button @click="likeReview(review)" class="btn-like">👍 Helpful ({{ review.helpful }})</button>
            <button @click="replyToReview(review)" class="btn-reply">💬 Reply</button>
          </div>
        </div>
      </div>

      <div v-if="filteredReviews.length === 0" class="no-reviews">
        <p>No reviews found for selected rating</p>
      </div>
    </div>

    <!-- Rate Doctor Form -->
    <div class="rating-form-section">
      <h2>✍️ Leave a Rating</h2>
      <form @submit.prevent="submitRating" class="rating-form">
        <div class="form-group">
          <label>Select Doctor:</label>
          <select v-model="newRating.doctorId" required class="form-control">
            <option value="">Choose a doctor...</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Overall Rating:</label>
          <div class="star-selector">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-btn"
              :class="{ selected: newRating.rating === star }"
              @click="newRating.rating = star"
            >
              ★
            </button>
          </div>
        </div>

        <div class="form-group subcategories">
          <label>Rate Different Aspects:</label>
          <div class="subcategory-item">
            <label>Professionalism:</label>
            <div class="star-sub-selector">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-sub-btn"
                :class="{ selected: newRating.professionalism === star }"
                @click="newRating.professionalism = star"
              >
                ★
              </button>
            </div>
          </div>

          <div class="subcategory-item">
            <label>Communication:</label>
            <div class="star-sub-selector">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-sub-btn"
                :class="{ selected: newRating.communication === star }"
                @click="newRating.communication = star"
              >
                ★
              </button>
            </div>
          </div>

          <div class="subcategory-item">
            <label>Punctuality:</label>
            <div class="star-sub-selector">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-sub-btn"
                :class="{ selected: newRating.punctuality === star }"
                @click="newRating.punctuality = star"
              >
                ★
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="comment">Your Review:</label>
          <textarea
            id="comment"
            v-model="newRating.comment"
            placeholder="Share your experience with this doctor..."
            rows="5"
            class="form-control"
            maxlength="500"
          ></textarea>
          <p class="char-count">{{ newRating.comment.length }}/500</p>
        </div>

        <button type="submit" class="submit-btn">Submit Rating</button>
      </form>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

export default {
  name: 'PatientRatingSystem',
  setup() {
    const { get, post } = useApi();
    const selectedDoctor = ref('');
    const selectedRating = ref(0);
    const doctors = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Real ratings data from database
    const allRatings = ref([]);

    const newRating = ref({
      doctorId: '',
      rating: 0,
      professionalism: 0,
      communication: 0,
      punctuality: 0,
      cleanliness: 0,
      comment: '',
    });

    // Fetch doctors from database
    const fetchDoctors = async () => {
      try {
        const response = await get('/doctors');
        doctors.value = Array.isArray(response) ? response : response.data || [];
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        error.value = 'Failed to load doctors';
      }
    };

    // Fetch ratings from database
    const fetchRatings = async () => {
      try {
        loading.value = true;
        const response = await get('/ratings');
        allRatings.value = Array.isArray(response) ? response : response.data || [];
        
        // Convert date strings to Date objects
        allRatings.value = allRatings.value.map(r => ({
          ...r,
          date: typeof r.date === 'string' ? new Date(r.date) : r.date,
          createdAt: typeof r.createdAt === 'string' ? new Date(r.createdAt) : r.createdAt
        }));
      } catch (err) {
        console.error('Failed to fetch ratings:', err);
        error.value = 'Failed to load ratings';
      } finally {
        loading.value = false;
      }
    };

    const ratingCounts = computed(() => {
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      filteredAllRatings.value.forEach(r => {
        counts[r.rating]++;
      });
      return counts;
    });

    const filteredAllRatings = computed(() => {
      if (!selectedDoctor.value) {
        return allRatings.value;
      }
      return allRatings.value.filter(r => {
        const doctorId = r.doctor_id || r.doctorId;
        return doctorId === parseInt(selectedDoctor.value);
      });
    });

    const filteredReviews = computed(() => {
      if (selectedRating.value === 0) {
        return filteredAllRatings.value;
      }
      return filteredAllRatings.value.filter(r => r.rating === selectedRating.value);
    });

    const totalRatings = computed(() => filteredAllRatings.value.length);

    const overallRating = computed(() => {
      if (totalRatings.value === 0) return 0;
      const sum = filteredAllRatings.value.reduce((acc, r) => acc + r.rating, 0);
      return sum / totalRatings.value;
    });

    const averageResponseTime = computed(() => {
      return '2-3 min';
    });

    const satisfactionPercentage = computed(() => {
      if (totalRatings.value === 0) return 0;
      const satisfied = filteredAllRatings.value.filter(r => r.rating >= 4).length;
      return Math.round((satisfied / totalRatings.value) * 100);
    });

    const recommendationRate = computed(() => {
      if (totalRatings.value === 0) return 0;
      const recommended = filteredAllRatings.value.filter(r => r.rating >= 4).length;
      return Math.round((recommended / totalRatings.value) * 100);
    });

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };

    const filterRatings = () => {
      selectedRating.value = 0;
    };

    const likeReview = (review) => {
      review.helpful++;
      alert('Thank you for finding this review helpful!');
    };

    const replyToReview = (review) => {
      alert(`Reply to ${review.patientName} - To be implemented`);
    };

    const submitRating = async () => {
      if (!newRating.value.doctorId || newRating.value.rating === 0) {
        alert('Please select a doctor and provide a rating');
        return;
      }

      try {
        loading.value = true;
        const payload = {
          doctor_id: parseInt(newRating.value.doctorId),
          rating: newRating.value.rating,
          professionalism: newRating.value.professionalism,
          communication: newRating.value.communication,
          punctuality: newRating.value.punctuality,
          cleanliness: newRating.value.cleanliness || 0,
          comment: newRating.value.comment
        };

        await post('/ratings', payload);

        // Refresh ratings after submission
        await fetchRatings();

        // Reset form
        newRating.value = {
          doctorId: '',
          rating: 0,
          professionalism: 0,
          communication: 0,
          punctuality: 0,
          cleanliness: 0,
          comment: '',
        };

        alert('Thank you for your rating!');
      } catch (err) {
        console.error('Failed to submit rating:', err);
        alert('Failed to submit rating. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    // Initialize on mount
    onMounted(() => {
      fetchDoctors();
      fetchRatings();
    });

    return {
      selectedDoctor,
      selectedRating,
      doctors,
      allRatings,
      newRating,
      filteredReviews,
      ratingCounts,
      totalRatings,
      overallRating,
      averageResponseTime,
      satisfactionPercentage,
      recommendationRate,
      formatDate,
      filterRatings,
      likeReview,
      replyToReview,
      submitRating,
      loading,
      error
    };
  },
};
</script>

<style scoped>
.patient-rating-system {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
}

.spinner {
  border: 4px solid #f0f0f0;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* Error State */
.error-state {
  background: white;
  padding: 40px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.error-state p {
  color: #dc3545;
  font-size: 16px;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rating-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.rating-filter {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* Summary Cards */
.rating-summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.rating-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid #007bff;
}

.rating-card.overall {
  border-top-color: #ffc107;
}

.rating-card.response-time {
  border-top-color: #28a745;
}

.rating-card.satisfaction {
  border-top-color: #17a2b8;
}

.rating-card.recommendation {
  border-top-color: #e83e8c;
}

.rating-value {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.star-display {
  font-size: 24px;
  letter-spacing: 4px;
  color: #ddd;
  margin-bottom: 10px;
}

.star.filled {
  color: #ffc107;
}

.rating-label {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.rating-count {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.metric-label {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.metric-unit {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.satisfaction-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.satisfaction-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #1e7e34);
  transition: width 0.3s ease;
}

/* Distribution Section */
.distribution-section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.distribution-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.star-label {
  min-width: 50px;
  font-weight: 600;
  color: #2c3e50;
}

.distribution-bar {
  flex: 1;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffc107, #ff9800);
  transition: width 0.3s ease;
}

.count-label {
  min-width: 30px;
  text-align: right;
  font-weight: 600;
  color: #666;
}

/* Reviews Section */
.reviews-section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reviews-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.reviews-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.reviewer-info h4 {
  margin: 0 0 3px 0;
  color: #2c3e50;
}

.review-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-rating .star {
  color: #ffc107;
  font-size: 16px;
}

.review-rating .rating-number {
  font-weight: 600;
  color: #2c3e50;
}

.review-text {
  margin: 10px 0;
  line-height: 1.6;
  color: #555;
}

.review-categories {
  display: flex;
  gap: 8px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.category-tag.professionalism {
  color: #007bff;
  border: 1px solid #007bff;
}

.category-tag.communication {
  color: #28a745;
  border: 1px solid #28a745;
}

.category-tag.punctuality {
  color: #ffc107;
  border: 1px solid #ffc107;
}

.category-tag.cleanliness {
  color: #17a2b8;
  border: 1px solid #17a2b8;
}

.review-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-like,
.btn-reply {
  padding: 6px 12px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-like:hover {
  background: #007bff;
  color: white;
}

.btn-reply:hover {
  background: #28a745;
  color: white;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* Rating Form Section */
.rating-form-section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto 30px;
}

.rating-form-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.rating-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.25);
}

.star-selector {
  display: flex;
  gap: 8px;
}

.star-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.star-btn:hover {
  border-color: #ffc107;
  background: #fffbf0;
}

.star-btn.selected {
  border-color: #ffc107;
  color: #ffc107;
  background: #fffbf0;
}

.subcategories {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.subcategory-item {
  margin-bottom: 15px;
}

.subcategory-item:last-child {
  margin-bottom: 0;
}

.star-sub-selector {
  display: flex;
  gap: 6px;
}

.star-sub-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.star-sub-btn:hover {
  border-color: #ffc107;
  background: #fffbf0;
}

.star-sub-btn.selected {
  border-color: #ffc107;
  color: #ffc107;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.char-count {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.submit-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .rating-header {
    flex-direction: column;
    gap: 15px;
  }

  .rating-summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .reviews-filter {
    flex-wrap: wrap;
  }

  .review-header {
    flex-direction: column;
    gap: 10px;
  }

  .star-selector {
    flex-wrap: wrap;
  }

  .star-btn {
    flex: 0 1 calc(20% - 8px);
  }
}
</style>
