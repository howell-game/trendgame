<template>
  <div>
    <div class="base">
      <h1>Contributor, {{ memberName }}</h1>
      <p><strong class="highlight-text">Member ID:</strong> <span class="bold-yellow">{{ memberId }}</span></p>
      <p><strong class="highlight-text">Share Balance:</strong> <span class="bold-yellow">{{ shareBalance }}</span></p>
      <p><strong class="highlight-text">Contributed Share:</strong> <span class="bold-yellow">{{ contributedShare }}</span></p>
      <p><strong class="highlight-text">Share Percentage:</strong> <span class="bold-yellow">{{ sharePercentage }}%</span></p>
    
      <div class="button-container">
        <button class="button deposit" @click="navigateToDeposit">Deposit</button>
        <button class="button withdraw" @click="navigateToWithdrawal">Withdraw</button>
      </div>
    </div>

    <!-- Styled Logout Button -->
    <div class="logout-container">
      <button class="view-quickstock" @click="handleLogout">View Quickstock9ja</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import axios from "axios";

export default {
  computed: {
    ...mapState(["memberName", "memberId"]),
    ...mapGetters(["shareBalance", "contributedShare", "sharePercentage"]),
  },

  methods: {
    ...mapMutations(["updateShareBalance", "updateContributedShare", "updateSharePercentage", "logOut"]),

    async fetchMemberBalance() {
      if (!this.memberId) {
        console.error("⚠️ Error: memberId is missing!");
        return;
      }

      try {
        const response = await axios.get(
  `${import.meta.env.VITE_APP_BASE_URL}/api/balance/${this.memberId}/details`,
  {
    headers: { Authorization: `Bearer ${this.$store.getters.token}` },
  }
);

        this.updateShareBalance(response.data.shareBalance);
        this.updateContributedShare(response.data.contributedShare);
        this.updateSharePercentage(response.data.sharePercentage);
      } catch (error) {
        console.error("Failed to fetch member details:", error);
      }
    },

    navigateToDeposit() {
      this.$router.push(`/share-deposit/${this.memberId}`);
      setTimeout(this.fetchMemberBalance, 500);
    },

    navigateToWithdrawal() {
      this.$router.push(`/share-withdrawal/${this.memberId}`);
      setTimeout(this.fetchMemberBalance, 500);
    },

    handleLogout() {
      console.log("🚪 Logging out...");
      this.$store.commit("logOut");
      this.$router.push("/"); // Redirect to login page
    },

    resetInactivityTimer() {
      clearTimeout(this.inactivityTimer);
      this.startInactivityTimer();
    },

    startInactivityTimer() {
      this.inactivityTimer = setTimeout(() => {
        console.log("⏳ User inactive for 20 minutes, logging out...");
        this.$store.commit("logOut");
        this.$router.push("/share-login");
      }, 20 * 60 * 1000); // 20 minutes
    },
  },

  created() {
    this.fetchMemberBalance();
    this.startInactivityTimer();
    window.addEventListener("mousemove", this.resetInactivityTimer);
    window.addEventListener("keydown", this.resetInactivityTimer);
    window.addEventListener("click", this.resetInactivityTimer);
  },

  beforeDestroy() {
    window.removeEventListener("mousemove", this.resetInactivityTimer);
    window.removeEventListener("keydown", this.resetInactivityTimer);
    window.removeEventListener("click", this.resetInactivityTimer);
    clearTimeout(this.inactivityTimer);
  },
};
</script>

<style scoped>
.base {
  background-color: lightyellow;
  padding: 20px;
  border-radius: 8px;
}

.bold-yellow {
  font-weight: bold;
  color: black;
}

.highlight-text {
  font-weight: bold;
  color: darkblue;
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
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.button {
  width: 90px;
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

.deposit {
  background-color: #003366;
}

.withdraw {
  background-color: #003366;
}

.button:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.button:active {
  transform: scale(0.97);
}

/* View Quickstock9ja Button */
.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.view-quickstock {
  display: block;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.view-quickstock:hover {
  background-color: darkblue;
}
</style>
