import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { api, authTokens } from '../services/api';

// Initial state
const initialState = {
  auth: {
    user: null,
    token: authTokens.get(),
    isAuthenticated: !!authTokens.get(),
    isLoading: false,
  },
  settings: null,
  exchangeRate: null,
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  // Auth actions
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  
  // Legacy actions (keeping for backward compatibility)
  SET_USER_EMAIL: 'SET_USER_EMAIL',
  SET_USER_SIMULATIONS: 'SET_USER_SIMULATIONS',
  ADD_SIMULATION: 'ADD_SIMULATION',
  
  // App actions
  SET_SETTINGS: 'SET_SETTINGS',
  SET_EXCHANGE_RATE: 'SET_EXCHANGE_RATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: true,
        },
        error: null,
      };
    
    case actionTypes.LOGIN_SUCCESS:
      authTokens.set(action.payload.token);
      return {
        ...state,
        auth: {
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          isLoading: false,
        },
        error: null,
      };
    
    case actionTypes.LOGIN_FAILURE:
      authTokens.remove();
      return {
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        },
        error: action.payload,
      };
    
    case actionTypes.LOGOUT:
      authTokens.remove();
      return {
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        },
      };
    
    case actionTypes.SET_USER:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
        },
      };
    
    // Legacy actions (keeping for backward compatibility)
    case actionTypes.SET_USER_EMAIL:
      localStorage.setItem('userEmail', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          user: state.auth.user ? { ...state.auth.user, email: action.payload } : { email: action.payload },
        },
      };
    
    case actionTypes.SET_USER_SIMULATIONS:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: {
            ...state.auth.user,
            simulations: action.payload,
          },
        },
      };
    
    case actionTypes.ADD_SIMULATION:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: {
            ...state.auth.user,
            simulations: [action.payload, ...(state.auth.user?.simulations || [])],
          },
        },
      };
    
    case actionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
      };
    
    case actionTypes.SET_EXCHANGE_RATE:
      return {
        ...state,
        exchangeRate: action.payload,
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const queryClient = useQueryClient();
  
  // Fetch current user if token exists
  useQuery('currentUser', api.getCurrentUser, {
    enabled: !!state.auth.token,
    onSuccess: (data) => {
      dispatch({ type: actionTypes.SET_USER, payload: data });
    },
    onError: (error) => {
      console.error('Error fetching current user:', error);
      // Token might be invalid
      dispatch({ type: actionTypes.LOGOUT });
    },
  });
  
  // Fetch site settings
  useQuery('siteSettings', api.getSiteSettings, {
    onSuccess: (data) => {
      dispatch({ type: actionTypes.SET_SETTINGS, payload: data });
    },
    onError: (error) => {
      console.error('Error fetching site settings:', error);
    },
  });
  
  // Fetch current exchange rate
  useQuery('exchangeRate', api.getCurrentExchangeRate, {
    onSuccess: (data) => {
      dispatch({ type: actionTypes.SET_EXCHANGE_RATE, payload: data.current_rate });
    },
    onError: (error) => {
      console.error('Error fetching exchange rate:', error);
    },
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
  
  // Fetch user simulations when authenticated
  useQuery(
    ['userSimulations', state.auth.user?.id],
    () => api.getUserSimulations(),
    {
      enabled: state.auth.isAuthenticated && !!state.auth.user,
      onSuccess: (data) => {
        dispatch({ type: actionTypes.SET_USER_SIMULATIONS, payload: data.results || [] });
      },
      onError: (error) => {
        console.error('Error fetching user simulations:', error);
      },
    }
  );
  
  // Action creators
  const actions = {
    // Auth actions
    login: async (credentials) => {
      try {
        dispatch({ type: actionTypes.LOGIN_START });
        const response = await api.login(credentials);
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response });
        queryClient.invalidateQueries('userSimulations');
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error en el login';
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: errorMessage });
        throw error;
      }
    },
    
    register: async (userData) => {
      try {
        dispatch({ type: actionTypes.LOGIN_START });
        const response = await api.register(userData);
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response });
        queryClient.invalidateQueries('userSimulations');
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error en el registro';
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: errorMessage });
        throw error;
      }
    },
    
    logout: async () => {
      try {
        await api.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        dispatch({ type: actionTypes.LOGOUT });
        queryClient.clear();
      }
    },
    
    // Legacy actions (keeping for backward compatibility)
    setUserEmail: (email) => {
      dispatch({ type: actionTypes.SET_USER_EMAIL, payload: email });
    },
    
    addSimulation: (simulation) => {
      dispatch({ type: actionTypes.ADD_SIMULATION, payload: simulation });
    },
    
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },
    
    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },
  };
  
  const contextValue = {
    state,
    actions,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Utility hooks
export function useAuth() {
  const { state, actions } = useApp();
  
  return {
    // New auth properties
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    token: state.auth.token,
    
    // Auth actions
    login: actions.login,
    register: actions.register,
    logout: actions.logout,
    
    // Legacy properties (for backward compatibility)
    userEmail: state.auth.user?.email || '',
    setUserEmail: actions.setUserEmail,
    isLoggedIn: state.auth.isAuthenticated,
  };
}

export function useSettings() {
  const { state } = useApp();
  return state.settings;
}

export function useExchangeRate() {
  const { state } = useApp();
  return state.exchangeRate;
}