import React, { useEffect, useState } from 'react';
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
import { useAuthStore } from './src/stores/authStore'

import NfcManager from 'react-native-nfc-manager';

import ToastContainer from './src/components/ui/ToastContainer';
import WorkspaceDetailsScreen from './src/views/WorkspaceDetailsScreen';
import AdminWorkspacesScreen from './src/views/AdminWorkspaceScreen';
import GroupsScreen from './src/views/GroupsScreen';
import GroupDetailsScreen from './src/views/GroupDetailsScreen';
import WorkspaceUsersScreen from './src/views/WorkplaceUsersScreen';
import NfcGlobalListener from './src/hooks/NfcGlobalListener';

export type RootStackParamList = {
  ServerConfig: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  NFC: { deviceId: string }; 
  Devices: {workspaceId: string};
  Access: undefined;
  Logs: undefined;
  DeviceConfig: {deviceId: string; workspaceId: string};
  NfcWrite: { deviceId: string };
  WorkspaceDetails: { workspaceId: string; workspaceName: string };
  AdminWorkspaces: undefined;
  Groups: {workspaceId: string};
  GroupDetails: {groupId: string; workspaceId: string;}
  WorkspaceUsers: {workspaceId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default function App() {
  const { initServers, activeServer } = useServerStore();
  const { initAuth, user, isLoading: authLoading } = useAuthStore();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initNfc = async () => {
      try {
        await NfcManager.start();
      } catch (ex) {
        console.warn('NFC nie jest wspierane lub wyłączone', ex);
      }
    };

    const setupApp = async () => {
      try {
        await initNfc();
        await initServers();
        await initAuth();
      } catch (e) {
        console.warn('Błąd podczas inicjalizacji aplikacji', e);
      } finally {
        setIsAppReady(true);
      };
    };

    setupApp();
  }, [initServers, initAuth]);

  if (!isAppReady || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00adb5" />
      </View>
    );
  }

  const initialRoute = activeServer ? (user ? 'Home' : 'Login') : 'ServerConfig';

  return (
    <>
    <ToastContainer />
    <NavigationContainer ref={navigationRef}>
      <NfcGlobalListener />
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Devices" component={DevicesScreen} />
        <Stack.Screen name="DeviceConfig" component={DeviceConfigScreen} />
        <Stack.Screen name="NfcWrite" component={NfcWriteScreen} />
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
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
});