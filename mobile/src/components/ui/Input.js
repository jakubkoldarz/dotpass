import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../styles';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  style,
  ...rest
}) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        secureTextEntry={secure}
        style={[styles.input, error && styles.inputError, style]}
        {...rest}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.fieldLabel,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.error,
  },
});
