import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '../../styles';
import Icon from '../shared/Icon';
import { getWorkspaceMembers, workspaceMember } from '../../api/workspaceApi';

type SelectUserModalProps = {
  visible?: boolean;
  onClose: () => void;
  onSelect: (user: workspaceMember) => void;
  existingIds: string[];
  workspaceId: string; // Dodajemy to, aby wiedzieć, skąd pobrać ludzi
}

export default function SelectUserModal({ visible, onClose, onSelect, existingIds, workspaceId } : SelectUserModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<workspaceMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && workspaceId) {
      fetchUsers();
    }
  }, [visible, workspaceId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getWorkspaceMembers(workspaceId);
      setUsers(data);
    } catch (error) {
      console.warn("Nie udało się pobrać użytkowników przestrzeni", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users
    .filter(u => !existingIds.includes(u.id))
    .filter(u =>
      u.firstname.toLowerCase().includes(query.toLowerCase()) ||
      u.lastname.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <Modal visible={visible} animationType="slide">
    <View style={styles.modalRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Dodaj użytkownika</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <Icon name="Search" size={16} color={colors.dim} />
        <TextInput
          placeholder="Wyszukaj użytkownika..."
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
          ListEmptyComponent={<Text style={{color: colors.dim, textAlign: 'center'}}>Brak użytkowników do dodania.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.name}>{item.firstname} {item.lastname}</Text>
                <Text style={styles.email}>{item.email}</Text>
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
  email: { fontSize: 12, color: colors.dim, marginTop: 2 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.accentFill, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.accentRing },
  addText: { color: colors.accent, fontWeight: '700' },
  modalRoot: { flex: 1, backgroundColor: colors.bg },
});