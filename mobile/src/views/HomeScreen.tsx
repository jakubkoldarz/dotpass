import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Platform, RefreshControl, ActivityIndicator
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors, layout, spacing, typography, radius } from '../styles';

import Icon from '../components/shared/Icon';
import Tile from '../components/ui/Tile';
import AdminBanner from '../components/ui/AdminBanner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { joinWorkspace } from '../api/workspaceApi';
import { useToast } from '../hooks/useToast';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, fetchProfile, logout } = useAuthStore();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinWorkspace = async () => {
    if (!joinCode.trim()) {
      toast.error('Wpisz kod workspace');
      return;
    }
    setJoining(true);
    try {
      await joinWorkspace(joinCode.trim());
      toast.success('Dołączono do workspace!');
      setJoinCode('');
      setShowJoinForm(false);
      await fetchProfile();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Nieprawidłowy kod lub brak dostępu');
    } finally {
      setJoining(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>Brak danych użytkownika.</Text>
      </View>
    );
  }

  const isAdmin = user.isAdmin === true;

  return (
    <View style={layout.screenRoot}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Witaj, {user.firstName}</Text>
          <Text style={styles.role}>
            {isAdmin ? 'Administrator systemu' : 'Użytkownik'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
          <Icon name="LogOut" size={14} color={colors.muted} />
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>

      {/* Baner admina */}
      {isAdmin && <AdminBanner />}

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Sekcja admina */}
        {isAdmin && (
          <>
            <Text style={styles.sectionLabel}>Administracja</Text>
            <Tile
              iconName="Layers"
              label="Workspace'y"
              sub="Zarządzaj wszystkimi przestrzeniami"
              onPress={() => navigation.navigate('AdminWorkspaces')}
              color={colors.purple}
            />
          </>
        )}

        {/* Workspace'y użytkownika */}
        <Text style={styles.sectionLabel}>Twoje workspace'y</Text>

        {/* Przycisk dołączenia do kolejnego workspace (zawsze widoczny dla nie-admina) */}
        {!isAdmin && (
          <TouchableOpacity
            style={styles.joinToggle}
            onPress={() => setShowJoinForm(v => !v)}
          >
            <Icon name="Plus" size={16} color={colors.accent} />
            <Text style={styles.joinToggleText}>Dołącz do workspace</Text>
            <Icon
              name="ChevronDown"
              size={16}
              color={colors.dim}
              style={{ transform: [{ rotate: showJoinForm ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>
        )}

        {/* Formularz dołączania */}
        {!isAdmin && showJoinForm && (
          <View style={styles.joinCard}>
            <Text style={styles.joinLabel}>Wpisz kod zaproszenia</Text>
            <Input
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="np. ABC-123"
              autoCapitalize="characters"
            />
            <Button
              title="Dołącz"
              onPress={handleJoinWorkspace}
              loading={joining}
              disabled={joining}
            />
          </View>
        )}

        {/* Stan zerowy — brak workspace'ów */}
        {!isAdmin && (!user.workspaces || user.workspaces.length === 0) && !showJoinForm && (
          <View style={styles.emptyCard}>
            <Icon name="Layers" size={28} color={colors.dim} />
            <Text style={styles.emptyTitle}>Brak przestrzeni</Text>
            <Text style={styles.emptyText}>
              Nie należysz jeszcze do żadnego workspace. Użyj przycisku powyżej, żeby dołączyć.
            </Text>
          </View>
        )}

        {/* Lista workspace'ów */}
        {user.workspaces && user.workspaces.map((ws) => {
          const isModerator = String(ws.role) === 'Moderator';

          return (
            <TouchableOpacity
              key={ws.id}
              style={[
                styles.workspaceCard,
                isModerator && styles.workspaceModerator,
              ]}
              onPress={() =>
                navigation.navigate('WorkspaceDetails', {
                  workspaceId: ws.id,
                  workspaceName: ws.name,
                })
              }
            >
              <View style={styles.workspaceHeader}>
                <Text style={styles.workspaceName}>{ws.name}</Text>
                {isModerator && (
                  <View style={styles.modBadge}>
                    <Text style={styles.modBadgeText}>MOD</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workspaceSub}>
                {isModerator ? 'Masz uprawnienia moderatora' : 'Użytkownik'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 13,
    color: colors.dim,
    marginTop: 2,
  },
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

  // Dołączanie do workspace
  joinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentRing,
  },
  joinToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  joinCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  joinLabel: {
    fontSize: 13,
    color: colors.dim,
    marginBottom: spacing.xs,
  },

  // Stan pusty
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  emptyText: {
    fontSize: 13,
    color: colors.dim,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Karty workspace
  workspaceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workspaceModerator: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  workspaceSub: {
    fontSize: 12,
    color: colors.dim,
    marginTop: 4,
  },
  modBadge: {
    backgroundColor: colors.accentFill,
    borderWidth: 1,
    borderColor: colors.accentRing,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  modBadgeText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 10,
  },
});