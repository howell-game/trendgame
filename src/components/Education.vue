<template>
  <div class="education-page">
    <header class="education-header">
      <div class="header-left">
        <div class="education-logo">E</div>
        <div>
          <h1>ETrend Education</h1>
          <p>Learn better. Teach better. Achieve more.</p>
        </div>
      </div>

      <button class="back-button" @click="$emit('close')">
        ← Back
      </button>
    </header>

    <main class="education-container">
      <section class="welcome-section">
        <div>
          <span class="section-label">YOUR LEARNING HUB</span>
          <h2>Welcome to Education Services</h2>
          <p>
            Teaching resources, examination practice, and learning tools
            for teachers, schools, and students.
          </p>
        </div>

        <div class="welcome-icon">📚</div>
      </section>

      <section class="role-section">
        <h2>How would you like to use ETrend Education?</h2>
        <p class="section-description">
          Select your role to access the appropriate educational services.
        </p>

        <div class="role-grid">
          <button
            class="role-card"
            :class="{ active: selectedRole === 'teacher' }"
            @click="$router.push('/teacher')"
          >
            <span class="role-icon">👨‍🏫</span>
            <h3>Teacher</h3>
            <p>
              Access schemes of work, lesson notes, question banks,
              and classroom resources.
            </p>
            <span class="role-link">Continue →</span>
          </button>

          <button
            class="role-card"
            :class="{ active: selectedRole === 'proprietor' }"
            @click="selectRole('proprietor')"
          >
            <span class="role-icon">🏫</span>
            <h3>School Proprietor</h3>
            <p>
              Explore school resources, academic planning,
              and teaching support materials.
            </p>
            <span class="role-link">Continue →</span>
          </button>

          <button
            class="role-card"
            :class="{ active: selectedRole === 'jamb' }"
            @click="selectRole('jamb')"
          >
            <span class="role-icon">🎓</span>
            <h3>JAMB Candidate</h3>
            <p>
              Practise subjects, take timed mock examinations,
              and monitor your performance.
            </p>
            <span class="role-link">Continue →</span>
          </button>

          <button
            class="role-card"
            :class="{ active: selectedRole === 'student' }"
            @click="selectRole('student')"
          >
            <span class="role-icon">📖</span>
            <h3>Secondary School Student</h3>
            <p>
              Prepare for WAEC and other examinations with
              practice questions and study materials.
            </p>
            <span class="role-link">Continue →</span>
          </button>
        </div>
      </section>

      <section v-if="selectedRole" class="dashboard-section">
        <div class="dashboard-heading">
          <div>
            <span class="section-label">YOUR DASHBOARD</span>
            <h2>{{ dashboardTitle }}</h2>
          </div>

          <button class="change-role-button" @click="selectedRole = ''">
            Change role
          </button>
        </div>

        <div
          v-if="selectedRole === 'teacher' || selectedRole === 'proprietor'"
          class="membership-banner"
        >
          <div>
            <span class="membership-label">ANNUAL MEMBERSHIP</span>
            <h3>Unlock Teaching Resources</h3>
            <p>
              Access educational materials and updates with an annual
              membership of ₦1,000.
            </p>
          </div>

          <div class="membership-price">
            <strong>₦1,000</strong>
            <span>per year</span>
            <button @click="$emit('subscribe')">
              View Membership
            </button>
          </div>
        </div>

        <div class="service-grid">
          <button
            v-for="service in dashboardServices"
            :key="service.title"
            class="service-card"
            @click="openEducationService(service.action)"
          >
            <span class="service-icon">{{ service.icon }}</span>
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
            <span class="card-arrow">Explore →</span>
          </button>
        </div>

        <div v-if="selectedRole === 'teacher' || selectedRole === 'proprietor'"
          class="resource-section"
        >
          <div class="resource-heading">
            <div>
              <h2>Educational Resource Library</h2>
              <p>Find resources by class, subject, and school term.</p>
            </div>
          </div>

          <div class="resource-filters">
            <label>
              Class
              <select v-model="filters.class">
                <option value="">All Classes</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SS 1">SS 1</option>
                <option value="SS 2">SS 2</option>
                <option value="SS 3">SS 3</option>
              </select>
            </label>

            <label>
              Subject
              <select v-model="filters.subject">
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Agricultural Science">Agricultural Science</option>
              </select>
            </label>

            <label>
              Term
              <select v-model="filters.term">
                <option value="">All Terms</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </label>
          </div>

          <div class="resource-grid">
            <article
              v-for="resource in filteredResources"
              :key="resource.id"
              class="resource-card"
            >
              <div class="resource-type-icon">
                {{ resource.icon }}
              </div>

              <div class="resource-details">
                <span class="resource-tag">{{ resource.type }}</span>
                <h3>{{ resource.title }}</h3>
                <p>
                  {{ resource.class }} · {{ resource.subject }}
                </p>
                <span class="resource-term">{{ resource.term }}</span>
              </div>

              <button
                class="resource-button"
                @click="viewResource(resource)"
              >
                View Resource
              </button>
            </article>

            <div v-if="filteredResources.length === 0" class="empty-state">
              <span>📂</span>
              <h3>No resources found</h3>
              <p>Try changing your class, subject, or term filters.</p>
            </div>
          </div>
        </div>

        <div v-if="selectedRole === 'jamb' || selectedRole === 'student'"
          class="practice-section"
        >
          <div class="practice-heading">
            <div>
              <span class="section-label">EXAM PREPARATION</span>
              <h2>Practise and Improve</h2>
              <p>Choose a subject and test your knowledge.</p>
            </div>
            <span class="practice-icon">✍️</span>
          </div>

          <div class="practice-filters">
            <label>
              Examination
              <select v-model="practice.exam">
                <option value="JAMB">JAMB</option>
                <option value="WAEC">WAEC</option>
              </select>
            </label>

            <label>
              Subject
              <select v-model="practice.subject">
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Agricultural Science">Agricultural Science</option>
              </select>
            </label>

            <label>
              Number of Questions
              <select v-model.number="practice.questionCount">
                <option :value="10">10 Questions</option>
                <option :value="20">20 Questions</option>
                <option :value="40">40 Questions</option>
                <option :value="60">60 Questions</option>
              </select>
            </label>

            <label>
              Duration
              <select v-model.number="practice.duration">
                <option :value="15">15 Minutes</option>
                <option :value="30">30 Minutes</option>
                <option :value="60">60 Minutes</option>
                <option :value="120">120 Minutes</option>
              </select>
            </label>
          </div>

          <button
            class="start-practice-button"
            @click="startPractice"
          >
            Start Practice Examination →
          </button>

          <div class="practice-features">
            <div>
              <span>⏱️</span>
              <strong>Timed Tests</strong>
              <p>Practise within a set duration.</p>
            </div>

            <div>
              <span>✅</span>
              <strong>Automatic Marking</strong>
              <p>Review your score after submission.</p>
            </div>

            <div>
              <span>📊</span>
              <strong>Performance Tracking</strong>
              <p>Identify areas that need improvement.</p>
            </div>
          </div>
        </div>

        <div v-if="selectedRole === 'teacher' || selectedRole === 'proprietor'"
          class="paper-generator"
        >
          <div>
            <span class="section-label">TEACHING TOOL</span>
            <h2>Question Paper Generator</h2>
            <p>
              Prepare question papers for tests, assignments,
              and examinations.
            </p>
          </div>

          <div class="generator-fields">
            <label>
              Class
              <select v-model="paperSettings.class">
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SS 1">SS 1</option>
                <option value="SS 2">SS 2</option>
                <option value="SS 3">SS 3</option>
              </select>
            </label>

            <label>
              Subject
              <select v-model="paperSettings.subject">
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Agricultural Science">Agricultural Science</option>
              </select>
            </label>

            <label>
              Assessment Type
              <select v-model="paperSettings.type">
                <option value="Classwork">Classwork</option>
                <option value="Homework">Homework</option>
                <option value="Test">Test</option>
                <option value="Examination">Examination</option>
              </select>
            </label>

            <label>
              Number of Questions
              <select v-model.number="paperSettings.count">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="30">30</option>
                <option :value="40">40</option>
              </select>
            </label>
          </div>

          <button
            class="generate-button"
            @click="generateQuestionPaper"
          >
            Generate Question Paper
          </button>
        </div>
      </section>

      <section class="benefits-section">
        <h2>Everything You Need to Learn and Teach</h2>

        <div class="benefits-grid">
          <div class="benefit-item">
            <span>📘</span>
            <h3>Study Materials</h3>
            <p>Organised educational resources for effective learning.</p>
          </div>

          <div class="benefit-item">
            <span>📝</span>
            <h3>Practice Questions</h3>
            <p>Test knowledge with structured questions and assessments.</p>
          </div>

          <div class="benefit-item">
            <span>📅</span>
            <h3>Academic Planning</h3>
            <p>Keep track of lessons, study sessions, and academic goals.</p>
          </div>

          <div class="benefit-item">
            <span>📈</span>
            <h3>Progress Reports</h3>
            <p>Monitor performance and identify areas for improvement.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="education-footer">
      <p>© ETrend Education. Learn, teach, and grow.</p>
    </footer>
  </div>
</template>

<style scoped>
.education-page {
  min-height: 100vh;
  background: #ffffe0;
  color: #111111;
  font-family: Arial, Helvetica, sans-serif;
}

.education-header {
  min-height: 84px;
  padding: 16px 5%;
  background: #003366;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.education-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ffffe0;
  color: #003366;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 29px;
  font-weight: 800;
}

.education-header h1 {
  margin: 0 0 5px;
  font-size: 23px;
  font-weight: 800;
}

.education-header p {
  margin: 0;
  color: #e1eaff;
  font-size: 13px;
}

.back-button {
  padding: 10px 17px;
  border: 1px solid #ffffff80;
  border-radius: 7px;
  background: transparent;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.back-button:hover {
  background: #ffffff18;
}

.education-container {
  width: min(1200px, 92%);
  margin: 0 auto;
  padding: 28px 0 40px;
}

.welcome-section {
  min-height: 185px;
  padding: 30px;
  border-radius: 14px;
  background: #003366;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}

.section-label {
  display: inline-block;
  margin-bottom: 9px;
  color: #a8d4ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.welcome-section h2 {
  margin: 0 0 12px;
  font-size: clamp(23px, 3vw, 34px);
  line-height: 1.25;
}

.welcome-section p {
  max-width: 650px;
  margin: 0;
  color: #edf4ff;
  font-size: 14px;
  line-height: 1.7;
}

.welcome-icon {
  font-size: 76px;
  flex-shrink: 0;
}

.role-section,
.dashboard-section,
.benefits-section {
  margin-top: 34px;
}

.role-section > h2,
.dashboard-heading h2,
.resource-heading h2,
.practice-heading h2,
.paper-generator h2,
.benefits-section > h2 {
  margin: 0;
  color: #003366;
  font-size: 22px;
  font-weight: 800;
}

.section-description {
  margin: 9px 0 20px;
  color: #444444;
  font-size: 14px;
  line-height: 1.6;
}

.role-grid,
.service-grid,
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.role-card,
.service-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #d9d9bd;
  border-radius: 11px;
  background: #ffffff;
  color: #111111;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.role-card:hover,
.service-card:hover {
  border-color: #003366;
  transform: translateY(-3px);
  box-shadow: 0 7px 18px #00336612;
}

.role-card.active {
  border: 2px solid #003366;
  background: #f0f6ff;
}

.role-icon,
.service-icon {
  display: inline-flex;
  margin-bottom: 13px;
  font-size: 31px;
}

.role-card h3,
.service-card h3 {
  margin: 0 0 9px;
  color: #003366;
  font-size: 16px;
  line-height: 1.4;
}

.role-card p,
.service-card p {
  margin: 0;
  color: #454545;
  font-size: 13px;
  line-height: 1.7;
}

.role-link,
.card-arrow {
  display: inline-block;
  margin-top: 15px;
  color: #003366;
  font-size: 13px;
  font-weight: 800;
}

.dashboard-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.dashboard-heading .section-label,
.paper-generator .section-label,
.practice-heading .section-label {
  color: #476d99;
}

.change-role-button {
  padding: 9px 13px;
  border: 1px solid #003366;
  border-radius: 7px;
  background: transparent;
  color: #003366;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.membership-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 23px;
  padding: 23px;
  border-radius: 12px;
  background: #003366;
  color: #ffffff;
}

.membership-label {
  color: #c9e1ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.membership-banner h3 {
  margin: 9px 0;
  font-size: 20px;
}

.membership-banner p {
  max-width: 600px;
  margin: 0;
  color: #e8f1ff;
  font-size: 13px;
  line-height: 1.7;
}

.membership-price {
  min-width: 150px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.membership-price strong {
  font-size: 27px;
}

.membership-price > span {
  color: #e8f1ff;
  font-size: 12px;
}

.membership-price button,
.start-practice-button,
.generate-button {
  margin-top: 10px;
  padding: 11px 15px;
  border: none;
  border-radius: 7px;
  background: #ffffe0;
  color: #003366;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.service-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.service-card {
  padding: 19px;
}

.service-icon {
  font-size: 28px;
}

.resource-section,
.practice-section,
.paper-generator {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid #e1e1c5;
  border-radius: 12px;
  background: #fffef2;
}

.resource-heading,
.practice-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.resource-heading p,
.practice-heading p,
.paper-generator > div:first-child p {
  margin: 8px 0 0;
  color: #505050;
  font-size: 13px;
  line-height: 1.7;
}

.resource-filters,
.practice-filters,
.generator-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.resource-filters label,
.practice-filters label,
.generator-fields label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #222222;
  font-size: 12px;
  font-weight: 700;
}

.resource-filters select,
.practice-filters select,
.generator-fields select {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px;
  border: 1px solid #c8c8b7;
  border-radius: 7px;
  background: #ffffff;
  color: #111111;
  font-size: 13px;
  outline-color: #003366;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 16px;
  border: 1px solid #e0e0d2;
  border-radius: 9px;
  background: #ffffff;
}

.resource-type-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 8px;
  background: #edf3fb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
}

.resource-details {
  min-width: 0;
  flex: 1;
}

.resource-tag {
  color: #42658d;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.resource-details h3 {
  margin: 6px 0;
  color: #003366;
  font-size: 14px;
  line-height: 1.5;
}

.resource-details p,
.resource-term {
  display: block;
  margin: 0 0 5px;
  color: #555555;
  font-size: 11px;
  line-height: 1.5;
}

.resource-button {
  align-self: center;
  flex-shrink: 0;
  padding: 8px 10px;
  border: 1px solid #003366;
  border-radius: 6px;
  background: #ffffff;
  color: #003366;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 30px 15px;
  text-align: center;
}

.empty-state > span {
  font-size: 35px;
}

.empty-state h3 {
  margin: 10px 0 5px;
  color: #003366;
}

.empty-state p {
  color: #555555;
  font-size: 13px;
}

.practice-icon {
  font-size: 44px;
}

.practice-filters {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.start-practice-button,
.generate-button {
  margin-top: 0;
  background: #003366;
  color: #ffffff;
}

.practice-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-top: 27px;
  padding-top: 22px;
  border-top: 1px solid #e4e4d0;
}

.practice-features > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.practice-features span {
  font-size: 24px;
}

.practice-features strong {
  color: #003366;
  font-size: 13px;
}

.practice-features p {
  margin: 0;
  color: #555555;
  font-size: 12px;
  line-height: 1.6;
}

.paper-generator > div:first-child {
  margin-bottom: 20px;
}

.generator-fields {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.benefits-section > h2 {
  margin-bottom: 20px;
}

.benefits-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.benefit-item {
  padding: 19px;
  border: 1px solid #e0e0c8;
  border-radius: 10px;
  background: #ffffff;
}

.benefit-item > span {
  font-size: 28px;
}

.benefit-item h3 {
  margin: 12px 0 8px;
  color: #003366;
  font-size: 15px;
}

.benefit-item p {
  margin: 0;
  color: #505050;
  font-size: 12px;
  line-height: 1.7;
}

.education-footer {
  padding: 22px 5%;
  background: #003366;
  color: #ffffff;
  text-align: center;
}

.education-footer p {
  margin: 0;
  font-size: 12px;
}

@media (max-width: 950px) {
  .role-grid,
  .benefits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .practice-filters,
  .generator-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .education-header {
    padding: 14px 4%;
  }

  .education-logo {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .education-header h1 {
    font-size: 17px;
  }

  .education-header p {
    max-width: 210px;
    font-size: 11px;
    line-height: 1.5;
  }

  .back-button {
    padding: 9px 10px;
    font-size: 11px;
  }

  .education-container {
    width: 92%;
    padding-top: 18px;
  }

  .welcome-section {
    min-height: 0;
    padding: 23px 18px;
  }

  .welcome-section h2 {
    font-size: 23px;
  }

  .welcome-section p {
    font-size: 12px;
  }

  .welcome-icon {
    font-size: 43px;
  }

  .role-section > h2,
  .dashboard-heading h2,
  .resource-heading h2,
  .practice-heading h2,
  .paper-generator h2,
  .benefits-section > h2 {
    font-size: 19px;
  }

  .role-grid,
  .service-grid,
  .benefits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .role-card,
  .service-card,
  .benefit-item {
    padding: 14px;
  }

  .role-card h3,
  .service-card h3 {
    font-size: 14px;
  }

  .role-card p,
  .service-card p {
    font-size: 12px;
  }

  .role-icon,
  .service-icon {
    font-size: 26px;
  }

  .membership-banner {
    align-items: flex-start;
    flex-direction: column;
    padding: 19px;
  }

  .membership-price {
    width: 100%;
  }

  .resource-section,
  .practice-section,
  .paper-generator {
    padding: 17px;
  }

  .resource-filters,
  .practice-filters,
  .generator-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .resource-card {
    flex-wrap: wrap;
  }

  .resource-button {
    margin-left: 56px;
  }

  .practice-features {
    grid-template-columns: 1fr;
    gap: 19px;
  }

  .dashboard-heading {
    align-items: flex-start;
  }

  .change-role-button {
    flex-shrink: 0;
  }
}

@media (max-width: 360px) {
  .welcome-icon {
    display: none;
  }

  .role-grid,
  .service-grid,
  .benefits-grid,
  .resource-filters,
  .practice-filters,
  .generator-fields {
    grid-template-columns: 1fr;
  }

  .education-header p {
    max-width: 165px;
  }
}
</style>