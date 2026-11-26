
<template>

<!-- =========================
         BANNER CAROUSEL
    ========================== -->
    <div
      v-if="!isAdminPage"
      class="banner-wrapper"
    >
      <ServiceBanner />
    </div>


  <div class="services-page">

    <!-- Existing Services Page -->
    <template v-if="!showEducation">

      <!-- Header -->
      <div class="services-header">
        <div>
          <h1>Services</h1>
          <p>Quick and convenient everyday services</p>
        </div>

        <div class="service-icon">
          ⚡
        </div>
      </div>

      <!-- Services Grid -->
      <div class="services-grid">

        <!-- Airtime -->
        <div class="service-card airtime-card" @click="openService('airtime')">
          <div class="card-icon">📱</div>
          <div class="card-content">
            <h2>Airtime</h2>
            <p>Buy airtime for all networks</p>
          </div>
          <div class="arrow">›</div>
        </div>

        <!-- Data -->
        <div class="service-card data-card" @click="openService('data')">
          <div class="card-icon">🌐</div>
          <div class="card-content">
            <h2>Data</h2>
            <p>Buy affordable data bundles</p>
          </div>
          <div class="arrow">›</div>
        </div>

        <!-- Electricity -->
        <div class="service-card electricity-card" @click="openService('electricity')">
          <div class="card-icon">⚡</div>
          <div class="card-content">
            <h2>Electricity</h2>
            <p>Pay your electricity bills</p>
          </div>
          <div class="arrow">›</div>
        </div>

        <!-- Cable TV -->
        <div class="service-card tv-card" @click="openService('tv')">
          <div class="card-icon">📺</div>
          <div class="card-content">
            <h2>Cable TV</h2>
            <p>Renew your TV subscription</p>
          </div>
          <div class="arrow">›</div>
        </div>

        <!-- Education -->
        <div class="service-card education-card" @click="$router.push('/education')">
          <div class="card-icon">🎓</div>
          <div class="card-content">
            <h2>Education</h2>
            <p>Access educational materials</p>
          </div>
          <div class="arrow">›</div>
        </div>

        <!-- Exam PINs -->
        <div class="service-card exam-card" @click="openService('pins')">
          <div class="card-icon">📝</div>
          <div class="card-content">
            <h2>Exam PINs</h2>
            <p>Buy WAEC and JAMB PINs</p>
          </div>
          <div class="arrow">›</div>
        </div>

      </div>

      <!-- Airtime Modal -->
      <Airtime v-if="showAirtime" @close="closeAirtime" />

      <!-- Data Modal -->
      <Data v-if="showData" @close="closeData" />

      <!-- TV Modal -->
      <TV v-if="showTV" @close="closeTV" />

      <!-- Electricity Modal -->
      <Electricity
        v-if="showElectricity"
        @close="closeElectricity"
      />

      <!-- Exam PINs Modal -->
      <ExamPins
        v-if="showExamPins"
        @close="closeExamPins"
      />

    </template>

    <!-- Education Component -->
    <Education
      v-if="showEducation"
      @close="showEducation = false"
    />

  </div>
</template>

<script>
import ServiceBanner from "./ServiceBanner.vue";
import Airtime from "./Airtime.vue";
import TV from "./TV.vue";
import Data from "./Data.vue";
import ExamPins from "./ExamPins.vue";
import Electricity from "./Electricity.vue";
import Education from "./Education.vue";

export default {
  name: "Services",

  components: {
    Airtime,
    Data,
    TV,
    Electricity,
    ExamPins,
    Education,
    ServiceBanner
  },

  data() {
    return {
      showAirtime: false,
      showData: false,
      showTV: false,
      showElectricity: false,
      showExamPins: false,
      showEducation: false
    };
  },

  methods: {
    openService(service) {
      if (service === "airtime") {
        this.showAirtime = true;
      } else if (service === "data") {
        this.showData = true;
      } else if (service === "electricity") {
        this.showElectricity = true;
      } else if (service === "tv") {
        this.showTV = true;
      } else if (service === "pins") {
        this.showExamPins = true;
      } else if (service === "education") {
        this.showEducation = true;
      }
    },

    closeAirtime() {
      this.showAirtime = false;
    },

    closeData() {
      this.showData = false;
    },

    closeTV() {
      this.showTV = false;
    },

    closeElectricity() {
      this.showElectricity = false;
    },

    closeExamPins() {
      this.showExamPins = false;
    }
  }
};
</script>

<style scoped>
/* =========================
   MAIN PAGE
========================= */

.services-page {
  padding: 10px 20px;
  background: #0e327f;
  color: white;
  min-height: 100%;
}

/* =========================
   HEADER
========================= */

.services-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.services-header h1 {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.services-header p {
  margin: 5px 0 0;
  color: #d5e3ff;
  font-size: 13px;
}

.service-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* =========================
   SERVICES GRID
========================= */

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 1200px;
}

/* =========================
   GENERAL CARD DESIGN
========================= */

.service-card {
  position: relative;
  min-height: 82px;
  padding: 12px 14px;
  border-radius: 13px;

  display: flex;
  align-items: center;
  gap: 12px;

  cursor: pointer;
  overflow: hidden;

  color: #ffffff;

  box-shadow: 0 5px 13px rgba(0, 0, 0, 0.19);

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
  filter: brightness(1.08);
}

.service-card:active {
  transform: scale(0.98);
}

/* Soft decorative shine */
.service-card::after {
  content: "";
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  right: -32px;
  top: -48px;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

/* =========================
   INDIVIDUAL CARD COLOURS
========================= */

/* AIRTIME - ORANGE */

.airtime-card {
  background: linear-gradient(135deg, #ff8a00, #ed5b00);
  border: 1px solid #ffad42;
}

/* DATA - TURQUOISE */

.data-card {
  background: linear-gradient(135deg, #00bfa5, #008fbd);
  border: 1px solid #45e1d0;
}

/* ELECTRICITY - GOLD */

.electricity-card {
  background: linear-gradient(135deg, #ffc928, #ed9900);
  border: 1px solid #ffe27b;
  color: #272000;
}

/* TV - PURPLE */

.tv-card {
  background: linear-gradient(135deg, #9360e8, #6033bd);
  border: 1px solid #b18af5;
}

/* EDUCATION - GREEN */

.education-card {
  background: linear-gradient(135deg, #26b85c, #078044);
  border: 1px solid #63df8e;
}

/* EXAM PINS - CORAL RED */

.exam-card {
  background: linear-gradient(135deg, #ff626e, #dc304f);
  border: 1px solid #ff9aa1;
}

/* =========================
   ICON
========================= */

.card-icon {
  width: 43px;
  height: 43px;
  min-width: 43px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.19);
  border: 1px solid rgba(255, 255, 255, 0.28);

  font-size: 21px;

  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.10);
}

/* Gold card icon */
.electricity-card .card-icon {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
}

/* =========================
   CARD TEXT
========================= */

.card-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.card-content h2 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: inherit;
  letter-spacing: 0.2px;
}

.card-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.91);
  font-size: 11px;
  line-height: 1.4;
}

/* Gold card text */
.electricity-card .card-content p {
  color: rgba(39, 32, 0, 0.82);
}

/* =========================
   ARROW
========================= */

.arrow {
  position: relative;
  z-index: 1;
  font-size: 27px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.2s ease;
}

.electricity-card .arrow {
  color: #272000;
}

.service-card:hover .arrow {
  transform: translateX(4px);
}

/* =========================
   MOBILE RESPONSIVENESS
========================= */

@media (max-width: 650px) {
  .services-page {
    padding: 12px;
  }

  .services-header {
    margin-bottom: 16px;
  }

  .services-header h1 {
    font-size: 25px;
  }

  .services-header p {
    font-size: 12px;
  }

  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .service-card {
    min-height: 76px;
    padding: 9px;
    gap: 8px;
    border-radius: 11px;
  }

  .card-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;
    border-radius: 9px;
    font-size: 18px;
  }

  .card-content h2 {
    font-size: 13px;
  }

  .card-content p {
    font-size: 9px;
  }

  .arrow {
    font-size: 21px;
  }
}

/* Smaller phones */
@media (max-width: 360px) {
  .services-grid {
    gap: 7px;
  }

  .service-card {
    padding: 8px 6px;
    gap: 6px;
  }

  .card-icon {
    width: 31px;
    height: 31px;
    min-width: 31px;
    font-size: 16px;
  }

  .card-content h2 {
    font-size: 12px;
  }

  .card-content p {
    font-size: 8px;
  }
}
</style>
