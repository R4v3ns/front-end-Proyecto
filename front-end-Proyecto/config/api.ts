import Constants from 'expo-constants';
import { Platform } from 'react-native';

// URL base del backend - se puede configurar con variables de entorno
// Para desarrollo local: http://localhost:8080 o http://192.168.x.x:8080
// Para producción: https://tu-api.com
const getApiBaseUrl = (): string => {
  // Prioridad 1: Variable de entorno
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('🔧 Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Prioridad 2: Configuración en app.json
  if (Constants.expoConfig?.extra?.apiUrl) {
    let apiUrl = Constants.expoConfig.extra.apiUrl;
    console.log('🔧 Using app.json apiUrl:', apiUrl);
    
    // Si estamos en móvil y la URL es localhost, reemplazar con IP local
    if (Platform.OS !== 'web' && apiUrl.includes('localhost')) {
      console.warn('⚠️ Mobile platform detected with localhost. Replacing with local IP...');
      // Reemplazar localhost con la IP local por defecto
      apiUrl = apiUrl.replace('localhost', '192.168.0.21');
      console.warn('⚠️ Updated URL for mobile:', apiUrl);
      console.warn('💡 Tip: If this IP is incorrect, update it in config/api.ts or app.json');
    }
    
    // Si estamos en web y la URL es localhost, verificar que el backend esté accesible
    if (Platform.OS === 'web' && apiUrl.includes('localhost')) {
      console.warn('⚠️ Web platform detected with localhost. Make sure your backend is running and CORS is configured correctly.');
      console.warn('💡 Tip: If you get connection errors, try using your machine IP address instead of localhost.');
    }
    
    return apiUrl;
  }
  
  // Prioridad 3: Valor por defecto
  // Para dispositivos móviles/Expo, usar IP local en lugar de localhost
  // Para web, usar localhost
  const defaultUrl = Platform.OS === 'web' 
    ? 'http://localhost:8080'
    : 'http://192.168.0.21:8080'; // IP local de tu máquina - actualiza según tu red
  
  console.log('🔧 Using default API URL:', defaultUrl);
  console.log(`🔧 Platform: ${Platform.OS}`);
  
  if (Platform.OS === 'web') {
    console.warn('⚠️ Web platform detected. Make sure your backend is running on http://localhost:8080');
  } else {
    console.warn('⚠️ Mobile platform detected. Make sure your backend is accessible at http://192.168.0.21:8080');
    console.warn('💡 Tip: If connection fails, check that both devices are on the same network and update the IP in config/api.ts');
  }
  
  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Log la URL final que se está usando
console.log('🌐 API Base URL configured:', API_BASE_URL);

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
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
  },
} as const;

