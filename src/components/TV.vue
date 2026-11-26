
<template>
  <div class="tv-overlay" @click.self="closeModal">
    <div class="tv-modal">

      <button class="close-btn" @click="closeModal">×</button>

      <div class="modal-header">
        <div class="tv-icon">📺</div>
        <div>
          <h2>TV Subscription</h2>
          <p class="subtitle">Subscribe or renew your TV decoder</p>
        </div>
      </div>

      <div class="section-label">SELECT TV PROVIDER</div>

      <div class="providers">
        <button
          v-for="item in providers"
          :key="item.value"
          class="provider-btn"
          :class="{ active: selectedProvider === item.value }"
          @click="selectProvider(item.value)"
        >
          {{ item.name }}
        </button>
      </div>

      <div class="field">
        <label>Smartcard Number</label>
        <input
          v-model="smartcardNumber"
          type="text"
          inputmode="numeric"
          maxlength="20"
          placeholder="Enter smartcard number"
        />
      </div>

      <button
        class="verify-btn"
        :disabled="!selectedProvider || !smartcardNumber || verifying"
        @click="verifySmartcard"
      >
        {{ verifying ? "Verifying Smartcard..." : "Verify Smartcard →" }}
      </button>

      <div v-if="customer" class="customer-box">
        <div class="verified-heading">
          <span>✓</span> Customer Verified
        </div>

        <div>
          <span>Customer</span>
          <strong>{{ customerName }}</strong>
        </div>

        <div v-if="customer.currentBouquet">
          <span>Current Package</span>
          <strong>{{ customer.currentBouquet }}</strong>
        </div>

        <div v-if="customer.Due_Date">
          <span>Due Date</span>
          <strong>{{ customer.Due_Date }}</strong>
        </div>
      </div>

      <template v-if="customer">

        <div class="section-label">SUBSCRIPTION OPTION</div>

        <div class="subscription-types">
          <button
            :class="{ active: subscriptionType === 'change' }"
            @click="subscriptionType = 'change'; selectedPackage = null"
          >
            Change Package
          </button>

          <button
            :class="{ active: subscriptionType === 'renew' }"
            @click="subscriptionType = 'renew'; selectedPackage = null"
          >
            Renew
          </button>
        </div>

        <div v-if="subscriptionType === 'change'" class="packages">
          <div class="section-label">SELECT YOUR PACKAGE</div>

          <div v-if="!packages.length" class="empty-packages">
            No packages available for this provider.
          </div>

          <button
            v-for="pkg in packages"
            :key="pkg.variation_code"
            class="package"
            :class="{
              selected:
                selectedPackage &&
                selectedPackage.variation_code === pkg.variation_code
            }"
            @click="selectedPackage = pkg"
          >
            <span>{{ pkg.name }}</span>

            <strong>
              ₦{{ Number(pkg.variation_amount).toLocaleString() }}
            </strong>
          </button>
        </div>

        <div v-if="subscriptionType === 'renew'" class="renew-box">
          <span>Renewal Amount</span>
          <strong>₦{{ Number(renewalAmount).toLocaleString() }}</strong>
        </div>

        <div class="field">
          <label>Phone Number</label>
          <input
            v-model="phoneNumber"
            type="tel"
            maxlength="11"
            inputmode="numeric"
            placeholder="08012345678"
          />
        </div>

        <button
          class="buy-btn"
          :disabled="
            purchasing ||
            !phoneNumber ||
            (subscriptionType === 'change' && !selectedPackage) ||
            (subscriptionType === 'renew' && renewalAmount <= 0)
          "
          @click="purchaseTV"
        >
          {{
            purchasing
              ? "Processing Payment..."
              : "Subscribe Now"
          }}
        </button>

      </template>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="secure-footer">
        <span>🔒</span> Secure TV Subscription Payment
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "TV",

  data() {
    return {
      providers: [
        { name: "DStv", value: "dstv" },
        { name: "GOtv", value: "gotv" },
        { name: "StarTimes", value: "startimes" }
      ],

      selectedProvider: "",
      smartcardNumber: "",
      phoneNumber: "",
      customer: null,
      packages: [],
      selectedPackage: null,
      subscriptionType: "change",
      verifying: false,
      purchasing: false,
      message: "",
      messageType: ""
    };
  },

  computed: {
    userId() {
      return this.$store.getters.userId;
    },

    customerName() {
      return (
        this.customer?.Customer_Name ||
        this.customer?.customer_name ||
        "Verified Customer"
      );
    },

    renewalAmount() {
      return Number(
        this.customer?.Renewal_Amount ||
        this.customer?.renewal_amount ||
        0
      );
    }
  },

  mounted() {
    window.addEventListener("keydown", this.handleEscape);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleEscape);
  },

  beforeDestroy() {
    // Supports Vue 2 projects as well.
    window.removeEventListener("keydown", this.handleEscape);
  },

  methods: {
    closeModal() {
      this.$emit("close");
    },

    handleEscape(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    },

    selectProvider(provider) {
      this.selectedProvider = provider;
      this.customer = null;
      this.packages = [];
      this.selectedPackage = null;
      this.message = "";
      this.phoneNumber = "";
      this.subscriptionType = "change";

      this.loadPackages();
    },

    async loadPackages() {
      if (!this.selectedProvider) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/packages/${this.selectedProvider}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load TV packages."
          );
        }

        this.packages = data.packages || [];

      } catch (error) {
        console.error(error);

        this.message =
          error.message || "Unable to load TV packages.";

        this.messageType = "error";
      }
    },

    async verifySmartcard() {
      this.message = "";
      this.customer = null;
      this.selectedPackage = null;

      if (!this.selectedProvider || !this.smartcardNumber) return;

      this.verifying = true;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              provider: this.selectedProvider,
              smartcardNumber: this.smartcardNumber
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Smartcard verification failed."
          );
        }

        this.customer = data.customer || {};

        this.message = "Smartcard verified successfully.";
        this.messageType = "success";

      } catch (error) {
        this.customer = null;

        this.message =
          error.message || "Smartcard verification failed.";

        this.messageType = "error";

      } finally {
        this.verifying = false;
      }
    },

    async purchaseTV() {
      this.message = "";

      if (
        !this.selectedProvider ||
        !this.smartcardNumber ||
        !this.phoneNumber ||
        !this.customer
      ) {
        return;
      }

      if (
        this.subscriptionType === "change" &&
        !this.selectedPackage
      ) {
        this.message = "Select a TV package.";
        this.messageType = "error";
        return;
      }

      if (
        this.subscriptionType === "renew" &&
        this.renewalAmount <= 0
      ) {
        this.message = "A valid renewal amount is unavailable.";
        this.messageType = "error";
        return;
      }

      this.purchasing = true;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/buy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              userId: this.userId,
              provider: this.selectedProvider,
              smartcardNumber: this.smartcardNumber,
              variationCode:
                this.selectedPackage?.variation_code || "renew",
              phoneNumber: this.phoneNumber,
              subscriptionType: this.subscriptionType
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "TV subscription failed."
          );
        }

        this.message =
          data.message || "TV subscription successful.";

        this.messageType = "success";

        await this.$store.dispatch("loadEtrendAccount");
        await this.$store.dispatch("loadEtrendTransactions");

      } catch (error) {
        this.message =
          error.message || "TV subscription failed.";

        this.messageType = "error";

      } finally {
        this.purchasing = false;
      }
    }
  }
};
</script>

<style scoped>
.tv-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 25, 50, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  backdrop-filter: blur(5px);
}

.tv-modal {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 94vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 18px;
  background: #fff9d9;
  border: 1px solid #e8dca4;
  color: #111;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 13px;
  right: 17px;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: #f1e8bd;
  color: #003366;
  font-size: 25px;
  cursor: pointer;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4d9ad;
  margin-bottom: 20px;
}

.tv-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #003366;
  color: #ffec99;
  font-size: 25px;
}

h2 {
  margin: 0;
  color: #003366;
  font-size: 23px;
  font-weight: 800;
}

.subtitle {
  margin: 5px 0 0;
  color: #5c5c50;
  font-size: 12px;
}

.section-label {
  color: #003366;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.7px;
  margin: 18px 0 10px;
}

.providers {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.provider-btn {
  padding: 12px 5px;
  border: 1px solid #d9cfaa;
  border-radius: 8px;
  background: #fffdf2;
  color: #222;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.provider-btn:hover {
  border-color: #003366;
}

.provider-btn.active {
  background: #003366;
  border-color: #003366;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 51, 102, 0.2);
}

.field {
  margin-top: 16px;
}

.field label {
  display: block;
  margin-bottom: 7px;
  color: #003366;
  font-size: 13px;
  font-weight: 700;
}

.field input {
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #d4c99f;
  border-radius: 8px;
  background: #fffef8;
  color: #111;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}

.field input:focus {
  border-color: #003366;
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
}

.field input::placeholder {
  color: #999;
}

.verify-btn,
.buy-btn {
  width: 100%;
  min-height: 47px;
  margin-top: 15px;
  border: none;
  border-radius: 9px;
  color: white;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

.verify-btn {
  background: #003366;
}

.verify-btn:hover {
  background: #004785;
}

.buy-btn {
  background: #168447;
  margin-top: 18px;
}

.buy-btn:hover {
  background: #106b38;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.customer-box,
.renew-box {
  margin-top: 18px;
  padding: 15px;
  border: 1px solid #b6d8bd;
  border-radius: 10px;
  background: #edf8ed;
}

.verified-heading {
  margin-bottom: 10px;
  color: #168447;
  font-size: 13px;
  font-weight: 800;
}

.verified-heading span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border-radius: 50%;
  background: #168447;
  color: white;
}

.customer-box div:not(.verified-heading) {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid #d5e9d8;
}

.customer-box span,
.renew-box span {
  color: #555;
  font-size: 12px;
}

.customer-box strong,
.renew-box strong {
  color: #172b1b;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
}

.subscription-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.subscription-types button {
  padding: 13px 8px;
  border: 1px solid #d9cfaa;
  border-radius: 9px;
  background: #fffdf2;
  color: #222;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.subscription-types button.active {
  background: #e4edf7;
  border: 2px solid #003366;
  color: #003366;
}

.packages {
  margin-top: 18px;
}

.package {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  text-align: left;
  background: #fffef8;
  color: #222;
  border: 1px solid #d9cfaa;
  padding: 13px;
  border-radius: 9px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.package:hover {
  border-color: #003366;
}

.package.selected {
  background: #e4edf7;
  border: 2px solid #003366;
  color: #003366;
}

.package strong {
  white-space: nowrap;
  color: #168447;
}

.empty-packages {
  padding: 14px;
  background: #fffdf2;
  border-radius: 8px;
  color: #777;
  font-size: 13px;
}

.renew-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
}

.renew-box strong {
  color: #168447;
  font-size: 16px;
}

.message {
  margin-top: 14px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.message.success {
  background: #e2f5e6;
  border: 1px solid #a5d8b0;
  color: #146b32;
}

.message.error {
  background: #ffebeb;
  border: 1px solid #edb5b5;
  color: #b42318;
}

.secure-footer {
  margin-top: 20px;
  padding-top: 13px;
  border-top: 1px solid #e4d9ad;
  color: #777;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 450px) {
  .tv-modal {
    padding: 18px;
    border-radius: 14px;
  }

  .provider-btn {
    font-size: 12px;
  }

  h2 {
    font-size: 21px;
  }
}
</style>
