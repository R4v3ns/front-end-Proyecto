import { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      };

      const response = await AuthService.register(userData);
      
      Alert.alert('Éxito', 'Usuario registrado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setScreen('login');
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
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
          onPress={() => setScreen('register')}
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
});

