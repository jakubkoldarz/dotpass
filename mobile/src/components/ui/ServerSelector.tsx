import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { useServerStore, ServerInfo } from '../../stores/serverStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

const colors = {
  surfaceAlt: '#1a1a1e',
  border: '#2c2c35',
  accent: '#00adb5',
  text: '#ffffff',
  textMuted: '#8a8a93',
  background: '#121214',
};

export default function ServerSelector() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { servers, activeServer, setActiveServer, removeServer } = useServerStore();
  const { logout } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectServer = async (serverId: string) => {
    await logout(); 
    await setActiveServer(serverId);
    setModalVisible(false);
  };

  const handleAddNewServer = () => {
    setModalVisible(false);
    navigation.navigate('ServerConfig');
  };

  if (!activeServer) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.infoLabel}>Łączysz się z serwerem:</Text>
      <TouchableOpacity 
        style={styles.selectorBadge} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.serverIcon}>🌐</Text>
        <View style={styles.serverInfo}>
          <Text style={styles.serverName}>{activeServer.name}</Text>
          <Text style={styles.serverUrl} numberOfLines={1}>{activeServer.url}</Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz instancję serwera</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Zamknij</Text>
              </TouchableOpacity>
            </View>

            <FlatList
            data={servers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }: { item: ServerInfo }) => {
                const isActive = item.id === activeServer.id;
                return (
                <View style={[styles.serverItem, isActive && styles.serverItemActive]}>
                    <TouchableOpacity
                    style={styles.itemClickableArea}
                    onPress={() => handleSelectServer(item.id)}
                    >
                    <Text style={styles.itemIcon}>🏢</Text>
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemUrl} numberOfLines={1}>{item.url}</Text>
                    </View>
                    {isActive && <Text style={styles.activeCheck}>✓</Text>}
                    </TouchableOpacity>

                    {!isActive && (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => {
                        Alert.alert(
                            'Usuń serwer',
                            `Czy na pewno chcesz usunąć serwer "${item.name}" z pamięci aplikacji?`,
                            [
                            { text: 'Anuluj', style: 'cancel' },
                            { 
                                text: 'Usuń', 
                                style: 'destructive', 
                                onPress: async () => {
                                await removeServer(item.id);
                                if (useServerStore.getState().servers.length === 0) {
                                    setModalVisible(false);
                                    navigation.navigate('ServerConfig');
                                }
                                } 
                            }
                            ]
                        );
                        }}
                    >
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                    )}
                </View>
                );
            }}
            />

            <TouchableOpacity 
              style={styles.addServerBtn}
              onPress={handleAddNewServer}
            >
              <Text style={styles.addServerBtnText}>+ Dodaj nowy serwer</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  selectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serverIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serverUrl: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 12,
    color: colors.accent,
    paddingLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 24,
  },
  serverItem: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  serverItemActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(0, 173, 181, 0.05)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemUrl: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  activeCheck: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addServerBtn: {
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addServerBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
    serverItemStyle: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    },
    serverItemActiveStyle: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(0, 173, 181, 0.05)',
    },
    itemClickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    },
    deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    },
    deleteIcon: {
    fontSize: 18,
    },
});