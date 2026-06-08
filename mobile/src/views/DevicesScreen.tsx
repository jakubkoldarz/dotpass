import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, layout, spacing, typography } from '../styles';
import DeviceRow from '../components/devices/DeviceRow';
import Icon from '../components/shared/Icon';
import { getWorkspaceDevices, deviceInfoShort } from '../api/deviceApi'; 
import { useToast } from '../hooks/useToast';

type Props = NativeStackScreenProps<RootStackParamList, 'Devices'>;

export default function DevicesScreen({ route, navigation } : Props) {
  const { workspaceId } = route.params;
  const [devices, setDevices] = useState<deviceInfoShort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

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
        <Text style={styles.title}>Urządzenia (Płytki)</Text>
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{devices.length}</Text>
          </View>
        )}
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
              <Text style={styles.emptyText}>Brak zarejestrowanych urządzeń w tej przestrzeni.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DeviceRow
              device={{...item, macaddress: item.macAddress || 'Brak MAC'}} 
              status={getStatus(item)}
              onPress={() => navigation.navigate('DeviceConfig', {deviceId: item.id, workspaceId})} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, paddingTop: 50 },
  title: { ...typography.screenTitle, flex: 1, fontSize: 20 },
  countBadge: { backgroundColor: colors.accentFill, borderWidth: 1, borderColor: colors.accentRing, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  countText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
  loadingText: { fontSize: 14, color: colors.dim },
  emptyText: { fontSize: 14, color: colors.dim },
  errorBox: { backgroundColor: colors.errorBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.error, margin: spacing.lg },
  errorText: { fontSize: 13, color: colors.error },
});