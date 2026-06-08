import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import { useToast } from '../hooks/useToast';
import { getGroupsWorkspace, createGroupsWorkspace, deleteGroup, groupInfoShort } from '../api/userGroupApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;

export default function GroupsScreen({ route, navigation }: Props) {
  const { workspaceId } = route.params;
  const toast = useToast();

  const [groups, setGroups] = useState<groupInfoShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroupsWorkspace(workspaceId);
      setGroups(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Nie udało się pobrać grup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [workspaceId]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroupsWorkspace(workspaceId, newGroupName);
      toast.success('Grupa została utworzona');
      setNewGroupName('');
      setIsModalVisible(false);
      fetchGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Błąd tworzenia grupy');
    }
  };

  const handleDeleteGroup = (id: string, name: string) => {
    Alert.alert("Usuwanie grupy", `Czy na pewno chcesz usunąć grupę "${name}"?`, [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: async () => {
          try {
            await deleteGroup(id);
            toast.success('Usunięto grupę');
            fetchGroups();
          } catch (e: any) {
            toast.error('Nie udało się usunąć grupy');
          }
      }}
    ]);
  };

  return (
    <View style={layout.screenRoot}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Grupy użytkowników</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
          <Icon name="Plus" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchGroups}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak utworzonych grup w tej przestrzeni.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, workspaceId })}
            >
              <View style={styles.iconBox}>
                <Icon name="Layers" size={20} color="#9B59B6" />
              </View>
              <View style={styles.meta}>
                <Text style={styles.groupName}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteGroup(item.id, item.name)} style={styles.deleteBtn}>
                <Icon name="Trash2" size={20} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal tworzenia grupy */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nowa Grupa</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nazwa grupy (np. IT, Magazyn)..." 
              placeholderTextColor={colors.dim}
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{color: colors.white}}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGroup}>
                <Text style={{color: colors.accent, fontWeight: 'bold'}}>Utwórz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, paddingTop: 50 },
  backBtn: { padding: 4, marginRight: 12 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  addButton: { backgroundColor: colors.accent, padding: 6, borderRadius: radius.sm },
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 40 },
  
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: '#9B59B615', borderWidth: 1, borderColor: '#9B59B640', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  meta: { flex: 1 },
  groupName: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { padding: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, width: '85%', padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: spacing.lg },
  input: { backgroundColor: colors.bg, color: colors.white, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 }
});