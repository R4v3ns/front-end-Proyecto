import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
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
  const { currentTheme } = usePreferences();
  
  // Usar el tema de las preferencias si está configurado, sino usar el del sistema
  const colorScheme = currentTheme || systemColorScheme;
  
  // Determinar el estilo de la StatusBar basado en el tema
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
