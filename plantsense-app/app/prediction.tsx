import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useWeatherStore } from '../stores/weatherStore';
import type { WeatherForecastDay } from '../types';

// Map weather description to an icon name
function weatherIcon(text: string): string {
  if (text.includes('雷')) return 'weather-lightning-rainy';
  if (text.includes('雪')) return 'weather-snowy';
  if (text.includes('雨')) return 'weather-rainy';
  if (text.includes('阴')) return 'weather-cloudy';
  if (text.includes('多云') || text.includes('晴间')) return 'weather-partly-cloudy';
  if (text.includes('晴')) return 'weather-sunny';
  if (text.includes('雾')) return 'weather-fog';
  return 'weather-partly-cloudy';
}

export default function PredictionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plantName, currentScore } = useLocalSearchParams<{ plantName: string; currentScore: string }>();
  const { cityName, weather } = useWeatherStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const weatherJson = weather ? JSON.stringify(weather) : undefined;
      const resp = await api.getPrediction(plantName || '', Number(currentScore) || 50, cityName, weatherJson);
      setLoading(false);
      if (resp.success && resp.data) {
        setResult(resp.data);
      } else {
        setError(resp.error || '获取预测失败');
      }
    })();
  }, []);

  const scoreColor = (s: number) => s >= 70 ? '#4caf50' : s >= 40 ? '#ffb74d' : '#ef5350';

  const forecast: WeatherForecastDay[] = weather?.forecast ?? [];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>7 天健康预测</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={styles.loadingText}>AI 正在预测健康趋势…</Text>
          </View>
        )}

        {error ? (
          <View style={styles.center}>
            <Text style={{ color: '#ef5350', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}

        {result && !loading && (
          <>
            {/* AI 总结 */}
            <View style={styles.summaryCard}>
              <Text style={styles.plantLabel}>{plantName}</Text>
              <Text style={styles.summaryText}>{result.summary || result.overallTrend || ''}</Text>
            </View>

            {/* 当前天气一行 */}
            {weather && (
              <View style={styles.currentWeatherCard}>
                <MaterialCommunityIcons
                  name={weatherIcon(weather.text) as any}
                  size={20}
                  color="#81d4fa"
                />
                <Text style={styles.currentWeatherText}>
                  {cityName}  {weather.temp}°C {weather.text}
                  {weather.humidity ? `  湿度 ${weather.humidity}%` : ''}
                </Text>
              </View>
            )}

            {/* 7 天天气预报（真实数据） */}
            {forecast.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>未来 7 天天气</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.forecastScroll}
                  contentContainerStyle={styles.forecastRow}
                >
                  {forecast.map((day, i) => (
                    <View key={i} style={styles.forecastDay}>
                      <Text style={styles.forecastDate}>
                        {day.date.slice(5)}
                      </Text>
                      <MaterialCommunityIcons
                        name={weatherIcon(day.textDay) as any}
                        size={22}
                        color="#81d4fa"
                        style={{ marginVertical: 4 }}
                      />
                      <Text style={styles.forecastCondition}>{day.textDay}</Text>
                      <Text style={styles.forecastTemp}>
                        {day.tempMin}~{day.tempMax}°
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            {/* AI 逐日健康预测 */}
            <Text style={styles.sectionLabel}>健康趋势预测</Text>
            {(result.predictions || []).map((day: any, i: number) => {
              const realDay = forecast[i];
              return (
                <View key={i} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayHeaderLeft}>
                      <Text style={styles.dayDate}>{day.date || `第 ${day.day} 天`}</Text>
                      {realDay && (
                        <Text style={styles.dayWeather}>
                          {realDay.textDay}  {realDay.tempMin}~{realDay.tempMax}°C
                        </Text>
                      )}
                    </View>
                    <View style={[styles.dayScore, { borderColor: scoreColor(day.healthScore ?? day.score) }]}>
                      <Text style={[styles.dayScoreNum, { color: scoreColor(day.healthScore ?? day.score) }]}>
                        {day.healthScore ?? day.score}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dayDesc}>{day.description || day.status || ''}</Text>
                  {(day.actions || []).map((a: string, j: number) => (
                    <View key={j} style={styles.actionRow}>
                      <Text style={styles.actionBullet}>•</Text>
                      <Text style={styles.actionText}>{a}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#1a2e1a',
  },
  headerTitle: { color: '#e0e0e0', fontSize: 17, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  center: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: '#4caf50', fontSize: 14, marginTop: 16 },
  summaryCard: { backgroundColor: '#1e3e1e', borderRadius: 12, padding: 16, marginBottom: 12 },
  plantLabel: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  summaryText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  currentWeatherCard: {
    backgroundColor: '#1a2a3a', borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  currentWeatherText: { color: '#81d4fa', fontSize: 13 },
  sectionLabel: {
    color: '#4caf50', fontSize: 12, fontWeight: '600', letterSpacing: 1,
    marginBottom: 10, marginTop: 4,
  },
  forecastScroll: { marginBottom: 16 },
  forecastRow: { gap: 8, paddingBottom: 4 },
  forecastDay: {
    backgroundColor: '#1a2a3a', borderRadius: 10, padding: 10,
    alignItems: 'center', minWidth: 68,
  },
  forecastDate: { color: '#aaa', fontSize: 12, marginBottom: 2 },
  forecastCondition: { color: '#ccc', fontSize: 11, textAlign: 'center', marginBottom: 2 },
  forecastTemp: { color: '#81d4fa', fontSize: 12, fontWeight: '600' },
  dayCard: { backgroundColor: '#1e2e1e', borderRadius: 12, padding: 14, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  dayHeaderLeft: { flex: 1 },
  dayDate: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  dayWeather: { color: '#81d4fa', fontSize: 11, marginTop: 2 },
  dayScore: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  dayScoreNum: { fontSize: 14, fontWeight: 'bold' },
  dayDesc: { color: '#aaa', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  actionBullet: { color: '#4caf50', fontSize: 14 },
  actionText: { color: '#ccc', fontSize: 12, lineHeight: 18, flex: 1 },
});
