import React from 'react';
import { View, Text } from 'react-native';
import { INITIAL_ACCESS_RULES } from '../Mockdata';

export default function NfcHandlerScreen({ route }) {
  const { deviceId } = route.params;
  const user = global.loggedUser; 

  const rules = INITIAL_ACCESS_RULES[deviceId];
  const allowed =
    rules?.userIds.includes(user.id) ||
    rules?.groupIds.some(gid => MOCK_GROUP_MEMBERS[gid]?.includes(user.id));

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: allowed ? '#0f0' : '#f00'
    }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000' }}>
        {allowed ? 'DOSTĘP PRZYZNANY' : 'ODMOWA'}
      </Text>
    </View>
  );
}
