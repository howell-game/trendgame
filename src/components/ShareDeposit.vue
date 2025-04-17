<template>
  <div>
    <div class="deposit-container">
      <h1>Deposit Share Contribution</h1>
      <form @submit.prevent="handleDeposit">
        <div>
          <label for="amount">Deposit Amount</label>
          <input
            type="number"
            v-model="amount"
            id="amount"
            placeholder="Enter deposit amount"
            required
          />
        </div>
        <button type="submit">Deposit</button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      amount: 0,
      error: null,
    };
  },
  computed: {
    // Access memberId from the route params instead of Vuex
    memberId() {
      return this.$route.params.memberId;
    },
  },
  methods: {
    async handleDeposit() {
      try {
        this.error = null;
        // Ensure the amount is greater than 0
        if (this.amount < 30000) {
          this.error = "Please enter a Minimum of 30,000.";
          return;
        }

       const response = await axios.post(
  `${import.meta.env.VITE_APP_BASE_URL}/api/transactions/share-deposit`,
  { memberId: this.memberId, amount: this.amount }
);


        // Redirect to payment gateway
        window.location.href = response.data.paymentLink;
      } catch (err) {
        this.error = err.response?.data?.error || "An error occurred.";
      }
    },
  },
};
</script>

<style>
.error {
  color: red;
  margin-top: 10px;
}
.h1 {
  color: white;
}

.deposit-container {
  text-align: center;
  margin: 20px auto;
  max-width: 900px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: bold;
}

input {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

button {
  padding: 10px;
  font-size: 16px;
  background-color: #003366;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

button:active {
  transform: scale(0.97);
}
</style>
