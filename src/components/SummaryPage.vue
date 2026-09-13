<template>
  <div class="summary-page">
    <h2>Selection Summary</h2>

    <div class="investment-summary">
      <h3>Selected Categories and Choices:</h3>
      <ul class="category-list">
        <li v-for="investment in selectedInvestments" :key="investment.id">
          <strong>{{ investment.name }}</strong>: {{ investment.choice }} - Odds: ({{ investment.odds }}%)
          <span class="roi">- Potential ROC: {{ calculateROI(investment.odds) | currency }}</span>
        </li>
      </ul>
    </div>

    <div class="investment-amount">
      <label for="investmentAmount">Coins (min Coins500):</label>
      <input
        type="number"
        id="investmentAmount"
        v-model="investmentAmount"
        min="500"
        required
        placeholder="Enter your coins amount"
      />
      <div><strong>Click to add coins</strong></div>

      <div class="amount-buttons">
        <button @click="addToInvestment(100)">+100</button>
        <button @click="addToInvestment(200)">+200</button>
        <button @click="addToInvestment(500)">+500</button>
        <button @click="addToInvestment(1000)">+1000</button>
        <button @click="addToInvestment(1500)">+1500</button>
      </div>
    </div>

    <div class="total-potential-return">
      <h3>Total Potential Win: Coins{{ totalPotentialReturn | currency }}</h3>
    </div>

    <div class="timeframe-selection">
      <label for="timeframe">Select Timeframe:</label>
      <select v-model="selectedTimeframe" id="timeframe" required>
        <option value="" disabled>Select a timeframe</option>
        <option value="5m">5m</option>
        <option value="15m">15m</option>
        <option value="30m">30m</option>
        <option value="1h">1h</option>
        <option value="4h">4h</option>
        <option value="1d">1d</option>
      </select>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="final-summary">
      <button :disabled="!isFormValid" @click="submitInvestment">Submit Selection</button>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import axios from 'axios';


export default {

  name: "SummaryPage",


  // ==========================================================
  // DATA
  // ==========================================================

  data() {

    return {

      selectedInvestments: [],

      investmentAmount: 500,

      selectedTimeframe: "",

      errorMessage: "",

      submitting: false

    };

  },


  // ==========================================================
  // CREATED
  // ==========================================================

  created() {

    const investments =
      this.$route.query.investments;


    this.selectedInvestments =
      investments
        ? JSON.parse(investments)
        : [];

  },


  // ==========================================================
  // COMPUTED
  // ==========================================================

  computed: {

    ...mapGetters([

      'userId'

    ]),


    // ========================================================
    // FORM VALIDATION
    // ========================================================

    isFormValid() {

      return (

        this.investmentAmount >= 500 &&

        this.selectedTimeframe !== "" &&

        this.investmentAmount !== ""

      );

    },


    // ========================================================
    // TOTAL POTENTIAL RETURN
    //
    // TOTAL ROI ONLY
    // ========================================================

    totalPotentialReturn() {


      if (

        this.selectedInvestments.length === 0

      ) {

        return 0;

      }


      let totalROI = 0;


      this.selectedInvestments.forEach(

        investment => {

          totalROI +=

            this.calculateROI(
              investment.odds
            );

        }

      );


      return Number(

        totalROI.toFixed(2)

      );

    }

  },


  // ==========================================================
  // METHODS
  // ==========================================================

  methods: {


    // ========================================================
    // CALCULATE ROI
    // ========================================================

    calculateROI(odds) {


      // ------------------------------------------------------
      // REMOVE 5% PLATFORM FEE
      // ------------------------------------------------------

      const netAmount =

        Number(

          (

            this.investmentAmount *

            0.95

          ).toFixed(2)

        );


      // ------------------------------------------------------
      // NUMBER OF SELECTED INVESTMENTS
      // ------------------------------------------------------

      const numberOfInvestments =

        this.selectedInvestments.length;


      if (

        numberOfInvestments === 0

      ) {

        return 0;

      }


      // ------------------------------------------------------
      // ROI CALCULATION
      // ------------------------------------------------------

      return Number(

        (

          (

            netAmount /

            numberOfInvestments

          )

          +

          (

            netAmount *

            (

              Number(odds) /

              100

            )

          )

        ).toFixed(2)

      );

    },


    // ========================================================
    // ADD AMOUNT
    // ========================================================

    addToInvestment(amount) {

      this.investmentAmount += amount;

    },


    // ========================================================
    // SUBMIT INVESTMENT
    //
    // FRONTEND ONLY:
    //
    // 1. VALIDATES DATA
    // 2. CALCULATES ROI
    // 3. FORMATS INVESTMENTS
    // 4. SENDS ONE REQUEST
    //
    // BACKEND HANDLES:
    //
    // ✓ BALANCE CHECK
    // ✓ BALANCE DEDUCTION
    // ✓ CREATE INVESTMENTS
    // ✓ CREATE INVESTMENT SELECTION
    // ✓ PLATFORM FEE
    // ✓ REFERRAL BONUS
    // ✓ TRANSACTION COMMIT
    //
    // IF ANYTHING FAILS:
    //
    // ✓ BACKEND ROLLS EVERYTHING BACK
    // ========================================================

    async submitInvestment() {


      // ------------------------------------------------------
      // PREVENT DUPLICATE CLICKS
      // ------------------------------------------------------

      if (

        this.submitting

      ) {

        return;

      }


      this.submitting = true;


      // ------------------------------------------------------
      // CLEAR OLD ERROR
      // ------------------------------------------------------

      this.errorMessage = "";


      try {


        // ====================================================
        // GET USER ID
        // ====================================================

        const userId =

          this.userId;


        if (!userId) {

          throw new Error(

            "User is not logged in."

          );

        }


        // ====================================================
        // VALIDATE INVESTMENT
        // ====================================================

        if (

          !this.selectedInvestments.length ||

          this.investmentAmount < 200 ||

          !this.selectedTimeframe

        ) {

          throw new Error(

            "Please complete all fields correctly."

          );

        }


        // ====================================================
        // CALCULATE NET AMOUNT
        //
        // 5% PLATFORM FEE REMOVED
        // ====================================================

        const netAmount =

          Number(

            (

              this.investmentAmount *

              0.95

            ).toFixed(2)

          );


        // ====================================================
        // NUMBER OF INVESTMENTS
        // ====================================================

        const numberOfInvestments =

          this.selectedInvestments.length;


        // ====================================================
        // FORMAT INVESTMENTS
        // ====================================================

        const formattedInvestments =

          this.selectedInvestments.map(

            investment => {


              // ----------------------------------------------
              // CALCULATE ROI
              // ----------------------------------------------

              const roi =

                Number(

                  (

                    (

                      netAmount /

                      numberOfInvestments

                    )

                    +

                    (

                      netAmount *

                      (

                        Number(
                          investment.odds
                        )

                        /

                        100

                      )

                    )

                  ).toFixed(2)

                );


              // ----------------------------------------------
              // RETURN FORMATTED INVESTMENT
              // ----------------------------------------------

              return {


                category:

                  investment.name,


                choice:

                  investment.choice,


                amount:

                  netAmount,


                roi,


                odds:

                  investment.odds

              };

            }

          );


        // ====================================================
        // SUBMIT TO BACKEND
        //
        // THIS IS THE ONLY INVESTMENT API CALL
        //
        // BACKEND WILL:
        //
        // 1. START TRANSACTION
        // 2. CHECK BALANCE
        // 3. DEDUCT BALANCE
        // 4. CREATE INVESTMENTS
        // 5. CREATE INVESTMENT SELECTION
        // 6. PROCESS PLATFORM FEE
        // 7. PROCESS REFERRAL BONUS
        // 8. COMMIT
        //
        // IF ANYTHING FAILS:
        //
        // ROLLBACK EVERYTHING
        // ====================================================

        const response =

          await axios.post(

            `${import.meta.env.VITE_APP_BASE_URL}/api/investments/submit-investmentselection`,

            {

              userId,

              amount:

                this.investmentAmount,


              timeframe:

                this.selectedTimeframe,


              selectedInvestments:

                formattedInvestments

            }

          );


        // ====================================================
        // UPDATE USER BALANCE IN VUEX
        // ====================================================

        if (

          response.data.newBalance !== undefined

        ) {

          this.$store.commit(

            "updateBalance",

            response.data.newBalance

          );

        }


        // ====================================================
        // LOG RESPONSE
        // ====================================================

        console.log(

          "Investment response:",

          response.data

        );


        // ====================================================
        // REDIRECT USER
        // ====================================================

        this.$router.push(

          `/investment-details/${userId}`

        );


      } catch (error) {


        // ====================================================
        // HANDLE ERROR
        // ====================================================

        console.error(

          "Error submitting investment:",

          error

        );


        this.errorMessage =

          error.response?.data?.message ||

          error.message ||

          "Something went wrong.";


      } finally {


        // ====================================================
        // RE-ENABLE SUBMIT BUTTON
        // ====================================================

        this.submitting = false;

      }

    }

  }

};

</script>

<style scoped>
/* Error message styles */
.error-message {
  color: red;
  background: #ffefef;
  padding: 10px;
  border: 1px solid #ff5c5c;
  margin-bottom: 15px;
  border-radius: 5px;
  text-align: center;
}

/* General Styles */
.summary-page {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: rgb(112, 168, 99);
  color: #333;
}

/* Header Styling */
h2 {
  color: #007b8f;
  font-size: 24px;
}

h3 {
  color: #006f83;
}

/* List Styling */
.investment-summary {
  margin-bottom: 20px;
}

.category-list {
  list-style-type: none;
  padding-left: 0;
  font-size: 14px;
  color: yellow;
}

.category-list li {
  background-color: rgb(0, 51, 102);
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 5px;
  min-height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-list li strong {
  color: #8fc9b5;
}

.roi {
  font-size: 12px;
  color: #b0e8d9;
}

/* Investment Amount Input */
.investment-amount {
  margin-bottom: 20px;
}

#investmentAmount {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  color: #333;
}

.amount-buttons {
  margin-top: 10px;
  display: flex;
  gap: 2px;
}

.amount-buttons button {
  padding: 5px 5px;
  background-color: #007b8f;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.amount-buttons button:hover {
  background-color: #005f6b;
}

/* Timeframe Dropdown */
.timeframe-selection {
  margin-bottom: 20px;
}

#timeframe {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  color: #333;
}

/* Submit Button */
.final-summary button {
  padding: 10px 20px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.final-summary button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Total Potential Return */
.total-potential-return {
  font-size: 18px;
  margin-top: 20px;
}
</style>
