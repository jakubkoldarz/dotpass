import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../styles';
import AccessRow from './AccessRow';
import Button from '../ui/Button';

export default function DeviceAccessTab({
  device,
  users = [], 
  groups = [], 
  onAddUser,
  onAddGroup,
  onRemoveUser,
  onRemoveGroup,
}) {
    
  return (
    <View style={styles.container}>

      {/* Użytkownicy */}
      <Text style={styles.sectionLabel}>Użytkownicy</Text>

      <Button
        title="Dodaj użytkownika"
        variant="admin"
        onPress={onAddUser}
        style={{ marginBottom: spacing.md }}
      />

      {users.length === 0 && (
        <Text style={styles.empty}>Brak przypisanych użytkowników.</Text>
      )}

      {users.map((u) => (
        <AccessRow
          key={u.id}
          label={u.name}
          sub={u.email}
          onRemove={() => onRemoveUser(u.id)}
        />
      ))}

      {/* Grupy */}
      <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Grupy</Text>

      <Button
        title="Dodaj grupę"
        variant="admin"
        onPress={onAddGroup}
        style={{ marginBottom: spacing.md }}
      />

      {groups.length === 0 && (
        <Text style={styles.empty}>Brak przypisanych grup.</Text>
      )}

      {groups.map((g) => (
        <AccessRow
          key={g.id}
          label={g.name}
          sub={`${g.members?.length || 0} członków`}
          onRemove={() => onRemoveGroup(g.id)}
        />
      ))}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: 13,
    color: colors.dim,
    marginBottom: spacing.md,
  },
});