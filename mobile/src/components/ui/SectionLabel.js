import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../../styles';

export default function SectionLabel({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.sectionLabel,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
