import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography } from '../styles';
import Tile from '../components/ui/Tile';
import { useAuthStore } from '../stores/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkspaceDetails'>;

export default function WorkspaceDetailsScreen({ route, navigation }: Props) {
  const { workspaceId, workspaceName } = route.params;
  const { user } = useAuthStore();

  const isModeratorHere = (user?.userGroups || []).some(g => g.workspaceId === workspaceId);
  const isAdmin = user?.isAdmin;
  const canManage = isAdmin || isModeratorHere;

  const managementTiles = [
    {
      iconName: 'Server' as const,
      label: 'Płytki',
      sub: 'Zarządzaj urządzeniami NFC',
      color: colors.blue,
      onPress: () => navigation.navigate('Devices', {workspaceId}),
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
      color: '#9B59B6',
      onPress: () => navigation.navigate('Groups', {workspaceId})
    },
    {
      iconName: 'Clock' as const,
      label: 'Logi',
      sub: 'Historia zdarzeń dla przestrzeni',
      color: '#FF6B35',
      onPress: () => {},
    }
  ];

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <Text style={styles.title}>{workspaceName}</Text>
        <Text style={styles.subtitle}>
          {canManage ? 'Panel zarządzania' : 'Dostęp użytkownika'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {/* Zwykły user może tu widzieć swoje przypisane drzwi/płytki do otwarcia "z palca" w aplikacji */}
        {!canManage && (
           <Text style={{ color: colors.white }}>Zwykły użytkownik - tutaj pojawią się Twoje dostępy.</Text>
        )}

        {/* Administracja Workspace */}
        {canManage && (
          <>
            <Text style={typography.sectionLabel}>Konfiguracja przestrzeni</Text>
            {managementTiles.map((tile, i) => (
              <Tile key={i} {...tile} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border, marginTop: 40 },
  title: { ...typography.screenTitle },
  subtitle: { color: colors.dim, marginTop: spacing.xs, fontSize: 13 },
  grid: { padding: spacing.xl, gap: spacing.lg },
});