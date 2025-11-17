import { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthService, LoginCredentials, RegisterData, ForgotPasswordData } from '@/services/auth';
import { router } from 'expo-router';

type AuthScreen = 'login' | 'register' | 'forgot-password';

export default function AuthScreen() {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [loading, setLoading] = useState(false);

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Estados para Registro
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerTermsAccepted, setRegisterTermsAccepted] = useState(false);
  const [registerPrivacyAccepted, setRegisterPrivacyAccepted] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    termsAccepted?: string;
    privacyAccepted?: string;
  }>({});

  // Estados para Olvidé Contraseña
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Estado para mensaje de éxito después del registro
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; error?: string } => {
    if (!password) {
      return { valid: false, error: 'La contraseña es requerida' };
    }
    if (password.length < 8 || password.length > 15) {
      return { valid: false, error: 'La contraseña debe tener entre 8 y 15 caracteres' };
    }
    // Debe contener al menos una mayúscula, una minúscula, un número y un símbolo
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return { 
        valid: false, 
        error: 'La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un símbolo' 
      };
    }
    return { valid: true };
  };

  // Handlers
  const handleLogin = async () => {
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
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoading(true);

    try {
      const credentials: LoginCredentials = {
        email: loginEmail.trim(),
        password: loginPassword,
      };

      const response = await AuthService.login(credentials);
      
      if (response.token) {
        // Ocultar mensaje de registro exitoso si está visible
        setRegistrationSuccess(false);
        // Aquí puedes guardar el token usando SecureStore o AsyncStorage
        // await SecureStore.setItemAsync('auth_token', response.token);
        Alert.alert('Éxito', 'Sesión iniciada correctamente', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      passwordConfirmation?: string;
      termsAccepted?: string;
      privacyAccepted?: string;
    } = {};

    if (!registerFirstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }

    if (!registerEmail.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Email inválido';
    }

    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }

    if (!registerConfirmPassword) {
      errors.passwordConfirmation = 'Confirma tu contraseña';
    } else if (registerPassword !== registerConfirmPassword) {
      errors.passwordConfirmation = 'Las contraseñas no coinciden';
    }

    if (!registerTermsAccepted) {
      errors.termsAccepted = 'Debes aceptar los términos y condiciones';
    }

    if (!registerPrivacyAccepted) {
      errors.privacyAccepted = 'Debes aceptar la política de privacidad';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setRegisterErrors({});
    setLoading(true);

    try {
      const userData: RegisterData = {
        email: registerEmail.trim(),
        password: registerPassword,
        passwordConfirmation: registerConfirmPassword,
        firstName: registerFirstName.trim(),
        lastName: registerLastName.trim() || undefined,
        termsAccepted: registerTermsAccepted,
        privacyAccepted: registerPrivacyAccepted,
      };

      const response = await AuthService.register(userData);
      
      // Limpiar el formulario
      setRegisterFirstName('');
      setRegisterLastName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterTermsAccepted(false);
      setRegisterPrivacyAccepted(false);
      
      // Cambiar a la pantalla de login
      setScreen('login');
      
      // Mostrar mensaje de éxito
      setRegistrationSuccess(true);
      
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      Alert.alert('Error', errorMessage);
      
      // Si hay un campo específico en el error, marcarlo
      if (error instanceof Error && 'field' in error) {
        const field = (error as any).field;
        if (field) {
          setRegisterErrors({ [field]: errorMessage });
        }
      }
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
      setForgotError(errors.email);
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

      {registrationSuccess && (
        <ThemedView style={styles.successMessageContainer}>
          <ThemedText style={styles.successMessageText} lightColor="#34c759" darkColor="#34c759">
            ✓ ¡Usuario registrado exitosamente! Ya puedes iniciar sesión.
          </ThemedText>
        </ThemedView>
      )}

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

      <Button
        title="Iniciar Sesión"
        variant="outline"
        onPress={handleLogin}
        loading={loading}
        fullWidth
        style={styles.button}
      />

      <Button
        title="¿Olvidaste tu contraseña?"
        variant="text"
        onPress={() => setScreen('forgot-password')}
        style={styles.linkButton}
      />

      <ThemedView style={styles.divider}>
        <ThemedText style={styles.dividerText}>¿No tienes cuenta?</ThemedText>
        <Button
          title="Regístrate"
          variant="outline"
          onPress={() => {
            setScreen('register');
            setRegistrationSuccess(false); // Ocultar mensaje al cambiar de pantalla
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
        placeholder="Tu nombre"
        value={registerFirstName}
        onChangeText={(text) => {
          setRegisterFirstName(text);
          if (registerErrors.firstName) setRegisterErrors({ ...registerErrors, firstName: undefined });
        }}
        autoCapitalize="words"
        autoComplete="given-name"
        error={registerErrors.firstName}
      />

      <Input
        label="Apellido (Opcional)"
        placeholder="Tu apellido"
        value={registerLastName}
        onChangeText={(text) => {
          setRegisterLastName(text);
          if (registerErrors.lastName) setRegisterErrors({ ...registerErrors, lastName: undefined });
        }}
        autoCapitalize="words"
        autoComplete="family-name"
        error={registerErrors.lastName}
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
        placeholder="8-15 caracteres, mayúscula, minúscula, número y símbolo"
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
          if (registerErrors.passwordConfirmation)
            setRegisterErrors({ ...registerErrors, passwordConfirmation: undefined });
        }}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoComplete="password-new"
        error={registerErrors.passwordConfirmation}
      />

      <ThemedView style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setRegisterTermsAccepted(!registerTermsAccepted)}
        >
          <View style={[styles.checkbox, registerTermsAccepted && styles.checkboxChecked]}>
            {registerTermsAccepted && <ThemedText style={styles.checkmark}>✓</ThemedText>}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            Acepto los términos y condiciones
          </ThemedText>
        </TouchableOpacity>
        {registerErrors.termsAccepted && (
          <ThemedText style={styles.checkboxError} lightColor="#ff3b30" darkColor="#ff3b30">
            {registerErrors.termsAccepted}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setRegisterPrivacyAccepted(!registerPrivacyAccepted)}
        >
          <View style={[styles.checkbox, registerPrivacyAccepted && styles.checkboxChecked]}>
            {registerPrivacyAccepted && <ThemedText style={styles.checkmark}>✓</ThemedText>}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            Acepto la política de privacidad
          </ThemedText>
        </TouchableOpacity>
        {registerErrors.privacyAccepted && (
          <ThemedText style={styles.checkboxError} lightColor="#ff3b30" darkColor="#ff3b30">
            {registerErrors.privacyAccepted}
          </ThemedText>
        )}
      </ThemedView>

      <Button
        title="Registrarse"
        variant="outline"
        onPress={handleRegister}
        loading={loading}
        fullWidth
        style={styles.button}
      />

      <ThemedView style={styles.divider}>
        <ThemedText style={styles.dividerText}>¿Ya tienes cuenta?</ThemedText>
        <Button
          title="Iniciar Sesión"
          variant="outline"
          onPress={() => setScreen('login')}
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
              setScreen('login');
              setForgotEmail('');
              setForgotSuccess(false);
              setForgotError('');
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
              setScreen('login');
              setForgotEmail('');
              setForgotError('');
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {screen === 'login' && renderLogin()}
        {screen === 'register' && renderRegister()}
        {screen === 'forgot-password' && renderForgotPassword()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  divider: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
  },
  dividerText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  secondaryButton: {
    width: '100%',
  },
  successContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0a7ea4',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
  },
  checkboxError: {
    fontSize: 12,
    marginLeft: 32,
    marginTop: 4,
  },
  successMessageContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  successMessageText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

