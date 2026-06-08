import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';
import { useToast } from '../hooks/useToast';
import { getWorkspaceMembers, deleteWorkspaceMember, workspaceMember } from '../api/workspaceApi';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkspaceUsers'>;

export default function WorkspaceUsersScreen({ route, navigation }: Props) {
  const { workspaceId } = route.params;
  const toast = useToast();

  const [members, setMembers] = useState<workspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

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
    Alert.alert("Usuwanie członka", `Czy na pewno chcesz usunąć użytkownika ${userName} z tej przestrzeni? Straci on dostęp do wszystkich przypisanych drzwi.`, [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: async () => {
          try {
            await deleteWorkspaceMember(workspaceId, userId);
            toast.success('Użytkownik został usunięty');
            fetchMembers();
          } catch (e: any) {
            toast.error('Błąd usuwania użytkownika');
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
                <Text style={styles.memberId}>ID: {item.id}</Text>
              </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, paddingTop: 50 },
  backBtn: { padding: 4, marginRight: 12 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.dim, textAlign: 'center', marginTop: 40 },
  
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  meta: { flex: 1 },
  memberName: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  memberEmail: { color: colors.dim, fontSize: 13, marginTop: 2 },
  memberId: { color: colors.faint, fontSize: 10, marginTop: 4 },
  deleteBtn: { padding: 8 },
});