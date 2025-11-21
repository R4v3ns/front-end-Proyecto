/**
 * Modelos de datos para autenticación
 */

/**
 * Credenciales para iniciar sesión
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para registro de nuevo usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName?: string;
  lastName?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

/**
 * Datos para solicitar recuperación de contraseña
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Datos para restablecer contraseña
 */
export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Datos para cambiar contraseña
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Respuesta de autenticación del backend
 */
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

