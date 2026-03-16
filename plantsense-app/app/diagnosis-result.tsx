import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDiagnosisStore } from '../stores/diagnosisStore';

export default function DiagnosisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useDiagnosisStore();
  const record = records.find(r => r.id === id);

  if (!record) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#888' }}>记录不存在</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#4caf50' }}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const result = record.analysisResult;
  const scoreColor = record.healthScore >= 70 ? '#4caf50' : record.healthScore >= 40 ? '#ffb74d' : '#ef5350';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>诊断结果</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: record.imageUri }} style={styles.image} resizeMode="cover" />

        <View style={styles.scoreRow}>
          <Text style={styles.plantName}>{result.plantName}</Text>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{record.healthScore}</Text>
            <Text style={styles.scoreLabel}>分</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#888" />
          <Text style={styles.statusText}>{result.status}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>诊断摘要</Text>
          <Text style={styles.cardContent}>{result.summary}</Text>
        </View>

        {result.weatherInfo && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>当前天气</Text>
            <Text style={styles.cardContent}>
              🌡 {result.weatherInfo.temp}°C  {result.weatherInfo.text}
              {result.weatherInfo.humidity ? `  💧 湿度 ${result.weatherInfo.humidity}%` : ''}
            </Text>
          </View>
        )}

        {result.careAdvice && result.careAdvice.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>养护建议</Text>
            {result.careAdvice.map((advice, i) => (
              <View key={i} style={styles.adviceRow}>
                <View style={[styles.priorityDot, {
                  backgroundColor: advice.priority === 'high' ? '#ef5350' : advice.priority === 'medium' ? '#ffb74d' : '#4caf50',
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.adviceTitle}>{advice.title}</Text>
                  <Text style={styles.adviceDesc}>{advice.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {result.climateAdvice && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>气候建议</Text>
            <Text style={styles.cardContent}>{result.climateAdvice}</Text>
          </View>
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
  image: { width: '100%', height: 220, borderRadius: 14, marginBottom: 16, backgroundColor: '#1e2e1e' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  plantName: { color: '#e0e0e0', fontSize: 22, fontWeight: 'bold' },
  scoreBadge: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 22, fontWeight: 'bold' },
  scoreLabel: { color: '#888', fontSize: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  statusText: { color: '#888', fontSize: 13 },
  card: { backgroundColor: '#1e2e1e', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  cardContent: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  adviceTitle: { color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  adviceDesc: { color: '#aaa', fontSize: 13, lineHeight: 19 },
});
