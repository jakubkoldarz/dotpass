import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../../styles';

type ButtonVariant = 'primary' | 'admin' | 'cancel';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
} : ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // warianty
  primary: {
    backgroundColor: colors.accent,
  },
  admin: {
    backgroundColor: colors.blue,
  },
  cancel: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.error,
  },

  // tekst
  text: {
    ...typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  text_primary: { color: colors.bg },
  text_admin: { color: colors.white },
  text_cancel: { color: colors.error },

  disabled: {
    opacity: 0.5,
  },
});
