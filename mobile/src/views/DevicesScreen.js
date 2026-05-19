import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

import { colors, layout, spacing, typography } from '../styles';
import DeviceRow from '../components/devices/DeviceRow';
import { fetchDevices, INITIAL_ACCESS_RULES } from '../components/shared/Mockdata';

import { getDeviceStatus } from '../utils/deviceStatus';


export default function DevicesScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchDevices();
        if (!cancelled) setDevices(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const getStatus = (device) => {
    const rule = INITIAL_ACCESS_RULES[device.id];

    if (!rule) return 'warning';
    if (!device.name) return 'warning';
    if (rule.userIds.length === 0 && rule.groupIds.length === 0) return 'warning';

    return 'ok';
  };

  return (
    <View style={layout.screenRoot}>
      <View style={styles.header}>
        <Text style={styles.title}>Płytki</Text>
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
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Brak zarejestrowanych urządzeń.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DeviceRow
              device={item}
              status={getDeviceStatus(item)}
              onPress={() => navigation.navigate('DeviceConfig', { device: item })}
            />
          )}
        />
      )}
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
  },
  title: {
    ...typography.screenTitle,
    flex: 1,
    fontSize: 20,
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

  list: { padding: spacing.lg },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  loadingText: { fontSize: 14, color: colors.dim },
  emptyText: { fontSize: 14, color: colors.dim },

  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.error,
    margin: spacing.lg,
  },
  errorText: { fontSize: 13, color: colors.error },
});
