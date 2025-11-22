import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/models/user';
import { formatBirthDateFromISO } from '@/utils/date';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error removing from SecureStore:', error);
      }
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      const storedUser = await storage.getItem(USER_KEY);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        const userData = JSON.parse(storedUser) as User;
        // Convertir birthDate de ISO a DD/MM/YYYY si existe
        if (userData.birthDate) {
          userData.birthDate = formatBirthDateFromISO(userData.birthDate);
        }
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User, authToken: string) => {
    try {
      // Convertir birthDate de ISO a DD/MM/YYYY si existe
      const formattedUser = { ...userData };
      if (formattedUser.birthDate) {
        formattedUser.birthDate = formatBirthDateFromISO(formattedUser.birthDate);
      }
      
      await storage.setItem(TOKEN_KEY, authToken);
      await storage.setItem(USER_KEY, JSON.stringify(formattedUser));
      setToken(authToken);
      setUser(formattedUser);
      console.log('Auth data saved successfully');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem(TOKEN_KEY);
      await storage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      // Convertir birthDate de ISO a DD/MM/YYYY si existe
      const formattedUser = { ...userData };
      if (formattedUser.birthDate) {
        formattedUser.birthDate = formatBirthDateFromISO(formattedUser.birthDate);
      }
      
      console.log('AuthContext.updateUser - Saving user data:', formattedUser);
      setUser(formattedUser);
      await storage.setItem(USER_KEY, JSON.stringify(formattedUser));
      console.log('AuthContext.updateUser - User data saved successfully');
    } catch (error) {
      console.error('AuthContext.updateUser - Error updating user data:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateUser,
  };

  // No bloquear el renderizado mientras carga, solo mostrar el contexto
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

