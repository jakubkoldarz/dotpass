import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '../shared/Icon';
import { colors } from '../../styles';

type PasswordToggleProps = {
  visible: boolean;
  onPress: () => void;
}

export default function PasswordToggle({ visible, onPress }: PasswordToggleProps) {
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
