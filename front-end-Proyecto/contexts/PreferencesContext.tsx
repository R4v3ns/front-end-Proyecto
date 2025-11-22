import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { UserPreferences, DEFAULT_PREFERENCES, ThemeMode } from '@/models/preferences';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from './AuthContext';

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

  // Cargar preferencias al iniciar
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      console.log('Loading preferences...');
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
      console.log('Updating preferences:', newPreferences);
      console.log('Current preferences:', preferences);
      
      setPreferences((currentPrefs) => {
        const updatedPreferences: UserPreferences = {
          ...currentPrefs,
          ...newPreferences,
          notifications: {
            ...currentPrefs.notifications,
            ...(newPreferences.notifications || {}),
          },
          privacy: {
            ...currentPrefs.privacy,
            ...(newPreferences.privacy || {}),
          },
        };
        
        console.log('Saving preferences:', updatedPreferences);
        // Guardar en storage de forma asíncrona
        storage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences))
          .then(() => console.log('Preferences saved successfully'))
          .catch((err) => console.error('Error saving preferences:', err));
        
        return updatedPreferences;
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [preferences]);

  // Calcular el tema actual basado en las preferencias
  const currentTheme: 'light' | 'dark' = 
    preferences.theme === 'auto' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : preferences.theme;

  // Efecto para aplicar el tema cuando cambia
  useEffect(() => {
    console.log('Theme changed, applying:', preferences.theme);
    console.log('Current theme calculated:', currentTheme);
    // El tema se aplica automáticamente a través de currentTheme en _layout.tsx
  }, [preferences.theme, currentTheme]);

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

