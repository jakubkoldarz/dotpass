import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useServerStore } from '../stores/serverStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const colors = {
  background: '#121214',
  surfaceAlt: '#1a1a1e',
  border: '#2c2c35',
  accent: '#00adb5',
  text: '#ffffff',
  textMuted: '#8a8a93',
  error: '#ff5252',
};

type Props = NativeStackScreenProps<RootStackParamList, 'ServerConfig'>;

export default function ServerConfigScreen({ navigation }: Props) {
  const [serverName, setServerName] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  const { checkAndAddServer, isLoading, error, clearError } = useServerStore();

  const handleConnect = async () => {
    if (!serverName.trim() || !serverUrl.trim()) {
      Alert.alert('Błąd', 'Wypełnij nazwę serwera oraz jego adres URL.');
      return;
    }

    const success = await checkAndAddServer(serverName, serverUrl);

    if (success) {
      Alert.alert('Sukces', 'Serwer został poprawnie zweryfikowany i dodany!', [
        {
          text: 'OK',
          onPress: () => {
            setServerName('');
            setServerUrl('');
            navigation.navigate('Login');
          }
        }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>🌐</Text>
          </View>
          <Text style={styles.title}>Konfiguracja Serwera</Text>
          <Text style={styles.subtitle}>
            Ta aplikacja wymaga połączenia z dedykowanym serwerem Twojej organizacji.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nazwa serwera (np. Biuro lub Dom)</Text>
          <TextInput
            style={styles.input}
            placeholder="Wpisz przyjazną nazwę"
            placeholderTextColor={colors.textMuted}
            value={serverName}
            onChangeText={(text) => {
              if (error) clearError();
              setServerName(text);
            }}
            editable={!isLoading}
          />

          <Text style={styles.label}>Adres URL serwera</Text>
          <TextInput
            style={styles.input}
            placeholder="np. api.twojafirma.pl lub 192.168.1.50:3000"
            placeholderTextColor={colors.textMuted}
            value={serverUrl}
            onChangeText={(text) => {
              if (error) clearError();
              setServerUrl(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Testuj i Połącz</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});