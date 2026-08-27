```vue
<template>
  <div class="payment-page">

    <!-- SUCCESS -->
    <div
      v-if="transactionStatus === 'successful'"
      class="payment-box success"
    >
      <div class="icon">✓</div>

      <h1>Payment Successful</h1>

      <p>
        Your payment has been successfully processed
        and your account balance has been updated.
      </p>

      <router-link to="/">
        Go Back to Home
      </router-link>
    </div>


    <!-- FAILED -->
    <div
      v-else-if="transactionStatus === 'failed'"
      class="payment-box failed"
    >
      <div class="icon">✕</div>

      <h1>Payment Failed</h1>

      <p>
        We could not complete your payment.
        Your account has not been credited.
      </p>

      <router-link to="/deposit">
        Try Again
      </router-link>

      <br />

      <router-link to="/">
        Go Back to Home
      </router-link>
    </div>


    <!-- CANCELLED -->
    <div
      v-else-if="transactionStatus === 'cancelled'"
      class="payment-box cancelled"
    >
      <div class="icon">!</div>

      <h1>Payment Cancelled</h1>

      <p>
        Your payment was cancelled before it could
        be completed.
      </p>

      <router-link to="/deposit">
        Try Again
      </router-link>

      <br />

      <router-link to="/">
        Go Back to Home
      </router-link>
    </div>


    <!-- UNKNOWN / MISSING STATUS -->
    <div
      v-else
      class="payment-box unknown"
    >
      <div class="icon">?</div>

      <h1>Payment Status</h1>

      <p>
        We could not determine the final status of
        this payment. Please check your transaction
        history or contact support if your account
        was not updated.
      </p>

      <router-link to="/">
        Go Back to Home
      </router-link>
    </div>

  </div>
</template>


<script>

export default {

  name: "PaymentSuccess",

  data() {

    return {

      transactionStatus: null,

    };

  },


  created() {

    const status =
      String(
        this.$route.query.status || ""
      )
        .trim()
        .toLowerCase();


    this.transactionStatus =
      status;

  },

};

</script>


<style>

.payment-page {

  width: 100%;

  min-height: 60vh;

  display: flex;

  justify-content: center;

  align-items: flex-start;

  padding: 40px 20px;

}


.payment-box {

  width: 100%;

  max-width: 700px;

  text-align: center;

  padding: 35px 25px;

  border: 1px solid #ddd;

  border-radius: 10px;

  background-color: lightyellow;

}


.payment-box h1 {

  margin: 15px 0;

  font-size: 28px;

}


.payment-box p {

  margin: 20px 0 25px;

  line-height: 1.6;

  font-size: 16px;

}


.payment-box a {

  display: inline-block;

  margin: 8px;

  padding: 10px 18px;

  background-color: red;

  color: white;

  text-decoration: none;

  border-radius: 5px;

  font-size: 14px;

}


.payment-box a:hover {

  background-color: darkred;

}


/* =========================================
   ICON
========================================= */

.icon {

  width: 65px;

  height: 65px;

  margin: 0 auto 15px;

  border-radius: 50%;

  display: flex;

  justify-content: center;

  align-items: center;

  font-size: 35px;

  font-weight: bold;

}


/* =========================================
   SUCCESS
========================================= */

.success .icon {

  background-color: #d4edda;

  color: #155724;

}


.success h1 {

  color: #155724;

}


/* =========================================
   FAILED
========================================= */

.failed .icon {

  background-color: #f8d7da;

  color: #721c24;

}


.failed h1 {

  color: #721c24;

}


/* =========================================
   CANCELLED
========================================= */

.cancelled .icon {

  background-color: #fff3cd;

  color: #856404;

}


.cancelled h1 {

  color: #856404;

}


/* =========================================
   UNKNOWN
========================================= */

.unknown .icon {

  background-color: #e2e3e5;

  color: #383d41;

}


.unknown h1 {

  color: #383d41;

}


/* =========================================
   MOBILE
========================================= */

@media (max-width: 600px) {

  .payment-page {

    padding: 25px 15px;

  }


  .payment-box {

    padding: 30px 18px;

  }


  .payment-box h1 {

    font-size: 24px;

  }


  .payment-box p {

    font-size: 15px;

  }

}

</style>
```
