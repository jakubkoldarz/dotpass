import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';

import DeviceInfoTab from '../components/devices/DeviceInfoTab';
import DeviceAccessTab from '../components/devices/DeviceAccessTab';

import { 
  MOCK_USERS, 
  MOCK_GROUPS, 
  MOCK_GROUP_MEMBERS, 
  INITIAL_ACCESS_RULES 
} from '../components/shared/Mockdata';

import { getDeviceStatus } from '../utils/deviceStatus';

import SelectUserModal from '../components/modals/SelectUserModal';
import SelectGroupModal from '../components/modals/SelectGroupModal';

type ScreenUser = {
  id: string | number;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type ScreenGroup = {
  id: string | number;
  name: string;
  color?: string;
  members: (string | number)[];
};

type DeviceConfigScreenProps = {
  route: {
    params?: {
      device?: {
        id: string | number;
        name: string;
        macaddress: string;
      };
    };
  };
  navigation: {
    goBack: () => void;
  };
};

export default function DeviceConfigScreen({ route, navigation }: DeviceConfigScreenProps) {
  const { device = { id: 0, name: 'Płytka', macaddress: '00:00:00:00:00:00' } } = route.params || {};

  const rules = INITIAL_ACCESS_RULES[device.id as keyof typeof INITIAL_ACCESS_RULES] || { userIds: [], groupIds: [] };
  
  const mockUsersForDevice = (MOCK_USERS || []).filter(u => 
    u && rules.userIds && (rules.userIds as (string | number)[]).includes(u.id)
  ) as ScreenUser[];

  const mockGroupsForDevice = (MOCK_GROUPS || [])
    .map(g => ({
      ...g,
      members: MOCK_GROUP_MEMBERS[g.id as keyof typeof MOCK_GROUP_MEMBERS] || []
    }))
    .filter(g => rules.groupIds && (rules.groupIds as (string | number)[]).includes(g.id)) as ScreenGroup[];

  const [tab, setTab] = useState<'info' | 'access' | 'logs'>('info'); 
  const [userModal, setUserModal] = useState(false);
  const [groupModal, setGroupModal] = useState(false);

  const [users, setUsers] = useState<ScreenUser[]>(mockUsersForDevice);
  const [groups, setGroups] = useState<ScreenGroup[]>(mockGroupsForDevice);

  const handleSelectGroup = (group: any) => {
    if (!group) return;
    
    const safeGroup: ScreenGroup = {
      ...group,
      members: group.members || MOCK_GROUP_MEMBERS[group.id as keyof typeof MOCK_GROUP_MEMBERS] || []
    };
    
    setGroups(prevGroups => [...(prevGroups || []), safeGroup]);
  };

  const handleSelectUser = (user: any) => {
    if (!user) return;
    setUsers(prevUsers => [...(prevUsers || []), user]);
  };

  return (
    <View style={layout.screenRoot}>

      {/* Górny pasek */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} testID="back-button">
          <Icon name="ArrowLeft" size={20} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {device.name || 'Płytka'}
        </Text>

        <View style={{ width: 24 }} /> 
      </View>

      {/* Segmenty */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segment, tab === 'info' && styles.segmentActive]}
          onPress={() => setTab('info')}
        >
          <Text style={[styles.segmentText, tab === 'info' && styles.segmentTextActive]}>
            Informacje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, tab === 'access' && styles.segmentActive]}
          onPress={() => setTab('access')}
        >
          <Text style={[styles.segmentText, tab === 'access' && styles.segmentTextActive]}>
            Dostęp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, tab === 'logs' && styles.segmentActive]}
          onPress={() => setTab('logs')}
        >
          <Text style={[styles.segmentText, tab === 'logs' && styles.segmentTextActive]}>
            Logi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zawartość zakładek */}
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'info' && (
          <DeviceInfoTab
            device={{
              ...device,
              id: String(device.id)
            }}
            onRename={(newName) => console.log('rename', newName)}
            status={getDeviceStatus({ ...device, id: String(device.id) })}
            onNfcWrite={() => console.log('NFC WRITE')}
            onTest={() => console.log('TEST DEVICE')}
          />
        )}

        {tab === 'access' && (
          <>
            <DeviceAccessTab
              device={{
                ...device,
                id: String(device.id)
              }}
              users={users as any} 
              groups={groups as any} 
              onAddUser={() => setUserModal(true)}
              onAddGroup={() => setGroupModal(true)}
              onRemoveUser={(id) => setUsers(prev => (prev || []).filter(u => String(u.id) !== String(id)))}
              onRemoveGroup={(id) => setGroups(prev => (prev || []).filter(g => String(g.id) !== String(id)))}
            />

            <SelectUserModal
              visible={userModal}
              onClose={() => setUserModal(false)}
              existingIds={(users || []).map(u => u.id) as any[]}
              onSelect={handleSelectUser}
            />

            <SelectGroupModal
              visible={groupModal}
              onClose={() => setGroupModal(false)}
              existingIds={(groups || []).map(g => g.id) as any[]}
              onSelect={handleSelectGroup}
            />
          </>
        )}

        {tab === 'logs' && (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Zakładka Logi</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...typography.screenTitle,
    flex: 1,
    fontSize: 22,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  segmentActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  segmentText: {
    fontSize: 13,
    color: colors.dim,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.accent,
  },
  content: {
    padding: spacing.lg,
  },
  placeholderBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.dim,
  },
});