import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { Input } from '@/components/ui/input';
import { AuthService, ChangePasswordData } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function ChangePasswordScreen() {
  const { user } = useAuth();
  const textColor = useThemeColor({}, 'text');
  
  // Función para obtener el nombre de usuario a mostrar
  // Solo mostrar el nombre de usuario (name), nunca firstName/lastName
  // firstName y lastName son información personal que no se muestra
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    // Si no hay nombre de usuario, usar el email como fallback
    return user?.email?.split('@')[0] || 'Usuario';
  };
  
  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Debes ingresar tu contraseña actual');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Debes ingresar una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setChangingPassword(true);
    try {
      console.log('Changing password...');
      const changePasswordData: ChangePasswordData = {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      };

      await AuthService.changePassword(changePasswordData);
      
      // Limpiar los campos después de cambiar la contraseña
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña ha sido actualizada correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña';
      Alert.alert('Error', errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#121212' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#121212' }, isMobile && styles.headerMobile]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={isMobile ? 24 : 28} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
            Cambiar Contraseña
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del usuario */}
        <View style={styles.userInfoSection}>
          <ThemedText style={styles.userInfoLabel}>Usuario:</ThemedText>
          <ThemedText style={styles.userInfoName}>{getUserDisplayName()}</ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.description}>
            Ingresa tu contraseña actual y elige una nueva contraseña segura.
          </ThemedText>

          <Input
            label="Contraseña actual"
            placeholder="Ingresa tu contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Nueva contraseña"
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <ThemedText style={styles.hint}>
            La contraseña debe tener al menos 6 caracteres
          </ThemedText>

          <Input
            label="Confirmar nueva contraseña"
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.changePasswordButton, changingPassword && styles.changePasswordButtonDisabled]}
            onPress={handleChangePassword}
            disabled={changingPassword}
            activeOpacity={0.8}
          >
            {changingPassword ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.changePasswordButtonText}>
                Cambiar contraseña
              </ThemedText>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  userInfoSection: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#B3B3B3',
    fontWeight: '500',
  },
  userInfoName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 8,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: -16,
    marginBottom: 8,
  },
  changePasswordButton: {
    backgroundColor: '#F22976',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginTop: 8,
  },
  changePasswordButtonDisabled: {
    opacity: 0.6,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

