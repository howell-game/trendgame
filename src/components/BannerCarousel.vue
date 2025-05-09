<template>
<div class="banner-carousel-wrapper">
  <div class="w-full h-[160px] overflow-hidden relative">
  <div class="w-full h-full relative">
    <transition-group name="slide" tag="div" class="w-full h-full relative flex">
      <div
        v-if="currentSlide.type === 'text-banner'"
        :key="currentSlideIndex"
        class="banner-slide"
        :class="currentSlide.bgClass"
      >
        <p class="banner-text">
          {{ currentSlide.message }}
        </p>
      </div>
    </transition-group>
     </div>
      </div>
  </div>
</template>

<script>
export default {
  name: "BannerCarousel",
  data() {
    return {
      currentSlideIndex: 0,
      slides: [
        {
        type: "text-banner",
          message: "₦250 BONUS on SignUp",
          bgClass: "bg-luck",
        },
        {
          type: "text-banner",
          message: "₦2,000,000 WON IN JUST 5 MINS!",
          bgClass: "bg-purple",
        },
         {
          type: "text-banner",
          message: "NO GREED.NO FEAR.JUST win",
          bgClass: "bg-orange",
        },
        {
          type: "text-banner",
          message: "₦250 BONUS on SignUp",
          bgClass: "bg-luck",
        },
         {
          type: "text-banner",
          message: "ALWAYS 'VIEW TREND'",
          bgClass: "bg-violet",
        },

        {
          type: "text-banner",
          message: "PLAY SMART. WIN FAST. REPEAT.",
          bgClass: "bg-red",
        },
        {
        type: "text-banner",
          message: "₦250 BONUS on SignUp",
          bgClass: "bg-luck",
        },
        {
          type: "text-banner",
          message: "YOUR WINNING JOURNEY STARTS HERE!",
          bgClass: "bg-blue",
        },
        {
          type: "text-banner",
          message: "NO STRESS, JUST PROFIT",
          bgClass: "bg-green",
        },
        {
        type: "text-banner",
          message: "₦250 BONUS on SignUp",
          bgClass: "bg-luck",
        },
        {
          type: "text-banner",
          message: "NIGERIA’S #1 FOR FAST WINS 💸",
          bgClass: "bg-yellow",
        },
      ],
      interval: null,
    };
  },
  computed: {
    currentSlide() {
      return this.slides[this.currentSlideIndex];
    },
  },
  mounted() {
    this.startRotation();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    startRotation() {
      this.interval = setInterval(() => {
        this.currentSlideIndex =
          (this.currentSlideIndex + 1) % this.slides.length;
      }, 8000);
    },
  },
};
</script>

<style>

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(30%);
}

.banner-slide {
  @apply w-full h-full flex items-center justify-center text-center px-6;
  /* No need to manually position anymore — handled via Tailwind `absolute inset-0` */
}
.banner-text {
  font-size: 2rem;
  font-weight: 900;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  color: white;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .banner-text {
    font-size: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .banner-text {
    font-size: 3rem;
  }
}

/* Background color classes */
.bg-purple {
  background: linear-gradient(45deg, #7b2cbf,rgb(20, 4, 33));
}

.bg-red {
  background: linear-gradient(45deg, #d00000,rgb(184, 209, 45));
}
.bg-luck {
  background: linear-gradient(45deg,rgb(0, 208, 28),rgb(51, 7, 15));
}
.bg-violet {
  background: linear-gradient(45deg,rgba(164, 21, 21, 0.73),rgb(20, 130, 16));
}
.bg-blue {
  background: linear-gradient(45deg, #1d3557,rgb(173, 49, 113));
}

.bg-orange {
  background: linear-gradient(45deg,rgb(116, 57, 12),rgb(25, 25, 203));
}

.bg-green {
  background: linear-gradient(45deg,rgb(40, 172, 113),rgb(4, 26, 14));
}

.bg-yellow {
  background: linear-gradient(45deg, #fca311,rgb(46, 43, 21));
  color: black !important;
}
</style>