
<template>
  <div class="electricity-overlay" @click.self="closeModal">
    <div class="electricity-modal">

      <button
        class="close-btn"
        type="button"
        :disabled="verifying || purchasing"
        @click="closeModal"
      >
        ×
      </button>

      <div class="modal-header">
        <div class="electricity-icon">⚡</div>
        <div>
          <h2>Electricity</h2>
          <p class="subtitle">Pay your electricity bill or buy prepaid units</p>
        </div>
      </div>

      <div class="section-label">SELECT ELECTRICITY PROVIDER</div>

      <div class="providers">
        <button
          v-for="item in providers"
          :key="item.value"
          class="provider-btn"
          :class="{ active: selectedProvider === item.value }"
          :disabled="verifying || purchasing"
          @click="selectedProvider = item.value; customer = null; message = ''"
        >
          {{ item.name }}
        </button>
      </div>

      <div class="section-label">METER CATEGORY</div>

      <div class="meter-types">
        <button
          :class="{ active: meterType === 'prepaid' }"
          :disabled="verifying || purchasing"
          @click="meterType = 'prepaid'; customer = null; message = ''"
        >
          <span>⚡</span> Prepaid
        </button>

        <button
          :class="{ active: meterType === 'postpaid' }"
          :disabled="verifying || purchasing"
          @click="meterType = 'postpaid'; customer = null; message = ''"
        >
          <span>📄</span> Postpaid
        </button>
      </div>

      <div class="field">
        <label>Meter Number</label>
        <input
          v-model="meterNumber"
          type="text"
          inputmode="numeric"
          maxlength="20"
          placeholder="Enter your meter number"
          :disabled="verifying || purchasing"
        />
      </div>

      <button
        class="verify-btn"
        :disabled="!selectedProvider || !meterNumber || verifying || purchasing"
        @click="verifyMeter"
      >
        {{ verifying ? "Verifying Meter..." : "Verify Meter →" }}
      </button>

      <div v-if="customer" class="customer-box">
        <div class="verified-heading">
          <span>✓</span> Customer Verified
        </div>

        <div>
          <span>Customer</span>
          <strong>
            {{ customer.Customer_Name || customer.customer_name || "Verified Customer" }}
          </strong>
        </div>

        <div v-if="customer.Address">
          <span>Address</span>
          <strong>{{ customer.Address }}</strong>
        </div>

        <div v-if="customer.Customer_Account_Type">
          <span>Account Type</span>
          <strong>{{ customer.Customer_Account_Type }}</strong>
        </div>

        <div v-if="customer.Service_Band">
          <span>Service Band</span>
          <strong>{{ customer.Service_Band }}</strong>
        </div>
      </div>

      <div v-if="customer" class="field">
        <label>Payment Amount (₦)</label>
        <input
          v-model.number="amount"
          type="number"
          min="1"
          placeholder="Enter amount"
          :disabled="purchasing"
        />
      </div>

      <div v-if="customer" class="field">
        <label>Phone Number</label>
        <input
          v-model="phoneNumber"
          type="tel"
          maxlength="11"
          placeholder="08012345678"
          :disabled="purchasing"
        />
      </div>

      <button
        v-if="customer"
        class="buy-btn"
        :disabled="purchasing || !amount || Number(amount) <= 0 || !phoneNumber"
        @click="purchaseElectricity"
      >
        {{
          purchasing
            ? "Processing Payment..."
            : meterType === "prepaid"
              ? "⚡ Buy Electricity"
              : "Pay Electricity Bill"
        }}
      </button>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div v-if="token" class="token-box">
        <div class="token-title">⚡ ELECTRICITY TOKEN</div>
        <div class="token">{{ token }}</div>

        <div v-if="units" class="units">
          Units Purchased: {{ units }}
        </div>

        <p>Keep this token safe and enter it into your prepaid meter.</p>
      </div>

      <div class="secure-footer">
        <span>🔒</span> Secure Electricity Payment
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "Electricity",

  data() {
    return {
      providers: [
        { name: "Abuja", value: "abuja" },
        { name: "Benin", value: "benin" },
        { name: "Eko", value: "eko" },
        { name: "Enugu", value: "enugu" },
        { name: "Ibadan", value: "ibadan" },
        { name: "Ikeja", value: "ikeja" },
        { name: "Jos", value: "jos" },
        { name: "Kaduna", value: "kaduna" },
        { name: "Kano", value: "kano" },
        { name: "Port Harcourt", value: "portharcourt" },
        { name: "Yola", value: "yola" }
      ],

      selectedProvider: "",
      meterType: "prepaid",
      meterNumber: "",
      phoneNumber: "",
      amount: "",
      customer: null,
      token: "",
      units: "",
      verifying: false,
      purchasing: false,
      message: "",
      messageType: ""
    };
  },

  computed: {
    userId() {
      return this.$store.getters.userId;
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
    // CLOSE MODAL
    closeModal() {
      if (this.verifying || this.purchasing) return;

      this.$emit("close");
    },

    // ESCAPE KEY
    handleEscape(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    },

    async verifyMeter() {
      this.message = "";
      this.token = "";
      this.units = "";

      if (!this.selectedProvider || !this.meterNumber) return;

      this.verifying = true;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-electricity/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              provider: this.selectedProvider,
              meterNumber: this.meterNumber,
              meterType: this.meterType
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Meter verification failed.");
        }

        this.customer = data.customer || {};
        this.message = "Meter verified successfully.";
        this.messageType = "success";

      } catch (error) {
        this.customer = null;
        this.message = error.message || "Meter verification failed.";
        this.messageType = "error";

      } finally {
        this.verifying = false;
      }
    },

    async purchaseElectricity() {
      this.message = "";
      this.token = "";
      this.units = "";

      if (!this.customer || !this.amount || !this.phoneNumber) return;

      this.purchasing = true;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-electricity/buy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              userId: this.userId,
              provider: this.selectedProvider,
              meterNumber: this.meterNumber,
              meterType: this.meterType,
              amount: Number(this.amount),
              phoneNumber: this.phoneNumber
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Electricity payment failed.");
        }

        this.message = data.message || "Electricity payment successful.";
        this.messageType = "success";
        this.token = data.token || "";
        this.units = data.units || "";

        await this.$store.dispatch("loadEtrendAccount");
        await this.$store.dispatch("loadEtrendTransactions");

      } catch (error) {
        this.message = error.message || "Electricity payment failed.";
        this.messageType = "error";

      } finally {
        this.purchasing = false;
      }
    }
  }
};
</script>

<style scoped>
.electricity-overlay {
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

.electricity-modal {
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

.electricity-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #003366;
  color: #ffec99;
  font-size: 26px;
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
}

.provider-btn {
  padding: 11px 5px;
  border: 1px solid #d9cfaa;
  border-radius: 8px;
  background: #fffdf2;
  color: #222;
  font-size: 12px;
  font-weight: 600;
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

.meter-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.meter-types button {
  padding: 13px;
  border: 1px solid #d9cfaa;
  border-radius: 9px;
  background: #fffdf2;
  color: #222;
  font-weight: 700;
  cursor: pointer;
}

.meter-types button.active {
  background: #e4edf7;
  border: 2px solid #003366;
  color: #003366;
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

.customer-box {
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

.customer-box span {
  color: #555;
  font-size: 12px;
}

.customer-box strong {
  max-width: 65%;
  color: #172b1b;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
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

.token-box {
  margin-top: 17px;
  padding: 18px;
  border: 1px solid #b6d8bd;
  border-radius: 11px;
  background: #edf8ed;
  text-align: center;
}

.token-title {
  color: #003366;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 12px;
}

.token {
  padding: 13px;
  border: 1px dashed #168447;
  border-radius: 8px;
  background: white;
  color: #003366;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 2px;
  overflow-wrap: anywhere;
}

.units {
  margin-top: 10px;
  color: #168447;
  font-size: 14px;
  font-weight: 800;
}

.token-box p {
  margin-bottom: 0;
  color: #555;
  font-size: 12px;
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
  .electricity-modal {
    padding: 18px;
    border-radius: 14px;
  }

  .providers {
    gap: 6px;
  }

  .provider-btn {
    padding: 10px 3px;
    font-size: 11px;
  }

  h2 {
    font-size: 21px;
  }
}
</style>
