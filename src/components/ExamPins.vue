
<template>
  <Teleport to="body">
    <div class="exam-overlay" @click.self="closeModal">
      <div class="exam-modal">

        <!-- HEADER -->
        <div class="exam-header">
          <div>
            <h2>📝 Exam PINs</h2>
            <p>WAEC and JAMB examination PINs</p>
          </div>

          <button
            type="button"
            class="close-btn"
            @click="closeModal"
            :disabled="buying || verifying || loadingPackages"
          >
            ×
          </button>
        </div>

        <!-- EXAM -->
        <div class="form-group">
          <label>Exam</label>

          <select
            v-model="selectedService"
            @change="loadPackages"
            :disabled="buying || verifying || loadingPackages"
          >
            <option value="">Select exam</option>
            <option value="waec">WAEC Result Checker</option>
            <option value="waec-registration">WAEC Registration</option>
            <option value="jamb">JAMB PIN</option>
          </select>
        </div>

        <!-- LOADING PACKAGES -->
        <div v-if="loadingPackages" class="loading-box">
          <span class="loader"></span>
          Loading examination packages...
        </div>

        <!-- PIN TYPE -->
        <div
          v-if="packages.length"
          class="form-group"
        >
          <label>PIN Type</label>

          <select
            v-model="selectedPackage"
            @change="resetJAMBVerification"
            :disabled="buying || verifying"
          >
            <option :value="null">Select PIN type</option>

            <option
              v-for="item in packages"
              :key="item.variation_code"
              :value="item"
            >
              {{ item.name }}
              — ₦{{ Number(item.variation_amount).toLocaleString() }}
            </option>
          </select>
        </div>

        <!-- JAMB VERIFICATION -->
        <div
          v-if="selectedService === 'jamb' && selectedPackage"
          class="form-group jamb-section"
        >
          <label>JAMB Profile ID</label>

          <input
            v-model="profileId"
            type="text"
            placeholder="Enter JAMB Profile ID"
            :disabled="verifying || buying"
          />

          <button
            type="button"
            class="verify-btn"
            :disabled="verifying || buying || !profileId.trim()"
            @click="verifyJAMB"
          >
            {{
              verifying
                ? "Verifying..."
                : "Verify Profile ID"
            }}
          </button>

          <div v-if="customerName" class="verified">
            <span>✓</span>
            {{ customerName }}
          </div>
        </div>

        <!-- PHONE -->
        <div class="form-group">
          <label>Phone Number</label>

          <input
            v-model="phoneNumber"
            type="tel"
            inputmode="numeric"
            maxlength="11"
            placeholder="08012345678"
            :disabled="buying"
          />
        </div>

        <!-- SUMMARY -->
        <div v-if="selectedPackage" class="summary">
          <div>
            <span>Selected PIN</span>
            <strong>{{ selectedPackage.name }}</strong>
          </div>

          <div class="summary-amount">
            <span>Amount</span>
            <strong>
              ₦{{ Number(selectedPackage.variation_amount).toLocaleString() }}
            </strong>
          </div>
        </div>

        <!-- MESSAGE -->
        <div
          v-if="message"
          :class="[
            'message',
            isError ? 'error' : 'success'
          ]"
        >
          {{ message }}
        </div>

        <!-- PURCHASE RESULT -->
        <div v-if="purchased" class="pin-result">
          <h3>🎉 PIN Purchased</h3>

          <div v-if="serialNumber" class="result-item">
            <strong>Serial Number</strong>
            <p>{{ serialNumber }}</p>
          </div>

          <div v-if="pin" class="result-item">
            <strong>PIN</strong>
            <p class="pin-value">{{ pin }}</p>
          </div>

          <div v-if="token" class="result-item">
            <strong>Token</strong>
            <p class="pin-value">{{ token }}</p>
          </div>
        </div>

        <!-- BUY -->
        <button
          type="button"
          class="buy-btn"
          :disabled="!canBuy || buying || verifying"
          @click="buyPIN"
        >
          {{
            buying
              ? "Processing..."
              : "Buy PIN"
          }}
        </button>

        <!-- HISTORY -->
        <div class="history">
          <h3>Recent Purchases</h3>

          <div
            v-if="transactions.length === 0"
            class="empty"
          >
            No exam PIN purchases yet.
          </div>

          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="history-item"
          >
            <div class="history-info">
              <strong>{{ transaction.examType }}</strong>
              <small>{{ transaction.packageName }}</small>
            </div>

            <span
              :class="
                transaction.status === 'SUCCESSFUL'
                  ? 'status-success'
                  : 'status-pending'
              "
            >
              {{ transaction.status }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
import axios from "axios";

export default {
  name: "ExamPins",

  data() {
    return {
      selectedService: "",
      packages: [],
      selectedPackage: null,

      profileId: "",
      customerName: "",

      phoneNumber: "",

      loadingPackages: false,
      verifying: false,
      buying: false,

      message: "",
      isError: false,

      purchased: false,

      serialNumber: "",
      pin: "",
      token: "",

      transactions: []
    };
  },

  computed: {
    canBuy() {
      if (
        !this.selectedPackage ||
        !this.phoneNumber.trim()
      ) {
        return false;
      }

      if (this.selectedService === "jamb") {
        return (
          this.profileId.trim() &&
          this.customerName
        );
      }

      return true;
    }
  },

  mounted() {
    this.loadHistory();

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
      if (
        this.buying ||
        this.verifying ||
        this.loadingPackages
      ) {
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
    // LOAD EXAM PACKAGES
    // =========================================

    async loadPackages() {
      this.packages = [];
      this.selectedPackage = null;

      this.profileId = "";
      this.customerName = "";

      this.phoneNumber = "";

      this.message = "";
      this.isError = false;
      this.purchased = false;

      this.serialNumber = "";
      this.pin = "";
      this.token = "";

      if (!this.selectedService) {
        return;
      }

      this.loadingPackages = true;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-education/packages/${this.selectedService}`
        );

        this.packages =
          response.data?.packages || [];

      } catch (error) {
        console.error(
          "Failed to load exam packages:",
          error
        );

        this.message =
          error.response?.data?.message ||
          "Unable to load exam PIN packages.";

        this.isError = true;

      } finally {
        this.loadingPackages = false;
      }
    },

    // =========================================
    // RESET JAMB VERIFICATION
    // =========================================

    resetJAMBVerification() {
      this.customerName = "";
      this.message = "";
      this.isError = false;
      this.purchased = false;

      this.serialNumber = "";
      this.pin = "";
      this.token = "";
    },

    // =========================================
    // VERIFY JAMB
    // =========================================

    async verifyJAMB() {
      if (
        !this.profileId.trim() ||
        !this.selectedPackage ||
        this.verifying ||
        this.buying
      ) {
        return;
      }

      this.verifying = true;
      this.message = "";
      this.isError = false;
      this.customerName = "";

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-education/verify-jamb`,
          {
            profileId: this.profileId.trim(),

            variationCode:
              this.selectedPackage.variation_code
          }
        );

        this.customerName =
          response.data?.customerName || "";

        this.message =
          "JAMB Profile ID verified successfully.";

        this.isError = false;

      } catch (error) {
        this.customerName = "";

        this.message =
          error.response?.data?.message ||
          "JAMB Profile ID verification failed.";

        this.isError = true;

      } finally {
        this.verifying = false;
      }
    },

    // =========================================
    // BUY EXAM PIN
    // =========================================

    async buyPIN() {
      if (!this.canBuy || this.buying) {
        return;
      }

      const phone = String(this.phoneNumber || "")
        .replace(/\s+/g, "")
        .trim();

      if (!/^0[789][01]\d{8}$/.test(phone)) {
        this.message =
          "Please enter a valid Nigerian phone number.";

        this.isError = true;
        return;
      }

      this.buying = true;
      this.message = "";
      this.isError = false;
      this.purchased = false;

      try {
        const userId =
          this.$store.getters.userId;

        if (!userId) {
          throw new Error(
            "Your account could not be identified."
          );
        }

        const response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-education/buy`,
          {
            userId,

            examType:
              this.selectedService === "jamb"
                ? "JAMB"
                : this.selectedService === "waec-registration"
                  ? "WAEC Registration"
                  : "WAEC Result Checker",

            serviceID: this.selectedService,

            variationCode:
              this.selectedPackage.variation_code,

            packageName:
              this.selectedPackage.name,

            phoneNumber: phone,

            profileId: this.profileId || null,

            amount: Number(
              this.selectedPackage.variation_amount
            ),

            quantity: 1
          }
        );

        this.serialNumber =
          response.data?.serialNumber || "";

        this.pin =
          response.data?.pin || "";

        this.token =
          response.data?.token || "";

        this.purchased = !!(
          this.serialNumber ||
          this.pin ||
          this.token
        );

        this.message =
          response.data?.message ||
          "Exam PIN purchase completed.";

        this.isError = false;

        await this.loadHistory();

      } catch (error) {
        console.error(
          "Exam PIN purchase error:",
          error
        );

        this.message =
          error.response?.data?.message ||
          error.message ||
          "Exam PIN purchase failed.";

        this.isError = true;

      } finally {
        this.buying = false;
      }
    },

    // =========================================
    // PURCHASE HISTORY
    // =========================================

    async loadHistory() {
      try {
        const userId =
          this.$store.getters.userId;

        if (!userId) {
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-education/transactions/${userId}`
        );

        this.transactions =
          response.data?.transactions || [];

      } catch (error) {
        console.error(
          "Failed to load exam PIN history:",
          error
        );
      }
    }
  }
};
</script>

<style scoped>

/* =========================================
   MODAL OVERLAY
========================================= */

.exam-overlay {
  position: fixed;
  inset: 0;

  z-index: 999999;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 15px;

  box-sizing: border-box;

  background: rgba(0, 25, 50, 0.72);
  backdrop-filter: blur(5px);

  overflow-y: auto;
}

/* =========================================
   MODAL
========================================= */

.exam-modal {
  position: relative;

  display: block;

  width: 100%;
  max-width: 480px;

  max-height: 94vh;
  overflow-y: auto;

  padding: 22px;

  box-sizing: border-box;

  background: #fff9d9;
  color: #111;

  border: 1px solid #e8dca4;
  border-radius: 18px;

  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
}

/* =========================================
   HEADER
========================================= */

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 15px;

  margin-bottom: 20px;
  padding-bottom: 15px;

  border-bottom: 1px solid #e8dca4;
}

.exam-header h2 {
  margin: 0;

  color: #003366;

  font-size: 22px;
  font-weight: 800;
}

.exam-header p {
  margin: 5px 0 0;

  color: #555;
  font-size: 12px;
}

.close-btn {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  border: 1px solid #d8cda0;
  border-radius: 10px;

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

.close-btn:hover {
  background: #003366;
  color: white;
  border-color: #003366;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =========================================
   FORM
========================================= */

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #003366;

  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group select {
  display: block;

  width: 100%;
  box-sizing: border-box;

  padding: 13px;

  border: 1px solid #d8cda0;
  border-radius: 9px;

  background: #fffef8;
  color: #111;

  outline: none;

  font-size: 14px;

  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #003366;
  box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.08);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* =========================================
   LOADING
========================================= */

.loading-box {
  padding: 17px;

  margin-bottom: 17px;

  border-radius: 10px;
  border: 1px solid #e8dca4;

  background: #fffef8;
  color: #003366;

  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.loader {
  display: inline-block;

  width: 15px;
  height: 15px;

  margin-right: 7px;
  vertical-align: middle;

  border: 2px solid #c9d8e8;
  border-top-color: #168447;

  border-radius: 50%;

  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   JAMB VERIFICATION
========================================= */

.jamb-section {
  padding: 13px;

  border: 1px solid #e8dca4;
  border-radius: 11px;

  background: #fffef8;
}

.verify-btn {
  width: 100%;

  padding: 12px;

  margin-top: 10px;

  border: 1px solid #003366;
  border-radius: 9px;

  background: #003366;
  color: white;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.verify-btn:hover {
  background: #004785;
}

.verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verified {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-top: 10px;
  padding: 10px;

  border-radius: 8px;
  border: 1px solid #b6d8bd;

  background: #edf8ed;
  color: #176b35;

  font-size: 12px;
  font-weight: 700;
}

/* =========================================
   SUMMARY
========================================= */

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 12px;

  padding: 14px;

  border: 1px solid #b6d8bd;
  border-radius: 10px;

  background: #edf8ed;
  color: #003366;
}

.summary span {
  display: block;

  margin-bottom: 5px;

  color: #555;
  font-size: 11px;
}

.summary strong {
  font-size: 13px;
}

.summary-amount {
  text-align: right;
}

/* =========================================
   MESSAGES
========================================= */

.message {
  padding: 12px;

  margin-top: 13px;

  border-radius: 9px;

  font-size: 12px;
  font-weight: 600;
}

.message.success {
  background: #edf8ed;
  border: 1px solid #b6d8bd;

  color: #176b35;
}

.message.error {
  background: #fff0ed;
  border: 1px solid #e4aaa0;

  color: #b42318;
}

/* =========================================
   PURCHASE RESULT
========================================= */

.pin-result {
  margin-top: 15px;
  padding: 15px;

  border: 1px solid #b6d8bd;
  border-radius: 11px;

  background: #edf8ed;
  color: #111;
}

.pin-result h3 {
  margin: 0 0 14px;

  color: #168447;
  font-size: 16px;
}

.result-item {
  margin-top: 12px;
  padding-top: 10px;

  border-top: 1px solid #c9e2ce;
}

.result-item strong {
  color: #003366;
  font-size: 12px;
}

.result-item p {
  margin: 6px 0 0;

  color: #111;
  font-size: 14px;

  word-break: break-all;
}

.pin-value {
  font-size: 19px !important;
  font-weight: 800;
  letter-spacing: 1px;
}

/* =========================================
   BUY BUTTON
========================================= */

.buy-btn {
  width: 100%;

  padding: 14px;

  margin-top: 15px;

  border: 1px solid #168447;
  border-radius: 10px;

  background: #168447;
  color: white;

  font-size: 15px;
  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;
}

.buy-btn:hover {
  background: #106b38;
  border-color: #106b38;

  transform: translateY(-1px);

  box-shadow: 0 6px 18px rgba(22, 132, 71, 0.22);
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;

  transform: none;
  box-shadow: none;
}

/* =========================================
   PURCHASE HISTORY
========================================= */

.history {
  margin-top: 25px;
  padding-top: 17px;

  border-top: 1px solid #e8dca4;
}

.history h3 {
  margin: 0 0 12px;

  color: #003366;
  font-size: 15px;
  font-weight: 800;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;

  padding: 12px 0;

  border-bottom: 1px solid #e8dca4;
}

.history-info {
  min-width: 0;
}

.history-info strong {
  display: block;

  color: #003366;
  font-size: 12px;
}

.history-item small {
  display: block;

  margin-top: 5px;

  color: #666;
  font-size: 11px;
}

.status-success {
  color: #168447;
  font-size: 11px;
  font-weight: 800;

  white-space: nowrap;
}

.status-pending {
  color: #a66a00;
  font-size: 11px;
  font-weight: 800;

  white-space: nowrap;
}

.empty {
  padding: 13px;

  border-radius: 9px;

  background: #fffef8;
  color: #777;

  font-size: 12px;
  text-align: center;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 500px) {
  .exam-overlay {
    padding: 12px;
  }

  .exam-modal {
    padding: 17px;
    border-radius: 15px;
  }

  .exam-header h2 {
    font-size: 20px;
  }
}

</style>
