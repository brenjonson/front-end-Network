import { services } from '@/app/api/services/route';

// Analytics functions
export const fetchSummary = async () => {
  try {
    return await services.analytics.getSummary();
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

export const fetchMonthlyExpenses = async (year?: number, months?: number) => {
  try {
    return await services.analytics.getMonthlyExpenses(year, months);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    throw error;
  }
};

export const fetchCategoriesExpenses = async () => {
  try {
    return await services.analytics.getCategoriesExpenses();
  } catch (error) {
    console.error('Error fetching categories expenses:', error);
    throw error;
  }
};

export const fetchVendorsExpenses = async () => {
  try {
    return await services.analytics.getVendorsExpenses();
  } catch (error) {
    console.error('Error fetching vendors expenses:', error);
    throw error;
  }
};

// Receipt functions
export const fetchReceipts = async () => {
  try {
    return await services.receipts.getAll();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
};

export const fetchReceiptById = async (id: number) => {
  try {
    return await services.receipts.getById(id);
  } catch (error) {
    console.error(`Error fetching receipt ${id}:`, error);
    throw error;
  }
};

export const updateReceiptCategory = async (receiptId: number, categoryId: number) => {
  try {
    return await services.receipts.updateCategory(receiptId, categoryId);
  } catch (error) {
    console.error(`Error updating receipt ${receiptId} category:`, error);
    throw error;
  }
};

// Category functions
export const fetchCategories = async () => {
  try {
    return await services.categories.getAll();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// IMAP Settings functions
export const fetchImapSettings = async () => {
  try {
    return await services.imap.getAll();
  } catch (error) {
    console.error('Error fetching IMAP settings:', error);
    throw error;
  }
};

export const createImapSetting = async (settingData: any) => {
  try {
    return await services.imap.create(settingData);
  } catch (error) {
    console.error('Error creating IMAP setting:', error);
    throw error;
  }
};

export const testImapSetting = async (id: number) => {
  try {
    return await services.imap.test(id);
  } catch (error) {
    console.error(`Error testing IMAP setting ${id}:`, error);
    throw error;
  }
};

export const syncImapSetting = async (id: number, daysBack: number = 30, limit: number = 50) => {
  try {
    return await services.imap.sync(id, daysBack, limit);
  } catch (error) {
    console.error(`Error syncing IMAP setting ${id}:`, error);
    throw error;
  }
};

// Aliases for compatibility with existing code
export const testImapConnection = testImapSetting;
export const syncEmails = syncImapSetting;
export const fetchReceipt = fetchReceiptById;

// Auth functions
export const login = async (username: string, password: string) => {
  try {
    return await services.auth.login(username, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (userData: any) => {
  try {
    return await services.auth.register(userData);
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
