import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, Modal, TextInput 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getWorkspaces, createWorkspace, WorkspaceResponse } from '../api/workspaceApi';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';

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
      <View style={styles.cardIcon}>
        <Icon name="Layers" size={18} color={colors.purple} />
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.wsName}>{item.name}</Text>
        <Text style={styles.wsId}>ID: {item.id}</Text>
      </View>
      <Icon name="ChevronRight" color={colors.dim} size={18} />
    </TouchableOpacity>
  );

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <View>
          <Text style={typography.screenTitle}>Workspace'y</Text>
          <Text style={styles.subtitle}>Wszystkie przestrzenie w systemie</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Icon name="Plus" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 50 }} />
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
            }} tintColor={colors.accent} />
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
                <Text style={{ color: colors.muted }}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateWorkspace} style={styles.btnConfirm}>
                <Text style={{ color: colors.bg, fontWeight: 'bold' }}>Stwórz</Text>
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
    alignItems: 'flex-start',
    padding: spacing.xl, 
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  subtitle: {
    fontSize: 13,
    color: colors.dim,
    marginTop: 4,
  },
  addButton: { 
    backgroundColor: colors.blue,
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  card: { 
    backgroundColor: colors.surface,
    padding: spacing.lg, 
    borderRadius: radius.lg, 
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.purpleFill,
    borderWidth: 1,
    borderColor: colors.purpleRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: { flex: 1 },
  wsName: { color: colors.white, fontSize: 15, fontWeight: '600' },
  wsId: { color: colors.faint, fontSize: 11, marginTop: 3 },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 },
  modalContent: { 
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  input: { 
    backgroundColor: colors.bg,
    color: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg },
  btnCancel: { padding: spacing.md },
  btnConfirm: { 
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
});