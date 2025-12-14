import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { UserPreferences, DEFAULT_PREFERENCES, ThemeMode } from '@/models/preferences';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from './AuthContext';
import { UserService } from '@/services/user';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  applyTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_KEY = 'user_preferences';

// Helper functions para manejar almacenamiento según la plataforma
const isWeb = Platform.OS === 'web';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Error reading from SecureStore:', error);
        return null;
      }
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        throw error;
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error writing to SecureStore:', error);
        throw error;
      }
    }
  },
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();
  const { user } = useAuth();

  // Cargar preferencias al iniciar
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      console.log('Loading preferences...');
      
      // Intentar cargar desde el backend si el usuario está autenticado
      if (user) {
        try {
          console.log('User authenticated, loading preferences from backend...');
          const backendPreferences = await UserService.getPreferences();
          if (backendPreferences && Object.keys(backendPreferences).length > 0) {
            console.log('Found backend preferences:', backendPreferences);
            const loadedPreferences: UserPreferences = {
              ...DEFAULT_PREFERENCES,
              ...backendPreferences,
              notifications: {
                ...DEFAULT_PREFERENCES.notifications,
                ...(backendPreferences.notifications || {}),
              },
              privacy: {
                ...DEFAULT_PREFERENCES.privacy,
                ...(backendPreferences.privacy || {}),
              },
            };
            console.log('Loaded preferences from backend:', loadedPreferences);
            setPreferences(loadedPreferences);
            // Guardar también en storage local
            await storage.setItem(PREFERENCES_KEY, JSON.stringify(loadedPreferences));
            setIsLoading(false);
            return;
          }
        } catch (backendError) {
          console.warn('Error loading preferences from backend, falling back to local storage:', backendError);
        }
      }
      
      // Fallback a storage local
      const storedPreferences = await storage.getItem(PREFERENCES_KEY);
      
      if (storedPreferences) {
        console.log('Found stored preferences:', storedPreferences);
        const parsedPreferences = JSON.parse(storedPreferences) as UserPreferences;
        // Validar y fusionar con valores por defecto
        const loadedPreferences: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...parsedPreferences,
          notifications: {
            ...DEFAULT_PREFERENCES.notifications,
            ...(parsedPreferences.notifications || {}),
          },
          privacy: {
            ...DEFAULT_PREFERENCES.privacy,
            ...(parsedPreferences.privacy || {}),
          },
        };
        console.log('Loaded preferences:', loadedPreferences);
        setPreferences(loadedPreferences);
      } else {
        // Si no hay preferencias guardadas, usar las por defecto
        console.log('No stored preferences found, using defaults');
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    try {
      console.log('🔄 PreferencesContext.updatePreferences - Updating:', newPreferences);
      console.log('📋 PreferencesContext.updatePreferences - Current:', preferences);
      
      // Crear preferencias actualizadas combinando las actuales con las nuevas
      const updatedPreferences: UserPreferences = {
        ...preferences,
        ...newPreferences,
        notifications: {
          ...preferences.notifications,
          ...(newPreferences.notifications || {}),
        },
        privacy: {
          ...preferences.privacy,
          ...(newPreferences.privacy || {}),
        },
      };
      
      console.log('✅ PreferencesContext.updatePreferences - Merged preferences:', updatedPreferences);
      
      // Actualizar el estado INMEDIATAMENTE para feedback visual
      setPreferences(updatedPreferences);
      console.log('✅ PreferencesContext.updatePreferences - State updated immediately');
      
      // Guardar en storage local PRIMERO (siempre funciona)
      try {
        await storage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
        console.log('💾 PreferencesContext.updatePreferences - Saved to local storage');
      } catch (storageError) {
        console.error('❌ Error saving to local storage:', storageError);
        // Continuar aunque falle el storage local
      }
      
      // Intentar guardar en el backend si el usuario está autenticado
      if (user) {
        try {
          console.log('🌐 PreferencesContext.updatePreferences - Saving to backend...');
          const backendResponse = await UserService.updatePreferences(newPreferences);
          console.log('✅ PreferencesContext.updatePreferences - Backend response:', backendResponse);
          
          // Si el backend devuelve las preferencias completas actualizadas, usarlas
          if (backendResponse && typeof backendResponse === 'object' && Object.keys(backendResponse).length > 0) {
            const backendPrefs = backendResponse as any;
            
            // Verificar si la respuesta contiene las preferencias completas o solo las actualizadas
            const finalPreferences: UserPreferences = {
              ...DEFAULT_PREFERENCES,
              ...updatedPreferences, // Mantener las preferencias que ya actualizamos
              ...backendPrefs, // Sobrescribir con lo que viene del backend
              notifications: {
                ...DEFAULT_PREFERENCES.notifications,
                ...updatedPreferences.notifications,
                ...(backendPrefs.notifications || {}),
              },
              privacy: {
                ...DEFAULT_PREFERENCES.privacy,
                ...updatedPreferences.privacy,
                ...(backendPrefs.privacy || {}),
              },
            };
            
            // Actualizar estado con las preferencias finales del backend
            setPreferences(finalPreferences);
            console.log('✅ PreferencesContext.updatePreferences - State updated from backend');
            
            // Guardar en storage local las preferencias finales
            try {
              await storage.setItem(PREFERENCES_KEY, JSON.stringify(finalPreferences));
              console.log('💾 PreferencesContext.updatePreferences - Saved final preferences to local storage');
            } catch (storageError) {
              console.error('❌ Error saving final preferences to local storage:', storageError);
            }
          }
        } catch (backendError) {
          console.warn('⚠️ PreferencesContext.updatePreferences - Backend error (but local update succeeded):', backendError);
          // NO lanzar error - las preferencias ya se guardaron localmente y el estado ya se actualizó
          // Esto permite que la app funcione incluso sin conexión al backend
        }
      } else {
        console.log('ℹ️ PreferencesContext.updatePreferences - No user authenticated, only saving locally');
      }
    } catch (error) {
      console.error('❌ PreferencesContext.updatePreferences - Unexpected error:', error);
      // No lanzar error para que la UI no se rompa
      // El estado ya se actualizó, así que el usuario verá el cambio
    }
  }, [preferences, user]);

  // Calcular el tema actual basado en las preferencias
  // Usar useMemo para recalcular cuando cambien las preferencias o el sistema
  const currentTheme: 'light' | 'dark' = useMemo(() => {
    if (preferences.theme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    } else if (preferences.theme === 'light') {
      return 'light';
    } else if (preferences.theme === 'dark') {
      return 'dark';
    }
    // Fallback
    return 'light';
  }, [preferences.theme, systemColorScheme]);

  // Efecto para aplicar el tema cuando cambia
  useEffect(() => {
    console.log('🎨 [PreferencesContext] Theme changed, applying:', preferences.theme);
    console.log('🎨 [PreferencesContext] Current theme calculated:', currentTheme);
    console.log('🎨 [PreferencesContext] System color scheme:', systemColorScheme);
    // El tema se aplica automáticamente a través de currentTheme en _layout.tsx
  }, [preferences.theme, currentTheme, systemColorScheme]);

  const applyTheme = () => {
    // Esta función se llama cuando cambia el tema
    // El tema se aplica automáticamente a través de currentTheme
    console.log('Theme applied:', preferences.theme);
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    applyTheme,
    currentTheme,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

