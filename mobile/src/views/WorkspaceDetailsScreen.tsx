import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Tile from '../components/ui/Tile';
import Icon from '../components/shared/Icon';
import { useAuthStore } from '../stores/authStore';
import { getWorkspace, WorkspaceDetailsResponse } from '../api/workspaceApi';
import { useToast } from '../hooks/useToast';
import * as Clipboard from '@react-native-clipboard/clipboard';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkspaceDetails'>;

export default function WorkspaceDetailsScreen({ route, navigation }: Props) {
  const { workspaceId, workspaceName } = route.params;
  const { user } = useAuthStore();
  const toast = useToast();

  const [workspace, setWorkspace] = useState<WorkspaceDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

  const isModeratorHere = (user?.userGroups || []).some(g => g.workspaceId === workspaceId);
  const isAdmin = user?.isAdmin === true;
  const canManage = isAdmin || isModeratorHere;

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const data = await getWorkspace(workspaceId);
      setWorkspace(data);
    } catch (e: any) {
      toast.error('Nie udało się pobrać danych przestrzeni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) {
      fetchWorkspace();
    } else {
      setLoading(false);
    }
  }, [workspaceId]);

  const handleCopyCode = () => {
    if (!workspace?.code) return;
    Clipboard.default.setString(workspace.code);
    setCodeCopied(true);
    toast.success('Kod skopiowany do schowka');
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const managementTiles = [
    {
      iconName: 'Server' as const,
      label: 'Płytki',
      sub: 'Zarządzaj urządzeniami NFC',
      color: colors.blue,
      onPress: () => navigation.navigate('Devices', { workspaceId }),
    },
    {
      iconName: 'Users' as const,
      label: 'Użytkownicy',
      sub: 'Zarządzaj użytkownikami w tej przestrzeni',
      color: colors.accent,
      onPress: () => navigation.navigate('WorkspaceUsers', { workspaceId }),
    },
    {
      iconName: 'Layers' as const,
      label: 'Grupy',
      sub: 'Zarządzaj grupami dostępu',
      color: colors.purple,
      onPress: () => navigation.navigate('Groups', { workspaceId }),
    },
    {
      iconName: 'Clock' as const,
      label: 'Logi',
      sub: 'Historia zdarzeń dla przestrzeni',
      color: colors.orange,
      onPress: () => {},
      disabled: true,
    },
  ];

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>{workspaceName}</Text>
          <Text style={styles.subtitle}>
            {canManage ? 'Panel zarządzania' : 'Dostęp użytkownika'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>

          {/* Kod dołączenia — tylko dla admina i moda */}
          {canManage && workspace && (
            <>
              <Text style={styles.sectionLabel}>Kod dołączenia</Text>
              <View style={styles.codeCard}>
                <View style={styles.codeMeta}>
                  <Text style={styles.codeLabel}>Udostępnij ten kod użytkownikom</Text>
                  <Text style={styles.codeValue}>{workspace.code}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyBtn, codeCopied && styles.copyBtnDone]}
                  onPress={handleCopyCode}
                >
                  <Icon
                    name={codeCopied ? 'Check' : 'RefreshCw'}
                    size={16}
                    color={codeCopied ? colors.bg : colors.accent}
                  />
                  <Text style={[styles.copyBtnText, codeCopied && styles.copyBtnTextDone]}>
                    {codeCopied ? 'Skopiowano' : 'Kopiuj'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Widok zwykłego usera */}
          {!canManage && (
            <View style={styles.userCard}>
              <Icon name="LockOpen" size={24} color={colors.accent} />
              <Text style={styles.userCardText}>
                Tutaj pojawią się Twoje przypisane drzwi do otwierania.
              </Text>
            </View>
          )}

          {/* Zarządzanie */}
          {canManage && (
            <>
              <Text style={styles.sectionLabel}>Konfiguracja przestrzeni</Text>
              {managementTiles.map((tile, i) => (
                <Tile key={i} {...tile} />
              ))}
            </>
          )}

        </ScrollView>
      )}
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
  headerMeta: { flex: 1 },
  title: { ...typography.screenTitle },
  subtitle: { color: colors.dim, marginTop: 4, fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { padding: spacing.xl, gap: spacing.lg },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: spacing.sm,
  },

  // Kod dołączenia
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentRing,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  codeMeta: { flex: 1 },
  codeLabel: {
    fontSize: 12,
    color: colors.dim,
    marginBottom: spacing.xs,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentFill,
    borderWidth: 1,
    borderColor: colors.accentRing,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  copyBtnDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  copyBtnTextDone: {
    color: colors.bg,
  },

  // User card
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  userCardText: {
    fontSize: 14,
    color: colors.dim,
    textAlign: 'center',
    lineHeight: 20,
  },
});