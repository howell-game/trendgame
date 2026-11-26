
<template>
  <div class="data-overlay" @click.self="closeModal">
    <div class="data-modal">

      <!-- HEADER -->
      <div class="data-header">
        <div>
          <h2>Buy Data</h2>
          <p>Choose a network and data package</p>
        </div>

        <button
          type="button"
          class="close-btn"
          @click="closeModal"
          :disabled="purchasing || loadingPackages"
        >
          ×
        </button>
      </div>

      <!-- NETWORKS -->
      <div class="section-title">
        Select Network
      </div>

      <div class="network-grid">
        <button
          v-for="item in networks"
          :key="item.value"
          type="button"
          class="network-btn"
          :class="{
            active: selectedNetwork === item.value
          }"
          :disabled="purchasing || loadingPackages"
          @click="selectNetwork(item.value)"
        >
          <span class="network-icon">
            {{ item.label.charAt(0) }}
          </span>
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- LOADING PACKAGES -->
      <div
        v-if="loadingPackages"
        class="loading-box"
      >
        <span class="loader"></span>
        Loading {{ selectedNetworkLabel }} packages...
      </div>

      <!-- PACKAGES -->
      <template
        v-if="!loadingPackages && packages.length"
      >
        <div class="section-title package-title">
          Select Package
        </div>

        <div class="packages-list">
          <button
            v-for="item in packages"
            :key="item.variationCode"
            type="button"
            class="package-card"
            :class="{
              selected:
                selectedPackage?.variationCode === item.variationCode
            }"
            :disabled="purchasing"
            @click="selectPackage(item)"
          >
            <div class="package-info">
              <div class="package-name">
                {{ formatPackageName(item.name) }}
              </div>

              <div class="package-details">
                {{ getValidity(item.name) }}
              </div>
            </div>

            <div class="package-price">
              ₦{{ formatAmount(item.amount) }}
            </div>
          </button>
        </div>
      </template>

      <!-- NO PACKAGES -->
      <div
        v-if="
          !loadingPackages &&
          selectedNetwork &&
          !packages.length &&
          !errorMessage
        "
        class="empty-box"
      >
        No data packages available.
      </div>

      <!-- PHONE AND PURCHASE -->
      <div
        v-if="selectedPackage"
        class="purchase-section"
      >
        <div class="section-title">
          Phone Number
        </div>

        <input
          v-model="phoneNumber"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          placeholder="08012345678"
          class="phone-input"
          :disabled="purchasing"
        />

        <div class="selected-summary">
          <div>
            <span>Package</span>
            <strong>
              {{ formatPackageName(selectedPackage.name) }}
            </strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>
              ₦{{ formatAmount(selectedPackage.amount) }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="buy-btn"
          :disabled="purchasing"
          @click="purchaseData"
        >
          {{
            purchasing
              ? "PROCESSING..."
              : "BUY DATA"
          }}
        </button>
      </div>

      <!-- ERROR -->
      <div
        v-if="errorMessage"
        class="message error"
      >
        {{ errorMessage }}
      </div>

      <!-- SUCCESS -->
      <div
        v-if="successMessage"
        class="message success"
      >
        {{ successMessage }}
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Data",

  data() {
    return {
      networks: [
        {
          label: "MTN",
          value: "mtn"
        },
        {
          label: "Airtel",
          value: "airtel"
        },
        {
          label: "Glo",
          value: "glo"
        },
        {
          label: "9mobile",
          value: "9mobile"
        }
      ],

      selectedNetwork: "",
      packages: [],
      selectedPackage: null,
      phoneNumber: "",
      loadingPackages: false,
      purchasing: false,
      errorMessage: "",
      successMessage: ""
    };
  },

  computed: {
    userId() {
      return this.$store.getters.userId;
    },

    token() {
      return this.$store.state.token;
    },

    baseUrl() {
      return import.meta.env.VITE_APP_BASE_URL;
    },

    selectedNetworkLabel() {
      const network = this.networks.find(
        item => item.value === this.selectedNetwork
      );

      return network ? network.label : "";
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
      if (this.purchasing || this.loadingPackages) {
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

    async selectNetwork(network) {
      if (this.purchasing || this.loadingPackages) {
        return;
      }

      this.selectedNetwork = network;
      this.selectedPackage = null;
      this.phoneNumber = "";
      this.packages = [];

      this.errorMessage = "";
      this.successMessage = "";

      await this.loadPackages();
    },

    // =========================================
    // LOAD PACKAGES
    // =========================================

    async loadPackages() {
      if (!this.selectedNetwork) {
        return;
      }

      this.loadingPackages = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${this.baseUrl}/api/etrend-data/packages/${this.selectedNetwork}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
            "Unable to load data packages."
          );
        }

        this.packages = Array.isArray(response.data.packages)
          ? response.data.packages
          : [];

      } catch (error) {
        console.error(
          "❌ Failed to load data packages:",
          error
        );

        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Unable to load data packages.";

      } finally {
        this.loadingPackages = false;
      }
    },

    // =========================================
    // SELECT PACKAGE
    // =========================================

    selectPackage(item) {
      if (this.purchasing) return;

      this.selectedPackage = item;

      this.errorMessage = "";
      this.successMessage = "";
    },

    // =========================================
    // PURCHASE DATA
    // =========================================

    async purchaseData() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.userId) {
        this.errorMessage =
          "Your account could not be identified.";

        return;
      }

      if (!this.selectedNetwork) {
        this.errorMessage =
          "Please select a network.";

        return;
      }

      if (!this.selectedPackage) {
        this.errorMessage =
          "Please select a data package.";

        return;
      }

      const phone = String(this.phoneNumber || "")
        .replace(/\s+/g, "")
        .trim();

      if (!/^0[789][01]\d{8}$/.test(phone)) {
        this.errorMessage =
          "Please enter a valid Nigerian phone number.";

        return;
      }

      this.purchasing = true;

      try {
        const response = await axios.post(
          `${this.baseUrl}/api/etrend-data/buy`,
          {
            userId: this.userId,
            network: this.selectedNetwork,
            phoneNumber: phone,
            variationCode: this.selectedPackage.variationCode
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data?.success) {
          this.successMessage =
            response.data.message ||
            "Data purchase successful.";

          this.phoneNumber = "";
          this.selectedPackage = null;

          return;
        }

        this.errorMessage =
          response.data?.message ||
          "Data purchase failed.";

      } catch (error) {
        console.error(
          "❌ Data purchase failed:",
          error
        );

        this.errorMessage =
          error.response?.data?.message ||
          "Unable to complete data purchase.";

      } finally {
        this.purchasing = false;
      }
    },

    // =========================================
    // FORMATTING
    // =========================================

    formatAmount(amount) {
      return Number(amount || 0).toLocaleString(
        "en-NG",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      );
    },

    formatPackageName(name) {
      if (!name) {
        return "Data Package";
      }

      const cleaned = String(name)
        .replace(/^N[\d,.]+\s*/i, "")
        .replace(/^Airtel Data Bundle\s*-\s*/i, "")
        .replace(/^Glo Data\s*/i, "");

      return cleaned.trim();
    },

    getValidity(name) {
      if (!name) {
        return "Data Bundle";
      }

      const text = String(name);

      const match = text.match(
        /(\d+\s*(?:hrs?|hours?|days?|day|weeks?|week|months?|month))/i
      );

      return match
        ? `Valid for ${match[1]}`
        : "Data Bundle";
    }
  }
};
</script>

<style scoped>

/* =========================================
   MODAL OVERLAY
========================================= */

.data-overlay {
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

.data-modal {
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

.data-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;
  margin-bottom: 20px;

  padding-bottom: 15px;
  border-bottom: 1px solid #e8dca4;
}

.data-header h2 {
  margin: 0;

  color: #003366;
  font-size: 22px;
  font-weight: 800;
}

.data-header p {
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
   SECTION TITLES
========================================= */

.section-title {
  margin-bottom: 9px;

  color: #003366;
  font-size: 13px;
  font-weight: 800;
}

.package-title {
  margin-top: 5px;
}

/* =========================================
   NETWORKS
========================================= */

.network-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  gap: 9px;
  margin-bottom: 19px;
}

.network-btn {
  min-height: 70px;

  padding: 9px 5px;

  border-radius: 12px;
  border: 1px solid #e1d7ac;

  background: #fffef8;
  color: #111;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5px;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
  transition: 0.2s ease;
}

.network-btn:hover {
  border-color: #003366;
  transform: translateY(-2px);
}

.network-btn.active {
  background: #e7f4e8;
  border: 2px solid #168447;
  color: #003366;
}

.network-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.network-icon {
  width: 28px;
  height: 28px;

  border-radius: 50%;

  background: #003366;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 800;
}

.network-btn.active .network-icon {
  background: #168447;
}

/* =========================================
   LOADING AND EMPTY STATES
========================================= */

.loading-box,
.empty-box {
  padding: 18px;

  text-align: center;

  border-radius: 10px;
  border: 1px solid #e8dca4;

  background: #fffef8;
  color: #003366;

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
   PACKAGES
========================================= */

.packages-list {
  display: flex;
  flex-direction: column;

  gap: 8px;

  max-height: 310px;
  overflow-y: auto;

  padding: 2px 3px 2px 0;
}

.package-card {
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 10px;
  text-align: left;

  padding: 13px;

  border: 1px solid #e1d7ac;
  border-radius: 11px;

  background: #fffef8;
  color: #111;

  cursor: pointer;
  transition: 0.2s ease;
}

.package-card:hover {
  border-color: #003366;
  background: #f5f7f8;
}

.package-card.selected {
  border: 2px solid #168447;
  background: #e7f4e8;
}

.package-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.package-name {
  color: #003366;

  font-size: 13px;
  font-weight: 700;
}

.package-details {
  margin-top: 4px;

  color: #666;
  font-size: 11px;
}

.package-price {
  margin-left: 10px;

  color: #168447;

  font-size: 14px;
  font-weight: 800;

  white-space: nowrap;
}

/* =========================================
   PURCHASE SECTION
========================================= */

.purchase-section {
  margin-top: 20px;
  padding-top: 15px;

  border-top: 1px solid #e8dca4;
}

.phone-input {
  width: 100%;
  box-sizing: border-box;

  padding: 13px;

  border: 1px solid #d8cda0;
  border-radius: 9px;

  outline: none;

  background: #fffef8;
  color: #111;

  font-size: 14px;
}

.phone-input::placeholder {
  color: #888;
}

.phone-input:focus {
  border-color: #003366;
  box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.08);
}

.phone-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* =========================================
   SELECTED SUMMARY
========================================= */

.selected-summary {
  display: flex;
  justify-content: space-between;

  gap: 12px;

  margin-top: 12px;
  padding: 13px;

  border-radius: 10px;
  border: 1px solid #b6d8bd;

  background: #edf8ed;
}

.selected-summary span {
  display: block;

  margin-bottom: 4px;

  color: #555;
  font-size: 11px;
}

.selected-summary strong {
  color: #003366;
  font-size: 12px;
}

/* =========================================
   BUY BUTTON
========================================= */

.buy-btn {
  width: 100%;

  margin-top: 14px;
  padding: 14px;

  border: 1px solid #168447;
  border-radius: 10px;

  background: #168447;
  color: white;

  font-size: 14px;
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
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* =========================================
   MESSAGES
========================================= */

.message {
  margin-top: 13px;
  padding: 12px;

  border-radius: 9px;

  font-size: 12px;
  font-weight: 600;

  text-align: center;
}

.message.error {
  background: #fff0ed;
  color: #b42318;
  border: 1px solid #e4aaa0;
}

.message.success {
  background: #edf8ed;
  color: #176b35;
  border: 1px solid #b6d8bd;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 500px) {
  .data-modal {
    padding: 17px;
    border-radius: 15px;
  }

  .network-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .packages-list {
    max-height: 270px;
  }

  .data-header h2 {
    font-size: 20px;
  }
}

</style>
