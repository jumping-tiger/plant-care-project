import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PredictionResult, WeatherForecastDay } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { WeatherCard } from '../components/WeatherCard';
import { api } from '../services/api';
import { getCachedPrediction, setCachedPrediction } from '../stores/predictionCache';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { Colors } from '../theme/colors';

export default function PredictionScreen() {
  const { plantName, healthScore, cityName } = useLocalSearchParams<{
    plantName: string;
    healthScore: string;
    cityName?: string;
  }>();

  const insets = useSafeAreaInsets();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const pn = plantName || '';
    const score = Number(healthScore) || 50;
    const city = cityName || undefined;

    const cached = getCachedPrediction(pn, score, city);
    if (cached) {
      setPrediction(cached);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await api.getPrediction(pn, score, city);
        if (response.success && response.data) {
          setCachedPrediction(pn, score, city, response.data);
          setPrediction(response.data);
        } else {
          setError(response.error || '获取预测失败');
        }
      } catch {
        setError('获取预测失败，请重试');
      } finally {
        setLoading(false);
      }
    })();
  }, [plantName, healthScore, cityName]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return Colors.healthGood;
    if (score >= 40) return Colors.healthWarning;
    return Colors.healthDanger;
  };

  if (loading) {
    return (
      <ScreenBackground variant="detail">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
          <Text style={styles.loadingText}>AI 正在预测未来 7 天的健康趋势...</Text>
          {cityName ? (
            <Text style={styles.loadingSubText}>正在获取 {cityName} 天气数据</Text>
          ) : null}
        </View>
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground variant="detail">
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (!prediction) return null;

  /** 按日期查找对应天气预报 */
  const getForecastByDate = (date: string): WeatherForecastDay | undefined =>
    prediction.weatherInfo?.forecast?.find((f) => f.date === date);

  return (
    <ScreenBackground variant="detail">
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        {/* 植物摘要卡 */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.plantTitle}>{prediction.plantName}</Text>
          <Text style={styles.summaryText}>{prediction.summary}</Text>
        </GlassCard>

        {/* 顶部天气总览卡 */}
        {prediction.weatherInfo?.current?.temp != null && (
          <WeatherCard weather={prediction.weatherInfo} forecastDays={7} />
        )}

        <Text style={styles.sectionTitle}>7 天健康趋势</Text>

        {prediction.predictions.map((day) => {
          const dayWeather = getForecastByDate(day.date);
          return (
            <GlassCard key={day.day} style={styles.dayCard} padding={16}>
              <View style={styles.dayHeader}>
                <View style={styles.dayLeft}>
                  <Text style={styles.dayLabel}>第 {day.day} 天</Text>
                  <Text style={styles.dayDate}>{day.date}</Text>
                </View>

                {/* 当日天气（如果有） */}
                {dayWeather && (
                  <View style={styles.dayWeather}>
                    <MaterialCommunityIcons
                      name="weather-partly-cloudy"
                      size={14}
                      color="#81D4FA"
                    />
                    <Text style={styles.dayWeatherText}>
                      {dayWeather.textDay} {dayWeather.tempMin}~{dayWeather.tempMax}°C
                    </Text>
                  </View>
                )}

                <View style={styles.dayScore}>
                  <HealthBadge status={day.healthStatus} />
                  <Text style={[styles.dayScoreNum, { color: getScoreColor(day.healthScore) }]}>
                    {day.healthScore}分
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.dayDesc}>{day.description}</Text>

              {day.actions.length > 0 && (
                <View style={styles.actionsWrap}>
                  <Text style={styles.actionsLabel}>建议操作：</Text>
                  <View style={styles.actionChips}>
                    {day.actions.map((action, aIdx) => (
                      <Chip
                        key={aIdx}
                        compact
                        style={styles.actionChip}
                        textStyle={styles.actionChipText}
                      >
                        {action}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </GlassCard>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: Colors.textSecondary, fontSize: 14 },
  loadingSubText: { marginTop: 6, color: Colors.textMuted, fontSize: 12 },
  errorText: { color: Colors.error, fontSize: 16 },
  summaryCard: { marginBottom: 16 },
  plantTitle: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  summaryText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  dayCard: { marginBottom: 12 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayLeft: {},
  dayLabel: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  dayDate: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  dayWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(129,212,250,0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dayWeatherText: { color: '#81D4FA', fontSize: 12 },
  dayScore: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayScoreNum: { fontWeight: 'bold', fontSize: 16 },
  divider: { backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },
  dayDesc: { color: Colors.text, fontSize: 14, lineHeight: 22 },
  actionsWrap: { marginTop: 12 },
  actionsLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  actionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionChip: { backgroundColor: 'rgba(76,175,80,0.12)' },
  actionChipText: { fontSize: 12, color: Colors.primaryLight },
});
