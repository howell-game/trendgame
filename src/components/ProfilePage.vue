<template>
  <div>
    <div class="top-bar">
      <!-- Left-aligned change mode section -->
      <div class="left-bar">

        <button
          class="get-referral"
          @click="toggleModeDropdown"
        >
          Change Mode
        </button>

        <span
          v-if="selectedMode"
          class="selected-mode"
        >
          {{ selectedMode }}
        </span>

        <ul
          v-if="showModeDropdown"
          class="mode-dropdown"
        >
          <li @click="selectMode('Real')">
            Real
          </li>

          <li @click="selectMode('Demo')">
            Demo
          </li>
        </ul>

        <!-- Refill Balance Button (shown only in Demo mode) -->
        <button
          v-if="selectedMode === 'Demo'"
          class="refill-button"
          @click="refillDemoBalance"
        >
          Refill Coins
        </button>

      </div>


      <!-- Right-aligned get referral code -->
      <button
        class="get-referral"
        @click="getReferralCode"
      >
        Get Referral Code
      </button>

    </div>


    <div class="base-data">

      <div
        v-if="referralLink"
        class="referral-container"
      >
        <p>
          <strong>Referral Link:</strong>
          {{ referralLink }}
        </p>

        <button
          class="copy-btn"
          @click="copyReferral"
        >
          Copy
        </button>
      </div>


      <h1>
        Welcome, {{ userName }}
      </h1>


      <p>
        <strong class="highlight-text">
          User ID:
        </strong>

        <span class="bold-yellow">
          {{ userId }}
        </span>
      </p>


      <p>
        <strong class="highlight-text">

          Pawns

          <img
            :src="goldenPawn"
            class="pawn-icon"
            alt="Pawn"
          />

          :

        </strong>

        <span class="bold-yellow">
          {{ roundedBalance }}
        </span>

      </p>

    </div>


    <div class="button-container">

      <p>

        <button
          class="button deposit"
          @click="navigateToDeposit"
        >
          Buy Pawns
        </button>


        <button
          class="button Receipt"
          @click="navigateToReceipt"
        >
          Receipt
        </button>


        <button
          class="button investment-details"
          @click="navigateToInvestmentDetails"
        >
          History
        </button>


        <button
          class="button withdraw"
          @click="navigateToWithdrawal"
        >
          Withdraw
        </button>

      </p>

    </div>


    <!-- =====================================================
         ETREND ACCOUNT
         ===================================================== -->

    <div class="account-section">

      <div class="account-card">

        <div class="balance-header">

          <div>

            <p class="account-title">
              ETrend Account
            </p>

            <p class="account-subtitle">
              Available Balance
            </p>

          </div>


          <div class="account-symbol">
            ₦
          </div>

        </div>


        <!-- ETrend balance + bank details -->

        <div class="account-info-row">

          <div class="balance-amount">
            ₦{{ formattedEtrendBalance }}
          </div>


          <div
            v-if="etrendAccount"
            class="bank-details"
          >

            <div class="account-number">
              {{ etrendAccount.accountNumber }}
            </div>

            <div class="bank-name">
              {{ etrendAccount.bankName }}
            </div>

          </div>

        </div>


        <!-- Shown if the ETrend account has not loaded -->

        <div
          v-if="!etrendAccount"
          class="no-account"
        >
          ETrend account information unavailable
        </div>


        <!-- ETrend account button -->

        <div class="account-actions">

          <button
            class="action-btn fund-btn"
            @click="handleFundAccount"
          >

            <span class="action-icon">
              ＋
            </span>

            <span>
              {{ etrendAccount ? "Fund Account" : "Create Account" }}
            </span>

          </button>


          <button
            class="action-btn withdraw-btn"
          >

            <span class="action-icon">
              ↗
            </span>

            <span>
              Withdraw
            </span>

          </button>

        </div>


        <div class="account-footer">

          <span>
            Account Balance
          </span>

          <span class="history-link">
            Transaction History ›
          </span>

        </div>

      </div>

    </div>


    <Services />

    <InvestmentPage :userId="userId" />

  </div>
</template>


<script>
import goldenPawn from '@/assets/golden-pawn.png';
import { mapState } from "vuex";
import InvestmentPage from "./InvestmentPage.vue";
import Services from "./Services.vue";
import axios from "axios";
import { useToast } from "vue-toastification";

export default {

  components: {
    InvestmentPage,
    Services,
  },


  data() {
    return {

      referralLink: "",

      showModeDropdown: false,

      selectedMode: "",

      goldenPawn,

    };
  },


  computed: {

    ...mapState([
      "userName",
      "userId",
      "balance",
      "etrendAccount",
      "etrendBalance"
    ]),


    roundedBalance() {
      return Math.round(
        Number(this.balance || 0)
      );
    },


    formattedEtrendBalance() {
      return Number(
        this.etrendBalance || 0
      ).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

  },


  methods: {

    toggleModeDropdown() {

      this.showModeDropdown =
        !this.showModeDropdown;

    },


    /*
     * ETrend Fund Account button
     *
     * If account exists:
     *     open FundAccount page
     *
     * If account does not exist:
     *     open Create Account page
     */

    handleFundAccount() {

      if (this.etrendAccount) {

        this.$router.push(
          "/fund-account"
        );

      } else {

        this.navigateToCreateAccount();

      }

    },


    selectMode(mode) {

      this.selectedMode = mode;

      localStorage.setItem(
        "selectedMode",
        mode
      );

      this.showModeDropdown = false;


      if (mode === "Real") {

        this.fetchBalance();

      } else if (mode === "Demo") {

        this.fetchDemoBalance();

      }

    },


    async fetchBalance() {

      try {

        const response = await axios.get(

          `${import.meta.env.VITE_APP_BASE_URL}/api/users/${this.userId}/balance`,

          {
            headers: {
              Authorization:
                `Bearer ${this.$store.getters.token}`,
            },
          }

        );


        const updatedBalance =
          response.data.balance;


        this.$store.commit(
          "updateBalance",
          updatedBalance
        );

      } catch (error) {

        console.error(
          "Failed to fetch balance:",
          error
        );

      }

    },


    async fetchDemoBalance() {

      try {

        const response = await axios.get(

          `${import.meta.env.VITE_APP_BASE_URL}/api/users/${this.userId}/demobalance`,

          {
            headers: {
              Authorization:
                `Bearer ${this.$store.getters.token}`,
            },
          }

        );


        const updatedDemoBalance =
          response.data.demoBalance;


        this.$store.commit(
          "updateBalance",
          updatedDemoBalance
        );

      } catch (error) {

        console.error(
          "Failed to fetch demo balance:",
          error
        );

      }

    },


    navigateToDeposit() {

      this.$router.push(
        `/deposit/${this.userId}`
      );

      this.fetchBalance();

    },


    navigateToCreateAccount() {

      this.$router.push(
        "/create-account"
      );

    },


    navigateToReceipt() {

      this.$router.push(
        `/receipt/${this.userId}`
      );

    },


    navigateToWithdrawal() {

      this.$router.push(
        `/withdrawal/${this.userId}`
      );

      this.fetchBalance();

    },


    navigateToInvestmentDetails() {

      this.$router.push(
        `/investment-details/${this.userId}`
      );

    },


    async refillDemoBalance() {

      try {

        const response = await axios.patch(

          `${import.meta.env.VITE_APP_BASE_URL}/api/users/${this.userId}/reset-demo`,

          {},

          {
            headers: {
              Authorization:
                `Bearer ${this.$store.getters.token}`,
            },
          }

        );


        const newBalance =
          response.data.demoBalance;


        this.$store.commit(
          "updateBalance",
          newBalance
        );


        const toast = useToast();

        toast.success(
          "Demo balance refilled!"
        );

      } catch (error) {

        console.error(
          "Refill failed:",
          error
        );


        const toast = useToast();

        toast.error(
          "Failed to refill demo balance."
        );

      }

    },


    async getReferralCode() {

      try {

        const response = await axios.post(

          `${import.meta.env.VITE_APP_BASE_URL}/api/investments/generate-referral`,

          {
            userId: this.userId
          },

          {
            headers: {
              Authorization:
                `Bearer ${this.$store.getters.token}`,
            },
          }

        );


        this.referralLink =
          response.data.referralLink;

      } catch (error) {

        console.error(
          "Failed to generate referral code:",
          error
        );

      }

    },


    copyReferral() {

      if (this.referralLink) {

        navigator.clipboard
          .writeText(this.referralLink)

          .then(() => {

            const toast = useToast();

            toast.success(
              "Referral code copied!"
            );

          })

          .catch((err) => {

            console.error(
              "Failed to copy:",
              err
            );

          });

      }

    },

  },


  beforeMount() {

    /*
     * Load the user's ETrend account
     * into Vuex before the page is displayed.
     */

    this.$store.dispatch(
      "loadEtrendAccount"
    );

  },


  created() {

    const savedMode =
      localStorage.getItem(
        "selectedMode"
      );


    if (savedMode === "Demo") {

      this.selectedMode = "Demo";

      this.fetchDemoBalance();

    } else {

      this.selectedMode = "Real";

      this.fetchBalance();

    }

  }

};
</script>




<style>
/* Top bar for Get Referral Code button */


.get-referral:hover {
  background-color: darkred;
}

/* Referral Container */
.referral-container {
  margin-top: 10px;
  text-align: center;
}
.get-referral {
  background-color: red;
  color: white;
  font-weight: bold;
  padding: 5px 10px; /* smaller padding */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px; /* smaller text */
  width: auto; /* make width fit the content */
  min-width: 120px; /* optional: minimum width */
}

.copy-btn {
  margin-top: 5px;
  background-color: green;
  color: white;
  padding: 5px 10px; /* smaller padding */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px; /* smaller text */
  width: auto; /* fit content naturally */
  min-width: 100px; /* optional: minimum width */
}


.copy-btn:hover {
  background-color: darkgreen;
}

.profile {
  text-align: center;
  margin: 30px auto;
  padding: 20px;
  max-width: 200px;
  border: 1px solid #391c1c;
  border-radius: 8px;
  background-color:rgb(17, 8, 8);
}
/* Base Data Styling */
.base-data {
  
  background-color: lightblue;
  }


/* Bold Yellow Styling */
.bold-yellow {
  font-weight: bold;
  color: black;
}

/* Highlighted Labels */
.highlight-text {
  font-weight: bold;
  color: white; /* White for contrast */
}


h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  color: #555;
  margin: 5px 0;
}

.button-container {
  display: flex;
  justify-content: center; /* Center the buttons */
  align-items: center; /* Align buttons vertically */
  gap: 15px; /* Reduced spacing between buttons */
  margin-top: 20px;
  background-color: #555;
}

.button {
  width: 90px; /* Slightly wider buttons */
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  color: white;
  text-align: center;
}

/* Individual button colors */
.deposit {
  background-color: #003366;
}

.withdraw {
  background-color: #003366;
}

.investment-details {
  background-color: green;
}

/* Hover and active states for buttons */
.button:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.button:active {
  transform: scale(0.97);
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  position: relative;
  color: #555;
  background-color: #555;
}

.left-bar {
  position: relative;
}

.mode-dropdown {
  position: absolute;
  top: 35px;
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
  z-index: 1000;
  width: 100px;
  text-align: left;
}

.mode-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
}

.mode-dropdown li:hover {
  background-color: #f0f0f0;
}

.selected-mode {
  margin-left: 10px;
  font-weight: bold;
  color: yellow;
}
.refill-button {
  background-color: goldenrod;
  color: white;
  font-weight: bold;
  padding: 4px 8px;         /* smaller padding */
  margin-top: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;          /* slightly smaller text */
  width: auto;              /* let width adjust to content */
  min-width: 100px;         /* optional: set a minimal width */
  text-align: center;
}

.refill-button:hover {
  background-color: darkgoldenrod;
}

.account-section {
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
}

.account-section {
  width: 100%;
  padding: 0;
}

.account-card {
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;

  background-color: #003366;
  color: white;

  border-radius: 5px;
}

/* HEADER */

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.account-subtitle {
  margin: 1px 0 0;
  font-size: 9px;
  color: #c7d4e2;
}

/* NAIRA */

.account-symbol {
  font-size: 18px;
  font-weight: 700;
}

/* BALANCE */

.balance-amount {
  margin-top: 3px;
  font-size: 22px;
  font-weight: 700;
}

/* ACTIONS */

.account-actions {
  display: flex;
  gap: 5px;
  margin-top: 7px;
}

.action-btn {
  flex: 1;

  height: 30px;
  padding: 0 8px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  border: none;
  border-radius: 4px;

  color: white;
  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.fund-btn {
  background-color: #0b2440;
}

.withdraw-btn {
  background-color: #8b111b;
}

.action-icon {
  font-size: 13px;
}

/* FOOTER */

.account-footer {
  display: flex;
  justify-content: space-between;

  margin-top: 5px;

  font-size: 9px;
  color: #b9c9d8;
}

.history-link {
  color: white;
}

/* MOBILE */

@media (max-width: 600px) {

  .account-card {
    padding: 7px 10px;
  }

  .balance-amount {
    font-size: 20px;
  }

  .action-btn {
    height: 28px;
    font-size: 9px;
  }

}
.pawn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  vertical-align: middle;
  margin: 0 3px;
}
.account-details-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.bank-details {
  text-align: right;
}

.account-number {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.bank-name {
  margin-top: 2px;
  font-size: 10px;
  color: #c7d4e2;
}

</style>