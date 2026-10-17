<template>
  <div class="electricity-overlay">

    <div class="electricity-modal">

      <button
        class="close-btn"
        @click="$emit('close')"
      >
        ×
      </button>

      <h2>Electricity</h2>

      <p class="subtitle">
        Pay your electricity bill or buy prepaid units
      </p>


      <!-- PROVIDERS -->

      <div class="providers">

        <button
          v-for="item in providers"
          :key="item.value"
          class="provider-btn"
          :class="{
            active:
              selectedProvider ===
              item.value
          }"
          @click="
            selectedProvider =
              item.value
          "
        >
          {{ item.name }}
        </button>

      </div>


      <!-- METER TYPE -->

      <div class="meter-types">

        <button
          :class="{
            active:
              meterType ===
              'prepaid'
          }"
          @click="
            meterType = 'prepaid';
            customer = null
          "
        >
          Prepaid
        </button>

        <button
          :class="{
            active:
              meterType ===
              'postpaid'
          }"
          @click="
            meterType = 'postpaid';
            customer = null
          "
        >
          Postpaid
        </button>

      </div>


      <!-- METER -->

      <div class="field">

        <label>
          Meter Number
        </label>

        <input
          v-model="meterNumber"
          type="text"
          inputmode="numeric"
          maxlength="20"
          placeholder="Enter meter number"
        />

      </div>


      <button
        class="verify-btn"
        :disabled="
          !selectedProvider ||
          !meterNumber ||
          verifying
        "
        @click="verifyMeter"
      >
        {{
          verifying
            ? "Verifying..."
            : "Verify Meter"
        }}
      </button>


      <!-- CUSTOMER -->

      <div
        v-if="customer"
        class="customer-box"
      >

        <div>
          <span>Customer</span>

          <strong>
            {{
              customer.Customer_Name ||
              customer.customer_name ||
              "Verified Customer"
            }}
          </strong>
        </div>

        <div
          v-if="customer.Address"
        >
          <span>Address</span>

          <strong>
            {{ customer.Address }}
          </strong>
        </div>

        <div
          v-if="customer.Customer_Account_Type"
        >
          <span>Account Type</span>

          <strong>
            {{
              customer.Customer_Account_Type
            }}
          </strong>
        </div>

        <div
          v-if="customer.Service_Band"
        >
          <span>Service Band</span>

          <strong>
            {{ customer.Service_Band }}
          </strong>
        </div>

      </div>


      <!-- AMOUNT -->

      <div
        v-if="customer"
        class="field"
      >

        <label>
          Amount
        </label>

        <input
          v-model.number="amount"
          type="number"
          min="1"
          placeholder="Enter amount"
        />

      </div>


      <!-- PHONE -->

      <div
        v-if="customer"
        class="field"
      >

        <label>
          Phone Number
        </label>

        <input
          v-model="phoneNumber"
          type="tel"
          maxlength="11"
          placeholder="08012345678"
        />

      </div>


      <!-- PURCHASE -->

      <button
        v-if="customer"
        class="buy-btn"
        :disabled="
          purchasing ||
          !amount ||
          !phoneNumber
        "
        @click="purchaseElectricity"
      >
        {{
          purchasing
            ? "Processing..."
            : meterType ===
              "prepaid"
              ? "Buy Electricity"
              : "Pay Electricity Bill"
        }}
      </button>


      <!-- MESSAGE -->

      <div
        v-if="message"
        class="message"
        :class="messageType"
      >
        {{ message }}
      </div>


      <!-- TOKEN -->

      <div
        v-if="token"
        class="token-box"
      >

        <div class="token-title">
          Electricity Token
        </div>

        <div class="token">
          {{ token }}
        </div>

        <div
          v-if="units"
          class="units"
        >
          Units: {{ units }}
        </div>

        <p>
          Keep this token safe and enter it
          into your prepaid meter.
        </p>

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
        {
          name: "Abuja",
          value: "abuja"
        },
        {
          name: "Benin",
          value: "benin"
        },
        {
          name: "Eko",
          value: "eko"
        },
        {
          name: "Enugu",
          value: "enugu"
        },
        {
          name: "Ibadan",
          value: "ibadan"
        },
        {
          name: "Ikeja",
          value: "ikeja"
        },
        {
          name: "Jos",
          value: "jos"
        },
        {
          name: "Kaduna",
          value: "kaduna"
        },
        {
          name: "Kano",
          value: "kano"
        },
        {
          name: "Port Harcourt",
          value: "portharcourt"
        },
        {
          name: "Yola",
          value: "yola"
        }
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

  methods: {

    async verifyMeter() {

      this.message = "";

      this.token = "";

      this.units = "";

      if (
        !this.selectedProvider ||
        !this.meterNumber
      ) {
        return;
      }

      this.verifying = true;

      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-electricity/verify`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${localStorage.getItem("token")}`
              },

              body: JSON.stringify({
                provider:
                  this.selectedProvider,

                meterNumber:
                  this.meterNumber,

                meterType:
                  this.meterType
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Meter verification failed."
          );
        }

        this.customer =
          data.customer ||
          {};

        this.message =
          "Meter verified successfully.";

        this.messageType =
          "success";

      } catch (error) {

        this.customer = null;

        this.message =
          error.message ||
          "Meter verification failed.";

        this.messageType =
          "error";

      } finally {

        this.verifying = false;
      }
    },


    async purchaseElectricity() {

      this.message = "";

      this.token = "";

      this.units = "";

      if (
        !this.customer ||
        !this.amount ||
        !this.phoneNumber
      ) {
        return;
      }

      this.purchasing = true;

      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-electricity/buy`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${localStorage.getItem("token")}`
              },

              body: JSON.stringify({

                userId:
                  this.userId,

                provider:
                  this.selectedProvider,

                meterNumber:
                  this.meterNumber,

                meterType:
                  this.meterType,

                amount:
                  Number(
                    this.amount
                  ),

                phoneNumber:
                  this.phoneNumber
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Electricity payment failed."
          );
        }

        this.message =
          data.message ||
          "Electricity payment successful.";

        this.messageType =
          "success";

        this.token =
          data.token ||
          "";

        this.units =
          data.units ||
          "";

        await this.$store.dispatch(
          "loadEtrendAccount"
        );

        await this.$store.dispatch(
          "loadEtrendTransactions"
        );

      } catch (error) {

        this.message =
          error.message ||
          "Electricity payment failed.";

        this.messageType =
          "error";

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
  background:
    rgba(0, 0, 0, 0.78);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;

  padding: 15px;
}

.electricity-modal {
  width: 100%;
  max-width: 470px;

  max-height: 92vh;
  overflow-y: auto;

  background:
    linear-gradient(
      145deg,
      #050505,
      #111111
    );

  border:
    1px solid #292929;

  border-radius: 16px;

  padding: 20px;

  position: relative;

  color: white;
}

.close-btn {
  position: absolute;

  right: 14px;
  top: 10px;

  background: none;

  border: none;

  color: white;

  font-size: 30px;

  cursor: pointer;
}

h2 {
  margin: 0;

  font-size: 22px;
}

.subtitle {
  color: #aaa;

  font-size: 13px;

  margin-bottom: 18px;
}

.providers {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 7px;

  margin-bottom: 12px;
}

.provider-btn {
  border:
    1px solid #292929;

  background:
    #071426;

  color: white;

  border-radius: 9px;

  padding: 10px 5px;

  cursor: pointer;

  font-size: 12px;
}

.provider-btn.active {
  background:
    linear-gradient(
      135deg,
      #b30000,
      #ff2020
    );

  border-color:
    #ff2020;
}

.meter-types {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;

  margin-bottom: 14px;
}

.meter-types button {
  background: #111;

  color: white;

  border:
    1px solid #292929;

  border-radius: 9px;

  padding: 11px;

  cursor: pointer;
}

.meter-types button.active {
  background:
    #310b10;

  border-color:
    #ff2020;
}

.field {
  margin-bottom: 13px;
}

.field label {
  display: block;

  font-size: 12px;

  color: #bbb;

  margin-bottom: 6px;
}

.field input {
  width: 100%;

  box-sizing: border-box;

  background:
    #071426;

  border:
    1px solid #16385f;

  border-radius: 9px;

  padding: 12px;

  color: white;

  outline: none;
}

.verify-btn,
.buy-btn {
  width: 100%;

  border: none;

  border-radius: 9px;

  padding: 12px;

  color: white;

  font-weight: 600;

  cursor: pointer;
}

.verify-btn {
  background:
    #0d2340;

  margin-bottom: 15px;
}

.buy-btn {
  background:
    linear-gradient(
      135deg,
      #b30000,
      #ff2020
    );

  margin-top: 5px;
}

button:disabled {
  opacity: 0.5;

  cursor: not-allowed;
}

.customer-box {
  background:
    #071426;

  border:
    1px solid #16385f;

  border-radius: 10px;

  padding: 12px;

  margin-bottom: 14px;
}

.customer-box div {
  display: flex;

  justify-content:
    space-between;

  gap: 10px;

  padding: 4px 0;
}

.customer-box span {
  color: #aaa;

  font-size: 12px;
}

.customer-box strong {
  text-align: right;

  max-width: 65%;
}

.message {
  margin-top: 12px;

  padding: 10px;

  border-radius: 8px;

  font-size: 13px;
}

.message.success {
  background:
    #073d1c;

  color:
    #7cffaa;
}

.message.error {
  background:
    #310b10;

  color:
    #ff8b8b;
}

.token-box {
  margin-top: 15px;

  background:
    #071426;

  border:
    1px solid #16385f;

  border-radius: 10px;

  padding: 14px;

  text-align: center;
}

.token-title {
  color: #aaa;

  font-size: 12px;

  margin-bottom: 8px;
}

.token {
  font-size: 22px;

  font-weight: 700;

  letter-spacing: 2px;

  word-break: break-all;
}

.units {
  margin-top: 7px;

  color: #7cbcff;
}

.token-box p {
  color: #aaa;

  font-size: 12px;

  margin-bottom: 0;
}

@media (max-width: 450px) {

  .electricity-modal {
    padding: 16px;
  }

  .provider-btn {
    font-size: 11px;
  }
}

</style>