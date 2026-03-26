import React from 'react';
import { StyleSheet, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BACKGROUNDS: Record<string, any> = {
  home: require('../assets/backgrounds/1.jpg'),
  auth: require('../assets/backgrounds/2.jpg'),
  detail: require('../assets/backgrounds/3.jpg'),
  scan: require('../assets/backgrounds/4.jpg'),
};

const FALLBACK = require('../assets/backgrounds/5.jpg');

function resolveSource(variant: string): any {
  return BACKGROUNDS[variant] ?? FALLBACK;
}

interface Props {
  children: React.ReactNode;
  variant?: 'home' | 'auth' | 'detail' | 'scan';
  simple?: boolean;
}

export function ScreenBackground({ children, variant = 'home', simple = false }: Props) {
  // Android 简化模式：仅使用渐变背景，避免任何图片叠加
  if (Platform.OS === 'android' && simple) {
    return (
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
        style={styles.root}
      >
        {children}
      </LinearGradient>
    );
  }

  // 默认模式：图片背景 + 渐变，其内直接嵌套 children
  return (
    <ImageBackground
      source={resolveSource(variant)}
      style={styles.root}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
        style={styles.overlay}
      >
        {children}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  overlay: {
    flex: 1,
  },
});
