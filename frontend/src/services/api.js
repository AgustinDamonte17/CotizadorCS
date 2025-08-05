import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
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

// API service object
export const api = {
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
  
  getUserSimulations: (email) => {
    return apiClient.get('/simulations/user/', { params: { email } });
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

export default api;