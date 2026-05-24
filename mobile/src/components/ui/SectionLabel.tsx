import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { typography, spacing } from '../../styles';

type SectionLabelProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export default function SectionLabel({ children, style } : SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.sectionLabel,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
