import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import Icon from '../components/shared/Icon';

import DeviceInfoTab from '../components/devices/DeviceInfoTab';
import DeviceAccessTab from '../components/devices/DeviceAccessTab';

import SelectUserModal from '../components/modals/SelectUserModal';
import SelectGroupModal from '../components/modals/SelectGroupModal';

import {
  getDeviceDetails,
  deviceResponse,
  updateDevice,
  accessDenyDevice,
  accessDenyDeviceGroup,
  openDoor,
  accessGrantDevice,
  accessGrantDeviceGroup,
} from '../api/deviceApi';
import { useToast } from '../hooks/useToast';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceConfig'>;

export default function DeviceConfigScreen({ route, navigation }: Props) {
  const { deviceId, workspaceId } = route.params;
  const toast = useToast();

  const [device, setDevice] = useState<deviceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<'info' | 'access' | 'logs'>('info');
  const [userModal, setUserModal] = useState(false);
  const [groupModal, setGroupModal] = useState(false);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      const data = await getDeviceDetails(deviceId);
      setDevice(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Nie udało się pobrać konfiguracji urządzenia.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [deviceId]);

  // Jeden handler do wszystkich aktualizacji — merguje patch z aktualnym stanem
  const handleUpdate = async (patch: { name?: string; isPublicInWorkspace?: boolean }) => {
    if (!device) return;
    try {
      await updateDevice(deviceId, {
        name: patch.name ?? device.name ?? '',
        isPublicInWorkspace: patch.isPublicInWorkspace ?? device.isPublicInWorkspace ?? false,
      });
      toast.success('Zapisano zmiany');
      fetchDeviceData();
    } catch (e: any) {
      toast.error('Nie udało się zapisać zmian');
    }
  };

  const handleTestDoor = async () => {
    try {
      await openDoor(deviceId, 5);
      toast.success('Wysłano sygnał otwarcia drzwi!');
    } catch (e: any) {
      toast.error('Błąd otwierania drzwi');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await accessDenyDevice(deviceId, userId);
      toast.success('Odebrano dostęp użytkownikowi');
      fetchDeviceData();
    } catch (e) {
      toast.error('Błąd usuwania dostępu');
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    try {
      await accessDenyDeviceGroup(deviceId, groupId);
      toast.success('Odebrano dostęp grupie');
      fetchDeviceData();
    } catch (e) {
      toast.error('Błąd usuwania dostępu dla grupy');
    }
  };

  if (loading || !device) {
    return (
      <View style={[layout.screenRoot, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Pobieranie konfiguracji...</Text>
      </View>
    );
  }

  const mappedUsers = (device.userAccesses || []).map(u => ({
    id: u.id,
    name: `${u.firstname} ${u.lastname}`,
    email: u.email,
  }));

  const mappedGroups = (device.groupAccesses || []).map(g => ({
    id: g.id,
    name: g.name,
    members: [],
  }));

  const deviceStatus = device.name ? 'ok' : 'warning';

  return (
    <View style={layout.screenRoot}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>{device.name || 'Nowa płytka'}</Text>
          {device.isPublicInWorkspace && (
            <View style={styles.publicBadge}>
              <Icon name="LockOpen" size={10} color={colors.accent} />
              <Text style={styles.publicBadgeText}>Publiczna</Text>
            </View>
          )}
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.segmentContainer}>
        {(['info', 'access', 'logs'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segment, tab === t && styles.segmentActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === 'info' ? 'Informacje' : t === 'access' ? 'Dostęp' : 'Logi'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'info' && (
          <DeviceInfoTab
            device={{
              id: device.id,
              name: device.name || '',
              macaddress: device.macAddress || 'Brak MAC',
              isPublicInWorkspace: device.isPublicInWorkspace ?? false,
            }}
            onUpdate={handleUpdate}
            onNfcWrite={() => navigation.navigate('NfcWrite', { deviceId: device.id })}
            status={deviceStatus}
            onTest={handleTestDoor}
          />
        )}

        {tab === 'access' && (
          <>
            <DeviceAccessTab
              device={{ id: device.id }}
              users={mappedUsers}
              groups={mappedGroups}
              onAddUser={() => setUserModal(true)}
              onAddGroup={() => setGroupModal(true)}
              onRemoveUser={handleRemoveUser}
              onRemoveGroup={handleRemoveGroup}
            />

            <SelectUserModal
              visible={userModal}
              onClose={() => setUserModal(false)}
              existingIds={mappedUsers.map(u => u.id)}
              workspaceId={workspaceId}
              onSelect={async (user) => {
                try {
                  await accessGrantDevice(deviceId, user.id);
                  toast.success('Przyznano dostęp użytkownikowi!');
                  fetchDeviceData();
                } catch (e: any) {
                  toast.error('Błąd podczas przyznawania dostępu');
                }
              }}
            />

            <SelectGroupModal
              visible={groupModal}
              onClose={() => setGroupModal(false)}
              existingIds={mappedGroups.map(g => g.id)}
              workspaceId={workspaceId}
              onSelect={async (group) => {
                try {
                  await accessGrantDeviceGroup(deviceId, group.id);
                  toast.success('Przyznano dostęp grupie!');
                  fetchDeviceData();
                } catch (e: any) {
                  toast.error('Błąd podczas przyznawania dostępu grupie');
                }
              }}
            />
          </>
        )}

        {tab === 'logs' && (
          <View style={styles.placeholderBox}>
            <Icon name="Clock" size={28} color={colors.dim} />
            <Text style={styles.placeholderText}>Logi otwarć drzwi — wkrótce.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.dim },
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
  backBtn: { padding: 4 },
  headerMeta: {
    flex: 1,
    gap: 4,
  },
  title: { ...typography.screenTitle, fontSize: 22 },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentFill,
    borderWidth: 1,
    borderColor: colors.accentRing,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  publicBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segment: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  segmentActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  segmentText: { fontSize: 13, color: colors.dim, fontWeight: '600' },
  segmentTextActive: { color: colors.accent },
  content: { padding: spacing.lg },
  placeholderBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderText: { fontSize: 14, color: colors.dim },
});