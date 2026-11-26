
<template>
  <div class="question-bank">
    <header class="topbar">
      <div class="brand">
        <span class="brand-icon">🎓</span>
        <span>ETrend Education Services</span>
      </div>
      <div class="topbar-right">
        <span class="teacher-avatar">👤</span>
        <span>Teacher</span>
      </div>
    </header>

    <div class="page-layout">
      <aside class="sidebar">
        <div class="nav-item">⌂ <span>Dashboard</span></div>
        <div class="nav-item">♟ <span>Teachers</span></div>
        <div class="nav-item">📖 <span>Lesson Notes</span></div>
        <div class="nav-item active">❔ <span>Question Bank</span></div>
        <div class="nav-item">♟ <span>Classes</span></div>
        <div class="nav-item">⚙ <span>Settings</span></div>
      </aside>

      <main class="main-content">
        <section class="intro">
          <div class="intro-icon">❔</div>
          <div>
            <h1>Question Bank</h1>
            <p>
              Select questions from different topics and download them
              together as a PDF.
            </p>
          </div>
        </section>

        <section class="context-card">
          <div class="context-item">
            <span class="context-icon">▣</span>
            <div>
              <small>Class</small>
              <strong>{{ selectedClass }}</strong>
            </div>
          </div>

          <div class="context-divider"></div>

          <div class="context-item">
            <span class="context-icon">📘</span>
            <div>
              <small>Subject</small>
              <strong>{{ selectedSubject }}</strong>
            </div>
          </div>

          <button
            class="outline-button"
            @click="showClassEditor = !showClassEditor"
          >
            ✎ Change Subject/Class
          </button>

          <div v-if="showClassEditor" class="class-editor">
            <label>
              Class
              <select v-model="selectedClass">
                <option v-for="item in classes" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </label>

            <label>
              Subject
              <select v-model="selectedSubject">
                <option
                  v-for="item in subjects"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <div v-if="loading" class="questions-empty">
          <div class="empty-icon">⏳</div>
          <strong>Loading question bank...</strong>
          <span>Please wait while the questions are retrieved.</span>
        </div>

        <div v-else-if="errorMessage" class="questions-empty">
          <div class="empty-icon">⚠️</div>
          <strong>Unable to load the question bank</strong>
          <span>{{ errorMessage }}</span>
          <button class="outline-button" @click="loadQuestionBank">
            Try Again
          </button>
        </div>

        <div v-else class="workflow">
          <section class="panel topic-panel">
            <div class="panel-heading">
              <span class="step">1</span>
              <h2>Select Topic</h2>
            </div>

            <div class="panel-body">
              <p class="panel-hint">
                Topics for {{ selectedSubject }} ({{ selectedClass }})
              </p>

              <button
                v-for="topic in topicsForSubject"
                :key="topic"
                class="topic-button"
                :class="{ chosen: selectedTopic === topic }"
                @click="chooseTopic(topic)"
              >
                <span>{{ topic }}</span>
                <span class="chevron">›</span>
              </button>

              <div v-if="!topicsForSubject.length" class="empty-state">
                No topics are available for this class and subject.
              </div>
            </div>
          </section>

          <section class="panel type-panel">
            <div class="panel-heading">
              <span class="step">2</span>
              <h2>Choose Question Type</h2>
            </div>

            <div class="panel-body">
              <p class="panel-hint">
                Choose the type of questions for the selected topic.
              </p>

              <button
                class="type-button theory-type"
                :class="{ selected: questionType === 'theory' }"
                :disabled="!selectedTopic"
                @click="chooseType('theory')"
              >
                <span class="type-icon">▤</span>
                <span class="type-copy">
                  <strong>Theory Questions</strong>
                  <small>Open-ended questions</small>
                </span>
                <span class="chevron">›</span>
              </button>

              <button
                class="type-button objective-type"
                :class="{ selected: questionType === 'objective' }"
                :disabled="!selectedTopic"
                @click="chooseType('objective')"
              >
                <span class="type-icon dark">☷</span>
                <span class="type-copy">
                  <strong>Objective Questions</strong>
                  <small>Multiple choice questions (A–D)</small>
                </span>
                <span class="chevron">›</span>
              </button>

              <div v-if="selectedTopic" class="selection-summary">
                <strong>ⓘ Topic Selected</strong>
                <b>{{ selectedTopic }}</b>
                <small>
                  {{
                    questionType
                      ? typeLabel
                      : 'Choose Theory or Objective to view questions'
                  }}
                </small>
              </div>

              <div v-else class="selection-summary muted">
                Select a topic to continue.
              </div>
            </div>
          </section>

          <section class="panel questions-panel">
            <div class="panel-heading">
              <span class="step">3</span>
              <h2>Select Questions</h2>
            </div>

            <div class="question-tools">
              <label class="check-label">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :disabled="!visibleQuestions.length"
                  @change="toggleAll($event.target.checked)"
                />
                Select All
              </label>

              <button
                class="text-button"
                :disabled="!selectedIds.length"
                @click="clearSelections"
              >
                Deselect All
              </button>

              <span class="selected-count">
                {{ selectedIds.length }} selected
              </span>

              <button
                class="download-button"
                :disabled="!selectedQuestions.length"
                @click="downloadPdf"
              >
                ⇩ Download PDF ({{ selectedQuestions.length }})
              </button>
            </div>

            <div
              v-if="!selectedTopic || !questionType"
              class="questions-empty"
            >
              <div class="empty-icon">📝</div>
              <strong>Your questions will appear here</strong>
              <span>Choose a topic and question type to get started.</span>
            </div>

            <div
              v-else-if="!visibleQuestions.length"
              class="questions-empty"
            >
              <div class="empty-icon">📂</div>
              <strong>No questions found</strong>
              <span>
                There are no {{ questionType }} questions for
                {{ selectedTopic }}.
              </span>
            </div>

            <div v-else class="question-list">
              <article
                v-for="(question, index) in visibleQuestions"
                :key="getQuestionKey(question)"
                class="question-card"
              >
                <div class="question-top">
                  <input
                    type="checkbox"
                    :aria-label="`Select question ${index + 1}`"
                    :checked="isQuestionSelected(question)"
                    @change="toggleQuestion(question)"
                  />

                  <span class="question-number">{{ index + 1 }}.</span>

                  <div class="question-text">
                    {{ question.text }}
                  </div>
                </div>

                <div
                  v-if="getQuestionImage(question)"
                  class="question-image-container"
                >
                  <img
                    :src="getQuestionImage(question)"
                    :alt="`Image for question ${index + 1}`"
                    class="question-image"
                    loading="lazy"
                  />
                </div>

                <div
                  v-if="questionType === 'objective'"
                  class="options-grid"
                >
                  <span
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                  >
                    <b>{{ String.fromCharCode(65 + optionIndex) }}.</b>
                    {{ option }}
                  </span>
                </div>

                <div
                  v-if="questionType === 'theory' && question.answer"
                  class="sample-answer"
                >
                  <b>Sample answer:</b> {{ question.answer }}
                </div>

                <div
                  v-if="questionType === 'objective' && question.answer"
                  class="correct-answer"
                >
                  Correct Answer:
                  <strong>{{ question.answer }}</strong>
                </div>
              </article>
            </div>

            <div v-if="visibleQuestions.length" class="panel-footer">
              Showing {{ visibleQuestions.length }} questions
              · {{ selectedIds.length }} selected across all visited topics
            </div>
          </section>
        </div>

        <p class="prototype-note">
          ETrend Education Services · Question Bank
        </p>
      </main>
    </div>
  </div>
</template>



<script setup>
import { computed, ref, watch } from "vue";
import { jsPDF } from "jspdf";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL || ""
).replace(/\/$/, "");

// Fetch from the new question bank backend.
const QUESTION_BANK_URL = `${API_BASE_URL}/api/v2/question-bank`;

const classes = [
  "JSS 1", "JSS 2", "JSS 3",
  "SS 1", "SS 2", "SS 3"
];

const subjects = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Biology",
  "Agricultural Science"
];

// --------------------------------------------------
// PAGE STATE
// --------------------------------------------------

const selectedClass = ref("JSS 2");
const selectedSubject = ref("Mathematics");
const selectedTopic = ref("");
const questionType = ref("");

const showClassEditor = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const topicsForSubject = ref([]);
const questionBankQuestions = ref([]);
const selectedQuestionsMap = ref(new Map());

const selectedIds = computed(() =>
  Array.from(selectedQuestionsMap.value.keys())
);

const selectedQuestions = computed(() =>
  Array.from(selectedQuestionsMap.value.values())
);

const typeLabel = computed(() =>
  questionType.value === "theory"
    ? "Question type: Theory"
    : "Question type: Objective"
);

const visibleQuestions = computed(() => {
  if (!selectedTopic.value || !questionType.value) return [];

  return questionBankQuestions.value.filter(question =>
    question.topic === selectedTopic.value &&
    question.questionType === questionType.value
  );
});

const allSelected = computed(() =>
  visibleQuestions.value.length > 0 &&
  visibleQuestions.value.every(isQuestionSelected)
);

// --------------------------------------------------
// PRESERVE ORIGINAL DATABASE TEXT
// --------------------------------------------------

// Do not trim, rewrite, replace, or paraphrase question text.
// Only remove null characters and normalize line endings.
function exactText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "");
}

// Options may be stored as strings or as objects.
function getOptionText(option) {
  if (typeof option === "string" || typeof option === "number") {
    return exactText(option);
  }

  if (option && typeof option === "object") {
    return exactText(
      option.text ??
      option.option ??
      option.value ??
      option.label ??
      ""
    );
  }

  return "";
}

// --------------------------------------------------
// QUESTION IMAGE SUPPORT
// --------------------------------------------------

function getQuestionImage(question) {
  return (
    question?.imageUrl ||
    question?.image ||
    question?.imagePath ||
    question?.imageURL ||
    ""
  );
}

// --------------------------------------------------
// QUESTION IDENTIFICATION
// --------------------------------------------------

function getQuestionKey(question) {
  return [
    selectedClass.value,
    selectedSubject.value,
    question.topic || selectedTopic.value,
    question.questionType || questionType.value,
    question.id
  ].join("::");
}

function isQuestionSelected(question) {
  return selectedQuestionsMap.value.has(getQuestionKey(question));
}

// --------------------------------------------------
// LOAD QUESTIONS FROM THE NEW BACKEND
// --------------------------------------------------

let requestNumber = 0;

async function loadQuestionBank() {
  const currentRequest = ++requestNumber;

  loading.value = true;
  errorMessage.value = "";

  selectedQuestionsMap.value = new Map();
  selectedTopic.value = "";
  questionType.value = "";
  topicsForSubject.value = [];
  questionBankQuestions.value = [];

  try {
    const params = new URLSearchParams({
      className: selectedClass.value,
      subject: selectedSubject.value
    });

    const response = await fetch(
      `${QUESTION_BANK_URL}?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error(
        `The server returned HTTP ${response.status}.`
      );
    }

    const result = await response.json();

    if (result.success === false) {
      throw new Error(
        result.message || "The question bank could not be loaded."
      );
    }

    // Accepts either:
    // { topics: [], questions: [] }
    // or { data: { topics: [], questions: [] } }
    const payload = result.data || result;

    const rawQuestions = Array.isArray(payload.questions)
      ? payload.questions
      : [];

    questionBankQuestions.value = rawQuestions
      .filter(question =>
        question.id !== undefined &&
        question.id !== null &&
        question.text !== undefined &&
        question.text !== null
      )
      .map(question => ({
        ...question,

        id: String(question.id),

        // Preserve the database text exactly.
        text: exactText(question.text),

        topic: exactText(question.topic ?? ""),

        questionType: exactText(
          question.questionType ?? question.type ?? ""
        ).toLowerCase(),

        // Preserve original option content.
        options: Array.isArray(question.options)
          ? question.options
          : [],

        answer: exactText(question.answer ?? "")
      }))
      .filter(question =>
        ["objective", "theory"].includes(question.questionType)
      );

    const topicsFromApi = Array.isArray(payload.topics)
      ? payload.topics
          .map(topic =>
            typeof topic === "string"
              ? topic
              : topic?.name
          )
          .filter(topic => typeof topic === "string" && topic.length > 0)
      : [];

    const topicsFromQuestions = questionBankQuestions.value
      .map(question => question.topic)
      .filter(topic => topic.length > 0);

    // Keep topic spelling and capitalization as stored.
    topicsForSubject.value = [
      ...new Set([...topicsFromApi, ...topicsFromQuestions])
    ];

    selectedTopic.value = topicsForSubject.value[0] || "";

  } catch (error) {
    if (currentRequest === requestNumber) {
      console.error("Question bank loading failed:", error);

      errorMessage.value =
        error?.message ||
        "Unable to connect to the question bank server.";
    }
  } finally {
    if (currentRequest === requestNumber) {
      loading.value = false;
    }
  }
}

watch(
  [selectedClass, selectedSubject],
  loadQuestionBank,
  { immediate: true }
);

// --------------------------------------------------
// TOPIC AND QUESTION-TYPE NAVIGATION
// --------------------------------------------------

function chooseTopic(topic) {
  selectedTopic.value = topic;
  questionType.value = "";
}

function chooseType(type) {
  questionType.value = type;
}

// --------------------------------------------------
// SELECTION MANAGEMENT
// --------------------------------------------------

function toggleQuestion(question) {
  const key = getQuestionKey(question);
  const updated = new Map(selectedQuestionsMap.value);

  if (updated.has(key)) {
    updated.delete(key);
  } else {
    updated.set(key, {
      ...question,
      id: String(question.id),
      topic: question.topic || selectedTopic.value,
      questionType: question.questionType || questionType.value,
      className: selectedClass.value,
      subject: selectedSubject.value
    });
  }

  selectedQuestionsMap.value = updated;
}

function toggleAll(checked) {
  const updated = new Map(selectedQuestionsMap.value);

  for (const question of visibleQuestions.value) {
    const key = getQuestionKey(question);

    if (checked) {
      updated.set(key, {
        ...question,
        id: String(question.id),
        topic: question.topic || selectedTopic.value,
        questionType: question.questionType || questionType.value,
        className: selectedClass.value,
        subject: selectedSubject.value
      });
    } else {
      updated.delete(key);
    }
  }

  selectedQuestionsMap.value = updated;
}

function clearSelections() {
  selectedQuestionsMap.value = new Map();
}

// --------------------------------------------------
// PDF IMAGE HELPERS
// --------------------------------------------------

function getPdfImageFormat(dataUrl) {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

async function imageToPdfDataUrl(imageUrl) {
  if (!imageUrl) return null;

  const source = imageUrl.startsWith("data:image/")
    ? imageUrl
    : await (async () => {
        const response = await fetch(imageUrl, {
          mode: "cors",
          credentials: "omit"
        });

        if (!response.ok) {
          throw new Error(
            `A question image could not be loaded (HTTP ${response.status}).`
          );
        }

        const blob = await response.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error(
            "A question image URL did not return an image file."
          );
        }

        return await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);
          reader.onerror = () =>
            reject(new Error("A question image could not be read."));

          reader.readAsDataURL(blob);
        });
      })();

  return await new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext("2d");

        if (!context || !canvas.width || !canvas.height) {
          reject(new Error("A question image has invalid dimensions."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        reject(new Error("A question image could not be prepared for the PDF."));
      }
    };

    image.onerror = () => reject(
      new Error(
        "A question image could not be accessed. Its host must permit cross-origin access."
      )
    );

    image.src = source;
  });
}

// --------------------------------------------------
// PDF LAYOUT HELPERS
// --------------------------------------------------

function ensurePdfSpace(doc, y, height, marginBottom = 18) {
  if (y + height > doc.internal.pageSize.getHeight() - marginBottom) {
    doc.addPage();
    return 18;
  }

  return y;
}

function writePdfWrappedText(
  doc,
  text,
  x,
  y,
  maxWidth,
  lineHeight = 5
) {
  const lines = doc.splitTextToSize(exactText(text), maxWidth);

  for (const line of lines) {
    y = ensurePdfSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }

  return y;
}

// Draw answer options in a horizontal row where space permits.
// Long options wrap onto subsequent lines instead of being cut off.
function writeOptionsHorizontally(doc, options, x, y, maxWidth) {
  const gap = 5;
  const lineHeight = 5;
  const usableOptions = options
    .map(getOptionText)
    .filter(option => option.length > 0);

  let currentX = x;
  let currentY = y;

  for (let index = 0; index < usableOptions.length; index++) {
    const label = `${String.fromCharCode(65 + index)}.`;
    const optionText = usableOptions[index];

    doc.setFont("helvetica", "bold");
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");

    const availableTextWidth = Math.max(
      10,
      maxWidth - labelWidth - 2
    );

    const textLines = doc.splitTextToSize(
      optionText,
      availableTextWidth
    );

    const firstLineWidth = doc.getTextWidth(textLines[0] || "");
    const optionWidth = labelWidth + 2 + firstLineWidth;

    // If the option cannot fit on this row, start another row.
    if (
      currentX > x &&
      currentX + optionWidth > x + maxWidth
    ) {
      currentX = x;
      currentY += lineHeight;
    }

    currentY = ensurePdfSpace(
      doc,
      currentY,
      Math.max(lineHeight, textLines.length * lineHeight)
    );

    doc.setFont("helvetica", "bold");
    doc.text(label, currentX, currentY);

    doc.setFont("helvetica", "normal");
    const textX = currentX + labelWidth + 2;

    doc.text(textLines[0] || "", textX, currentY);

    if (textLines.length > 1) {
      for (let lineIndex = 1; lineIndex < textLines.length; lineIndex++) {
        currentY = ensurePdfSpace(
          doc,
          currentY + lineHeight,
          lineHeight
        );

        doc.text(textLines[lineIndex], x + 4, currentY);
      }

      currentY += lineHeight;
      currentX = x;
    } else {
      currentX += optionWidth + gap;
    }
  }

  return currentY + lineHeight;
}

// --------------------------------------------------
// PDF GENERATION
// --------------------------------------------------

async function downloadPdf() {
  if (!selectedQuestions.value.length) return;

  const downloadButton = document.querySelector(".download-button");

  if (downloadButton) downloadButton.disabled = true;

  try {
    const questions = [...selectedQuestions.value].sort((a, b) => {
      const topicCompare = String(a.topic || "").localeCompare(
        String(b.topic || "")
      );

      if (topicCompare) return topicCompare;

      const typeCompare = String(a.questionType || "").localeCompare(
        String(b.questionType || "")
      );

      if (typeCompare) return typeCompare;

      return String(a.id).localeCompare(String(b.id));
    });

    // Prepare images before building the PDF.
    const preparedQuestions = await Promise.all(
      questions.map(async question => {
        const imageUrl = getQuestionImage(question);

        return {
          ...question,
          pdfImage: imageUrl
            ? await imageToPdfDataUrl(imageUrl)
            : null
        };
      })
    );

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 17;

    doc.setProperties({
      title: `${selectedSubject.value} Question Bank`,
      subject: `${selectedClass.value} - ${selectedSubject.value}`,
      author: "ETrend Education Services"
    });

    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ETREND EDUCATION SERVICES", margin, y);

    y += 8;
    doc.setFontSize(13);
    doc.text("QUESTION BANK", margin, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);

    doc.text(`Class: ${selectedClass.value}`, margin, y);
    y += 5;
    doc.text(`Subject: ${selectedSubject.value}`, margin, y);
    y += 5;
    doc.text(`Total Questions: ${preparedQuestions.length}`, margin, y);
    y += 8;

    let previousGroup = "";

    for (let index = 0; index < preparedQuestions.length; index++) {
      const question = preparedQuestions[index];
      const typeName =
        question.questionType === "theory" ? "Theory" : "Objective";
      const groupName = `${question.topic || "General"} — ${typeName}`;

      if (groupName !== previousGroup) {
        y = ensurePdfSpace(doc, y, 12);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 51, 102);

        y = writePdfWrappedText(
          doc,
          groupName,
          margin,
          y,
          contentWidth,
          5
        );

        doc.setDrawColor(190, 205, 222);
        doc.line(margin, y, pageWidth - margin, y);

        y += 5;
        previousGroup = groupName;
      }

      // Question text comes directly from the database.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 51, 102);

      const prefix = `${index + 1}. `;
      const prefixWidth = doc.getTextWidth(prefix);

      const questionLines = doc.splitTextToSize(
        exactText(question.text),
        contentWidth - prefixWidth
      );

      y = ensurePdfSpace(doc, y, questionLines.length * 5);
      doc.text(prefix, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);

      questionLines.forEach((line, lineIndex) => {
        if (lineIndex === 0) {
          doc.text(line, margin + prefixWidth, y);
        } else {
          y = ensurePdfSpace(doc, y + 5, 5);
          doc.text(line, margin + prefixWidth, y);
        }
      });

      y += 6;

      // Image appears immediately below the question.
      // For objective questions, options follow the image.
      // For theory questions, the sample answer follows the image.
      if (question.pdfImage) {
        const imageProperties = doc.getImageProperties(question.pdfImage);
        const maxImageWidth = Math.min(contentWidth, 160);
        const maxImageHeight = 72;

        const scale = Math.min(
          maxImageWidth / imageProperties.width,
          maxImageHeight / imageProperties.height,
          1
        );

        const imageWidth = imageProperties.width * scale;
        const imageHeight = imageProperties.height * scale;

        y = ensurePdfSpace(doc, y, imageHeight + 5);

        doc.addImage(
          question.pdfImage,
          getPdfImageFormat(question.pdfImage),
          margin,
          y,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        y += imageHeight + 5;
      }

      if (question.questionType === "objective") {
        y = writeOptionsHorizontally(
          doc,
          Array.isArray(question.options) ? question.options : [],
          margin + 4,
          y,
          contentWidth - 4
        );

        if (question.answer) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(0, 51, 102);

          y = writePdfWrappedText(
            doc,
            `Correct Answer: ${exactText(question.answer)}`,
            margin + 4,
            y,
            contentWidth - 4,
            4.5
          );
        }
      } else if (question.answer) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 51, 102);

        y = writePdfWrappedText(
          doc,
          "Sample answer:",
          margin + 4,
          y,
          contentWidth - 4,
          4.5
        );

        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);

        y = writePdfWrappedText(
          doc,
          exactText(question.answer),
          margin + 4,
          y,
          contentWidth - 4,
          4.5
        );
      }

      y += 5;
    }

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      doc.text(
        `ETrend Education Services | Page ${page} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    const safeName = `${selectedSubject.value}-question-bank`
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    doc.save(`${safeName || "question-bank"}.pdf`);
    clearSelections();

  } catch (error) {
    console.error("PDF generation failed:", error);

    window.alert(
      error?.message ||
      "The PDF could not be created. Please check the question images and try again. Your selections have been kept."
    );
  } finally {
    if (downloadButton) downloadButton.disabled = false;
  }
}
</script>



<style scoped>
:global(*) { box-sizing: border-box; }
.question-bank { min-height: 100vh; background: #f5f7fb; color: #111111; font-family: Inter, "Segoe UI", Arial, sans-serif; }
.topbar { min-height: 64px; background: #003366; color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; gap: 16px; }
.brand { display: flex; align-items: center; gap: 10px; font-size: clamp(17px, 2vw, 24px); font-weight: 750; letter-spacing: -.3px; }
.brand-icon { font-size: 28px; }
.topbar-right { display: flex; align-items: center; gap: 10px; font-size: 14px; white-space: nowrap; }
.teacher-avatar { border: 1px solid #ffffe0; border-radius: 50%; width: 34px; height: 34px; display: grid; place-items: center; }
.page-layout { display: grid; grid-template-columns: 190px minmax(0, 1fr); min-height: calc(100vh - 64px); }
.sidebar { background: #003366; padding: 18px 8px; color: #fff; }
.nav-item { display: flex; align-items: center; gap: 12px; min-height: 48px; border-radius: 7px; padding: 10px 12px; margin-bottom: 5px; font-size: 14px; }
.nav-item > span:first-child { flex: 1; }
.nav-item.active { color: #003366; background: #ffffe0; font-weight: 750; }
.main-content { min-width: 0; padding: 18px; }
.intro { display: flex; gap: 18px; align-items: center; padding: 20px 22px; background: #ffffe0; border-radius: 10px; margin-bottom: 16px; }
.intro-icon { flex: 0 0 48px; width: 48px; height: 48px; border-radius: 8px; background: #003366; color: #ffffe0; display: grid; place-items: center; font-size: 25px; }
h1 { color: #003366; margin: 0 0 6px; font-size: clamp(23px, 2.4vw, 31px); }
.intro p { margin: 0; color: #203c5d; line-height: 1.5; }
.context-card { position: relative; display: flex; align-items: center; gap: 26px; flex-wrap: wrap; padding: 14px 16px; background: white; border: 1px solid #d6e0ec; border-radius: 9px; margin-bottom: 14px; }
.context-item { display: flex; align-items: center; gap: 12px; min-width: 150px; }
.context-icon { font-size: 24px; color: #003366; }
.context-item small, .context-item strong { display: block; }
.context-item small { color: #003366; font-size: 12px; margin-bottom: 3px; }
.context-item strong { color: #111; font-size: 14px; }
.context-divider { height: 34px; width: 1px; background: #c4d0df; }
.outline-button { margin-left: auto; background: #fff; border: 1px solid #8daed0; border-radius: 6px; padding: 10px 13px; color: #003366; font-weight: 700; cursor: pointer; }
.class-editor { width: 100%; display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid #e3eaf1; }
.class-editor label { display: grid; gap: 5px; font-size: 12px; color: #003366; font-weight: 700; }
.class-editor select { min-width: 170px; padding: 8px; border: 1px solid #c4d0df; border-radius: 5px; background: #fff; color: #111; }
.workflow { display: grid; grid-template-columns: minmax(220px, .95fr) minmax(240px, 1.05fr) minmax(340px, 1.65fr); gap: 14px; align-items: stretch; }
.panel { min-width: 0; border: 1px solid #c4d7ed; border-radius: 10px; overflow: hidden; background: #fff; }
.panel-heading { min-height: 48px; display: flex; align-items: center; gap: 12px; padding: 9px 13px; background: #003366; color: #fff; }
.panel-heading h2 { font-size: 16px; margin: 0; font-weight: 700; }
.step { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 30px; background: #ffffe0; color: #003366; font-weight: 800; border-radius: 50%; font-size: 16px; }
.panel-body { padding: 14px 13px; }
.panel-hint { margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #203c5d; }
.topic-button { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; padding: 12px 13px; margin: 0 0 7px; text-align: left; border: 1px solid #d8e1eb; border-radius: 7px; background: #fff; color: #111; font-size: 13px; cursor: pointer; transition: background .15s, color .15s; }
.topic-button:hover, .topic-button.chosen { background: #003366; border-color: #003366; color: #fff; }
.chevron { font-size: 23px; line-height: 15px; }
.type-button { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 78px; padding: 13px; margin: 0 0 10px; text-align: left; border: 1px solid #cddbea; border-radius: 8px; cursor: pointer; color: #111; }
.type-button:disabled { opacity: .5; cursor: not-allowed; }
.theory-type { background: #fff; }
.objective-type { background: #ffffe0; }
.type-button.selected { border: 2px solid #003366; box-shadow: 0 0 0 2px #00336612; }
.type-icon { display: grid; place-items: center; flex: 0 0 42px; height: 42px; border-radius: 6px; background: #003366; color: #ffffe0; font-size: 25px; }
.type-icon.dark { background: #ffffe0; color: #003366; }
.type-copy { display: grid; gap: 5px; flex: 1; min-width: 0; }
.type-copy strong { font-size: 13px; }
.type-copy small { font-size: 11px; line-height: 1.4; color: #3d4b5a; }
.selection-summary { margin-top: 18px; padding: 13px; display: grid; gap: 8px; border: 1px solid #b9d5f5; background: #eef6ff; border-radius: 8px; color: #003366; font-size: 13px; }
.selection-summary b { padding-left: 19px; }
.selection-summary small { padding-left: 19px; }
.selection-summary.muted { background: #f8fafc; border-color: #d8e1eb; color: #586575; line-height: 1.5; }
.question-tools { display: flex; align-items: center; flex-wrap: wrap; gap: 13px; padding: 10px 12px; border-bottom: 1px solid #e1e8f0; }
.check-label { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: #003366; white-space: nowrap; }
input[type="checkbox"] { width: 17px; height: 17px; accent-color: #003366; cursor: pointer; }
.text-button { border: 0; padding: 0; background: transparent; color: #003366; font-size: 12px; cursor: pointer; }
.text-button:disabled { opacity: .45; cursor: not-allowed; }
.selected-count { margin-left: auto; font-size: 12px; color: #536275; white-space: nowrap; }
.download-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 13px; background: #003366; color: #fff; border: 0; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; }
.download-button:disabled { opacity: .45; cursor: not-allowed; }
.question-list { max-height: 660px; overflow-y: auto; padding: 10px; }
.question-card { border: 1px solid #d3dfec; border-radius: 7px; padding: 13px; margin-bottom: 9px; background: #fff; }
.question-top { display: grid; grid-template-columns: 18px 18px minmax(0, 1fr); align-items: start; gap: 9px; }
.question-top input { margin: 1px 0 0; }
.question-number, .question-text { color: #003366; font-size: 13px; line-height: 1.55; }
.question-number { font-weight: 750; }
.question-text { color: #111; }
.options-grid { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 7px 18px; padding: 11px 0 0 45px; font-size: 12px; line-height: 1.45; color: #253e59; }
.options-grid > span { flex: 0 1 auto; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.question-image-container { padding: 10px 0 0 45px; }
.question-image { display: block; max-width: min(100%, 420px); max-height: 280px; width: auto; height: auto; object-fit: contain; object-position: left center; }
.options-grid b { color: #003366; }
.correct-answer, .sample-answer { padding: 11px 0 0 45px; font-size: 12px; color: #003366; line-height: 1.5; }
.correct-answer strong { color: #111; }
.panel-footer { padding: 10px 13px; color: #617083; font-size: 11px; border-top: 1px solid #e1e8f0; }
.questions-empty { min-height: 240px; padding: 30px 18px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 9px; text-align: center; color: #5d6b7a; }
.empty-icon { font-size: 32px; }
.questions-empty strong { color: #003366; font-size: 14px; }
.questions-empty span { font-size: 12px; line-height: 1.5; }
.empty-state { padding: 12px; color: #5d6b7a; font-size: 13px; }
.prototype-note { margin: 14px 2px 0; color: #68778a; font-size: 11px; text-align: right; }
@media (max-width: 1180px) {
  .page-layout { grid-template-columns: 155px minmax(0, 1fr); }
  .workflow { grid-template-columns: minmax(190px, .8fr) minmax(220px, 1fr); }
  .questions-panel { grid-column: 1 / -1; }
  .question-list { max-height: 520px; }
}
@media (max-width: 700px) {
  .topbar { padding: 12px 14px; }
  .brand { font-size: 16px; }
  .topbar-right > span:last-child { display: none; }
  .page-layout { display: block; }
  .sidebar { display: flex; gap: 4px; overflow-x: auto; padding: 7px; }
  .nav-item { flex: 0 0 auto; min-height: 40px; margin: 0; padding: 8px 10px; }
  .nav-item span { display: none; }
  .main-content { padding: 11px; }
  .intro { align-items: flex-start; padding: 15px; gap: 12px; }
  .intro-icon { flex-basis: 38px; width: 38px; height: 38px; font-size: 20px; }
  .intro p { font-size: 13px; }
  .context-card { gap: 14px; }
  .context-divider { display: none; }
  .outline-button { margin-left: 0; width: 100%; }
  .class-editor { flex-direction: column; }
  .class-editor select { width: 100%; }
  .workflow { grid-template-columns: minmax(0, 1fr); }
  .questions-panel { grid-column: auto; }
  .question-tools { gap: 10px; }
  .selected-count { margin-left: 0; }
  .download-button { width: 100%; }
  .options-grid { padding-left: 45px; gap: 7px 12px; }
  .question-image-container { padding-left: 45px; }
}
</style>
