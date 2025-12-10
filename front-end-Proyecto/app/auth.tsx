
import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthService, LoginCredentials, RegisterData, ForgotPasswordData } from '@/services/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type AuthScreen = 'login' | 'register' | 'forgot-password';

export default function AuthScreen() {
  const params = useLocalSearchParams<{ screen?: string | string[] }>();
  const { login, updateUser } = useAuth();
  
  // Función helper para obtener el valor del parámetro screen
  const getScreenParam = (): string | undefined => {
    const screenParam = params.screen;
    if (Array.isArray(screenParam)) {
      return screenParam[0];
    }
    return screenParam;
  };
  
  // Estado para manejar cambios internos (cuando el usuario hace clic en botones dentro del formulario)
  const [internalScreen, setInternalScreen] = useState<AuthScreen | null>(null);
  
  // Calcular qué pantalla mostrar: priorizar parámetros de URL sobre estado interno
  const displayScreen = useMemo((): AuthScreen => {
    const screenParam = getScreenParam();
    console.log('Calculating display screen - screen param:', screenParam, 'Internal:', internalScreen, 'Full params:', params);
    
    // Si hay un parámetro en la URL, usarlo
    if (screenParam === 'register') {
      return 'register';
    }
    if (screenParam === 'forgot-password') {
      return 'forgot-password';
    }
    if (screenParam === 'login') {
      return 'login';
    }
    
    // Si no hay parámetro pero hay estado interno, usarlo
    if (internalScreen) {
      return internalScreen;
    }
    
    // Por defecto, mostrar login
    return 'login';
  }, [params.screen, internalScreen]);
  
  console.log('Final display screen:', displayScreen);

  // Cuando cambian los parámetros de la URL, limpiar el estado interno
  useEffect(() => {
    const param = getScreenParam();
    console.log('URL params changed, param:', param, 'Full params:', params);
    if (param === 'register' || param === 'forgot-password' || param === 'login') {
      console.log('🧹 Clearing internal screen state because URL param exists');
      setInternalScreen(null); // Limpiar estado interno cuando hay un parámetro de URL
    }
  }, [params.screen]);
  const [loading, setLoading] = useState(false);

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Estados para Registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Estados para Olvidé Contraseña
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Handlers
  const handleLogin = async () => {
    console.log('handleLogin called');
    const errors: { email?: string; password?: string } = {};

    if (!loginEmail.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Email inválido';
    }

    if (!loginPassword) {
      errors.password = 'La contraseña es requerida';
    }

    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoading(true);
    console.log('Starting login process...');

    try {
      const credentials: LoginCredentials = {
        email: loginEmail.trim(),
        password: loginPassword,
      };

      console.log('Calling AuthService.login...');
      const response = await AuthService.login(credentials);
      console.log('Login response (full):', JSON.stringify(response, null, 2));
      
      // Intentar obtener el token de diferentes posibles campos
      const authToken = response.token || 
                       (response as any).accessToken || 
                       (response as any).authToken ||
                       (response as any).data?.token ||
                       (response as any).data?.accessToken;
      
      // Intentar obtener el usuario de diferentes posibles campos
      const userData = response.user || 
                      (response as any).data?.user ||
                      (response as any).userData ||
                      (response as any).data;
      
      console.log('Extracted token:', authToken ? 'Found' : 'Not found');
      console.log('Extracted user:', userData ? 'Found' : 'Not found');
      
      if (authToken) {
        if (userData && typeof userData === 'object' && (userData.id || userData.email)) {
          // Tenemos token y datos de usuario completos
          console.log('Token and user received, saving to context...');
          // Construir el usuario inicial
          // El name es el nombre de usuario (alias), NO debe ser firstName/lastName
          const initialName = userData.name?.trim() || loginEmail.trim().split('@')[0];
          
          console.log('Login - userData.name:', userData.name);
          console.log('Login - userData.firstName:', userData.firstName);
          console.log('Login - userData.lastName:', userData.lastName);
          console.log('Login - Initial name to use:', initialName);
          
          const finalUser = {
            id: userData.id || loginEmail.trim(),
            email: userData.email || loginEmail.trim(),
            firstName: userData.firstName || undefined, // Información personal, no se muestra
            lastName: userData.lastName || undefined, // Información personal, no se muestra
            name: initialName, // Nombre de usuario (alias) que se muestra en la UI
            plan: (userData.plan as 'Free' | 'VIP') || 'Free', // Incluir el plan desde la respuesta
          };
          await login(finalUser, authToken);
          
          // Intentar cargar el perfil completo desde la base de datos
          try {
            const { UserService } = await import('@/services/user');
            const fullProfile = await UserService.getProfile();
            if (fullProfile) {
              // El name del backend es el nombre de usuario (alias) que se muestra en la UI
              // NO debe ser una combinación de firstName y lastName
              // El backend puede devolver "username" o "name" - ambos representan el nombre de usuario
              const backendUsername = (fullProfile as any).username?.trim() || '';
              const backendName = fullProfile.name?.trim() || '';
              const backendFirstName = fullProfile.firstName?.trim() || '';
              const backendLastName = fullProfile.lastName?.trim() || '';
              
              console.log('Full profile from database:', fullProfile);
              console.log('Backend username field:', backendUsername);
              console.log('Backend name field:', backendName);
              console.log('Backend firstName:', backendFirstName);
              console.log('Backend lastName:', backendLastName);
              
              // Priorizar username del backend, luego name, luego el del finalUser
              const backendValue = backendUsername || backendName;
              
              // Verificar si el valor del backend es una combinación de firstName/lastName
              let finalName = '';
              if (backendValue) {
                const constructedName = backendFirstName && backendLastName 
                  ? `${backendFirstName} ${backendLastName}`.trim()
                  : backendFirstName || '';
                
                // Si el valor del backend es igual a la combinación de firstName/lastName, no usarlo
                if (backendValue === constructedName || backendValue === backendFirstName) {
                  console.log('Backend username/name appears to be constructed from firstName/lastName, using fallback');
                  finalName = finalUser.name || loginEmail.trim().split('@')[0];
                } else {
                  // El valor del backend es válido (es un nombre de usuario real)
                  finalName = backendValue;
                }
              } else {
                // No hay username/name del backend, usar el del finalUser como fallback
                finalName = finalUser.name || loginEmail.trim().split('@')[0];
              }
              
              console.log('Final name to use:', finalName);
              
              const completeUser = {
                ...finalUser,
                ...fullProfile,
                // El name es el nombre de usuario (alias) que se muestra en toda la aplicación
                name: finalName,
                plan: (fullProfile.plan as 'Free' | 'VIP') || finalUser.plan || 'Free',
              };
              console.log('Complete user from database:', completeUser);
              await updateUser(completeUser);
              console.log('Full profile loaded from database');
            }
          } catch (error) {
            console.log('Could not load full profile, using basic user data:', error);
          }
          
          console.log('User saved, redirecting to tabs...');
          router.replace('/(tabs)');
        } else {
          // Solo tenemos token, crear usuario básico
          console.log('Only token received, creating basic user...');
          const basicUser = {
            id: loginEmail.trim(),
            email: loginEmail.trim(),
            name: loginEmail.trim().split('@')[0],
          };
          await login(basicUser, authToken);
          console.log('User created and saved, redirecting to tabs...');
          router.replace('/(tabs)');
        }
      } else {
        console.log('No token found in response');
        console.log('Response structure:', Object.keys(response));
        Alert.alert('Error', 'No se recibió un token de autenticación. Por favor, verifica tus credenciales.');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      console.error('Error details:', error);
      
      // Si el mensaje tiene saltos de línea, formatearlo mejor para el Alert
      if (errorMessage.includes('\n')) {
        // Extraer la URL intentada si está en el mensaje
        const urlMatch = errorMessage.match(/URL intentada: (http[^\n]+)/);
        const attemptedUrl = urlMatch ? urlMatch[1] : null;
        
        // Crear un mensaje más claro y conciso
        let title = 'Error de conexión';
        let message = 'No se pudo conectar con el servidor backend.\n\n';
        
        if (attemptedUrl) {
          message += `URL intentada: ${attemptedUrl}\n\n`;
        }
        
        message += 'Para solucionarlo:\n\n';
        message += '1. Asegúrate de que el servidor backend esté corriendo\n';
        message += '2. Verifica que esté en el puerto 8080\n';
        message += '3. Si estás en web, el servidor debe estar en localhost:8080\n';
        message += '4. Si estás en móvil, actualiza la IP en app.json\n\n';
        message += 'Para iniciar el backend, ejecuta el servidor en otra terminal.';
        
        Alert.alert(title, message);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      console.log('Login process finished, loading set to false');
    }
  };

  const handleRegister = async () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!registerName.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!registerEmail.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Email inválido';
    }

    if (!registerPassword) {
      errors.password = 'La contraseña es requerida';
    } else if (!validatePassword(registerPassword)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!registerConfirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setRegisterErrors({});
    setLoading(true);

    try {
      const userData: RegisterData = {
        firstName: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        passwordConfirmation: registerConfirmPassword,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const response = await AuthService.register(userData);
      
      Alert.alert('Éxito', 'Usuario registrado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            console.log('🔘 Registration successful, redirecting to login');
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
            router.push('/auth?screen=login');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const errors: { email?: string } = {};

    if (!forgotEmail.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(forgotEmail)) {
      errors.email = 'Email inválido';
    }

    if (Object.keys(errors).length > 0) {
      setForgotError(errors.email || '');
      return;
    }

    setForgotError('');
    setLoading(true);

    try {
      const data: ForgotPasswordData = {
        email: forgotEmail.trim(),
      };

      await AuthService.forgotPassword(data);
      setForgotSuccess(true);
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Error al solicitar recuperación');
      setForgotSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <ThemedView style={styles.formContainer}>
      <ThemedText type="title" style={styles.title}>
        Iniciar Sesión
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Ingresa tus credenciales para continuar
      </ThemedText>

      <Input
        label="Email"
        placeholder="tu@email.com"
        value={loginEmail}
        onChangeText={(text) => {
          setLoginEmail(text);
          if (loginErrors.email) setLoginErrors({ ...loginErrors, email: undefined });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={loginErrors.email}
      />

      <Input
        label="Contraseña"
        placeholder="••••••••"
        value={loginPassword}
        onChangeText={(text) => {
          setLoginPassword(text);
          if (loginErrors.password) setLoginErrors({ ...loginErrors, password: undefined });
        }}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoComplete="password"
        error={loginErrors.password}
      />

      <TouchableOpacity
        style={[
          styles.loginButton,
          (loading || !loginEmail.trim() || !loginPassword) && styles.loginButtonDisabled
        ]}
        onPress={() => {
          console.log('🔘 Button pressed - Iniciar Sesión');
          console.log('🔘 Email:', loginEmail.trim() ? 'Present' : 'Empty');
          console.log('🔘 Password:', loginPassword ? 'Present' : 'Empty');
          console.log('🔘 Loading:', loading);
          if (!loading && loginEmail.trim() && loginPassword) {
            console.log('Conditions met, calling handleLogin...');
            handleLogin();
          } else {
            console.log('Conditions not met - cannot proceed');
            if (!loginEmail.trim()) {
              setLoginErrors({ email: 'El email es requerido' });
            }
            if (!loginPassword) {
              setLoginErrors(prev => ({ ...prev, password: 'La contraseña es requerida' }));
            }
          }
        }}
        disabled={loading || !loginEmail.trim() || !loginPassword}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.loginButtonText}>Iniciar Sesión</ThemedText>
        )}
      </TouchableOpacity>

      <Button
        title="¿Olvidaste tu contraseña?"
        variant="text"
        onPress={() => {
          console.log('🔘 Button pressed - Forgot password');
          setInternalScreen('forgot-password');
        }}
        style={styles.linkButton}
      />

      <ThemedView style={styles.divider}>
        <ThemedText style={styles.dividerText}>¿No tienes cuenta?</ThemedText>
        <Button
          title="Regístrate"
          variant="outline"
          onPress={() => {
            console.log('🔘 Button pressed - Register');
            setInternalScreen('register');
          }}
          style={styles.secondaryButton}
        />
      </ThemedView>
    </ThemedView>
  );

  const renderRegister = () => (
    <ThemedView style={styles.formContainer}>
      <ThemedText type="title" style={styles.title}>
        Crear Cuenta
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Completa el formulario para registrarte
      </ThemedText>

      <Input
        label="Nombre"
        placeholder="Tu nombre completo"
        value={registerName}
        onChangeText={(text) => {
          setRegisterName(text);
          if (registerErrors.name) setRegisterErrors({ ...registerErrors, name: undefined });
        }}
        autoCapitalize="words"
        autoComplete="name"
        error={registerErrors.name}
      />

      <Input
        label="Email"
        placeholder="tu@email.com"
        value={registerEmail}
        onChangeText={(text) => {
          setRegisterEmail(text);
          if (registerErrors.email) setRegisterErrors({ ...registerErrors, email: undefined });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={registerErrors.email}
      />

      <Input
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={registerPassword}
        onChangeText={(text) => {
          setRegisterPassword(text);
          if (registerErrors.password) setRegisterErrors({ ...registerErrors, password: undefined });
        }}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoComplete="password-new"
        error={registerErrors.password}
      />

      <Input
        label="Confirmar Contraseña"
        placeholder="Repite tu contraseña"
        value={registerConfirmPassword}
        onChangeText={(text) => {
          setRegisterConfirmPassword(text);
          if (registerErrors.confirmPassword)
            setRegisterErrors({ ...registerErrors, confirmPassword: undefined });
        }}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoComplete="password-new"
        error={registerErrors.confirmPassword}
      />

      <Button
        title="Registrarse"
        onPress={handleRegister}
        loading={loading}
        fullWidth
        style={[styles.button, styles.registerButton]}
      />

      <ThemedView style={styles.divider}>
        <ThemedText style={styles.dividerText}>¿Ya tienes cuenta?</ThemedText>
        <Button
          title="Iniciar Sesión"
          variant="outline"
          onPress={() => {
            console.log('🔘 Button pressed - Login from register');
            setInternalScreen('login');
          }}
          style={styles.secondaryButton}
        />
      </ThemedView>
    </ThemedView>
  );

  const renderForgotPassword = () => (
    <ThemedView style={styles.formContainer}>
      <ThemedText type="title" style={styles.title}>
        Recuperar Contraseña
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña
      </ThemedText>

      {forgotSuccess ? (
        <ThemedView style={styles.successContainer}>
          <ThemedText style={styles.successText} lightColor="#34c759" darkColor="#34c759">
            ✓ Se ha enviado un email a {forgotEmail} con las instrucciones para recuperar tu contraseña.
          </ThemedText>
          <Button
            title="Volver a Iniciar Sesión"
            onPress={() => {
              console.log('🔘 Button pressed - Login from forgot password (success)');
              setForgotEmail('');
              setForgotSuccess(false);
              setForgotError('');
              setInternalScreen('login');
            }}
            fullWidth
            style={styles.button}
          />
        </ThemedView>
      ) : (
        <>
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={forgotEmail}
            onChangeText={(text) => {
              setForgotEmail(text);
              setForgotError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={forgotError}
          />

          <Button
            title="Enviar Instrucciones"
            onPress={handleForgotPassword}
            loading={loading}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Volver a Iniciar Sesión"
            variant="text"
            onPress={() => {
              console.log('🔘 Button pressed - Login from forgot password');
              setForgotEmail('');
              setForgotError('');
              setInternalScreen('login');
            }}
            style={styles.linkButton}
          />
        </>
      )}
    </ThemedView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (isSmallScreen ? 20 : 0) : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/home')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={isSmallScreen ? 22 : 24} color="#F22976" />
          <ThemedText style={styles.backButtonText}>Volver al menú principal</ThemedText>
        </TouchableOpacity>
        {displayScreen === 'login' && renderLogin()}
        {displayScreen === 'register' && renderRegister()}
        {displayScreen === 'forgot-password' && renderForgotPassword()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 16 : 20,
    paddingBottom: isSmallScreen ? 32 : 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: isSmallScreen ? 20 : 24,
    padding: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 24 : 28,
  },
  title: {
    textAlign: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
    fontSize: isSmallScreen ? 26 : 28,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: isSmallScreen ? 24 : 32,
    opacity: 0.7,
    fontSize: isSmallScreen ? 14 : 16,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: isSmallScreen ? 12 : 16,
  },
  divider: {
    marginTop: isSmallScreen ? 24 : 32,
    paddingTop: isSmallScreen ? 20 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
  },
  dividerText: {
    marginBottom: isSmallScreen ? 12 : 16,
    opacity: 0.7,
    fontSize: isSmallScreen ? 14 : 16,
  },
  secondaryButton: {
    width: '100%',
  },
  successContainer: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    fontSize: isSmallScreen ? 14 : 16,
  },
  loginButton: {
    backgroundColor: '#F22976',
    paddingVertical: isSmallScreen ? 16 : 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 52 : 48,
    marginTop: isSmallScreen ? 12 : 8,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 17 : 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#F22976',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 10 : 12,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: isSmallScreen ? 15 : 16,
    color: '#F22976',
    fontWeight: '600',
  },
});

