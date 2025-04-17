<template>
  <div class="receipt-container">
    <h1 class="title">Investment Receipts</h1>

    <!-- No investments message -->
    <div v-if="investments.length === 0" class="no-investments">
      <p>No investments found.</p>
    </div>

    <!-- Investment list -->
    <div v-else class="investment-list">
      <div v-for="investment in investments" :key="investment._id" class="investment-item">
        <!-- Native Vue dropdown using <details> -->
        <details class="investment-dropdown">
          <summary class="investment-header">
            <strong>{{ investment.groupCode }}</strong> (Investment Code)
          </summary>

          <div class="investment-details">
            <p><span class="label">Investment Return:</span> {{ investment.share }}</p>
            <p><span class="label">Investment Amount:</span> {{ investment.investmentAmount }}</p>
            <p><span class="label">Timeframe:</span> {{ investment.timeframe }}</p>
            <p><span class="label">Created At:</span> {{ formatDate(investment.createdAt) }}</p>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      investments: [],
    };
  },

  computed: {
    ...mapGetters(["userId"]),
  },

  methods: {
    async fetchInvestments() {
      if (!this.userId) return;
      try {
       const response = await axios.get(
  `${import.meta.env.VITE_APP_BASE_URL}/api/investments/receipt?userId=${this.userId}`
);

        console.log("Fetched Investments:", response.data);
        this.investments = response.data || [];
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },

  mounted() {
    if (this.userId) {
      this.fetchInvestments();
    }
  },
};
</script>

<style scoped>
/* Container styling */
.receipt-container {
 
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 20px auto;
  
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}

/* Title */
.title {
  text-align: center;
  font-size: 2rem;
  color: #003366;
  margin-bottom: 20px;
  background-color:lightyellow;
}

/* No investments message */
.no-investments {
  text-align: center;
  color: #888;
  font-size: 1.2rem;
}

/* Investment List */
.investment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Investment Item */
.investment-item {
  background-color:lightyellow;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Dropdown */
.investment-dropdown {
  width: 100%;
  cursor: pointer;
}

/* Dropdown Header */
.investment-header {
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #003366;
  color: yellow;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

/* Dropdown Details */
.investment-details {
  padding: 10px;
  margin-top: 5px;
  background: white;
  border-radius: 5px;
  border: 1px solid #ddd;
}

/* Labels */
.label {
  font-weight: bold;
  color: #003366;
}
</style>
