// views/LogsScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { C, R, T, shared } from '../../theme';
import Icon from '../components/shared/Icon';
import { MOCK_USERS, MOCK_DEVICES, fetchLogs } from '../components/shared/Mockdata';

export default function LogsScreen({ navigation }) {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterDevice, setFilterDevice] = useState(null);   // null = wszystkie
  const [filterStatus, setFilterStatus] = useState('all');  // 'all' | 'granted' | 'denied'

  useEffect(() => {
    fetchLogs().then(data => { setLogs(data); setLoading(false); });
  }, []);

  // Lookup helpers
  const userById   = id => MOCK_USERS.find(u => u.id === id);
  const deviceById = id => MOCK_DEVICES.find(d => d.id === id);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (filterDevice !== null && l.deviceId !== filterDevice) return false;
      if (filterStatus === 'granted' && !l.granted) return false;
      if (filterStatus === 'denied'  &&  l.granted) return false;
      return true;
    });
  }, [logs, filterDevice, filterStatus]);

  return (
    <View style={shared.root}>
      {/* Nagłówek */}
      <View style={shared.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={shared.backBtn}>
          <Icon name="ArrowLeft" size={22} color={C.accent} />
        </TouchableOpacity>
        <Text style={shared.topTitle}>Logi dostępu</Text>
        {!loading && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{filtered.length}</Text>
          </View>
        )}
      </View>

      {/* Filtry */}
      <View style={styles.filtersWrap}>
        {/* Filtr: status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[
            { key: 'all',     label: 'Wszystkie' },
            { key: 'granted', label: 'Otwarto'   },
            { key: 'denied',  label: 'Odmowa'    },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filterStatus === f.key && styles.chipActive]}
              onPress={() => setFilterStatus(f.key)}
            >
              <Text style={[styles.chipText, filterStatus === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.chipDivider} />

          {/* Filtr: urządzenie */}
          <TouchableOpacity
            style={[styles.chip, filterDevice === null && styles.chipActive]}
            onPress={() => setFilterDevice(null)}
          >
            <Text style={[styles.chipText, filterDevice === null && styles.chipTextActive]}>
              Wszystkie drzwi
            </Text>
          </TouchableOpacity>
          {MOCK_DEVICES.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.chip, filterDevice === d.id && styles.chipActive]}
              onPress={() => setFilterDevice(d.id)}
            >
              <Text style={[styles.chipText, filterDevice === d.id && styles.chipTextActive]}>
                {d.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="Search" size={28} color={C.faint} />
              <Text style={styles.emptyText}>Brak wyników dla wybranych filtrów</Text>
            </View>
          }
          renderItem={({ item }) => {
            const user   = userById(item.userId);
            const device = deviceById(item.deviceId);
            return (
              <LogEntry
                log={item}
                userName={user?.name   ?? `ID ${item.userId}`}
                deviceName={device?.name ?? `ID ${item.deviceId}`}
              />
            );
          }}
        />
      )}
    </View>
  );
}

// ── Wpis logu ──────────────────────────────────────────────────────────────────

function LogEntry({ log, userName, deviceName }) {
  const date = new Date(log.timestamp);
  const time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const day  = date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' });

  return (
    <View style={[styles.entry, log.granted ? styles.entryGranted : styles.entryDenied]}>
      {/* Status ikona */}
      <View style={[styles.statusIcon, { backgroundColor: log.granted ? C.accentFill : '#1A0606' }]}>
        <Icon
          name={log.granted ? 'LockOpen' : 'Lock'}
          size={16}
          color={log.granted ? C.accent : C.error}
        />
      </View>

      {/* Treść */}
      <View style={styles.entryBody}>
        <View style={styles.entryTop}>
          <Text style={styles.entryUser}>{userName}</Text>
          <View style={[styles.statusBadge, log.granted ? styles.badgeGranted : styles.badgeDenied]}>
            <Text style={[styles.statusText, { color: log.granted ? C.accent : C.error }]}>
              {log.granted ? 'Otwarto' : 'Odmowa'}
            </Text>
          </View>
        </View>
        <View style={styles.entryMeta}>
          <Icon name="Lock" size={10} color={C.faint} />
          <Text style={styles.entryDevice}>{deviceName}</Text>
        </View>
      </View>

      {/* Czas */}
      <View style={styles.timeCol}>
        <Text style={styles.timeMain}>{time}</Text>
        <Text style={styles.timeDate}>{day}</Text>
      </View>
    </View>
  );
}

// ── Style ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Filtry
  filtersWrap: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    paddingVertical: 10,
  },
  filterRow: { paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: C.accentFill,
    borderColor: C.accentRing,
  },
  chipText: { fontSize: 12, color: C.dim, fontWeight: '600' },
  chipTextActive: { color: C.accent },
  chipDivider: {
    width: 1,
    backgroundColor: C.border,
    marginRight: 6,
    marginVertical: 2,
  },

  // Lista
  list: { padding: 16 },

  // Wpis
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  entryGranted: { borderLeftWidth: 3, borderLeftColor: C.accent },
  entryDenied:  { borderLeftWidth: 3, borderLeftColor: C.error  },

  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  entryBody: { flex: 1, gap: 4 },
  entryTop:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryUser: { fontSize: 14, fontWeight: '700', color: C.white, flex: 1 },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryDevice: { fontSize: 11, color: C.faint },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: R.xs,
    borderWidth: 1,
  },
  badgeGranted: { backgroundColor: C.accentFill, borderColor: C.accentRing },
  badgeDenied:  { backgroundColor: '#1A0606',    borderColor: '#FF444440'  },
  statusText:   { fontSize: 10, fontWeight: '700' },

  timeCol:  { alignItems: 'flex-end', gap: 2 },
  timeMain: { fontSize: 13, fontWeight: '700', color: C.white,  fontVariant: ['tabular-nums'] },
  timeDate: { fontSize: 10, color: C.faint },

  // Pusty stan
  totalBadge: {
    backgroundColor: C.accentFill,
    borderWidth: 1,
    borderColor: C.accentRing,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.xs,
  },
  totalText: { fontSize: 12, fontWeight: '700', color: C.accent },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: C.dim },
});