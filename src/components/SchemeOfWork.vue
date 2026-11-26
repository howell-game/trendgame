
<template>
  <div class="scheme-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← Back</button>

      <h2>Scheme of Work</h2>
      <p>Load and view your school's Scheme of Work.</p>
    </div>

    <!-- SEARCH FILTERS -->
    <div class="search-card">
      <h3>Select Scheme Details</h3>

      <div class="filters-grid">
        <div class="form-group">
          <label>Academic Session</label>
          <input
            v-model.trim="filters.academicSession"
            type="text"
            placeholder="e.g. 2026/2027"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label>Term</label>
          <select v-model="filters.term">
            <option value="">Select Term</option>
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>

        <div class="form-group">
          <label>Class</label>
          <input
            v-model.trim="filters.className"
            type="text"
            placeholder="e.g. JSS1"
            maxlength="30"
          />
        </div>

        <div class="form-group">
          <label>Subject</label>
          <input
            v-model.trim="filters.subject"
            type="text"
            placeholder="e.g. Mathematics"
            maxlength="100"
          />
        </div>
      </div>

      <button
        class="load-btn"
        @click="loadScheme"
        :disabled="loading"
      >
        {{ loading ? "Loading Scheme..." : "Load Scheme" }}
      </button>
    </div>

    <!-- ERROR MESSAGE -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- PDF VIEWER -->
    <div v-if="scheme && pdfUrl" class="pdf-section">

      <div class="pdf-header">
        <div>
          <h3>{{ scheme.subject }} — {{ scheme.class }}</h3>

          <p>
            {{ scheme.academicSession }} |
            {{ scheme.term }}
          </p>
        </div>

        <button
          class="download-btn"
          @click="downloadPDF"
          :disabled="downloading"
        >
          {{ downloading ? "Preparing Download..." : "↓ Download PDF" }}
        </button>
      </div>

      <div class="pdf-viewer">
        <iframe
          :src="pdfUrl"
          title="Scheme of Work PDF"
          width="100%"
          height="750"
        ></iframe>
      </div>

    </div>

    <!-- EMPTY STATE -->
    <div
      v-else-if="!loading && !errorMessage"
      class="empty-state"
    >
      <div class="empty-icon">📄</div>
      <h3>No Scheme Loaded</h3>
      <p>
        Select the academic session, term, class and subject,
        then click Load Scheme to view the document.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SchemeOfWork",

  data() {
    return {
      filters: {
        academicSession: "",
        term: "",
        className: "",
        subject: "",
      },

      scheme: null,
      pdfUrl: "",
      loading: false,
      downloading: false,
      errorMessage: "",
    };
  },

  created() {
    // Accept details passed from the previous page.
    const query = this.$route.query;

    this.filters.academicSession =
      query.academicSession || "2026/2027";

    this.filters.term = query.term || "";

    this.filters.className =
      query.className || query.class || "";

    this.filters.subject = query.subject || "";
  },

  methods: {
    async loadScheme() {
      this.errorMessage = "";
      this.scheme = null;
      this.pdfUrl = "";

      const {
        academicSession,
        term,
        className,
        subject,
      } = this.filters;

      if (
        !academicSession ||
        !term ||
        !className ||
        !subject
      ) {
        this.errorMessage =
          "Please select or enter the academic session, term, class and subject.";

        return;
      }

      this.loading = true;

      try {
        const baseUrl = (
          import.meta.env.VITE_APP_BASE_URL || ""
        ).replace(/\/+$/, "");

        const params = new URLSearchParams({
          academicSession,
          term,
          class: className,
          subject,
        });

        const response = await fetch(
          `${baseUrl}/api/schemes-of-work?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Scheme of Work not found."
          );
        }

        if (!result.scheme || !result.scheme.pdfUrl) {
          throw new Error(
            "No PDF has been uploaded for this Scheme of Work."
          );
        }

        this.scheme = result.scheme;
        this.pdfUrl = result.scheme.pdfUrl;

      } catch (error) {
        console.error("LOAD SCHEME ERROR:", error);
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    },

    async downloadPDF() {
      if (!this.scheme || !this.scheme.id) {
        this.errorMessage = "No Scheme of Work is currently loaded.";
        return;
      }

      this.downloading = true;

      try {
        const baseUrl = (
          import.meta.env.VITE_APP_BASE_URL || ""
        ).replace(/\/+$/, "");

        const downloadUrl =
          `${baseUrl}/api/schemes-of-work/download/${this.scheme.id}`;

        const response = await fetch(downloadUrl);

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));

          throw new Error(
            result.message || "Unable to download PDF."
          );
        }

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = objectUrl;

        link.download = [
          this.scheme.class,
          this.scheme.subject,
          this.scheme.term,
          "Scheme-of-Work",
        ].join("-") + ".pdf";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(objectUrl);

      } catch (error) {
        console.error("DOWNLOAD SCHEME ERROR:", error);
        this.errorMessage = error.message;
      } finally {
        this.downloading = false;
      }
    },

    goBack() {
      this.$router.push("/teacher");
    },
  },
};
</script>

<style scoped>
.scheme-page {
  max-width: 1150px;
  margin: 25px auto;
  padding: 18px;
  color: #222;
}

.page-header {
  margin-bottom: 25px;
}

.page-header h2 {
  color: #173b65;
  margin: 18px 0 7px;
}

.page-header p {
  color: #666;
}

.back-btn {
  border: none;
  background: #eef2f7;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.search-card {
  background: #fff;
  padding: 25px;
  border: 1px solid #e1e6ed;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

.search-card h3 {
  margin-top: 0;
  margin-bottom: 22px;
  color: #173b65;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
}

.form-group input,
.form-group select {
  height: 45px;
  padding: 10px 12px;
  border: 1px solid #ccd4df;
  border-radius: 6px;
  font-size: 15px;
  background: #fff;
  box-sizing: border-box;
}

.load-btn {
  margin-top: 25px;
  padding: 13px 25px;
  background: #173b65;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pdf-section {
  margin-top: 30px;
  background: white;
  border: 1px solid #e1e6ed;
  border-radius: 10px;
  overflow: hidden;
}

.pdf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #e1e6ed;
}

.pdf-header h3 {
  color: #173b65;
  margin: 0 0 7px;
}

.pdf-header p {
  margin: 0;
  color: #666;
}

.download-btn {
  background: #168344;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pdf-viewer {
  background: #e9edf2;
  padding: 10px;
}

.pdf-viewer iframe {
  display: block;
  border: none;
  background: white;
  border-radius: 5px;
}

.error-message {
  margin-top: 20px;
  padding: 14px;
  background: #fff0f0;
  color: #b42318;
  border: 1px solid #f2b8b5;
  border-radius: 6px;
  font-weight: 600;
}

.empty-state {
  margin-top: 30px;
  padding: 50px 20px;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
}

.empty-icon {
  font-size: 45px;
}

.empty-state h3 {
  color: #173b65;
}

.empty-state p {
  color: #666;
  max-width: 500px;
  margin: auto;
  line-height: 1.6;
}

@media (max-width: 650px) {
  .scheme-page {
    padding: 12px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .pdf-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pdf-viewer iframe {
    height: 550px;
  }

  .download-btn {
    width: 100%;
  }
}
</style>
