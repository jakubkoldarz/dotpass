import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../styles';
import Icon from '../shared/Icon';

type DeviceProps = {
  id?: string;
  name?: string;
  macaddress: string;
}

type DeviceRowProps = {
  device: DeviceProps;
  status: 'ok' | 'warning' | 'error';
  onPress: () => void;
}

export default function DeviceRow({ device, status, onPress } : DeviceRowProps) {
  const statusColor =
    status === 'error'   ? colors.error :
    status === 'warning' ? '#FFB020' :
    colors.accent;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconBox}>
        <Icon name="Server" size={20} color={colors.blue} />
      </View>

      <View style={styles.meta}>
        <Text style={styles.name}>{device.name || 'Brak nazwy'}</Text>
        <Text style={styles.mac}>{device.macaddress}</Text>
      </View>

      <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
      <Icon name="ChevronRight" size={18} color={colors.dim} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.blueFill,
    borderWidth: 1,
    borderColor: colors.blueRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.white },
  mac: {
    fontSize: 11,
    color: colors.dim,
    marginTop: 3,
    ...typography.mono,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
