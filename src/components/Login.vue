<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin" autocomplete="on">
      <label for="email">Email</label>
      <input
  id="email"
  type="email"
  v-model="email"
  placeholder="Email"
  autocomplete="email"
  required
/>
      
      <label for="password">Password</label>
      <input
  id="password"
  type="password"
  v-model="password"
  placeholder="Password"
  autocomplete="current-password"
  required
/>
      
      <button type="submit">Login</button>
    </form>
    <p v-if="message" class="error">{{ message }}</p>
    <p>Forgot Password? Click <router-link to="/forgot-password">HERE</router-link> </p>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },

  mounted() {
    // Always start with an empty password field
    this.password = '';
  },

  methods: {
    async handleLogin() {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/auth/login`,
          {
            email: this.email,
            password: this.password,
          }
        );

        const { token, user } = response.data;

        this.$store.dispatch('logIn', {
          name: user.name,
          userId: user.userId,
          balance: user.balance,
          token
        });

        // Clear password before leaving login page
        this.password = '';

        this.$router.push(`/profile/${user.userId}`);

      } catch (error) {

        // Also clear password after a failed login
        this.password = '';

        const errorMessage = error.response?.data?.message;

        if (errorMessage && errorMessage.includes('blocked')) {
          this.message = errorMessage;
        } else {
          this.message =
            errorMessage ||
            'An error occurred. Please try again.';
        }

        console.error(
          'Login failed:',
          this.message
        );
      }
    },
  },
};
</script>

<style>
.login {
  text-align: center;
  margin: 20px auto;
  max-width: 900px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box; /* Prevents padding from increasing width */
}

input:focus {
  border-color: #007BFF;
  outline: none;
}

button {
  width: 100%;
  padding: 10px 20px;
  background-color: red; /* Default button color */
  color: white; /* Text color */
  border: none; /* Remove default border */
  border-radius: 4px; /* Rounded corners */
  cursor: pointer; /* Pointer cursor on hover */
  font-size: 16px;
  transition: background-color 0.3s ease; /* Smooth transition for color change */
}

button:hover {
  background-color: darkred; /* Dark red when hovered */
}

button:active {
  background-color: #8B0000; /* Darker red when clicked */
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}
</style>
