import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '../../components/shared/Icon';
import { colors } from '../../styles';

export default function PasswordToggle({ visible, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
      <Icon
        name={visible ? 'EyeOff' : 'Eye'}
        size={18}
        color={colors.faint}
      />
    </TouchableOpacity>
  );
}
