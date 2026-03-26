import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const ICON_MAP: Record<string, string> = {
  index: 'home',
  history: 'clock-outline',
  profile: 'account',
};

const LABEL_MAP: Record<string, string> = {
  index: '首页',
  history: '历史',
  profile: '我的',
};

const ACTIVE_COLOR = '#4CAF50';
const INACTIVE_COLOR = 'rgba(255,255,255,0.5)';

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();

  const handleCameraPress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      let safeUri = result.assets[0].uri;

      if (Platform.OS !== 'web') {
        try {
          const dest = `${FileSystem.cacheDirectory}plant_upload_${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
          safeUri = dest;
          console.log('[pick] copied to safe path:', dest);
        } catch (e: any) {
          console.log('[pick] copy failed, using original:', e?.message);
        }
      }

      let latitude = '';
      let longitude = '';
      try {
        if (Platform.OS !== 'web') {
          const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
          if (locStatus === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            latitude = String(loc.coords.latitude);
            longitude = String(loc.coords.longitude);
          }
        } else if ('geolocation' in navigator) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          latitude = String(pos.coords.latitude);
          longitude = String(pos.coords.longitude);
        }
      } catch (_) {
        // Location unavailable, continue without it
      }
      router.push({
        pathname: '/scan',
        params: { imageUri: safeUri, latitude, longitude },
      });
    }
  }, [router]);

  return (
    <>
      {/* FAB - absolutely positioned, independent of tab bar */}
      <FAB onPress={handleCameraPress} />

      {/* Tab bar */}
      <View style={styles.barWrapper}>
        {Platform.OS === 'web' ? (
          <View style={[styles.bar, styles.webBar]}>
            <TabRow state={state} navigation={navigation} />
          </View>
        ) : (
          <View style={styles.bar}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <TabRow state={state} navigation={navigation} />
          </View>
        )}
      </View>
    </>
  );
}

function TabRow({ state, navigation }: { state: any; navigation: any }) {
  return (
    <View style={styles.tabRow}>
      {state.routes.map((route: any, i: number) => (
        <TabButton
          key={route.key}
          routeName={route.name}
          isFocused={state.index === i}
          onPress={() => {
            if (state.index !== i) navigation.navigate(route.name);
          }}
        />
      ))}
    </View>
  );
}

function TabButton({
  routeName,
  isFocused,
  onPress,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.85); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={styles.tabSlot}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabInner, animStyle]}>
        <MaterialCommunityIcons
          name={(ICON_MAP[routeName] || 'circle') as any}
          size={22}
          color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Animated.Text
          style={[
            styles.tabLabel,
            { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
          ]}
        >
          {LABEL_MAP[routeName] || routeName}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function FAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.fabAnchor} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.88); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.fab, animStyle]}>
          <MaterialCommunityIcons name="camera" size={28} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const BAR_BOTTOM = 16;
const BAR_HEIGHT = 56;
const FAB_SIZE = 64;

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: BAR_BOTTOM,
    left: 20,
    right: 20,
    maxWidth: 420,
    alignSelf: 'center',
    zIndex: 50,
  },
  bar: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  webBar: {
    backgroundColor: 'rgba(15,15,15,0.8)',
    backdropFilter: 'blur(20px)',
  } as any,
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },
  fabAnchor: {
    position: 'absolute',
    bottom: BAR_BOTTOM + BAR_HEIGHT + 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
});
