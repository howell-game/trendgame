<template>
  <div class="question-bank">
    <header class="topbar">
      <div class="brand"><span class="brand-icon">🎓</span><span>ETrend Education Services</span></div>
      <div class="topbar-right"><span class="teacher-avatar">👤</span><span>Teacher</span></div>
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
            <p>Select a topic, choose question type, pick the questions you need and download them as a PDF.</p>
          </div>
        </section>

        <section class="context-card">
          <div class="context-item">
            <span class="context-icon">▣</span>
            <div><small>Class</small><strong>{{ selectedClass }}</strong></div>
          </div>
          <div class="context-divider"></div>
          <div class="context-item">
            <span class="context-icon">📘</span>
            <div><small>Subject</small><strong>{{ selectedSubject }}</strong></div>
          </div>
          <button class="outline-button" @click="showClassEditor = !showClassEditor">✎ Change Subject/Class</button>
          <div v-if="showClassEditor" class="class-editor">
            <label>Class
              <select v-model="selectedClass">
                <option>JSS 1</option><option>JSS 2</option><option>JSS 3</option>
                <option>SS 1</option><option>SS 2</option><option>SS 3</option>
              </select>
            </label>
            <label>Subject
              <select v-model="selectedSubject" @change="resetTopic">
                <option>Mathematics</option><option>English Language</option><option>Basic Science</option>
                <option>Biology</option><option>Agricultural Science</option>
              </select>
            </label>
          </div>
        </section>

        <div class="workflow">
          <section class="panel topic-panel">
            <div class="panel-heading"><span class="step">1</span><h2>Select Topic</h2></div>
            <div class="panel-body">
              <p class="panel-hint">Available topics for {{ selectedSubject }} ({{ selectedClass }})</p>
              <button
                v-for="topic in topicsForSubject"
                :key="topic"
                class="topic-button"
                :class="{ chosen: selectedTopic === topic }"
                @click="chooseTopic(topic)"
              >
                <span>{{ topic }}</span><span class="chevron">›</span>
              </button>
              <div v-if="!topicsForSubject.length" class="empty-state">No sample topics for this subject yet.</div>
            </div>
          </section>

          <section class="panel type-panel">
            <div class="panel-heading"><span class="step">2</span><h2>Choose Question Type</h2></div>
            <div class="panel-body">
              <p class="panel-hint">Choose the type of questions you want for the selected topic.</p>
              <button class="type-button theory-type" :class="{ selected: questionType === 'theory' }" :disabled="!selectedTopic" @click="chooseType('theory')">
                <span class="type-icon">▤</span>
                <span class="type-copy"><strong>Theory Questions</strong><small>Open-ended questions (no options)</small></span>
                <span class="chevron">›</span>
              </button>
              <button class="type-button objective-type" :class="{ selected: questionType === 'objective' }" :disabled="!selectedTopic" @click="chooseType('objective')">
                <span class="type-icon dark">☷</span>
                <span class="type-copy"><strong>Objective Questions</strong><small>Multiple choice (A, B, C, D) with correct answers</small></span>
                <span class="chevron">›</span>
              </button>
              <div class="selection-summary" v-if="selectedTopic">
                <strong>ⓘ Topic Selected</strong>
                <b>{{ selectedTopic }}</b>
                <small>{{ questionType ? typeLabel : 'Choose Theory or Objective to view questions' }}</small>
              </div>
              <div v-else class="selection-summary muted">
                Select a topic from the first panel to continue.
              </div>
            </div>
          </section>

          <section class="panel questions-panel">
            <div class="panel-heading"><span class="step">3</span><h2>Select Questions</h2></div>
            <div class="question-tools">
              <label class="check-label"><input type="checkbox" :checked="allSelected" :disabled="!visibleQuestions.length" @change="toggleAll(true)"> Select All</label>
              <button class="text-button" :disabled="!selectedIds.length" @click="selectedIds = []">Deselect All</button>
              <span class="selected-count">{{ selectedIds.length }} selected</span>
              <button class="download-button" :disabled="!selectedQuestions.length" @click="downloadPdf">⇩ Download PDF</button>
            </div>

            <div v-if="!selectedTopic || !questionType" class="questions-empty">
              <div class="empty-icon">📝</div>
              <strong>Your questions will appear here</strong>
              <span>Choose a topic and question type to get started.</span>
            </div>

            <div v-else-if="!visibleQuestions.length" class="questions-empty">
              <div class="empty-icon">📂</div>
              <strong>No sample questions found</strong>
              <span>Try another topic or question type.</span>
            </div>

            <div v-else class="question-list">
              <article v-for="(question, index) in visibleQuestions" :key="question.id" class="question-card">
                <div class="question-top">
                  <input type="checkbox" :aria-label="`Select question ${index + 1}`" :checked="selectedIds.includes(question.id)" @change="toggleQuestion(question.id)">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <div class="question-text">{{ question.text }}</div>
                </div>
                <div v-if="questionType === 'objective'" class="options-grid">
                  <span v-for="(option, optionIndex) in question.options" :key="optionIndex">
                    <b>{{ String.fromCharCode(65 + optionIndex) }}.</b> {{ option }}
                  </span>
                </div>
                <div v-if="questionType === 'theory' && question.answer" class="sample-answer"><b>Sample answer:</b> {{ question.answer }}</div>
                <div v-if="questionType === 'objective'" class="correct-answer">Correct Answer: <strong>{{ question.answer }}</strong></div>
              </article>
            </div>
            <div class="panel-footer" v-if="visibleQuestions.length">
              Showing {{ visibleQuestions.length }} sample questions · {{ selectedIds.length }} selected
            </div>
          </section>
        </div>
        <p class="prototype-note">Prototype preview · Questions shown are sample data and are not yet connected to your database.</p>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const selectedClass = ref("JSS 2");
const selectedSubject = ref("Mathematics");
const selectedTopic = ref("Number and Numeration");
const questionType = ref("objective");
const selectedIds = ref([]);
const showClassEditor = ref(false);

const sampleData = {
  Mathematics: {
    "Number and Numeration": {
      objective: [
        { id: "math-num-o1", text: "What is the place value of the digit 7 in 5,672?", options: ["7 tens", "7 hundreds", "7 thousands", "7 ones"], answer: "A" },
        { id: "math-num-o2", text: "Which of the following is a prime number?", options: ["1", "4", "7", "9"], answer: "C" },
        { id: "math-num-o3", text: "Write 3,426 in expanded form.", options: ["3,000 + 400 + 20 + 6", "3,400 + 20 + 6", "3,000 + 400 + 200 + 6", "3,000 + 420 + 6"], answer: "A" },
        { id: "math-num-o4", text: "Which number is greater than 6,789?", options: ["6,780", "6,870", "6,790", "6,700"], answer: "B" },
        { id: "math-num-o5", text: "What is the value of 9 in 49,312?", options: ["9 ones", "9 tens", "9 hundreds", "9 thousands"], answer: "D" }
      ],
      theory: [
        { id: "math-num-t1", text: "Explain the difference between a digit and a number.", answer: "A digit is a single symbol from 0 to 9; a number can contain one or more digits." },
        { id: "math-num-t2", text: "Write 7,305 in words and in expanded form.", answer: "Seven thousand three hundred and five; 7,000 + 300 + 5." },
        { id: "math-num-t3", text: "Arrange 4,562, 4,256, 4,625 and 4,526 in ascending order.", answer: "4,256, 4,526, 4,562, 4,625." }
      ]
    },
    "Fractions and Decimals": {
      objective: [
        { id: "math-fr-o1", text: "What is 1/2 expressed as a decimal?", options: ["0.2", "0.25", "0.5", "1.2"], answer: "C" },
        { id: "math-fr-o2", text: "Simplify the fraction 6/8.", options: ["1/2", "2/3", "3/4", "4/5"], answer: "C" },
        { id: "math-fr-o3", text: "Calculate 0.4 + 0.3.", options: ["0.07", "0.7", "7.0", "0.34"], answer: "B" }
      ],
      theory: [
        { id: "math-fr-t1", text: "Define a proper fraction and give two examples.", answer: "A proper fraction has a numerator smaller than its denominator, e.g. 1/2 and 3/4." },
        { id: "math-fr-t2", text: "Convert 3/5 to a decimal and show your working.", answer: "3 ÷ 5 = 0.6." }
      ]
    },
    "Ratio and Proportion": { objective: [], theory: [] },
    Algebra: { objective: [], theory: [] },
    Geometry: { objective: [], theory: [] },
    Mensuration: { objective: [], theory: [] },
    Statistics: { objective: [], theory: [] },
    Trigonometry: { objective: [], theory: [] }
  },
  "English Language": {
    "Parts of Speech": {
      objective: [
        { id: "eng-pos-o1", text: "Which word is a noun in the sentence “Ada reads daily”?", options: ["reads", "daily", "Ada", "the"], answer: "C" },
        { id: "eng-pos-o2", text: "Which of these is an adjective?", options: ["quickly", "beautiful", "run", "under"], answer: "B" }
      ],
      theory: [{ id: "eng-pos-t1", text: "Define a noun and give three examples.", answer: "A noun is the name of a person, place, animal or thing." }]
    },
    "Comprehension": { objective: [], theory: [] },
    "Essay Writing": { objective: [], theory: [] },
    "Grammar": { objective: [], theory: [] }
  },
  "Basic Science": {
    "Living Things": {
      objective: [{ id: "sci-live-o1", text: "Which of these is a living thing?", options: ["Stone", "Chair", "Goat", "Bottle"], answer: "C" }],
      theory: [{ id: "sci-live-t1", text: "State four characteristics of living things.", answer: "Movement, respiration, sensitivity, growth, reproduction, excretion, nutrition." }]
    },
    "Energy": { objective: [], theory: [] },
    "Matter": { objective: [], theory: [] }
  },
  Biology: { "Cell Structure": { objective: [], theory: [] }, "Nutrition": { objective: [], theory: [] } },
  "Agricultural Science": { "Soil": { objective: [], theory: [] }, "Farm Tools": { objective: [], theory: [] } }
};

const topicsForSubject = computed(() => Object.keys(sampleData[selectedSubject.value] || {}));
const visibleQuestions = computed(() => {
  if (!selectedTopic.value || !questionType.value) return [];
  return sampleData[selectedSubject.value]?.[selectedTopic.value]?.[questionType.value] || [];
});
const selectedQuestions = computed(() => visibleQuestions.value.filter(q => selectedIds.value.includes(q.id)));
const allSelected = computed(() => visibleQuestions.value.length > 0 && visibleQuestions.value.every(q => selectedIds.value.includes(q.id)));
const typeLabel = computed(() => questionType.value === "theory" ? "Question type: Theory" : "Question type: Objective");

function chooseTopic(topic) {
  selectedTopic.value = topic;
  questionType.value = "";
  selectedIds.value = [];
}
function chooseType(type) {
  questionType.value = type;
  selectedIds.value = [];
}
function resetTopic() {
  selectedTopic.value = topicsForSubject.value[0] || "";
  questionType.value = "";
  selectedIds.value = [];
}
function toggleQuestion(id) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(selectedId => selectedId !== id)
    : [...selectedIds.value, id];
}
function toggleAll(checked) {
  selectedIds.value = checked ? visibleQuestions.value.map(q => q.id) : [];
}
watch([selectedTopic, questionType, selectedSubject], () => {
  const available = new Set(visibleQuestions.value.map(q => q.id));
  selectedIds.value = selectedIds.value.filter(id => available.has(id));
});

function escapePdfText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}
function wrapText(text, maxChars = 88) {
  const words = String(text ?? "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
function buildPdfLines() {
  const lines = [
    "ETREND EDUCATION SERVICES",
    "QUESTION BANK",
    `Class: ${selectedClass.value}    Subject: ${selectedSubject.value}`,
    `Topic: ${selectedTopic.value}`,
    `Question Type: ${questionType.value === "theory" ? "Theory" : "Objective"}`,
    " "
  ];
  selectedQuestions.value.forEach((q, index) => {
    lines.push(...wrapText(`${index + 1}. ${q.text}`));
    if (questionType.value === "objective") {
      q.options.forEach((option, i) => lines.push(...wrapText(`   ${String.fromCharCode(65 + i)}. ${option}`)));
      lines.push(`   Correct Answer: ${q.answer}`);
    } else if (q.answer) {
      lines.push(...wrapText(`   Sample answer: ${q.answer}`));
    }
    lines.push(" ");
  });
  lines.push("Generated from the ETrend Education Services Question Bank.");
  return lines;
}
function downloadPdf() {
  if (!selectedQuestions.value.length) return;

  // Build a small, dependency-free PDF with wrapped text and automatic page breaks.
  const lines = buildPdfLines();
  const pages = [];
  let page = [];
  lines.forEach(line => {
    wrapText(line, 88).forEach(wrapped => {
      if (page.length >= 48) {
        pages.push(page);
        page = [];
      }
      page.push(wrapped);
    });
  });
  if (page.length) pages.push(page);

  const objects = [];
  const pageObjectIds = [];
  const fontObjectId = 3;
  const contentStartId = 4;
  const pageStartId = contentStartId + pages.length;
  const catalogId = pageStartId + pages.length;
  const pagesId = catalogId + 1;

  objects[1] = "<< /Type /Catalog /Pages " + pagesId + " 0 R >>";
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  for (let i = 0; i < pages.length; i++) {
    const contentId = contentStartId + i;
    const pageId = pageStartId + i;
    pageObjectIds.push(pageId);
    const stream = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...pages[i].flatMap(line => [`(${escapePdfText(line)}) Tj`, "T*"]),
      "ET"
    ].join("\n");
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 2 0 R >> >> /Contents ${contentId} 0 R >>`;
  }
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  // The object array above uses IDs starting at 1; include a harmless font slot at 3.
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id++) {
    if (!objects[id]) continue;
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    pdf += offsets[id] ? `${String(offsets[id]).padStart(10, "0")} 00000 n \n` : "0000000000 00000 f \n";
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = `${selectedSubject.value}-${selectedTopic.value}-${questionType.value}`
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  link.href = url;
  link.download = `${safeName || "selected-questions"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
.options-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; padding: 11px 0 0 45px; font-size: 12px; line-height: 1.45; color: #253e59; }
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
  .options-grid { grid-template-columns: minmax(0, 1fr); padding-left: 45px; }
}
</style>
