import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { Colors } from '../theme/colors';
import type { WeatherInfo } from '../types';

interface Props {
  weather: WeatherInfo;
  /** 最多显示几天预报，默认 3 */
  forecastDays?: number;
}

export function WeatherCard({ weather, forecastDays = 3 }: Props) {
  const cur = weather.current;
  const forecast = weather.forecast?.slice(0, forecastDays) || [];

  return (
    <GlassCard>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="weather-sunny" size={20} color="#FFD54F" />
        <Text style={styles.sectionTitle}>当地气候</Text>
        {weather.city ? (
          <Text style={styles.city}>{weather.city}</Text>
        ) : null}
      </View>

      <View style={styles.nowRow}>
        <Text style={styles.temp}>{cur.temp}°C</Text>
        <View style={styles.nowRight}>
          <Text style={styles.weatherText}>{cur.text}</Text>
          <Text style={styles.detail}>
            体感 {cur.feelsLike}°C · 湿度 {cur.humidity}%
          </Text>
          <Text style={styles.detail}>
            {cur.windDir} {cur.windScale}级
          </Text>
        </View>
      </View>

      {forecast.length > 0 && (
        <View style={styles.forecastRow}>
          {forecast.map((d) => (
            <View key={d.date} style={styles.forecastDay}>
              <Text style={styles.forecastDate}>{d.date.slice(5)}</Text>
              <Text style={styles.forecastText}>{d.textDay}</Text>
              <Text style={styles.forecastTemp}>
                {d.tempMin}~{d.tempMax}°C
              </Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  city: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 'auto',
  },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  temp: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFD54F',
  },
  nowRight: { flex: 1 },
  weatherText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 10,
  },
  forecastDay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  forecastDate: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  forecastText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  forecastTemp: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
