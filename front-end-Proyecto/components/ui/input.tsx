import { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Pressable, Dimensions } from 'react-native';
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
  backgroundColor?: string;
}

export function Input({
  label,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  style,
  lightColor,
  darkColor,
  backgroundColor: customBackgroundColor,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = customBackgroundColor || useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  
  const borderColor = error
    ? '#ff3b30'
    : isFocused
    ? '#404040'
    : '#404040';

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
            { color: textColor, backgroundColor: 'transparent' },
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

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const styles = StyleSheet.create({
  container: {
    marginBottom: isSmallScreen ? 14 : 16,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: isSmallScreen ? 14 : 12,
    minHeight: isSmallScreen ? 52 : 48,
    backgroundColor: '#282828',
  },
  input: {
    flex: 1,
    fontSize: isSmallScreen ? 17 : 16,
    paddingVertical: isSmallScreen ? 14 : 12,
  },
  eyeIcon: {
    padding: 4,
  },
  error: {
    fontSize: isSmallScreen ? 11 : 12,
    marginTop: 4,
  },
});

