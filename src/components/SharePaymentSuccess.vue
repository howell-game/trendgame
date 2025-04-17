<template>
  <div class="color">
    <h1>Share Contribution Successful</h1>
    <p>Your share contribution has been successfully processed.</p>
    <router-link to="/share-profile/:memberId">Go Back to Home</router-link>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "PaymentSuccess",
  data() {
    return {
      transactionId: null,
      transactionStatus: null,
      transactionRef: null,
    };
  },
  created() {
    const query = this.$route.query;
    this.transactionId = query.transaction_id;
    this.transactionStatus = query.status;
    this.transactionRef = query.tx_ref;

    if (this.transactionStatus === "successful") {
      this.updateUserSession();
    }
  },
  methods: {
    ...mapActions(["logIn"]), // Use Vuex action to update user session

    updateUserSession() {
      console.log("Updating member session...");

      // Fetch the contributed share from local storage or another source
      const newContributedShare = localStorage.getItem("contributedShare");

      // Update Vuex store with new contributed share
      this.$store.commit("updateContributedShare", newContributedShare);

      // Ensure user session remains active
      this.logIn({
        name: localStorage.getItem("memberName"),
        memberId: localStorage.getItem("memberId"),
        contributedShare: newContributedShare,
        token: localStorage.getItem("token"),
      });
    },
  },
};
</script>

<style>
p {
  margin: 20px 0;
}
/* Background Box */
.color {
  text-align: center;
  margin: 20px auto;
  max-width: 900px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}
</style>
