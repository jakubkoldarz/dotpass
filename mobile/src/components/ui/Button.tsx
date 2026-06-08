import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../styles';

type ButtonVariant = 'primary' | 'admin' | 'cancel';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={spinnerColor[variant]}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const spinnerColor = {
  primary: colors.bg,
  admin: colors.white,
  cancel: colors.error,
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
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

  text: {
    ...typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  text_primary: {
    color: colors.bg,
  },

  text_admin: {
    color: colors.white,
  },

  text_cancel: {
    color: colors.error,
  },

  disabled: {
    opacity: 0.5,
  },
});