
<template>
  <div class="teacher-page">
    <div class="teacher-container">

      <!-- Header -->
      <header class="teacher-header">
        <button class="back-button" type="button" @click="goBack">
          ← Back
        </button>

        <h1>Education Services</h1>
        <p>Manage and access your teaching resources.</p>
      </header>

      <!-- Welcome section -->
      <section class="welcome-section">
        <h2>Welcome, Teacher</h2>
        <p>
          Choose a resource below to get started.
        </p>
      </section>

      <!-- Resource cards -->
      <section class="resource-grid">
        <button
          v-for="resource in resources"
          :key="resource.id"
          class="resource-card"
          type="button"
          @click="openResource(resource)"
        >
          <span class="resource-icon">{{ resource.icon }}</span>

          <span class="resource-title">
            {{ resource.name }}
          </span>

          <span class="resource-description">
            {{ resource.description }}
          </span>

          <span class="resource-action">
            Open resource →
          </span>
        </button>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: "Teacher",

  data() {
    return {
      resources: [
        {
          id: 1,
          name: "Scheme of Work",
          icon: "📘",
          description: "Prepare and manage schemes of work.",
          path: "/scheme-of-work"
        },
        {
          id: 2,
          name: "Lesson Notes",
          icon: "📝",
          description: "Prepare and organize lesson notes.",
          path: "/lesson-notes"
        },
        {
          id: 3,
          name: "Question Banks",
          icon: "❓",
          description: "Organize questions for tests and examinations.",
          path: "/question-bank"
        },
        {
          id: 4,
          name: "Assignments",
          icon: "📚",
          description: "Prepare and manage class assignments.",
          path: null
        }
      ]
    };
  },

  methods: {
    goBack() {
      this.$router.push("/education");
    },

    openResource(resource) {
      if (!resource.path) {
        console.log(
          "This resource has not been connected yet:",
          resource.name
        );
        return;
      }

      this.$router.push({
        path: resource.path,
        query: {
          academicSession: "2026/2027"
        }
      });
    }
  }
};
</script>

<style>
.teacher-page {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding: 30px 20px 50px;
  background: #ffffe0;
  color: #111111;
  font-family: Arial, Helvetica, sans-serif;
}

.teacher-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.teacher-header {
  position: relative;
  text-align: center;
  padding: 10px 0 25px;
  border-bottom: 2px solid #d8d8b0;
}

.teacher-header h1 {
  margin: 15px 0 8px;
  color: #003366;
  font-size: 32px;
}

.teacher-header p {
  margin: 0;
  color: #444444;
  font-size: 16px;
}

.back-button {
  display: inline-block;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #003366;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
}

.back-button:hover {
  background: #00509e;
}

.welcome-section {
  margin: 30px 0;
  text-align: center;
}

.welcome-section h2 {
  margin: 0 0 10px;
  color: #003366;
  font-size: 25px;
}

.welcome-section p {
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.7;
  color: #333333;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  width: 100%;
}

.resource-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 220px;
  padding: 25px 20px;
  border: 1px solid #e2e2e2;
  border-radius: 12px;
  background: #ffffff;
  color: #111111;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.resource-card:hover {
  background: #f8f8f8;
  border-color: #dddddd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
}

.resource-card:focus-visible {
  outline: 3px solid #00509e;
  outline-offset: 3px;
}

.resource-icon {
  margin-bottom: 12px;
  font-size: 38px;
}

.resource-title {
  margin-bottom: 10px;
  color: #003366;
  font-size: 20px;
  font-weight: bold;
}

.resource-description {
  margin-bottom: 18px;
  color: #444444;
  font-size: 14px;
  line-height: 1.6;
}

.resource-action {
  margin-top: auto;
  color: #003366;
  font-size: 14px;
  font-weight: bold;
}

@media (max-width: 600px) {
  .teacher-page {
    padding: 20px 14px 35px;
  }

  .teacher-header h1 {
    font-size: 26px;
  }

  .resource-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .resource-card {
    min-height: 190px;
  }
}
</style>
