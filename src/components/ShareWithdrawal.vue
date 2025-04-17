<template>
  <div class="withdrawal-container" v-if="isLoggedIn">
    <h2>Withdraw Funds</h2>

    <!-- Transaction History Button -->
    <div class="transaction-button-container">
      <button class="button transaction" @click="navigateToTransaction">
        Transaction History
      </button>
    </div>

    <form @submit.prevent="requestWithdrawal">
      <label for="amount">Amount:</label>
      <input type="number" v-model="amount" min="500" required />
      <p v-if="amount && amount < 500" class="error">Minimum withdrawal is ₦500</p>

      <label for="account_bank">Select Bank:</label>
      <select v-model="account_bank" required>
        <option value="">Choose Bank</option>
        <option v-for="bank in banks" :key="bank.code" :value="bank.code">
          {{ bank.name }}
        </option>
      </select>

      <label for="account_number">Account Number:</label>
      <input type="text" v-model="account_number" required placeholder="Enter Account Number" />

      <!-- Resolve Account Button -->
      <button type="button" class="resolve-button" @click="fetchAccountName" :disabled="!account_bank || !account_number">
        Resolve Account
      </button>

      <!-- Display Resolved Account Name -->
      <p v-if="isResolving">⏳ Resolving account name...</p>
      <p v-if="accountName">✅ Account Name: <strong>{{ accountName }}</strong></p>
      <p v-if="resolveError" class="error">❌ {{ resolveError }}</p>

      <button type="submit" :disabled="amount < 500 || !account_bank || !account_number || !accountName">
        Withdraw
      </button>
    </form>

    <div v-if="otpSent" class="otp-container">
      <h3>Enter OTP Sent To Your Email!</h3>
      <input type="text" v-model="otp" placeholder="Enter OTP Sent to Your Email" required />
      <button @click="verifyOtp" :disabled="!otp">Verify</button>
    </div>

    <p v-if="message" :class="{ error: isError }">{{ message }}</p>
  </div>

  <div v-else>
    <p>Please log in to withdraw funds.</p>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      amount: "",
      account_bank: "",
      account_number: "",
      accountName: "",
      otp: "",
      otpSent: false,
      message: "",
      isError: false,
      isResolving: false,
      resolveError: "",
      banks: [
        { name: "Access Bank", code: "044" },
        { name: "Ecobank", code: "050" },
        { name: "Fidelity Bank", code: "070" },
         { name: "First Bank of Nigeria", code: "011" },
        { name: "FCMB", code: "214" },
        { name: "Guaranty Trust Bank", code: "058" },
         { name: "Heritage Bank", code: "030" },
          { name: "Keystone Bank", code: "082" },
           { name: "Lotus Bank", code: "303" },
            { name: "Premium Trust Bank", code: "105" },
             { name: "Stanbic IBTC", code: "221" },
              { name: "Sterling Bank", code: "232" },
         { name: "Union Bank", code: "032" },
        { name: "United Bank for Africa", code: "033" },
         { name: "Unity Bank", code: "215" },
          { name: "VFD microfinance Bank", code: "090110" },
         { name: "Wema Bank", code: "035" },
        
        { name: "Zenith Bank", code: "057" },
        
      ],
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "memberId"]),
  },
  methods: {
    async fetchAccountName() {
      if (!this.account_number || !this.account_bank) {
        this.resolveError = "Please enter bank and account number.";
        return;
      }

      this.isResolving = true;
      this.resolveError = "";
      this.accountName = "";

      try {
        console.log("🔹 Resolving account name:", { account_number: this.account_number, account_bank: this.account_bank });

        const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/share-resolve-account`, {
          account_number: this.account_number,
          account_bank: this.account_bank,
        });

        this.accountName = response.data.account_name;
        this.isResolving = false;
        console.log("✅ Account resolved successfully:", this.accountName);
      } catch (error) {
        console.error("❌ Account resolution failed:", error.response?.data || error.message);
        this.resolveError = "Invalid account details. Please check and try again.";
        this.isResolving = false;
      }
    },

    navigateToTransaction() {
      this.$router.push(`/transaction/${this.memberId}`);
    },

    async requestWithdrawal() {
      if (this.amount < 10000) {
        this.message = "Minimum withdrawal amount is ₦10000";
        this.isError = true;
        return;
      }

      if (!this.memberId) {
        this.message = "Contributor not logged in. Please log in to withdraw funds.";
        this.isError = true;
        return;
      }

      try {
        console.log("🔹 Sending OTP request for withdrawal...");
        const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/withdraw/share-send-otp`, {
          memberId: this.memberId,
        });

        this.otpSent = true;
        this.message = response.data.message;
        this.isError = false;
        console.log("✅ OTP sent successfully:", response.data);
      } catch (error) {
        this.message = "Error: " + (error.response?.data?.message || error.message);
        this.isError = true;
        console.error("❌ OTP request failed:", error.response?.data || error.message);
      }
    },

    async verifyOtp() {
      if (!this.memberId) {
        this.message = "Contributor not logged in. Please log in to verify OTP.";
        this.isError = true;
        console.error("❌ Contributor not logged in.");
        return;
      }

      try {
        console.log("🔹 Sending withdrawal request:", {
          memberId: this.memberId,
          amount: this.amount,
          shareotp: this.otp,
          account_bank: this.account_bank,
          account_number: this.account_number,
          currency: "NGN",
        });

        const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/share-withdraw`, {
          memberId: this.memberId,
          amount: this.amount,
          shareotp: this.otp,
          account_bank: this.account_bank,
          account_number: this.account_number,
          currency: "NGN",
        });

        console.log("✅ Withdrawal successful:", response.data);
        this.message = response.data.message;
        this.isError = false;
      } catch (error) {
        console.error("❌ Withdrawal Error:", error.response?.data || error.message);
        this.message = "Error: " + (error.response?.data?.message || error.message);
        this.isError = true;
      }
    },
  },
};
</script>

<style scoped>
.withdrawal-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}

.transaction-button-container {
  text-align: center;
  margin-bottom: 20px;
}

.button.transaction {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.button.transaction:hover {
  background-color: #218838;
}

.resolve-button {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.resolve-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.otp-container {
  margin-top: 20px;
}

.error {
  color: red;
  font-size: 14px;
}

button {
  margin-top: 10px;
  padding: 8px 12px;
}

button:disabled {
  background: #ccc;
}

p {
  margin-top: 20px;
}
</style>
