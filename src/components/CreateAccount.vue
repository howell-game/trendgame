<template>
  <div class="create-account-page">

    <div class="create-account-card">

      <!-- HEADER -->

      <div class="page-header">
        <div>
          <h2>Create Your ETrend Account</h2>
          <p>
            Create your personalized account for receiving and managing NGN payments.
          </p>
        </div>

        <div class="header-icon">
          ₦
        </div>
      </div>


      <!-- PERSONAL INFORMATION -->

      <div class="form-section">

        <h3>Personal Information</h3>

        <p class="section-note">
          Enter your details exactly as they appear on your identification document.
        </p>

        <div class="form-grid">

          <div class="form-group">
            <label>First Name</label>

            <input
              type="text"
              v-model="firstName"
              placeholder="Enter first name"
            />
          </div>


          <div class="form-group">
            <label>Last Name</label>

            <input
              type="text"
              v-model="lastName"
              placeholder="Enter last name"
            />
          </div>


          <div class="form-group">
            <label>Email Address</label>

            <input
              type="email"
              v-model="email"
              placeholder="Enter email address"
            />
          </div>


          <div class="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              v-model="phone"
              placeholder="08012345678"
            />
          </div>

        </div>

      </div>


      <!-- IDENTITY VERIFICATION -->

      <div class="form-section">

        <h3>Identity Verification</h3>

        <p class="section-note">
          Your identity information may be required to create and verify your
          personalized account.
        </p>

        <div class="form-grid">

          <div class="form-group">

            <label>Verification Type</label>

            <select v-model="verificationType">

              <option value="">
                Select verification type
              </option>

              <option value="bvn">
                BVN
              </option>

              <option value="nin">
                NIN
              </option>

            </select>

          </div>


          <div class="form-group">

            <label>Verification Number</label>

            <input
              type="text"
              v-model="verificationNumber"
              placeholder="Enter BVN or NIN"
            />

          </div>

        </div>

        <div class="info-note">

          <strong>Important:</strong>

          Your BVN or NIN may be used for identity verification and account
          creation. Only provide your own valid verification details.

        </div>

      </div>


      <!-- ACCOUNT INFORMATION -->

      <div class="form-section">

        <h3>Account Information</h3>

        <div class="info-note">

          Your ETrend account number and partner bank will be assigned
          automatically after your information has been verified and your
          account has been successfully created.

        </div>

      </div>


      <!-- TERMS -->

      <div class="form-section">

        <h3>Important Information</h3>

        <div class="disclaimer">

          <p>
            By creating an ETrend account, you confirm that the information
            provided is accurate and belongs to you.
          </p>

          <p>
            ETrend does not operate as a bank. Account and payment services
            are provided through approved payment infrastructure and financial
            service providers.
          </p>

          <p>
            Account creation is subject to identity verification, provider
            approval, applicable regulations and the availability of the
            selected service.
          </p>

          <p>
            ETrend may request additional information where required for
            identity verification, fraud prevention, compliance or account
            servicing.
          </p>

        </div>


        <label class="checkbox-row">

          <input
            type="checkbox"
            v-model="acceptedTerms"
          />

          <span>
            I confirm that the information I have provided is accurate and
            I agree to the account creation terms.
          </span>

        </label>

      </div>


      <!-- MESSAGE -->

      <p
        v-if="message"
        :class="messageType"
        class="form-message"
      >
        {{ message }}
      </p>


      <!-- BUTTON -->

      <button
        class="create-btn"
        @click="createAccount"
        :disabled="loading"
      >

        {{ loading ? "Creating Account..." : "Create ETrend Account" }}

      </button>

    </div>

  </div>
</template>


<script>

import axios from "axios";

export default {

  data() {

    return {

      firstName: "",
      lastName: "",
      email: "",
      phone: "",

      verificationType: "",
      verificationNumber: "",

      acceptedTerms: false,

      loading: false,

      message: "",
      messageType: ""

    };

  },


  methods: {

    async createAccount() {

      this.message = "";
      this.messageType = "";


      // ==========================================
      // CHECK TERMS
      // ==========================================

      if (!this.acceptedTerms) {

        this.message =
          "Please confirm that your information is accurate and accept the terms.";

        this.messageType = "error-message";

        return;

      }


      // ==========================================
      // CHECK REQUIRED FIELDS
      // ==========================================

      if (
        !this.firstName ||
        !this.lastName ||
        !this.email ||
        !this.phone ||
        !this.verificationType ||
        !this.verificationNumber
      ) {

        this.message =
          "Please complete all required fields.";

        this.messageType = "error-message";

        return;

      }


      // ==========================================
      // GET LOGGED-IN USER INFORMATION
      // ==========================================

      const userId = this.$store.getters.userId;
      const token = this.$store.getters.token;


      if (!userId || !token) {

        this.message =
          "Your login session has expired. Please log in again.";

        this.messageType = "error-message";

        return;

      }


      // ==========================================
      // START REQUEST
      // ==========================================

      this.loading = true;


      try {

        const response = await axios.post(

          `${import.meta.env.VITE_APP_BASE_URL}/api/etrend-account/create`,

          {
            userId,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            verificationType: this.verificationType,
            verificationNumber: this.verificationNumber
          },

          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }

        );


        // ==========================================
        // SUCCESS
        // ==========================================

        this.message =
          response.data.message || "ETrend account created successfully.";

        this.messageType = "success-message";


        console.log(
          "ETrend account:",
          response.data.account
        );


      } catch (error) {

        console.error(
          "ETrend account creation error:",
          error
        );


        this.message =
          error.response?.data?.message ||
          "Unable to create your ETrend account.";

        this.messageType = "error-message";


      } finally {

        this.loading = false;

      }

    }

  }

};

</script>


<style scoped>

.create-account-page {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}


.create-account-card {
  width: 100%;
  box-sizing: border-box;

  background: lightyellow;

  padding: 15px;

  border-radius: 6px;
}


.page-header {
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background: #003366;
  color: white;

  padding: 12px;

  box-sizing: border-box;

  border-radius: 5px;
}

.page-header h2 {
  margin: 0;

  font-size: 17px;
  font-weight: 700;
}

.page-header p {
  margin: 3px 0 0;

  font-size: 10px;

  color: #d5e0ea;
}

.header-icon {
  font-size: 25px;
  font-weight: 700;
}


.form-section {
  margin-top: 14px;

  padding-bottom: 12px;

  border-bottom: 1px solid #eeeeee;
}

.form-section h3 {
  margin: 0 0 3px;

  font-size: 14px;

  color: #003366;
}

.section-note {
  margin: 0 0 10px;

  font-size: 10px;

  color: #777;
}


.form-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 10px;
}


.form-group {
  width: 100%;
}

.form-group label {
  display: block;

  margin-bottom: 4px;

  font-size: 10px;

  font-weight: 600;

  color: #333;
}

.form-group input,
.form-group select {

  width: 100%;

  height: 34px;

  padding: 0 9px;

  box-sizing: border-box;

  border: 1px solid #d7d7d7;

  border-radius: 4px;

  background: #ffffff;

  color: #222;

  font-size: 11px;

  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #003366;
}


.info-note {

  margin-top: 10px;

  padding: 8px 10px;

  background: #f3f6f9;

  color: #555;

  font-size: 10px;

  line-height: 1.5;

  border-radius: 4px;
}

.info-note strong {
  color: #003366;
}


.disclaimer {

  margin-top: 8px;

  padding: 9px 10px;

  background: #f8f8f8;

  border-radius: 4px;

  font-size: 10px;

  line-height: 1.5;

  color: #555;
}

.disclaimer p {
  margin: 0 0 6px;
}

.disclaimer p:last-child {
  margin-bottom: 0;
}


.checkbox-row {

  display: flex;

  align-items: flex-start;

  gap: 7px;

  margin-top: 10px;

  font-size: 10px;

  line-height: 1.5;

  color: #444;

  cursor: pointer;
}

.checkbox-row input {
  margin-top: 2px;
}


/* MESSAGE */

.form-message {

  margin: 10px 0 0;

  padding: 8px 10px;

  border-radius: 4px;

  font-size: 10px;

  line-height: 1.4;
}

.success-message {

  background: #e7f6ea;

  color: #176b2c;
}

.error-message {

  background: #fdeaea;

  color: #a00000;
}


/* BUTTON */

.create-btn {

  width: 100%;

  height: 38px;

  margin-top: 15px;

  border: none;

  border-radius: 5px;

  background: #003366;

  color: white;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;
}

.create-btn:hover {
  background: #002850;
}

.create-btn:disabled {

  opacity: 0.6;

  cursor: not-allowed;

}


/* MOBILE */

@media (max-width: 600px) {

  .create-account-card {
    padding: 8px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .page-header h2 {
    font-size: 15px;
  }

  .page-header p {
    font-size: 9px;
  }

}

</style>