import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Alert, Modal
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import { useToast } from '../hooks/useToast';
import {
  getWorkspaceMembers,
  deleteWorkspaceMember,
  updateWorkspaceMember,
  workspaceMember,
} from '../api/workspaceApi';
import { userRole } from '../stores/authStore';
import { useAuthStore } from '../stores/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkspaceUsers'>;

export default function WorkspaceUsersScreen({ route, navigation }: Props) {
  const { workspaceId } = route.params;
  const toast = useToast();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.isAdmin === true;

  const [members, setMembers] = useState<workspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal zmiany roli
  const [roleModal, setRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<workspaceMember | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (e: any) {
      toast.error('Nie udało się pobrać listy użytkowników.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const handleRemoveMember = (userId: string, userName: string) => {
    Alert.alert(
      'Usuwanie członka',
      `Czy na pewno chcesz usunąć użytkownika ${userName} z tej przestrzeni? Straci on dostęp do wszystkich przypisanych drzwi.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkspaceMember(workspaceId, userId);
              toast.success('Użytkownik został usunięty');
              fetchMembers();
            } catch (e: any) {
              toast.error('Błąd usuwania użytkownika');
            }
          },
        },
      ]
    );
  };

  const openRoleModal = (member: workspaceMember) => {
    setSelectedMember(member);
    setRoleModal(true);
  };

  const handleSetRole = async (role: userRole) => {
    if (!selectedMember) return;
    setSavingRole(true);
    try {
      await updateWorkspaceMember(workspaceId, {
        userId: selectedMember.id,
        role,
      });
      toast.success(
        role === userRole.moderator
          ? `${selectedMember.firstname} jest teraz moderatorem`
          : `${selectedMember.firstname} jest teraz zwykłym użytkownikiem`
      );
      setRoleModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (e: any) {
      toast.error('Błąd zmiany roli');
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Użytkownicy przestrzeni</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchMembers}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak użytkowników w tej przestrzeni.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Icon name="User" size={20} color={colors.accent} />
              </View>

              <View style={styles.meta}>
                <Text style={styles.memberName}>{item.firstname} {item.lastname}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
              </View>

              {/* Przycisk zmiany roli — tylko admin */}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.roleBtn}
                  onPress={() => openRoleModal(item)}
                >
                  <Icon name="ShieldCheck" size={16} color={colors.blue} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleRemoveMember(item.id, `${item.firstname} ${item.lastname}`)}
                style={styles.deleteBtn}
              >
                <Icon name="UserMinus" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal zmiany roli */}
      <Modal visible={roleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Zmień rolę
            </Text>
            {selectedMember && (
              <Text style={styles.modalSubtitle}>
                {selectedMember.firstname} {selectedMember.lastname}
              </Text>
            )}

            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => handleSetRole(userRole.moderator)}
              disabled={savingRole}
            >
              <View style={styles.roleOptionIcon}>
                <Icon name="ShieldCheck" size={20} color={colors.blue} />
              </View>
              <View style={styles.roleOptionMeta}>
                <Text style={styles.roleOptionLabel}>Moderator</Text>
                <Text style={styles.roleOptionSub}>
                  Może zarządzać płytkami i użytkownikami w tej przestrzeni
                </Text>
              </View>
              {savingRole ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : (
                <Icon name="ChevronRight" size={16} color={colors.dim} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => handleSetRole(userRole.user)}
              disabled={savingRole}
            >
              <View style={[styles.roleOptionIcon, styles.roleOptionIconUser]}>
                <Icon name="User" size={20} color={colors.accent} />
              </View>
              <View style={styles.roleOptionMeta}>
                <Text style={styles.roleOptionLabel}>Użytkownik</Text>
                <Text style={styles.roleOptionSub}>
                  Może otwierać przypisane mu drzwi
                </Text>
              </View>
              {savingRole ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Icon name="ChevronRight" size={16} color={colors.dim} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setRoleModal(false); setSelectedMember(null); }}
              disabled={savingRole}
            >
              <Text style={styles.cancelBtnText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingTop: 50,
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 40 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  meta: { flex: 1 },
  memberName: { color: colors.white, fontSize: 15, fontWeight: '700' },
  memberEmail: { color: colors.dim, fontSize: 12, marginTop: 2 },
  roleBtn: {
    padding: 8,
    marginRight: 4,
  },
  deleteBtn: { padding: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.dim,
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  roleOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.blueFill,
    borderWidth: 1,
    borderColor: colors.blueRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionIconUser: {
    backgroundColor: colors.accentFill,
    borderColor: colors.accentRing,
  },
  roleOptionMeta: { flex: 1 },
  roleOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  roleOptionSub: {
    fontSize: 12,
    color: colors.dim,
    marginTop: 2,
    lineHeight: 17,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelBtnText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
  },
});