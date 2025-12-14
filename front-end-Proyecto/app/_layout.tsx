import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { ToastContainer } from '@/components/ui/toast';
import MiniPlayer from '@/components/music/MiniPlayer';

// Estilos CSS para switches en web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input[type="checkbox"].switch-input:checked + .switch-track {
      background-color: #F22976 !important;
    }
    input[type="checkbox"].switch-input:checked + .switch-track .switch-thumb {
      background-color: #F22976 !important;
    }
    .switch-thumb {
      background-color: #F22976 !important;
    }
  `;
  document.head.appendChild(style);
}

export const unstable_settings = {
  initialRouteName: 'home',
};

function ThemedLayout() {
  const systemColorScheme = useColorScheme();
  const { currentTheme, preferences } = usePreferences();
  
  // Usar el tema de las preferencias si está configurado, sino usar el del sistema
  const colorScheme = useMemo(() => {
    return currentTheme || systemColorScheme || 'light';
  }, [currentTheme, systemColorScheme]);
  
  // Log para debugging
  console.log('🎨 [_layout] Theme preferences:', preferences.theme);
  console.log('🎨 [_layout] Current theme:', currentTheme);
  console.log('🎨 [_layout] System color scheme:', systemColorScheme);
  console.log('🎨 [_layout] Final color scheme:', colorScheme);
  
  // Determinar el estilo de la StatusBar basado en el tema
  const statusBarStyle = useMemo(() => {
    return colorScheme === 'dark' ? 'light' : 'dark';
  }, [colorScheme]);
  
  // Forzar re-render cuando cambie el tema usando una key única basada en el colorScheme y preferences.theme
  const themeKey = useMemo(() => {
    return `theme-${colorScheme}-${preferences.theme}`;
  }, [colorScheme, preferences.theme]);
  
  // Seleccionar el tema de React Navigation
  const navigationTheme = useMemo(() => {
    return colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  }, [colorScheme]);
  
  // Log adicional para debugging
  useEffect(() => {
    console.log('🎨 [_layout] Theme changed - Re-rendering with key:', themeKey);
    console.log('🎨 [_layout] Using theme:', colorScheme === 'dark' ? 'DarkTheme' : 'DefaultTheme');
    console.log('🎨 [_layout] Navigation theme:', navigationTheme);
  }, [themeKey, colorScheme, preferences.theme, navigationTheme]);

  return (
    <ThemeProvider key={themeKey} value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="account-preferences" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={statusBarStyle} />
      <ToastContainer />
      <MiniPlayer />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <QueryProvider>
          <PlayerProvider>
            <ThemedLayout />
          </PlayerProvider>
        </QueryProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
