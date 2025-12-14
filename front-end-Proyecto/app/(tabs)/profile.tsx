import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function ProfileTabScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  
  // Crear estilos dinámicos que se actualicen con el tema
  const { currentTheme } = usePreferences();
  const isDark = currentTheme === 'dark';
  const borderColor = useThemeColor({ light: '#CC7AF240', dark: '#333333' }, 'background');
  const optionBg = isDark ? '#000000' : useThemeColor({}, 'background'); // Negro en dark, fondo del tema en light
  const optionBorder = useThemeColor({ light: '#CC7AF280', dark: '#333333' }, 'background');
  const userEmailColor = useThemeColor({ light: '#666666', dark: '#B3B3B3' }, 'text');
  
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === 'ios' ? 50 : 12,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: textColor,
      flex: 1,
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: textColor,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: userEmailColor,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: textColor,
    },
    optionItem: {
      backgroundColor: optionBg,
      borderColor: optionBorder,
    },
  }), [backgroundColor, textColor, borderColor, optionBg, optionBorder, userEmailColor, isDark]);

  const handleLogout = async () => {
    await logout();
    router.replace('/home');
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.trim();
    }
    return user?.email?.split('@')[0] || t('profile.user');
  };

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <ThemedView style={dynamicStyles.header}>
        <ThemedText style={dynamicStyles.headerTitle}>{t('profile.title')}</ThemedText>
        <TouchableOpacity onPress={() => router.push('/profile-settings')}>
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Información del usuario */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <ThemedText style={styles.avatarText}>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>
            <ThemedText style={dynamicStyles.userName}>{getUserDisplayName()}</ThemedText>
          {user?.email && (
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          )}
        </View>

        {/* Opciones */}
        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={[styles.optionItem, dynamicStyles.optionItem]}
            onPress={() => router.push('/profile-settings')}
          >
            <Ionicons name="person-outline" size={24} color={textColor} />
            <ThemedText style={dynamicStyles.optionText}>{t('profile.editProfile')}</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={userEmailColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, dynamicStyles.optionItem]}
            onPress={() => router.push('/change-password')}
          >
            <Ionicons name="lock-closed-outline" size={24} color={textColor} />
            <ThemedText style={dynamicStyles.optionText}>{t('profile.changePassword')}</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={userEmailColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, dynamicStyles.optionItem]}
            onPress={() => router.push('/account-preferences')}
          >
            <Ionicons name="settings-outline" size={24} color={textColor} />
            <ThemedText style={dynamicStyles.optionText}>{t('profile.preferences')}</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={userEmailColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, dynamicStyles.optionItem]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#F22976" />
            <ThemedText style={[styles.optionText, dynamicStyles.optionText, styles.logoutText]}>{t('profile.logout')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CC7AF240', // Borde púrpura claro sutil
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000', // Texto negro
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#CC7AF215', // Fondo púrpura claro muy sutil
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F22976',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000', // Texto negro
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666', // Gris oscuro
  },
  optionsSection: {
    marginTop: 16,
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor se aplica dinámicamente
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    // borderColor se aplica dinámicamente
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000000', // Texto negro
  },
  logoutText: {
    color: '#F22976', // Rosa para logout
  },
});



