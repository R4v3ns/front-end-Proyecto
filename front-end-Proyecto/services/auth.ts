import { ApiClient, ApiError } from './api';
import { ENDPOINTS } from '@/config/api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthResponse,
} from '@/models/auth';

const TOKEN_KEY = 'auth_token';
const isWeb = Platform.OS === 'web';

// Función helper para obtener el token
const getAuthToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Re-exportar tipos desde models para compatibilidad
export type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthResponse,
} from '@/models/auth';

// Servicio de autenticación
export class AuthService {
  /**
   * Inicia sesión con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService.login - Sending request to:', ENDPOINTS.AUTH.LOGIN);
      console.log('AuthService.login - Credentials:', { email: credentials.email, password: '***' });
      
      const response = await ApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );
      
      console.log('AuthService.login - Raw response:', JSON.stringify(response, null, 2));
      console.log('AuthService.login - Response data:', response.data);
      
      // La respuesta puede venir directamente en response.data o anidada
      const responseData = response.data || response;
      
      // Si responseData es un string, intentar parsearlo
      if (typeof responseData === 'string') {
        try {
          return JSON.parse(responseData);
        } catch {
          return { token: responseData } as AuthResponse;
        }
      }
      
      return responseData as AuthResponse;
    } catch (error: any) {
      console.error('AuthService.login - Error caught:', error);
      console.error('AuthService.login - Error type:', error?.constructor?.name);
      console.error('AuthService.login - Error instanceof ApiError:', error instanceof ApiError);
      console.error('AuthService.login - Error has status property:', 'status' in error);
      console.error('AuthService.login - Error status value:', error?.status);
      
      // Verificar si es un ApiError por instanceof o por propiedades
      const isApiError = error instanceof ApiError || 
                        (error && typeof error === 'object' && 'status' in error && error.constructor?.name === 'ApiError');
      
      if (isApiError) {
        console.error('AuthService.login - ApiError details:', {
          message: error.message,
          status: error.status,
          data: error.data,
        });
        
        // Si es un error de conexión (status 0), usar el mensaje completo del ApiError
        if (error.status === 0) {
          console.error('AuthService.login - Network error detected (status 0)');
          // El ApiError ya contiene un mensaje detallado sobre el problema de conexión
          const errorMessage = error?.message || 
            `Error de conexión con el servidor.\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new Error(errorMessage);
        }
        
        // Para otros errores de API, extraer el mensaje del backend
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al iniciar sesión';
        console.error('AuthService.login - API error message:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Manejar errores de red que no sean ApiError (fallback)
      if (error instanceof TypeError || 
          (error instanceof Error && 
           (error.message.includes('fetch') || 
            error.message.includes('Network request failed') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError')))) {
        console.error('AuthService.login - Network error detected (TypeError)');
        const errorMessage = `Error de conexión con el servidor.\n\n` +
          `Posibles causas:\n` +
          `1. El servidor backend no está corriendo\n` +
          `2. La IP o puerto no es correcto\n` +
          `3. El teléfono y la computadora no están en la misma red\n` +
          `4. Un firewall está bloqueando la conexión\n\n` +
          `Verifica la configuración en config/api.ts o app.json`;
        throw new Error(errorMessage);
      }
      
      // Otros errores desconocidos
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('AuthService.login - Unknown error:', errorMessage);
      console.error('AuthService.login - Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error al iniciar sesión: ${errorMessage}`);
    }
  }

  /**
   * Registra un nuevo usuario con email
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        {
          email: userData.email,
          password: userData.password,
          passwordConfirmation: userData.passwordConfirmation,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          termsAccepted: userData.termsAccepted || false,
          privacyAccepted: userData.privacyAccepted || false,
        }
      );
      return response.data || {};
    } catch (error) {
      if (error instanceof ApiError) {
        // El backend retorna errores con estructura { error: "...", field: "..." }
        const errorMessage = error.data?.error || error.message || 'Error al registrar usuario';
        const errorField = error.data?.field;
        const errorWithField = new Error(errorMessage) as Error & { field?: string };
        if (errorField) {
          errorWithField.field = errorField;
        }
        throw errorWithField;
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Solicita recuperación de contraseña
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      // Intentar usar el endpoint de forgot-password si está disponible
      // Si no está disponible, usar resend-email-verification como fallback
      try {
        const response = await ApiClient.post<{ message: string }>(
          ENDPOINTS.AUTH.FORGOT_PASSWORD,
          {
            email: data.email,
          }
        );
        return response.data || { message: 'Se ha enviado un email con las instrucciones' };
      } catch (forgotError) {
        // Si el endpoint no existe (404), usar el fallback
        if (forgotError instanceof ApiError && forgotError.status === 404) {
          console.warn('Endpoint forgot-password no disponible, usando resend-email-verification como fallback');
          const response = await ApiClient.post<{ message: string }>(
            ENDPOINTS.AUTH.RESEND_EMAIL_VERIFICATION,
            {
              email: data.email,
            }
          );
          return response.data || { message: 'Se ha enviado un email con las instrucciones' };
        }
        throw forgotError;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || error.message || 'Error al solicitar recuperación';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Restablece la contraseña con el token recibido
   */
  static async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await ApiClient.post<{ message: string }>(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token: data.token,
          password: data.password,
        }
      );
      return response.data || { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Error al restablecer la contraseña');
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  static async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await ApiClient.post<{ message: string }>(
        ENDPOINTS.USERS.CHANGE_PASSWORD,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data || { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al cambiar la contraseña';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }
}

export default AuthService;

