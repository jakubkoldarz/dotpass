import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useBle } from '../hooks/useBle';
import { useBleStore, BleDevice } from '../stores/bleStore';

type Props = NativeStackScreenProps<RootStackParamList, 'BleConfig'>;

const MODES = [
  { value: 'nfc_only',   label: 'NFC Only',    sub: 'Otwiera tylko przez tag NFC' },
  { value: 'proximity',  label: 'Proximity',   sub: 'Otwiera gdy jesteś w pobliżu' },
  { value: 'long_range', label: 'Long Range',  sub: 'Otwiera z większej odległości' },
];

export default function BleConfigScreen({ navigation }: Props) {
  const { startScan, sendConfig } = useBle();
  const { status, error, foundDevices, progress } = useBleStore();

  // Podstawowe pola
  const [ssid, setSsid] = useState('');
  const [provPwd, setProvPwd] = useState('');
  const [pass, setPass] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('8883');
  const [user, setUser] = useState('');
  const [mpwd, setMpwd] = useState('');

  // Zaawansowane
  const [mode, setMode]           = useState('nfc_only');
  const [rssi, setRssi]           = useState('-70');
  const [cooldown, setCooldown]   = useState('5000');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);

  const isFormValid =
    ssid.trim() && pass.trim() && host.trim() &&
    port.trim() && user.trim() && mpwd.trim() && provPwd.trim();

  const handleSend = async () => {
    if (!selectedDevice || !isFormValid) return;
    await sendConfig(selectedDevice.id, {
      ssid:     ssid.trim(),
      pass:     pass.trim(),
      host:     host.trim(),
      port:     parseInt(port.trim(), 10),
      user:     user.trim(),
      mpwd:     mpwd.trim(),
      provision_pwd: provPwd.trim(),
      mode,
      rssi:     parseInt(rssi.trim(), 10),
      cooldown: parseInt(cooldown.trim(), 10),
    });
  };

  const scanning   = status === 'scanning';
  const connecting = status === 'connecting';
  const sending    = status === 'sending';
  const done       = status === 'done';
  const busy       = scanning || connecting || sending;

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Konfiguracja BLE</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Podstawowa konfiguracja */}
        <Text style={styles.sectionLabel}>Dane konfiguracyjne</Text>
        <View style={styles.card}>
          <Input label="SSID sieci WiFi"   value={ssid} onChangeText={setSsid} placeholder="NazwaSieci" />
          <Input label="Hasło WiFi"        value={pass} onChangeText={setPass} placeholder="hasło" secure />
          <Input label="Host MQTT"         value={host} onChangeText={setHost} placeholder="broker.example.com" autoCapitalize="none" />
          <Input label="Port MQTT"         value={port} onChangeText={setPort} placeholder="8883" keyboardType="numeric" />
          <Input label="Użytkownik MQTT"   value={user} onChangeText={setUser} placeholder="mqtt_user" autoCapitalize="none" />
          <Input label="Hasło MQTT"        value={mpwd} onChangeText={setMpwd} placeholder="hasło MQTT" secure />
          <Input label="Hasło prowizji"     value={provPwd} onChangeText={setProvPwd} placeholder="Hasło konfiguracji płytki" secure />
        </View>

        {/* Sekcja zaawansowana */}
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(v => !v)}
        >
          <Text style={styles.advancedToggleText}>Ustawienia zaawansowane</Text>
          <Icon
            name="ChevronDown"
            size={16}
            color={colors.dim}
            style={{ transform: [{ rotate: showAdvanced ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.card}>

            {/* Tryb zamka */}
            <Text style={styles.fieldLabel}>Tryb zamka</Text>
            <View style={styles.modeList}>
              {MODES.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.modeRow, mode === m.value && styles.modeRowSelected]}
                  onPress={() => setMode(m.value)}
                >
                  <View style={styles.modeRadio}>
                    {mode === m.value && <View style={styles.modeRadioDot} />}
                  </View>
                  <View style={styles.modeMeta}>
                    <Text style={[styles.modeLabel, mode === m.value && styles.modeLabelSelected]}>
                      {m.label}
                    </Text>
                    <Text style={styles.modeSub}>{m.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* RSSI — tylko dla proximity i long_range */}
            {mode !== 'nfc_only' && (
              <Input
                label="Próg sygnału RSSI (dBm)"
                value={rssi}
                onChangeText={setRssi}
                placeholder="-70"
                keyboardType="numeric"
                style={{ marginTop: spacing.lg }}
              />
            )}

            {/* Cooldown */}
            <Input
              label="Cooldown po otwarciu (ms)"
              value={cooldown}
              onChangeText={setCooldown}
              placeholder="5000"
              keyboardType="numeric"
              style={{ marginTop: spacing.md }}
            />
            <Text style={styles.hint}>
              Czas blokady po otwarciu drzwi. 5000 = 5 sekund.
            </Text>

          </View>
        )}

        {/* Skanowanie */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Urządzenie</Text>

        <Button
          title={scanning ? 'Skanowanie...' : 'Skanuj w poszukiwaniu płytki'}
          variant="admin"
          onPress={startScan}
          disabled={busy}
          loading={scanning}
        />

        {foundDevices.length > 0 && (
          <View style={styles.deviceList}>
            {foundDevices.map((d) => {
              const isSelected = selectedDevice?.id === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.deviceRow, isSelected && styles.deviceRowSelected]}
                  onPress={() => setSelectedDevice(d)}
                  disabled={busy}
                >
                  <View style={styles.deviceIcon}>
                    <Icon name="Cpu" size={18} color={isSelected ? colors.accent : colors.blue} />
                  </View>
                  <View style={styles.deviceMeta}>
                    <Text style={styles.deviceName}>{d.name}</Text>
                    <Text style={styles.deviceId}>{d.id}</Text>
                    {d.rssi !== undefined && (
                      <Text style={styles.deviceRssi}>RSSI: {d.rssi} dBm</Text>
                    )}
                  </View>
                  {isSelected && <Icon name="Check" size={18} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {status === 'idle' && foundDevices.length === 0 && (
          <Text style={styles.emptyHint}>
            Upewnij się że płytka jest włączona i w pobliżu, następnie naciśnij Skanuj.
          </Text>
        )}

        {/* Wysyłanie */}
        {selectedDevice && !done && (
          <>
            {(connecting || sending) && (
              <View style={styles.progressBox}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.progressText}>
                  {connecting
                    ? `Łączenie z ${selectedDevice.name}...`
                    : `Wysyłanie konfiguracji... ${progress}%`}
                </Text>
                {sending && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </View>
            )}

            <Button
              title="Wyślij konfigurację"
              variant="primary"
              onPress={handleSend}
              disabled={!isFormValid || busy}
              loading={connecting || sending}
              style={{ marginTop: spacing.lg }}
            />
          </>
        )}

        {/* Sukces */}
        {done && (
          <View style={styles.successBox}>
            <Icon name="CheckCircle" size={28} color={colors.accent} />
            <Text style={styles.successTitle}>Konfiguracja wysłana!</Text>
            <Text style={styles.successSub}>
              Płytka zapisała dane i uruchomiła się ponownie. Za chwilę pojawi się w systemie.
            </Text>
            <Button
              title="Gotowe"
              onPress={() => navigation.goBack()}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Icon name="AlertTriangle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: spacing.md,
  },
  backBtn: { padding: 4 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: { ...typography.sectionLabel },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.dim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  // Tryb zamka
  modeList: { gap: spacing.sm },
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
  modeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  modeMeta: { flex: 1 },
  modeLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
  modeLabelSelected: { color: colors.accent },
  modeSub: { fontSize: 11, color: colors.dim, marginTop: 2 },

  // Zaawansowane toggle
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  advancedToggleText: {
    fontSize: 13,
    color: colors.dim,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: colors.faint,
    marginTop: spacing.xs,
  },

  // Lista urządzeń
  deviceList: { gap: spacing.md, marginTop: spacing.sm },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  deviceRowSelected: {
    borderColor: colors.accentRing,
    backgroundColor: colors.accentFill,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.blueFill,
    borderWidth: 1,
    borderColor: colors.blueRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceMeta: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '700', color: colors.white },
  deviceId:   { fontSize: 11, color: colors.dim, marginTop: 2 },
  deviceRssi: { fontSize: 11, color: colors.faint, marginTop: 1 },
  emptyHint: {
    fontSize: 13,
    color: colors.dim,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },

  // Postęp
  progressBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  progressText: { fontSize: 13, color: colors.white, textAlign: 'center' },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  // Sukces
  successBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.accentRing,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  successTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  successSub:   { fontSize: 13, color: colors.dim, textAlign: 'center', lineHeight: 20 },

  // Błąd
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  errorText: { flex: 1, fontSize: 13, color: colors.error },
});