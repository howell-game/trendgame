<template>
  <div class="data-overlay">
    <div class="data-modal">

      <!-- HEADER -->
      <div class="data-header">
        <div>
          <h2>Data</h2>
          <p>Choose a network and data package</p>
        </div>

        <button
          class="close-btn"
          @click="$emit('close')"
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
          class="network-btn"
          :class="{
            active:
              selectedNetwork === item.value
          }"
          @click="selectNetwork(item.value)"
        >
          {{ item.label }}
        </button>

      </div>


      <!-- LOADING PACKAGES -->
      <div
        v-if="loadingPackages"
        class="loading-box"
      >
        Loading {{ selectedNetworkLabel }}
        packages...
      </div>


      <!-- PACKAGES -->
      <template
        v-if="
          !loadingPackages &&
          packages.length
        "
      >

        <div class="section-title package-title">
          Select Package
        </div>

        <div class="packages-list">

          <button
            v-for="item in packages"
            :key="item.variationCode"
            class="package-card"
            :class="{
              selected:
                selectedPackage?.variationCode ===
                item.variationCode
            }"
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


      <!-- PHONE -->
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
        />


        <div class="selected-summary">

          <div>
            <span>Package</span>
            <strong>
              {{ formatPackageName(
                selectedPackage.name
              ) }}
            </strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>
              ₦{{ formatAmount(
                selectedPackage.amount
              ) }}
            </strong>
          </div>

        </div>


        <button
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


      <!-- MESSAGE -->
      <div
        v-if="errorMessage"
        class="message error"
      >
        {{ errorMessage }}
      </div>

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
      return import.meta.env
        .VITE_APP_BASE_URL;
    },

    selectedNetworkLabel() {

      const network =
        this.networks.find(
          item =>
            item.value ===
            this.selectedNetwork
        );

      return network
        ? network.label
        : "";
    }
  },


  methods: {

    async selectNetwork(network) {

      this.selectedNetwork =
        network;

      this.selectedPackage =
        null;

      this.phoneNumber = "";

      this.packages = [];

      this.errorMessage = "";

      this.successMessage = "";

      await this.loadPackages();
    },


    async loadPackages() {

      if (!this.selectedNetwork) {
        return;
      }

      this.loadingPackages =
        true;

      this.errorMessage = "";

      try {

        const response =
          await axios.get(
            `${this.baseUrl}/api/etrend-data/packages/${this.selectedNetwork}`,
            {
              headers: {
                Authorization:
                  `Bearer ${this.token}`
              }
            }
          );


        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
            "Unable to load data packages."
          );
        }


        this.packages =
          Array.isArray(
            response.data.packages
          )
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

        this.loadingPackages =
          false;
      }
    },


    selectPackage(item) {

      this.selectedPackage =
        item;

      this.errorMessage = "";

      this.successMessage = "";
    },


    async purchaseData() {

      this.errorMessage = "";

      this.successMessage = "";


      if (!this.selectedPackage) {
        this.errorMessage =
          "Please select a data package.";

        return;
      }


      const phone =
        String(this.phoneNumber || "")
          .replace(/\s+/g, "")
          .trim();


      if (
        !/^0[789][01]\d{8}$/.test(
          phone
        )
      ) {

        this.errorMessage =
          "Please enter a valid Nigerian phone number.";

        return;
      }


      this.purchasing =
        true;


      try {

        const response =
          await axios.post(
            `${this.baseUrl}/api/etrend-data/buy`,
            {
              userId:
                this.userId,

              network:
                this.selectedNetwork,

              phoneNumber:
                phone,

              variationCode:
                this.selectedPackage
                  .variationCode
            },
            {
              headers: {
                Authorization:
                  `Bearer ${this.token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );


        if (
          response.data?.success
        ) {

          this.successMessage =
            response.data.message ||
            "Data purchase successful.";

          this.phoneNumber = "";

          this.selectedPackage =
            null;

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

        this.purchasing =
          false;
      }
    },


    formatAmount(amount) {

      return Number(
        amount || 0
      ).toLocaleString(
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

      const cleaned =
        String(name)
          .replace(/^N[\d,.]+\s*/i, "")
          .replace(
            /^Airtel Data Bundle\s*-\s*/i,
            ""
          )
          .replace(
            /^Glo Data\s*/i,
            ""
          );

      return cleaned.trim();
    },


    getValidity(name) {

      if (!name) {
        return "Data Bundle";
      }

      const text =
        String(name);

      const match =
        text.match(
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

.data-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 15px;

  background:
    rgba(0, 0, 0, 0.72);

  overflow-y: auto;
}


.data-modal {
  width: 100%;
  max-width: 520px;

  max-height: 94vh;

  overflow-y: auto;

  padding: 18px;

  border-radius: 16px;

  background:
    linear-gradient(
      145deg,
      #050505,
      #111111
    );

  border:
    1px solid #292929;

  box-shadow:
    0 15px 45px
    rgba(0, 0, 0, 0.5);
}


.data-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  margin-bottom: 18px;
}


.data-header h2 {
  margin: 0;

  color: #ffffff;

  font-size: 22px;
}


.data-header p {
  margin: 4px 0 0;

  color: #9da6b5;

  font-size: 12px;
}


.close-btn {
  width: 34px;
  height: 34px;

  border: none;

  border-radius: 50%;

  background: #190709;

  color: #ffffff;

  font-size: 23px;

  cursor: pointer;
}


.section-title {
  margin-bottom: 9px;

  color: #ffffff;

  font-size: 13px;

  font-weight: 600;
}


.network-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 8px;

  margin-bottom: 18px;
}


.network-btn {
  padding: 11px 5px;

  border-radius: 9px;

  border:
    1px solid #16385f;

  background:
    linear-gradient(
      145deg,
      #071426,
      #0d2340
    );

  color: #ffffff;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;
}


.network-btn.active {
  border-color: #e00016;

  background:
    linear-gradient(
      145deg,
      #190709,
      #310b10
    );
}


.loading-box,
.empty-box {
  padding: 20px;

  text-align: center;

  border-radius: 10px;

  background: #071426;

  color: #b9c1cf;

  font-size: 13px;
}


.package-title {
  margin-top: 5px;
}


.packages-list {
  display: flex;

  flex-direction: column;

  gap: 7px;

  max-height: 310px;

  overflow-y: auto;

  padding-right: 3px;
}


.package-card {
  width: 100%;

  display: flex;

  justify-content: space-between;

  align-items: center;

  text-align: left;

  padding: 11px 12px;

  border:
    1px solid #292929;

  border-radius: 10px;

  background:
    linear-gradient(
      145deg,
      #050505,
      #111111
    );

  color: #ffffff;

  cursor: pointer;
}


.package-card:hover {
  border-color: #16385f;
}


.package-card.selected {
  border-color: #e00016;

  background:
    linear-gradient(
      145deg,
      #190709,
      #310b10
    );
}


.package-name {
  font-size: 13px;

  font-weight: 600;
}


.package-details {
  margin-top: 3px;

  color: #8f98a7;

  font-size: 10px;
}


.package-price {
  margin-left: 10px;

  color: #ffffff;

  font-size: 14px;

  font-weight: 700;

  white-space: nowrap;
}


.purchase-section {
  margin-top: 17px;
}


.phone-input {
  width: 100%;

  box-sizing: border-box;

  padding: 12px;

  border:
    1px solid #292929;

  border-radius: 9px;

  outline: none;

  background: #071426;

  color: #ffffff;

  font-size: 14px;
}


.phone-input:focus {
  border-color: #16385f;
}


.selected-summary {
  display: flex;

  justify-content: space-between;

  gap: 10px;

  margin-top: 10px;

  padding: 11px;

  border-radius: 9px;

  background: #071426;

  border:
    1px solid #16385f;
}


.selected-summary span {
  display: block;

  margin-bottom: 3px;

  color: #8f98a7;

  font-size: 10px;
}


.selected-summary strong {
  color: #ffffff;

  font-size: 12px;
}


.buy-btn {
  width: 100%;

  margin-top: 12px;

  padding: 13px;

  border: none;

  border-radius: 9px;

  background:
    linear-gradient(
      145deg,
      #e00016,
      #9d000e
    );

  color: #ffffff;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;
}


.buy-btn:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


.message {
  margin-top: 12px;

  padding: 10px;

  border-radius: 8px;

  font-size: 12px;

  text-align: center;
}


.message.error {
  background: #310b10;

  color: #ffb3ba;

  border:
    1px solid #5c151d;
}


.message.success {
  background: #071426;

  color: #b9d7ff;

  border:
    1px solid #16385f;
}


@media (max-width: 420px) {

  .data-modal {
    padding: 14px;
  }

  .network-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .packages-list {
    max-height: 270px;
  }
}

</style>