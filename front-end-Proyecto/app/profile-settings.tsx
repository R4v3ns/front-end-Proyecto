import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
// import * as ImagePicker from 'expo-image-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserService, UpdateProfileData } from '@/services/user';

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

export default function ProfileSettingsScreen() {
  const { user, updateUser } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  
  // Estados del formulario
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerColor, setBannerColor] = useState('#B81F5A');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Intentar cargar el perfil completo desde el backend
        const profileData = await UserService.getProfile();
        
        // Si hay datos del backend, usarlos
        if (profileData) {
          setUsername(
            profileData.name || 
            (profileData.firstName && profileData.lastName 
              ? `${profileData.firstName} ${profileData.lastName}` 
              : profileData.firstName) || 
            user.email?.split('@')[0] || 
            ''
          );
          setBiography(profileData.biography || '');
          setPhone(profileData.phone || '');
          setBirthDate(profileData.birthDate || '');
          setProfileImage(profileData.profileImage || null);
          setBannerColor((profileData as any).bannerColor || '#B81F5A');
          setBannerImage((profileData as any).bannerImage || null);
        } else {
          // Si no hay datos del backend, usar los del contexto
          setUsername(user.name || user.firstName || user.email?.split('@')[0] || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Si falla, usar los datos del contexto local
        setUsername(user.name || user.firstName || user.email?.split('@')[0] || '');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    if (user?.name) {
      return user.name;
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const getInitialLetter = () => {
    return getUserDisplayName().charAt(0).toUpperCase();
  };

  // Función para validar y formatear el teléfono (solo números)
  const handlePhoneChange = (text: string) => {
    // Remover todos los caracteres que no sean números
    const cleaned = text.replace(/\D/g, '');
    
    // Limitar a 15 dígitos
    const limited = cleaned.slice(0, 15);
    
    setPhone(limited);
  };

  // Función para obtener solo números del teléfono antes de guardar
  const getPhoneNumbersOnly = (phoneValue: string): string => {
    return phoneValue.replace(/\D/g, ''); // Remover todo lo que no sea dígito
  };

  const handlePickImage = async (forBanner: boolean = false) => {
    try {
      // Para web, usar input file
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                if (forBanner) {
                  setBannerImage(event.target.result as string);
                  setBannerColor('#B81F5A'); // Mantener color por defecto como fallback
                } else {
                  setProfileImage(event.target.result as string);
                }
              }
            };
            reader.readAsDataURL(file);
          }
          document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
        return;
      }

      // Para móvil, necesitarías expo-image-picker
      Alert.alert(
        'Funcionalidad no disponible',
        'Para seleccionar imágenes en móvil, se necesita instalar expo-image-picker. Por ahora, esta funcionalidad está disponible solo en web.'
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleTakePhoto = async () => {
    Alert.alert(
      'Funcionalidad no disponible',
      'Para tomar fotos, se necesita instalar expo-image-picker. Esta funcionalidad estará disponible próximamente.'
    );
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Seleccionar foto de perfil',
      'Elige una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tomar foto', onPress: handleTakePhoto },
        { text: 'Elegir de galería', onPress: () => handlePickImage(false) },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es requerido');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving profile data...');
      
      // Preparar los datos para enviar al backend
      // El backend espera firstName y lastName, así que dividimos el nombre completo
      const nameParts = username.trim().split(' ').filter(part => part.length > 0);
      
      // Validar teléfono: solo números
      const phoneNumbersOnly = getPhoneNumbersOnly(phone);
      if (phoneNumbersOnly && phoneNumbersOnly.length < 7) {
        Alert.alert('Error', 'El teléfono debe tener al menos 7 dígitos');
        return;
      }
      
      const profileData: UpdateProfileData = {
        firstName: nameParts[0] || username.trim(),
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
        biography: biography.trim() || undefined,
        phone: phoneNumbersOnly || undefined, // Enviar solo números al backend
        birthDate: birthDate.trim() || undefined,
        profileImage: profileImage || undefined,
        bannerColor: bannerColor || undefined,
        bannerImage: bannerImage || undefined,
      } as any;

      // Remover campos undefined para no enviarlos al backend
      Object.keys(profileData).forEach(key => {
        if (profileData[key as keyof UpdateProfileData] === undefined) {
          delete profileData[key as keyof UpdateProfileData];
        }
      });

      // Llamar al servicio para actualizar el perfil en la base de datos
      console.log('📤 Sending profile data to backend:', profileData);
      const response = await UserService.updateProfile(profileData);
      
      console.log('✅ Profile updated successfully in backend:', response);
      console.log('📥 Response from backend:', JSON.stringify(response, null, 2));

      // Actualizar el contexto local con los datos del servidor
      // nameParts ya está declarado arriba, así que lo reutilizamos
      // Si el backend devuelve un objeto user dentro de la respuesta, usarlo
      const backendUser = (response as any).user || response;
      
      const updatedUser = {
        ...user!,
        // Usar los datos del servidor si están disponibles, sino usar los locales
        name: backendUser.name || username.trim(),
        firstName: backendUser.firstName || nameParts[0] || username.trim(),
        lastName: backendUser.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined),
        // Incluir todos los campos, usando los del servidor o los locales
        biography: backendUser.biography !== undefined ? backendUser.biography : (biography.trim() || undefined),
        phone: backendUser.phone !== undefined ? backendUser.phone : (phone.trim() || undefined),
        birthDate: backendUser.birthDate !== undefined ? backendUser.birthDate : (birthDate.trim() || undefined),
        profileImage: backendUser.profileImage !== undefined ? backendUser.profileImage : (profileImage || undefined),
        bannerColor: backendUser.bannerColor !== undefined ? backendUser.bannerColor : (bannerColor || undefined),
        bannerImage: backendUser.bannerImage !== undefined ? backendUser.bannerImage : (bannerImage || undefined),
      };

      console.log('💾 Updating user context with:', updatedUser);
      await updateUser(updatedUser);
      console.log('✅ User context updated and saved successfully');
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Cambios actualizados con éxito',
        'Tu perfil ha sido actualizado correctamente en la base de datos.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Recargar los datos del perfil para asegurarse de tener la última versión
              setTimeout(async () => {
                try {
                  const freshProfile = await UserService.getProfile();
                  const freshUser = {
                    ...user!,
                    ...freshProfile,
                  };
                  updateUser(freshUser);
                } catch (error) {
                  console.error('Error reloading profile:', error);
                }
              }, 500);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el perfil';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
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
            Configurar Perfil
          </ThemedText>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <ThemedText style={styles.loadingText}>Cargando perfil...</ThemedText>
        </View>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de banner y foto de perfil */}
        <View style={styles.profileImageSection}>
          {/* Banner */}
          <View style={styles.bannerContainer}>
            {bannerImage ? (
              <Image 
                source={{ uri: bannerImage }} 
                style={styles.bannerImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.bannerColor, { backgroundColor: bannerColor }]} />
            )}
            <TouchableOpacity 
              style={styles.editBannerButton}
              onPress={() => {
                Alert.alert(
                  'Cambiar Banner',
                  'Elige una opción',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Elegir color', onPress: () => {
                      const colors = [
                        { name: 'Rosa', color: '#B81F5A' },
                        { name: 'Rosa claro', color: '#F22976' },
                        { name: 'Verde', color: '#1DB954' },
                        { name: 'Azul oscuro', color: '#1E3264' },
                        { name: 'Rojo', color: '#E22134' },
                        { name: 'Morado', color: '#8B5CF6' },
                        { name: 'Negro', color: '#000000' },
                        { name: 'Gris oscuro', color: '#282828' },
                      ];
                      Alert.alert(
                        'Seleccionar Color',
                        'Elige un color para el banner',
                        [
                          ...colors.map(({ name, color }) => ({
                            text: name,
                            onPress: () => {
                              setBannerColor(color);
                              setBannerImage(null); // Resetear imagen si se elige color
                            },
                            style: 'default' as const,
                          })),
                          { text: 'Cancelar', style: 'cancel' },
                        ]
                      );
                    }},
                    { text: 'Elegir imagen', onPress: () => handlePickImage(true) },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Ionicons name="image-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Foto de perfil */}
          <View style={styles.profileImageWrapper}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={showImagePickerOptions}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <ThemedText style={styles.profileImagePlaceholderText}>
                    {getInitialLetter()}
                  </ThemedText>
                </View>
              )}
              <View style={styles.editImageButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.profileImageHint}>
            Toca la imagen para cambiar tu foto de perfil
          </ThemedText>
          <ThemedText style={styles.bannerHint}>
            Toca el banner para cambiarlo
          </ThemedText>
        </View>

        {/* Formulario */}
        <View style={styles.formSection}>
          <Input
            label="Nombre de usuario"
            placeholder="Ingresa tu nombre de usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
          />

          <View style={styles.textAreaContainer}>
            <ThemedText style={styles.label}>Biografía</ThemedText>
            <TextInput
              style={[styles.textArea, { color: textColor }]}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor={iconColor}
              value={biography}
              onChangeText={setBiography}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Input
            label="Teléfono"
            placeholder="1234567890"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="numeric"
            autoComplete="tel"
            maxLength={15}
          />
          <ThemedText style={styles.hint}>
            Solo se permiten números (máximo 15 dígitos)
          </ThemedText>

          <Input
            label="Fecha de nacimiento"
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />
          <ThemedText style={styles.hint}>
            Formato: DD/MM/AAAA (ejemplo: 15/03/1990)
          </ThemedText>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                Guardar cambios
              </ThemedText>
            )}
          </TouchableOpacity>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
      )}
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
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: -60,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerColor: {
    width: '100%',
    height: '100%',
  },
  editBannerButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#282828',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F22976',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F22976',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#121212',
  },
  profileImageHint: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 4,
  },
  bannerHint: {
    fontSize: 12,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 32,
    gap: 20,
  },
  textAreaContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#282828',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  hint: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: -16,
    marginBottom: 8,
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#B81F5A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#B3B3B3',
  },
});

