<template>
  <div class="reset-password">
    <h2>Share Reset Your Password</h2>
    <p>Enter a new password below</p>
    <input v-model="newPassword" type="password" placeholder="New Password" />
    <input v-model="confirmPassword" type="password" placeholder="Confirm Password" />
    <button @click="resetPassword">Reset Password</button>
   <p v-if="message" :class="message.includes('successful') ? 'success' : 'message'">
  {{ message }}
</p>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      newPassword: "",
      confirmPassword: "",
      message: "",
      token: "",
    };
  },
  created() {
    this.token = this.$route.params.token;
  },
  methods: {
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.message = "Passwords do not match!";
        return;
      }

      try {
       const response = await axios.post(
  `${import.meta.env.VITE_APP_BASE_URL}/auth/share-reset-password/${this.token}`,
  { newPassword: this.newPassword }
);


        this.message = response.data.message;
      } catch (error) {
        this.message = error.response?.data.message || "Error resetting password";
      }
    },
  },
};
</script>

<style scoped>
.reset-password {
  text-align: center;
  margin: 20px auto;
  max-width: 900px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightyellow;
}
input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}
button {
  width: 100%;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: darkred;
}
button:active {
  background-color: #8b0000;
}
.message {
  margin-top: 10px;
  color: red;
}
.success {
  color: green;
}
</style>