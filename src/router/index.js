import store from '../store'; 
import { createRouter, createWebHistory } from "vue-router";
import InvestmentPage from "../components/InvestmentPage.vue";  // Fix: use relative path
import Signup from "../components/Signup.vue";                    // Fix: use relative path
import Terms from '@/components/Terms.vue';
import Chat from '@/components/Chat.vue';
import AboutPage from "../components/AboutPage.vue";   
import Login from "../components/Login.vue";                      // Fix: use relative path
import SummaryPage from "../components/SummaryPage.vue";          // Fix: use relative path
import ProfilePage from "../components/ProfilePage.vue";          // Fix: use relative path
import DepositPage from '@/components/DepositPage.vue';
import ShareDeposit from '@/components/ShareDeposit.vue';
import ShareWithdrawal from '@/components/ShareWithdrawal.vue';
import ShareProfile from "../components/ShareProfile.vue";
import ShareSignup from "../components/ShareSignup.vue";
import ShareVerifylog from "../components/ShareVerifylog.vue";
import WithdrawalPage from '@/components/WithdrawalPage.vue';
import InvestmentDetails from '@/components/InvestmentDetails.vue';
import Timeframe from '@/components/Timeframe.vue';
import BannerCarousel from '@/components/BannerCarousel.vue';
import ShareTerms from '@/components/ShareTerms.vue';
import TrendGraph from '@/components/TrendGraph.vue';
import TransactionPage from '@/components/TransactionPage.vue';
import PaymentSuccess from '@/components/PaymentSuccess.vue';
import Receipt from '@/components/Receipt.vue';
import InvestmentAdvice from '@/components/InvestmentAdvice.vue';
import VerifyLog from '@/components/VerifyLog.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';
import ResetPassword from '@/components/ResetPassword.vue';
import SharePaymentSuccess from '@/components/SharePaymentSuccess.vue';
import ShareResetPassword from '@/components/ShareResetPassword.vue';
import ShareLogin from '@/components/ShareLogin.vue';
import ShareForgotPassword from '@/components/ShareForgotPassword.vue';
// Define the routes
const routes = [
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/share-deposit/:memberId", component: ShareDeposit },
  { path: "/share-withdrawal/:memberId", component: ShareWithdrawal },
  { path: "/share-forgot-password", component: ShareForgotPassword },
  { path: "/share-login", component: ShareLogin },
  { path: "/reset-password/:token", component: ResetPassword },
  { path: "/share-reset-password/:token", component: ShareResetPassword },
  { path: "/verify", component: VerifyLog },
  { path: "/share-terms", component: ShareTerms },
  { path: "/share-verify", component: ShareVerifylog },
  { path: "/share-signup", component: ShareSignup },
  { path: "/about", component: AboutPage },
  { path: "/advice", component: InvestmentAdvice },
  { path: "/chat", component: Chat },
  { path: "/share-profile/:memberId", component: ShareProfile },
  { path: "/terms", component: Terms},
  { path: "/", component: InvestmentPage },
  { path: "/signup", component: Signup },
  { path: "/login", component: Login },
  { path: "/summary", component: SummaryPage },
  { path: "/timeframe", component: Timeframe },
  { path: "/bannercarousel", component: BannerCarousel },
  { path: "/trend", component: TrendGraph },
  { path: '/payment-success', component: PaymentSuccess }, // Add this route
  { path: '/share-payment-success', component: SharePaymentSuccess },
  { path: '/transaction/:userId', component: TransactionPage },
  { path: "/summary", name: "SummaryPage", component: SummaryPage },

  { path: '/profile/:userId', component: ProfilePage },
  { path: '/verify/:userId', name: 'Verify', component: () => import('../views/Verify.vue') },
  { path: '/deposit/:userId', component: DepositPage },
  { path: '/withdrawal/:userId', component: WithdrawalPage },
  { path: '/receipt/:userId', component: Receipt },
  { path: '/investment-details/:userId', component: InvestmentDetails },
  {path: '/profile', redirect: '/login'},
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.path.startsWith('/profile') && !token) {
      next('/login'); // Redirect to login if not authenticated
    } else {
      next();
    }
  });
  

// Export the router instance
export default router;
