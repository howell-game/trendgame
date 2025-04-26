<template>

  <div class="app">
    <header>
    <div class="logo-container">
    <img src="@/assets/logo.png" alt="QuickStock9ja Logo" class="logo" /><h1 class="quick">QuickStock9ja</h1></div>
       
      
      
      <nav v-if="!isHiddenPage">
      
    
  
        
         <router-link to="/advice">How2Trade</router-link> 
         <router-link v-if="isLoggedIn" :to="`/profile/${user?.userId}/`">Profile</router-link>
        <!-- Conditionally render SignUp/Login links based on isLoggedIn -->
        <router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link> 
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <!-- Render Logout link if logged in -->
        <a v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>

        
        
      </nav>
      <div id="app">
    <Timeframe /> <!-- Display the Timeframe component -->
  </div>
    </header>


    <main>
      <div class="banner-wrapper">
    <BannerCarousel />
  </div>
      <router-view />
    </main>
<div id="app">
    <Timeframe /> <!-- Display the Timeframe component -->
  </div>
    <footer>
    <nav2 v-if="!isHiddenPage">
     <router-link to="/about/">AboutUs</router-link> | |
           <router-link to="/terms/">Terms&conditions</router-link></nav2>
      <p>© 2025 QuickStock9ja. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState, mapActions } from 'vuex';
import Timeframe from './components/Timeframe.vue'; 
import BannerCarousel from "./components/BannerCarousel.vue";


export default {
  name: "App",
   components: {
    Timeframe, // Register Timeframe component
    BannerCarousel,
  },
  computed: {
    ...mapState(['isLoggedIn']), // Get `isLoggedIn` state from Vuex
    isHiddenPage() {
    return this.$route.path.startsWith("/share-profile") || this.$route.path.startsWith("/share-terms")  || this.$route.path.startsWith("/share-payment-success") || this.$route.path.startsWith("/share-deposit") || this.$route.path.startsWith("/share-withdrawal")  || this.$route.path.startsWith("/share-signup") || this.$route.path.startsWith("/share-login") || this.$route.path.startsWith("/share-forgot-password") || this.$route.path.startsWith("/share-reset-password");
  },
  },
  methods: {
    ...mapActions(['logIn', 'logOut']), // Map Vuex actions for login/logout

  logout() {
  this.logOut(); // Call Vuex action to clear state
  this.$router.push("/login"); // Redirect to login page
  },

   resetTimer() {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = setTimeout(() => {
        if (this.isLoggedIn) {
          this.logout();
        }
      }, 3600000); // 1 hour (60 min * 60 sec * 1000 ms)
    },

    activityListener() {
      window.addEventListener("mousemove", this.resetTimer);
      window.addEventListener("keydown", this.resetTimer);
      window.addEventListener("click", this.resetTimer);
      this.resetTimer();
    },


  },
  mounted() {
    this.activityListener();
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.resetTimer);
    window.removeEventListener("keydown", this.resetTimer);
    window.removeEventListener("click", this.resetTimer);
    clearTimeout(this.logoutTimer);
  },
  
};
</script>



<style>

.header,  {
  color: yellow; /* Sets the text color to a golden shade */
  text-align: center; /* Centers the text */
  font-weight: bold; /* Makes the text bold for emphasis */
}


/* Global App Styling */
.app {
  font-family: Arial, sans-serif;
  background-color: lightblue;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: #333;
}




/* Header Styling */
header {
  background-color: #003366;
  color: yellow;
  padding: 10px 0;
  border-bottom: 2px solid rgba(240, 236, 31, 0.81); /* Subtle highlight */
}

header h1 {
  margin: 0;
  font-size: 24px;
}

nav {
  margin-top: 10px;
  border-bottom: 2px solid rgba(240, 236, 31, 0.81); /* Subtle highlight */
}

nav a {
  color: rgba(240, 236, 31, 0.81);
  text-decoration: none;
  margin: 0 10px;
  
}

nav a:hover {
  text-decoration: underline;
}

/* Main Content Area */
main {
  flex-grow: 1;
  padding: 20px;
}




/* Footer Styling */
footer {
  background-color:rgb(0, 102, 48);
  
  padding: 10px 0;
  
}
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  width: 50px; /* Adjust size as needed */
  height: 50px; /* Ensure it's a perfect circle */
  margin-left: 15px; /* Moves the logo slightly outward */
  border-radius: 50%; /* Makes it circular */
  object-fit: cover; /* Ensures the image fills the circle properly */
  margin-right: 10px;
}




/
.footer p {
  margin: 0;
}
.app {
  background-image: url('@/assets/background4.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
}
/* Footer Styling */
footer {
  background-color: #003366; /* Matches header color */
  color: yellow; /* Matches header text color */
  padding: 15px 0;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  border-top: 2px solid rgba(240, 236, 31, 0.81); /* Subtle highlight */
}


footer p {
  margin: 0;
  color: yellow; /* Ensures text remains yellow */
}
.banner-wrapper {
  height: 5rem; /* same as h-64 */
  max-height: 5rem;
  overflow: hidden;
  border-radius: 1rem;
  margin-bottom: 1rem;
}




</style>
