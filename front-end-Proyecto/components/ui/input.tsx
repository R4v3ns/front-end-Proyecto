import { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  lightColor?: string;
  darkColor?: string;
}

export function Input({
  label,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  style,
  lightColor,
  darkColor,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  
  const borderColor = error
    ? '#ff3b30'
    : isFocused
    ? '#0a7ea4'
    : iconColor;

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor },
          ]}
          placeholderTextColor={iconColor}
          secureTextEntry={actualSecureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={iconColor}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <ThemedText style={styles.error} lightColor="#ff3b30" darkColor="#ff3b30">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

