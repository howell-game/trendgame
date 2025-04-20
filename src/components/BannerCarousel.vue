<template>
  <div class="w-full h-[160px] overflow-hidden relative">
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
          message: "₦2,000,000 WON IN JUST 5 MINS!",
          bgClass: "bg-purple",
        },
        {
          type: "text-banner",
          message: "PLAY SMART. WIN FAST. REPEAT.",
          bgClass: "bg-red",
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
  transition: transform 1s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.banner-slide {
  @apply w-full h-full flex items-center justify-center text-center px-6;
  position: absolute; /* Keep each slide in place while sliding */
  width: 100%;
}

.banner-text {
  font-size: 2rem;
  font-weight: 800;
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
  background: linear-gradient(45deg, #7b2cbf, #9d4edd);
}

.bg-red {
  background: linear-gradient(45deg, #d00000, #ff4d6d);
}

.bg-blue {
  background: linear-gradient(45deg, #1d3557, #457b9d);
}

.bg-green {
  background: linear-gradient(45deg, #2d6a4f, #95d5b2);
}

.bg-yellow {
  background: linear-gradient(45deg, #fca311, #ffdd00);
  color: black !important;
}
</style>
