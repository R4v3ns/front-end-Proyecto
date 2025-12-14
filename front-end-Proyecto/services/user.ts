import ApiClient, { ApiError } from './api';
import { ENDPOINTS } from '@/config/api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { UpdateProfileData, UserProfileResponse } from '@/models/user';
import { formatBirthDateFromISO, formatBirthDateToBackend } from '@/utils/date';

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
export type { UpdateProfileData, UserProfileResponse } from '@/models/user';

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

      // Preparar datos para enviar al backend
      // Convertir birthDate de DD/MM/YYYY a YYYY-MM-DD si existe
      const dataToSend: UpdateProfileData = {
        ...profileData,
        birthDate: profileData.birthDate 
          ? formatBirthDateToBackend(profileData.birthDate) 
          : undefined,
      };

      console.log('UserService.updateProfile - Sending request to:', ENDPOINTS.USERS.UPDATE_PROFILE);
      console.log('UserService.updateProfile - Data summary:', { 
        ...dataToSend, 
        profileImage: dataToSend.profileImage ? `Image provided (${dataToSend.profileImage.length} chars)` : 'No image',
        bannerImage: dataToSend.bannerImage ? `Banner provided (${dataToSend.bannerImage.length} chars)` : 'No banner',
        bannerColor: dataToSend.bannerColor || 'No color',
        username: dataToSend.username,
        name: dataToSend.name,
      });
      
      // Log completo pero truncar imágenes para no saturar la consola
      const dataToLog = { ...dataToSend };
      if (dataToLog.profileImage && typeof dataToLog.profileImage === 'string') {
        dataToLog.profileImage = `[TRUNCATED: ${dataToLog.profileImage.length} chars] ${dataToLog.profileImage.substring(0, 50)}...`;
      }
      if (dataToLog.bannerImage && typeof dataToLog.bannerImage === 'string') {
        dataToLog.bannerImage = `[TRUNCATED: ${dataToLog.bannerImage.length} chars] ${dataToLog.bannerImage.substring(0, 50)}...`;
      }
      console.log('UserService.updateProfile - Full data (images truncated):', JSON.stringify(dataToLog, null, 2));

      const response = await ApiClient.put<UserProfileResponse>(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convertir birthDate de respuesta del backend (YYYY-MM-DD o ISO) a DD/MM/YYYY
      const responseData = response.data || {} as UserProfileResponse;
      if (responseData.birthDate) {
        responseData.birthDate = formatBirthDateFromISO(responseData.birthDate);
      }

      console.log('UserService.updateProfile - Response:', responseData);
      console.log('UserService.updateProfile - Response username field:', responseData.username);
      console.log('UserService.updateProfile - Response name field:', responseData.name);
      console.log('UserService.updateProfile - Full response JSON:', JSON.stringify(responseData, null, 2));
      return responseData;
    } catch (error) {
      console.error('UserService.updateProfile - Error:', error);
      console.error('UserService.updateProfile - Error type:', error instanceof ApiError ? 'ApiError' : typeof error);
      if (error instanceof ApiError) {
        console.error('UserService.updateProfile - ApiError status:', error.status);
        console.error('UserService.updateProfile - ApiError data:', error.data);
        console.error('UserService.updateProfile - ApiError message:', error.message);
        
        // Si es un error de token expirado, asegurarse de que el mensaje lo refleje
        const isTokenExpired = error.status === 401 || 
          error.message.includes('Token expirado') ||
          error.message.includes('token expirado') ||
          error.message.includes('Token expired') ||
          (error.data && (
            error.data.error?.includes('Token expirado') ||
            error.data.error?.includes('token expirado') ||
            error.data.error?.includes('Token expired')
          ));
        
        if (isTokenExpired) {
          console.warn('UserService.updateProfile - Token expired detected, throwing error with clear message');
          throw new Error('Token expirado');
        }
        
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

      console.log('UserService.getProfile - Sending request to:', ENDPOINTS.USERS.PROFILE);

      const response = await ApiClient.get<UserProfileResponse>(
        ENDPOINTS.USERS.PROFILE,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convertir birthDate de respuesta del backend (YYYY-MM-DD o ISO) a DD/MM/YYYY
      const responseData = response.data || {} as UserProfileResponse;
      if (responseData.birthDate) {
        responseData.birthDate = formatBirthDateFromISO(responseData.birthDate);
      }

      console.log('UserService.getProfile - Response:', responseData);
      console.log('UserService.getProfile - Response name field:', responseData.name);
      console.log('UserService.getProfile - Full response JSON:', JSON.stringify(responseData, null, 2));

      return responseData;
    } catch (error) {
      console.error('UserService.getProfile - Error:', error);
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

  /**
   * Obtiene las preferencias del usuario
   */
  static async getPreferences(): Promise<any> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await ApiClient.get(
        ENDPOINTS.USERS.GET_PREFERENCES,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data?.preferences || response.data || {};
    } catch (error) {
      console.error('UserService.getPreferences - Error:', error);
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al obtener las preferencias';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }

  /**
   * Actualiza las preferencias del usuario
   */
  static async updatePreferences(preferences: Partial<any>): Promise<any> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      console.log('UserService.updatePreferences - Sending:', preferences);

      const response = await ApiClient.put(
        ENDPOINTS.USERS.PREFERENCES,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('UserService.updatePreferences - Response:', response.data);

      // El backend devuelve { message, preferences }
      const responseData = response.data;
      if (responseData?.preferences) {
        return responseData.preferences;
      }
      
      // Si no viene en preferences, devolver todo el response.data
      return responseData || {};
    } catch (error) {
      console.error('UserService.updatePreferences - Error:', error);
      if (error instanceof ApiError) {
        const errorMessage = error.data?.error || 
                            error.data?.message || 
                            error.message || 
                            'Error al actualizar las preferencias';
        throw new Error(errorMessage);
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
  }
}

export default UserService;

