import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Platform,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  padding = 20,
}: Props) {
  // Android: BlurView 在 Bridgeless 新架构下会吞噬触摸事件，
  // 改用纯半透明背景，保证 100% 点击灵敏度
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.card, styles.androidFallback, { padding }, style]}>
        {children}
      </View>
    );
  }

  // Web: CSS backdropFilter 方案
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.card, styles.webFallback, { padding }, style]}>
        {children}
      </View>
    );
  }

  // iOS: absoluteFill BlurView 作为底层，内容 View 同级放在上层
  return (
    <View style={[styles.card, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={intensity}
        tint="dark"
      />
      <View style={[styles.inner, { padding }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  androidFallback: {
    backgroundColor: 'rgba(20,20,20,0.72)',
  },
  webFallback: {
    backgroundColor: 'rgba(25,25,25,0.75)',
    backdropFilter: 'blur(20px)',
  } as any,
  inner: {
    // 确保内容层在 BlurView 之上，无需 zIndex（同级 View 后者自然覆盖前者）
  },
});
