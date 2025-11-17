import Constants from 'expo-constants';

// URL base del backend - se puede configurar con variables de entorno
// Para desarrollo local: http://localhost:8080 o http://192.168.x.x:8080
// Para producción: https://tu-api.com
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:8080';

// Configuración de la API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Endpoints del backend
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register/email',
    REGISTER_COMPAT: '/api/users/register', // Compatibilidad
    REGISTER_PHONE: '/api/users/register/phone',
    VERIFY_EMAIL: '/api/users/verify-email',
    RESEND_EMAIL_VERIFICATION: '/api/users/resend-email-verification',
    LOGOUT: '/api/users/logout',
  },
  // Agrega más endpoints aquí según necesites
  USERS: '/api/users',
} as const;

