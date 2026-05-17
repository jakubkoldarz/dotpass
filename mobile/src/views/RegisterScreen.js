import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { colors, layout, spacing, typography } from '../styles';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordToggle from '../components/ui/PasswordToggle';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Imię jest wymagane';
    if (!email.includes('@')) newErrors.email = 'Podaj poprawny e-mail';
    if (password.length < 6) newErrors.password = 'Hasło min. 6 znaków';
    if (password !== confirmPassword) newErrors.confirm = 'Hasła nie są zgodne';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    console.log({ name, email, password });
    navigation.navigate('Login');
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
        {/* Nagłówek */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <Text style={styles.logoText}>✦</Text>
          </View>

          <Text style={styles.title}>Utwórz konto</Text>
          <Text style={styles.subtitle}>Wypełnij poniższe pola</Text>
        </View>

        {/* Formularz */}
        <View style={styles.form}>
          <Input
            label="Imię i nazwisko"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
            placeholder="Jan Kowalski"
            error={errors.name}
          />

          <Input
            label="E-mail"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors((e) => ({ ...e, email: undefined }));
            }}
            placeholder="adres@email.com"
            keyboardType="email-address"
            error={errors.email}
          />

          {/* Hasło */}
          <View style={{ position: 'relative' }}>
            <Input
              label="Hasło"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              placeholder="min. 6 znaków"
              secure={!passwordVisible}
              error={errors.password}
            />

            <View style={styles.eyeWrapper}>
              <PasswordToggle
                visible={passwordVisible}
                onPress={() => setPasswordVisible((v) => !v)}
              />
            </View>
          </View>

          {/* Powtórz hasło */}
          <View style={{ position: 'relative' }}>
            <Input
              label="Powtórz hasło"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              placeholder="••••••••"
              secure={!confirmVisible}
              error={errors.confirm}
            />

            <View style={styles.eyeWrapper}>
              <PasswordToggle
                visible={confirmVisible}
                onPress={() => setConfirmVisible((v) => !v)}
              />
            </View>
          </View>

          <Button title="Zarejestruj się" onPress={handleRegister} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Masz już konto?{' '}
              <Text style={styles.linkAccent}>Zaloguj się</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
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
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accent,
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
  eyeWrapper: {
    position: 'absolute',
    right: 12,
    top: 30,
  },
  linkRow: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.dim,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: '600',
  },
};
