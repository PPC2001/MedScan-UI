// API client wrapper for MedScan AI FastAPI backend

const DEFAULT_BASE_URL = "http://localhost:8000";
const DEFAULT_API_KEY = "medscan-dev-key-change-me";

// Get configuration from localStorage
export const getApiConfig = () => {
  const baseUrl = localStorage.getItem("medscan_api_url") || DEFAULT_BASE_URL;
  const apiKey = localStorage.getItem("medscan_api_key") || DEFAULT_API_KEY;
  return { baseUrl, apiKey };
};

// Update configuration
export const saveApiConfig = (baseUrl, apiKey) => {
  localStorage.setItem("medscan_api_url", baseUrl || DEFAULT_BASE_URL);
  localStorage.setItem("medscan_api_key", apiKey || DEFAULT_API_KEY);
};

// Generic request helper
async function request(path, options = {}) {
  const { baseUrl, apiKey } = getApiConfig();
  const url = `${baseUrl}${path}`;

  const headers = {
    "X-API-Key": apiKey,
    ...options.headers,
  };

  // If body is not FormData, default to JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API Error";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (_) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `HTTP error! Status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request("/health/"),
  getLlmHealth: () => request("/health/llm"),
  getDbHealth: () => request("/health/db"),

  // Patients
  listPatients: (search = "") => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/patients/${q}`);
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (patient) =>
    request("/patients/", {
      method: "POST",
      body: patient,
    }),
  updatePatient: (id, updates) =>
    request(`/patients/${id}`, {
      method: "PATCH",
      body: updates,
    }),
  deletePatient: (id) =>
    request(`/patients/${id}`, {
      method: "DELETE",
    }),

  // Documents
  uploadDocument: (patientId, docType, file) => {
    const formData = new FormData();
    formData.append("patient_id", patientId);
    formData.append("doc_type", docType);
    formData.append("file", file);

    return request("/documents/upload", {
      method: "POST",
      body: formData,
      // browser sets correct boundary for FormData, do not set Content-Type header
    });
  },
  getDocumentStatus: (id) => request(`/documents/${id}/status`),
  getDocument: (id) => request(`/documents/${id}`),
  listPatientDocuments: (patientId) => request(`/documents/patient/${patientId}`),
  deleteDocument: (id) =>
    request(`/documents/${id}`, {
      method: "DELETE",
    }),

  // Clinical Query
  query: (patientId, queryText, maxChunks = 10, includeSources = true) =>
    request("/query/", {
      method: "POST",
      body: {
        patient_id: patientId,
        query: queryText,
        max_chunks: maxChunks,
        include_sources: includeSources,
      },
    }),

  // Payments (Razorpay)
  createPaymentOrder: (amountINR, planName) =>
    request("/payments/create-order", {
      method: "POST",
      body: {
        amount_inr: amountINR,
        plan_name: planName,
      },
    }),
  verifyPayment: (paymentId, orderId, signature) =>
    request("/payments/verify", {
      method: "POST",
      body: {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      },
    }),
};
