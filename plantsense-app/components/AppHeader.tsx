import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, FlatList, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeatherStore, PRESET_CITIES, type CityOption } from '../stores/weatherStore';
import { useAuth } from '../stores/authStore';

export function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { weather, cityName, loaded, setCity } = useWeatherStore();
  const { user } = useAuth();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSelectCity = async (city: CityOption) => {
    setPickerVisible(false);
    await setCity(city);
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* 左：App 图标 + 名称 */}
        <View style={styles.left}>
          <MaterialCommunityIcons name="leaf" size={22} color="#a8e6a8" />
          <Text style={styles.appName}>植觉</Text>
        </View>

        {/* 中：天气（可点击切换城市） */}
        <TouchableOpacity
          style={styles.center}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          {!loaded ? (
            <ActivityIndicator size="small" color="#c8f0c8" />
          ) : weather ? (
            <View style={styles.weatherRow}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="#81d4fa" />
              <Text style={styles.weatherText}>
                {cityName}  {weather.temp}°C {weather.text}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color="#aacfaa" />
            </View>
          ) : (
            <View style={styles.weatherRow}>
              <Text style={styles.weatherText}>{cityName || '--'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color="#aacfaa" />
            </View>
          )}
        </TouchableOpacity>

        {/* 右：头像，点击进入个人页 */}
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.avatarBtn}
          activeOpacity={0.7}
        >
          {user?.avatar ? (
            <Text style={styles.avatarEmoji}>👤</Text>
          ) : (
            <MaterialCommunityIcons name="account-circle" size={32} color="#a8e6a8" />
          )}
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(58,158,58,0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 1.5 }}
      />

      {/* 城市选择弹窗 */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>选择城市</Text>
            <FlatList
              data={PRESET_CITIES}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityRow,
                    cityName === item.name && styles.cityRowActive,
                  ]}
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cityName,
                    cityName === item.name && styles.cityNameActive,
                  ]}>
                    {item.name}
                  </Text>
                  {cityName === item.name && (
                    <MaterialCommunityIcons name="check" size={18} color="#52c654" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#2d6a2d',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  appName: {
    color: '#d4f5d4',
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
    color: '#d4f5d4',
    fontSize: 13,
  },
  avatarBtn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: 260,
    maxHeight: 440,
    paddingTop: 20,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  pickerTitle: {
    color: '#1a2e1a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58,158,58,0.12)',
  },
  cityRowActive: {
    backgroundColor: 'rgba(58,158,58,0.15)',
  },
  cityName: {
    color: '#3a5a3a',
    fontSize: 15,
  },
  cityNameActive: {
    color: '#3a9e3a',
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#5a7a5a',
    fontSize: 15,
  },
});
