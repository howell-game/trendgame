<template>
  <div
    class="airtime-modal-overlay"
    @click.self="closeModal"
  >

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
          >
            <span class="network-icon">M</span>
            <span>MTN</span>
          </button>


          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === 'airtel' }"
            @click="selectNetwork('airtel')"
          >
            <span class="network-icon">A</span>
            <span>Airtel</span>
          </button>


          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === 'glo' }"
            @click="selectNetwork('glo')"
          >
            <span class="network-icon">G</span>
            <span>Glo</span>
          </button>


          <button
            type="button"
            class="network-button"
            :class="{ selected: selectedNetwork === '9mobile' }"
            @click="selectNetwork('9mobile')"
          >
            <span class="network-icon">9</span>
            <span>9mobile</span>
          </button>

        </div>

      </div>


      <!-- Amount -->
      <div class="form-group">

        <label for="airtime-amount">
          Amount
        </label>

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

        <label for="airtime-phone">
          Phone Number
        </label>

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
        <span v-if="loading">
          Processing...
        </span>

        <span v-else>
          Buy Airtime
        </span>
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

  methods: {

    closeModal() {

      if (this.loading) {
        return;
      }

      this.$emit("close");

    },


    selectNetwork(network) {

      this.selectedNetwork = network;

      this.errorMessage = "";

      this.successMessage = "";

    },


    validateForm() {

      this.errorMessage = "";

      this.successMessage = "";


      /*
      -----------------------------
      NETWORK
      -----------------------------
      */

      if (!this.selectedNetwork) {

        this.errorMessage =
          "Please select a network.";

        return false;

      }


      /*
      -----------------------------
      AMOUNT
      -----------------------------
      */

      const airtimeAmount =
        Number(this.amount);

      if (
        !Number.isFinite(airtimeAmount) ||
        airtimeAmount < 50
      ) {

        this.errorMessage =
          "Minimum airtime purchase is ₦50.";

        return false;

      }


      /*
      -----------------------------
      PHONE
      -----------------------------
      */

      const phone =
        String(this.phoneNumber)
          .replace(/\s+/g, "");

      if (!/^0[789][01]\d{8}$/.test(phone)) {

        this.errorMessage =
          "Please enter a valid Nigerian phone number.";

        return false;

      }


      /*
      -----------------------------
      USER
      -----------------------------
      */

      if (!this.userId) {

        this.errorMessage =
          "Your account could not be identified.";

        return false;

      }


      return true;

    },


    async buyAirtime() {

      if (!this.validateForm()) {
        return;
      }


      this.loading = true;

      this.errorMessage = "";

      this.successMessage = "";


      const airtimeAmount =
        Number(this.amount);

      const phone =
        String(this.phoneNumber)
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
              Authorization:
                `Bearer ${this.token}`,

              "Content-Type":
                "application/json"
            }
          }

        );


        const data = response.data;


        /*
        --------------------------------
        SUCCESS / DELIVERED
        --------------------------------
        */

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


        /*
        --------------------------------
        PENDING
        --------------------------------
        */

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


        /*
        --------------------------------
        OTHER RESPONSE
        --------------------------------
        */

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

/* =====================================================
   MODAL
===================================================== */

.airtime-modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 15px;

  background: rgba(0, 0, 0, 0.72);

  overflow-y: auto;
}


.airtime-modal {
  width: 100%;

  max-width: 430px;

  max-height: 92vh;

  overflow-y: auto;

  box-sizing: border-box;

  padding: 20px;

  border-radius: 14px;

  background: #0e327f;

  border: 1px solid #285d91;

  color: white;

  box-shadow:
    0 15px 50px rgba(0, 0, 0, 0.45);
}


/* =====================================================
   HEADER
===================================================== */

.airtime-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 20px;
}


.airtime-header h2 {
  margin: 0;

  font-size: 21px;

  font-weight: 700;
}


.airtime-header p {
  margin: 5px 0 0;

  color: #c1c8d3;

  font-size: 11px;
}


.close-button {
  width: 34px;

  height: 34px;

  flex-shrink: 0;

  border-radius: 9px;

  border: 1px solid #292929;

  background: #111827;

  color: white;

  font-size: 24px;

  line-height: 1;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;
}


.close-button:hover {
  background: #190709;

  border-color: #9d202c;
}


/* =====================================================
   FORM
===================================================== */

.form-group {
  margin-bottom: 17px;
}


.form-group label {
  display: block;

  margin-bottom: 7px;

  color: white;

  font-size: 12px;

  font-weight: 600;
}


/* =====================================================
   NETWORK
===================================================== */

.network-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 7px;
}


.network-button {
  min-height: 65px;

  border-radius: 9px;

  border: 1px solid #16385f;

  background:
    linear-gradient(
      145deg,
      #071426,
      #0d2340
    );

  color: white;

  cursor: pointer;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 5px;

  font-size: 11px;

  font-weight: 600;

  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}


.network-button:hover {
  border-color: #285d91;

  transform: translateY(-2px);
}


.network-button.selected {
  background:
    linear-gradient(
      145deg,
      #190709,
      #310b10
    );

  border-color: #9d202c;

  box-shadow:
    0 4px 12px
    rgba(100, 10, 20, 0.3);
}


.network-icon {
  width: 27px;

  height: 27px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    rgba(255, 255, 255, 0.1);

  border:
    1px solid
    rgba(255, 255, 255, 0.12);

  font-size: 13px;

  font-weight: 700;
}


/* =====================================================
   INPUTS
===================================================== */

.form-group input {
  width: 100%;

  box-sizing: border-box;

  padding: 12px;

  border-radius: 8px;

  border: 1px solid #16385f;

  background: #071426;

  color: white;

  outline: none;

  font-size: 14px;
}


.form-group input::placeholder {
  color: #8b93a1;
}


.form-group input:focus {
  border-color: #285d91;
}


.form-group input:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}


/* =====================================================
   AMOUNT
===================================================== */

.amount-input {
  display: flex;

  align-items: center;

  border-radius: 8px;

  border: 1px solid #16385f;

  background: #071426;

  overflow: hidden;
}


.currency {
  padding-left: 12px;

  color: white;

  font-weight: 600;
}


.amount-input input {
  border: none;

  background: transparent;

  border-radius: 0;
}


.form-group small {
  display: block;

  margin-top: 5px;

  color: #aeb6c3;

  font-size: 10px;
}


/* =====================================================
   MESSAGES
===================================================== */

.message {
  padding: 10px;

  margin-bottom: 13px;

  border-radius: 8px;

  font-size: 11px;
}


.error-message {
  background: #190709;

  border: 1px solid #5c151d;

  color: #ffb8be;
}


.success-message {
  background: #071426;

  border: 1px solid #285d91;

  color: #d7e8ff;
}


/* =====================================================
   BUY BUTTON
===================================================== */

.buy-button {
  width: 100%;

  padding: 13px;

  border-radius: 9px;

  border: 1px solid #9d202c;

  background:
    linear-gradient(
      145deg,
      #190709,
      #310b10
    );

  color: white;

  font-size: 14px;

  font-weight: 700;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.buy-button:hover {
  transform: translateY(-1px);

  box-shadow:
    0 6px 18px
    rgba(100, 10, 20, 0.35);
}


.buy-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;

  transform: none;
}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 500px) {

  .airtime-modal {
    padding: 16px;
  }

  .network-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}

</style>