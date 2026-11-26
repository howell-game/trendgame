
<template>
  <div class="airtime-overlay" @click.self="closeModal">
    <div class="airtime-modal">

      <!-- Header -->
      <div class="airtime-header">
        <div>
          <h2>Buy Airtime</h2>
          <p>Purchase airtime for any network</p>
        </div>

        <button
          type="button"
          class="close-button"
          @click="closeModal"
          :disabled="loading"
        >
          ×
        </button>
      </div>

      <!-- Network -->
      <div class="form-group">
        <label>Select Network</label>

        <div class="network-grid">
          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === 'mtn' }"
            @click="selectNetwork('mtn')"
            :disabled="loading"
          >
            <span class="network-icon">M</span>
            <span>MTN</span>
          </button>

          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === 'airtel' }"
            @click="selectNetwork('airtel')"
            :disabled="loading"
          >
            <span class="network-icon">A</span>
            <span>Airtel</span>
          </button>

          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === 'glo' }"
            @click="selectNetwork('glo')"
            :disabled="loading"
          >
            <span class="network-icon">G</span>
            <span>Glo</span>
          </button>

          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === '9mobile' }"
            @click="selectNetwork('9mobile')"
            :disabled="loading"
          >
            <span class="network-icon">9</span>
            <span>9mobile</span>
          </button>
        </div>
      </div>

      <!-- Amount -->
      <div class="form-group">
        <label for="airtime-amount">Amount</label>

        <div class="amount-input">
          <span class="currency">₦</span>

          <input
            id="airtime-amount"
            v-model="amount"
            type="number"
            min="50"
            placeholder="Enter amount"
            :disabled="loading"
          />
        </div>

        <small>Minimum purchase is ₦50</small>
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label for="airtime-phone">Phone Number</label>

        <input
          id="airtime-phone"
          v-model="phoneNumber"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          placeholder="08012345678"
          :disabled="loading"
        />
      </div>

      <!-- Error -->
      <div
        v-if="errorMessage"
        class="message error-message"
      >
        {{ errorMessage }}
      </div>

      <!-- Success -->
      <div
        v-if="successMessage"
        class="message success-message"
      >
        {{ successMessage }}
      </div>

      <!-- Buy -->
      <button
        type="button"
        class="buy-button"
        :disabled="loading"
        @click="buyAirtime"
      >
        <span v-if="loading">Processing...</span>
        <span v-else>Buy Airtime</span>
      </button>

    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Airtime",

  data() {
    return {
      selectedNetwork: "",
      amount: "",
      phoneNumber: "",
      loading: false,
      errorMessage: "",
      successMessage: ""
    };
  },

  computed: {
    userId() {
      return this.$store.getters.userId;
    },

    token() {
      return this.$store.getters.token;
    },

    baseUrl() {
      return import.meta.env.VITE_APP_BASE_URL;
    }
  },

  mounted() {
    window.addEventListener("keydown", this.handleEscape);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleEscape);
  },

  beforeDestroy() {
    window.removeEventListener("keydown", this.handleEscape);
  },

  methods: {
    // =========================================
    // MODAL CLOSURE
    // =========================================

    closeModal() {
      if (this.loading) {
        return;
      }

      this.$emit("close");
    },

    handleEscape(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    },

    // =========================================
    // NETWORK SELECTION
    // =========================================

    selectNetwork(network) {
      if (this.loading) return;

      this.selectedNetwork = network;
      this.errorMessage = "";
      this.successMessage = "";
    },

    // =========================================
    // VALIDATION
    // =========================================

    validateForm() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.selectedNetwork) {
        this.errorMessage = "Please select a network.";
        return false;
      }

      const airtimeAmount = Number(this.amount);

      if (
        !Number.isFinite(airtimeAmount) ||
        airtimeAmount < 50
      ) {
        this.errorMessage =
          "Minimum airtime purchase is ₦50.";

        return false;
      }

      const phone = String(this.phoneNumber)
        .replace(/\s+/g, "");

      if (!/^0[789][01]\d{8}$/.test(phone)) {
        this.errorMessage =
          "Please enter a valid Nigerian phone number.";

        return false;
      }

      if (!this.userId) {
        this.errorMessage =
          "Your account could not be identified.";

        return false;
      }

      return true;
    },

    // =========================================
    // BUY AIRTIME
    // =========================================

    async buyAirtime() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const airtimeAmount = Number(this.amount);

      const phone = String(this.phoneNumber)
        .replace(/\s+/g, "");

      try {
        const response = await axios.post(
          `${this.baseUrl}/api/etrend-airtime/buy`,
          {
            userId: this.userId,
            network: this.selectedNetwork,
            phoneNumber: phone,
            amount: airtimeAmount
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json"
            }
          }
        );

        const data = response.data;

        // SUCCESS / DELIVERED
        if (
          data.success &&
          (
            data.status === "SUCCESSFUL" ||
            data.status === "DELIVERED" ||
            data.status === "COMPLETED"
          )
        ) {
          this.successMessage =
            data.message ||
            "Airtime purchase successful.";

          return;
        }

        // PENDING
        if (
          data.success &&
          (
            data.status === "PENDING" ||
            data.status === "INITIATED" ||
            data.status === "PROCESSING"
          )
        ) {
          this.successMessage =
            data.message ||
            "Airtime purchase is being processed.";

          return;
        }

        // OTHER RESPONSE
        this.errorMessage =
          data.message ||
          "Airtime purchase could not be completed.";

      } catch (error) {
        console.error(
          "❌ Airtime purchase error:",
          error.response?.data || error.message
        );

        this.errorMessage =
          error.response?.data?.message ||
          "Unable to complete airtime purchase.";

      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>

/* =========================================
   MODAL OVERLAY
========================================= */

.airtime-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 15px;

  background: rgba(0, 25, 50, 0.72);
  backdrop-filter: blur(5px);

  overflow-y: auto;
}

/* =========================================
   MODAL
========================================= */

.airtime-modal {
  width: 100%;
  max-width: 480px;

  max-height: 94vh;
  overflow-y: auto;

  box-sizing: border-box;
  padding: 22px;

  border-radius: 18px;

  background: #fff9d9;
  border: 1px solid #e8dca4;

  color: #111;

  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
}

/* =========================================
   HEADER
========================================= */

.airtime-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;
  margin-bottom: 23px;

  padding-bottom: 15px;
  border-bottom: 1px solid #e8dca4;
}

.airtime-header h2 {
  margin: 0;

  color: #003366;
  font-size: 22px;
  font-weight: 800;
}

.airtime-header p {
  margin: 5px 0 0;

  color: #555;
  font-size: 12px;
}

.close-button {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  border-radius: 10px;
  border: 1px solid #d8cda0;

  background: #fffef8;
  color: #003366;

  font-size: 25px;
  line-height: 1;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: 0.2s ease;
}

.close-button:hover {
  background: #003366;
  color: white;
  border-color: #003366;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =========================================
   FORM GROUPS
========================================= */

.form-group {
  margin-bottom: 19px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #003366;
  font-size: 13px;
  font-weight: 700;
}

/* =========================================
   NETWORK SELECTION
========================================= */

.network-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
}

.network-button {
  min-height: 75px;

  border-radius: 12px;
  border: 1px solid #e1d7ac;

  background: #fffef8;
  color: #111;

  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  font-size: 12px;
  font-weight: 700;

  transition: 0.2s ease;
}

.network-button:hover {
  border-color: #003366;
  transform: translateY(-2px);
}

.network-button.selected {
  background: #e7f4e8;
  border: 2px solid #168447;

  color: #003366;

  box-shadow: 0 4px 12px rgba(22, 132, 71, 0.12);
}

.network-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.network-icon {
  width: 30px;
  height: 30px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #003366;
  color: white;

  font-size: 14px;
  font-weight: 800;
}

.network-button.selected .network-icon {
  background: #168447;
  color: white;
}

/* =========================================
   INPUTS
========================================= */

.form-group input {
  width: 100%;
  box-sizing: border-box;

  padding: 13px;

  border-radius: 9px;
  border: 1px solid #d8cda0;

  background: #fffef8;
  color: #111;

  outline: none;
  font-size: 14px;

  transition: border-color 0.2s ease;
}

.form-group input::placeholder {
  color: #888;
}

.form-group input:focus {
  border-color: #003366;
  box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.08);
}

.form-group input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* =========================================
   AMOUNT INPUT
========================================= */

.amount-input {
  display: flex;
  align-items: center;

  border-radius: 9px;
  border: 1px solid #d8cda0;

  background: #fffef8;
  overflow: hidden;
}

.currency {
  padding-left: 14px;

  color: #003366;
  font-size: 16px;
  font-weight: 800;
}

.amount-input input {
  border: none;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.amount-input input:focus {
  border: none;
  box-shadow: none;
}

.form-group small {
  display: block;
  margin-top: 6px;

  color: #666;
  font-size: 11px;
}

/* =========================================
   MESSAGES
========================================= */

.message {
  padding: 12px;

  margin-bottom: 15px;

  border-radius: 9px;

  font-size: 12px;
  font-weight: 600;
}

.error-message {
  background: #fff0ed;
  border: 1px solid #e4aaa0;

  color: #b42318;
}

.success-message {
  background: #edf8ed;
  border: 1px solid #b6d8bd;

  color: #176b35;
}

/* =========================================
   BUY BUTTON
========================================= */

.buy-button {
  width: 100%;

  padding: 14px;

  border-radius: 10px;
  border: 1px solid #168447;

  background: #168447;
  color: white;

  font-size: 15px;
  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;
}

.buy-button:hover {
  background: #106b38;
  border-color: #106b38;

  transform: translateY(-1px);

  box-shadow: 0 6px 18px rgba(22, 132, 71, 0.22);
}

.buy-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 500px) {
  .airtime-modal {
    padding: 17px;
    border-radius: 15px;
  }

  .network-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .airtime-header h2 {
    font-size: 20px;
  }
}

</style>
