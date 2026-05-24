import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../styles';
import Icon from '../shared/Icon';

export default function AdminBanner() {
  return (
    <View style={styles.banner}>
      <Icon name="ShieldCheck" size={12} color={colors.blue} />
      <Text style={styles.text}>Tryb administracyjny aktywny</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.blueFill,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueRing,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontSize: 12,
    color: colors.blue,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
