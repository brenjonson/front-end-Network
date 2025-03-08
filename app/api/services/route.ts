import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// สร้าง axios instance พร้อมการตั้งค่าพื้นฐาน
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // ปรับให้ตรงกับ base URL ของ API คุณ
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม interceptor สำหรับเพิ่ม token ในทุกคำขอ
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ======= API Functions =======

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export interface Receipt {
  id: number;
  user_id: number;
  email_id?: string;
  email_subject?: string;
  email_from?: string;
  email_date?: string;
  vendor_name?: string;
  category_id?: number;
  receipt_date?: string;
  amount: number;
  currency: string;
  receipt_number?: string;
  payment_method?: string;
  notes?: string;
  receipt_file_path?: string;
  created_at: string;
}

export interface ImapSetting {
  id: number;
  user_id: number;
  email: string;
  server: string;
  port: number;
  username: string;
  use_ssl: boolean;
  folder: string;
  last_sync?: string;
  created_at: string;
}

export interface ImapSettingCreate {
  email: string;
  server: string;
  port: number;
  username: string;
  password: string;
  use_ssl: boolean;
  folder: string;
}

export interface Summary {
  total_expense: number;
  average_monthly: number;
  max_expense: number;
  min_expense: number;
  receipt_count: number;
}

export interface MonthlyExpense {
  year: number;
  month: number;
  month_name: string;
  total: number;
  receipt_count: number;
}

export interface CategoryExpense {
  category_name: string;
  total: number;
  receipt_count: number;
  percentage: number;
}

export interface VendorExpense {
  vendor_name: string;
  total: number;
  receipt_count: number;
  percentage: number;
}

// Authentication
export const login = async (username: string, password: string): Promise<TokenResponse> => {
  try {
    // ส่งข้อมูลเป็น form data ตามที่ OAuth2 ใช้
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post<TokenResponse>('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await api.post<User>('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

// Receipts
export const fetchReceipts = async (): Promise<Receipt[]> => {
  try {
    const response = await api.get<Receipt[]>('/receipts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    throw error;
  }
};

export const fetchReceipt = async (id: number): Promise<Receipt> => {
  try {
    const response = await api.get<Receipt>(`/receipts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch receipt ${id}:`, error);
    throw error;
  }
};

export const updateReceiptCategory = async (receiptId: number, categoryId: number): Promise<Receipt> => {
  try {
    const response = await api.put<Receipt>(`/receipts/${receiptId}`, { category_id: categoryId });
    return response.data;
  } catch (error) {
    console.error(`Failed to update receipt ${receiptId} category:`, error);
    throw error;
  }
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

// Analytics
export const fetchSummary = async (): Promise<Summary> => {
  try {
    const response = await api.get<Summary>('/analytics/summary');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch summary:', error);
    throw error;
  }
};

export const fetchMonthlyExpenses = async (year?: number, months?: number): Promise<MonthlyExpense[]> => {
  try {
    let url = '/analytics/monthly';
    const params = new URLSearchParams();
    
    if (year) params.append('year', year.toString());
    if (months) params.append('months', months.toString());
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await api.get<MonthlyExpense[]>(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch monthly expenses:', error);
    throw error;
  }
};

export const fetchCategoriesExpenses = async (): Promise<CategoryExpense[]> => {
  try {
    const response = await api.get<CategoryExpense[]>('/analytics/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories expenses:', error);
    throw error;
  }
};

export const fetchVendorsExpenses = async (): Promise<VendorExpense[]> => {
  try {
    const response = await api.get<VendorExpense[]>('/analytics/vendors');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vendors expenses:', error);
    throw error;
  }
};

// IMAP Settings
export const fetchImapSettings = async (): Promise<ImapSetting[]> => {
  try {
    const response = await api.get<ImapSetting[]>('/imap-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch IMAP settings:', error);
    throw error;
  }
};

export const createImapSetting = async (settingData: ImapSettingCreate): Promise<ImapSetting> => {
  try {
    const response = await api.post<ImapSetting>('/imap-settings', settingData);
    return response.data;
  } catch (error) {
    console.error('Failed to create IMAP setting:', error);
    throw error;
  }
};

export const updateImapSetting = async (id: number, settingData: Partial<ImapSettingCreate>): Promise<ImapSetting> => {
  try {
    const response = await api.put<ImapSetting>(`/imap-settings/${id}`, settingData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update IMAP setting ${id}:`, error);
    throw error;
  }
};

export const deleteImapSetting = async (id: number): Promise<void> => {
  try {
    await api.delete(`/imap-settings/${id}`);
  } catch (error) {
    console.error(`Failed to delete IMAP setting ${id}:`, error);
    throw error;
  }
};

export const testImapConnection = async (id: number): Promise<{status: string, message: string}> => {
  try {
    const response = await api.post<{status: string, message: string}>(`/imap-settings/${id}/test`);
    return response.data;
  } catch (error) {
    console.error(`Failed to test IMAP connection ${id}:`, error);
    throw error;
  }
};

export const syncEmails = async (id: number, daysBack: number = 30, limit: number = 50): Promise<{status: string, message: string}> => {
  try {
    const response = await api.post<{status: string, message: string}>(
      `/imap-settings/${id}/sync?days_back=${daysBack}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to sync emails for IMAP setting ${id}:`, error);
    throw error;
  }
};

// สร้าง object รวมทุกบริการเพื่อการใช้งาน
const apiService = {
  // Authentication
  auth: {
    login,
    register,
    logout,
    getCurrentUser,
  },
  
  // Receipts
  receipts: {
    getAll: fetchReceipts,
    getById: fetchReceipt,
    updateCategory: updateReceiptCategory,
  },
  
  // Categories
  categories: {
    getAll: fetchCategories,
    create: createCategory,
  },
  
  // Analytics
  analytics: {
    getSummary: fetchSummary,
    getMonthlyExpenses: fetchMonthlyExpenses,
    getCategoriesExpenses: fetchCategoriesExpenses,
    getVendorsExpenses: fetchVendorsExpenses,
  },
  
  // IMAP Settings
  imap: {
    getAll: fetchImapSettings,
    create: createImapSetting,
    update: updateImapSetting,
    delete: deleteImapSetting,
    test: testImapConnection,
    sync: syncEmails,
  },
};

export default apiService;