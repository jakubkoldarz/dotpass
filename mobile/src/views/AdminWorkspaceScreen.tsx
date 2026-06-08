import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, Modal, TextInput 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getWorkspaces, createWorkspace, WorkspaceResponse } from '../api/workspaceApi';
import { colors, layout, spacing, typography } from '../styles';
import  Icon  from '../components/shared/Icon'

type Props = NativeStackScreenProps<RootStackParamList, 'AdminWorkspaces'>;

export default function AdminWorkspacesScreen({ navigation }: Props) {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać przestrzeni.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    try {
      await createWorkspace(newWsName); 
      setNewWsName('');
      setModalVisible(false);
      fetchWorkspaces();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się utworzyć przestrzeni.');
    }
  };

  const renderItem = ({ item }: { item: WorkspaceResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('WorkspaceDetails', { 
        workspaceId: item.id, 
        workspaceName: item.name 
      })}
    >
      <View>
        <Text style={styles.wsName}>{item.name}</Text>
        <Text style={styles.wsId}>ID: {item.id}</Text>
      </View>
      <Icon name="ChevronRight" color={colors.dim} />
    </TouchableOpacity>
  );

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <Text style={typography.screenTitle}>Wszystkie Workspace</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nowy</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={workspaces}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchWorkspaces();
            }} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak przestrzeni w systemie. Utwórz pierwszą!</Text>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nowa przestrzeń</Text>
            <TextInput 
              style={styles.input}
              placeholder="Nazwa workspace..."
              placeholderTextColor={colors.dim}
              value={newWsName}
              onChangeText={setNewWsName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={{ color: colors.white }}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateWorkspace} style={styles.btnConfirm}>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Stwórz</Text>
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.xl, 
    marginTop: 40 
  },
  addButton: { backgroundColor: colors.blue, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: colors.white, fontWeight: 'bold' },
  card: { 
    backgroundColor: colors.card, 
    padding: spacing.lg, 
    borderRadius: 12, 
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  wsName: { color: colors.white, fontSize: 16, fontWeight: '600' },
  wsId: { color: colors.dim, fontSize: 12, marginTop: 4 },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: colors.card, borderRadius: 20, padding: 25, borderWidth: 1, borderColor: colors.border },
  modalTitle: { ...typography.sectionLabel, marginBottom: 15 },
  input: { backgroundColor: colors.bg, color: colors.white, padding: 15, borderRadius: 10, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  btnCancel: { padding: 10 },
  btnConfirm: { backgroundColor: colors.blue, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});