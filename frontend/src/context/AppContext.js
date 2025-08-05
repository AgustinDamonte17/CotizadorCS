import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';

// Initial state
const initialState = {
  user: {
    email: localStorage.getItem('userEmail') || '',
    simulations: [],
  },
  settings: null,
  exchangeRate: null,
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_USER_EMAIL: 'SET_USER_EMAIL',
  SET_USER_SIMULATIONS: 'SET_USER_SIMULATIONS',
  ADD_SIMULATION: 'ADD_SIMULATION',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_EXCHANGE_RATE: 'SET_EXCHANGE_RATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER_EMAIL:
      localStorage.setItem('userEmail', action.payload);
      return {
        ...state,
        user: {
          ...state.user,
          email: action.payload,
        },
      };
    
    case actionTypes.SET_USER_SIMULATIONS:
      return {
        ...state,
        user: {
          ...state.user,
          simulations: action.payload,
        },
      };
    
    case actionTypes.ADD_SIMULATION:
      return {
        ...state,
        user: {
          ...state.user,
          simulations: [action.payload, ...state.user.simulations],
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
  
  // Fetch user simulations when email changes
  useQuery(
    ['userSimulations', state.user.email],
    () => api.getUserSimulations(state.user.email),
    {
      enabled: !!state.user.email,
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
    userEmail: state.user.email,
    setUserEmail: actions.setUserEmail,
    isLoggedIn: !!state.user.email,
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