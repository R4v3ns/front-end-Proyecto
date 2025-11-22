import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { usePreferences } from '@/contexts/PreferencesContext';
import {
  AVAILABLE_LANGUAGES,
  NOTIFICATION_DESCRIPTIONS,
  PRIVACY_DESCRIPTIONS,
  ThemeMode,
  Language,
  NotificationType,
} from '@/models/preferences';
// Importar expo-notifications de forma condicional
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications no está instalado');
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const maxContentWidth = 800; // Ancho máximo del contenido en desktop

export default function AccountPreferencesScreen() {
  const { preferences, updatePreferences } = usePreferences();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);
  
  // Color del proyecto para los switches
  const switchActiveColor = '#F22976';
  
  // Debug: Log preferences cuando cambian
  useEffect(() => {
    console.log('Current preferences:', preferences);
    console.log('UpdatePreferences function available:', typeof updatePreferences === 'function');
  }, [preferences, updatePreferences]);

  // Verificar permisos de notificaciones al cargar
  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        if (Notifications) {
          const { status } = await Notifications.getPermissionsAsync();
          setNotificationPermission(status === 'granted');
        } else {
          setNotificationPermission(false);
        }
      } else {
        // En web, verificar si el navegador soporta notificaciones
        setNotificationPermission('Notification' in window);
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setNotificationPermission(false);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        if (Notifications) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permisos de notificaciones',
              'Para recibir notificaciones, por favor activa los permisos en la configuración de tu dispositivo:\n\n' +
              'iOS: Configuración > Notificaciones > [Nombre de la app]\n' +
              'Android: Configuración > Aplicaciones > [Nombre de la app] > Notificaciones',
              [{ text: 'Entendido' }]
            );
          } else {
            setNotificationPermission(true);
          }
        } else {
          Alert.alert(
            'Permisos de notificaciones',
            'Para recibir notificaciones, por favor activa los permisos en la configuración de tu dispositivo:\n\n' +
            'iOS: Configuración > Notificaciones > [Nombre de la app]\n' +
            'Android: Configuración > Aplicaciones > [Nombre de la app] > Notificaciones',
            [{ text: 'Entendido' }]
          );
        }
      } else {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationPermission(true);
          } else {
            Alert.alert(
              'Permisos de notificaciones',
              'Para recibir notificaciones, por favor activa los permisos en la configuración de tu navegador.',
              [{ text: 'Entendido' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert(
        'Error',
        'No se pudieron solicitar los permisos de notificaciones. Por favor, activa los permisos manualmente en la configuración de tu dispositivo.'
      );
    }
  };

  const handleLanguageChange = async (language: Language) => {
    try {
      console.log('Changing language to:', language);
      await updatePreferences({ language });
      console.log('Language changed successfully');
      
      // Mostrar mensaje informativo
      const languageName = AVAILABLE_LANGUAGES.find(lang => lang.code === language)?.name || language;
      Alert.alert(
        'Idioma actualizado',
        `El idioma se ha cambiado a ${languageName}. La preferencia se ha guardado correctamente.\n\nNota: La traducción completa de la interfaz aún está en desarrollo.`,
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'No se pudo cambiar el idioma. Por favor, intenta nuevamente.');
    }
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    try {
      console.log('Changing theme to:', theme);
      await updatePreferences({ theme });
      console.log('Theme changed successfully');
      
      // Forzar actualización del tema
      const themeNames: Record<ThemeMode, string> = {
        light: 'Claro',
        dark: 'Oscuro',
        auto: 'Automático',
      };
      
      // El tema se aplicará automáticamente a través del contexto
      // Solo mostramos un mensaje de confirmación
      Alert.alert(
        'Tema actualizado',
        `El tema se ha cambiado a "${themeNames[theme]}". Los cambios se aplicarán inmediatamente.`,
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      console.error('Error changing theme:', error);
      Alert.alert('Error', 'No se pudo cambiar el tema. Por favor, intenta nuevamente.');
    }
  };

  const handleExplicitContentChange = async (value: boolean) => {
    try {
      console.log('Changing explicit content to:', value);
      await updatePreferences({ explicitContent: value });
      console.log('Explicit content setting changed successfully');
    } catch (error) {
      console.error('Error changing explicit content:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración. Por favor, intenta nuevamente.');
    }
  };

  const handleNotificationChange = async (type: NotificationType, value: boolean) => {
    try {
      if (value && notificationPermission === false) {
        requestNotificationPermissions();
        return;
      }
      console.log('Changing notification', type, 'to:', value);
      await updatePreferences({
        notifications: {
          ...preferences.notifications,
          [type]: value,
        },
      });
      console.log('Notification setting changed successfully');
    } catch (error) {
      console.error('Error changing notification:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración de notificaciones. Por favor, intenta nuevamente.');
    }
  };

  const handlePrivacyChange = async (key: keyof typeof preferences.privacy, value: boolean) => {
    try {
      console.log('Changing privacy', key, 'to:', value);
      await updatePreferences({
        privacy: {
          ...preferences.privacy,
          [key]: value,
        },
      });
      console.log('Privacy setting changed successfully');
    } catch (error) {
      console.error('Error changing privacy:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración de privacidad. Por favor, intenta nuevamente.');
    }
  };

  const showLanguagePicker = () => {
    const buttons = AVAILABLE_LANGUAGES.map((lang) => ({
      text: lang.name,
      onPress: () => {
        console.log('Language selected:', lang.name);
        handleLanguageChange(lang.code);
      },
      style: 'default' as const,
    }));
    
    buttons.push({ text: 'Cancelar', style: 'cancel' as const });
    
    Alert.alert(
      'Seleccionar idioma',
      'Elige tu idioma preferido',
      buttons
    );
  };

  const showThemePicker = () => {
    const themes: { label: string; value: ThemeMode; description: string }[] = [
      { label: 'Claro', value: 'light', description: 'Tema claro siempre activo' },
      { label: 'Oscuro', value: 'dark', description: 'Tema oscuro siempre activo' },
      { label: 'Automático', value: 'auto', description: 'Sigue la configuración del sistema' },
    ];

    const buttons = themes.map((theme) => ({
      text: `${theme.label} - ${theme.description}`,
      onPress: () => {
        console.log('Theme selected:', theme.label);
        handleThemeChange(theme.value);
      },
      style: 'default' as const,
    }));
    
    buttons.push({ text: 'Cancelar', style: 'cancel' as const });

    Alert.alert(
      'Seleccionar tema',
      'Elige cómo quieres que se vea la aplicación',
      buttons
    );
  };

  const getCurrentLanguageName = () => {
    return AVAILABLE_LANGUAGES.find((lang) => lang.code === preferences.language)?.name || 'Español';
  };

  const getCurrentThemeName = () => {
    const themes: Record<ThemeMode, string> = {
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Automático',
    };
    return themes[preferences.theme];
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#121212' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#121212' }, isMobile && styles.headerMobile]}>
        <View style={[styles.headerContent, !isMobile && styles.headerContentDesktop]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={isMobile ? 24 : 28} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
              Preferencias de cuenta
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor principal centrado en desktop */}
        <View style={[styles.mainContent, !isMobile && styles.mainContentDesktop]}>
        {/* Sección de Idioma */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Idioma</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Elige el idioma en el que quieres usar la aplicación
          </ThemedText>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={showLanguagePicker}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="language-outline" size={20} color={textColor} />
              <ThemedText style={styles.optionLabel}>Idioma</ThemedText>
            </View>
            <View style={styles.optionRight}>
              <ThemedText style={styles.optionValue}>{getCurrentLanguageName()}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección de Tema */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Apariencia</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Personaliza cómo se ve la aplicación
          </ThemedText>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={showThemePicker}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="color-palette-outline" size={20} color={textColor} />
              <ThemedText style={styles.optionLabel}>Tema</ThemedText>
            </View>
            <View style={styles.optionRight}>
              <ThemedText style={styles.optionValue}>{getCurrentThemeName()}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección de Contenido Explícito */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contenido</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Controla qué tipo de contenido puedes ver
          </ThemedText>
          <View style={styles.switchOption}>
            <View style={styles.switchLeft}>
              <Ionicons name="warning-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={styles.switchLabel}>Permitir contenido explícito</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  {preferences.explicitContent
                    ? 'Puedes ver y reproducir contenido marcado como explícito'
                    : 'El contenido marcado como explícito está oculto'}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`explicit-${preferences?.explicitContent}`}
              value={preferences?.explicitContent ?? false}
              onValueChange={(value) => {
                console.log('Explicit content switch toggled:', value);
                handleExplicitContentChange(value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={preferences?.explicitContent ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
        </View>

        {/* Sección de Notificaciones */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notificaciones</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Elige qué notificaciones quieres recibir
          </ThemedText>
          {notificationPermission === false && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#FFA500" />
              <ThemedText style={styles.warningText}>
                Los permisos de notificaciones están desactivados. Actívalos en la configuración de tu dispositivo.
              </ThemedText>
              <TouchableOpacity
                style={styles.warningButton}
                onPress={requestNotificationPermissions}
              >
                <ThemedText style={styles.warningButtonText}>Activar permisos</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {(Object.keys(NOTIFICATION_DESCRIPTIONS) as NotificationType[]).map((type) => (
            <View key={type} style={styles.switchOption}>
              <View style={styles.switchLeft}>
                <Ionicons 
                  name={
                    type === 'new_releases' ? 'musical-notes-outline' :
                    type === 'playlist_updates' ? 'list-outline' :
                    type === 'artist_updates' ? 'people-outline' :
                    'star-outline'
                  } 
                  size={20} 
                  color={textColor} 
                />
                <View style={styles.switchTextContainer}>
                  <ThemedText style={styles.switchLabel}>
                    {type === 'new_releases' ? 'Nuevos lanzamientos' :
                     type === 'playlist_updates' ? 'Actualizaciones de playlists' :
                     type === 'artist_updates' ? 'Actualizaciones de artistas' :
                     'Recomendaciones'}
                  </ThemedText>
                  <ThemedText style={styles.switchDescription}>
                    {NOTIFICATION_DESCRIPTIONS[type]}
                  </ThemedText>
                </View>
              </View>
              <Switch
                key={`notification-${type}-${preferences?.notifications?.[type]}`}
                value={preferences?.notifications?.[type] ?? false}
                onValueChange={(value) => {
                  console.log('Notification switch toggled:', type, value);
                  handleNotificationChange(type, value);
                }}
                trackColor={{ false: '#404040', true: switchActiveColor }}
                thumbColor={preferences?.notifications?.[type] ? switchActiveColor : '#B3B3B3'}
                ios_backgroundColor="#404040"
                disabled={notificationPermission === false}
              />
            </View>
          ))}
        </View>

        {/* Sección de Privacidad */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacidad</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Controla qué información compartes con otros usuarios
          </ThemedText>
          <View style={styles.switchOption}>
            <View style={styles.switchLeft}>
              <Ionicons name="time-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={styles.switchLabel}>Mostrar actividad reciente</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  {PRIVACY_DESCRIPTIONS.showRecentActivity}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-activity-${preferences?.privacy?.showRecentActivity}`}
              value={preferences?.privacy?.showRecentActivity ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showRecentActivity', value);
                handlePrivacyChange('showRecentActivity', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={preferences?.privacy?.showRecentActivity ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
          <View style={styles.switchOption}>
            <View style={styles.switchLeft}>
              <Ionicons name="musical-note-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={styles.switchLabel}>Mostrar historial de reproducción</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  {PRIVACY_DESCRIPTIONS.showListeningHistory}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-history-${preferences?.privacy?.showListeningHistory}`}
              value={preferences?.privacy?.showListeningHistory ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showListeningHistory', value);
                handlePrivacyChange('showListeningHistory', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={preferences?.privacy?.showListeningHistory ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
          <View style={styles.switchOption}>
            <View style={styles.switchLeft}>
              <Ionicons name="library-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={styles.switchLabel}>Mostrar playlists</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  {PRIVACY_DESCRIPTIONS.showPlaylists}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-playlists-${preferences?.privacy?.showPlaylists}`}
              value={preferences?.privacy?.showPlaylists ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showPlaylists', value);
                handlePrivacyChange('showPlaylists', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={preferences?.privacy?.showPlaylists ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
        </View>
        </View>
        {/* Fin del contenedor principal */}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerContent: {
    width: '100%',
  },
  headerContentDesktop: {
    maxWidth: maxContentWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitleMobile: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  scrollContentMobile: {
    padding: 16,
    paddingBottom: 32,
  },
  mainContent: {
    width: '100%',
  },
  mainContentDesktop: {
    maxWidth: maxContentWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 20,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282828',
    marginBottom: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  optionValue: {
    fontSize: 14,
    color: '#B3B3B3',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282828',
    marginBottom: 12,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  switchDescription: {
    fontSize: 13,
    color: '#B3B3B3',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  warningBox: {
    flexDirection: 'column',
    padding: 16,
    backgroundColor: '#2A1F00',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA500',
    marginBottom: 16,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#FFA500',
    lineHeight: 20,
    flex: 1,
  },
  warningButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  warningButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});

