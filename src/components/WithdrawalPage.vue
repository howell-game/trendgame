
<template>
  <div v-if="isLoggedIn" class="withdrawal-container">
    <div class="top-row">
      <h2>Withdraw Pawns</h2>

      <button class="history-btn" @click="navigateToTransaction">
        Transaction History
      </button>
    </div>

    
<div class="balance-box">
  <span>Available Pawn Balance</span>

  <strong class="pawn-balance">
    <img
      :src="goldenPawn"
      class="pawn-icon"
      alt="Golden Pawn"
    />
    <span>₦{{ formatMoney(balance) }}</span>
  </strong>
</div>


    <div class="form-group">
      <label for="withdrawal-amount">Withdrawal Amount (₦)</label>

      <input
        id="withdrawal-amount"
        v-model="amount"
        type="number"
        min="1000"
        step="0.01"
        placeholder="Enter amount"
        :disabled="withdrawing"
      />

      <small v-if="amount && Number(amount) < 1000" class="error">
        Minimum withdrawal is ₦1,000.
      </small>

      <small v-else class="hint">
        Your Pawns will be deducted before the transfer is processed.
      </small>
    </div>

    <button
      class="withdraw-btn"
      @click="withdraw"
      :disabled="!canWithdraw"
    >
      {{ withdrawing ? "Submitting..." : "Withdraw Pawns" }}
    </button>

    <div v-if="reference" class="status-box">
      <p><strong>Reference:</strong></p>
      <p class="reference">{{ reference }}</p>

      <p>
        <strong>Status:</strong>
        <span :class="statusClass">{{ status }}</span>
      </p>

      <button
        class="check-btn"
        @click="checkStatus"
        :disabled="checking"
      >
        {{ checking ? "Checking..." : "Check Withdrawal Status" }}
      </button>
    </div>

    <div v-if="message" class="message" :class="{ error: isError }">
      {{ message }}
    </div>
  </div>

  <div v-else class="login-message">
    Please log in to withdraw Pawns.
  </div>
</template>


<script>
import axios from "axios";
import { mapGetters } from "vuex";
import goldenPawn from "@/assets/golden-pawn.png";

export default {
  data() {
    return {
      amount: "",
      balance: 0,
      goldenPawn,
      withdrawing: false,
      checking: false,
      loadingBalance: false,
      message: "",
      isError: false,
      reference: "",
      status: "",
    };
  },

  computed: {
    ...mapGetters(["isLoggedIn", "userId", "token"]),

    canWithdraw() {
      const amount = Number(this.amount);

      return (
        this.isLoggedIn &&
        !this.loadingBalance &&
        Number.isFinite(amount) &&
        amount >= 1000 &&
        Math.round(amount * 100) === amount * 100 &&
        amount <= Number(this.balance) &&
        !this.withdrawing
      );
    },

    statusClass() {
      if (this.status === "successful") return "status-success";
      if (this.status === "failed") return "status-failed";
      return "status-pending";
    },
  },

  mounted() {
    this.loadBalance();
  },

  methods: {
    apiUrl(path) {
      return `${import.meta.env.VITE_APP_BASE_URL}${path}`;
    },

    authConfig() {
      return {
        headers: {
          Authorization: `Bearer ${this.$store.getters.token}`,
        },
      };
    },

    formatMoney(value) {
      return Number(value || 0).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    async loadBalance() {
      if (!this.isLoggedIn || !this.userId) return;

      this.loadingBalance = true;

      try {
        const response = await axios.get(
          this.apiUrl(
            `/api/users/${encodeURIComponent(this.userId)}/balance`
          ),
          this.authConfig()
        );

        this.balance = Number(response.data.balance || 0);

        // Keep the shared Vuex balance in sync with the backend.
        this.$store.commit("updateBalance", this.balance);
      } catch (error) {
        console.error("Failed to fetch real Pawn balance:", error);

        this.message = "Unable to fetch your latest balance.";
        this.isError = true;
      } finally {
        this.loadingBalance = false;
      }
    },

    async withdraw() {
      if (!this.canWithdraw) return;

      this.withdrawing = true;
      this.message = "";
      this.isError = false;
      this.reference = "";
      this.status = "";

      try {
        const response = await axios.post(
          this.apiUrl("/api/pawn-withdrawals"),
          {
            amount: Number(this.amount),
          },
          this.authConfig()
        );

        this.reference = response.data.reference || "";
        this.status = response.data.status || "processing";
        this.message = response.data.message ||
          "Withdrawal submitted for verification.";

        this.amount = "";

        // The backend already deducted the Pawns.
        // Fetch the new authoritative balance; don't deduct twice.
        await this.loadBalance();
      } catch (error) {
        this.message =
          error.response?.data?.error ||
          "Unable to submit the withdrawal. Check your transaction history before retrying.";
        this.isError = true;

        // Refresh in case the server processed the request but
        // the response was lost.
        await this.loadBalance();
      } finally {
        this.withdrawing = false;
      }
    },

    async checkStatus() {
      if (!this.reference || this.checking) return;

      this.checking = true;
      this.message = "";
      this.isError = false;

      try {
        const response = await axios.get(
          this.apiUrl(
            `/api/pawn-withdrawals/status/${encodeURIComponent(this.reference)}`
          ),
          this.authConfig()
        );

        const withdrawal = response.data.withdrawal;
        this.status = withdrawal.status;

        if (this.status === "successful") {
          this.message = "Withdrawal completed successfully.";
        } else if (this.status === "failed") {
          this.message =
            "Withdrawal failed. Check your updated Pawn balance for the refund.";
        } else {
          this.message = "Your withdrawal is still being processed.";
        }

        await this.loadBalance();
      } catch (error) {
        this.message =
          error.response?.data?.error ||
          "Unable to check the withdrawal status.";
        this.isError = true;
      } finally {
        this.checking = false;
      }
    },

    navigateToTransaction() {
      this.$router.push(`/transaction/${this.userId}`);
    },
  },
};
</script>


<style scoped>
.withdrawal-container {
  max-width: 650px;
  margin: 40px auto;
  padding: 30px;
  background: lightyellow;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
}

h2 {
  margin: 0;
  color: #1b5e20;
}

.history-btn,
.check-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #0d6efd;
  color: white;
  cursor: pointer;
}

.balance-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  margin-bottom: 24px;
  background: #e9f9ef;
  border: 1px solid #b7e4c7;
  border-radius: 8px;
}

.balance-box strong {
  color: #155724;
  font-size: 25px;
}


.pawn-balance {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #155724;
  font-size: 25px;
}

.pawn-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}


.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

.hint,
.error {
  display: block;
  margin-top: 8px;
  font-size: 13px;
}

.hint {
  color: #555;
}

.error,
.status-failed {
  color: #b02a37;
}

.withdraw-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 6px;
  background: #198754;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.withdraw-btn:disabled,
.check-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.status-box,
.message {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  overflow-wrap: anywhere;
}

.status-box {
  background: white;
  border: 1px solid #ddd;
}

.reference {
  font-size: 13px;
  overflow-wrap: anywhere;
}

.status-success {
  color: #198754;
}

.status-pending {
  color: #997404;
}

.message {
  background: #d1e7dd;
  color: #0f5132;
}

.message.error {
  background: #f8d7da;
  color: #842029;
}

.login-message {
  text-align: center;
  margin: 40px;
}

@media (max-width: 768px) {
  .withdrawal-container {
    width: 95%;
    box-sizing: border-box;
    padding: 20px;
  }
}
</style>
