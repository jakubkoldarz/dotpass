import React, {useState, useCallback} from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, RefreshControl } from 'react-native';
import { useAuthStore, userRole } from '../stores/authStore';
import { colors, layout, spacing, typography, radius } from '../styles';

import Icon from '../components/shared/Icon';
import Tile from '../components/ui/Tile';
import AdminBanner from '../components/ui/AdminBanner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation } : Props) {
  const { user, fetchProfile, logout } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // FIX THIS
  const handleJoinWorkspace = (()=>{});
  const handleWorkspace = (()=>navigation.navigate('AdminWorkspaces'));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{color: colors.error}}>Brak danych użytkownika.</Text>
      </View>
    )
  }

  const isAdmin = user.isAdmin === true;

  const moderatedWorkspaces = (user?.workspaces || []).filter((w) => String(w.role) === 'Moderator');

  const isUser = !isAdmin;

  return (
    <View style={layout.screenRoot}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Witaj</Text>
          <Text style={styles.role}>
            Zalogowany jako {user.firstName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={ async () => {
            await logout();
            navigation.reset({
              index:0,
              routes: [{name: 'Login'}]
            })
          }
          }
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


          <>
  <Text style={styles.sectionLabel}>Twoje workspace'y</Text>
    
    if (user.isAdmin) {
      <Tile iconName='Layers' label='Workspacey' sub='Zarządzaj przestrzeniami' onPress={handleWorkspace} color='#9B59B6'/>
    }

    {/* Zimny start — user nie należy do żadnego workspace */}
    {!user.isAdmin && user.workspaces && user.workspaces.length === 0 && (
      <View style={styles.joinCard}>
        <Text style={styles.joinText}>Nie należysz do żadnego workspace.</Text>

        <Input
          label="Kod workspace"
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Wpisz kod"
        />

        <Button title="Dołącz" onPress={handleJoinWorkspace} />
      </View>
    )}

    {/* Lista workspace’ów */}
    {user.workspaces && user.workspaces.map((ws) => {
      const isModeratorHere = (user.userGroups || []).some(g => g.workspaceId === ws.id);

      return (
        <TouchableOpacity
          key={ws.id}
          style={[
            styles.workspaceCard,
            isModeratorHere && styles.workspaceModerator
          ]}
          onPress={() => 
            navigation.navigate('WorkspaceDetails', { workspaceId: ws.id, workspaceName: ws.name })
          }
        >
          <View style={styles.workspaceHeader}>
            <Text style={styles.workspaceName}>{ws.name}</Text>

            {!isAdmin && isModeratorHere && (
              <View style={styles.modBadge}>
                <Text style={styles.modBadgeText}>MOD</Text>
              </View>
            )}
          </View>

          <Text style={styles.workspaceSub}>
            {isModeratorHere ? 'Masz uprawnienia moderatora' : 'Użytkownik'}
          </Text>
        </TouchableOpacity>
      );
    })}
  </>



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
  workspaceCard: {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: spacing.md,
},

workspaceModerator: {
  borderLeftWidth: 4,
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
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: radius.sm,
},

modBadgeText: {
  color: colors.accent,
  fontWeight: '700',
  fontSize: 10,
},

joinCard: {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: spacing.lg,
},
joinText: {
  color: colors.white,
  marginBottom: spacing.md,
},
});
