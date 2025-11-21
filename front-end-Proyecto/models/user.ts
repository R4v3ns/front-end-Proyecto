/**
 * Modelos de datos para usuarios
 */

export type UserPlan = 'Free' | 'VIP';

/**
 * Modelo de usuario completo
 */
export interface User {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  biography?: string;
  phone?: string;
  birthDate?: string; // Formato: DD/MM/YYYY (sin UTC)
  profileImage?: string;
  bannerColor?: string;
  bannerImage?: string;
  plan?: UserPlan;
}

/**
 * Datos para actualizar el perfil de usuario
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  name?: string; // Nombre de usuario (alias) - se mapea a "username" en el backend
  username?: string; // Campo que el backend espera para el nombre de usuario
  biography?: string;
  phone?: string;
  birthDate?: string; // Formato: DD/MM/YYYY (sin UTC)
  profileImage?: string;
  bannerColor?: string;
  bannerImage?: string;
  plan?: UserPlan;
}

/**
 * Respuesta del perfil de usuario desde el backend
 */
export interface UserProfileResponse {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Nombre de usuario (alias) - puede venir como "name" o "username"
  username?: string; // Nombre de usuario (alias) - el backend puede devolver esto en lugar de "name"
  biography?: string;
  phone?: string;
  birthDate?: string; // Formato: DD/MM/YYYY (sin UTC)
  profileImage?: string;
  bannerColor?: string;
  bannerImage?: string;
  plan?: UserPlan;
  message?: string;
}

