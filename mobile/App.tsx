import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';

import LoginScreen        from './src/views/LoginScreen';
import RegisterScreen     from './src/views/RegisterScreen';
import HomeScreen         from './src/views/HomeScreen';
import DevicesScreen      from './src/views/DevicesScreen';
import DeviceConfigScreen from './src/views/DeviceConfigScreen';
import NfcWriteScreen     from './src/views/NfcWriteScreen';
import ServerConfigScreen from './src/views/ServerConfigScreen';

import { useServerStore } from './src/stores/serverStore';
import { useAuthStore } from './src/stores/authStore';

import NfcManager, { Ndef } from 'react-native-nfc-manager';

import ToastContainer from './src/components/ui/ToastContainer';
import WorkspaceDetailsScreen from './src/views/WorkspaceDetailsScreen';
import AdminWorkspacesScreen from './src/views/AdminWorkspaceScreen';
import GroupsScreen from './src/views/GroupsScreen';
import GroupDetailsScreen from './src/views/GroupDetailsScreen';
import WorkspaceUsersScreen from './src/views/WorkplaceUsersScreen';
import NfcGlobalListener from './src/hooks/NfcGlobalListener';
import BleConfigScreen from './src/views/BleConfigScreen';

import { openDoor } from './src/api/deviceApi';
import { useToastStore } from './src/stores/toastStore';

export type RootStackParamList = {
  ServerConfig: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  NFC: { deviceId: string };
  Devices: { workspaceId: string };
  Access: undefined;
  Logs: undefined;
  DeviceConfig: { deviceId: string; workspaceId: string };
  NfcWrite: { deviceId: string };
  BleConfig: undefined;
  WorkspaceDetails: { workspaceId: string; workspaceName: string };
  AdminWorkspaces: undefined;
  Groups: { workspaceId: string };
  GroupDetails: { groupId: string; workspaceId: string };
  WorkspaceUsers: { workspaceId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const DOTPASS_SCHEME = 'dotpass://door/';

function extractDeviceIdFromTag(tag: any): string | null {
  try {
    const ndefRecords = tag?.ndefMessage;
    if (!ndefRecords || ndefRecords.length === 0) return null;

    const record = ndefRecords[0];
    let uri: string | null = null;

    if (record.tnf === Ndef.TNF_WELL_KNOWN) {
      uri = Ndef.uri.decodePayload(record.payload);
    } else if (record.tnf === Ndef.TNF_ABSOLUTE_URI) {
      uri = String.fromCharCode(...record.payload);
    }

    if (!uri || !uri.startsWith(DOTPASS_SCHEME)) return null;
    return uri.slice(DOTPASS_SCHEME.length) || null;
  } catch {
    return null;
  }
}

export default function App() {
  const { initServers, activeServer } = useServerStore();
  const { initAuth, user, isLoading: authLoading } = useAuthStore();
  const [isAppReady, setIsAppReady] = useState(false);

  // deviceId z tagu przyłożonego przy zimnym starcie —
  // przetwarzamy po tym jak user będzie zalogowany
  const pendingNfcDeviceId = useRef<string | null>(null);

  useEffect(() => {
    const setupApp = async () => {
      try {
        try {
          await NfcManager.start();
        } catch (ex) {
          console.warn('NFC nie jest wspierane lub wyłączone', ex);
        }

        // getLaunchTagEvent() zwraca tag który odpalił aplikację przez intent,
        // lub null jeśli app uruchomiona normalnie
        try {
          const initialTag = await NfcManager.getLaunchTagEvent();
          if (initialTag) {
            const deviceId = extractDeviceIdFromTag(initialTag);
            if (deviceId) {
              pendingNfcDeviceId.current = deviceId;
            }
          }
        } catch (e) {
          // Brak initial tagu — normalna sytuacja
        }

        await initServers();
        await initAuth();
      } catch (e) {
        console.warn('Błąd podczas inicjalizacji aplikacji', e);
      } finally {
        setIsAppReady(true);
      }
    };

    setupApp();
  }, [initServers, initAuth]);

  // Gdy app gotowa i user zalogowany — obsłuż pending NFC intent
  useEffect(() => {
    if (!isAppReady || authLoading) return;
    if (!pendingNfcDeviceId.current) return;
    if (!user) return; // czekamy na zalogowanie przez refresh token

    const deviceId = pendingNfcDeviceId.current;
    pendingNfcDeviceId.current = null;

    openDoor(deviceId, 3)
      .then(() => {
        useToastStore.getState().show('Drzwi otwarte!', 'success');
      })
      .catch((e: any) => {
        const msg = e.response?.data?.message || 'Brak dostępu lub błąd połączenia';
        useToastStore.getState().show(msg, 'error');
      });
  }, [isAppReady, authLoading, user]);

  if (!isAppReady || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5A0" />
      </View>
    );
  }

  const initialRoute = activeServer ? (user ? 'Home' : 'Login') : 'ServerConfig';

  return (
    <>
      <ToastContainer />
      <NavigationContainer ref={navigationRef}>
        <NfcGlobalListener />
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Devices" component={DevicesScreen} />
          <Stack.Screen name="DeviceConfig" component={DeviceConfigScreen} />
          <Stack.Screen name="NfcWrite" component={NfcWriteScreen} />
          <Stack.Screen name="BleConfig" component={BleConfigScreen} />
          <Stack.Screen name="WorkspaceDetails" component={WorkspaceDetailsScreen} />
          <Stack.Screen name="AdminWorkspaces" component={AdminWorkspacesScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
          <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
          <Stack.Screen name="WorkspaceUsers" component={WorkspaceUsersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});