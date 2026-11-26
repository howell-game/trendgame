
<template>
  <div class="payroll-page">
    <div class="payroll-container">
      <header class="topbar">
        <button
          type="button"
          class="back-button"
          @click="router.push('/proprietor')"
        >
          <span>←</span> Dashboard
        </button>

        <div class="brand">
          <div class="brand-logo">E</div>
          <div>
            <strong>ETrend Education</strong>
            <small>Proprietor Portal</small>
          </div>
        </div>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">STAFF PAYMENT CENTRE</span>
          <h1>Bulk Salary Pay</h1>
          <p>
            Manage teacher bank details, prepare salary batches,
            and review every amount before proceeding.
          </p>

          <div class="hero-note">
            <span>✓</span>
            Save verified teacher details and reuse them for future payrolls.
          </div>
        </div>

        <div class="hero-icon" aria-hidden="true">₦</div>
      </section>

      <div class="demo-notice">
        <span class="notice-icon">i</span>
        <div>
          <strong>Secure payroll processing</strong>
          <p>
            Verify every teacher's account and salary before proceeding.
            Creating a draft does not transfer money. Transfers begin only
            after you explicitly confirm payment.
          </p>
        </div>
      </div>

      <section class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">♙</div>
          <div>
            <span>Teachers in this list</span>
            <strong>{{ teachers.length }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">✓</div>
          <div>
            <span>Selected teachers</span>
            <strong>{{ selectedCount }}</strong>
          </div>
        </div>

        <div class="summary-card total-card">
          <div class="summary-icon">₦</div>
          <div>
            <span>Selected salary total</span>
            <strong>{{ money(selectedTotal) }}</strong>
          </div>
        </div>
      </section>

      <!-- Add teacher -->
      <section class="content-card">
        <div class="section-title">
          <div class="section-symbol">＋</div>
          <div>
            <h2>Add teacher payment details</h2>
            <p>
              Verify the bank account before saving the teacher.
            </p>
          </div>
        </div>

        <form class="teacher-form" @submit.prevent="addTeacher">
          <div class="form-grid">
            <label class="field">
              <span>Teacher's full name <b>*</b></span>
              <input
                v-model.trim="form.name"
                type="text"
                maxlength="150"
                placeholder="e.g. Grace Okafor"
                autocomplete="name"
                required
              />
            </label>

            <label class="field bank-field">
              <span>Bank <b>*</b></span>

              <input
                v-model="bankSearch"
                type="text"
                placeholder="Start typing a bank name..."
                autocomplete="off"
                required
                @focus="showBankSuggestions = true"
                @input="selectBankFromSearch"
              />

              <div v-if="banksLoading" class="bank-help">
                Loading available banks...
              </div>

              <div v-else-if="banksError" class="bank-error">
                {{ banksError }}
                <button type="button" @click="loadBanks">
                  Retry
                </button>
              </div>

              <div
                v-else-if="
                  showBankSuggestions &&
                  bankSearch.trim() &&
                  !selectedBank &&
                  bankSuggestions.length
                "
                class="bank-suggestions"
              >
                <button
                  v-for="bank in bankSuggestions"
                  :key="bank.code"
                  type="button"
                  class="bank-suggestion"
                  @click="chooseBank(bank)"
                >
                  <span>{{ bank.name }}</span>
                  <small>{{ bank.code }}</small>
                </button>
              </div>

              <div
                v-else-if="
                  showBankSuggestions &&
                  bankSearch.trim() &&
                  !selectedBank &&
                  !banksLoading &&
                  !banksError
                "
                class="bank-help"
              >
                No matching bank found.
              </div>

              <div v-if="selectedBank" class="selected-bank">
                Selected bank:
                <strong>{{ selectedBank.name }}</strong>
              </div>
            </label>

            <label class="field">
              <span>Account number <b>*</b></span>
              <input
                v-model="form.accountNumber"
                type="text"
                inputmode="numeric"
                maxlength="10"
                placeholder="10-digit account number"
                autocomplete="off"
                required
                @input="
                  form.accountNumber =
                    form.accountNumber.replace(/\D/g, '').slice(0, 10)
                "
              />
              <small>
                Enter the teacher's 10-digit account number.
              </small>
            </label>

            <label class="field">
              <span>Salary amount (₦) <b>*</b></span>
              <input
                v-model.number="form.salary"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 85000"
                required
              />
              <small>
                Proposed salary for this payroll.
              </small>
            </label>
          </div>

          <div class="verification-panel">
            <div class="verification-icon">✓</div>

            <div class="verification-copy">
              <strong>Verify bank account</strong>
              <p>
                Confirm the account name returned by the bank verification
                service before saving the teacher.
              </p>
            </div>

            <button
              type="button"
              class="secondary-button"
              :disabled="
                resolvingAccount ||
                !canResolveAccount ||
                savingTeacher
              "
              @click="resolveAccount"
            >
              {{
                resolvingAccount
                  ? "Verifying..."
                  : "Resolve account"
              }}
            </button>
          </div>

          <div
            v-if="verifiedAccountName"
            class="verified-account"
            role="status"
          >
            <span>✓</span>
            <div>
              <strong>{{ verifiedAccountName }}</strong>
              <small>
                Account name returned by the verification service.
              </small>
            </div>
          </div>

          <p
            v-if="accountResolutionError"
            class="inline-notice"
            role="alert"
          >
            {{ accountResolutionError }}
          </p>

          <p
            v-if="showResolveNotice && verifiedAccountName"
            class="inline-notice"
          >
            Account verification succeeded. You can now save this teacher.
          </p>

          <div class="form-actions">
            <button
              type="button"
              class="cancel-button"
              :disabled="savingTeacher || resolvingAccount"
              @click="resetForm"
            >
              Clear form
            </button>

            <button
              type="submit"
              class="primary-button"
              :disabled="
                savingTeacher ||
                resolvingAccount ||
                !verifiedAccountName ||
                !selectedBank
              "
            >
              {{
                savingTeacher
                  ? "Saving teacher..."
                  : "+ Save teacher"
              }}
            </button>
          </div>
        </form>
      </section>

      <!-- Saved teachers -->
      <section class="content-card teachers-card">
        <div class="list-heading">
          <div class="section-title">
            <div class="section-symbol">♙</div>
            <div>
              <h2>Teachers' payroll list</h2>
              <p>
                Select the teachers to include in your payroll batch.
              </p>
            </div>
          </div>

          <button
            v-if="teachers.length"
            type="button"
            class="text-button"
            :disabled="payrollSubmitting || payrollExecuting"
            @click="selectAll"
          >
            {{
              selectedCount === teachers.length
                ? "Deselect all"
                : "Select all"
            }}
          </button>
        </div>

        <div v-if="!teachers.length" class="empty-state">
          <div class="empty-icon">♙</div>
          <h3>No teachers added yet</h3>
          <p>
            Verify and save a teacher using the form above. Saved
            teachers will be available for future payrolls.
          </p>
        </div>

        <div v-else class="teacher-list">
          <article
            v-for="teacher in teachers"
            :key="teacher.id"
            class="teacher-row"
            :class="{ 'is-selected': teacher.selected }"
          >
            <label
              class="select-control"
              :aria-label="`Select ${teacher.name}`"
            >
              <input
                v-model="teacher.selected"
                type="checkbox"
                :disabled="payrollSubmitting || payrollExecuting"
                :aria-label="`Include ${teacher.name} in payroll`"
              />
            </label>

            <div class="teacher-avatar">
              {{ initials(teacher.name) }}
            </div>

            <div class="teacher-info">
              <strong>{{ teacher.name }}</strong>
              <span>{{ teacher.bank || teacher.bankName }}</span>

              <small>
                Account: {{ maskAccount(teacher.accountNumber) }}
              </small>

              <small v-if="teacher.accountName">
                Verified name: {{ teacher.accountName }}
              </small>
            </div>

            <div class="salary-control">
              <label :for="`salary-${teacher.id}`">
                Salary amount (₦)
              </label>

              <input
                :id="`salary-${teacher.id}`"
                v-model.number="teacher.salary"
                type="number"
                min="0.01"
                step="0.01"
                :disabled="
                  !teacher.selected ||
                  payrollSubmitting ||
                  payrollExecuting
                "
                :aria-label="`Salary for ${teacher.name}`"
              />
            </div>

            <button
              class="remove-button"
              type="button"
              title="Remove teacher from this list"
              :disabled="payrollSubmitting || payrollExecuting"
              @click="removeTeacher(teacher.id)"
            >
              ×
            </button>
          </article>
        </div>

        <div v-if="teachers.length" class="payroll-summary">
          <div>
            <span>Selected teachers</span>
            <strong>{{ selectedCount }}</strong>
          </div>

          <div>
            <span>Total salary amount</span>
            <strong>{{ money(selectedTotal) }}</strong>
          </div>
        </div>

        <!-- Payroll errors -->
        <p
          v-if="payrollError"
          class="inline-notice"
          role="alert"
        >
          {{ payrollError }}
        </p>

        <!-- Payroll batch result -->
        <div
          v-if="payrollResult && payrollResult.batch"
          class="review-notice"
          role="status"
        >
          <h3>
            Payroll batch
            {{ payrollResult.batch.reference }}
          </h3>

          <p>
            <strong>Status:</strong>
            {{ payrollResult.batch.status }}
          </p>

          <p>
            <strong>Teachers:</strong>
            {{ payrollResult.batch.teacherCount }}
          </p>

          <p>
            <strong>Salary total:</strong>
            {{ money(payrollResult.batch.totalAmount) }}
          </p>

          <p>
            <strong>ETrend service fee:</strong>
            {{ money(payrollResult.batch.serviceFee) }}
          </p>

          <p v-if="payrollResult.breakdown">
            <strong>Total before any Flutterwave fees:</strong>
            {{
              money(
                payrollResult.breakdown.totalBeforeAnyFlutterwaveFees
              )
            }}
          </p>

          <p v-if="payrollResult.batch.status === 'DRAFT'">
            This batch is a draft. No salary transfer has been confirmed.
            Check the recipients, amounts and available balance before
            initiating payments.
          </p>

          <p v-else-if="payrollResult.batch.status === 'COMPLETED'">
            The batch is marked completed. Confirm the individual
            transfer records before treating every salary as paid.
          </p>

          <p v-else-if="payrollResult.batch.status === 'PARTIAL'">
            Some transfers may have succeeded while others failed.
            Review each teacher's transfer status before taking action.
          </p>

          <p v-else-if="payrollResult.batch.status === 'FAILED'">
            The batch is marked failed. Check the individual transfer
            records before attempting another payment.
          </p>

          <p v-else-if="payrollResult.batch.status === 'PROCESSING'">
            Transfers are processing or awaiting confirmation.
            Do not create another batch for these salaries.
          </p>

          <p v-else>
            Review the current batch and transfer statuses before
            proceeding.
          </p>

          <!-- Execute only a draft batch -->
          
<button
  v-if="payrollResult.batch.status === 'DRAFT'"
  type="button"
  class="primary-button payroll-pay-button"
  :disabled="payrollExecuting || payrollSubmitting"
  @click="executePayroll"
>
  {{
    payrollExecuting
      ? "Processing salary payments..."
      : "Confirm and Pay Salaries →"
  }}
</button>

<p
  v-if="payrollError && payrollError.toLowerCase().includes('insufficient etrend balance')"
  class="insufficient-balance-error"
  role="alert"
>
  {{ payrollError }}
</p>


          <p v-if="payrollExecuting">
            Please wait. Do not refresh the page or submit this batch again
            while the transfer request is being processed.
          </p>

          <!-- Transfer results -->
          <div
            v-if="
              payrollResult.items &&
              payrollResult.items.length
            "
          >
            <h4>Salary transfer results</h4>

            <div
              v-for="item in payrollResult.items"
              :key="item.id"
              class="transfer-result"
            >
              <p>
                <strong>
                  {{ item.teacherName || "Teacher" }}
                </strong>
              </p>

              <p>
                Amount:
                {{ money(item.amount) }}
              </p>

              <p>
                Status:
                {{ item.status }}
              </p>

              <p v-if="item.transferReference">
                Reference:
                {{ item.transferReference }}
              </p>

              <p v-if="item.failureReason">
                Details:
                {{ item.failureReason }}
              </p>
            </div>
          </div>
        </div>

        <!-- Create a batch only when there is no existing result -->
        <div
          v-if="!payrollResult"
          class="review-panel"
        >
          <div class="review-copy">
            <div class="review-icon">▤</div>

            <div>
              <strong>Review and create payroll draft</strong>
              <p>
                Check the selected teachers and amounts. This saves
                a payroll draft; it does not initiate bank transfers.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="primary-button review-button"
            :disabled="
              selectedCount === 0 ||
              selectedTotal <= 0 ||
              payrollSubmitting ||
              payrollExecuting ||
              savingTeacher
            "
            @click="submitPayrollDraft"
          >
            {{
              payrollSubmitting
                ? "Creating draft..."
                : "Create payroll draft →"
            }}
          </button>
        </div>

        <p
          v-if="showReview && !payrollResult"
          class="review-notice"
        >
          <strong>Payroll review:</strong>
          {{ selectedCount }} teacher(s) selected for
          {{ money(selectedTotal) }}.

          <button
            type="button"
            @click="showReview = false"
          >
            Dismiss
          </button>
        </p>
      </section>

      <footer class="page-footer">
        <strong>ETrend Education Services</strong>
        <span>
          Secure payroll management starts with accurate teacher records.
        </span>
      </footer>
    </div>
  </div>
</template>




<script setup>
import axios from "axios";
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";

const savingTeacher = ref(false);
const payrollSubmitting = ref(false);
const payrollExecuting = ref(false);
const payrollResult = ref(null);
const payrollError = ref("");
const pendingPayrollKey = ref("");

const store = useStore();
const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// =====================================================
// TEACHER FORM
// =====================================================

const form = reactive({
  name: "",
  bank: "",
  accountNumber: "",
  salary: "",
});

// =====================================================
// BANK LIST AND SEARCH
// =====================================================

const banks = ref([]);
const bankSearch = ref("");
const selectedBank = ref(null);
const showBankSuggestions = ref(false);
const banksLoading = ref(false);
const banksError = ref("");

// =====================================================
// ACCOUNT VERIFICATION
// =====================================================

const resolvingAccount = ref(false);
const verifiedAccountName = ref("");
const verifiedAccountNumber = ref("");
const verifiedBankCode = ref("");
const accountResolutionError = ref("");

const canResolveAccount = computed(() => {
  return Boolean(
    selectedBank.value &&
    /^\d{10}$/.test(form.accountNumber.trim()) &&
    !resolvingAccount.value
  );
});

const bankSuggestions = computed(() => {
  const search = bankSearch.value.trim().toLowerCase();

  if (!search || selectedBank.value) {
    return [];
  }

  return banks.value
    .filter((bank) =>
      bank.name.toLowerCase().includes(search)
    )
    .slice(0, 8);
});

// =====================================================
// PAYROLL PREVIEW
// =====================================================

const teachers = ref([]);
const showResolveNotice = ref(false);
const showReview = ref(false);

let nextId = 1;

const selectedCount = computed(() =>
  teachers.value.filter((teacher) => teacher.selected).length
);

const selectedTotal = computed(() =>
  teachers.value.reduce((total, teacher) => {
    if (!teacher.selected) return total;

    return total + Math.max(0, Number(teacher.salary) || 0);
  }, 0)
);

// =====================================================
// CLEAR ACCOUNT VERIFICATION WHEN DETAILS CHANGE
// =====================================================

function clearAccountVerification() {
  verifiedAccountName.value = "";
  verifiedAccountNumber.value = "";
  verifiedBankCode.value = "";
  accountResolutionError.value = "";
  showResolveNotice.value = false;
}

watch(
  [
    () => form.accountNumber,
    () => selectedBank.value?.code ?? "",
  ],
  () => {
    clearAccountVerification();
  }
);

// =====================================================
// LOAD BANKS FROM YOUR EXISTING BACKEND
// GET /api/transactions/banks
// =====================================================

async function loadBanks() {
  banksLoading.value = true;
  banksError.value = "";

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/transactions/banks`
    );

    // Your existing endpoint returns an array directly.
    const list = Array.isArray(response.data)
      ? response.data
      : [];

    banks.value = list
      .filter((bank) => bank?.code && bank?.name)
      .map((bank) => ({
        code: String(bank.code),
        name: String(bank.name),
        slug: bank.slug || "",
      }));

    if (!banks.value.length) {
      banksError.value =
        "No banks are available. Please check your bank records.";
    }
  } catch (error) {
    console.error(
      "Failed to load banks:",
      error.response?.data || error.message
    );

    banksError.value =
      error.response?.data?.error ||
      "Unable to load banks. Check your connection and try again.";
  } finally {
    banksLoading.value = false;
  }
}

// =====================================================
// BANK SEARCH AND SELECTION
// =====================================================

function selectBankFromSearch() {
  selectedBank.value = null;
  form.bank = "";

  clearAccountVerification();

  showBankSuggestions.value = true;
}

function chooseBank(bank) {
  selectedBank.value = bank;
  bankSearch.value = bank.name;
  form.bank = bank.name;

  showBankSuggestions.value = false;

  clearAccountVerification();
}

// =====================================================
// RESOLVE BANK ACCOUNT
// POST /api/transactions/resolve-account
//
// Your actual backend expects:
// { accountNumber, bankCode }
//
// Successful response:
// { accountName, accountNumber, bankCode }
// =====================================================

async function resolveAccount() {
  if (!canResolveAccount.value) {
    accountResolutionError.value =
      "Select a bank and enter a valid 10-digit account number.";
    return;
  }

  resolvingAccount.value = true;
  clearAccountVerification();

  try {
    const accountNumber = form.accountNumber.trim();
    const bankCode = selectedBank.value.code;

    const response = await axios.post(
      `${API_BASE_URL}/api/transactions/resolve-account`,
      {
        accountNumber,
        bankCode,
      },
      {
        headers: store.getters.token
          ? {
              Authorization: `Bearer ${store.getters.token}`,
            }
          : {},
      }
    );

    const result = response.data;

    // Match the response format from your actual route.
    if (
      !result?.accountName ||
      !result?.accountNumber ||
      !result?.bankCode
    ) {
      throw new Error(
        result?.error ||
          "The bank account could not be verified."
      );
    }

    // Make sure the returned details match the request.
    if (
      String(result.accountNumber).trim() !== accountNumber ||
      String(result.bankCode) !== bankCode
    ) {
      throw new Error(
        "The returned account details do not match your selection. Please try again."
      );
    }

    verifiedAccountName.value =
      String(result.accountName).trim();

    verifiedAccountNumber.value = accountNumber;
    verifiedBankCode.value = bankCode;

    showResolveNotice.value = true;
  } catch (error) {
    console.error(
      "Account resolution failed:",
      error.response?.data || error.message
    );

    accountResolutionError.value =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to verify this account. Check the bank and account number.";
  } finally {
    resolvingAccount.value = false;
  }
}

// =====================================================
// FORMAT CURRENCY
// =====================================================

function money(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

// =====================================================
// TEACHER DISPLAY HELPERS
// =====================================================

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function maskAccount(accountNumber) {
  const number = String(accountNumber || "");

  if (number.length !== 10) {
    return number;
  }

  return `${number.slice(0, 3)}••••${number.slice(-3)}`;
}

// =====================================================
// RESET TEACHER FORM
// =====================================================

function resetForm() {
  form.name = "";
  form.bank = "";
  form.accountNumber = "";
  form.salary = "";

  bankSearch.value = "";
  selectedBank.value = null;
  showBankSuggestions.value = false;

  clearAccountVerification();
}

// =====================================================
// ADD VERIFIED TEACHER TO PREVIEW
// This does NOT save to the database yet.
// =====================================================


async function addTeacher() {
  const name = form.name.trim();
  const accountNumber = form.accountNumber.trim();
  const salary = Number(form.salary);

  if (!name) {
    window.alert("Enter the teacher's full name.");
    return;
  }

  if (!selectedBank.value) {
    window.alert("Select the teacher's bank.");
    return;
  }

  if (!/^\d{10}$/.test(accountNumber)) {
    window.alert("Enter a valid 10-digit account number.");
    return;
  }

  if (
    !verifiedAccountName.value ||
    verifiedAccountNumber.value !== accountNumber ||
    verifiedBankCode.value !== selectedBank.value.code
  ) {
    window.alert("Verify the bank account before adding the teacher.");
    return;
  }

  if (
    !Number.isFinite(salary) ||
    salary <= 0 ||
    Math.abs(salary * 100 - Math.round(salary * 100)) > 0.00001
  ) {
    window.alert("Enter a valid salary with no more than two decimal places.");
    return;
  }

  const duplicate = teachers.value.some(
    (teacher) =>
      teacher.accountNumber === accountNumber &&
      teacher.bankCode === selectedBank.value.code
  );

  if (duplicate) {
    window.alert("This bank account is already in your list.");
    return;
  }

  if (savingTeacher.value) return;

  savingTeacher.value = true;

  try {
    const token = store.getters.token;

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/payroll/teachers`,
      {
        name,
        accountNumber,
        bankCode: selectedBank.value.code,
        bankName: selectedBank.value.name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const savedTeacher = response.data?.teacher;

    if (!response.data?.success || !savedTeacher?.id) {
      throw new Error("The server did not confirm that the teacher was saved.");
    }

    // Store the actual database ID, not a temporary browser ID.
    teachers.value.push({
      id: savedTeacher.id,
      name: savedTeacher.name,
      bank: savedTeacher.bankName,
      bankCode: savedTeacher.bankCode,
      accountNumber: savedTeacher.accountNumber,
      accountName: savedTeacher.accountName,
      salary,
      selected: true,
    });

    payrollError.value = "";
    payrollResult.value = null;
    showReview.value = false;

    resetForm();
  } catch (error) {
    console.error(
      "Saving teacher failed:",
      error.response?.data || error.message
    );

    window.alert(
      error.response?.data?.message ||
      error.message ||
      "Unable to save teacher. Please try again."
    );
  } finally {
    savingTeacher.value = false;
  }
}



async function loadTeachers() {
  try {
    const token = store.getters.token;

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/payroll/teachers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Unable to load saved teachers."
      );
    }

    teachers.value = (response.data.teachers || []).map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      bank: teacher.bankName,
      bankCode: teacher.bankCode,
      accountNumber: teacher.accountNumber,
      accountName: teacher.accountName,
      salary: 0,
      selected: false,
    }));
  } catch (error) {
    console.error(
      "Loading saved teachers failed:",
      error.response?.data || error.message
    );

    window.alert(
      error.response?.data?.message ||
      error.message ||
      "Unable to load saved teachers. Please try again."
    );
  }
}



// =====================================================
// REMOVE TEACHER FROM PREVIEW
// =====================================================

function removeTeacher(id) {
  teachers.value = teachers.value.filter(
    (teacher) => teacher.id !== id
  );

  showReview.value = false;
}


async function submitPayrollDraft() {
  const selectedTeachers = teachers.value.filter(
    (teacher) => teacher.selected
  );

  if (selectedTeachers.length === 0) {
    payrollError.value = "Select at least one teacher.";
    return;
  }

  if (payrollSubmitting.value) return;

  const invalidTeacher = selectedTeachers.some(
    (teacher) =>
      !Number.isSafeInteger(Number(teacher.id)) ||
      Number(teacher.id) <= 0 ||
      !Number.isFinite(Number(teacher.salary)) ||
      Number(teacher.salary) <= 0
  );

  if (invalidTeacher) {
    payrollError.value =
      "One or more selected teachers have invalid details. Please refresh your teacher list.";
    return;
  }

  const confirmed = window.confirm(
    `Create a payroll draft for ${selectedTeachers.length} teacher(s), totalling ${money(
      selectedTeachers.reduce(
        (sum, teacher) => sum + Number(teacher.salary),
        0
      )
    )}? This will NOT transfer money.`
  );

  if (!confirmed) return;

  payrollSubmitting.value = true;
  payrollError.value = "";
  payrollResult.value = null;

  try {
    const token = store.getters.token;

    if (!token) {
      throw new Error("Please log in again.");
    }

    // Reuse this key if a request fails or times out.
    // This prevents a retry from creating a second batch.
    if (!pendingPayrollKey.value) {
      pendingPayrollKey.value = crypto.randomUUID();
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/payroll/batches`,
      {
        items: selectedTeachers.map((teacher) => ({
          teacherId: Number(teacher.id),
          amount: Number(teacher.salary),
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": pendingPayrollKey.value,
        },
      }
    );

    if (!response.data?.success || !response.data?.batch?.id) {
      throw new Error(
        response.data?.message || "The payroll draft was not confirmed."
      );
    }

    payrollResult.value = {
      batch: response.data.batch,
      items: response.data.items || [],
      breakdown: response.data.breakdown || null,
      duplicateSubmission: Boolean(response.data.duplicateSubmission),
    };

    pendingPayrollKey.value = "";
    showReview.value = true;
  } catch (error) {
    console.error(
      "Payroll draft creation failed:",
      error.response?.data || error.message
    );

    payrollError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to create the payroll draft. You can retry safely using the same submission key.";
  } finally {
    payrollSubmitting.value = false;
  }
}


async function executePayroll() {
  const batchId = payrollResult.value?.batch?.id;

  if (!batchId || payrollExecuting.value) return;

  if (payrollResult.value.batch.status !== "DRAFT") {
    payrollError.value =
      "This batch is no longer a draft. Refresh its status before proceeding.";
    return;
  }

  const confirmed = window.confirm(
    `IMPORTANT: You are about to initiate REAL salary transfers for ${payrollResult.value.batch.teacherCount} teacher(s), totalling ${money(payrollResult.value.batch.totalAmount)}. The ETrend service fee and Flutterwave fees may also apply. Continue only if you have verified the recipients and available balance.`
  );

  if (!confirmed) return;

  payrollExecuting.value = true;
  payrollError.value = "";

  try {
    const token = store.getters.token;

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/payroll/batches/${batchId}/execute`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 120000,
      }
    );

    if (!response.data?.success || !response.data?.batch) {
      throw new Error(
        response.data?.message ||
          "The payroll execution could not be confirmed."
      );
    }

    payrollResult.value = {
      ...payrollResult.value,
      batch: response.data.batch,
      items: response.data.items || payrollResult.value.items || [],
      submissionResults: response.data.submissionResults || [],
      feeCollectionStatus: response.data.feeCollectionStatus || null,
    };

    showReview.value = true;
  } catch (error) {
    console.error(
      "Payroll execution result:",
      error.response?.data || error.message
    );

    payrollError.value =
      error.response?.data?.message ||
      "The execution result could not be confirmed. Check the batch status and transfer references before trying anything again. Do not create another batch for the same salaries.";
  } finally {
    payrollExecuting.value = false;
  }
}


// =====================================================
// SELECT OR DESELECT ALL TEACHERS
// =====================================================

function selectAll() {
  const shouldSelect =
    selectedCount.value !== teachers.value.length;

  teachers.value.forEach((teacher) => {
    teacher.selected = shouldSelect;
  });

  showReview.value = false;
}

// =====================================================
// INITIALIZE AND CLEAN UP
// =====================================================

onMounted(() => {
  loadBanks();
  loadTeachers();
});

onBeforeUnmount(() => {
  showBankSuggestions.value = false;
});
</script>


<style scoped>
.payroll-page {
  min-height: 100vh;
  padding: 25px 18px;
  background: #fff9db;
  color: #003366;
  font-family: inherit;
}

.payroll-page * {
  box-sizing: border-box;
}

.payroll-container {
  max-width: 1120px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.back-button {
  border: 0;
  padding: 9px 12px;
  border-radius: 10px;
  background: transparent;
  color: #003366;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.back-button:hover {
  background: #ffed9e;
}

.back-button span {
  margin-right: 5px;
  font-size: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: #003366;
  color: #ffed9e;
  font-size: 23px;
  font-weight: 900;
}







.payroll-pay-button {
  display: block;
  width: 100%;
  margin-top: 18px;
  padding: 15px 22px;
  border: none;
  border-radius: 10px;
  background: #00a83b;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 5px 14px rgba(0, 168, 59, 0.28);
  transition: background 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
}

.payroll-pay-button:hover:not(:disabled) {
  background: #008f32;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 143, 50, 0.35);
}

.payroll-pay-button:disabled {
  background: #8bc99e;
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: none;
}


.payroll-pay-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #065f36, #033d26);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(8, 116, 67, 0.32);
}

.payroll-pay-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.insufficient-balance-error {
  margin: 10px 0 0;
  padding: 12px 14px;
  color: #ff0000;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.5;
  background: #fff0f0;
  border-left: 5px solid #ff0000;
  border-radius: 6px;
}


.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 15px;
}

.brand small {
  margin-top: 4px;
  color: #6c7788;
  font-size: 11px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 205px;
  padding: 32px 38px;
  overflow: hidden;
  border-radius: 23px;
  background: #003366;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(0, 51, 102, 0.12);
}

.hero-copy {
  max-width: 700px;
}

.eyebrow {
  color: #ffed9e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero h1 {
  margin: 12px 0 10px;
  font-size: clamp(27px, 4vw, 38px);
  letter-spacing: -1px;
}

.hero p {
  max-width: 620px;
  margin: 0;
  color: #e3edf8;
  font-size: 13px;
  line-height: 1.8;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 17px;
  color: #ffed9e;
  font-size: 12px;
  font-weight: 600;
}

.hero-note span {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #ffed9e;
  color: #003366;
}

.hero-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border: 1px solid rgba(255, 237, 158, 0.4);
  border-radius: 50%;
  background: rgba(255, 237, 158, 0.08);
  color: #ffed9e;
  font-size: 54px;
  font-weight: 800;
}

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 18px;
  padding: 15px 17px;
  border: 1px solid #eadfae;
  border-radius: 14px;
  background: #fffdf2;
}

.notice-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: #ffed9e;
  color: #003366;
  font-size: 13px;
  font-weight: 900;
}

.demo-notice strong {
  font-size: 12px;
}

.demo-notice p {
  margin: 4px 0 0;
  color: #68758a;
  font-size: 12px;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 19px;
  border: 1px solid #eadfae;
  border-radius: 16px;
  background: #ffffff;
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 13px;
  background: #fff4c5;
  color: #003366;
  font-size: 22px;
  font-weight: 800;
}

.summary-card span,
.summary-card strong {
  display: block;
}

.summary-card span {
  color: #6c7788;
  font-size: 11px;
}

.summary-card strong {
  margin-top: 5px;
  overflow-wrap: anywhere;
  font-size: clamp(16px, 2vw, 23px);
}

.content-card {
  margin-top: 20px;
  padding: 27px;
  border: 1px solid #eadfae;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(0, 51, 102, 0.035);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 13px;
}

.section-symbol {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 13px;
  background: #fff4c5;
  color: #003366;
  font-size: 24px;
  font-weight: 700;
}

.section-title h2 {
  margin: 0;
  font-size: 19px;
  letter-spacing: -0.4px;
}

.section-title p {
  margin: 5px 0 0;
  color: #6c7788;
  font-size: 12px;
  line-height: 1.6;
}

.teacher-form {
  margin-top: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 21px;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 9px;
}

.field > span {
  color: #003366;
  font-size: 12px;
  font-weight: 800;
}

.field b {
  color: #b45309;
}

.field input,
.field select {
  width: 100%;
  min-height: 47px;
  padding: 12px 13px;
  border: 1px solid #dce1e9;
  border-radius: 10px;
  outline: none;
  background: #ffffff;
  color: #003366;
  font: inherit;
  font-size: 13px;
}

.field input:focus,
.field select:focus {
  border-color: #003366;
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.08);
}

.field input::placeholder {
  color: #a0a8b6;
}

.field small {
  color: #7b8492;
  font-size: 10px;
  line-height: 1.5;
}

.verification-panel {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 25px;
  padding: 17px;
  border: 1px solid #eadfae;
  border-radius: 14px;
  background: #fffaf0;
}

.verification-icon {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #ffed9e;
  color: #003366;
  font-size: 19px;
  font-weight: 800;
}

.verification-copy {
  flex: 1;
  min-width: 0;
}

.verification-copy strong {
  font-size: 12px;
}

.verification-copy p {
  margin: 5px 0 0;
  color: #68758a;
  font-size: 11px;
  line-height: 1.6;
}

.secondary-button,
.cancel-button {
  min-height: 40px;
  padding: 10px 13px;
  border: 1px solid #003366;
  border-radius: 9px;
  background: #ffffff;
  color: #003366;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.inline-notice,
.review-notice {
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff4c5;
  color: #003366;
  font-size: 12px;
  line-height: 1.7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 23px;
}

.primary-button {
  min-height: 44px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #003366;
  color: #ffffff;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s ease;
}

.primary-button:hover:not(:disabled) {
  background: #074b87;
}

.primary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.text-button {
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: #fff4c5;
  color: #003366;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.empty-state {
  padding: 35px 20px;
  border: 1px dashed #d8d2b7;
  border-radius: 14px;
  background: #fffdf5;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
  border-radius: 16px;
  background: #ffed9e;
  color: #003366;
  font-size: 28px;
}

.empty-state h3 {
  margin: 0;
  font-size: 15px;
}

.empty-state p {
  max-width: 430px;
  margin: 9px auto 0;
  color: #6c7788;
  font-size: 12px;
  line-height: 1.8;
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.teacher-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 15px;
  border: 1px solid #e5e8ee;
  border-radius: 13px;
  background: #ffffff;
}

.teacher-row.is-selected {
  border-color: #c6d4e4;
  background: #fbfdff;
}

.select-control {
  flex-shrink: 0;
}

.select-control input {
  width: 17px;
  height: 17px;
  accent-color: #003366;
  cursor: pointer;
}

.teacher-avatar {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff0b4;
  color: #003366;
  font-size: 12px;
  font-weight: 900;
}

.teacher-info {
  display: flex;
  flex: 1;
  min-width: 100px;
  flex-direction: column;
  gap: 4px;
}

.teacher-info strong {
  overflow-wrap: anywhere;
  font-size: 12px;
}

.teacher-info span,
.teacher-info small {
  color: #6c7788;
  font-size: 10px;
}

.salary-control {
  display: flex;
  width: 155px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 6px;
}

.salary-control label {
  color: #68758a;
  font-size: 10px;
}

.salary-control input {
  width: 100%;
  min-height: 37px;
  padding: 8px;
  border: 1px solid #dce1e9;
  border-radius: 8px;
  color: #003366;
  font: inherit;
  font-size: 12px;
}

.salary-control input:disabled {
  background: #f2f3f5;
  color: #8a94a3;
}

.remove-button {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: 0;
  border-radius: 8px;
  background: #fff0ee;
  color: #a33a2b;
  font-size: 21px;
  cursor: pointer;
}

.payroll-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
  padding: 18px;
  border-radius: 12px;
  background: #fff9db;
}

.payroll-summary span,
.payroll-summary strong {
  display: block;
}

.payroll-summary span {
  margin-bottom: 6px;
  color: #6c7788;
  font-size: 11px;
}

.payroll-summary strong {
  font-size: 16px;
}

.review-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 25px;
  padding: 19px;
  border-radius: 14px;
  background: #003366;
  color: #ffffff;
}

.review-copy {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.review-icon {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #ffed9e;
  color: #003366;
  font-size: 20px;
}

.review-copy strong {
  font-size: 12px;
}

.review-copy p {
  max-width: 440px;
  margin: 5px 0 0;
  color: #e2eaf4;
  font-size: 11px;
  line-height: 1.7;
}

.review-button {
  flex-shrink: 0;
  background: #ffed9e;
  color: #003366;
}

.review-button:hover:not(:disabled) {
  background: #ffe477;
}

.review-notice button {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: #003366;
  font: inherit;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
}

.page-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 32px;
  padding: 22px 10px;
  border-top: 1px solid #e9dfb6;
  text-align: center;
}

.page-footer strong {
  font-size: 12px;
}

.bank-field {
  position: relative;
}

.bank-suggestions {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid #eadfae;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 51, 102, 0.12);
}

.bank-suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-bottom: 1px solid #f1ecd7;
  background: #ffffff;
  color: #003366;
  text-align: left;
  cursor: pointer;
}

.bank-suggestion:hover {
  background: #fff9db;
}

.bank-suggestion small,
.bank-help,
.selected-bank small {
  color: #68758a;
  font-size: 11px;
}

.bank-error {
  color: #a33a2b;
  font-size: 12px;
}

.bank-error button {
  margin-left: 8px;
  color: #003366;
  cursor: pointer;
}

.selected-bank,
.verified-account {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  color: #003366;
  font-size: 12px;
}

.verified-account {
  padding: 12px;
  border: 1px solid #d7e8d9;
  border-radius: 10px;
  background: #f4fbf4;
}

.verified-account > span {
  font-size: 18px;
}

.verified-account small {
  display: block;
  margin-top: 4px;
  color: #68758a;
}

.page-footer span {
  color: #778092;
  font-size: 10px;
}

@media (max-width: 720px) {
  .hero {
    padding: 27px;
  }

  .hero-icon {
    width: 85px;
    height: 85px;
    font-size: 40px;
  }

  .summary-grid {
    gap: 9px;
  }

  .summary-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 13px;
  }

  .content-card {
    padding: 20px;
  }

  .teacher-row {
    flex-wrap: wrap;
  }

  .teacher-info {
    flex: 1;
  }

  .salary-control {
    width: calc(100% - 50px);
    margin-left: 36px;
  }

  .remove-button {
    margin-left: auto;
  }
}

@media (max-width: 500px) {
  .payroll-page {
    padding: 15px 11px;
  }

  .brand strong {
    font-size: 12px;
  }

  .hero {
    padding: 24px 20px;
  }

  .hero-icon {
    display: none;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    align-items: center;
    flex-direction: row;
    padding: 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .verification-panel {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .secondary-button {
    margin-left: 52px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .list-heading {
    align-items: flex-start;
  }

  .review-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .review-button {
    width: 100%;
  }

  .payroll-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
