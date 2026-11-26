
<template>
  <main class="cbt-page">
    <header class="cbt-header">
      <div>
        <p class="eyebrow">ETREND EDUCATION SERVICES</p>
        <h1>Computer-Based Test</h1>
        <p class="subtitle">
          Practise at your own pace and track your progress.
        </p>
      </div>

      <button class="back-button" @click="goBack">
        Back to Education
      </button>
    </header>

    <div v-if="pageError" class="message error-message">
      {{ pageError }}
    </div>

    <!-- EXAM SETUP -->
    <section v-if="!exam && !result" class="panel setup-panel">
      <h2>Set up your practice exam</h2>
      <p class="muted">
        Choose your class, subject, topic and preferred exam settings.
      </p>

      <form @submit.prevent="startExam">
        <div class="form-grid">
          <label>
            Class
            <select
              v-model="className"
              required
              :disabled="loadingClasses"
              @change="onClassChange"
            >
              <option value="" disabled>Select class</option>
              <option
                v-for="item in classes"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </label>

          <label>
            Subject
            <select
              v-model="subject"
              required
              :disabled="!className || loadingSubjects"
              @change="onSubjectChange"
            >
              <option value="" disabled>Select subject</option>
              <option
                v-for="item in subjects"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </label>

          <label>
            Topic
            <select
              v-model="topic"
              required
              :disabled="!subject || loadingTopics"
            >
              <option value="" disabled>Select topic</option>
              <option value="ALL_TOPICS">All Topics</option>
              <option
                v-for="item in topics"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </label>

          <label>
            Number of questions
            <select v-model.number="questionCount" required>
              <option :value="10">10 questions</option>
              <option :value="20">20 questions</option>
              <option :value="40">40 questions</option>
              <option :value="60">60 questions</option>
            </select>
          </label>

          <label>
            Duration
            <select v-model.number="durationMinutes" required>
              <option :value="15">15 minutes</option>
              <option :value="30">30 minutes</option>
              <option :value="45">45 minutes</option>
              <option :value="60">60 minutes</option>
              <option :value="90">90 minutes</option>
              <option :value="120">120 minutes</option>
            </select>
          </label>
        </div>

        <p v-if="loadingClasses" class="muted">
          Loading classes from the question bank...
        </p>
        <p v-if="loadingSubjects" class="muted">
          Loading subjects...
        </p>
        <p v-if="loadingTopics" class="muted">
          Loading topics...
        </p>

        <button
          class="primary-button"
          type="submit"
          :disabled="
            starting ||
            !className ||
            !subject ||
            !topic ||
            loadingClasses ||
            loadingSubjects ||
            loadingTopics
          "
        >
          {{ starting ? "Preparing questions..." : "Start Exam" }}
        </button>
      </form>
    </section>

    <!-- ACTIVE EXAM -->
    <section v-else-if="exam && !result" class="exam-layout">
      <div class="panel exam-panel">
        <div class="exam-summary">
          <div>
            <span class="summary-label">Class</span>
            <strong>{{ exam.className }}</strong>
          </div>
          <div>
            <span class="summary-label">Subject</span>
            <strong>{{ exam.subject }}</strong>
          </div>
          <div>
            <span class="summary-label">Topic</span>
            <strong>
              {{ exam.topic === "ALL_TOPICS" ? "All Topics" : exam.topic }}
            </strong>
          </div>
        </div>

        <div class="progress-row">
          <span>
            Question {{ currentIndex + 1 }} of {{ exam.questions.length }}
          </span>
          <span>{{ answeredCount }} answered</span>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>

        <article v-if="currentQuestion" class="question-area">
          <h2>
            {{ currentIndex + 1 }}.
            {{ currentQuestion.text }}
          </h2>

          <img
            v-if="currentQuestion.imageUrl"
            class="question-image"
            :src="currentQuestion.imageUrl"
            alt="Question illustration"
            @error="hideBrokenImage"
          />

          <div class="options-list">
            <label
              v-for="option in currentQuestion.options"
              :key="option.value"
              class="option-item"
              :class="{
                selected:
                  answers[String(currentQuestion.id)] === option.value
              }"
            >
              <input
                type="radio"
                :name="'question-' + currentQuestion.id"
                :value="option.value"
                :checked="
                  answers[String(currentQuestion.id)] === option.value
                "
                @change="chooseAnswer(currentQuestion.id, option.value)"
              />

              <span class="option-letter">{{ option.label }}</span>
              <span>{{ option.text }}</span>
            </label>
          </div>
        </article>

        <div class="navigation-row">
          <button
            class="secondary-button"
            :disabled="currentIndex === 0"
            @click="currentIndex--"
          >
            Previous
          </button>

          <button
            v-if="currentIndex < exam.questions.length - 1"
            class="primary-button"
            @click="currentIndex++"
          >
            Next Question
          </button>

          <button
            v-else
            class="primary-button"
            :disabled="submitting"
            @click="confirmSubmit"
          >
            {{ submitting ? "Submitting..." : "Submit Exam" }}
          </button>
        </div>
      </div>

      <aside class="panel question-navigation">
        <div class="timer-box" :class="{ urgent: secondsRemaining <= 60 }">
          <span>Time remaining</span>
          <strong>{{ formattedTime }}</strong>
        </div>

        <h3>Question numbers</h3>
        <p class="muted small">
          Gold means answered; outlined means unanswered.
        </p>

        <div class="question-grid">
          <button
            v-for="(question, index) in exam.questions"
            :key="question.id"
            class="question-number"
            :class="{
              active: currentIndex === index,
              answered: answers[String(question.id)] !== undefined &&
                answers[String(question.id)] !== null
            }"
            @click="currentIndex = index"
          >
            {{ index + 1 }}
          </button>
        </div>

        <div class="legend">
          <span><i class="legend-dot answered-dot"></i> Answered</span>
          <span><i class="legend-dot unanswered-dot"></i> Unanswered</span>
        </div>

        <p class="unanswered-text">
          Unanswered: {{ unansweredNumbers.length
            ? unansweredNumbers.join(", ")
            : "None" }}
        </p>

        <button
          class="submit-wide"
          :disabled="submitting"
          @click="confirmSubmit"
        >
          Submit Exam
        </button>
      </aside>
    </section>

    <!-- RESULTS -->
    <section v-else-if="result" class="panel results-panel">
      <div class="result-heading">
        <p class="eyebrow">EXAM COMPLETED</p>
        <h2>Your Results</h2>
        <p class="muted">
          {{ result.subject || exam?.subject }}
        </p>
      </div>

      <div class="score-card">
        <div class="score-circle">
          <strong>{{ result.percentage }}%</strong>
          <span>Score</span>
        </div>

        <div class="score-details">
          <p>
            <strong>{{ result.score }}</strong> correct out of
            <strong>{{ result.total }}</strong> questions
          </p>
          <p>
            <strong>{{ result.total - result.score }}</strong> incorrect
          </p>
          <p>
            <strong>{{ result.answered }}</strong> answered
          </p>
        </div>
      </div>

      <h3>Review your answers</h3>

      <article
        v-for="(item, index) in result.results"
        :key="item.questionId"
        class="review-item"
        :class="{ correct: item.isCorrect, incorrect: !item.isCorrect }"
      >
        <h4>
          {{ index + 1 }}. {{ item.question }}
        </h4>

        <img
          v-if="item.imageUrl"
          class="question-image review-image"
          :src="item.imageUrl"
          alt="Question illustration"
          @error="hideBrokenImage"
        />

        <p>
          Your answer:
          <strong>{{ item.selectedAnswer || "Not answered" }}</strong>
        </p>
        <p>
          Correct answer:
          <strong>{{ item.correctAnswer || "Not available" }}</strong>
        </p>
        <span class="review-status">
          {{ item.isCorrect ? "Correct" : "Incorrect" }}
        </span>
      </article>

      <button class="primary-button new-exam-button" @click="newExam">
        Take Another Exam
      </button>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";

const router = useRouter();
const store = useStore();

const API_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL || ""
).replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/cbt`,
  timeout: 30000
});

const classes = ref([]);
const subjects = ref([]);
const topics = ref([]);

const className = ref("");
const subject = ref("");
const topic = ref("");
const questionCount = ref(10);
const durationMinutes = ref(15);

const loadingClasses = ref(false);
const loadingSubjects = ref(false);
const loadingTopics = ref(false);
const starting = ref(false);
const submitting = ref(false);
const pageError = ref("");
const currentIndex = ref(0);
const secondsRemaining = ref(0);

let timerId = null;

const exam = computed(() => store.state.cbtExam);
const answers = computed(() => store.state.cbtAnswers);
const result = computed(() => store.state.cbtResult);

const currentQuestion = computed(
  () => exam.value?.questions?.[currentIndex.value] || null
);

const answeredCount = computed(() => {
  if (!exam.value) return 0;

  return exam.value.questions.filter(question => {
    const value = answers.value[String(question.id)];
    return value !== undefined && value !== null;
  }).length;
});

const unansweredNumbers = computed(() => {
  if (!exam.value) return [];

  return exam.value.questions
    .map((question, index) => {
      const value = answers.value[String(question.id)];

      return value === undefined || value === null
        ? index + 1
        : null;
    })
    .filter(number => number !== null);
});

const progressPercentage = computed(() => {
  if (!exam.value?.questions?.length) return 0;

  return Math.round(
    (answeredCount.value / exam.value.questions.length) * 100
  );
});

const formattedTime = computed(() => {
  const minutes = Math.floor(secondsRemaining.value / 60);
  const seconds = secondsRemaining.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

async function loadClasses() {
  loadingClasses.value = true;
  pageError.value = "";

  try {
    const response = await api.get("/classes");
    classes.value = response.data.data || [];
  } catch (error) {
    pageError.value = errorMessage(
      error,
      "Could not load classes. Please try again."
    );
  } finally {
    loadingClasses.value = false;
  }
}

async function onClassChange() {
  subject.value = "";
  topic.value = "";
  subjects.value = [];
  topics.value = [];
  pageError.value = "";

  if (!className.value) return;

  loadingSubjects.value = true;

  try {
    const response = await api.get("/subjects", {
      params: { className: className.value }
    });

    subjects.value = response.data.data || [];
  } catch (error) {
    pageError.value = errorMessage(error, "Could not load subjects.");
  } finally {
    loadingSubjects.value = false;
  }
}

async function onSubjectChange() {
  topic.value = "";
  topics.value = [];
  pageError.value = "";

  if (!className.value || !subject.value) return;

  loadingTopics.value = true;

  try {
    const response = await api.get("/topics", {
      params: {
        className: className.value,
        subject: subject.value
      }
    });

    topics.value = response.data.data || [];
  } catch (error) {
    pageError.value = errorMessage(error, "Could not load topics.");
  } finally {
    loadingTopics.value = false;
  }
}

async function startExam() {
  pageError.value = "";
  starting.value = true;

  try {
    const response = await api.post("/start", {
      className: className.value,
      subject: subject.value,
      topic: topic.value,
      count: questionCount.value,
      durationMinutes: durationMinutes.value
    });

    store.commit("SET_CBT_EXAM", response.data.data);
    currentIndex.value = 0;
    secondsRemaining.value = durationMinutes.value * 60;

    startTimer();
  } catch (error) {
    pageError.value = errorMessage(
      error,
      "Could not start the exam. Please try again."
    );
  } finally {
    starting.value = false;
  }
}

function chooseAnswer(questionId, selectedOption) {
  store.commit("SET_CBT_ANSWER", {
    questionId,
    selectedOption
  });
}

function startTimer() {
  stopTimer();

  timerId = setInterval(() => {
    if (secondsRemaining.value > 0) {
      secondsRemaining.value--;
    } else {
      stopTimer();
      submitExam(true);
    }
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

async function confirmSubmit() {
  if (submitting.value || result.value) return;

  const unanswered = unansweredNumbers.value.length;

  const message = unanswered
    ? `You have ${unanswered} unanswered question(s). Submit anyway?`
    : "Are you sure you want to submit your exam?";

  if (window.confirm(message)) {
    await submitExam(false);
  }
}

async function submitExam(timeExpired = false) {
  if (!exam.value || submitting.value || result.value) return;

  stopTimer();
  submitting.value = true;
  pageError.value = "";

  try {
    const submittedAnswers = exam.value.questions.map(question => ({
      questionId: question.id,
      selectedOption:
        answers.value[String(question.id)] === undefined
          ? null
          : answers.value[String(question.id)]
    }));

    const response = await api.post("/submit", {
      answers: submittedAnswers
    });

    store.commit("SET_CBT_RESULT", {
      ...response.data.data,
      subject: exam.value.subject,
      className: exam.value.className,
      timeExpired
    });
  } catch (error) {
    pageError.value = errorMessage(
      error,
      "Could not submit your exam. Please try again."
    );

    if (!timeExpired) startTimer();
  } finally {
    submitting.value = false;
  }
}

function newExam() {
  stopTimer();
  store.commit("CLEAR_CBT_EXAM");

  className.value = "";
  subject.value = "";
  topic.value = "";
  subjects.value = [];
  topics.value = [];
  questionCount.value = 10;
  durationMinutes.value = 15;
  currentIndex.value = 0;
  secondsRemaining.value = 0;
  pageError.value = "";

  loadClasses();
}

function goBack() {
  stopTimer();
  router.push("/education");
}

function hideBrokenImage(event) {
  event.target.style.display = "none";
}

onMounted(() => {
  loadClasses();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.cbt-page {
  min-height: 100vh;
  padding: 28px;
  background: #fff9db;
  color: #003366;
}

.cbt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto 26px;
  max-width: 1200px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #7b6312;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

h1 {
  margin: 0;
  font-size: clamp(27px, 4vw, 38px);
}

.subtitle,
.muted {
  color: #5f6f80;
}

.subtitle {
  margin-bottom: 0;
}

.panel {
  background: #fff;
  border: 1px solid #f0df9a;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 7px 24px rgba(0, 51, 102, 0.07);
}

.setup-panel,
.results-panel {
  max-width: 900px;
  margin: 0 auto;
}

.setup-panel h2,
.results-panel h2 {
  margin-top: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 25px 0;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
}

select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #d8dce1;
  border-radius: 9px;
  padding: 10px 12px;
  background: white;
  color: #003366;
  font: inherit;
}

select:focus {
  outline: 2px solid #003366;
  outline-offset: 2px;
}

.primary-button,
.secondary-button,
.back-button,
.submit-wide {
  min-height: 43px;
  border: 0;
  border-radius: 9px;
  padding: 11px 17px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-button,
.submit-wide {
  background: #003366;
  color: white;
}

.secondary-button,
.back-button {
  background: #ffed9e;
  color: #003366;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.message {
  max-width: 1200px;
  margin: 0 auto 18px;
  padding: 13px 16px;
  border-radius: 9px;
}

.error-message {
  background: #fff0f0;
  color: #9a1d1d;
  border: 1px solid #e7b4b4;
}

.exam-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

.exam-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee4bc;
}

.exam-summary div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-wrap: anywhere;
}

.summary-label {
  color: #687788;
  font-size: 12px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 20px 0 9px;
  font-size: 14px;
  font-weight: 700;
}

.progress-track {
  height: 7px;
  border-radius: 20px;
  overflow: hidden;
  background: #f0eddf;
}

.progress-fill {
  height: 100%;
  background: #d6ad24;
  transition: width 0.2s ease;
}

.question-area {
  padding: 22px 0;
}

.question-area h2 {
  margin-top: 0;
  font-size: 21px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.question-image {
  display: block;
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
  margin: 18px auto 24px;
  border-radius: 8px;
}

.options-list {
  display: grid;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid #dce2e8;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  line-height: 1.5;
}

.option-item.selected {
  border-color: #003366;
  background: #fff9db;
}

.option-item input {
  margin-top: 5px;
  accent-color: #003366;
}

.option-letter {
  min-width: 25px;
  font-weight: 800;
}

.navigation-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #eee4bc;
  padding-top: 20px;
}

.question-navigation {
  position: sticky;
  top: 15px;
}

.timer-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  background: #fff9db;
  padding: 17px;
  margin-bottom: 22px;
}

.timer-box strong {
  font-size: 30px;
  font-variant-numeric: tabular-nums;
}

.timer-box.urgent {
  background: #fff0f0;
  color: #a11c1c;
}

.question-navigation h3 {
  margin-bottom: 8px;
}

.small {
  font-size: 12px;
  line-height: 1.5;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 18px 0;
}

.question-number {
  min-height: 39px;
  border: 1px solid #cbd4de;
  border-radius: 7px;
  background: white;
  color: #003366;
  font-weight: 700;
  cursor: pointer;
}

.question-number.answered {
  background: #ffed9e;
  border-color: #d6ad24;
}

.question-number.active {
  outline: 2px solid #003366;
  outline-offset: 1px;
}

.legend {
  display: grid;
  gap: 8px;
  font-size: 12px;
  color: #596a7c;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  display: inline-block;
}

.answered-dot {
  background: #ffed9e;
  border: 1px solid #d6ad24;
}

.unanswered-dot {
  background: white;
  border: 1px solid #aab5c1;
}

.unanswered-text {
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.submit-wide {
  width: 100%;
  margin-top: 10px;
}

.result-heading {
  text-align: center;
}

.score-card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
  padding: 24px;
  margin: 20px 0 32px;
  border-radius: 14px;
  background: #fff9db;
}

.score-circle {
  width: 135px;
  height: 135px;
  border-radius: 50%;
  border: 7px solid #ffed9e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
}

.score-circle strong {
  font-size: 30px;
}

.score-circle span {
  font-size: 12px;
}

.review-item {
  padding: 18px;
  margin: 14px 0;
  border: 1px solid #dce2e8;
  border-left: 5px solid #aab5c1;
  border-radius: 10px;
  overflow-wrap: anywhere;
}

.review-item.correct {
  border-left-color: #2f855a;
}

.review-item.incorrect {
  border-left-color: #b83232;
}

.review-item h4 {
  margin-top: 0;
  line-height: 1.5;
}

.review-status {
  display: inline-block;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 800;
}

.review-image {
  margin-left: 0;
}

.new-exam-button {
  margin-top: 18px;
}

@media (max-width: 800px) {
  .cbt-page {
    padding: 16px;
  }

  .cbt-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .exam-layout {
    grid-template-columns: 1fr;
  }

  .question-navigation {
    position: static;
  }
}

@media (max-width: 520px) {
  .form-grid,
  .exam-summary {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 17px;
  }

  .question-area h2 {
    font-size: 18px;
  }

  .navigation-row {
    flex-wrap: wrap;
  }

  .navigation-row button {
    flex: 1;
  }
}
</style>
