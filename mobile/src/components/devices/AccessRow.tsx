import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../styles';
import Icon from '../shared/Icon';

type AccessRowProps = {
  label: string;
  sub?: string;
  onRemove: () => void;
}

export default function AccessRow({ label, sub, onRemove } : AccessRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.meta}>
        <Text style={styles.label}>{label}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Icon name="X" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  meta: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  sub: {
    fontSize: 12,
    color: colors.dim,
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
});
