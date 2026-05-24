import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { colors, layout, spacing, typography } from '../styles';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordToggle from '../components/ui/PasswordToggle';
import { mockLogin } from '../components/shared/Mockdata';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function LoginScreen({ navigation } : LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const user = mockLogin(email, password);
    if (!user) {
      setError('Nieprawidłowy e-mail lub hasło.');
      return;
    }
    navigation.navigate('Home', { user });
  };

  return (
    <KeyboardAvoidingView
      style={layout.screenRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / nagłówek */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>◈</Text>
          </View>
          <Text style={styles.title}>Zaloguj się</Text>
          <Text style={styles.subtitle}>Witaj ponownie</Text>
        </View>

        {/* Formularz */}
        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
            }}
            placeholder="adres@email.com"
            keyboardType="email-address"
          />

            <View style={{ position: 'relative' }}>
            <Input
              label="Hasło"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              placeholder="••••••••"
              secure={!passwordVisible}
            />

            <View style={styles.eyeWrapper}>
              <PasswordToggle
                visible={passwordVisible}
                onPress={() => setPasswordVisible(v => !v)}
              />
            </View>
          </View>

          {/* Błąd */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Przycisk */}
          <Button title="Zaloguj się" onPress={handleLogin} />

          {/* Link do rejestracji */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Nie masz konta?{' '}
              <Text style={styles.linkAccent}>Zarejestruj się</Text>
            </Text>
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
    marginBottom: 40,
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
    color: colors.accent,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    fontSize: 14,
    color: colors.dim,
    marginTop: 6,
  },
  form: {
    gap: spacing.lg,
  },
  eyeToggle: {
    position: 'absolute',
    right: 40,
    top: 178,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    color: colors.faint,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  linkRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: colors.dim,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: '600',
  },
  eyeWrapper: {
  position: 'absolute',
  right: 12,
  top: 30,
},
});
