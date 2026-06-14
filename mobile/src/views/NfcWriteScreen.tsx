import React, { useEffect, useRef } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { colors } from '../styles';

interface NfcWriteScreenProps {
  route: {
    params: {
      deviceId: string | number;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export default function NfcWriteScreen({ route, navigation }: NfcWriteScreenProps) {
  const { deviceId } = route.params;
  const isWritingRef = useRef(false);

  useEffect(() => {
    async function initAndWrite() {
      if (isWritingRef.current) return;
      isWritingRef.current = true;

      try {
        await NfcManager.start();
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const uri = `dotpass://door/${deviceId}`;
        const bytes = Ndef.encodeMessage([
          Ndef.uriRecord(uri)
        ]);

        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        Alert.alert('Sukces', 'Tag został zaprogramowany pomyślnie!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (ex) {
        console.warn('NFC Write Error:', ex);
        Alert.alert('Błąd', 'Nie udało się zaprogramować tagu. Spróbuj ponownie.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } finally {
        await NfcManager.cancelTechnologyRequest().catch(() => null);
        isWritingRef.current = false;
      }
    }

    initAndWrite();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => null);
    };
  }, [deviceId, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} style={{ marginBottom: 20 }} />
      <Text style={styles.text}>Zbliż czysty tag NFC do pleców telefonu...</Text>
      <Text style={styles.subtext}>Trzymaj nieruchomo przez około 2 sekundy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 20,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    color: colors.dim,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});