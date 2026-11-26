
<template>
  <div class="add-scheme-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← Back</button>
      <h2>Upload Scheme of Work</h2>
      <p>Upload a prepared Scheme of Work as a PDF document.</p>
    </div>

    <form class="scheme-form" @submit.prevent="saveScheme">
      <div class="form-grid">
        <div class="form-group">
          <label>Academic Session</label>
          <input
            v-model.trim="form.academicSession"
            type="text"
            placeholder="e.g. 2026/2027"
            maxlength="20"
            required
          />
        </div>

        <div class="form-group">
          <label>Term</label>
          <select v-model="form.term" required>
            <option value="">Select Term</option>
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>

        <div class="form-group">
          <label>Class</label>
          <input
            v-model.trim="form.className"
            type="text"
            placeholder="e.g. JSS1"
            maxlength="30"
            required
          />
        </div>

        <div class="form-group">
          <label>Subject</label>
          <input
            v-model.trim="form.subject"
            type="text"
            placeholder="e.g. Mathematics"
            maxlength="100"
            required
          />
        </div>
      </div>

      <div class="upload-section">
        <label class="upload-label">Scheme of Work PDF</label>

        <div class="upload-box">
          <div class="upload-icon">📄</div>
          <h3>Select PDF Document</h3>
          <p>Choose the prepared Scheme of Work from your computer.</p>

          <input
            ref="pdfInput"
            type="file"
            accept=".pdf,application/pdf"
            @change="handleFile"
          />

          <div v-if="selectedFile" class="selected-file">
            <span>📎 {{ selectedFile.name }}</span>
            <button type="button" @click="removeFile">Remove</button>
          </div>

          <small>PDF only. Maximum file size: 20 MB.</small>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="success-message">
        {{ successMessage }}
      </p>

      <button
        type="submit"
        class="submit-btn"
        :disabled="loading"
      >
        {{ loading ? "Uploading PDF..." : "Upload Scheme of Work" }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "AddScheme",

  data() {
    return {
      form: {
        academicSession: "2026/2027",
        term: "",
        className: "",
        subject: "",
      },

      selectedFile: null,
      loading: false,
      errorMessage: "",
      successMessage: "",
    };
  },

  methods: {
    handleFile(event) {
      this.errorMessage = "";

      const file = event.target.files[0];

      if (!file) {
        this.selectedFile = null;
        return;
      }

      if (
        file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        this.errorMessage = "Please select a valid PDF document.";
        this.removeFile();
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        this.errorMessage = "PDF must not exceed 20 MB.";
        this.removeFile();
        return;
      }

      this.selectedFile = file;
    },

    removeFile() {
      this.selectedFile = null;

      if (this.$refs.pdfInput) {
        this.$refs.pdfInput.value = "";
      }
    },

    async saveScheme() {
      this.errorMessage = "";
      this.successMessage = "";

      if (
        !this.form.academicSession ||
        !this.form.term ||
        !this.form.className ||
        !this.form.subject
      ) {
        this.errorMessage = "Please complete all scheme details.";
        return;
      }

      if (!this.selectedFile) {
        this.errorMessage = "Please select a Scheme of Work PDF.";
        return;
      }

      const formData = new FormData();

      formData.append(
        "academicSession",
        this.form.academicSession
      );

      formData.append("term", this.form.term);
      formData.append("className", this.form.className);
      formData.append("subject", this.form.subject);
      formData.append("pdf", this.selectedFile);

      this.loading = true;

      try {
        const baseUrl = (
          import.meta.env.VITE_APP_BASE_URL || ""
        ).replace(/\/+$/, "");

        const response = await fetch(
          `${baseUrl}/api/schemes-of-work`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to upload Scheme of Work."
          );
        }

        this.successMessage =
          result.message || "Scheme uploaded successfully.";

        const savedDetails = {
          academicSession: this.form.academicSession,
          term: this.form.term,
          class: this.form.className,
          subject: this.form.subject,
        };

        // Navigate after a successful upload.
        this.$router.push({
          path: "/scheme-of-work",
          query: savedDetails,
        });

      } catch (error) {
        console.error("SCHEME UPLOAD ERROR:", error);
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push("/adminpage");
    },
  },
};
</script>

<style scoped>
.add-scheme-page {
  max-width: 850px;
  margin: 30px auto;
  padding: 20px;
  color: #222;
}

.page-header {
  margin-bottom: 25px;
}

.page-header h2 {
  margin: 18px 0 8px;
  color: #173b65;
}

.page-header p {
  color: #666;
}

.back-btn {
  background: #eef2f7;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.scheme-form {
  background: #fff;
  border: 1px solid #e2e7ed;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label,
.upload-label {
  font-weight: 700;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  height: 45px;
  padding: 10px 12px;
  border: 1px solid #ccd4df;
  border-radius: 6px;
  background: #fff;
  font-size: 15px;
}

.upload-section {
  margin-top: 30px;
}

.upload-label {
  display: block;
  margin-bottom: 10px;
}

.upload-box {
  border: 2px dashed #aebdce;
  background: #f8fafc;
  border-radius: 10px;
  padding: 30px 15px;
  text-align: center;
}

.upload-icon {
  font-size: 40px;
}

.upload-box h3 {
  margin: 10px 0;
  color: #173b65;
}

.upload-box p {
  color: #666;
}

.upload-box input[type="file"] {
  display: block;
  max-width: 100%;
  margin: 20px auto;
}

.upload-box small {
  color: #777;
}

.selected-file {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
  color: #176b3a;
  font-weight: 600;
}

.selected-file button {
  border: none;
  background: #fee2e2;
  color: #b42318;
  padding: 7px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  margin-top: 25px;
  padding: 15px;
  background: #168344;
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #8cae9b;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  color: #c62828;
  font-weight: 600;
}

.success-message {
  margin-top: 15px;
  color: #168344;
  font-weight: 600;
}

@media (max-width: 600px) {
  .add-scheme-page {
    padding: 12px;
    margin: 15px auto;
  }

  .scheme-form {
    padding: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
