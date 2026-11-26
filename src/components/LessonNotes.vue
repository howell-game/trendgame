
<template>
  <div class="lesson-library">
    <!-- HEADER -->
    <header class="library-header">
      <div>
        <span class="eyebrow">ETREND EDUCATION</span>
        <h1>Lesson Notes Library</h1>
        <p>Access and study your complete lesson notes in PDF format.</p>
      </div>

      <div class="header-icon">📚</div>
    </header>

    <!-- FILTERS -->
    <section class="filter-card">
      <h2>Find a Lesson Note</h2>

      <div class="filter-grid">
        <div class="filter-group">
          <label>Select Class</label>
          <select v-model="filters.className" @change="loadLessonNotes">
            <option value="">All Classes</option>
            <option v-for="item in classes" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Select Subject</label>
          <select v-model="filters.subject" @change="loadLessonNotes">
            <option value="">All Subjects</option>
            <option v-for="item in subjects" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Select Term</label>
          <select v-model="filters.term" @change="loadLessonNotes">
            <option value="">All Terms</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
        </div>

        <button
          class="search-button"
          @click="loadLessonNotes"
          :disabled="loading"
        >
          {{ loading ? "Searching..." : "Find Notes" }}
        </button>
      </div>
    </section>

    <!-- RESULTS -->
    <section class="results-section">
      <div class="results-heading">
        <div>
          <h2>Available Lesson Notes</h2>
          <p>
            {{ filteredNotes.length }}
            lesson note(s) found
          </p>
        </div>

        <button class="refresh-button" @click="loadLessonNotes">
          ↻ Refresh
        </button>
      </div>

      <div v-if="loading" class="status-message">
        <div class="loader"></div>
        <p>Loading lesson notes...</p>
      </div>

      <div v-else-if="errorMessage" class="status-message error">
        {{ errorMessage }}
        <button @click="loadLessonNotes">Try Again</button>
      </div>

      <div v-else-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No lesson notes found</h3>
        <p>
          There are currently no uploaded lesson notes matching your selection.
        </p>
      </div>

      <div v-else class="notes-grid">
        <article
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-card"
        >
          <div class="card-top">
            <div class="pdf-badge">PDF</div>
            <span class="available-label">Available</span>
          </div>

          <h3>{{ note.subject }}</h3>

          <div class="note-information">
            <div>
              <span>Class</span>
              <strong>{{ note.className }}</strong>
            </div>

            <div>
              <span>Term</span>
              <strong>{{ note.term }}</strong>
            </div>
          </div>

          <div class="file-information">
            <span class="file-symbol">📄</span>
            <span>
              {{ note.originalFileName || "Complete lesson note PDF" }}
            </span>
          </div>

          <div class="card-actions">
            <button
              class="read-button"
              @click="openReader(note)"
            >
              <span>📖</span> Read Lesson Note
            </button>

            <button
              class="download-button"
              @click="downloadPDF(note)"
            >
              <span>⬇</span> Download
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- PDF READER -->
    <div
      v-if="selectedNote"
      class="reader-overlay"
      @click.self="closeReader"
    >
      <div class="reader-window">
        <header class="reader-header">
          <div class="reader-title">
            <strong>{{ selectedNote.subject }}</strong>
            <span>
              {{ selectedNote.className }} · {{ selectedNote.term }}
            </span>
          </div>

          <div class="reader-actions">
            <button
              class="reader-download"
              @click="downloadPDF(selectedNote)"
            >
              ⬇ Download
            </button>

            <button
              class="fullscreen-button"
              @click="toggleFullscreen"
              :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
            >
              {{ isFullscreen ? "⛶ Exit" : "⛶ Fullscreen" }}
            </button>

            <button
              class="reader-close"
              @click="closeReader"
              aria-label="Close PDF reader"
            >
              ✕
            </button>
          </div>
        </header>

        <iframe
          v-if="selectedNote.pdfUrl"
          :src="readerUrl"
          class="pdf-viewer"
          title="ETrend lesson note PDF"
          allowfullscreen
        ></iframe>

        <div v-else class="reader-error">
          PDF document is unavailable.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LessonNotes",

  data() {
    return {
      apiBase: import.meta.env.VITE_APP_BASE_URL,

      classes: [
        "KG 1",
        "KG 2",
        "Nursery 1",
        "Nursery 2",
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6",
        "JSS 1",
        "JSS 2",
        "JSS 3",
        "SS 1",
        "SS 2",
        "SS 3",
      ],

      subjects: [
        "Mathematics",
        "English Language",
        "Basic Science",
        "Basic Technology",
        "Social Studies",
        "Civic Education",
        "Agricultural Science",
        "Computer Studies",
        "Business Studies",
        "Home Economics",
        "Physical and Health Education",
        "Christian Religious Studies",
        "Islamic Religious Studies",
        "Geography",
        "Biology",
        "Chemistry",
        "Physics",
        "Economics",
        "Government",
        "Literature in English",
        "Commerce",
        "Financial Accounting",
        "Further Mathematics",
      ],

      filters: {
        className: "",
        subject: "",
        term: "",
      },

      lessonNotes: [],
      loading: false,
      errorMessage: "",

      selectedNote: null,
      isFullscreen: false,
    };
  },

  computed: {
    filteredNotes() {
      return this.lessonNotes.filter((note) => {
        return (
          (!this.filters.className ||
            note.className === this.filters.className) &&
          (!this.filters.subject ||
            note.subject === this.filters.subject) &&
          (!this.filters.term ||
            note.term === this.filters.term)
        );
      });
    },

    readerUrl() {
      if (!this.selectedNote?.pdfUrl) return "";

      return this.selectedNote.pdfUrl + "#toolbar=1&navpanes=0&view=FitH";
    },
  },

  mounted() {
    this.loadLessonNotes();

    window.addEventListener("keydown", this.handleKeydown);
    document.addEventListener(
      "fullscreenchange",
      this.handleFullscreenChange
    );
  },

  beforeUnmount() {
    this.cleanupReader();
  },

  beforeDestroy() {
    this.cleanupReader();
  },

  methods: {
    async loadLessonNotes() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${this.apiBase}/api/lesson-note-pdfs`,
          {
            params: {
              className: this.filters.className || undefined,
              subject: this.filters.subject || undefined,
              term: this.filters.term || undefined,
            },
          }
        );

        this.lessonNotes = response.data.lessonNotes || [];
      } catch (error) {
        console.error("Lesson notes loading error:", error);

        this.errorMessage =
          error.response?.data?.message ||
          "Unable to load lesson notes. Please check your internet connection.";
      } finally {
        this.loading = false;
      }
    },

    openReader(note) {
      this.selectedNote = note;
      this.isFullscreen = false;
      document.body.style.overflow = "hidden";
    },

    closeReader() {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      this.selectedNote = null;
      this.isFullscreen = false;
      document.body.style.overflow = "";
    },

    async toggleFullscreen() {
      const reader = document.querySelector(".reader-window");

      if (!reader) return;

      try {
        if (!document.fullscreenElement) {
          await reader.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
      }
    },

    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement;
    },

    handleKeydown(event) {
      if (event.key === "Escape" && this.selectedNote) {
        if (!document.fullscreenElement) {
          this.closeReader();
        }
      }
    },

    cleanupReader() {
      window.removeEventListener("keydown", this.handleKeydown);

      document.removeEventListener(
        "fullscreenchange",
        this.handleFullscreenChange
      );

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      document.body.style.overflow = "";
    },

    downloadPDF(note) {
      if (!note?.pdfUrl) return;

      const link = document.createElement("a");

      link.href = note.pdfUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download =
        `${note.className}_${note.subject}_${note.term}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
.lesson-library {
  min-height: 100vh;
  padding: 25px;
  background: #fff9d9;
  color: #111;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.eyebrow {
  color: #168447;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
}

.library-header h1 {
  color: #003366;
  font-size: 28px;
  margin: 7px 0;
}

.library-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.header-icon {
  font-size: 42px;
}

.filter-card,
.results-section {
  background: #fffef8;
  border: 1px solid #e5dcae;
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 25px;
}

.filter-card h2,
.results-heading h2 {
  color: #003366;
  font-size: 19px;
  margin: 0 0 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 14px;
  align-items: end;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #003366;
  margin-bottom: 7px;
}

.filter-group select {
  width: 100%;
  height: 44px;
  padding: 0 10px;
  background: #fffef8;
  border: 1px solid #d8cda0;
  border-radius: 7px;
  color: #111;
  outline: none;
}

.filter-group select:focus {
  border-color: #003366;
}

.search-button {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 7px;
  background: #168447;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.results-heading h2 {
  margin-bottom: 5px;
}

.results-heading p {
  color: #777;
  font-size: 13px;
  margin: 0;
}

.refresh-button {
  background: #003366;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 9px 14px;
  font-weight: 700;
  cursor: pointer;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.note-card {
  border: 1px solid #e8e1c9;
  background: white;
  border-radius: 11px;
  padding: 17px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 30, 60, 0.08);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.pdf-badge {
  background: #ffeded;
  color: #c62828;
  font-weight: 900;
  font-size: 12px;
  padding: 9px 12px;
  border-radius: 7px;
}

.available-label {
  color: #168447;
  background: #edf8ed;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 9px;
  border-radius: 20px;
}

.note-card h3 {
  color: #003366;
  font-size: 18px;
  margin: 0 0 16px;
}

.note-information {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee8d7;
}

.note-information div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.note-information span {
  color: #888;
  font-size: 11px;
}

.note-information strong {
  color: #333;
  font-size: 13px;
}

.file-information {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #777;
  font-size: 11px;
  padding: 13px 0;
  overflow-wrap: anywhere;
}

.file-symbol {
  font-size: 18px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.read-button,
.download-button {
  flex: 1;
  border: none;
  border-radius: 7px;
  padding: 11px 8px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.read-button {
  background: #003366;
  color: white;
}

.download-button {
  background: #168447;
  color: white;
}

.status-message,
.empty-state {
  padding: 45px 15px;
  text-align: center;
  color: #777;
}

.status-message.error {
  color: #c62828;
}

.status-message button {
  display: block;
  margin: 12px auto 0;
  border: none;
  border-radius: 6px;
  background: #003366;
  color: white;
  padding: 9px 16px;
  cursor: pointer;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #e4e4e4;
  border-top-color: #003366;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 12px;
}

.empty-state h3 {
  color: #003366;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 13px;
  margin: 0;
}

.reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 20, 45, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.reader-window {
  width: 100%;
  max-width: 1200px;
  height: 95vh;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reader-header {
  min-height: 65px;
  background: #003366;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.reader-title {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.reader-title strong {
  font-size: 15px;
}

.reader-title span {
  font-size: 12px;
  opacity: 0.8;
}

.reader-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reader-download,
.fullscreen-button {
  border: none;
  border-radius: 6px;
  padding: 9px 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}

.reader-download {
  background: #168447;
  color: white;
}

.fullscreen-button {
  background: white;
  color: #003366;
}

.reader-close {
  background: #ffeded;
  color: #c62828;
  border: none;
  border-radius: 6px;
  width: 35px;
  height: 35px;
  font-size: 17px;
  cursor: pointer;
}

.pdf-viewer {
  flex: 1;
  width: 100%;
  border: none;
  background: #eee;
}

.reader-error {
  padding: 30px;
  text-align: center;
  color: #c62828;
}

@media (max-width: 950px) {
  .notes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .lesson-library {
    padding: 13px;
  }

  .library-header h1 {
    font-size: 22px;
  }

  .filter-card,
  .results-section {
    padding: 15px;
  }

  .filter-grid,
  .notes-grid {
    grid-template-columns: 1fr;
  }

  .search-button {
    width: 100%;
  }

  .reader-overlay {
    padding: 0;
  }

  .reader-window {
    height: 100vh;
    border-radius: 0;
  }

  .reader-header {
    flex-wrap: wrap;
  }

  .reader-actions {
    gap: 5px;
  }

  .reader-download,
  .fullscreen-button {
    padding: 8px;
    font-size: 11px;
  }
}
</style>
