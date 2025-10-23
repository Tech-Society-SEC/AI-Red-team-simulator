// ================================
// AI Finance Assistant – API Layer
// With Supabase Authentication
// ================================

import axios from "axios";
import { supabase } from "./supabaseClient";

// ✅ backend base url
// make sure your frontend .env has: VITE_API_BASE_URL=http://127.0.0.1:8000
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// shared axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Add auth interceptor to include JWT token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// -----------------------------
// Transactions (CSV Upload)
// -----------------------------
export const uploadCSV = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await api.post("/transactions/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };
  

// -----------------------------
// Chat (Gemini AI Assistant)
// -----------------------------
export const sendChatMessage = async (message) => {
  const formData = new FormData();
  formData.append("message", message);

  const response = await api.post("/chat", formData);
  return response.data;
};

// -----------------------------
// Insights (Stored Summaries)
// -----------------------------
export const getInsights = async () => {
  const response = await api.get("/insights/");
  return response.data;
};

// -----------------------------
// Authentication
// -----------------------------
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.post("/auth/verify");
  return response.data;
};

// -----------------------------
// Transaction Management
// -----------------------------
export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  const response = await api.get(`/transactions/?${params.toString()}`);
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post("/transactions/", transactionData);
  return response.data;
};

export const updateTransaction = async (transactionId, transactionData) => {
  const response = await api.put(`/transactions/${transactionId}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (transactionId) => {
  const response = await api.delete(`/transactions/${transactionId}`);
  return response.data;
};

// -----------------------------
// Profile & Settings
// -----------------------------
export const getProfile = async () => {
  const response = await api.get("/profile/");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/profile/", profileData);
  return response.data;
};

// -----------------------------
// Categories
// -----------------------------
export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/categories/", categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await api.put(`/categories/${categoryId}`, categoryData);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};

// -----------------------------
// Budgets
// -----------------------------
export const getBudgets = async () => {
  const response = await api.get("/budgets/");
  return response.data;
};

export const createBudget = async (budgetData) => {
  const response = await api.post("/budgets/", budgetData);
  return response.data;
};

export const updateBudget = async (budgetId, budgetData) => {
  const response = await api.put(`/budgets/${budgetId}`, budgetData);
  return response.data;
};

export const deleteBudget = async (budgetId) => {
  const response = await api.delete(`/budgets/${budgetId}`);
  return response.data;
};

export const recomputeBudgets = async () => {
  const response = await api.post("/budgets/recompute");
  return response.data;
};

// -----------------------------
// Goals
// -----------------------------
export const getGoals = async () => {
  const response = await api.get("/goals/");
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await api.post("/goals/", goalData);
  return response.data;
};

export const updateGoal = async (goalId, goalData) => {
  const response = await api.put(`/goals/${goalId}`, goalData);
  return response.data;
};

export const deleteGoal = async (goalId) => {
  const response = await api.delete(`/goals/${goalId}`);
  return response.data;
};

export const checkGoalDeadlines = async () => {
  const response = await api.post("/goals/check-deadlines");
  return response.data;
};

// -----------------------------
// Chat Sessions
// -----------------------------
export const getSessions = async () => {
  const response = await api.get("/sessions/");
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await api.post("/sessions/", sessionData);
  return response.data;
};

export const updateSession = async (sessionId, sessionData) => {
  const response = await api.put(`/sessions/${sessionId}`, sessionData);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
};

// -----------------------------
// Analytics
// -----------------------------
export const getAnalytics = async () => {
  const response = await api.get("/analytics/");
  return response.data;
};

// -----------------------------
// Reports
// -----------------------------
export const generateReport = async () => {
  const response = await api.get("/report/", { responseType: 'blob' });
  return response.data;
};

// -----------------------------
// AI Features
// -----------------------------
export const categorizeTransaction = async (transactionData) => {
  const response = await api.post("/ai/categorize-transaction", transactionData);
  return response.data;
};

export const generateInsights = async (insightType) => {
  const response = await api.post("/ai/generate-insights", { type: insightType });
  return response.data;
};

export const getBudgetRecommendations = async () => {
  const response = await api.post("/ai/budget-recommendations");
  return response.data;
};

export const getGoalPredictions = async () => {
  const response = await api.post("/ai/goal-predictions");
  return response.data;
};

// -----------------------------
// Health Check (optional)
// -----------------------------
export const checkHealth = async () => {
  const response = await api.get("/");
  return response.data;
};

export default api;
