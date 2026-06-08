import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
  accessGrantDeviceGroup
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

  // Pobieranie szczegółów urządzenia z backendu
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

  // --- AKCJE Z ZAKŁADKI INFO ---

  const handleRename = async (newName: string) => {
    if (!device) return;
    try {
      await updateDevice(deviceId, { name: newName, isPublicInWorkspace: device.isPublicInWorkspace || false });
      toast.success('Zmieniono nazwę urządzenia');
      fetchDeviceData(); // Odśwież widok
    } catch (e: any) {
      toast.error('Nie udało się zmienić nazwy');
    }
  };

  const handleTestDoor = async () => {
    try {
      await openDoor(deviceId, 5); // Otwiera drzwi na 5 sekund
      toast.success('Wysłano sygnał otwarcia drzwi!');
    } catch (e: any) {
      toast.error('Błąd otwierania drzwi');
    }
  };

  // --- AKCJE Z ZAKŁADKI DOSTĘP ---

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

  // Formatowanie danych pod komponenty UI
  const mappedUsers = (device.userAccesses || []).map(u => ({
    id: u.id,
    name: `${u.firstname} ${u.lastname}`,
    email: u.email
  }));

  const mappedGroups = (device.groupAccesses || []).map(g => ({
    id: g.id,
    name: g.name,
    members: [] // Backend tu nie zwraca liczby członków (i dobrze, mniejszy payload)
  }));

  // Status: jeśli urządzenie nie ma nazwy, jest żółty (warning). Inaczej 'ok'.
  const deviceStatus = device.name ? 'ok' : 'warning';

  return (
    <View style={layout.screenRoot}>
      {/* Górny pasek */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{device.name || 'Nowa Płytka'}</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {/* Segmenty */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity style={[styles.segment, tab === 'info' && styles.segmentActive]} onPress={() => setTab('info')}>
          <Text style={[styles.segmentText, tab === 'info' && styles.segmentTextActive]}>Informacje</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segment, tab === 'access' && styles.segmentActive]} onPress={() => setTab('access')}>
          <Text style={[styles.segmentText, tab === 'access' && styles.segmentTextActive]}>Dostęp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segment, tab === 'logs' && styles.segmentActive]} onPress={() => setTab('logs')}>
          <Text style={[styles.segmentText, tab === 'logs' && styles.segmentTextActive]}>Logi</Text>
        </TouchableOpacity>
      </View>

      {/* Zawartość zakładek */}
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'info' && (
          <DeviceInfoTab
            device={{
              id: device.id,
              name: device.name || '',
              macaddress: device.macAddress || 'Brak MAC',
            }}
            onRename={handleRename}
            status={deviceStatus}
            onNfcWrite={() => navigation.navigate('NfcWrite', { deviceId: device.id })}
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

            {/* Te modale za chwilę też podepniemy pod API */}
            <SelectUserModal
  visible={userModal}
  onClose={() => setUserModal(false)}
  existingIds={mappedUsers.map(u => u.id) as string[]}
  workspaceId={workspaceId} // PRZEKAZANIE ID
  onSelect={async (user) => { 
    try {
      await accessGrantDevice(deviceId, user.id);
      toast.success('Przyznano dostęp użytkownikowi!');
      fetchDeviceData(); // Odświeża główny widok płytki
    } catch (e: any) {
      toast.error('Błąd podczas przyznawania dostępu');
    }
  }}
/>

<SelectGroupModal
  visible={groupModal}
  onClose={() => setGroupModal(false)}
  existingIds={mappedGroups.map(g => g.id) as string[]}
  workspaceId={workspaceId} // PRZEKAZANIE ID
  onSelect={async (group) => { 
    try {
      await accessGrantDeviceGroup(deviceId, group.id);
      toast.success('Przyznano dostęp grupie!');
      fetchDeviceData(); // Odświeża główny widok płytki
    } catch (e: any) {
      toast.error('Błąd podczas przyznawania dostępu grupie');
    }
  }}
/>
          </>
        )}

        {tab === 'logs' && (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Logi otwarć drzwi wkrótce.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.dim, marginTop: spacing.md },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: { padding: 4 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 22 },
  segmentContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  segment: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  segmentActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  segmentText: { fontSize: 13, color: colors.dim, fontWeight: '600' },
  segmentTextActive: { color: colors.accent },
  content: { padding: spacing.lg },
  placeholderBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  placeholderText: { fontSize: 14, color: colors.dim },
});