import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useToastStore } from '../../stores/toastStore';
import { colors, radius, spacing } from '../../styles';

export default function ToastContainer() {
  const { visible, message, type, hide } = useToastStore();

  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => hide());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bg =
    type === 'error'
      ? colors.error
      : type === 'success'
      ? colors.accent
      : colors.surfaceAlt;

  return (
    <Animated.View style={[styles.toast, { opacity, backgroundColor: bg }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: spacing.md,
    borderRadius: radius.md,
    zIndex: 999,
  },
  text: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// import { useToastStore } from '../stores/toastStore'

// useToastStore.getState().show(
//  error.response?.data?.message || "Wystąpił błąd",
// "error"