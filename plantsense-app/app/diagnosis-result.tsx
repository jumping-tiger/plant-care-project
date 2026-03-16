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

  // 兼容后端字段名差异
  const raw = record.analysisResult as any;
  const plantName: string = raw.plantName || '未知植物';
  const healthScore: number = raw.healthScore ?? 0;
  // healthStatus (后端) 或 status (旧字段)
  const status: string = raw.healthStatus || raw.status || '';
  // issues 数组拼接为诊断摘要；若有 summary 字段直接用
  const issues: string[] = raw.issues || [];
  const summary: string = raw.summary || (issues.length > 0 ? issues.join('；') : '暂无摘要信息');
  // advice (后端) 或 careAdvice (旧字段)
  const careAdvice: any[] = raw.advice || raw.careAdvice || [];
  const climateAdvice: string = raw.climateAdvice || '';
  const weatherInfo = raw.weatherInfo?.current || raw.weatherInfo || null;

  const scoreColor = healthScore >= 70 ? '#4caf50' : healthScore >= 40 ? '#ffb74d' : '#ef5350';

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
          <Text style={styles.plantName}>{plantName}</Text>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{healthScore}</Text>
            <Text style={styles.scoreLabel}>分</Text>
          </View>
        </View>

        {status ? (
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#888" />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}

        {/* 发现的问题 */}
        {issues.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>发现的问题</Text>
            {issues.map((issue: string, i: number) => (
              <View key={i} style={styles.issueRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#ffb74d" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 诊断摘要 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>诊断摘要</Text>
          <Text style={styles.cardContent}>{summary}</Text>
        </View>

        {/* 天气信息 */}
        {weatherInfo && (weatherInfo.temp || weatherInfo.text) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>当前天气</Text>
            <Text style={styles.cardContent}>
              🌡 {weatherInfo.temp}°C  {weatherInfo.text}
              {weatherInfo.humidity ? `  💧 湿度 ${weatherInfo.humidity}%` : ''}
            </Text>
          </View>
        )}

        {/* 养护建议 */}
        {careAdvice.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>养护建议</Text>
            {careAdvice.map((advice: any, i: number) => (
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

        {/* 气候建议 */}
        {climateAdvice ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>气候建议</Text>
            <Text style={styles.cardContent}>{climateAdvice}</Text>
          </View>
        ) : null}

        {/* 7天预测入口 */}
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/prediction',
            params: { plantName, currentScore: String(healthScore) },
          })}
          activeOpacity={0.7}
          style={styles.predictionBtn}
        >
          <MaterialCommunityIcons name="chart-line" size={20} color="#4caf50" />
          <Text style={styles.predictionBtnText}>查看 7 天健康预测</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#4caf50" />
        </TouchableOpacity>
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
  plantName: { color: '#e0e0e0', fontSize: 22, fontWeight: 'bold', flex: 1 },
  scoreBadge: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 22, fontWeight: 'bold' },
  scoreLabel: { color: '#888', fontSize: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  statusText: { color: '#888', fontSize: 13 },
  card: { backgroundColor: '#1e2e1e', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  cardContent: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  issueText: { color: '#e0e0e0', fontSize: 13, lineHeight: 20, flex: 1 },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  adviceTitle: { color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  adviceDesc: { color: '#aaa', fontSize: 13, lineHeight: 19 },
  predictionBtn: {
    backgroundColor: '#1e3e1e', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4,
  },
  predictionBtnText: { color: '#4caf50', fontSize: 15, fontWeight: '600', flex: 1 },
});
