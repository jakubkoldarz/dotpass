import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Alert, Modal, TextInput
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import { useToast } from '../hooks/useToast';
import {
  getGroupDetails,
  addUserToGroup,
  deleteUserFromGroup,
  updateGroupDetails,
  groupDetails,
} from '../api/userGroupApi';
import SelectUserModal from '../components/modals/SelectUserModal';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

export default function GroupDetailsScreen({ route, navigation }: Props) {
  const { groupId, workspaceId } = route.params;
  const toast = useToast();

  const [group, setGroup] = useState<groupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // Edycja nazwy
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getGroupDetails(groupId);
      setGroup(data);
    } catch (e: any) {
      toast.error('Nie udało się pobrać szczegółów grupy.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [groupId]);

  const openEditModal = () => {
    setEditName(group?.name || '');
    setEditModal(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateGroupDetails(groupId, editName.trim());
      toast.success('Nazwa grupy została zmieniona');
      setEditModal(false);
      fetchDetails();
    } catch (e: any) {
      toast.error('Nie udało się zmienić nazwy grupy');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    Alert.alert('Usuwanie członka', `Czy usunąć użytkownika ${userName} z tej grupy?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserFromGroup(groupId, userId);
            toast.success('Usunięto użytkownika z grupy');
            fetchDetails();
          } catch (e: any) {
            toast.error('Błąd usuwania użytkownika');
          }
        },
      },
    ]);
  };

  const handleAddMember = async (userId: string) => {
    try {
      await addUserToGroup(groupId, userId);
      toast.success('Dodano użytkownika do grupy!');
      fetchDetails();
    } catch (e: any) {
      toast.error('Błąd dodawania użytkownika');
    }
  };

  if (loading || !group) {
    return (
      <View style={[layout.screenRoot, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{group.name}</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.editBtn}>
          <Icon name="ScanLine" size={18} color={colors.dim} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsUserModalVisible(true)} style={styles.addButton}>
          <Icon name="Plus" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Członkowie grupy</Text>

      <FlatList
        data={group.members}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchDetails}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak użytkowników w tej grupie.</Text>
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
            <TouchableOpacity
              onPress={() => handleRemoveMember(item.id, `${item.firstname} ${item.lastname}`)}
              style={styles.deleteBtn}
            >
              <Icon name="X" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <SelectUserModal
        visible={isUserModalVisible}
        onClose={() => setIsUserModalVisible(false)}
        workspaceId={workspaceId}
        existingIds={(group.members || []).map(m => m.id)}
        onSelect={(user) => handleAddMember(user.id)}
      />

      {/* Modal edycji nazwy */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zmień nazwę grupy</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nowa nazwa grupy..."
              placeholderTextColor={colors.dim}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModal(false)}
                disabled={saving}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                disabled={saving || !editName.trim()}
                style={[styles.saveBtn, (!editName.trim() || saving) && styles.saveBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                  <Text style={styles.saveText}>Zapisz</Text>
                )}
              </TouchableOpacity>
            </View>
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
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  editBtn: {
    padding: 6,
  },
  addButton: {
    backgroundColor: colors.accent,
    padding: 6,
    borderRadius: radius.sm,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
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
  deleteBtn: { padding: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  input: {
    backgroundColor: colors.bg,
    color: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelBtn: { padding: spacing.md },
  cancelText: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
});