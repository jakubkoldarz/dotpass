import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, radius, typography } from '../../styles';
import Input from '../ui/Input';
import Button from '../ui/Button';

import { useNavigation } from '@react-navigation/native';

type DeviceStructure = {
  id: string;
  name: string;
  macaddress: string;
}

type DeviceInfoTabProps = {
  device: DeviceStructure;
  onRename: (newName: string) => void;
  onNfcWrite?: () => void;
  onTest: () => void;
  status: 'ok' | 'warning' | 'error';
}

export default function DeviceInfoTab({ device, onRename, onNfcWrite, onTest, status }: DeviceInfoTabProps) {

    const navigation = useNavigation();

  const [name, setName] = useState(device.name || '');
  // ok | warning | error

  const statusColor =
    status === 'error'   ? colors.error :
    status === 'warning' ? '#FFB020' :
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
        onPress={() => onRename(name)}
        style={{ marginTop: spacing.sm }}
      />

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
        onPress={() => navigation.navigate('NfcWrite', { deviceId: device.id })}
        style={{ marginTop: spacing.xl }}
      />

      {/* Test */}
      <Button
        title="Testuj płytkę"
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
});
