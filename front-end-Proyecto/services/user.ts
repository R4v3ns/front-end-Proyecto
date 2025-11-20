import ApiClient, { ApiError } from './api';
import { ENDPOINTS } from '@/config/api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

// Tipos para el perfil de usuario
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  name?: string;
  biography?: string;
  phone?: string;
  birthDate?: string;
  profileImage?: string;
  bannerColor?: string;
  bannerImage?: string;
}

export interface UserProfileResponse {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  biography?: string;
  phone?: string;
  birthDate?: string;
  profileImage?: string;
  bannerColor?: string;
  bannerImage?: string;
  message?: string;
}

// Servicio de usuario
export class UserService {
  /**
   * Actualiza el perfil del usuario
   */
  static async updateProfile(profileData: UpdateProfileData): Promise<UserProfileResponse> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      console.log('👤 UserService.updateProfile - Sending request to:', ENDPOINTS.USERS.UPDATE_PROFILE);
      console.log('👤 UserService.updateProfile - Data:', { ...profileData, profileImage: profileData.profileImage ? 'Image provided' : 'No image' });

      const response = await ApiClient.put<UserProfileResponse>(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('👤 UserService.updateProfile - Response:', response.data);
      return response.data || {} as UserProfileResponse;
    } catch (error) {
      console.error('👤 UserService.updateProfile - Error:', error);
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al actualizar el perfil';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Obtiene el perfil del usuario
   */
  static async getProfile(): Promise<UserProfileResponse> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      console.log('👤 UserService.getProfile - Sending request to:', ENDPOINTS.USERS.PROFILE);

      const response = await ApiClient.get<UserProfileResponse>(
        ENDPOINTS.USERS.PROFILE,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('👤 UserService.getProfile - Response:', response.data);

      return response.data || {} as UserProfileResponse;
    } catch (error) {
      console.error('👤 UserService.getProfile - Error:', error);
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al obtener el perfil';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }
}

export default UserService;

