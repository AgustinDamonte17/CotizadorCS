import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
const getAuthToken = () => localStorage.getItem('authToken');
const setAuthToken = (token) => localStorage.setItem('authToken', token);
const removeAuthToken = () => localStorage.removeItem('authToken');

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

// Create auth client for authentication endpoints (different base URL)
const authClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to auth client requests too
authClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth client response interceptor
authClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service object
export const api = {
  // Authentication endpoints
  register: (userData) => {
    return authClient.post('/auth/register/', userData);
  },
  
  login: (credentials) => {
    return authClient.post('/auth/login/', credentials);
  },
  
  logout: () => {
    return authClient.post('/auth/logout/');
  },
  
  getCurrentUser: () => {
    return authClient.get('/auth/user/');
  },
  
  // Project access endpoints
  verifyProjectAccess: (projectId, accessCode) => {
    return authClient.post(`/auth/projects/${projectId}/verify-access/`, { access_code: accessCode });
  },
  
  checkProjectAccess: (projectId) => {
    return authClient.get(`/auth/projects/${projectId}/check-access/`);
  },
  
  getUserProjectAccesses: () => {
    return authClient.get('/auth/user/project-accesses/');
  },
  
  // Projects endpoints
  getProjects: (params = {}) => {
    return apiClient.get('/projects/', { params });
  },
  
  getProject: (id) => {
    return apiClient.get(`/projects/${id}/`);
  },
  
  getProjectStats: () => {
    return apiClient.get('/projects/stats/');
  },
  
  // Simulations endpoints
  createSimulation: (data) => {
    return apiClient.post('/simulations/create/', data);
  },
  
  compareSimulations: (data) => {
    return apiClient.post('/simulations/compare/', data);
  },
  
  getSimulation: (id) => {
    return apiClient.get(`/simulations/${id}/`);
  },
  
  getUserSimulations: () => {
    return apiClient.get('/simulations/user/');
  },
  
  getSimulationStats: () => {
    return apiClient.get('/simulations/stats/');
  },
  
  // Tariff categories endpoints
  getTariffCategories: () => {
    return apiClient.get('/tariff-categories/');
  },
  
  // Exchange rates endpoints
  getExchangeRates: () => {
    return apiClient.get('/exchange-rates/');
  },
  
  getCurrentExchangeRate: () => {
    return apiClient.get('/exchange-rate/current/');
  },
  
  calculateLimits: (data) => {
    return apiClient.post('/calculate-limits/', data);
  },
  
  // Core endpoints
  getSiteSettings: () => {
    return apiClient.get('/settings/');
  },
  
  sendContactMessage: (data) => {
    return apiClient.post('/contact/', data);
  },
  
  subscribeNewsletter: (data) => {
    return apiClient.post('/newsletter/subscribe/', data);
  },
  
  unsubscribeNewsletter: (data) => {
    return apiClient.post('/newsletter/unsubscribe/', data);
  },
  
  getHealthCheck: () => {
    return apiClient.get('/health/');
  },
  
  getApiInfo: () => {
    return apiClient.get('/info/');
  },
};

// Utility functions for API calls
export const apiUtils = {
  // Handle API errors and extract meaningful messages
  extractErrorMessage: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      const firstField = Object.keys(errors)[0];
      return errors[firstField][0] || 'Error de validación';
    }
    
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Error inesperado del servidor';
  },
  
  // Format currency values
  formatCurrency: (amount, currency = 'ARS') => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return formatter.format(amount);
  },
  
  // Format large numbers with units
  formatNumber: (number, decimals = 0) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return formatter.format(number);
  },
  
  // Format power values with appropriate units
  formatPower: (power) => {
    if (power >= 1000) {
      return `${apiUtils.formatNumber(power / 1000, 1)} MW`;
    }
    return `${apiUtils.formatNumber(power, 1)} kW`;
  },
  
  // Format energy values with appropriate units
  formatEnergy: (energy) => {
    if (energy >= 1000000) {
      return `${apiUtils.formatNumber(energy / 1000000, 1)} GWh`;
    }
    if (energy >= 1000) {
      return `${apiUtils.formatNumber(energy / 1000, 1)} MWh`;
    }
    return `${apiUtils.formatNumber(energy, 0)} kWh`;
  },
  
  // Convert USD to ARS using current exchange rate
  convertToARS: (usdAmount, exchangeRate) => {
    return usdAmount * exchangeRate;
  },
  
  // Convert ARS to USD using current exchange rate
  convertToUSD: (arsAmount, exchangeRate) => {
    return arsAmount / exchangeRate;
  },
  
  // Calculate percentage
  calculatePercentage: (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
  
  // Format dates
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  // Format relative time
  formatRelativeTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
    
    return apiUtils.formatDate(dateString);
  },
};

// Export token management functions
export const authTokens = {
  get: getAuthToken,
  set: setAuthToken,
  remove: removeAuthToken,
};

export default api;