<template>
  <div class="terms-container">
    <h2>Contribution Terms and Conditions</h2>
    <p><strong>Take just <span class="highlight">2 minutes</span> to understand the terms of engagement as a contributor.</strong></p>

    <section>
      <h3>About This Platform</h3>
      <p>
        Quickstock9ja is an <strong>investment simulation brokerage platform</strong> created by the <strong>QuickStack team</strong> for contributors. 
        We are inviting <strong>20 professionals as contributors</strong> to <strong>partner with us</strong> by purchasing shares and contributing to the final stages of our platform’s launch.
      </p>
      <p>
        As the creators, <strong>QuickStack retains 50%</strong> of the platform’s share profits, while the remaining <strong>50% is distributed to contributors</strong> according to their various <strong>share percentages</strong>.
      </p>
    </section>

    <section>
      <h3>How It Works</h3>
      <ul>
        <li>Once you sign up, you’ll access your <strong>Share Profile Page</strong>.</li>
        <li>You can <strong>deposit contributions</strong> and <strong>withdraw share profits</strong>.</li>
        <li>Your <strong>share balance</strong> is determined based on your percentage of total contributions.</li>
        <li>The <strong>higher your contribution</strong>, the larger your share of daily profits.</li>
        <li>Share balances are <strong>updated every midnight</strong>.</li>
      </ul>
    </section>

    <section>
      <h3>Understanding the Risks</h3>
      <p>
        This is an <strong>investment opportunity</strong>, not a get-rich-quick scheme. 
        Your decision to contribute should be based on your own research and confidence in the platform. 
        <span class="warning">Contributions are non-refundable</span> and will be fully utilized in investment operations.
      </p>
    </section>

    <section>
      <h3>About Quickstock9ja</h3>
      <p>
        Quickstock9ja promotes <strong>smart and calculated investments</strong>. 
        Users analyze <strong>Trend Graphs, Mean ROI, Max ROI, and Odds</strong> to make informed investment decisions.
      </p>
    </section>

    <section>
      <h3>How We Generate Revenue</h3>
      <ul>
        <li>Quickstock9ja charges a <strong>5% platform fee</strong> on each investment.</li>
        <li><strong>We are NOT a betting platform</strong> and do not control trade outcomes.</li>
        <li>Results are determined by <strong>market demand and supply</strong> in categories like <em>Agriculture, Arts, Music, and Business hubs</em>.</li>
      </ul>
    </section>

    <section>
      <h3>Why We Need You</h3>
      <p>
        Your <strong>expertise and network</strong> can help grow this platform. 
        Contributors can play a key role in <strong>marketing, advertising, and future expansion</strong>.
      </p>
    </section>

    <section>
      <h3>Security Measures</h3>
      <ul>
        <li>You are <strong>100% responsible</strong> for securing your <strong>Share Profile Page</strong>.</li>
        <li>Protect your <strong>passwords</strong> and update them if needed.</li>
        <li><strong>Automatic logout</strong> occurs after <strong>20 minutes of inactivity</strong>.</li>
        <li>Our payment system is powered by <strong>Flutterwave</strong> and legally backed.</li>
        <li>Quickstock9ja is <strong>registered with the Corporate Affairs Commission (CAC)</strong>.</li>
      </ul>
    </section>

    <section class="agree-section">
      <p>
        <strong>By clicking "Proceed to Sign Up," you confirm that you have read, understood, and agreed to these terms.</strong>
      </p>
      <button class="proceed-button" @click="proceedToSignUp">Proceed to Sign Up</button>
    </section>
  </div>
</template>

<script>
export default {
  methods: {
    proceedToSignUp() {
      this.$router.push('/share-signup'); // Adjust to your actual sign-up route
    }
  }
};
</script>

<style scoped>
.terms-container {
  background-color: lightyellow; /* Light Yellow Background */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: auto;
}

h2, h3 {
  color: #003366;
}

p, ul {
  color: #333;
  line-height: 1.6;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

.highlight {
  color: darkred;
  font-weight: bold;
}

.warning {
  color: red;
  font-weight: bold;
}

.agree-section {
  text-align: center;
  margin-top: 20px;
}

.proceed-button {
  background-color: #ff4d4d;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.proceed-button:hover {
  background-color: #003366;
}
</style>
