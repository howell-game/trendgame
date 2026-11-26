
<template>
  <div class="lesson-admin">
    <div class="page-header">
      <div>
        <h1>ETrend Lesson Notes</h1>
        <p>Upload and manage complete PDF lesson notes.</p>
      </div>
      <div class="header-icon">📚</div>
    </div>

    <!-- UPLOAD FORM -->
    <section class="upload-card">
      <div class="section-heading">
        <div>
          <h2>Upload Lesson Note</h2>
          <p>One PDF per subject, class and term.</p>
        </div>
        <span class="pdf-label">PDF ONLY</span>
      </div>

      <form @submit.prevent="uploadLessonNote">
        <div class="form-grid">
          <div class="form-group">
            <label>Class</label>
            <input
              v-model.trim="form.className"
              type="text"
              placeholder="e.g. JSS 1"
              required
            />
          </div>

          <div class="form-group">
            <label>Subject</label>
            <input
              v-model.trim="form.subject"
              type="text"
              placeholder="e.g. Mathematics"
              required
            />
          </div>

          <div class="form-group">
            <label>Term</label>
            <select v-model="form.term" required>
              <option value="">Select term</option>
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>

        <div class="file-section">
          <label class="file-label">Select Lesson Note PDF</label>

          <label class="file-picker">
            <input
              type="file"
              accept="application/pdf,.pdf"
              @change="handleFile"
            />

            <span class="file-icon">📄</span>

            <span class="file-text">
              <strong>
                {{ selectedFile ? selectedFile.name : "Choose a PDF file" }}
              </strong>
              <small>
                {{ selectedFile ? formatSize(selectedFile.size) : "Maximum file size: 25MB" }}
              </small>
            </span>

            <span class="browse-button">Browse</span>
          </label>

          <p v-if="fileError" class="error-message">
            {{ fileError }}
          </p>
        </div>

        <div v-if="matchingNote" class="replacement-warning">
          <strong>Existing lesson note found</strong>
          <p>
            A lesson note already exists for
            {{ form.subject }}, {{ form.className }},
            {{ form.term }}.
          </p>
          <p>
            Uploading this PDF will replace the existing lesson note.
          </p>
        </div>

        <div v-if="uploadError" class="error-message main-error">
          {{ uploadError }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="upload-actions">
          <button
            type="submit"
            class="upload-button"
            :disabled="uploading || !selectedFile"
          >
            <span v-if="uploading">
              Uploading... {{ uploadProgress }}%
            </span>
            <span v-else>
              {{ matchingNote ? "Replace Lesson Note" : "Upload Lesson Note" }}
            </span>
          </button>

          <button
            type="button"
            class="reset-button"
            @click="resetForm"
            :disabled="uploading"
          >
            Clear
          </button>
        </div>

        <div v-if="uploading" class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </form>
    </section>

    <!-- EXISTING LESSON NOTES -->
    <section class="records-card">
      <div class="records-heading">
        <div>
          <h2>Uploaded Lesson Notes</h2>
          <p>{{ lessonNotes.length }} lesson note(s) available</p>
        </div>

        <button
          class="refresh-button"
          @click="loadLessonNotes"
          :disabled="loading"
        >
          {{ loading ? "Loading..." : "↻ Refresh" }}
        </button>
      </div>

      <div class="search-filters">
        <input
          v-model="filters.className"
          placeholder="Filter by class"
          @input="applyLocalFilters"
        />

        <input
          v-model="filters.subject"
          placeholder="Filter by subject"
          @input="applyLocalFilters"
        />

        <select
          v-model="filters.term"
          @change="applyLocalFilters"
        >
          <option value="">All terms</option>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>

      <div v-if="loading" class="empty-state">
        Loading lesson notes...
      </div>

      <div v-else-if="loadError" class="empty-state error-message">
        {{ loadError }}
      </div>

      <div v-else-if="filteredNotes.length === 0" class="empty-state">
        No lesson notes found.
      </div>

      <div v-else class="notes-list">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-row"
        >
          <div class="pdf-icon">PDF</div>

          <div class="note-details">
            <strong>{{ note.subject }}</strong>
            <span>{{ note.className }} · {{ note.term }}</span>
            <small>{{ note.originalFileName || "Lesson note PDF" }}</small>
          </div>

          <div class="note-actions">
            <button
              class="view-button"
              @click="viewPDF(note)"
            >
              View
            </button>

            <button
              class="download-button"
              @click="downloadPDF(note)"
            >
              Download
            </button>

            <button
              class="delete-button"
              @click="deleteLessonNote(note)"
              :disabled="deletingId === note.id"
            >
              {{ deletingId === note.id ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- PDF PREVIEW -->
    <div
      v-if="previewNote"
      class="preview-overlay"
      @click.self="closePreview"
    >
      <div class="preview-modal">
        <div class="preview-header">
          <div>
            <strong>{{ previewNote.subject }}</strong>
            <span>
              {{ previewNote.className }} · {{ previewNote.term }}
            </span>
          </div>

          <div class="preview-header-actions">
            <button
              @click="downloadPDF(previewNote)"
              class="download-button"
            >
              Download
            </button>

            <button @click="closePreview" class="close-button">
              ✕
            </button>
          </div>
        </div>

        <iframe
          :src="previewUrl"
          class="pdf-frame"
          title="Lesson note PDF preview"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddLessonNotePDF",

  data() {
    return {
      apiBase: import.meta.env.VITE_APP_BASE_URL,

      form: {
        className: "",
        subject: "",
        term: "",
      },

      selectedFile: null,
      fileError: "",
      uploadError: "",
      successMessage: "",

      uploading: false,
      uploadProgress: 0,

      lessonNotes: [],
      filteredNotes: [],

      filters: {
        className: "",
        subject: "",
        term: "",
      },

      loading: false,
      loadError: "",
      deletingId: null,

      previewNote: null,
    };
  },

  computed: {
    matchingNote() {
      if (
        !this.form.className ||
        !this.form.subject ||
        !this.form.term
      ) {
        return null;
      }

      return this.lessonNotes.find((note) =>
        note.className?.trim().toLowerCase() ===
          this.form.className.trim().toLowerCase() &&
        note.subject?.trim().toLowerCase() ===
          this.form.subject.trim().toLowerCase() &&
        note.term?.trim().toLowerCase() ===
          this.form.term.trim().toLowerCase()
      );
    },

    previewUrl() {
      if (!this.previewNote?.pdfUrl) return "";

      return this.previewNote.pdfUrl + "#toolbar=1&navpanes=0";
    },
  },

  mounted() {
    this.loadLessonNotes();
  },

  methods: {
    async loadLessonNotes() {
      this.loading = true;
      this.loadError = "";

      try {
        const response = await axios.get(
          `${this.apiBase}/api/lesson-note-pdfs`
        );

        this.lessonNotes = response.data.lessonNotes || [];
        this.applyLocalFilters();
      } catch (error) {
        console.error("Load lesson notes:", error);

        this.loadError =
          error.response?.data?.message ||
          "Unable to load lesson notes.";
      } finally {
        this.loading = false;
      }
    },

    applyLocalFilters() {
      const className = this.filters.className.trim().toLowerCase();
      const subject = this.filters.subject.trim().toLowerCase();
      const term = this.filters.term.trim().toLowerCase();

      this.filteredNotes = this.lessonNotes.filter((note) => {
        return (
          (!className ||
            note.className?.toLowerCase().includes(className)) &&
          (!subject ||
            note.subject?.toLowerCase().includes(subject)) &&
          (!term ||
            note.term?.toLowerCase() === term)
        );
      });
    },

    handleFile(event) {
      this.fileError = "";
      this.selectedFile = null;

      const file = event.target.files?.[0];

      if (!file) return;

      const isPDF =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPDF) {
        this.fileError = "Please select a PDF file.";
        event.target.value = "";
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        this.fileError = "PDF file must not exceed 25MB.";
        event.target.value = "";
        return;
      }

      this.selectedFile = file;
    },

    async uploadLessonNote() {
      this.uploadError = "";
      this.successMessage = "";

      if (
        !this.form.className ||
        !this.form.subject ||
        !this.form.term
      ) {
        this.uploadError = "Please complete all the required fields.";
        return;
      }

      if (!this.selectedFile) {
        this.uploadError = "Please select a PDF file.";
        return;
      }

      if (this.matchingNote) {
        const confirmed = window.confirm(
          `A lesson note already exists for ${this.form.subject}, ` +
          `${this.form.className}, ${this.form.term}.\n\n` +
          "Uploading this PDF will replace the existing lesson note. Continue?"
        );

        if (!confirmed) return;
      }

      const formData = new FormData();

      formData.append("subject", this.form.subject.trim());
      formData.append("className", this.form.className.trim());
      formData.append("term", this.form.term);
      formData.append("pdf", this.selectedFile);

      this.uploading = true;
      this.uploadProgress = 0;

      try {
        const response = await axios.post(
          `${this.apiBase}/api/lesson-note-pdfs`,
          formData,
          {
            onUploadProgress: (event) => {
              if (event.total) {
                this.uploadProgress = Math.round(
                  (event.loaded * 100) / event.total
                );
              }
            },
          }
        );

        this.successMessage =
          response.data.message || "Lesson note uploaded successfully.";

        this.resetForm();
        await this.loadLessonNotes();
      } catch (error) {
        console.error("Upload lesson note:", error);

        this.uploadError =
          error.response?.data?.message ||
          "Unable to upload lesson note. Please try again.";
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },

    resetForm() {
      this.form = {
        className: "",
        subject: "",
        term: "",
      };

      this.selectedFile = null;
      this.fileError = "";

      const fileInput = this.$el?.querySelector(
        'input[type="file"]'
      );

      if (fileInput) fileInput.value = "";
    },

    viewPDF(note) {
      this.previewNote = note;
    },

    closePreview() {
      this.previewNote = null;
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

    async deleteLessonNote(note) {
      const confirmed = window.confirm(
        `Are you sure you want to delete the ${note.subject} ` +
        `lesson note for ${note.className}, ${note.term}?`
      );

      if (!confirmed) return;

      this.deletingId = note.id;

      try {
        await axios.delete(
          `${this.apiBase}/api/lesson-note-pdfs/${note.id}`
        );

        if (this.previewNote?.id === note.id) {
          this.closePreview();
        }

        this.successMessage = "Lesson note deleted successfully.";

        await this.loadLessonNotes();
      } catch (error) {
        console.error("Delete lesson note:", error);

        alert(
          error.response?.data?.message ||
          "Unable to delete lesson note."
        );
      } finally {
        this.deletingId = null;
      }
    },

    formatSize(bytes) {
      if (!bytes) return "";

      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    },
  },
};
</script>

<style scoped>
.lesson-admin {
  min-height: 100vh;
  padding: 25px;
  background: #fff9d9;
  color: #111;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h1 {
  color: #003366;
  font-size: 27px;
  margin: 0 0 7px;
}

.page-header p,
.section-heading p,
.records-heading p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.header-icon {
  font-size: 38px;
}

.upload-card,
.records-card {
  background: #fffef8;
  border: 1px solid #e5dcae;
  border-radius: 15px;
  padding: 24px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 30, 60, 0.05);
}

.section-heading,
.records-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 23px;
}

.section-heading h2,
.records-heading h2 {
  color: #003366;
  font-size: 20px;
  margin: 0 0 6px;
}

.pdf-label {
  background: #ffeded;
  color: #c62828;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.form-group label,
.file-label {
  display: block;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
  color: #003366;
}

.form-group input,
.form-group select,
.search-filters input,
.search-filters select {
  width: 100%;
  height: 45px;
  border: 1px solid #d8cda0;
  background: #fffef8;
  border-radius: 8px;
  padding: 0 12px;
  outline: none;
  color: #111;
}

.form-group input:focus,
.form-group select:focus,
.search-filters input:focus,
.search-filters select:focus {
  border-color: #003366;
}

.file-section {
  margin-top: 23px;
}

.file-picker {
  min-height: 85px;
  border: 2px dashed #b7c7d8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 15px;
  cursor: pointer;
  background: #f7fbff;
}

.file-picker input {
  display: none;
}

.file-icon {
  font-size: 30px;
}

.file-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.file-text strong {
  color: #003366;
  font-size: 14px;
}

.file-text small {
  color: #777;
}

.browse-button {
  background: #003366;
  color: white;
  padding: 9px 15px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.replacement-warning {
  background: #fff4d9;
  border: 1px solid #e7c56c;
  border-radius: 8px;
  padding: 14px;
  margin-top: 18px;
  color: #684900;
  font-size: 13px;
}

.replacement-warning p {
  margin: 7px 0 0;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}

.upload-button,
.reset-button,
.refresh-button,
.view-button,
.download-button,
.delete-button {
  border: none;
  border-radius: 7px;
  padding: 11px 16px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

.upload-button {
  background: #168447;
  color: white;
  min-width: 190px;
}

.upload-button:hover {
  background: #106b38;
}

.upload-button:disabled,
.reset-button:disabled,
.delete-button:disabled,
.refresh-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.reset-button {
  background: #e9edf2;
  color: #333;
}

.progress-track {
  height: 7px;
  background: #e3e8ed;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 15px;
}

.progress-fill {
  height: 100%;
  background: #168447;
  transition: width 0.2s;
}

.success-message {
  background: #edf8ed;
  color: #176b35;
  padding: 12px;
  border-radius: 7px;
  margin-top: 15px;
  font-size: 13px;
}

.error-message {
  color: #c62828;
  font-size: 13px;
  margin-top: 9px;
}

.main-error {
  background: #ffeded;
  padding: 12px;
  border-radius: 7px;
}

.refresh-button {
  background: #003366;
  color: white;
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.notes-list {
  display: flex;
  flex-direction: column;
}

.note-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 0;
  border-bottom: 1px solid #eee6ca;
}

.pdf-icon {
  width: 43px;
  height: 48px;
  display: grid;
  place-items: center;
  background: #ffeded;
  color: #c62828;
  font-size: 12px;
  font-weight: 900;
  border-radius: 7px;
}

.note-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.note-details strong {
  color: #003366;
  font-size: 14px;
}

.note-details span {
  font-size: 13px;
  color: #444;
}

.note-details small {
  font-size: 11px;
  color: #888;
  overflow-wrap: anywhere;
}

.note-actions {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.view-button {
  background: #003366;
  color: white;
}

.download-button {
  background: #168447;
  color: white;
}

.delete-button {
  background: #ffeded;
  color: #c62828;
}

.empty-state {
  padding: 35px 10px;
  text-align: center;
  color: #777;
  font-size: 14px;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 25, 50, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-modal {
  width: 100%;
  max-width: 1100px;
  height: 94vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  min-height: 65px;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #003366;
  color: white;
}

.preview-header > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-header span {
  font-size: 12px;
  opacity: 0.8;
}

.preview-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.close-button {
  border: none;
  background: #fff;
  color: #003366;
  border-radius: 6px;
  width: 35px;
  height: 35px;
  font-size: 18px;
  cursor: pointer;
}

.pdf-frame {
  width: 100%;
  flex: 1;
  border: none;
}

@media (max-width: 750px) {
  .lesson-admin {
    padding: 14px;
  }

  .upload-card,
  .records-card {
    padding: 16px;
  }

  .form-grid,
  .search-filters {
    grid-template-columns: 1fr;
  }

  .note-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .note-details {
    flex-basis: calc(100% - 65px);
  }

  .note-actions {
    width: 100%;
    padding-left: 57px;
  }

  .section-heading h2,
  .records-heading h2 {
    font-size: 17px;
  }

  .preview-overlay {
    padding: 5px;
  }

  .preview-modal {
    height: 98vh;
  }

  .preview-header {
    align-items: flex-start;
  }
}
</style>
