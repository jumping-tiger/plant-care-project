import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useWeatherStore } from '../stores/weatherStore';

export default function PredictionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plantName, currentScore } = useLocalSearchParams<{ plantName: string; currentScore: string }>();
  const { cityName } = useWeatherStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resp = await api.getPrediction(plantName || '', Number(currentScore) || 50, cityName);
      setLoading(false);
      if (resp.success && resp.data) {
        setResult(resp.data);
      } else {
        setError(resp.error || '获取预测失败');
      }
    })();
  }, []);

  const scoreColor = (s: number) => s >= 70 ? '#4caf50' : s >= 40 ? '#ffb74d' : '#ef5350';

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
            <View style={styles.summaryCard}>
              <Text style={styles.plantLabel}>{plantName}</Text>
              <Text style={styles.summaryText}>{result.summary || result.overallTrend || ''}</Text>
            </View>

            {result.weatherInfo?.current && (
              <View style={styles.weatherCard}>
                <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color="#81d4fa" />
                <Text style={styles.weatherText}>
                  {result.weatherInfo.current.temp}°C  {result.weatherInfo.current.text}
                </Text>
              </View>
            )}

            {(result.predictions || []).map((day: any, i: number) => (
              <View key={i} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayDate}>{day.date || `第 ${day.day} 天`}</Text>
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
            ))}
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
  weatherCard: {
    backgroundColor: '#1a2a3a', borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  weatherText: { color: '#81d4fa', fontSize: 13 },
  dayCard: { backgroundColor: '#1e2e1e', borderRadius: 12, padding: 14, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayDate: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  dayScore: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dayScoreNum: { fontSize: 14, fontWeight: 'bold' },
  dayDesc: { color: '#aaa', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  actionBullet: { color: '#4caf50', fontSize: 14 },
  actionText: { color: '#ccc', fontSize: 12, lineHeight: 18, flex: 1 },
});
