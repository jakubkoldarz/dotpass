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
import ServerSelector from '../components/ui/ServerSelector';
import { useAuthStore } from '../stores/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation } : Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
 
  const { login, isLoading, error: backendError, clearError} = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      useAuthStore.getState().setAuthError('Wprowadź adres e-mail i hasło.')
      return;
    }

    const sucess = await login({email, password});

    if (sucess) {
      clearError();
      navigation.reset({
        index:0,
        routes: [{name: 'Home'}]
      })
    }
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

        <ServerSelector />

        {/* Formularz */}
        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (backendError) clearError();
            }}
            placeholder="adres@email.com"
            keyboardType="email-address"
            editable={!isLoading}
          />

            <View style={{ position: 'relative' }}>
            <Input
              label="Hasło"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (backendError) clearError();
              }}
              placeholder="••••••••"
              secure={!passwordVisible}
              editable={!isLoading}
            />

            <View style={styles.eyeWrapper}>
              <PasswordToggle
                visible={passwordVisible}
                onPress={() => setPasswordVisible(v => !v)}
              />
            </View>
          </View>

          {/* Błąd */}
          {backendError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{backendError}</Text>
            </View>
          )}

          {/* Przycisk */}
          <Button title="Zaloguj się" onPress={handleLogin} loading={isLoading} disabled={isLoading}/>

          {/* Link do rejestracji */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => {
              clearError();
              navigation.navigate('Register');
            }}
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
