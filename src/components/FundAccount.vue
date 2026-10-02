<template>

  <div class="fund-page">

    <div class="fund-card">

      <!-- Header -->

      <div class="fund-header">

        <h2>
          Fund ETrend Account
        </h2>

        <button
          class="close-button"
          @click="goBack"
        >
          ×
        </button>

      </div>


      <!-- Account information -->

      <div
        v-if="etrendAccount"
        class="fund-body"
      >

        <p class="fund-message">

          Transfer money to the account below
          to fund your ETrend account.

        </p>


        <!-- Account Name -->

        <div class="account-detail">

          <span>
            Account Name
          </span>

          <strong>
            {{ etrendAccount.accountName }}
          </strong>

        </div>


        <!-- Account Number -->

        <div class="account-detail">

          <span>
            Account Number
          </span>

          <strong>
            {{ etrendAccount.accountNumber }}
          </strong>

        </div>


        <!-- Bank -->

        <div class="account-detail">

          <span>
            Bank
          </span>

          <strong>
            {{ etrendAccount.bankName }}
          </strong>

        </div>


        <!-- Instruction -->

        <div class="fund-instruction">

          Transfer the amount you want to add
          to your ETrend account to the account
          number shown above.

        </div>

      </div>


      <!-- No account -->

      <div
        v-else
        class="no-account"
      >

        ETrend account information is
        currently unavailable.

      </div>


      <!-- Footer -->

      <div class="fund-footer">

        <button
          class="back-button"
          @click="goBack"
        >
          Close
        </button>

      </div>

    </div>

  </div>

</template>


<script>

import { mapState } from "vuex";

export default {

  computed: {

    ...mapState([
      "etrendAccount"
    ]),

  },


  methods: {

    goBack() {

      this.$router.back();

    },

  },

};

</script>


<style scoped>

.fund-page {

  position: fixed;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background: rgba(0, 0, 0, 0.65);

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 15px;

  box-sizing: border-box;

  z-index: 9999;

}


.fund-card {

  width: 100%;

  max-width: 380px;

  background: white;

  border-radius: 8px;

  overflow: hidden;

  box-sizing: border-box;

}


.fund-header {

  background: #003366;

  color: white;

  padding: 12px 15px;

  display: flex;

  align-items: center;

  justify-content: space-between;

}


.fund-header h2 {

  margin: 0;

  font-size: 16px;

}


.close-button {

  background: none;

  border: none;

  color: white;

  font-size: 24px;

  line-height: 1;

  cursor: pointer;

}


.fund-body {

  padding: 15px;

}


.fund-message {

  margin: 0 0 15px;

  font-size: 13px;

  line-height: 1.5;

  color: #333;

}


.account-detail {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 11px 0;

  border-bottom: 1px solid #eeeeee;

}


.account-detail span {

  font-size: 12px;

  color: #777;

}


.account-detail strong {

  font-size: 12px;

  color: #003366;

  text-align: right;

}


.fund-instruction {

  margin-top: 15px;

  padding: 10px;

  background: #f3f6f9;

  border-radius: 5px;

  color: #333;

  font-size: 12px;

  line-height: 1.5;

}


.no-account {

  padding: 20px;

  text-align: center;

  color: #666;

  font-size: 13px;

}


.fund-footer {

  padding: 0 15px 15px;

  text-align: right;

}


.back-button {

  background: #003366;

  color: white;

  border: none;

  border-radius: 4px;

  padding: 8px 18px;

  font-size: 12px;

  cursor: pointer;

}


</style>