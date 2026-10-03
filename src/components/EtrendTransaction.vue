<template>
  <div class="transaction-page">

    <!-- Header -->
    <div class="transaction-header">

      <button
        class="back-button"
        @click="goBack"
      >
        ‹
      </button>

      <h2>
        ETrend Transactions
      </h2>

    </div>


    <!-- Transaction list -->
    <div class="transaction-container">

      <div
        v-if="transactions.length === 0"
        class="no-transactions"
      >
        No transactions found.
      </div>


      <div
        v-for="(transaction, index) in transactions"
        :key="transaction.reference || index"
        class="transaction-line"
        @click="openTransaction(transaction)"
      >

        <div class="transaction-main">

          <span
            class="transaction-type"
            :class="transaction.type === 'C'
              ? 'credit'
              : 'debit'"
          >
            {{ transaction.type === "C"
              ? "Received"
              : "Sent" }}
          </span>


          <span class="transaction-name">
            {{ getOtherParty(transaction) }}
          </span>


          <span class="transaction-amount">
            ₦{{ formatAmount(transaction.amount) }}
          </span>

        </div>


        <div class="transaction-date">
          {{ formatDate(transaction.date) }}
        </div>

      </div>

    </div>


    <!-- Transaction Details Modal -->
    <div
      v-if="selectedTransaction"
      class="modal-overlay"
      @click.self="closeTransaction"
    >

      <div class="transaction-modal">

        <!-- Modal Header -->
        <div class="modal-header">

          <h3>
            Transaction Details
          </h3>

          <button
            class="modal-close"
            @click="closeTransaction"
          >
            ×
          </button>

        </div>


        <!-- Modal Body -->
        <div class="modal-body">

          <div class="detail-row">

            <span>
              Type
            </span>

            <strong>
              {{ selectedTransaction.type === "C"
                ? "Received"
                : "Sent" }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Amount
            </span>

            <strong>
              ₦{{ formatAmount(selectedTransaction.amount) }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Sender / Receiver
            </span>

            <strong>
              {{ getOtherParty(selectedTransaction) }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Date
            </span>

            <strong>
              {{ formatDate(selectedTransaction.date) }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Balance Before
            </span>

            <strong>
              ₦{{ formatAmount(
                selectedTransaction.balance_before
              ) }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Balance After
            </span>

            <strong>
              ₦{{ formatAmount(
                selectedTransaction.balance_after
              ) }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Reference
            </span>

            <strong class="reference">
              {{ selectedTransaction.reference || "—" }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Currency
            </span>

            <strong>
              {{ selectedTransaction.currency || "NGN" }}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Remarks
            </span>

            <strong class="remarks">
              {{ selectedTransaction.remarks || "—" }}
            </strong>

          </div>


          <!-- Additional Flutterwave fields -->
          <div
            v-if="selectedTransaction.statement_type"
            class="detail-row"
          >

            <span>
              Statement Type
            </span>

            <strong>
              {{ selectedTransaction.statement_type }}
            </strong>

          </div>


          <div
            v-if="selectedTransaction.sent_currency"
            class="detail-row"
          >

            <span>
              Sent Currency
            </span>

            <strong>
              {{ selectedTransaction.sent_currency }}
            </strong>

          </div>


          <div
            v-if="selectedTransaction.sent_amount"
            class="detail-row"
          >

            <span>
              Sent Amount
            </span>

            <strong>
              {{ formatAmount(
                selectedTransaction.sent_amount
              ) }}
            </strong>

          </div>


          <div
            v-if="selectedTransaction.rate_used"
            class="detail-row"
          >

            <span>
              Rate Used
            </span>

            <strong>
              {{ selectedTransaction.rate_used }}
            </strong>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>


<script>
import { mapState } from "vuex";

export default {

  name: "EtrendTransaction",


  computed: {

    ...mapState([
      "etrendTransactions"
    ]),


    transactions() {

      if (!Array.isArray(this.etrendTransactions)) {
        return [];
      }

      return this.etrendTransactions.slice(0, 30);

    },

  },


  data() {

    return {

      selectedTransaction: null,

    };

  },


  methods: {

    goBack() {

      this.$router.back();

    },


    openTransaction(transaction) {

      this.selectedTransaction =
        transaction;

    },


    closeTransaction() {

      this.selectedTransaction =
        null;

    },


    formatAmount(amount) {

      return Number(
        amount || 0
      ).toLocaleString("en-NG", {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

      });

    },


    formatDate(date) {

      if (!date) {
        return "—";
      }

      const parsedDate =
        new Date(date);

      if (Number.isNaN(
        parsedDate.getTime()
      )) {

        return date;

      }

      return parsedDate.toLocaleString(
        "en-NG",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    },


    getOtherParty(transaction) {

      if (!transaction) {
        return "Unknown";
      }

      const remarks =
        transaction.remarks || "";


      /*
       * Flutterwave currently returns
       * remarks such as:
       *
       * Received Money from OPAY|
       * CHUKWUEBUKA CHIDIEBELE OLISAEMEKA
       *
       * The name appears after "|".
       */

      if (remarks.includes("|")) {

        const parts =
          remarks.split("|");

        const name =
          parts[parts.length - 1]
            ?.trim();

        if (name) {
          return name;
        }

      }


      /*
       * If there is no "|", use the
       * complete remarks instead.
       */

      return remarks || "Unknown";

    },

  },

};
</script>


<style scoped>

.transaction-page {
  width: 100%;
  background: #003366;
  box-sizing: border-box;
  padding-bottom: 15px;
}


/* =====================================================
   HEADER
   ===================================================== */

.transaction-header {
  background: white;
  color: #003366;
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  position: relative;
}

.transaction-header h2 {
  margin: 0;
  width: 100%;
  text-align: center;
  font-size: 17px;
}


.back-button {
  position: absolute;
  left: 10px;
  top: 8px;
  width: 34px;
  height: 34px;
  border: none;
  background: #003366;
  color: white;
  border-radius: 4px;
  font-size: 25px;
  line-height: 1;
  cursor: pointer;
}


/* =====================================================
   TRANSACTION LIST
   ===================================================== */

.transaction-container {
  background: white;
  margin: 12px;
  border-radius: 5px;
  overflow: hidden;
}


.transaction-line {
  padding: 11px 10px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
  background: white;
}


.transaction-line:last-child {
  border-bottom: none;
}


.transaction-line:hover {
  background: lightyellow;
}


.transaction-main {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}


.transaction-type {
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}


.transaction-type.credit {
  color: #003366;
}


.transaction-type.debit {
  color: #a00000;
}


.transaction-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.transaction-amount {
  font-size: 12px;
  font-weight: bold;
  color: #003366;
  white-space: nowrap;
}


.transaction-date {
  margin-top: 4px;
  font-size: 10px;
  color: #777777;
}


.no-transactions {
  padding: 25px 15px;
  text-align: center;
  color: #666666;
  font-size: 13px;
}


/* =====================================================
   MODAL
   ===================================================== */

.modal-overlay {
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


.transaction-modal {
  width: 100%;
  max-width: 390px;
  max-height: 90vh;
  background: white;
  border-radius: 7px;
  overflow: hidden;
  box-sizing: border-box;
}


/* =====================================================
   MODAL HEADER
   ===================================================== */

.modal-header {
  position: relative;
  background: #003366;
  color: white;
  padding: 12px 45px 12px 15px;
}


.modal-header h3 {
  margin: 0;
  font-size: 16px;
}


.modal-close {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  color: #003366;
  border-radius: 50%;
  font-size: 24px;
  line-height: 28px;
  cursor: pointer;
}


/* =====================================================
   MODAL BODY
   ===================================================== */

.modal-body {
  padding: 10px 15px 15px;
  max-height: calc(90vh - 55px);
  overflow-y: auto;
}


.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;
}


.detail-row:last-child {
  border-bottom: none;
}


.detail-row span {
  font-size: 11px;
  color: #777777;
  flex-shrink: 0;
}


.detail-row strong {
  font-size: 12px;
  color: #003366;
  text-align: right;
  word-break: break-word;
}


.reference {
  max-width: 210px;
}


.remarks {
  max-width: 210px;
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

  .transaction-container {
    margin: 8px;
  }


  .transaction-main {
    gap: 5px;
  }


  .transaction-name {
    font-size: 11px;
  }


  .transaction-amount {
    font-size: 11px;
  }


  .transaction-modal {
    max-width: 100%;
  }

}

</style>