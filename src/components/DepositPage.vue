
<template>
  <div class="deposit-page">
    <div class="deposit-container">
      <h1>Buy Pawns</h1>

      <p class="description">
        Enter the amount of Pawns you want to add to your Pawns.
      </p>

      <form @submit.prevent="handleDeposit">
        <div class="form-group">
          <label for="amount">
            Amount in Naira
            (<img :src="goldenPawn" class="pawn-icon" alt="Pawn" />
            = ₦1)
          </label>

          <input
            id="amount"
            v-model="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
            required
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !isValidAmount"
        >
          {{ loading ? "Submitting..." : "Fund Wallet" }}
        </button>
      </form>

      <div v-if="error" class="message error">
        {{ error }}
      </div>

      <div v-if="message" class="message info">
        {{ message }}
      </div>

      <div v-if="depositReference" class="deposit-details">
        <p>
          <strong>Reference:</strong>
          {{ depositReference }}
        </p>

        <p>
          <strong>Status:</strong>
          <span :class="'status-' + depositStatus">
            {{ formatStatus(depositStatus) }}
          </span>
        </p>

        <button
          type="button"
          class="check-button"
          @click="checkStatus(true)"
          :disabled="checkingStatus"
        >
          {{ checkingStatus ? "Checking..." : "Check Deposit Status" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import goldenPawn from "@/assets/golden-pawn.png";

export default {
  name: "Deposit",

  data() {
    return {
      amount: "",
      goldenPawn,

      loading: false,
      checkingStatus: false,

      error: "",
      message: "",

      depositReference: "",
      depositStatus: "",

      pollingTimer: null,
    };
  },

  computed: {
    isValidAmount() {
      const value = Number(this.amount);

      return (
        Number.isFinite(value) &&
        value > 0 &&
        Math.round(value * 100) === value * 100
      );
    },
  },

  beforeUnmount() {
    this.stopPolling();
  },

  methods: {
    async handleDeposit() {
      if (!this.isValidAmount || this.loading) {
        return;
      }

      this.stopPolling();

      this.loading = true;
      this.error = "";
      this.message = "";
      this.depositReference = "";
      this.depositStatus = "";

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/api/wallet-funding/deposit`,
          {
            amount: Number(this.amount),
          }
        );

        this.depositReference = response.data.reference || "";
        this.depositStatus = response.data.status || "processing";

        this.message =
          response.data.message ||
          "Your wallet funding request has been submitted.";

        if (this.depositReference) {
          this.startPolling(this.depositReference, 20);
        }
      } catch (err) {
        this.error =
          err.response?.data?.error ||
          "Could not submit your wallet funding request.";
      } finally {
        this.loading = false;
      }
    },

    async checkStatus(showMessage = true) {
      if (!this.depositReference || this.checkingStatus) {
        return;
      }

      this.checkingStatus = true;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/wallet-funding/status/${encodeURIComponent(this.depositReference)}`
        );

        const deposit = response.data.deposit;

        this.depositStatus = deposit.status;

        if (deposit.status === "successful") {
          this.message =
            "Your wallet funding is successful. Your ETrend balance has been credited.";
          this.stopPolling();
        } else if (deposit.status === "failed") {
          this.error =
            "The transfer failed. Your ETrend balance was not credited.";
          this.stopPolling();
        } else if (showMessage) {
          this.message =
            "Your transfer is still being processed. Please check again shortly.";
        }
      } catch (err) {
        if (showMessage) {
          this.error =
            err.response?.data?.error ||
            "Unable to check the deposit status.";
        }
      } finally {
        this.checkingStatus = false;
      }
    },

    startPolling(reference, attemptsRemaining) {
      this.stopPolling();

      if (attemptsRemaining <= 0) {
        this.message =
          "Your transfer is still awaiting confirmation. You can check its status again later.";
        return;
      }

      this.pollingTimer = setTimeout(async () => {
        if (this.depositReference !== reference) {
          return;
        }

        await this.checkStatus(false);

        if (
          this.depositReference === reference &&
          !["successful", "failed", "cancelled"].includes(
            this.depositStatus
          )
        ) {
          this.startPolling(reference, attemptsRemaining - 1);
        }
      }, 3000);
    },

    stopPolling() {
      if (this.pollingTimer) {
        clearTimeout(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    formatStatus(status) {
      if (!status) return "Unknown";

      return status.charAt(0).toUpperCase() + status.slice(1);
    },
  },
};
</script>

<style scoped>
.deposit-page {
  padding: 24px 16px;
}

.deposit-container {
  max-width: 520px;
  margin: 20px auto;
  padding: 28px;
  background: lightyellow;
  border: 1px solid #ddd;
  border-radius: 12px;
  text-align: center;
  box-sizing: border-box;
}

h1 {
  color: #333;
  font-size: 26px;
  margin-bottom: 12px;
}

.description {
  color: #555;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.pawn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  vertical-align: middle;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #bbb;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 13px;
  background: #176b3a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 18px;
  padding: 12px;
  border-radius: 6px;
  overflow-wrap: anywhere;
}

.error {
  color: #a32121;
  background: #ffe8e8;
}

.info {
  color: #174b2c;
  background: #e9f6ec;
}

.deposit-details {
  margin-top: 22px;
  padding: 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-wrap: anywhere;
}

.check-button {
  margin-top: 12px;
  background: #34495e;
}

.status-successful {
  color: #176b3a;
  font-weight: bold;
}

.status-failed {
  color: #b42318;
  font-weight: bold;
}

.status-processing,
.status-pending {
  color: #946200;
  font-weight: bold;
}
</style>
