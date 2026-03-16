import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWeatherStore } from '../stores/weatherStore';
import { useAuth } from '../stores/authStore';

export function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { weather, loaded } = useWeatherStore();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* 左：App 图标 + 名称 */}
      <View style={styles.left}>
        <MaterialCommunityIcons name="leaf" size={22} color="#4caf50" />
        <Text style={styles.appName}>植觉</Text>
      </View>

      {/* 中：天气 */}
      <View style={styles.center}>
        {!loaded ? (
          <ActivityIndicator size="small" color="#aaa" />
        ) : weather ? (
          <View style={styles.weatherRow}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="#81d4fa" />
            <Text style={styles.weatherText}>{weather.temp}°C {weather.text}</Text>
          </View>
        ) : (
          <Text style={styles.weatherText}>--</Text>
        )}
      </View>

      {/* 右：头像，点击进入个人页 */}
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        style={styles.avatarBtn}
        activeOpacity={0.7}
      >
        {user?.avatar ? (
          <Text style={styles.avatarEmoji}>👤</Text>
        ) : (
          <MaterialCommunityIcons name="account-circle" size={32} color="#4caf50" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#1a2e1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  appName: {
    color: '#4caf50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
    color: '#ccc',
    fontSize: 13,
  },
  avatarBtn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  avatarEmoji: {
    fontSize: 28,
  },
});
