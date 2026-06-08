import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import { useToast } from '../hooks/useToast';
import { getGroupDetails, addUserToGroup, deleteUserFromGroup, groupDetails } from '../api/userGroupApi';
import SelectUserModal from '../components/modals/SelectUserModal';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

export default function GroupDetailsScreen({ route, navigation }: Props) {
  const { groupId, workspaceId } = route.params;
  const toast = useToast();

  const [group, setGroup] = useState<groupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

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

  const handleRemoveMember = (userId: string, userName: string) => {
    Alert.alert("Usuwanie członka", `Czy usunąć użytkownika ${userName} z tej grupy?`, [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: async () => {
          try {
            await deleteUserFromGroup(groupId, userId);
            toast.success('Usunięto użytkownika z grupy');
            fetchDetails();
          } catch (e: any) {
            toast.error('Błąd usuwania użytkownika');
          }
      }}
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
      {/* Nagłówek */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
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

      {/* Wykorzystujemy nasz modal z odpiętymi mockami! */}
      <SelectUserModal
        visible={isUserModalVisible}
        onClose={() => setIsUserModalVisible(false)}
        workspaceId={workspaceId}
        existingIds={(group.members || []).map(m => m.id)} // Ukryje ludzi, którzy już są w grupie
        onSelect={(user) => handleAddMember(user.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, paddingTop: 50 },
  backBtn: { padding: 4, marginRight: 12 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  addButton: { backgroundColor: colors.accent, padding: 6, borderRadius: radius.sm },
  sectionLabel: { ...typography.sectionLabel, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 40 },
  
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  meta: { flex: 1 },
  memberName: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  memberEmail: { color: colors.dim, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
});