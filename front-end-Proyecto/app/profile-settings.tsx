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
import { formatBirthDateFromISO, formatBirthDateInput, isValidBirthDate } from '@/utils/date';
import { showToast } from '@/components/ui/toast';

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

export default function ProfileSettingsScreen() {
  const { user, updateUser, logout } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  
  // Estados del formulario
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerColor, setBannerColor] = useState('#B81F5A');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [plan, setPlan] = useState<'Free' | 'VIP'>('Free');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      // Solo cargar una vez al montar el componente
      if (hasLoadedOnce) return;
      
      setLoading(true);
      try {
        // Intentar cargar el perfil completo desde el backend
        const profileData = await UserService.getProfile();
        
        // Si hay datos del backend, usarlos
        if (profileData) {
          
          const backendUsername = (profileData as any).username?.trim() || '';
          const backendName = profileData.name?.trim() || '';
          const backendFirstName = profileData.firstName?.trim() || '';
          const backendLastName = profileData.lastName?.trim() || '';
          
          console.log('Loading profile - Backend username:', backendUsername);
          console.log('Loading profile - Backend name:', backendName);
          console.log('Loading profile - Backend firstName:', backendFirstName);
          console.log('Loading profile - Backend lastName:', backendLastName);
          console.log('Loading profile - Context name:', user.name);
          
          // Priorizar username del backend, luego name, luego el del contexto
          const backendValue = backendUsername || backendName;
          
          // Verificar si el valor del backend es una combinación de firstName/lastName
          let loadedUsername = '';
          if (backendValue) {
            const constructedName = backendFirstName && backendLastName 
              ? `${backendFirstName} ${backendLastName}`.trim()
              : backendFirstName || '';
            
            // Si el valor del backend es igual a la combinación de firstName/lastName, no usarlo
            if (backendValue === constructedName || backendValue === backendFirstName) {
              console.log('Backend username/name appears to be constructed from firstName/lastName, using context name or fallback');
              // Usar el name del contexto si existe y es diferente, sino usar solo el firstName o email
              if (user.name && user.name !== constructedName && user.name !== backendFirstName) {
                loadedUsername = user.name;
              } else {
                // Si no hay un name válido, usar solo el firstName (sin apellidos) o email
                loadedUsername = backendFirstName || user.name || user.email?.split('@')[0] || '';
              }
            } else {
              // El valor del backend es válido (es un nombre de usuario real)
              loadedUsername = backendValue;
            }
          } else {
            // No hay username/name del backend, usar el del contexto o fallback
            loadedUsername = user.name || user.email?.split('@')[0] || '';
          }
          
          console.log('Loading profile - Final username:', loadedUsername);
          
          setUsername(loadedUsername);
          
          // Cargar firstName y lastName desde profileData, completamente independientes del username
          setFirstName(backendFirstName);
          setLastName(backendLastName);
          
          // Cargar biography, phone y birthDate - usar valores del backend si existen y son válidos
          // Si el backend devuelve null, undefined o cadena vacía, usar valores del contexto del usuario
          const backendBiography = profileData.biography;
          const backendPhone = profileData.phone;
          const backendBirthDate = profileData.birthDate;
          
          console.log('Loading profile - Backend biography:', backendBiography);
          console.log('Loading profile - Backend phone:', backendPhone);
          console.log('Loading profile - Backend birthDate:', backendBirthDate);
          console.log('Loading profile - Context biography:', user.biography);
          console.log('Loading profile - Context phone:', user.phone);
          console.log('Loading profile - Context birthDate:', user.birthDate);
          
          // Usar valores del backend si son válidos, sino usar los del contexto
          setBiography(
            (backendBiography !== null && backendBiography !== undefined && backendBiography !== '') 
              ? backendBiography 
              : (user.biography || '')
          );
          setPhone(
            (backendPhone !== null && backendPhone !== undefined && backendPhone !== '') 
              ? backendPhone 
              : (user.phone || '')
          );
          // Convertir birthDate de ISO a DD/MM/YYYY si viene del backend
          setBirthDate(
            (backendBirthDate !== null && backendBirthDate !== undefined && backendBirthDate !== '') 
              ? formatBirthDateFromISO(backendBirthDate) 
              : (user.birthDate || '')
          );
          setProfileImage(profileData.profileImage || null);
          setBannerColor((profileData as any).bannerColor || '#B81F5A');
          setBannerImage((profileData as any).bannerImage || null);
          // Cargar el plan desde el perfil del backend o del usuario, por defecto 'Free'
          setPlan((profileData.plan as 'Free' | 'VIP') || (user.plan as 'Free' | 'VIP') || 'Free');
          
          // Actualizar el contexto del usuario con el name correcto (sin firstName/lastName)
          // Esto asegura que el name correcto esté disponible en toda la aplicación
          if (loadedUsername && loadedUsername !== user.name) {
            // Helper para obtener valor válido del backend o mantener el del contexto
            const getContextValue = (backendValue: any, contextValue: any): any => {
              if (backendValue !== null && backendValue !== undefined && backendValue !== '') {
                return backendValue;
              }
              return contextValue;
            };
            
            const updatedUserContext = {
              ...user,
              name: loadedUsername, // Actualizar el name con el valor correcto
              firstName: backendFirstName || user.firstName,
              lastName: backendLastName || user.lastName,
              // Usar valores válidos del backend, sino mantener los del contexto
              biography: getContextValue(profileData.biography, user.biography),
              phone: getContextValue(profileData.phone, user.phone),
              birthDate: profileData.birthDate && profileData.birthDate !== '' 
                ? formatBirthDateFromISO(profileData.birthDate) 
                : user.birthDate,
              profileImage: getContextValue(profileData.profileImage, user.profileImage),
              bannerColor: getContextValue((profileData as any).bannerColor, user.bannerColor),
              bannerImage: getContextValue((profileData as any).bannerImage, user.bannerImage),
              plan: (profileData.plan as 'Free' | 'VIP') || user.plan || 'Free',
            };
            console.log('Updating user context with corrected name:', updatedUserContext);
            await updateUser(updatedUserContext);
          }
        } else {
          // Si no hay datos del backend, usar los del contexto
          // Username y firstName son completamente independientes
          setUsername(user.name || '');
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setPlan(user.plan || 'Free');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        
        // Detectar si el error es por token expirado
        const isTokenExpired = error instanceof Error && (
          error.message.includes('Token expirado') || 
          error.message.includes('token expirado') ||
          error.message.includes('Token expired') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        );
        
        if (isTokenExpired) {
          // Limpiar el contexto y redirigir al login
          await logout();
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/auth?screen=login');
                },
              },
            ]
          );
          return;
        }
        
        // Si falla, usar los datos del contexto local
        // Username y firstName son completamente independientes
        setUsername(user.name || '');
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };

    loadProfileData();
  }, [user, hasLoadedOnce]);


  const getUserDisplayName = () => {
    // Solo mostrar el nombre de usuario (name), nunca firstName/lastName
    // firstName y lastName son información personal que no se muestra
    if (user?.name) {
      return user.name;
    }
    // Si no hay nombre de usuario, usar el email como fallback
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const getInitialLetter = () => {
    return getUserDisplayName().charAt(0).toUpperCase();
  };

  // Función para validar y formatear el teléfono (números y signo +)
  const handlePhoneChange = (text: string) => {
    // Permitir solo números y el signo + al inicio
    let cleaned = '';
    
    // Si el texto empieza con +, mantenerlo
    if (text.startsWith('+')) {
      cleaned = '+' + text.slice(1).replace(/[^\d\s]/g, ''); // Mantener + y solo números/espacios después
    } else {
      // Si no empieza con +, permitir solo números
      cleaned = text.replace(/[^\d]/g, '');
    }
    
    // Limitar a 15 dígitos (sin contar el +)
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    if (digitsOnly.length > 15) {
      if (cleaned.startsWith('+')) {
        cleaned = '+' + digitsOnly.slice(0, 15);
      } else {
        cleaned = digitsOnly.slice(0, 15);
      }
    }
    
    setPhone(cleaned);
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
      showToast('El nombre de usuario es requerido', 'error', 3000);
      if (Platform.OS !== 'web') {
        Alert.alert('⚠️ Error de validación', 'El nombre de usuario es requerido');
      }
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Iniciando guardado del perfil...');
      
      // Preparar los datos para enviar al backend
      // El backend espera firstName y lastName, así que dividimos el nombre completo
      const nameParts = username.trim().split(' ').filter(part => part.length > 0);
      
      // Validar teléfono: solo números
      const phoneNumbersOnly = getPhoneNumbersOnly(phone);
      if (phoneNumbersOnly && phoneNumbersOnly.length < 7) {
        setSaving(false);
        showToast('El teléfono debe tener al menos 7 dígitos', 'error', 3000);
        if (Platform.OS !== 'web') {
          Alert.alert('⚠️ Error de validación', 'El teléfono debe tener al menos 7 dígitos');
        }
        return;
      }
      
      // Validar fecha de nacimiento si está presente
      const trimmedBirthDate = birthDate.trim();
      if (trimmedBirthDate && !isValidBirthDate(trimmedBirthDate)) {
        setSaving(false);
        showToast('La fecha de nacimiento no es válida. Usa el formato DD/MM/AAAA', 'error', 3000);
        if (Platform.OS !== 'web') {
          Alert.alert('⚠️ Error de validación', 'La fecha de nacimiento no es válida. Usa el formato DD/MM/AAAA');
        }
        return;
      }
      
      // name (username) y firstName son completamente independientes
      // Enviar ambos campos siempre, sin importar si son iguales o diferentes
      const finalFirstName = firstName.trim();
      const finalLastName = lastName.trim();
      
      const profileData: UpdateProfileData = {
        username: username.trim(), // Nombre de usuario (alias) - el backend espera "username"
        name: username.trim(), // También enviar como "name" para compatibilidad
        firstName: finalFirstName || undefined, // Nombre personal - se guarda como "firstName" en el backend (NO se muestra en la UI)
        lastName: finalLastName || undefined, // Apellidos personales - se guarda como "lastName" en el backend (NO se muestra en la UI)
        biography: biography.trim() || undefined,
        phone: phoneNumbersOnly || undefined, // Enviar solo números al backend
        birthDate: trimmedBirthDate || undefined, // Se convertirá a YYYY-MM-DD en el servicio
        profileImage: profileImage || undefined,
        bannerColor: bannerColor || undefined,
        bannerImage: bannerImage || undefined,
        plan: plan || 'Free', // Incluir el plan en los datos a guardar
      };
      
      console.log('Sending profile data to backend:', {
        ...profileData,
        profileImage: profileData.profileImage ? 'Image provided' : 'No image',
        username: profileData.username,
        name: profileData.name,
      });

      // Remover campos undefined y vacíos para no enviarlos al backend
      // Pero mantener los campos que tienen valores válidos
      const cleanedProfileData: UpdateProfileData = {};
      Object.keys(profileData).forEach(key => {
        const value = profileData[key as keyof UpdateProfileData];
        // Solo incluir si tiene un valor válido (no undefined, no null, y si es string no vacío)
        if (value !== undefined && value !== null && value !== '') {
          cleanedProfileData[key as keyof UpdateProfileData] = value;
        }
      });

      // Llamar al servicio para actualizar el perfil en la base de datos
      console.log('📤 Enviando datos del perfil al backend:', cleanedProfileData);
      const response = await UserService.updateProfile(cleanedProfileData);
      
      console.log('✅ Perfil actualizado exitosamente en el backend:', response);
      console.log('📥 Respuesta del backend:', JSON.stringify(response, null, 2));

      // Actualizar el contexto local con los datos del servidor
      // nameParts ya está declarado arriba, así que lo reutilizamos
      // Si el backend devuelve un objeto user dentro de la respuesta, usarlo
      const backendUser = (response as any).user || response;
      
      // El backend puede devolver "username" o "name" - ambos representan el nombre de usuario
      // Priorizar el username del backend si existe, sino el name, sino usar el del formulario
      const backendUsername = backendUser.username?.trim() || '';
      const backendName = backendUser.name?.trim() || '';
      const formUsername = username.trim();
      
      console.log('Backend response username:', backendUsername);
      console.log('Backend response name:', backendName);
      console.log('Form username:', formUsername);
      
      // El name es el nombre de usuario (alias) que se muestra en la UI
      // NO debe ser una combinación de firstName y lastName
      let finalName = '';
      
      // Priorizar username del backend, luego name, luego el del formulario
      const backendValue = backendUsername || backendName;
      
      if (backendValue) {
        const constructedName = firstName.trim() && lastName.trim() 
          ? `${firstName.trim()} ${lastName.trim()}`.trim()
          : firstName.trim() || '';
        
        // Si el valor del backend es igual a la combinación de firstName/lastName, no usarlo
        // Usar el del formulario en su lugar
        if (backendValue === constructedName || backendValue === firstName.trim()) {
          console.log('Backend username/name appears to be constructed from firstName/lastName, using form username instead');
          finalName = formUsername;
        } else {
          // El valor del backend es válido (es un nombre de usuario real)
          finalName = backendValue;
        }
      } else {
        // No hay username/name del backend, usar el del formulario
        finalName = formUsername;
      }
      
      console.log('Final name to use:', finalName);
      
      // Helper para obtener valor válido: priorizar backend si tiene valor válido, sino usar formulario
      const getValidValue = (backendValue: any, formValue: string): string | undefined => {
        // Si el backend tiene un valor válido (no null, no undefined, no cadena vacía), usarlo
        if (backendValue !== null && backendValue !== undefined && backendValue !== '') {
          return String(backendValue).trim() || undefined;
        }
        // Si no, usar el valor del formulario
        const trimmedFormValue = formValue.trim();
        return trimmedFormValue || undefined;
      };
      
      // Helper para birthDate que necesita conversión de formato
      const getValidBirthDate = (backendValue: any, formValue: string): string | undefined => {
        if (backendValue !== null && backendValue !== undefined && backendValue !== '') {
          // Convertir de ISO a DD/MM/YYYY si viene del backend
          return formatBirthDateFromISO(backendValue);
        }
        const trimmedFormValue = formValue.trim();
        return trimmedFormValue || undefined;
      };
      
      console.log('Backend response - biography:', backendUser.biography);
      console.log('Backend response - phone:', backendUser.phone);
      console.log('Backend response - birthDate:', backendUser.birthDate);
      console.log('Form values - biography:', biography);
      console.log('Form values - phone:', phone);
      console.log('Form values - birthDate:', birthDate);
      
      const updatedUser = {
        ...user!,
      
        // Usar el name del backend si está disponible, sino el del formulario
        // Este es el nombre de usuario (alias) que se mostrará en toda la aplicación
        name: finalName,
        firstName: firstName.trim() || undefined, // Usar SOLO el firstName del formulario, no el del backend
        lastName: lastName.trim() || undefined, // Usar SOLO el lastName del formulario
        // Usar valores válidos: priorizar backend si tiene valor, sino usar formulario
        biography: getValidValue(backendUser.biography, biography),
        phone: getValidValue(backendUser.phone, phone),
        birthDate: getValidBirthDate(backendUser.birthDate, birthDate),
        profileImage: backendUser.profileImage !== undefined && backendUser.profileImage !== null && backendUser.profileImage !== '' 
          ? backendUser.profileImage 
          : (profileImage || undefined),
        bannerColor: backendUser.bannerColor !== undefined && backendUser.bannerColor !== null && backendUser.bannerColor !== ''
          ? backendUser.bannerColor 
          : (bannerColor || undefined),
        bannerImage: backendUser.bannerImage !== undefined && backendUser.bannerImage !== null && backendUser.bannerImage !== ''
          ? backendUser.bannerImage 
          : (bannerImage || undefined),
        plan: (backendUser.plan as 'Free' | 'VIP') || plan || 'Free', // Incluir el plan desde el servidor o el estado local
      };
      
      console.log('Final updated user - biography:', updatedUser.biography);
      console.log('Final updated user - phone:', updatedUser.phone);
      console.log('Final updated user - birthDate:', updatedUser.birthDate);

      console.log('Updating user context with:', updatedUser);
      await updateUser(updatedUser);
      console.log('User context updated and saved successfully');
      
      // Recargar el perfil desde el backend para asegurar que tenemos los datos más recientes
      try {
        const reloadedProfile = await UserService.getProfile();
        console.log('Profile reloaded from backend:', reloadedProfile);
        
        // Actualizar los estados del formulario con los datos recargados
        const reloadedUsername = reloadedProfile.username?.trim() || reloadedProfile.name?.trim() || '';
        const reloadedFirstName = reloadedProfile.firstName?.trim() || '';
        const reloadedLastName = reloadedProfile.lastName?.trim() || '';
        
        // Verificar si el username/name del backend es una combinación de firstName/lastName
        let finalReloadedUsername = reloadedUsername;
        if (reloadedUsername) {
          const constructedName = reloadedFirstName && reloadedLastName 
            ? `${reloadedFirstName} ${reloadedLastName}`.trim()
            : reloadedFirstName || '';
          
          if (reloadedUsername === constructedName || reloadedUsername === reloadedFirstName) {
            // El backend devolvió una combinación, usar el valor del formulario
            finalReloadedUsername = username.trim();
          }
        } else {
          finalReloadedUsername = username.trim();
        }
        
        // Actualizar estados del formulario
        setUsername(finalReloadedUsername || username.trim());
        setFirstName(reloadedFirstName || firstName.trim());
        setLastName(reloadedLastName || lastName.trim());
        setBiography(reloadedProfile.biography || biography);
        setPhone(reloadedProfile.phone || phone);
        setBirthDate(reloadedProfile.birthDate ? formatBirthDateFromISO(reloadedProfile.birthDate) : birthDate);
        if (reloadedProfile.profileImage) {
          setProfileImage(reloadedProfile.profileImage);
        }
        if (reloadedProfile.bannerColor) {
          setBannerColor(reloadedProfile.bannerColor);
        }
        if (reloadedProfile.bannerImage) {
          setBannerImage(reloadedProfile.bannerImage);
        }
        if (reloadedProfile.plan) {
          setPlan(reloadedProfile.plan as 'Free' | 'VIP');
        }
        
        // Actualizar el contexto con los datos recargados
        const finalUpdatedUser = {
          ...updatedUser,
          ...reloadedProfile,
          name: finalReloadedUsername || updatedUser.name,
          firstName: reloadedFirstName || updatedUser.firstName,
          lastName: reloadedLastName || updatedUser.lastName,
          biography: reloadedProfile.biography ?? updatedUser.biography,
          phone: reloadedProfile.phone ?? updatedUser.phone,
          birthDate: reloadedProfile.birthDate ? formatBirthDateFromISO(reloadedProfile.birthDate) : updatedUser.birthDate,
          profileImage: reloadedProfile.profileImage ?? updatedUser.profileImage,
          bannerColor: reloadedProfile.bannerColor ?? updatedUser.bannerColor,
          bannerImage: reloadedProfile.bannerImage ?? updatedUser.bannerImage,
          plan: (reloadedProfile.plan as 'Free' | 'VIP') || updatedUser.plan,
        };
        
        await updateUser(finalUpdatedUser);
        console.log('Profile reloaded and context updated successfully');
      } catch (reloadError) {
        console.error('Error reloading profile, but save was successful:', reloadError);
        // No mostrar error al usuario ya que el guardado fue exitoso
      }
      
      // Mostrar mensaje de éxito con información del backend
      const successMessage = (response as any).message || 'Tu perfil ha sido actualizado correctamente en la base de datos.';
      const updatedFields = (response as any).updatedFields || [];
      
      let messageText = successMessage;
      if (updatedFields.length > 0) {
        const fieldNames: { [key: string]: string } = {
          firstName: 'nombre',
          lastName: 'apellido',
          username: 'nombre de usuario',
          bio: 'biografía',
          dateOfBirth: 'fecha de nacimiento',
          phone: 'teléfono',
          avatar: 'foto de perfil'
        };
        const translatedFields = updatedFields.map((field: string) => fieldNames[field] || field).join(', ');
        messageText = `${successMessage}\n\nCampos actualizados: ${translatedFields}`;
      }
      
      // Asegurarse de que el mensaje se muestre
      console.log('✅ Mostrando mensaje de éxito:', messageText);
      console.log('✅ Response completa:', JSON.stringify(response, null, 2));
      
      // Mostrar toast de éxito
      showToast(messageText, 'success', 5000);
      
      // También mostrar Alert como respaldo (para móvil)
      if (Platform.OS !== 'web') {
        Alert.alert(
          '✅ Cambios actualizados con éxito',
          messageText,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ Usuario presionó OK, regresando...');
                router.back();
              },
            },
          ]
        );
      } else {
        // En web, solo mostrar toast y regresar después de un momento
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        data: (error as any)?.data,
        status: (error as any)?.status,
      });
      
      // Detectar si el error es por token expirado
      // Verificar tanto el mensaje como los datos del error (ApiError tiene una propiedad data)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorData = (error as any)?.data;
      const errorStatus = (error as any)?.status;
      
      const isTokenExpired = 
        errorStatus === 401 ||
        errorMessage.includes('Token expirado') || 
        errorMessage.includes('token expirado') ||
        errorMessage.includes('Token expired') ||
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized') ||
        (errorData && (
          errorData.error?.includes('Token expirado') ||
          errorData.error?.includes('token expirado') ||
          errorData.error?.includes('Token expired') ||
          errorData.message?.includes('Token expirado') ||
          errorData.message?.includes('token expirado') ||
          errorData.message?.includes('Token expired')
        ));
      
      if (isTokenExpired) {
        // Limpiar el contexto y redirigir al login
        await logout();
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth?screen=login');
              },
            },
          ]
        );
        return;
      }
      
      // Extraer mensaje del error del backend (priorizar mensajes del backend)
      const backendErrorMessage = errorData?.error || errorData?.message || errorMessage;
      const backendErrorField = errorData?.field;
      
      // Determinar el mensaje de error más específico
      let finalErrorMessage = 'No se pudo guardar el perfil. Por favor, intenta nuevamente.';
      
      // Priorizar mensajes del backend
      if (errorData?.error) {
        finalErrorMessage = errorData.error;
      } else if (errorData?.message) {
        finalErrorMessage = errorData.message;
      } else if (errorMessage && errorMessage !== 'Error' && !errorMessage.includes('Network')) {
        finalErrorMessage = errorMessage;
      }
      
      // Agregar información del campo si está disponible
      if (backendErrorField) {
        const fieldNames: { [key: string]: string } = {
          username: 'nombre de usuario',
          firstName: 'nombre',
          lastName: 'apellido',
          bio: 'biografía',
          dateOfBirth: 'fecha de nacimiento',
          phone: 'teléfono',
          avatar: 'foto de perfil'
        };
        const fieldName = fieldNames[backendErrorField] || backendErrorField;
        finalErrorMessage = `${finalErrorMessage}\n\nCampo: ${fieldName}`;
      }
      
      // Determinar el título del alert según el tipo de error
      let alertTitle = '❌ Error al guardar perfil';
      
      if (errorStatus === 400) {
        alertTitle = '⚠️ Error de validación';
      } else if (errorStatus === 409) {
        alertTitle = '⚠️ Conflicto';
      } else if (errorStatus === 401) {
        alertTitle = '🔐 Sesión expirada';
      } else if (errorStatus === 500) {
        alertTitle = '❌ Error del servidor';
      }
      
      // Asegurarse de que el mensaje de error se muestre
      console.log('❌ Mostrando mensaje de error:', alertTitle, finalErrorMessage);
      console.log('❌ Error completo:', {
        status: errorStatus,
        message: errorMessage,
        data: errorData
      });
      
      // Mostrar toast de error
      showToast(finalErrorMessage, 'error', 6000);
      
      // También mostrar Alert como respaldo (para móvil)
      if (Platform.OS !== 'web') {
        Alert.alert(
          alertTitle,
          finalErrorMessage,
          [{ 
            text: 'OK',
            onPress: () => {
              console.log('❌ Usuario presionó OK en el error');
            }
          }]
        );
      }
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
          
          {/* Indicador de plan */}
          <View style={styles.planBadge}>
            <Ionicons 
              name={plan === 'VIP' ? 'diamond' : 'musical-notes'} 
              size={16} 
              color={plan === 'VIP' ? '#FFD700' : '#FFFFFF'} 
            />
            <ThemedText style={[styles.planText, plan === 'VIP' && styles.planTextVIP]}>
              Plan {plan}
            </ThemedText>
          </View>
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

          <Input
            label="Nombre"
            placeholder="Ingresa tu nombre"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <Input
            label="Apellidos"
            placeholder="Ingresa tus apellidos"
            value={lastName}
            onChangeText={setLastName}
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
            placeholder="+569 1234 5678"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={16}
          />
          <ThemedText style={styles.hint}>
            Puedes incluir el signo + al inicio (máximo 15 dígitos)
          </ThemedText>

          <Input
            label="Fecha de nacimiento"
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={(text) => setBirthDate(formatBirthDateInput(text))}
            keyboardType="numeric"
            maxLength={10}
          />
          <ThemedText style={styles.hint}>
            Formato: DD/MM/AAAA (ejemplo: 15/03/1990)
          </ThemedText>
        </View>

        {/* Botón para cambiar contraseña */}
        <View style={styles.passwordButtonSection}>
          <TouchableOpacity
            style={[styles.changePasswordNavButton, isMobile && styles.changePasswordNavButtonMobile]}
            onPress={() => router.push('/change-password')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={isMobile ? 18 : 20} color="#FFFFFF" />
            <ThemedText style={[styles.changePasswordNavButtonText, isMobile && styles.changePasswordNavButtonTextMobile]}>
              Cambiar contraseña
            </ThemedText>
            <Ionicons name="chevron-forward" size={isMobile ? 18 : 20} color="#B3B3B3" />
          </TouchableOpacity>
        </View>

        {/* Botón para preferencias de cuenta */}
        <View style={styles.passwordButtonSection}>
          <TouchableOpacity
            style={[styles.changePasswordNavButton, isMobile && styles.changePasswordNavButtonMobile]}
            onPress={() => router.push('/account-preferences')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={isMobile ? 18 : 20} color="#FFFFFF" />
            <ThemedText style={[styles.changePasswordNavButtonText, isMobile && styles.changePasswordNavButtonTextMobile]}>
              Preferencias de cuenta
            </ThemedText>
            <Ionicons name="chevron-forward" size={isMobile ? 18 : 20} color="#B3B3B3" />
          </TouchableOpacity>
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
              <ActivityIndicator color="#FFFFFF" />
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
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#282828',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#404040',
  },
  planText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planTextVIP: {
    color: '#FFD700',
  },
  formSection: {
    marginBottom: 32,
    gap: 20,
  },
  passwordSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282828',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
  passwordButtonSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#282828',
  },
  changePasswordNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  changePasswordNavButtonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  changePasswordNavButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changePasswordNavButtonTextMobile: {
    fontSize: 14,
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
    color: '#FFFFFF',
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

