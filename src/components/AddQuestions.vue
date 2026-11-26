<template>
  <main class="add-questions-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ETREND EDUCATION SERVICES</p>
        <h1>Question Bank Upload</h1>
        <p class="subtitle">
          Paste spreadsheet questions, review every row, attach images,
          and save the batch.
        </p>
      </div>
      <div class="header-icon" aria-hidden="true">✎</div>
    </header>

    <!-- QUESTION DETAILS -->
    <section class="panel">
      <h2>1. Question Details</h2>

      <div class="form-grid">
        <label class="field">
          <span>Class *</span>
          <select v-model="metadata.className" required>
            <option value="">Select class</option>
            <option v-for="item in classes" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Subject *</span>
          <select v-model="metadata.subject" required>
            <option value="">Select subject</option>
            <option v-for="item in subjects" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Topic *</span>
          <input
            v-model="metadata.topic"
            maxlength="200"
            placeholder="e.g. Atoms, Moles and Formulae"
          />
        </label>

        <label class="field">
          <span>Question type *</span>
          <select v-model="metadata.questionType">
            <option value="objective">Objective</option>
            <option value="theory">Theory</option>
          </select>
        </label>
      </div>
    </section>

    <!-- SPREADSHEET PASTE -->
    <section class="panel">
      <div class="section-title-row">
        <h2>2. Paste from Excel or a spreadsheet</h2>
        <span class="format-badge">Text preserved</span>
      </div>

      <p v-if="metadata.questionType === 'objective'" class="help-text">
        Copy your spreadsheet rows and paste them below. Use columns A–F:
        Question, Option A, Option B, Option C, Option D, Correct Answer.
        The correct answer should be A, B, C, or D.
      </p>

      <p v-else class="help-text">
        For theory questions, use column A for the question and optionally
        column B for the model answer or marking guide.
      </p>

      <textarea
        v-model="pasteText"
        class="paste-area"
        rows="7"
        spellcheck="false"
        placeholder="Paste copied spreadsheet cells here..."
        aria-label="Paste spreadsheet questions"
      ></textarea>

      <div class="toolbar">
        <button
          type="button"
          class="secondary-button"
          @click="parseSpreadsheet"
        >
          Parse spreadsheet
        </button>

        <button
          type="button"
          class="text-button"
          @click="pasteText = ''"
        >
          Clear paste area
        </button>
      </div>

      <p class="help-text small-note">
        Question and option text is not mathematically reformatted.
        Symbols such as 2^2, 2², H₂O, and 10⁻³ are retained as supplied.
      </p>
    </section>

    <!-- QUESTION PREVIEW -->
    <section v-if="questions.length" class="panel">
      <div class="section-title-row">
        <h2>3. Review questions</h2>
        <span class="count-badge">
          {{ questions.length }}
          question{{ questions.length === 1 ? "" : "s" }}
        </span>
      </div>

      <p class="help-text">
        Check each question before saving. You can edit the text, change
        the options, choose the correct answer, or attach an image.
      </p>

      <article
        v-for="(question, index) in questions"
        :key="question.localId"
        class="question-card"
      >
        <div class="question-card-header">
          <h3>Question {{ index + 1 }}</h3>

          <button
            type="button"
            class="remove-button"
            @click="removeQuestion(index)"
            :disabled="saving"
          >
            Remove
          </button>
        </div>

        <label class="field">
          <span>Question text *</span>
          <textarea
            v-model="question.text"
            rows="3"
            spellcheck="false"
            required
          ></textarea>
        </label>

        <template v-if="metadata.questionType === 'objective'">
          <div class="options-grid">
            <label
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="field"
            >
              <span>Option {{ letters[optionIndex] }} *</span>
              <textarea
                v-model="question.options[optionIndex]"
                rows="2"
                spellcheck="false"
                required
              ></textarea>
            </label>
          </div>

          <label class="field answer-field">
            <span>Correct option *</span>
            <select v-model="question.answer" required>
              <option value="">Choose correct option</option>
              <option
                v-for="letter in letters"
                :key="letter"
                :value="letter"
              >
                Option {{ letter }}
              </option>
            </select>
          </label>
        </template>

        <label v-else class="field">
          <span>Model answer / marking guide (optional)</span>
          <textarea
            v-model="question.answer"
            rows="3"
            spellcheck="false"
          ></textarea>
        </label>

        <!-- INDIVIDUAL QUESTION IMAGE -->
        <div class="image-field">
          <div class="image-copy">
            <strong>Question image (optional)</strong>
            <p class="help-text">
              JPG, PNG, WEBP, or GIF. Maximum 5 MB per image.
            </p>
            <p v-if="question.imageFile" class="file-name">
              {{ question.imageFile.name }}
            </p>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            :aria-label="`Choose image for question ${index + 1}`"
            @change="selectImage($event, index)"
            :disabled="saving"
          />

          <div v-if="question.imagePreview" class="image-preview">
            <img
              :src="question.imagePreview"
              :alt="`Preview for question ${index + 1}`"
            />

            <button
              type="button"
              class="text-button"
              @click="removeImage(index)"
              :disabled="saving"
            >
              Remove image
            </button>
          </div>
        </div>
      </article>

      <div class="toolbar batch-toolbar">
        <button
          type="button"
          class="secondary-button"
          @click="addBlankQuestion"
          :disabled="saving"
        >
          Add blank question
        </button>

        <button
          type="button"
          class="text-button"
          @click="clearQuestions"
          :disabled="saving"
        >
          Remove all questions
        </button>
      </div>
    </section>

    <!-- STATUS MESSAGE -->
    <div
      v-if="message.text"
      class="message"
      :class="message.type"
      role="status"
      aria-live="polite"
    >
      {{ message.text }}
    </div>

    <!-- ACTIONS -->
    <div class="form-actions">
      <button
        type="button"
        class="reset-button"
        @click="resetAll"
        :disabled="saving"
      >
        Clear page
      </button>

      <button
        type="button"
        class="save-button"
        @click="saveBatch"
        :disabled="saving || !questions.length"
      >
        {{
          saving
            ? "Saving batch..."
            : `Save ${questions.length} question${
                questions.length === 1 ? "" : "s"
              }`
        }}
      </button>
    </div>

    <section class="format-note">
      <strong>Text-preservation note:</strong>
      This page sends the question and option strings without mathematical
      normalization. Examples include
      <span class="sample">2²</span>,
      <span class="sample">2³</span>,
      <span class="sample">H₂O</span>, and
      <span class="sample">10⁻³</span>.
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, watch, onBeforeUnmount } from "vue";

const API_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL || ""
).replace(/\/$/, "");

const BATCH_URL = `${API_BASE_URL}/api/v2/question-bank/batch`;

const classes = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3"
];

const subjects = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Geography",
  "Civic Education",
  "Computer Studies"
];

const letters = ["A", "B", "C", "D"];

const metadata = reactive({
  className: "",
  subject: "",
  topic: "",
  questionType: "objective"
});

const pasteText = ref("");
const questions = ref([]);
const saving = ref(false);
const message = reactive({
  text: "",
  type: ""
});

let nextLocalId = 1;

function newQuestion(values = {}) {
  return {
    localId: nextLocalId++,
    text: values.text ?? "",
    options: Array.isArray(values.options)
      ? [...values.options]
      : ["", "", "", ""],
    answer: values.answer ?? "",
    imageFile: null,
    imagePreview: ""
  };
}

function setMessage(text, type = "error") {
  message.text = text;
  message.type = type;
}

function parseSpreadsheet() {
  setMessage("", "");

  if (!pasteText.value.length) {
    setMessage("Paste spreadsheet rows first.");
    return;
  }

  /*
   * Excel normally copies cells as tab-separated values.
   * Split rows and columns without trimming question or option content.
   * Remove only the carriage return used in Windows line endings.
   */
  const lines = pasteText.value
    .split("\n")
    .map(line =>
      line.endsWith("\r") ? line.slice(0, -1) : line
    );

  const parsed = [];

  lines.forEach(line => {
    if (line === "") return;

    const cells = line.split("\t");

    if (cells.every(cell => cell.trim() === "")) return;

    if (metadata.questionType === "objective") {
      const text = cells[0] ?? "";

      if (text.trim() === "") return;

      const answer = (cells[5] ?? "").trim().toUpperCase();

      parsed.push(
        newQuestion({
          text,
          options: [
            cells[1] ?? "",
            cells[2] ?? "",
            cells[3] ?? "",
            cells[4] ?? ""
          ],
          answer: letters.includes(answer) ? answer : ""
        })
      );
    } else {
      const text = cells[0] ?? "";

      if (text.trim() === "") return;

      parsed.push(
        newQuestion({
          text,
          options: ["", "", "", ""],
          answer: cells[1] ?? ""
        })
      );
    }
  });

  if (!parsed.length) {
    setMessage(
      "No question rows were found. Check the spreadsheet format."
    );
    return;
  }

  questions.value = [...questions.value, ...parsed];

  setMessage(
    `${parsed.length} row${parsed.length === 1 ? "" : "s"} loaded for review.`,
    "success"
  );
}

/*
 * When the type changes, clear existing questions to prevent objective
 * answers/options from accidentally being saved as theory questions,
 * or vice versa.
 */
watch(
  () => metadata.questionType,
  () => {
    clearQuestions();
    setMessage("", "");
  }
);

function selectImage(event, index) {
  const file = event.target.files?.[0] || null;
  const question = questions.value[index];

  if (!question) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (file && !allowedTypes.includes(file.type)) {
    event.target.value = "";
    setMessage(
      `Question ${index + 1}: choose a JPG, PNG, WEBP, or GIF image.`
    );
    return;
  }

  if (file && file.size > 5 * 1024 * 1024) {
    event.target.value = "";
    setMessage(
      `Question ${index + 1}: the image must be 5 MB or smaller.`
    );
    return;
  }

  if (question.imagePreview) {
    URL.revokeObjectURL(question.imagePreview);
  }

  question.imageFile = file;
  question.imagePreview = file
    ? URL.createObjectURL(file)
    : "";

  setMessage("", "");
}

function removeImage(index) {
  const question = questions.value[index];

  if (!question) return;

  if (question.imagePreview) {
    URL.revokeObjectURL(question.imagePreview);
  }

  question.imageFile = null;
  question.imagePreview = "";
}

function removeQuestion(index) {
  removeImage(index);
  questions.value.splice(index, 1);
}

function addBlankQuestion() {
  questions.value.push(newQuestion());
}

function clearQuestions() {
  questions.value.forEach(question => {
    if (question.imagePreview) {
      URL.revokeObjectURL(question.imagePreview);
    }
  });

  questions.value = [];
  setMessage("", "");
}

function resetAll() {
  clearQuestions();

  metadata.className = "";
  metadata.subject = "";
  metadata.topic = "";
  metadata.questionType = "objective";

  pasteText.value = "";
  setMessage("", "");
}

async function saveBatch() {
  setMessage("", "");

  if (
    !metadata.className ||
    !metadata.subject ||
    !metadata.topic.trim()
  ) {
    setMessage(
      "Select a class and subject, and enter a topic before saving."
    );
    return;
  }

  if (!questions.value.length) {
    setMessage("Paste and parse at least one question first.");
    return;
  }

  for (let i = 0; i < questions.value.length; i++) {
    const question = questions.value[i];

    if (!question.text.trim()) {
      setMessage(`Question ${i + 1}: question text is required.`);
      return;
    }

    if (metadata.questionType === "objective") {
      if (
        question.options.some(option => !option.trim())
      ) {
        setMessage(
          `Question ${i + 1}: all four options are required.`
        );
        return;
      }

      if (!letters.includes(question.answer)) {
        setMessage(
          `Question ${i + 1}: select the correct answer.`
        );
        return;
      }
    }
  }

  const formData = new FormData();

  formData.append("className", metadata.className);
  formData.append("subject", metadata.subject);
  formData.append("topic", metadata.topic);
  formData.append("questionType", metadata.questionType);

  formData.append(
    "questions",
    JSON.stringify(
      questions.value.map(question => ({
        text: question.text,
        options:
          metadata.questionType === "objective"
            ? question.options
            : [],
        answer: question.answer
      }))
    )
  );

  questions.value.forEach((question, index) => {
    if (question.imageFile) {
      formData.append(
        `image_${index}`,
        question.imageFile,
        question.imageFile.name
      );
    }
  });

  saving.value = true;

  try {
    const response = await fetch(BATCH_URL, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const rawResponse = await response.text();

    let result = {};

    if (rawResponse) {
      try {
        result = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `The server returned an unreadable response (HTTP ${response.status}).`
        );
      }
    }

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message ||
          `Unable to save questions (HTTP ${response.status}).`
      );
    }

    const successMessage =
      result.message ||
      `${result.data?.length ?? questions.value.length} questions saved successfully.`;

    clearQuestions();
    pasteText.value = "";

    setMessage(successMessage, "success");
  } catch (error) {
    setMessage(
      error.message ||
        "A network error occurred while saving the batch."
    );
  } finally {
    saving.value = false;
  }
}

onBeforeUnmount(() => {
  questions.value.forEach(question => {
    if (question.imagePreview) {
      URL.revokeObjectURL(question.imagePreview);
    }
  });
});
</script>

<style scoped>
.add-questions-page {
  min-height: 100vh;
  padding: 28px;
  background: #fff9db;
  color: #111111;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto 24px;
  padding: 26px 30px;
  background: #003366;
  color: #ffffff;
  border-radius: 14px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #ffed9e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(25px, 4vw, 34px);
}

.subtitle {
  margin: 9px 0 0;
  color: #e6edf7;
  line-height: 1.5;
}

.header-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  background: #ffed9e;
  color: #003366;
  font-size: 30px;
}

.panel,
.format-note,
.message,
.form-actions {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.panel {
  margin-bottom: 20px;
  padding: 25px;
  border: 1px solid #e6dca7;
  border-radius: 12px;
  background: #ffffff;
}

.panel h2 {
  margin: 0 0 20px;
  color: #003366;
  font-size: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  margin-bottom: 18px;
}

.field > span {
  font-size: 14px;
  font-weight: 700;
}

.field input,
.field select,
.field textarea,
.paste-area {
  width: 100%;
  min-width: 0;
  padding: 12px 13px;
  border: 1px solid #c9ced6;
  border-radius: 7px;
  background: #ffffff;
  color: #111111;
  font: inherit;
  line-height: 1.5;
}

.field textarea,
.paste-area {
  resize: vertical;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.paste-area:focus {
  outline: 2px solid #003366;
  outline-offset: 1px;
  border-color: #003366;
}

.section-title-row,
.question-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.format-badge,
.count-badge {
  padding: 6px 10px;
  border-radius: 20px;
  background: #fff1b8;
  color: #003366;
  font-size: 12px;
  font-weight: 800;
}

.help-text {
  margin: -8px 0 18px;
  color: #555555;
  font-size: 13px;
  line-height: 1.6;
}

.small-note {
  margin: 12px 0 0;
}

.paste-area {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

button {
  font: inherit;
  cursor: pointer;
}

.secondary-button,
.text-button,
.remove-button,
.reset-button,
.save-button {
  border: 0;
  border-radius: 8px;
  font-weight: 800;
  padding: 11px 16px;
}

.secondary-button {
  background: #003366;
  color: #ffffff;
}

.secondary-button:hover,
.save-button:hover {
  background: #004786;
}

.text-button {
  background: transparent;
  color: #003366;
  text-decoration: underline;
}

.question-card {
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #d9dfeb;
  border-radius: 10px;
  background: #fffefa;
}

.question-card h3 {
  margin: 0;
  color: #003366;
}

.remove-button {
  background: #fff0f0;
  color: #8b1717;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.answer-field {
  max-width: 350px;
}

.image-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  padding: 16px;
  border: 1px dashed #b6c2d3;
  border-radius: 8px;
  background: #f9fbff;
}

.image-copy strong {
  color: #003366;
}

.image-copy .help-text {
  margin: 6px 0;
}

.file-name {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
  font-size: 13px;
}

.image-field input[type="file"] {
  max-width: 100%;
}

.image-preview {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
}

.image-preview img {
  max-width: 240px;
  max-height: 180px;
  object-fit: contain;
  border: 1px solid #d9dfeb;
  border-radius: 7px;
  background: #ffffff;
}

.batch-toolbar {
  justify-content: space-between;
}

.message {
  margin-top: 14px;
  margin-bottom: 14px;
  padding: 13px 15px;
  border-radius: 8px;
  font-size: 14px;
}

.message.success {
  background: #e6f5e8;
  border: 1px solid #8ac79a;
  color: #145c2c;
}

.message.error {
  background: #fff0f0;
  border: 1px solid #e5a1a1;
  color: #8b1717;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  margin-bottom: 20px;
}

.form-actions button {
  min-width: 145px;
  padding: 13px 20px;
}

.save-button {
  background: #003366;
  color: #ffffff;
}

.reset-button {
  background: #ffed9e;
  color: #111111;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.format-note {
  padding: 17px 20px;
  border-left: 5px solid #003366;
  border-radius: 6px;
  background: #ffffff;
  font-size: 14px;
  line-height: 1.7;
}

.sample {
  font-weight: 700;
  color: #003366;
}

@media (max-width: 650px) {
  .add-questions-page {
    padding: 14px;
  }

  .page-header {
    padding: 20px;
  }

  .header-icon {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }

  .panel {
    padding: 18px;
  }

  .form-grid,
  .options-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>