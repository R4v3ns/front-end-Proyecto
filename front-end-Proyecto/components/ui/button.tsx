import { Pressable, StyleSheet, ActivityIndicator, PressableProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  fullWidth?: boolean;
  style?: PressableProps['style'];
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const tintColor = useThemeColor({}, 'tint');

  const getButtonStyle = (pressed: boolean) => {
    const baseStyle: any[] = [styles.button];
    if (fullWidth) baseStyle.push(styles.fullWidth);
    
    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: tintColor });
        break;
      case 'secondary':
        baseStyle.push({ backgroundColor: tintColor + '20' });
        break;
      case 'outline':
        baseStyle.push({ borderWidth: 1, borderColor: tintColor, backgroundColor: 'transparent' });
        break;
      case 'text':
        baseStyle.push({ backgroundColor: 'transparent' });
        break;
    }

    if (disabled || loading) baseStyle.push(styles.disabled);
    if (pressed && !disabled && !loading) baseStyle.push(styles.pressed);
    if (style) baseStyle.push(style);

    return baseStyle;
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return tintColor;
      case 'outline':
        return tintColor;
      case 'text':
        return tintColor;
      default:
        return '#FFFFFF';
    }
  };

  const textColor = getTextColor();

  return (
    <Pressable
      style={({ pressed }) => getButtonStyle(pressed)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText
          style={[styles.buttonText, { color: textColor }]}
          lightColor={textColor}
          darkColor={textColor}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});

