<template>
  <div class="relative w-full h-64 overflow-hidden rounded-xl shadow-lg bg-black">
    <transition-group name="fade" tag="div">
      <component
        :is="currentSlide.type"
        :key="currentSlideIndex"
        v-bind="currentSlide"
        class="w-full h-full object-cover"
      ></component>
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
        { type: "img", src: "/assets/banner1.jpg", alt: "Ad 1" },
        { type: "video", src: "/assets/promo.mp4", autoplay: true, muted: true, loop: true },
        { type: "text-banner", message: "₦2,000,000 won in just 5 mins!" }
      ],
      interval: null,
    };
  },
  computed: {
    currentSlide() {
      return this.slides[this.currentSlideIndex];
    }
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
      }, 5000); // Change every 5 seconds
    }
  },
  components: {
    img: {
      props: ["src", "alt"],
      template: `<img :src="src" :alt="alt" class="w-full h-full object-cover" />`
    },
    video: {
      props: ["src", "autoplay", "muted", "loop"],
      template: `<video :src="src" :autoplay="autoplay" :muted="muted" :loop="loop" class="w-full h-full object-cover" />`
    },
    "text-banner": {
      props: ["message"],
      template: `<div class="flex items-center justify-center w-full h-full text-white text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800">
                  {{ message }}
                 </div>`
    }
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
