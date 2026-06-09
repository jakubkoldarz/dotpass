import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

import { colors, spacing, radius, typography } from '../../styles';
import Input from '../ui/Input';
import Button from '../ui/Button';

type DeviceStructure = {
  id: string;
  name: string;
  macaddress: string;
  isPublicInWorkspace: boolean;
}

type DeviceInfoTabProps = {
  device: DeviceStructure;
  onUpdate: (patch: { name?: string; isPublicInWorkspace?: boolean }) => void;
  onNfcWrite: () => void;
  onTest: () => void;
  status: 'ok' | 'warning' | 'error';
}

export default function DeviceInfoTab({ device, onUpdate, onNfcWrite, onTest, status }: DeviceInfoTabProps) {
  const [name, setName] = useState(device.name || '');

  const statusColor =
    status === 'error'   ? colors.error :
    status === 'warning' ? colors.orange :
    colors.accent;

  return (
    <View style={styles.container}>

      {/* Nazwa */}
      <Input
        label="Nazwa płytki"
        value={name}
        onChangeText={setName}
        placeholder="Wpisz nazwę"
      />
      <Button
        title="Zapisz nazwę"
        onPress={() => onUpdate({ name })}
        style={{ marginTop: spacing.sm }}
      />

      {/* Publiczny dostęp */}
      <View style={styles.card}>
        <View style={styles.publicRow}>
          <View style={styles.publicMeta}>
            <Text style={styles.publicLabel}>Publiczny w workspace</Text>
            <Text style={styles.publicSub}>
              Każdy członek tej przestrzeni może otworzyć te drzwi
            </Text>
          </View>
          <Switch
            value={device.isPublicInWorkspace}
            onValueChange={(val) => onUpdate({ isPublicInWorkspace: val })}
            trackColor={{ false: colors.border, true: colors.accentRing }}
            thumbColor={device.isPublicInWorkspace ? colors.accent : colors.dim}
          />
        </View>
      </View>

      {/* Dane techniczne */}
      <View style={styles.card}>
        <Text style={styles.label}>MAC address</Text>
        <Text style={styles.value}>{device.macaddress}</Text>

        <Text style={[styles.label, { marginTop: spacing.md }]}>ID urządzenia</Text>
        <Text style={styles.value}>{device.id}</Text>

        <Text style={[styles.label, { marginTop: spacing.md }]}>Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.value, { color: statusColor }]}>
            {status === 'ok' ? 'OK' : status === 'warning' ? 'Wymaga uwagi' : 'Błąd'}
          </Text>
        </View>
      </View>

      {/* NFC */}
      <Button
        title="Zaprogramuj tag NFC"
        variant="admin"
        onPress={onNfcWrite}
        style={{ marginTop: spacing.xl }}
      />

      {/* Test */}
      <Button
        title="Testuj płytkę (otwórz drzwi)"
        variant="primary"
        onPress={onTest}
        style={{ marginTop: spacing.md }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 12,
    color: colors.dim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    color: colors.white,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  publicMeta: {
    flex: 1,
  },
  publicLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  publicSub: {
    fontSize: 12,
    color: colors.dim,
    marginTop: 3,
    lineHeight: 17,
  },
});