import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';

import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import Tile from '../components/ui/Tile';
import AdminBanner from '../components/ui/AdminBanner';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
  route: {
    params?: {
      user?: {
        name: string;
        isAdmin: boolean;
      }
    }
  }
}

export default function HomeScreen({ navigation, route } : HomeScreenProps) {
  const user = route.params?.user ?? { name: 'Użytkownik', isAdmin: false };
  const isAdmin = user.isAdmin ?? false;

  // Kafelki tylko dla admina
  const adminTiles = [
    {
      iconName: 'Server',
      label: 'Płytki',
      sub: 'Zarządzaj urządzeniami NFC',
      color: colors.blue,
      onPress: () => navigation.navigate('Devices'),
    },
    {
      iconName: 'Clock',
      label: 'Logi',
      sub: 'Historia otwarć drzwi',
      color: '#FF6B35',
      onPress: () => navigation.navigate('Logs'),
    },
    {
      iconName: 'Settings',
      label: 'Ustawienia',
      sub: 'Konfiguracja aplikacji',
      color: colors.muted,
      disabled: true,
      onPress: () => {},
    },
  ] as const;

  return (
    <View style={layout.screenRoot}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Witaj</Text>
          <Text style={styles.role}>
            Zalogowany jako{' '}
            <Text style={[styles.roleHighlight, isAdmin && styles.roleAdmin]}>
              {isAdmin ? 'Administrator' : user.name}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Icon name="LogOut" size={14} color={colors.muted} />
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>

      {/* Baner admina */}
      {isAdmin && <AdminBanner />}

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        
        {/* Widok admina */}
        {isAdmin && (
          <>
            <Text style={styles.sectionLabel}>Panel administratora</Text>
            {adminTiles.map((tile, i) => (
              <Tile key={i} {...tile} />
            ))}
          </>
        )}

        {/* Widok zwykłego użytkownika */}
        {!isAdmin && (
          <>
            <Text style={styles.sectionLabel}>Moje drzwi</Text>

            {/* Placeholder */}
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                Tutaj pojawią się drzwi, do których masz dostęp.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.3 },
  role: { fontSize: 13, color: colors.dim, marginTop: 2 },
  roleHighlight: { color: colors.accent, fontWeight: '600' },
  roleAdmin: { color: colors.blue },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { fontSize: 12, color: colors.muted, fontWeight: '600' },

  grid: { padding: 24, gap: spacing.lg },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: spacing.sm,
  },

  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.dim,
  },
});
