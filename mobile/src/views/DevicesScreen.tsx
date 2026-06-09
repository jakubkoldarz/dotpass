import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Modal, Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography, radius } from '../styles';
import DeviceRow from '../components/devices/DeviceRow';
import Icon from '../components/shared/Icon';
import { getWorkspaceDevices, getAllDevices, assignDevice, deviceInfoShort } from '../api/deviceApi';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../stores/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Devices'>;

export default function DevicesScreen({ route, navigation }: Props) {
  const { workspaceId } = route.params;
  const [devices, setDevices] = useState<deviceInfoShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal przypisywania płytki
  const [assignModal, setAssignModal] = useState(false);
  const [unassigned, setUnassigned] = useState<deviceInfoShort[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin === true;

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaceDevices(workspaceId);
      setDevices(data);
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Nie udało się pobrać listy urządzeń';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [workspaceId]);

  const openAssignModal = async () => {
    setAssignModal(true);
    setAssignLoading(true);
    try {
      const all = await getAllDevices();
      // Pokaż tylko te, które nie są jeszcze przypisane do ŻADNEGO workspace
      const free = all.filter(d => !d.workspaceId);
      setUnassigned(free);
    } catch (e: any) {
      toast.error('Nie udało się pobrać listy płytek');
      setAssignModal(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (deviceId: string) => {
    setAssigning(deviceId);
    try {
      await assignDevice(workspaceId, deviceId);
      toast.success('Płytka została przypisana do przestrzeni!');
      setAssignModal(false);
      fetchDevices();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Błąd przypisywania płytki');
    } finally {
      setAssigning(null);
    }
  };

  const getStatus = (device: deviceInfoShort) => {
    if (!device.name) return 'warning';
    return 'ok';
  };

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
          <Icon name="ArrowLeft" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Płytki</Text>
        <View style={styles.headerRight}>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{devices.length}</Text>
            </View>
          )}
          {isAdmin && (
            <TouchableOpacity onPress={() => navigation.navigate('BleConfig')} style={styles.bleBtn}>
              <Icon name="Nfc" size={18} color={colors.accent} />
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity onPress={openAssignModal} style={styles.addBtn}>
              <Icon name="Plus" size={18} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Pobieranie urządzeń…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Błąd: {error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={devices}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshing={loading}
          onRefresh={fetchDevices}
          ListEmptyComponent={
            <View style={styles.center}>
              <View style={styles.emptyIcon}>
                <Icon name="Cpu" size={28} color={colors.dim} />
              </View>
              <Text style={styles.emptyTitle}>Brak płytek w tej przestrzeni</Text>
              <Text style={styles.emptyText}>
                {isAdmin
                  ? 'Naciśnij + aby przypisać istniejącą płytkę lub skonfiguruj nową przez BLE.'
                  : 'Administrator nie przypisał jeszcze żadnych urządzeń.'}
              </Text>
              {isAdmin && (
                <TouchableOpacity style={styles.emptyBtn} onPress={openAssignModal}>
                  <Icon name="Plus" size={16} color={colors.bg} />
                  <Text style={styles.emptyBtnText}>Przypisz płytkę</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <DeviceRow
              device={{ ...item, macaddress: item.macAddress || 'Brak MAC' }}
              status={getStatus(item)}
              onPress={() => navigation.navigate('DeviceConfig', { deviceId: item.id, workspaceId })}
            />
          )}
        />
      )}

      {/* Modal przypisywania płytki */}
      <Modal visible={assignModal} animationType="slide">
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAssignModal(false)} style={styles.backBtn}>
              <Icon name="ArrowLeft" size={20} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Przypisz płytkę</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.modalSubtitle}>
            Poniżej znajdują się płytki zarejestrowane w systemie, które nie są jeszcze przypisane do żadnej przestrzeni.
          </Text>

          {assignLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Ładowanie płytek…</Text>
            </View>
          ) : (
            <FlatList
              data={unassigned}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: spacing.lg }}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyText}>
                    Brak wolnych płytek. Wszystkie są już przypisane do jakiegoś workspace'a lub żadna nie jest jeszcze zarejestrowana w systemie.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.assignRow}>
                  <View style={styles.assignIcon}>
                    <Icon name="Cpu" size={18} color={colors.blue} />
                  </View>
                  <View style={styles.assignMeta}>
                    <Text style={styles.assignName}>{item.name || 'Niezidentyfikowana płytka'}</Text>
                    <Text style={styles.assignMac}>{item.macAddress || 'Brak MAC'}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.assignBtn, assigning === item.id && styles.assignBtnLoading]}
                    onPress={() => handleAssign(item.id)}
                    disabled={assigning !== null}
                  >
                    {assigning === item.id ? (
                      <ActivityIndicator size="small" color={colors.bg} />
                    ) : (
                      <Text style={styles.assignBtnText}>Przypisz</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingTop: 50,
  },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.accentFill,
    borderWidth: 1,
    borderColor: colors.accentRing,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  bleBtn: {
    backgroundColor: colors.accentFill,
    borderWidth: 1,
    borderColor: colors.accentRing,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: colors.blue,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  loadingText: { fontSize: 14, color: colors.dim },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.white, textAlign: 'center' },
  emptyText: { fontSize: 13, color: colors.dim, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  emptyBtnText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.error,
    margin: spacing.lg,
  },
  errorText: { fontSize: 13, color: colors.error },

  // Modal
  modalRoot: { flex: 1, backgroundColor: colors.bg },
  modalHeader: {
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
  modalTitle: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  modalSubtitle: {
    fontSize: 13,
    color: colors.dim,
    margin: spacing.lg,
    lineHeight: 20,
  },
  assignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  assignIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.blueFill,
    borderWidth: 1,
    borderColor: colors.blueRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignMeta: { flex: 1 },
  assignName: { fontSize: 15, fontWeight: '700', color: colors.white },
  assignMac: { fontSize: 11, color: colors.dim, marginTop: 2, fontFamily: 'monospace' },
  assignBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    minWidth: 72,
    alignItems: 'center',
  },
  assignBtnLoading: {
    opacity: 0.7,
  },
  assignBtnText: { color: colors.bg, fontWeight: '700', fontSize: 13 },
});