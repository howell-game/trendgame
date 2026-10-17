<template>
  <div class="tv-overlay">

    <div class="tv-modal">

      <button
        class="close-btn"
        @click="$emit('close')"
      >
        ×
      </button>

      <h2>TV Subscription</h2>

      <p class="subtitle">
        Subscribe to your TV decoder
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
          @click="selectProvider(item.value)"
        >
          {{ item.name }}
        </button>

      </div>


      <!-- SMARTCARD -->

      <div class="field">

        <label>
          Smartcard Number
        </label>

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
        :disabled="
          !selectedProvider ||
          !smartcardNumber ||
          verifying
        "
        @click="verifySmartcard"
      >
        {{
          verifying
            ? "Verifying..."
            : "Verify Smartcard"
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
            {{ customerName }}
          </strong>
        </div>

        <div
          v-if="customer.currentBouquet"
        >
          <span>Current Package</span>
          <strong>
            {{ customer.currentBouquet }}
          </strong>
        </div>

        <div
          v-if="customer.Due_Date"
        >
          <span>Due Date</span>
          <strong>
            {{ customer.Due_Date }}
          </strong>
        </div>

      </div>


      <!-- SUBSCRIPTION TYPE -->

      <div
        v-if="customer"
        class="subscription-types"
      >

        <button
          :class="{
            active:
              subscriptionType ===
              'change'
          }"
          @click="
            subscriptionType = 'change'
          "
        >
          Change Package
        </button>

        <button
          :class="{
            active:
              subscriptionType ===
              'renew'
          }"
          @click="
            subscriptionType = 'renew'
          "
        >
          Renew
        </button>

      </div>


      <!-- PACKAGES -->

      <div
        v-if="
          customer &&
          subscriptionType ===
            'change'
        "
        class="packages"
      >

        <div class="section-title">
          Select Package
        </div>

        <button
          v-for="pkg in packages"
          :key="
            pkg.variation_code
          "
          class="package"
          :class="{
            selected:
              selectedPackage &&
              selectedPackage.variation_code ===
                pkg.variation_code
          }"
          @click="
            selectedPackage = pkg
          "
        >

          <span>
            {{ pkg.name }}
          </span>

          <strong>
            ₦{{
              Number(
                pkg.variation_amount
              ).toLocaleString()
            }}
          </strong>

        </button>

      </div>


      <!-- RENEWAL -->

      <div
        v-if="
          customer &&
          subscriptionType ===
            'renew'
        "
        class="renew-box"
      >

        <span>
          Renewal Amount
        </span>

        <strong>
          ₦{{
            Number(
              renewalAmount
            ).toLocaleString()
          }}
        </strong>

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


      <!-- BUY -->

      <button
        v-if="customer"
        class="buy-btn"
        :disabled="
          purchasing ||
          !phoneNumber ||
          (
            subscriptionType ===
              'change' &&
            !selectedPackage
          )
        "
        @click="purchaseTV"
      >

        {{
          purchasing
            ? "Processing..."
            : "Subscribe Now"
        }}

      </button>


      <div
        v-if="message"
        class="message"
        :class="messageType"
      >
        {{ message }}
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
        {
          name: "DStv",
          value: "dstv"
        },
        {
          name: "GOtv",
          value: "gotv"
        },
        {
          name: "StarTimes",
          value: "startimes"
        }
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

  methods: {

    selectProvider(provider) {

      this.selectedProvider =
        provider;

      this.customer = null;

      this.packages = [];

      this.selectedPackage = null;

      this.message = "";

      this.loadPackages();
    },


    async loadPackages() {

      if (!this.selectedProvider) {
        return;
      }

      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/packages/${this.selectedProvider}`,
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`
              }
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to load TV packages."
          );
        }

        this.packages =
          data.packages || [];

      } catch (error) {

        console.error(error);

        this.message =
          error.message ||
          "Unable to load TV packages.";

        this.messageType =
          "error";
      }
    },


    async verifySmartcard() {

      this.message = "";

      if (
        !this.selectedProvider ||
        !this.smartcardNumber
      ) {
        return;
      }

      this.verifying = true;

      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/verify`,
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

                smartcardNumber:
                  this.smartcardNumber
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Smartcard verification failed."
          );
        }

        this.customer =
          data.customer || {};

        this.message =
          "Smartcard verified successfully.";

        this.messageType =
          "success";

      } catch (error) {

        this.customer = null;

        this.message =
          error.message ||
          "Smartcard verification failed.";

        this.messageType =
          "error";

      } finally {

        this.verifying = false;
      }
    },


    async purchaseTV() {

      this.message = "";

      if (
        !this.selectedProvider ||
        !this.smartcardNumber ||
        !this.phoneNumber
      ) {
        return;
      }

      if (
        this.subscriptionType ===
          "change" &&
        !this.selectedPackage
      ) {
        this.message =
          "Select a TV package.";

        this.messageType =
          "error";

        return;
      }

      this.purchasing = true;

      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-tv/buy`,
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

                smartcardNumber:
                  this.smartcardNumber,

                variationCode:
                  this.selectedPackage
                    ?.variation_code ||
                  "renew",

                phoneNumber:
                  this.phoneNumber,

                subscriptionType:
                  this.subscriptionType
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "TV subscription failed."
          );
        }

        this.message =
          data.message ||
          "TV subscription successful.";

        this.messageType =
          "success";

        this.$store.dispatch(
          "loadEtrendAccount"
        );

        this.$store.dispatch(
          "loadEtrendTransactions"
        );

      } catch (error) {

        this.message =
          error.message ||
          "TV subscription failed.";

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

.tv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 15px;
}

.tv-modal {
  width: 100%;
  max-width: 470px;
  max-height: 92vh;
  overflow-y: auto;
  background: linear-gradient(
    145deg,
    #050505,
    #111111
  );
  border: 1px solid #292929;
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
  gap: 8px;
  margin-bottom: 16px;
}

.provider-btn {
  border: 1px solid #292929;
  background: #071426;
  color: white;
  border-radius: 9px;
  padding: 11px 5px;
  cursor: pointer;
}

.provider-btn.active {
  background: linear-gradient(
    135deg,
    #b30000,
    #ff2020
  );
  border-color: #ff2020;
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
  background: #071426;
  border: 1px solid #16385f;
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
  background: #0d2340;
  margin-bottom: 15px;
}

.buy-btn {
  background: linear-gradient(
    135deg,
    #b30000,
    #ff2020
  );
  margin-top: 12px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.customer-box,
.renew-box {
  background: #071426;
  border: 1px solid #16385f;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
}

.customer-box div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
}

.customer-box span,
.renew-box span {
  color: #aaa;
  font-size: 12px;
}

.customer-box strong,
.renew-box strong {
  text-align: right;
}

.subscription-types {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

.subscription-types button {
  background: #111;
  color: white;
  border: 1px solid #292929;
  padding: 10px;
  border-radius: 8px;
}

.subscription-types button.active {
  background: #310b10;
  border-color: #5c151d;
}

.section-title {
  font-size: 13px;
  color: #bbb;
  margin-bottom: 8px;
}

.package {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  background: #050505;
  color: white;
  border: 1px solid #292929;
  padding: 11px;
  border-radius: 9px;
  margin-bottom: 7px;
  cursor: pointer;
}

.package.selected {
  background: #310b10;
  border-color: #ff2020;
}

.package strong {
  white-space: nowrap;
}

.renew-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message {
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
}

.message.success {
  background: #073d1c;
  color: #7cffaa;
}

.message.error {
  background: #310b10;
  color: #ff8b8b;
}

@media (max-width: 450px) {

  .tv-modal {
    padding: 16px;
  }

  .providers {
    grid-template-columns:
      repeat(3, 1fr);
  }

  .provider-btn {
    font-size: 12px;
  }
}

</style>