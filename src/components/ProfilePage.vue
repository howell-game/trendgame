<template>
  <div>
  <div class="base-data">
  <h1>Welcome, {{ userName }}</h1>
  <p><strong class="highlight-text">User ID:</strong> <span class="bold-yellow">{{ userId }}</span></p>
  <p><strong class="highlight-text">Balance:</strong> <span class="bold-yellow">{{ balance }}</span></p>
</div>


    <div class="button-container">
    <p>
      <button class="button deposit" @click="navigateToDeposit">Deposit</button>
      <button class="button Receipt" @click="navigateToReceipt">Receipt</button>
      <button class="button investment-details" @click="navigateToInvestmentDetails">
        History
      </button>
      <button class="button withdraw" @click="navigateToWithdrawal">Withdraw</button>
      </p>
    </div>

    <InvestmentPage :userId="userId" />
  </div>
</template>


<script>
import { mapState } from "vuex";
import InvestmentPage from "./InvestmentPage.vue";
import axios from "axios";

export default {
  components: {
    InvestmentPage,
  },
  computed: {
    ...mapState(["userName", "userId", "balance"]), // Map Vuex state to the profile page
  },
  methods: {
    async fetchBalance() {
      try {
        const response = await axios.get(
  `${import.meta.env.VITE_APP_BASE_URL}/api/users/${this.userId}/balance`,
  {
    headers: {
      Authorization: `Bearer ${this.$store.getters.token}`,
    },
  }
);

        const updatedBalance = response.data.balance;
        this.$store.commit("updateBalance", updatedBalance); // Update Vuex store
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    },
    navigateToDeposit() {
      this.$router.push(`/deposit/${this.userId}`);
      this.fetchBalance(); // Fetch the updated balance after navigating
    },
navigateToReceipt() {
      this.$router.push(`/receipt/${this.userId}`);
      
    },

    navigateToWithdrawal() {
      this.$router.push(`/withdrawal/${this.userId}`);
      this.fetchBalance(); // Fetch the updated balance after navigating
    },
    navigateToInvestmentDetails() {
      this.$router.push(`/investment-details/${this.userId}`);
    },
  },
  created() {
    this.fetchBalance(); // Fetch balance when the page is loaded
  },
};
</script>


<style>
.profile {
  text-align: center;
  margin: 30px auto;
  padding: 20px;
  max-width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color:rgb(249, 249, 249);
}
/* Base Data Styling */
.base-data {
  
  background-color: lightblue;
  }


/* Bold Yellow Styling */
.bold-yellow {
  font-weight: bold;
  color: black;
}

/* Highlighted Labels */
.highlight-text {
  font-weight: bold;
  color: white; /* White for contrast */
}


h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  color: #555;
  margin: 5px 0;
}

.button-container {
  display: flex;
  justify-content: center; /* Center the buttons */
  align-items: center; /* Align buttons vertically */
  gap: 15px; /* Reduced spacing between buttons */
  margin-top: 20px;
}

.button {
  width: 90px; /* Slightly wider buttons */
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  color: white;
  text-align: center;
}

/* Individual button colors */
.deposit {
  background-color: #003366;
}

.withdraw {
  background-color: #003366;
}

.investment-details {
  background-color: green;
}

/* Hover and active states for buttons */
.button:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.button:active {
  transform: scale(0.97);
}

</style>