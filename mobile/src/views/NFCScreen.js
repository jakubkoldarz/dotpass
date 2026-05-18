import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
} from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

NfcManager.start();

const TABS = { READ: 'read', WRITE: 'write' };

export default function NFCScreen({ navigation, route }) {
  const isAdmin = route.params?.isAdmin ?? false;

  const [activeTab, setActiveTab]       = useState(TABS.READ);
  const [nfcSupported, setNfcSupported] = useState(null);
  const [nfcEnabled, setNfcEnabled]     = useState(false);
  const [scanning, setScanning]         = useState(false);
  const [tagData, setTagData]           = useState(null);
  const [error, setError]               = useState(null);
  const [log, setLog]                   = useState([]);

  // Zapis
  const [writeText, setWriteText]       = useState('');
  const [writeStatus, setWriteStatus]   = useState(null); // null | 'success' | 'error'

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkNfc();
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  const addLog = (msg) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);

  const checkNfc = async () => {
    try {
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);
      addLog(supported ? 'NFC obsługiwane przez urządzenie' : 'NFC nieobsługiwane');
      if (supported) {
        const enabled = await NfcManager.isEnabled();
        setNfcEnabled(enabled);
        addLog(enabled ? 'NFC włączone' : 'NFC wyłączone w ustawieniach');
      }
    } catch (e) {
      setNfcSupported(false);
      addLog(`Błąd sprawdzania NFC: ${e.message}`);
    }
  };

  // ── ODCZYT ────────────────────────────────────────────────────
  const readNfcTag = useCallback(async () => {
    if (scanning) { await cancelScan(); return; }
    setTagData(null);
    setError(null);
    setScanning(true);
    addLog('Rozpoczynam skanowanie (odczyt)...');
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      addLog(`Tag znaleziony! ID: ${tag.id}`);
      let parsed = null;
      if (tag.ndefMessage?.length > 0) {
        parsed = tag.ndefMessage.map((record, i) => ({
          index: i,
          type: record.type,
          text: Ndef.text.decodePayload(new Uint8Array(record.payload)),
        }));
      }
      setTagData({ id: tag.id, tech: tag.techTypes, ndef: parsed });
      addLog(`Odczytano ${parsed?.length ?? 0} rekordów NDEF`);
    } catch (e) {
      if (e.message !== 'cancelled') {
        setError(`Błąd odczytu: ${e.message}`);
        addLog(`Błąd: ${e.message}`);
      } else {
        addLog('Skanowanie anulowane');
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
    }
  }, [scanning]);

  // ── ZAPIS ─────────────────────────────────────────────────────
  const writeNfcTag = useCallback(async () => {
    if (!writeText.trim()) {
      setError('Wpisz tekst do zapisania');
      return;
    }
    if (scanning) { await cancelScan(); return; }
    setWriteStatus(null);
    setError(null);
    setScanning(true);
    addLog('Rozpoczynam skanowanie (zapis)...');
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(writeText.trim())]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      setWriteStatus('success');
      addLog(`Zapisano: "${writeText.trim()}"`);
    } catch (e) {
      if (e.message !== 'cancelled') {
        setWriteStatus('error');
        setError(`Błąd zapisu: ${e.message}`);
        addLog(`Błąd zapisu: ${e.message}`);
      } else {
        addLog('Zapis anulowany');
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
    }
  }, [scanning, writeText]);

  const cancelScan = async () => {
    await NfcManager.cancelTechnologyRequest().catch(() => {});
    setScanning(false);
    addLog('Anulowano ręcznie');
  };

  if (nfcSupported === null) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.checkingText}>Sprawdzanie NFC…</Text>
      </View>
    );
  }

  const nfcReady = nfcSupported && nfcEnabled;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Nagłówek */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Skaner NFC</Text>
        <View style={styles.topRight}>
          {isAdmin && (
            <View style={styles.adminPill}>
              <Text style={styles.adminPillText}>ADMIN</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: nfcEnabled ? '#00E5A0' : '#FF4444' }]} />
        </View>
      </View>

      {/* Zakładki – widoczne tylko dla admina */}
      {isAdmin && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.READ && styles.tabActive]}
            onPress={() => { setActiveTab(TABS.READ); setError(null); setWriteStatus(null); }}
          >
            <Text style={[styles.tabText, activeTab === TABS.READ && styles.tabTextActive]}>
              ◈  Odczyt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.WRITE && styles.tabActive]}
            onPress={() => { setActiveTab(TABS.WRITE); setError(null); setTagData(null); }}
          >
            <Text style={[styles.tabText, activeTab === TABS.WRITE && styles.tabTextActive]}>
              ✎  Zapis
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Animowany okrąg */}
        <View style={styles.scanArea}>
          <Animated.View style={[
            styles.scanRing,
            activeTab === TABS.WRITE && styles.scanRingWrite,
            { transform: [{ scale: pulseAnim }] },
          ]}>
            <View style={[styles.scanCircle, activeTab === TABS.WRITE && styles.scanCircleWrite]}>
              <Text style={styles.nfcIcon}>
                {scanning ? '📡' : activeTab === TABS.WRITE ? '✎' : '◈'}
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.scanStatus}>
            {!nfcSupported
              ? 'Urządzenie nie obsługuje NFC'
              : !nfcEnabled
              ? 'NFC jest wyłączone'
              : scanning
              ? activeTab === TABS.WRITE ? 'Zbliż tag do zapisu…' : 'Zbliż tag NFC…'
              : activeTab === TABS.WRITE
              ? writeStatus === 'success' ? '✓ Zapisano pomyślnie!' : 'Gotowy do zapisu'
              : tagData ? 'Tag odczytany!' : 'Gotowy do skanowania'}
          </Text>
        </View>

        {/* ── PANEL ODCZYTU ──────────────────────────────────── */}
        {activeTab === TABS.READ && (
          <>
            {nfcReady && (
              <TouchableOpacity
                style={[styles.button, scanning && styles.buttonCancel]}
                onPress={readNfcTag}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {scanning ? '✕  Anuluj skanowanie' : '◈  Skanuj tag'}
                </Text>
              </TouchableOpacity>
            )}
            {tagData && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Dane tagu</Text>
                <Row label="ID tagu" value={tagData.id ?? 'brak'} />
                <Row label="Technologie" value={(tagData.tech ?? []).join(', ') || 'brak'} />
                {tagData.ndef?.length > 0
                  ? tagData.ndef.map((r, i) => (
                      <Row key={i} label={`Rekord ${i + 1}`} value={r.text || '(pusty)'} />
                    ))
                  : <Row label="NDEF" value="Brak rekordów / pusty tag" />}
              </View>
            )}
          </>
        )}

        {/* ── PANEL ZAPISU (tylko admin) ──────────────────────── */}
        {activeTab === TABS.WRITE && (
          <>
            <View style={styles.writeCard}>
              <Text style={styles.cardTitle}>Treść do zapisania</Text>
              <Text style={styles.writeHint}>
                Tekst zostanie zapisany jako rekord NDEF (Text Record) na tagu. Upewnij się, że tag jest zapisywalny.
              </Text>
              <TextInput
                style={[styles.writeInput, scanning && styles.writeInputDisabled]}
                placeholder="np. ID urządzenia, URL, opis…"
                placeholderTextColor="#444"
                value={writeText}
                onChangeText={(v) => { setWriteText(v); setWriteStatus(null); }}
                multiline
                maxLength={250}
                editable={!scanning}
              />
              <Text style={styles.charCount}>{writeText.length} / 250</Text>
            </View>

            {nfcReady && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonWrite,
                  scanning && styles.buttonCancel,
                  writeStatus === 'success' && styles.buttonSuccess,
                ]}
                onPress={scanning ? cancelScan : writeNfcTag}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, styles.buttonTextLight]}>
                  {scanning
                    ? '✕  Anuluj zapis'
                    : writeStatus === 'success'
                    ? '✓  Zapisano – zapisz ponownie'
                    : '✎  Zapisz na tag'}
                </Text>
              </TouchableOpacity>
            )}

            {writeStatus === 'success' && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✓ Dane zostały poprawnie zapisane na tagu NFC.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Komunikaty wspólne */}
        {!nfcSupported && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>To urządzenie nie obsługuje technologii NFC.</Text>
          </View>
        )}
        {nfcSupported && !nfcEnabled && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Włącz NFC w ustawieniach systemu, a następnie wróć tutaj.</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Log zdarzeń */}
        {log.length > 0 && (
          <View style={styles.logBox}>
            <Text style={styles.logTitle}>Log zdarzeń</Text>
            {log.map((line, i) => (
              <Text key={i} style={[styles.logLine, i === 0 && styles.logLineLatest]}>
                {line}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  label: { fontSize: 12, color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 13, color: '#CCC', flex: 1, textAlign: 'right', marginLeft: 16 },
});

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0D0D0D' },
  centered:     { alignItems: 'center', justifyContent: 'center' },
  checkingText: { color: '#555', fontSize: 14 },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  backBtn:  { padding: 4, marginRight: 12 },
  backIcon: { fontSize: 22, color: '#00E5A0' },
  topTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminPill: {
    backgroundColor: '#000C2A', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#0052FF60',
  },
  adminPillText: { fontSize: 10, fontWeight: '700', color: '#0052FF', letterSpacing: 0.8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  tabs: {
    flexDirection: 'row', backgroundColor: '#111',
    marginHorizontal: 20, marginTop: 16,
    borderRadius: 10, padding: 3, gap: 3,
  },
  tab:           { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive:     { backgroundColor: '#1E1E1E' },
  tabText:       { fontSize: 13, color: '#555', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  content: { padding: 24, gap: 20 },

  scanArea:       { alignItems: 'center', paddingVertical: 20, gap: 16 },
  scanRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2, borderColor: '#00E5A020',
    alignItems: 'center', justifyContent: 'center',
  },
  scanRingWrite:  { borderColor: '#0052FF20' },
  scanCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#161616', borderWidth: 1, borderColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center',
  },
  scanCircleWrite: { borderColor: '#0052FF40' },
  nfcIcon:    { fontSize: 42 },
  scanStatus: { fontSize: 15, color: '#AAA', fontWeight: '500', textAlign: 'center' },

  button:        { backgroundColor: '#00E5A0', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonWrite:   { backgroundColor: '#0052FF' },
  buttonCancel:  { backgroundColor: '#2A2A2A', borderWidth: 1, borderColor: '#FF4444' },
  buttonSuccess: { backgroundColor: '#001F15', borderWidth: 1, borderColor: '#00E5A0' },
  buttonText:    { fontSize: 15, fontWeight: '700', color: '#0D0D0D', letterSpacing: 0.3 },
  buttonTextLight: { color: '#FFF' },

  card: {
    backgroundColor: '#161616', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#2A2A2A',
  },
  cardTitle: {
    fontSize: 13, fontWeight: '700', color: '#00E5A0',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },

  writeCard: {
    backgroundColor: '#161616', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#0052FF40', gap: 10,
  },
  writeHint: { fontSize: 12, color: '#555', lineHeight: 18 },
  writeInput: {
    backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#2A2A2A',
    borderRadius: 10, padding: 14, fontSize: 14, color: '#FFF',
    minHeight: 90, textAlignVertical: 'top',
  },
  writeInputDisabled: { opacity: 0.5 },
  charCount: { fontSize: 11, color: '#444', textAlign: 'right' },

  successBox: {
    backgroundColor: '#001F15', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#00E5A060',
  },
  successText: { fontSize: 13, color: '#00E5A0', fontWeight: '600' },

  infoBox:  { backgroundColor: '#161616', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  infoText: { fontSize: 14, color: '#888', lineHeight: 20, textAlign: 'center' },
  errorBox: { backgroundColor: '#1A0606', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FF4444' },
  errorText: { fontSize: 13, color: '#FF6B6B' },

  logBox:   { backgroundColor: '#0A0A0A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1E1E1E' },
  logTitle: { fontSize: 11, fontWeight: '700', color: '#444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  logLine:  { fontSize: 11, color: '#444', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 4 },
  logLineLatest: { color: '#00E5A0' },
});