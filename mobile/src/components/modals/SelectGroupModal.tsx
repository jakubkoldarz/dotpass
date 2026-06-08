import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '../../styles';
import Icon from '../shared/Icon';
import { getGroupsWorkspace, groupInfoShort } from '../../api/userGroupApi';

type SelectGroupModalProps = {
  visible?: boolean;
  onClose: () => void;
  onSelect: (group: groupInfoShort) => void;
  existingIds: string[];
  workspaceId: string;
}

export default function SelectGroupModal({ visible, onClose, onSelect, existingIds, workspaceId }: SelectGroupModalProps) {
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState<groupInfoShort[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && workspaceId) {
      fetchGroups();
    }
  }, [visible, workspaceId]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroupsWorkspace(workspaceId);
      setGroups(data);
    } catch (error) {
      console.warn("Nie udało się pobrać grup przestrzeni", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = groups
    .filter(g => !existingIds.includes(g.id))
    .filter(g => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide">
    <View style={styles.modalRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Dodaj grupę</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <Icon name="Search" size={16} color={colors.dim} />
        <TextInput
          placeholder="Wyszukaj grupę..."
          placeholderTextColor={colors.dim}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.lg }}
          ListEmptyComponent={<Text style={{color: colors.dim, textAlign: 'center'}}>Brak grup do dodania.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <TouchableOpacity style={styles.addBtn} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.addText}>Dodaj</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: { padding: 4 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: spacing.lg, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.white, paddingVertical: spacing.md, marginLeft: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.white },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.accentFill, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.accentRing },
  addText: { color: colors.accent, fontWeight: '700' },
  modalRoot: { flex: 1, backgroundColor: colors.bg },
});