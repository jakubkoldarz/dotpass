import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../styles';
import Icon from '../shared/Icon';

type IconProps = React.ComponentProps<typeof Icon>;

type TileProps = {
  iconName: IconProps['name'];
  label: string;
  sub: string;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}

export default function Tile({ iconName, label, sub, color, disabled, onPress }: TileProps) {
  return (
    <TouchableOpacity
      style={[styles.tile, disabled && styles.disabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <View style={[
        styles.iconBox,
        { borderColor: color + '40', backgroundColor: color + '15' }
      ]}>
        <Icon name={iconName} size={22} color={color} />
      </View>

      <View style={styles.meta}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>

      {disabled ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Wkrótce</Text>
        </View>
      ) : (
        <Icon name="ChevronRight" size={18} color={color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.5 },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  meta: { flex: 1 },
  label: { fontSize: 15, fontWeight: '700', color: colors.white },
  labelDisabled: { color: colors.dim },
  sub: { fontSize: 12, color: colors.dim, marginTop: 2 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: '#1E1E1E',
  },
  badgeText: { fontSize: 10, color: colors.dim, fontWeight: '600' },
});
