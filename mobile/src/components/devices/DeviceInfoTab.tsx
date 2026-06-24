import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../../styles';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { UnlockMode, isDeviceOffline } from '../../api/deviceApi';

type DeviceStructure = {
  id: string;
  name: string;
  macaddress: string;
  isPublicInWorkspace: boolean;
  unlockMode: UnlockMode;
  lastSeen?: string;
}

type DeviceInfoTabProps = {
  device: DeviceStructure;
  onUpdate: (patch: { name?: string; isPublicInWorkspace?: boolean; unlockMode?: UnlockMode }) => void;
  onNfcWrite: () => void;
  onTest: () => void;
  status: 'ok' | 'warning' | 'error';
}

const UNLOCK_MODES = [
  { value: UnlockMode.NfcOnly,   label: 'NFC Only',    sub: 'Otwiera tylko przez tag NFC',           icon: '📶' },
  { value: UnlockMode.Proximity, label: 'Proximity',   sub: 'Otwiera gdy telefon jest w pobliżu',    icon: '📡' },
  { value: UnlockMode.LongRange, label: 'Long Range',  sub: 'Otwiera z większej odległości BLE',     icon: '🔭' },
];

function formatLastSeen(lastSeen?: string): { text: string; offline: boolean } {
  if (!lastSeen) return { text: 'Nieznany', offline: true };

  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  const offline = isDeviceOffline(lastSeen);

  if (mins < 1)    return { text: 'Przed chwilą', offline: false };
  if (mins < 60)   return { text: `${mins} min temu`, offline: false };
  if (hours < 24)  return { text: `${hours}h temu`, offline: false };
  return { text: `${days} dni temu`, offline };
}

export default function DeviceInfoTab({ device, onUpdate, onNfcWrite, onTest, status }: DeviceInfoTabProps) {
  const [name, setName] = useState(device.name || '');

  const statusColor =
    status === 'error'   ? colors.error :
    status === 'warning' ? colors.orange :
    colors.accent;

  const { text: lastSeenText, offline } = formatLastSeen(device.lastSeen);

  return (
    <View style={styles.container}>

      {/* Baner offline */}
      {offline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Płytka nie komunikowała się z serwerem od ponad 24h — może być offline lub uszkodzona.
          </Text>
        </View>
      )}

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

      {/* Tryb otwierania */}
      <View style={styles.card}>
        <Text style={styles.label}>Tryb otwierania</Text>
        <View style={styles.modeList}>
          {UNLOCK_MODES.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[styles.modeRow, device.unlockMode === m.value && styles.modeRowSelected]}
              onPress={() => onUpdate({ unlockMode: m.value })}
            >
              <Text style={styles.modeIcon}>{m.icon}</Text>
              <View style={styles.modeMeta}>
                <Text style={[styles.modeLabel, device.unlockMode === m.value && styles.modeLabelSelected]}>
                  {m.label}
                </Text>
                <Text style={styles.modeSub}>{m.sub}</Text>
              </View>
              {device.unlockMode === m.value && (
                <View style={styles.modeCheck}>
                  <Text style={{ color: colors.accent, fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dane techniczne */}
      <View style={styles.card}>
        <Text style={styles.label}>MAC address</Text>
        <Text style={styles.value}>{device.macaddress}</Text>

        <Text style={[styles.label, { marginTop: spacing.md }]}>ID urządzenia</Text>
        <Text style={styles.value}>{device.id}</Text>

        <Text style={[styles.label, { marginTop: spacing.md }]}>Ostatnia komunikacja</Text>
        <Text style={[styles.value, offline && { color: colors.error }]}>
          {lastSeenText}
        </Text>

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
  container: { gap: spacing.lg },
  offlineBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  offlineText: { fontSize: 13, color: colors.error, lineHeight: 18 },
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
    marginBottom: 4,
  },
  value: { fontSize: 15, color: colors.white, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  publicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  publicMeta: { flex: 1 },
  publicLabel: { fontSize: 15, fontWeight: '700', color: colors.white },
  publicSub: { fontSize: 12, color: colors.dim, marginTop: 3, lineHeight: 17 },
  modeList: { gap: spacing.sm, marginTop: spacing.sm },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  modeRowSelected: {
    borderColor: colors.accentRing,
    backgroundColor: colors.accentFill,
  },
  modeIcon: { fontSize: 18 },
  modeMeta: { flex: 1 },
  modeLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
  modeLabelSelected: { color: colors.accent },
  modeSub: { fontSize: 11, color: colors.dim, marginTop: 2 },
  modeCheck: { width: 24, alignItems: 'center' },
});