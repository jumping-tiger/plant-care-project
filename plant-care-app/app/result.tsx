import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Chip, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalysisResult } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { WeatherCard } from '../components/WeatherCard';
import { useHistoryStore } from '../stores/historyStore';
import { setCachedPrediction } from '../stores/predictionCache';
import { api } from '../services/api';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { CARE_CATEGORY_ICONS, CARE_CATEGORY_LABELS } from '../constants';

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resultJson } = useLocalSearchParams<{ resultJson: string }>();
  const { saveRecord } = useHistoryStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const result: AnalysisResult | null = resultJson ? JSON.parse(resultJson) : null;

  useEffect(() => {
    if (!result) return;
    const city = result.weatherInfo?.city ?? '';
    (async () => {
      try {
        const res = await api.getPrediction(result.plantName, result.healthScore, city || undefined);
        if (res.success && res.data) {
          setCachedPrediction(result.plantName, result.healthScore, city || undefined, res.data);
        }
      } catch {
        // 预取失败不影响主流程
      }
    })();
  }, [result?.plantName, result?.healthScore, result?.weatherInfo?.city]);

  if (!result) {
    return (
      <ScreenBackground variant="detail">
        <View style={styles.center}>
          <Text style={styles.emptyText}>暂无分析结果</Text>
        </View>
      </ScreenBackground>
    );
  }

  const handleSaveToHistory = async () => {
    console.log('[result] save history pressed');
    if (saving || saved) return;
    setSaving(true);
    try {
      await saveRecord({ id: result.id, result, createdAt: new Date().toISOString() });
      setSaved(true);
      setSnackMsg('已保存到历史记录');
    } catch {
      setSnackMsg('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleViewPrediction = () => {
    console.log('[result] view prediction pressed');
    router.push({
      pathname: '/prediction',
      params: {
        plantName: result.plantName,
        healthScore: String(result.healthScore),
        resultJson,
        cityName: result.weatherInfo?.city ?? '',
      },
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return Colors.healthGood;
    if (score >= 40) return Colors.healthWarning;
    return Colors.healthDanger;
  };

  return (
    <ScreenBackground variant="detail">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {result.imageUri ? (
          <GlassCard padding={0} style={styles.imageCard}>
            <Image source={{ uri: result.imageUri }} style={styles.plantImage} resizeMode="cover" />
          </GlassCard>
        ) : null}

        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.plantName}>{result.plantName}</Text>
              {result.scientificName && (
                <Text style={styles.sciName}>{result.scientificName}</Text>
              )}
            </View>
            <View style={styles.scoreWrap}>
              <Text style={[styles.score, { color: getScoreColor(result.healthScore) }]}>
                {result.healthScore}
              </Text>
              <Text style={styles.scoreLabel}>健康评分</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <HealthBadge status={result.healthStatus} />
          </View>
        </GlassCard>

        {result.issues.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionTitle}>发现的问题</Text>
            {result.issues.map((issue, idx) => (
              <View key={idx} style={styles.issueRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {result.weatherInfo?.current?.temp != null && (
          <WeatherCard weather={result.weatherInfo} />
        )}

        {result.climateAdvice ? (
          <GlassCard>
            <View style={styles.climateTitleRow}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color="#81D4FA" />
              <Text style={styles.sectionTitle}>气候养护建议</Text>
            </View>
            <Text style={styles.climateText}>{result.climateAdvice}</Text>
          </GlassCard>
        ) : null}

        {result.advice.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionTitle}>养护建议</Text>
            {result.advice.map((item, idx) => (
              <View key={idx} style={styles.adviceItem}>
                <View style={styles.adviceHeader}>
                  <MaterialCommunityIcons
                    name={(CARE_CATEGORY_ICONS[item.category] || 'leaf') as any}
                    size={18}
                    color={Colors.primaryLight}
                  />
                  <Text style={styles.adviceTitle}>{item.title}</Text>
                  <Chip
                    compact
                    style={[
                      styles.priorityChip,
                      item.priority === 'high' && { backgroundColor: 'rgba(244,67,54,0.15)' },
                      item.priority === 'medium' && { backgroundColor: 'rgba(255,152,0,0.15)' },
                      item.priority === 'low' && { backgroundColor: 'rgba(76,175,80,0.15)' },
                    ]}
                    textStyle={[
                      styles.priorityText,
                      item.priority === 'high' && { color: Colors.healthDanger },
                      item.priority === 'medium' && { color: Colors.healthWarning },
                      item.priority === 'low' && { color: Colors.healthGood },
                    ]}
                  >
                    {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                  </Chip>
                </View>
                <Text style={styles.adviceDesc}>{item.description}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        <View style={styles.actions} collapsable={false}>
          <TouchableOpacity
            onPress={handleViewPrediction}
            activeOpacity={0.7}
            style={styles.primaryBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialCommunityIcons name="chart-line" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnLabel}>查看 7 天预测</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveToHistory}
            disabled={saved || saving}
            activeOpacity={0.7}
            style={[styles.outlineBtn, (saved || saving) && { opacity: 0.5 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {saving ? (
              <ActivityIndicator size={16} color={Colors.primaryLight} style={{ marginRight: 8 }} />
            ) : (
              <MaterialCommunityIcons
                name={saved ? 'check' : 'content-save'}
                size={18}
                color={Colors.primaryLight}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.outlineBtnLabel}>
              {saving ? '正在保存…' : saved ? '已保存' : '保存到历史'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snackMsg}
        onDismiss={() => setSnackMsg('')}
        duration={2000}
        style={styles.snackbar}
      >
        {snackMsg}
      </Snackbar>
    </ScreenBackground>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  imageCard: { marginBottom: 16, borderRadius: 24, overflow: 'hidden' },
  plantImage: { width: '100%', height: 220, borderRadius: 24 },
  infoCard: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLeft: { flex: 1 },
  plantName: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  sciName: { color: Colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  scoreWrap: { alignItems: 'center' },
  score: { fontSize: 36, fontWeight: 'bold' },
  scoreLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  badgeRow: { marginTop: 12 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '600', marginBottom: 14 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  issueText: { color: Colors.textSecondary, fontSize: 14, flex: 1, lineHeight: 20 },
  adviceItem: { marginBottom: 16 },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  adviceTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  priorityChip: { paddingVertical: 0 },
  priorityText: { fontSize: 11, lineHeight: 16 },
  adviceDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginLeft: 26 },
  climateTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  climateText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 20, gap: 12 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  primaryBtnLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  outlineBtnLabel: { color: Colors.primaryLight, fontSize: 15, fontWeight: '600' },
  snackbar: { backgroundColor: Colors.surface },
});
