import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function ProfileTabScreen() {
  const { user, logout } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const handleLogout = async () => {
    await logout();
    router.replace('/home');
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.trim();
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#121212' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#121212' }]}>
        <ThemedText style={styles.headerTitle}>Perfil</ThemedText>
        <TouchableOpacity onPress={() => router.push('/profile-settings')}>
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

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
          <ThemedText style={styles.userName}>{getUserDisplayName()}</ThemedText>
          {user?.email && (
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          )}
        </View>

        {/* Opciones */}
        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/profile-settings')}
          >
            <Ionicons name="person-outline" size={24} color={textColor} />
            <ThemedText style={styles.optionText}>Editar perfil</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/change-password')}
          >
            <Ionicons name="lock-closed-outline" size={24} color={textColor} />
            <ThemedText style={styles.optionText}>Cambiar contraseña</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push('/account-preferences')}
          >
            <Ionicons name="settings-outline" size={24} color={textColor} />
            <ThemedText style={styles.optionText}>Preferencias</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF4444" />
            <ThemedText style={[styles.optionText, styles.logoutText]}>Cerrar sesión</ThemedText>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#282828',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  optionsSection: {
    marginTop: 16,
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutText: {
    color: '#FF4444',
  },
});

