
<template>
  <div class="proprietor-page">
    <div class="dashboard-container">
      <!-- Top navigation -->
      <header class="topbar">
        <div class="brand">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 9 12 4l9 5-9 5-9-5Z" />
              <path d="M6 11v5c3.5 3 8.5 3 12 0v-5" />
              <path d="M21 9v6" />
            </svg>
          </div>

          <div>
            <h2>ETrend Education</h2>
            <p>School management portal</p>
          </div>
        </div>

        <div class="portal-label">
          <span class="status-dot"></span>
          Proprietor Portal
        </div>
      </header>

      <!-- Welcome section -->
      <section class="welcome-banner">
        <div class="welcome-content">
          <span class="eyebrow">SCHOOL MANAGEMENT</span>
          <h1>Welcome, Proprietor!</h1>
          <p>
            Everything you need to manage your school's academic resources,
            staff records and salary administration, all in one place.
          </p>
        </div>

        <div class="welcome-art" aria-hidden="true">
          <div class="art-circle circle-one"></div>
          <div class="art-circle circle-two"></div>

          <svg viewBox="0 0 160 140">
            <path d="M22 37 80 17l58 20-58 21-58-21Z" />
            <path d="M40 45v31c24 20 56 20 80 0V45" />
            <path d="M138 38v38" />
            <path d="M130 82h16" />
            <path d="M60 99h40" />
            <path d="M70 88v11m20-11v11" />
            <path d="M47 119h66" />
          </svg>
        </div>
      </section>

      <!-- Section heading -->
      <section class="modules-section">
        <div class="section-heading">
          <div>
            <span class="section-kicker">YOUR WORKSPACE</span>
            <h2>Management tools</h2>
            <p>Select a module to manage that area of your school.</p>
          </div>

          <div class="tool-count">
            <span>04</span>
            <small>CORE MODULES</small>
          </div>
        </div>

        <!-- Management cards -->
        <div class="modules-grid">
          <article
  v-for="(module, index) in modules"
  :key="module.id"
  class="module-card"
  :class="`module-${module.id}`"
  @click="openModule(module)"
  role="link"
  tabindex="0"
  @keydown.enter="openModule(module)"
  @keydown.space.prevent="openModule(module)"
>
            <div class="card-top">
              <div class="module-icon">
                <!-- Lesson Notes -->
                <svg
                  v-if="module.id === 'lesson-notes'"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
                  <path d="M4 6v15" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>

                <!-- Question Banks -->
                <svg
                  v-else-if="module.id === 'question-banks'"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="5" y="4" width="15" height="17" rx="2" />
                  <path d="M9 8h7M9 12h7M9 16h4" />
                  <path d="M3 8V3h13" />
                </svg>

                <!-- Bulk Salary Pay -->
                <svg
                  v-else-if="module.id === 'bulk-salary-pay'"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18" />
                  <circle cx="12" cy="14.5" r="2" />
                  <path d="M6 7.5h2m8 9h2" />
                </svg>

                <!-- Teachers Records -->
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <span class="card-number">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
            </div>

            <h3>{{ module.title }}</h3>
            <p class="module-description">{{ module.description }}</p>

            <div class="card-footer">
              <span class="action-label">{{ module.action }}</span>

              <span class="arrow-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </div>
          </article>
        </div>
      </section>

      <!-- Bottom information -->
      <footer class="dashboard-footer">
        <div class="footer-mark">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p>
          <strong>ETrend Education Services</strong>
          <span> &middot; </span>
          Your school, organized.
        </p>
      </footer>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const modules = ref([
  {
    id: "lesson-notes",
    title: "Lesson Notes",
    description:
      "Create, organize and manage teachers' lesson notes and learning materials.",
    action: "Manage lesson notes",
    route: "/lesson-notes",
  },
  {
    id: "question-banks",
    title: "Question Banks",
    description:
      "Add, review and organize exam questions by class, subject and topic.",
    action: "Manage questions",
    route: "/question-bank",
  },
  {
    id: "bulk-salary-pay",
    title: "Bulk Salary Pay",
    description:
      "Prepare staff salary payments in batches and review payment details.",
    action: "Manage payroll",
    route: "/bulk-salary-pay",
  },
  {
    id: "teachers-records",
    title: "Teachers Records",
    description:
      "Organize teachers' profiles, contact information and employment records.",
    action: "View staff records",
    route: "/teachers-records",
  },
]);

function openModule(module) {
  router.push(module.route);
}
</script>


<style scoped>
.proprietor-page {
  min-height: 100vh;
  padding: 28px 20px;
  background: #fff9db;
  color: #003366;
  font-family: inherit;
  box-sizing: border-box;
}

.proprietor-page * {
  box-sizing: border-box;
}

.dashboard-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* Top navigation */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: #003366;
  color: #ffed9e;
}

.brand-logo svg {
  width: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.brand h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.brand p {
  margin: 4px 0 0;
  color: #65748a;
  font-size: 12px;
}

.portal-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #eadfae;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2b8a58;
}

/* Welcome banner */
.welcome-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 230px;
  overflow: hidden;
  padding: 34px 42px;
  border-radius: 24px;
  background: #003366;
  color: #ffffff;
  box-shadow: 0 14px 32px rgba(0, 51, 102, 0.12);
}

.welcome-content {
  position: relative;
  z-index: 2;
  max-width: 650px;
}

.eyebrow,
.section-kicker {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.eyebrow {
  color: #ffed9e;
}

.welcome-content h1 {
  margin: 0;
  font-size: clamp(27px, 4vw, 39px);
  line-height: 1.15;
  letter-spacing: -1.1px;
}

.welcome-content p {
  max-width: 570px;
  margin: 14px 0 0;
  color: #e4edf7;
  font-size: 14px;
  line-height: 1.8;
}

.welcome-art {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 170px;
  height: 160px;
  margin-left: 18px;
}

.welcome-art svg {
  position: relative;
  z-index: 1;
  width: 145px;
  fill: none;
  stroke: #ffed9e;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.art-circle {
  position: absolute;
  border: 1px solid rgba(255, 237, 158, 0.25);
  border-radius: 50%;
}

.circle-one {
  width: 150px;
  height: 150px;
}

.circle-two {
  width: 115px;
  height: 115px;
  background: rgba(255, 237, 158, 0.06);
}

/* Module section */
.modules-section {
  padding-top: 36px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.section-kicker {
  margin-bottom: 8px;
  color: #8b7830;
  font-size: 9px;
}

.section-heading h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.6px;
}

.section-heading p {
  margin: 8px 0 0;
  color: #68758a;
  font-size: 13px;
  line-height: 1.6;
}

.tool-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 12px 16px;
  border: 1px solid #eadfae;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
}

.tool-count span {
  font-size: 24px;
  font-weight: 800;
}

.tool-count small {
  margin-top: 2px;
  color: #6d7786;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

/* Cards */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.module-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 25px;
  border: 1px solid #eee3b8;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 5px 16px rgba(0, 51, 102, 0.035);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  border-color: #d8c56f;
  box-shadow: 0 14px 28px rgba(0, 51, 102, 0.09);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 21px;
}

.module-icon {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  border-radius: 16px;
  background: #fff4c5;
  color: #003366;
}

.module-icon svg {
  width: 27px;
  height: 27px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.card-number {
  color: #b1a777;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.module-card h3 {
  margin: 0;
  color: #003366;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.module-description {
  min-height: 48px;
  margin: 10px 0 22px;
  color: #68758a;
  font-size: 13px;
  line-height: 1.8;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f1ecd7;
}

.action-label {
  color: #003366;
  font-size: 12px;
  font-weight: 800;
}

.arrow-circle {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #003366;
  color: #ffed9e;
  transition: transform 0.2s ease;
}

.module-card:hover .arrow-circle {
  transform: translateX(3px);
}

.arrow-circle svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Footer */
.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 38px;
  padding: 20px 10px 5px;
  border-top: 1px solid #e9dfb6;
}

.footer-mark {
  display: flex;
  align-items: center;
  gap: 3px;
}

.footer-mark span {
  width: 5px;
  height: 15px;
  border-radius: 4px;
  background: #003366;
}

.footer-mark span:nth-child(2) {
  height: 22px;
  background: #c7a93c;
}

.dashboard-footer p {
  margin: 0;
  color: #788092;
  font-size: 11px;
}

.dashboard-footer strong {
  color: #003366;
}

/* Tablet and mobile */
@media (max-width: 700px) {
  .proprietor-page {
    padding: 20px 14px;
  }

  .topbar {
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .brand h2 {
    font-size: 16px;
  }

  .brand p {
    font-size: 10px;
  }

  .portal-label {
    padding: 8px 10px;
    font-size: 10px;
  }

  .welcome-banner {
    min-height: 0;
    padding: 27px 24px;
    border-radius: 20px;
  }

  .welcome-content p {
    font-size: 13px;
  }

  .welcome-art {
    flex-basis: 100px;
    height: 110px;
    margin-left: 0;
  }

  .welcome-art svg {
    width: 95px;
  }

  .circle-one {
    width: 105px;
    height: 105px;
  }

  .circle-two {
    width: 80px;
    height: 80px;
  }

  .modules-section {
    padding-top: 29px;
  }

  .section-heading h2 {
    font-size: 22px;
  }

  .modules-grid {
    gap: 13px;
  }

  .module-card {
    padding: 18px;
    border-radius: 17px;
  }

  .module-icon {
    width: 46px;
    height: 46px;
    border-radius: 13px;
  }

  .module-icon svg {
    width: 23px;
    height: 23px;
  }

  .module-card h3 {
    font-size: 17px;
  }

  .module-description {
    font-size: 12px;
  }

  .action-label {
    font-size: 11px;
  }
}

@media (max-width: 460px) {
  .topbar {
    flex-wrap: wrap;
  }

  .welcome-banner {
    padding: 25px 21px;
  }

  .welcome-art {
    display: none;
  }

  .section-heading {
    align-items: flex-start;
  }

  .tool-count {
    min-width: 70px;
    padding: 9px;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .module-card {
    padding: 22px;
  }

  .module-description {
    min-height: 0;
  }

  .dashboard-footer {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .module-card,
  .arrow-circle {
    transition: none;
  }
}
</style>
