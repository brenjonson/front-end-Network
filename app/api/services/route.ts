﻿// services/api.js
import axios from 'axios';

// สร้าง axios instance พร้อมการตั้งค่าพื้นฐาน
const api = axios.create({
  baseURL: '/api/v1', // ปรับให้ตรงกับ base URL ของ API คุณ
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม interceptor สำหรับเพิ่ม token ในทุกคำขอ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor สำหรับจัดการ error response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // จัดการกรณี token หมดอายุ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ======= API Functions =======

// Authentication
export const login = async (username, password) => {
  try {
    const response = await api.post('/token', { username, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Receipts
export const fetchReceipts = async () => {
  try {
    const response = await api.get('/receipts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    throw error;
  }
};

export const fetchReceipt = async (id) => {
  try {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch receipt ${id}:`, error);
    throw error;
  }
};

export const updateReceiptCategory = async (receiptId, categoryId) => {
  try {
    const response = await api.put(`/receipts/${receiptId}/category`, { category_id: categoryId });
    return response.data;
  } catch (error) {
    console.error(`Failed to update receipt ${receiptId} category:`, error);
    throw error;
  }
};

// Categories
export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

// Analytics
export const fetchSummary = async () => {
  try {
    const response = await api.get('/analytics/summary');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch summary:', error);
    throw error;
  }
};

export const fetchMonthlyExpenses = async (year, months) => {
  try {
    let url = '/analytics/monthly';
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (months) params.append('months', months);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch monthly expenses:', error);
    throw error;
  }
};

export const fetchCategoriesExpenses = async () => {
  try {
    const response = await api.get('/analytics/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories expenses:', error);
    throw error;
  }
};

export const fetchVendorsExpenses = async () => {
  try {
    const response = await api.get('/analytics/vendors');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vendors expenses:', error);
    throw error;
  }
};

// IMAP Settings
export const fetchImapSettings = async () => {
  try {
    const response = await api.get('/imap-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch IMAP settings:', error);
    throw error;
  }
};

export const createImapSetting = async (settingData) => {
  try {
    const response = await api.post('/imap-settings', settingData);
    return response.data;
  } catch (error) {
    console.error('Failed to create IMAP setting:', error);
    throw error;
  }
};

export const updateImapSetting = async (id, settingData) => {
  try {
    const response = await api.put(`/imap-settings/${id}`, settingData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update IMAP setting ${id}:`, error);
    throw error;
  }
};

export const deleteImapSetting = async (id) => {
  try {
    const response = await api.delete(`/imap-settings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete IMAP setting ${id}:`, error);
    throw error;
  }
};

export const testImapConnection = async (id) => {
  try {
    const response = await api.post(`/imap-settings/${id}/test`);
    return response.data;
  } catch (error) {
    console.error(`Failed to test IMAP connection ${id}:`, error);
    throw error;
  }
};

export const syncEmails = async (id, daysBack = 30, limit = 50) => {
  try {
    const response = await api.post(`/imap-settings/${id}/sync?days_back=${daysBack}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to sync emails for IMAP setting ${id}:`, error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  fetchReceipts,
  fetchReceipt,
  updateReceiptCategory,
  fetchCategories,
  createCategory,
  fetchSummary,
  fetchMonthlyExpenses,
  fetchCategoriesExpenses,
  fetchVendorsExpenses,
  fetchImapSettings,
  createImapSetting,
  updateImapSetting,
  deleteImapSetting,
  testImapConnection,
  syncEmails
};