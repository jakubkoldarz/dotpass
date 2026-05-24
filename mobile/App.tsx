import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import LoginScreen     from './src/views/LoginScreen';
import RegisterScreen from './src/views/RegisterScreen';
import HomeScreen      from './src/views/HomeScreen';
import DevicesScreen  from './src/views/DevicesScreen';
import DeviceConfigScreen from './src/views/DeviceConfigScreen';
import NfcWriteScreen from './src/views/NfcWriteScreen';

import NfcManager, { Ndef } from 'react-native-nfc-manager';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  NFC: { deviceId: string }; 
  Devices: undefined;
  Access: undefined;
  Logs: undefined;
  DeviceConfig: undefined;
  NfcWrite: { deviceId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default function App() {

  useEffect(() => {
    const initNfc = async () => {
      try {
        await NfcManager.start();
        
        await NfcManager.registerTagEvent(((tag: any) => {
          try {
            if (tag?.ndefMessage?.[0]?.payload) {
              const text = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
              
              if (text.startsWith('nfcdoor:')) {
                const id = text.replace('nfcdoor:', '');
                
                if (navigationRef.isReady()) {
                  navigationRef.navigate('NFC', { deviceId: id });
                }
              }
            }
          } catch (decodeError) {
            console.warn('Błąd dekodowania tagu:', decodeError);
          }
        }) as any);

      } catch (err) {
        console.log('NFC nie jest gotowe lub brak wsparcia:', err);
      }
    };

    initNfc();

    return () => {
      NfcManager.unregisterTagEvent().catch(() => {});
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#0D0D0D' },
        }}
      >
        <Stack.Screen name="Login"        component={LoginScreen}    />
        <Stack.Screen name="Register"     component={RegisterScreen} />
        <Stack.Screen name="Home"         component={HomeScreen}     />
        <Stack.Screen name="Devices"      component={DevicesScreen}  />
        <Stack.Screen name="DeviceConfig" component={DeviceConfigScreen} />
        <Stack.Screen name="NfcWrite"     component={NfcWriteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}