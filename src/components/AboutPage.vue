<template>
  <div class="about-container">
    <v-card class="card">
      <v-card-title>About QuickStock9ja</v-card-title>
      <v-card-text>Empowering smart investments with real-time supply and demand analysis.</v-card-text>
    </v-card>

    <section class="overview">
      <v-card class="card">
        <v-card-title>What is QuickStock9ja?</v-card-title>
        <v-card-text>QuickStock9ja is an investment platform that allows users to analyze market trends and make informed investment decisions.</v-card-text>
      </v-card>
    </section>

    <section class="features">
      <v-card class="card">
        <v-card-title>Key Features</v-card-title>
        <v-card-text>
          <ul>
            <li>📊 Real-time Supply & Demand Trend Analysis</li>
            <li>💰 Flexible Investment Plans (5m, 1h, 1d, etc.)</li>
            <li>⚡ Automated Outcome Calculation</li>
            <li>💳 Secure Deposit & Withdrawal System</li>
            <li>🖥 User-Friendly Dashboard for Easy Monitoring</li>
          </ul>
        </v-card-text>
      </v-card>
    </section>

    <section class="how-it-works">
      <v-card class="card">
        <v-card-title>How It Works</v-card-title>
        <v-card-text>
          <div class="steps">
            <div class="step">✅ Sign up & Fund your account.</div>
            <div class="step">📊 Choose a Category & Predict Market Movement.</div>
            <div class="step">⏳ Set an Investment Timeframe & Confirm.</div>
            <div class="step">📈 Monitor Live Trends & Results.</div>
            <div class="step">💰 Withdraw Profits or Reinvest.</div>
          </div>
        </v-card-text>
      </v-card>
    </section>

    <section class="security">
      <v-card class="card">
        <v-card-title>Security & Transparency</v-card-title>
        <v-card-text>All transactions are securely processed using Flutterwave, and investment outcomes are data-driven, ensuring fairness.</v-card-text>
      </v-card>
    </section>

    <section class="contact">
      <v-card class="card">
        <v-card-title>Need Help?</v-card-title>
        <v-card-text>
          Reach out to us anytime for support.
          <ul>
          <li>You can chat with us <router-link to="/chat">here</router-link></li> 
            <li>📧 Email: support@quickstock9ja.com</li>
           <li>
  🔗 Follow us on Twitter & 
  <a href="https://web.facebook.com/search/top?q=quickstock9ja" target="_blank" rel="noopener noreferrer">Facebook</a>
</li>

          </ul>
        </v-card-text>
      </v-card>
    </section>

    <footer>
      <router-link to="/" class="back-btn">⬅ Back to Dashboard</router-link>
    </footer>
  </div>
</template>

<style scoped>
.about-container { 
  text-align: center; 
  margin: 20px auto; 
  max-width: 800px; 
}

.card {
  margin: 10px 0;
  padding: 15px;
  background: lightyellow;
  color: black;
}

.back-btn { 
  display: block; 
  text-align: center; 
  margin-top: 20px; 
  padding: 10px; 
  background: #3498db; 
  color: yellow; 
  text-decoration: none; 
  border-radius: 5px; 
}
</style>
