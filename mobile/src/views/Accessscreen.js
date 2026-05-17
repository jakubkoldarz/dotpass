// views/AccessScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { C, R, shared } from '../../theme';
import Icon from '../components/shared/Icon';
import {
  MOCK_USERS,
  MOCK_GROUPS,
  MOCK_DEVICES,
  fetchAccessRules,
} from '../components/shared/Mockdata';

const SW = Dimensions.get('window').width;
const W1 = 112;   
const W3 = 118; 
const W2 = SW - W1 - W3 - 2; 

export default function AccessScreen({ navigation }) {
  const [rules, setRules]         = useState(null);  
  const [selected, setSelected]   = useState(MOCK_DEVICES[0].id);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAccessRules().then(r => { setRules(r); setLoading(false); });
  }, []);

  const currentRule = rules?.[selected] ?? { userIds: [], groupIds: [] };


  const removeUser = useCallback((userId) => {
    setRules(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        userIds: prev[selected].userIds.filter(id => id !== userId),
      },
    }));
  }, [selected]);

  const removeGroup = useCallback((groupId) => {
    setRules(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        groupIds: prev[selected].groupIds.filter(id => id !== groupId),
      },
    }));
  }, [selected]);

  const addUser = useCallback((userId) => {
    setRules(prev => {
      if (prev[selected]?.userIds.includes(userId)) return prev;
      return {
        ...prev,
        [selected]: {
          ...prev[selected],
          userIds: [...(prev[selected]?.userIds ?? []), userId],
        },
      };
    });
  }, [selected]);

  const addGroup = useCallback((groupId) => {
    setRules(prev => {
      if (prev[selected]?.groupIds.includes(groupId)) return prev;
      return {
        ...prev,
        [selected]: {
          ...prev[selected],
          groupIds: [...(prev[selected]?.groupIds ?? []), groupId],
        },
      };
    });
  }, [selected]);


  return (
    <View style={shared.root}>
      {/* Nagłówek */}
      <View style={shared.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={shared.backBtn}>
          <Icon name="ArrowLeft" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={shared.topTitle}>Zarządzanie dostępem</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : (
        <View style={styles.columns}>
          {/* ── Kolumna 1: Drzwi ── */}
          <View style={[styles.col, { width: W1 }]}>
            <ColHeader icon="Lock" label="Drzwi" color={C.accent} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {MOCK_DEVICES.map(device => {
                const active = device.id === selected;
                const count  = (rules?.[device.id]?.userIds.length ?? 0)
                             + (rules?.[device.id]?.groupIds.length ?? 0);
                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[styles.deviceItem, active && styles.deviceItemActive]}
                    onPress={() => setSelected(device.id)}
                    activeOpacity={0.75}
                  >
                    <Icon
                      name={active ? 'LockOpen' : 'Lock'}
                      size={14}
                      color={active ? C.accent : C.faint}
                    />
                    <Text
                      style={[styles.deviceName, active && styles.deviceNameActive]}
                      numberOfLines={2}
                    >
                      {device.name}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.countPip, active && styles.countPipActive]}>
                        <Text style={[styles.countPipText, active && styles.countPipTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* ── Kolumna 2: Aktualny dostęp ── */}
          <View style={[styles.col, { width: W2 }]}>
            <ColHeader icon="ShieldCheck" label="Dostęp" color={C.accent} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>

              {/* Sekcja: użytkownicy */}
              <SectionLabel label="Użytkownicy" />
              {currentRule.userIds.length === 0 ? (
                <EmptySlot label="Brak przypisanych użytkowników" />
              ) : (
                currentRule.userIds.map(uid => {
                  const user = MOCK_USERS.find(u => u.id === uid);
                  if (!user) return null;
                  return (
                    <AccessRow
                      key={`u-${uid}`}
                      icon="User"
                      label={user.name}
                      color={C.accent}
                      onRemove={() => removeUser(uid)}
                    />
                  );
                })
              )}

              {/* Sekcja: grupy */}
              <SectionLabel label="Grupy" style={{ marginTop: 10 }} />
              {currentRule.groupIds.length === 0 ? (
                <EmptySlot label="Brak przypisanych grup" />
              ) : (
                currentRule.groupIds.map(gid => {
                  const group = MOCK_GROUPS.find(g => g.id === gid);
                  if (!group) return null;
                  return (
                    <AccessRow
                      key={`g-${gid}`}
                      icon="Users"
                      label={group.name}
                      color={group.color}
                      onRemove={() => removeGroup(gid)}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* ── Kolumna 3: Dodaj ── */}
          <View style={[styles.col, { width: W3 }]}>
            <ColHeader icon="Plus" label="Dodaj" color={C.blue} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>

              <SectionLabel label="Użytkownicy" />
              {MOCK_USERS.filter(u => !u.isAdmin).map(user => {
                const already = currentRule.userIds.includes(user.id);
                return (
                  <AddRow
                    key={`au-${user.id}`}
                    label={user.name}
                    icon="User"
                    color={C.accent}
                    already={already}
                    onAdd={() => addUser(user.id)}
                  />
                );
              })}

              <SectionLabel label="Grupy" style={{ marginTop: 10 }} />
              {MOCK_GROUPS.map(group => {
                const already = currentRule.groupIds.includes(group.id);
                return (
                  <AddRow
                    key={`ag-${group.id}`}
                    label={group.name}
                    icon="Users"
                    color={group.color}
                    already={already}
                    onAdd={() => addGroup(group.id)}
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Sub-komponenty ─────────────────────────────────────────────────────────────

function ColHeader({ icon, label, color }) {
  return (
    <View style={styles.colHeader}>
      <Icon name={icon} size={13} color={color} />
      <Text style={[styles.colHeaderText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionLabel({ label, style }) {
  return (
    <Text style={[styles.sectionLabel, style]}>{label}</Text>
  );
}

function EmptySlot({ label }) {
  return (
    <View style={styles.emptySlot}>
      <Text style={styles.emptySlotText}>{label}</Text>
    </View>
  );
}

function AccessRow({ icon, label, color, onRemove }) {
  return (
    <View style={styles.accessRow}>
      <Icon name={icon} size={12} color={color} />
      <Text style={styles.accessRowLabel} numberOfLines={1}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <Icon name="Minus" size={12} color={C.error} />
      </TouchableOpacity>
    </View>
  );
}

function AddRow({ icon, label, color, already, onAdd }) {
  return (
    <TouchableOpacity
      style={[styles.addRow, already && styles.addRowDone]}
      onPress={already ? undefined : onAdd}
      activeOpacity={already ? 1 : 0.75}
    >
      <Icon name={icon} size={12} color={already ? C.faint : color} />
      <Text
        style={[styles.addRowLabel, already && styles.addRowLabelDone]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {already
        ? <Icon name="Check" size={12} color={C.faint} />
        : <Icon name="Plus"  size={12} color={C.blue}  />
      }
    </TouchableOpacity>
  );
}

// ── Style ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  columns: {
    flex: 1,
    flexDirection: 'row',
  },
  divider: {
    width: 1,
    backgroundColor: C.borderSoft,
  },
  col: {
    flex: 0,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Nagłówek kolumny
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    marginBottom: 6,
  },
  colHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.ghost,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    marginBottom: 2,
  },

  // Kolumna 1 – urządzenia
  deviceItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  deviceItemActive: {
    backgroundColor: C.accentFill,
    borderRightWidth: 2,
    borderRightColor: C.accent,
  },
  deviceName: {
    fontSize: 11,
    color: C.dim,
    fontWeight: '500',
    lineHeight: 15,
  },
  deviceNameActive: {
    color: C.white,
    fontWeight: '700',
  },
  countPip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: R.xs,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  countPipActive: {
    backgroundColor: C.accentFill,
    borderColor: C.accentRing,
  },
  countPipText: { fontSize: 9, color: C.dim, fontWeight: '700' },
  countPipTextActive: { color: C.accent },

  // Kolumna 2 – dostęp
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  accessRowLabel: {
    flex: 1,
    fontSize: 12,
    color: C.white,
    fontWeight: '500',
  },
  removeBtn: { padding: 2 },

  emptySlot: {
    marginHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.borderSoft,
    borderStyle: 'dashed',
  },
  emptySlotText: { fontSize: 10, color: C.ghost },

  // Kolumna 3 – dodaj
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
    borderRadius: R.xs,
    marginHorizontal: 4,
  },
  addRowDone: { opacity: 0.4 },
  addRowLabel: {
    flex: 1,
    fontSize: 11,
    color: C.white,
    fontWeight: '500',
  },
  addRowLabelDone: { color: C.faint },
});