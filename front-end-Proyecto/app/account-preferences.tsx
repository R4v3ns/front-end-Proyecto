import { useState, useEffect, useRef, useMemo } from 'react';
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
import { useTranslation } from '@/hooks/useTranslation';
import {
  AVAILABLE_LANGUAGES,
  NOTIFICATION_DESCRIPTIONS,
  PRIVACY_DESCRIPTIONS,
  ThemeMode,
  Language,
  NotificationType,
  UserPreferences,
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
  const { preferences, updatePreferences, currentTheme } = usePreferences();
  const { t, language } = useTranslation();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(() => {
    console.log('🔄 [account-preferences] Initializing localPreferences:', preferences);
    return preferences;
  });
  
  // Estado para modales personalizados en web
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  
  // Sincronizar preferencias locales con el contexto cuando cambien
  // Usar useRef para rastrear el último valor y evitar comparaciones innecesarias
  const prevPreferencesRef = useRef<string>('');
  const isUpdatingRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Si estamos actualizando manualmente, no sincronizar desde el contexto
    if (isUpdatingRef.current) {
      console.log('⏭️ [account-preferences] Update in progress, skipping sync');
      return;
    }
    
    const currentPrefsStr = JSON.stringify(preferences);
    const prevPrefsStr = prevPreferencesRef.current;
    
    console.log('🔄 [account-preferences] Preferences changed from context:', preferences);
    console.log('🔄 [account-preferences] Current localPreferences:', localPreferences);
    
    // Solo actualizar si realmente cambió (comparar strings serializados)
    if (currentPrefsStr !== prevPrefsStr) {
      console.log('✅ [account-preferences] Updating localPreferences from context');
      prevPreferencesRef.current = currentPrefsStr;
      setLocalPreferences(preferences);
    } else {
      console.log('⏭️ [account-preferences] No update needed, preferences are the same');
    }
  }, [preferences]);
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);
  
  // Paleta de colores de Adobe Color
  const colorPalette = {
    purple: '#7129F2',
    magenta: '#F229EE',
    blue: '#2F29F2',
    pink: '#F22976', // Color principal ya en uso
    lightPurple: '#CC7AF2',
    black: '#000000',
    white: '#FFFFFF',
  };
  
  // Color del proyecto para los switches
  const switchActiveColor = colorPalette.pink;
  
  // Estilos dinámicos basados en el tema
  const isDark = currentTheme === 'dark';
  console.log('🎨 [account-preferences] isDark:', isDark, 'currentTheme:', currentTheme);
  const borderColor = isDark ? '#333333' : '#CC7AF240'; // Borde más visible en dark
  const optionButtonBg = backgroundColor; // Usar el color de fondo del tema
  const optionButtonBorder = isDark ? '#333333' : '#CC7AF280'; // Borde más visible en dark
  const modalBg = backgroundColor; // Usar el color de fondo del tema
  const modalBorder = isDark ? '#333333' : '#CC7AF280'; // Borde más visible en dark
  const modalOptionBg = backgroundColor; // Usar el color de fondo del tema
  const modalOptionBorder = isDark ? '#333333' : '#CC7AF280'; // Borde más visible en dark
  const modalCancelBg = isDark ? '#1E1E1E' : '#CC7AF215'; // Oscuro en dark, claro en light
  const switchOptionBg = isDark ? '#000000' : backgroundColor; // Negro en dark, fondo del tema en light
  const switchOptionBorder = isDark ? '#333333' : '#CC7AF280'; // Borde más visible en dark
  console.log('🎨 [account-preferences] switchOptionBg:', switchOptionBg, 'isDark:', isDark);
  
  // Colores para estados de presión (press states)
  const getPressColor = (isDark: boolean) => {
    if (isDark) {
      return colorPalette.lightPurple + '20'; // 20% opacity para efecto sutil
    }
    return colorPalette.purple + '15'; // 15% opacity para tema claro
  };
  
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor,
    },
    header: {
      backgroundColor,
      borderBottomColor: borderColor,
    },
    optionButton: {
      backgroundColor: optionButtonBg,
      borderColor: optionButtonBorder,
    },
    modalContent: {
      backgroundColor: modalBg,
      borderColor: modalBorder,
    },
    modalOption: {
      backgroundColor: modalOptionBg,
      borderColor: modalOptionBorder,
    },
    modalCancelButton: {
      backgroundColor: modalCancelBg,
    },
    switchOption: {
      backgroundColor: switchOptionBg,
      borderColor: switchOptionBorder,
    },
    optionLabel: {
      color: textColor,
    },
    switchLabel: {
      color: isDark ? '#FFFFFF' : textColor, // Blanco en dark, negro en light
    },
    switchDescription: {
      color: isDark ? '#FFFFFF' : '#666666', // Blanco en dark para mejor contraste
    },
    optionValue: {
      color: isDark ? '#E0E0E0' : '#666666', // Gris más claro y visible en dark
    },
    sectionTitle: {
      color: textColor, // Blanco en dark, negro en light
    },
    sectionDescription: {
      color: isDark ? '#E0E0E0' : '#666666', // Gris más claro y visible en dark
    },
    modalOptionText: {
      color: isDark ? '#F22976' : '#000000', // Rosa en dark, negro en light
    },
    modalOptionTextSelected: {
      color: '#F22976', // Siempre rosa para texto seleccionado
    },
    modalCancelText: {
      color: isDark ? '#F22976' : '#000000', // Rosa en dark, negro en light
    },
  }), [backgroundColor, textColor, borderColor, optionButtonBg, optionButtonBorder, modalBg, modalBorder, modalOptionBg, modalOptionBorder, modalCancelBg, switchOptionBg, switchOptionBorder, isDark]);
  
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
      isUpdatingRef.current = true;
      console.log('🔄 [account-preferences] Changing language to:', language);
      console.log('🔄 [account-preferences] Current localPreferences before:', localPreferences);
      
      // Actualizar preferencias locales PRIMERO para feedback inmediato
      const updatedLocal: UserPreferences = { 
        ...localPreferences, 
        language 
      };
      console.log('✅ [account-preferences] New localPreferences:', updatedLocal);
      setLocalPreferences(updatedLocal);
      
      // Actualizar el contexto DESPUÉS
      try {
        console.log('💾 [account-preferences] Calling updatePreferences from context...');
        await updatePreferences({ language });
        console.log('✅ [account-preferences] updatePreferences completed');
      } catch (prefError) {
        console.error('❌ [account-preferences] Error in updatePreferences:', prefError);
        // Revertir cambio local si falla
        setLocalPreferences(localPreferences);
      } finally {
        isUpdatingRef.current = false;
      }
      
      // Forzar re-render inmediato
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mostrar mensaje informativo
      const languageName = AVAILABLE_LANGUAGES.find(lang => lang.code === language)?.name || language;
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Idioma actualizado',
          `El idioma se ha cambiado a ${languageName}.\n\nNota: La traducción completa de la interfaz aún está en desarrollo.`,
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      isUpdatingRef.current = false;
      console.error('❌ [account-preferences] Error changing language:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cambiar el idioma. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    try {
      isUpdatingRef.current = true;
      console.log('🔄 [account-preferences] Changing theme to:', theme);
      console.log('🔄 [account-preferences] Current localPreferences before:', localPreferences);
      
      // Actualizar preferencias locales PRIMERO para feedback inmediato
      const updatedLocal: UserPreferences = { 
        ...localPreferences, 
        theme 
      };
      console.log('✅ [account-preferences] New localPreferences:', updatedLocal);
      setLocalPreferences(updatedLocal);
      
      // Actualizar el contexto DESPUÉS para que el tema se aplique
      try {
        console.log('💾 [account-preferences] Calling updatePreferences from context...');
        await updatePreferences({ theme });
        console.log('✅ [account-preferences] updatePreferences completed');
      } catch (prefError) {
        console.error('❌ [account-preferences] Error in updatePreferences:', prefError);
        // Revertir cambio local si falla
        setLocalPreferences(localPreferences);
      } finally {
        isUpdatingRef.current = false;
      }
      
      // Forzar re-render inmediato
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Forzar actualización del tema
      const themeNames: Record<ThemeMode, string> = {
        light: 'Claro',
        dark: 'Oscuro',
        auto: 'Automático',
      };
      
      // El tema se aplicará automáticamente a través del contexto
      // Solo mostramos un mensaje de confirmación
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Tema actualizado',
          `El tema se ha cambiado a "${themeNames[theme]}". Los cambios se aplicarán inmediatamente.`,
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      isUpdatingRef.current = false;
      console.error('❌ [account-preferences] Error changing theme:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cambiar el tema. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleExplicitContentChange = async (value: boolean) => {
    try {
      console.log('Changing explicit content to:', value);
      await updatePreferences({ explicitContent: value });
      setLocalPreferences(prev => ({ ...prev, explicitContent: value }));
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
      const updatedNotifications = {
        ...localPreferences.notifications,
        [type]: value,
      };
      await updatePreferences({
        notifications: updatedNotifications,
      });
      setLocalPreferences(prev => ({ ...prev, notifications: updatedNotifications }));
      console.log('Notification setting changed successfully');
    } catch (error) {
      console.error('Error changing notification:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración de notificaciones. Por favor, intenta nuevamente.');
    }
  };

  const handlePrivacyChange = async (key: keyof typeof localPreferences.privacy, value: boolean) => {
    try {
      console.log('Changing privacy', key, 'to:', value);
      const updatedPrivacy = {
        ...localPreferences.privacy,
        [key]: value,
      };
      await updatePreferences({
        privacy: updatedPrivacy,
      });
      setLocalPreferences(prev => ({ ...prev, privacy: updatedPrivacy }));
      console.log('Privacy setting changed successfully');
    } catch (error) {
      console.error('Error changing privacy:', error);
      Alert.alert('Error', 'No se pudo cambiar la configuración de privacidad. Por favor, intenta nuevamente.');
    }
  };

  const showLanguagePicker = () => {
    console.log('🌐 [account-preferences] showLanguagePicker called');
    console.log('🌐 [account-preferences] Current language:', localPreferences.language);
    console.log('🌐 [account-preferences] Platform.OS:', Platform.OS);
    
    // En web, usar modal personalizado
    if (Platform.OS === 'web') {
      console.log('🌐 [account-preferences] Opening language modal for web');
      setShowLanguageModal(true);
      return;
    }
    
    // En móvil, usar Alert.alert
    const availableLanguages = AVAILABLE_LANGUAGES.filter(lang => lang.code === 'es' || lang.code === 'en');
    
    const buttons = availableLanguages.map((lang) => {
      const isSelected = localPreferences.language === lang.code;
      return {
        text: isSelected ? `✓ ${lang.name}` : lang.name,
        onPress: () => {
          console.log('🌐 [account-preferences] Language button pressed:', lang.name, lang.code);
          if (!isSelected) {
            handleLanguageChange(lang.code);
          }
        },
        style: 'default' as const,
      };
    });
    
    buttons.push({ text: t('common.cancel'), style: 'cancel' as 'cancel' });
    
    Alert.alert(
      t('accountPreferences.language'),
      `${t('accountPreferences.language')}: ${getCurrentLanguageName()}\n\n${t('accountPreferences.languageDescription')}:`,
      buttons
    );
  };

  const showThemePicker = () => {
    console.log('🎨 [account-preferences] showThemePicker called');
    console.log('🎨 [account-preferences] Current theme:', localPreferences.theme);
    
    // En web, usar modal personalizado
    if (Platform.OS === 'web') {
      setShowThemeModal(true);
      return;
    }
    
    // En móvil, usar Alert.alert
    const themes: { label: string; value: ThemeMode; description: string }[] = [
      { label: t('theme.light'), value: 'light', description: t('theme.lightDescription') },
      { label: t('theme.dark'), value: 'dark', description: t('theme.darkDescription') },
      { label: t('theme.auto'), value: 'auto', description: t('theme.autoDescription') },
    ];

    const buttons = themes.map((theme) => {
      const isSelected = localPreferences.theme === theme.value;
      return {
        text: isSelected ? `✓ ${theme.label} - ${theme.description}` : `${theme.label} - ${theme.description}`,
        onPress: () => {
          console.log('🎨 [account-preferences] Theme button pressed:', theme.label, theme.value);
          if (!isSelected) {
            handleThemeChange(theme.value);
          }
        },
        style: 'default' as const,
      };
    });
    
    buttons.push({ text: t('common.cancel'), style: 'cancel' as 'cancel' });

    Alert.alert(
      t('accountPreferences.theme'),
      `${t('accountPreferences.theme')}: ${getCurrentThemeName()}\n\n${t('accountPreferences.appearanceDescription')}:`,
      buttons
    );
  };

  const getCurrentLanguageName = () => {
    const name = AVAILABLE_LANGUAGES.find((lang) => lang.code === localPreferences.language)?.name || t('language.spanish');
    console.log('🌐 [account-preferences] getCurrentLanguageName:', name, 'for language:', localPreferences.language);
    return name;
  };

  const getCurrentThemeName = () => {
    const themes: Record<ThemeMode, string> = {
      light: t('theme.light'),
      dark: t('theme.dark'),
      auto: t('theme.auto'),
    };
    const name = themes[localPreferences.theme];
    console.log('🎨 [account-preferences] getCurrentThemeName:', name, 'for theme:', localPreferences.theme);
    return name;
  };

  return (
    <ThemedView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <ThemedView style={[styles.header, dynamicStyles.header, isMobile && styles.headerMobile]}>
        <View style={[styles.headerContent, !isMobile && styles.headerContentDesktop]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={isMobile ? 24 : 28} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
              {t('accountPreferences.title')}
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor principal centrado en desktop */}
        <View style={[styles.mainContent, !isMobile && styles.mainContentDesktop]}>
        {/* Sección de Idioma */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('accountPreferences.language')}</ThemedText>
          <ThemedText style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            {t('accountPreferences.languageDescription')}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.optionButton,
              dynamicStyles.optionButton,
              pressedButton === 'language' && styles.optionButtonPressed
            ]}
            onPress={() => {
              console.log('🌐 [account-preferences] Language button touched');
              showLanguagePicker();
            }}
            onPressIn={() => setPressedButton('language')}
            onPressOut={() => setPressedButton(null)}
            activeOpacity={0.6}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="language-outline" size={20} color={textColor} />
              <ThemedText style={[styles.optionLabel, dynamicStyles.optionLabel]}>{t('accountPreferences.language')}</ThemedText>
            </View>
            <View style={styles.optionRight}>
              <View style={styles.optionValueContainer}>
                <ThemedText 
                  key={`language-${localPreferences.language}`}
                  style={[styles.optionValue, styles.optionValueSelected, dynamicStyles.optionValue]}
                >
                  {getCurrentLanguageName()}
                </ThemedText>
                <Ionicons name="checkmark-circle" size={18} color="#F22976" style={{ marginLeft: 6 }} />
              </View>
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección de Tema */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('accountPreferences.appearance')}</ThemedText>
          <ThemedText style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            {t('accountPreferences.appearanceDescription')}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.optionButton,
              dynamicStyles.optionButton,
              pressedButton === 'theme' && styles.optionButtonPressed
            ]}
            onPress={() => {
              console.log('🎨 [account-preferences] Theme button touched');
              showThemePicker();
            }}
            onPressIn={() => setPressedButton('theme')}
            onPressOut={() => setPressedButton(null)}
            activeOpacity={0.6}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="color-palette-outline" size={20} color={textColor} />
              <ThemedText style={[styles.optionLabel, dynamicStyles.optionLabel]}>{t('accountPreferences.theme')}</ThemedText>
            </View>
            <View style={styles.optionRight}>
              <View style={styles.optionValueContainer}>
                <ThemedText 
                  key={`theme-${localPreferences.theme}`}
                  style={[styles.optionValue, styles.optionValueSelected, dynamicStyles.optionValue]}
                >
                  {getCurrentThemeName()}
                </ThemedText>
                <Ionicons name="checkmark-circle" size={18} color="#F22976" style={{ marginLeft: 6 }} />
              </View>
              <Ionicons name="chevron-forward" size={20} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección de Contenido Explícito */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('accountPreferences.content')}</ThemedText>
          <ThemedText style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            {t('accountPreferences.contentDescription')}
          </ThemedText>
          <View style={[styles.switchOption, dynamicStyles.switchOption]}>
            <View style={styles.switchLeft}>
              <Ionicons name="warning-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={[styles.switchLabel, dynamicStyles.switchLabel]}>{t('accountPreferences.allowExplicit')}</ThemedText>
                <ThemedText style={[styles.switchDescription, dynamicStyles.switchDescription]}>
                  {t('accountPreferences.allowExplicitDescription')}
                </ThemedText>
              </View>
            </View>
              <Switch
              key={`explicit-${localPreferences?.explicitContent}`}
              value={localPreferences?.explicitContent ?? false}
              onValueChange={(value) => {
                console.log('Explicit content switch toggled:', value);
                handleExplicitContentChange(value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={localPreferences?.explicitContent ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
        </View>

        {/* Sección de Notificaciones */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('accountPreferences.notifications')}</ThemedText>
          <ThemedText style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            {t('accountPreferences.notificationsDescription')}
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
            <View key={type} style={[styles.switchOption, dynamicStyles.switchOption]}>
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
                  <ThemedText style={[styles.switchLabel, dynamicStyles.switchLabel]}>
                    {type === 'new_releases' ? 'Nuevos lanzamientos' :
                     type === 'playlist_updates' ? 'Actualizaciones de playlists' :
                     type === 'artist_updates' ? 'Actualizaciones de artistas' :
                     'Recomendaciones'}
                  </ThemedText>
                  <ThemedText style={[styles.switchDescription, dynamicStyles.switchDescription]}>
                    {NOTIFICATION_DESCRIPTIONS[type]}
                  </ThemedText>
                </View>
              </View>
              <Switch
                key={`notification-${type}-${localPreferences?.notifications?.[type]}`}
                value={localPreferences?.notifications?.[type] ?? false}
                onValueChange={(value) => {
                  console.log('Notification switch toggled:', type, value);
                  handleNotificationChange(type, value);
                }}
                trackColor={{ false: '#404040', true: switchActiveColor }}
                thumbColor={localPreferences?.notifications?.[type] ? switchActiveColor : '#B3B3B3'}
                ios_backgroundColor="#404040"
                disabled={notificationPermission === false}
              />
            </View>
          ))}
        </View>

        {/* Sección de Privacidad */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Privacidad</ThemedText>
          <ThemedText style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            Controla qué información compartes con otros usuarios
          </ThemedText>
          <View style={[styles.switchOption, dynamicStyles.switchOption]}>
            <View style={styles.switchLeft}>
              <Ionicons name="time-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={[styles.switchLabel, dynamicStyles.switchLabel]}>Mostrar actividad reciente</ThemedText>
                <ThemedText style={[styles.switchDescription, dynamicStyles.switchDescription]}>
                  {PRIVACY_DESCRIPTIONS.showRecentActivity}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-activity-${localPreferences?.privacy?.showRecentActivity}`}
              value={localPreferences?.privacy?.showRecentActivity ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showRecentActivity', value);
                handlePrivacyChange('showRecentActivity', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={localPreferences?.privacy?.showRecentActivity ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
          <View style={[styles.switchOption, dynamicStyles.switchOption]}>
            <View style={styles.switchLeft}>
              <Ionicons name="musical-note-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={[styles.switchLabel, dynamicStyles.switchLabel]}>Mostrar historial de reproducción</ThemedText>
                <ThemedText style={[styles.switchDescription, dynamicStyles.switchDescription]}>
                  {PRIVACY_DESCRIPTIONS.showListeningHistory}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-history-${localPreferences?.privacy?.showListeningHistory}`}
              value={localPreferences?.privacy?.showListeningHistory ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showListeningHistory', value);
                handlePrivacyChange('showListeningHistory', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={localPreferences?.privacy?.showListeningHistory ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
          <View style={[styles.switchOption, dynamicStyles.switchOption]}>
            <View style={styles.switchLeft}>
              <Ionicons name="library-outline" size={20} color={textColor} />
              <View style={styles.switchTextContainer}>
                <ThemedText style={[styles.switchLabel, dynamicStyles.switchLabel]}>Mostrar playlists</ThemedText>
                <ThemedText style={[styles.switchDescription, dynamicStyles.switchDescription]}>
                  {PRIVACY_DESCRIPTIONS.showPlaylists}
                </ThemedText>
              </View>
            </View>
            <Switch
              key={`privacy-playlists-${localPreferences?.privacy?.showPlaylists}`}
              value={localPreferences?.privacy?.showPlaylists ?? false}
              onValueChange={(value) => {
                console.log('Privacy switch toggled: showPlaylists', value);
                handlePrivacyChange('showPlaylists', value);
              }}
              trackColor={{ false: '#404040', true: switchActiveColor }}
              thumbColor={localPreferences?.privacy?.showPlaylists ? switchActiveColor : '#B3B3B3'}
              ios_backgroundColor="#404040"
            />
          </View>
        </View>
        </View>
        {/* Fin del contenedor principal */}
      </ScrollView>

      {/* Modal personalizado para selección de idioma en web */}
      {Platform.OS === 'web' && showLanguageModal && (
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, dynamicStyles.modalContent]}>
            <ThemedText style={styles.modalTitle}>{t('accountPreferences.language')}</ThemedText>
            <ThemedText style={styles.modalDescription}>
              {t('accountPreferences.language')}: {getCurrentLanguageName()}
            </ThemedText>
            <View style={styles.modalOptions}>
              {AVAILABLE_LANGUAGES.filter(lang => lang.code === 'es' || lang.code === 'en').map((lang) => {
                const isSelected = localPreferences.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.modalOption,
                      dynamicStyles.modalOption,
                      isSelected && styles.modalOptionSelected,
                      pressedButton === `lang-${lang.code}` && styles.modalOptionPressed
                    ]}
                    onPressIn={() => setPressedButton(`lang-${lang.code}`)}
                    onPressOut={() => setPressedButton(null)}
                    onPress={async () => {
                      console.log('🌐 [account-preferences] Language selected in modal:', lang.code);
                      console.log('🌐 [account-preferences] Is currently selected?', isSelected);
                      if (!isSelected) {
                        console.log('🌐 [account-preferences] Calling handleLanguageChange...');
                        try {
                          await handleLanguageChange(lang.code);
                          console.log('🌐 [account-preferences] handleLanguageChange completed');
                          setShowLanguageModal(false);
                        } catch (error) {
                          console.error('🌐 [account-preferences] Error in handleLanguageChange:', error);
                          setShowLanguageModal(false);
                        }
                      } else {
                        console.log('⏭️ [account-preferences] Language already selected, closing modal');
                        setShowLanguageModal(false);
                      }
                    }}
                  >
                    <ThemedText style={[
                      styles.modalOptionText, 
                      dynamicStyles.modalOptionText,
                      isSelected && [styles.modalOptionTextSelected, dynamicStyles.modalOptionTextSelected]
                    ]}>
                      {isSelected ? '✓ ' : ''}{lang.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                dynamicStyles.modalCancelButton,
                pressedButton === 'cancel-language' && styles.modalCancelButtonPressed
              ]}
              onPressIn={() => setPressedButton('cancel-language')}
              onPressOut={() => setPressedButton(null)}
              onPress={() => setShowLanguageModal(false)}
            >
              <ThemedText style={[styles.modalCancelText, dynamicStyles.modalCancelText]}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}

      {/* Modal personalizado para selección de tema en web */}
      {Platform.OS === 'web' && showThemeModal && (
        <View 
          style={styles.modalOverlay}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => setShowThemeModal(false)}
        >
          <ThemedView 
            style={[styles.modalContent, dynamicStyles.modalContent]}
            onStartShouldSetResponder={() => false}
          >
            <ThemedText style={styles.modalTitle}>{t('accountPreferences.theme')}</ThemedText>
            <ThemedText style={styles.modalDescription}>
              {t('accountPreferences.theme')}: {getCurrentThemeName()}
            </ThemedText>
            <View style={styles.modalOptions}>
              {[
                { label: t('theme.light'), value: 'light' as ThemeMode, description: t('theme.lightDescription') },
                { label: t('theme.dark'), value: 'dark' as ThemeMode, description: t('theme.darkDescription') },
                { label: t('theme.auto'), value: 'auto' as ThemeMode, description: t('theme.autoDescription') },
              ].map((theme) => {
                const isSelected = localPreferences.theme === theme.value;
                return (
                  <TouchableOpacity
                    key={theme.value}
                    style={[
                      styles.modalOption,
                      dynamicStyles.modalOption,
                      isSelected && styles.modalOptionSelected,
                      pressedButton === `theme-${theme.value}` && styles.modalOptionPressed
                    ]}
                    onPressIn={() => {
                      console.log('🎨 [account-preferences] Theme button pressed IN:', theme.value);
                      setPressedButton(`theme-${theme.value}`);
                    }}
                    onPressOut={() => {
                      console.log('🎨 [account-preferences] Theme button pressed OUT:', theme.value);
                      // Retrasar el reset para que el onPress se ejecute primero
                      setTimeout(() => setPressedButton(null), 200);
                    }}
                    onPress={async (e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      }
                      console.log('🎨 [account-preferences] Theme selected in modal - onPress triggered:', theme.value);
                      console.log('🎨 [account-preferences] Is currently selected?', isSelected);
                      
                      // Cerrar el modal primero para evitar conflictos
                      setShowThemeModal(false);
                      
                      if (!isSelected) {
                        console.log('🎨 [account-preferences] Calling handleThemeChange...');
                        try {
                          await handleThemeChange(theme.value);
                          console.log('🎨 [account-preferences] handleThemeChange completed');
                        } catch (error) {
                          console.error('🎨 [account-preferences] Error in handleThemeChange:', error);
                        }
                      } else {
                        console.log('⏭️ [account-preferences] Theme already selected');
                      }
                    }}
                    activeOpacity={0.7}
                    delayPressIn={0}
                    delayPressOut={100}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.modalOptionText, 
                      dynamicStyles.modalOptionText,
                      isSelected && [styles.modalOptionTextSelected, dynamicStyles.modalOptionTextSelected]
                    ]}>
                      {isSelected ? '✓ ' : ''}{theme.label} - {theme.description}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.modalCancelButton,
                dynamicStyles.modalCancelButton,
                pressedButton === 'cancel-theme' && styles.modalCancelButtonPressed
              ]}
              onPressIn={() => setPressedButton('cancel-theme')}
              onPressOut={() => setPressedButton(null)}
              onPress={() => setShowThemeModal(false)}
            >
              <ThemedText style={[styles.modalCancelText, dynamicStyles.modalCancelText]}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CC7AF240', // Borde púrpura claro sutil
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
    // color se aplica dinámicamente usando ThemedText
  },
  headerTitleMobile: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 200, // Espacio para MiniPlayer (65px) + barra de tabs (65px) + margen extra
  },
  scrollContentMobile: {
    padding: 16,
    paddingBottom: 200, // Espacio para MiniPlayer (65px) + barra de tabs (65px) + margen extra
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
    color: '#000000', // Texto negro
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666', // Gris oscuro para descripciones
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
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CC7AF280', // Borde púrpura claro
    marginBottom: 12,
    minHeight: 56,
    shadowColor: '#7129F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  optionButtonPressed: {
    backgroundColor: '#CC7AF220', // Púrpura claro con 20% opacidad
    borderColor: '#7129F2',
    borderWidth: 2,
    shadowColor: '#7129F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 0.98 }], // Efecto de "hundimiento"
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
    color: '#000000', // Texto negro
    letterSpacing: 0.2,
  },
  optionValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: 14,
    color: '#666666', // Gris oscuro
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  optionValueSelected: {
    color: '#F22976', // Rosa para valores seleccionados
    fontWeight: '600',
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // backgroundColor se aplica dinámicamente
    borderRadius: 12,
    borderWidth: 1,
    // borderColor se aplica dinámicamente
    marginBottom: 12,
    minHeight: 72,
    shadowColor: '#7129F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    color: '#000000', // Texto negro
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  switchDescription: {
    fontSize: 13,
    color: '#666666', // Gris oscuro
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
  // Estilos para modales personalizados en web
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    // En web, asegurar que los eventos de toque funcionen
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalOptions: {
    gap: 12,
    marginBottom: 20,
  },
  modalOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    // En web, asegurar que los eventos de toque funcionen
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
    }),
  },
  modalOptionSelected: {
    backgroundColor: '#CC7AF220', // Púrpura claro con 20% opacidad
    borderColor: '#7129F2',
    borderWidth: 2,
    shadowColor: '#7129F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalOptionPressed: {
    backgroundColor: '#CC7AF230', // Púrpura claro con 30% opacidad cuando se presiona
    borderColor: '#F229EE',
    borderWidth: 2,
    shadowColor: '#F229EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 0.97 }], // Efecto de "hundimiento"
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000000', // Texto negro
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modalOptionTextSelected: {
    color: '#F22976', // Rosa para texto seleccionado
    fontWeight: '700',
  },
  modalCancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonPressed: {
    backgroundColor: '#CC7AF220', // Púrpura claro con 20% opacidad
    transform: [{ scale: 0.95 }], // Efecto de "hundimiento"
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000', // Texto negro
  },
});

