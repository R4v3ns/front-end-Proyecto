import ApiClient, { ApiError } from './api';
import { ENDPOINTS } from '@/config/api';

// Tipos para autenticación (basados en el backend real)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName?: string;
  lastName?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: string | number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  message?: string;
  error?: string;
  field?: string;
}

// Servicio de autenticación
export class AuthService {
  /**
   * Inicia sesión con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔵 AuthService.login - Sending request to:', ENDPOINTS.AUTH.LOGIN);
      console.log('🔵 AuthService.login - Credentials:', { email: credentials.email, password: '***' });
      
      const response = await ApiClient.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );
      
      console.log('🔵 AuthService.login - Raw response:', JSON.stringify(response, null, 2));
      console.log('🔵 AuthService.login - Response data:', response.data);
      
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
    } catch (error) {
      console.error('🔴 AuthService.login - Error caught:', error);
      if (error instanceof ApiError) {
        console.error('🔴 AuthService.login - ApiError details:', {
          message: error.message,
          status: error.status,
          data: error.data,
        });
        // El backend retorna { error: "Invalid credentials" } para credenciales incorrectas
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al iniciar sesión';
        throw new Error(errorMessage);
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('🔴 AuthService.login - Unknown error:', errorMessage);
      throw new Error(`Error de conexión: ${errorMessage}. Verifica tu conexión a internet.`);
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
   * Solicita recuperación de contraseña (nota: el backend actual no tiene este endpoint)
   * Por ahora redirige a reenvío de verificación de email como alternativa
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      // Como el backend no tiene forgot-password, usamos resend-email-verification
      const response = await ApiClient.post<{ message: string }>(
        ENDPOINTS.AUTH.RESEND_EMAIL_VERIFICATION,
        {
          email: data.email,
        }
      );
      return response.data || { message: 'Se ha enviado un email con las instrucciones' };
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
}

export default AuthService;

