import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { STATIC_PLANTS, CARE_TIPS } from '../../data/plants';

type Tab = 'encyclopedia' | 'guide' | 'expert';

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('encyclopedia');

  return (
    <View style={styles.screen}>
      <AppHeader />
      <View style={styles.tabBar}>
        {(['encyclopedia', 'guide', 'expert'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'encyclopedia' ? '植物百科' : t === 'guide' ? '养护指南' : '咨询专家'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'encyclopedia' && (
          <>
            <Text style={styles.hint}>点击植物查看详细养护信息</Text>
            {STATIC_PLANTS.map(plant => (
              <TouchableOpacity
                key={plant.id}
                onPress={() => router.push({ pathname: '/plant-detail', params: { id: plant.id } })}
                activeOpacity={0.7}
                style={styles.plantCard}
              >
                <Text style={styles.plantEmoji}>{plant.emoji}</Text>
                <View style={styles.plantInfo}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <Text style={styles.plantFamily}>{plant.family}</Text>
                  <Text style={styles.plantDesc} numberOfLines={2}>{plant.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#555" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === 'guide' && (
          <>
            <Text style={styles.hint}>常见养护知识指南</Text>
            {CARE_TIPS.map((tip, i) => (
              <View key={i} style={styles.guideCard}>
                <Text style={styles.guideEmoji}>{tip.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideTitle}>{tip.title}</Text>
                  <Text style={styles.guideContent}>{tip.content}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'expert' && (
          <View style={styles.expertSection}>
            <Text style={styles.expertEmoji}>🤖</Text>
            <Text style={styles.expertTitle}>AI 植物专家</Text>
            <Text style={styles.expertDesc}>
              有任何关于植物养护、病虫害、浇水施肥的问题，都可以直接向 AI 专家咨询
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/expert-chat')}
              activeOpacity={0.7}
              style={styles.expertBtn}
            >
              <MaterialCommunityIcons name="message-text" size={20} color="#fff" />
              <Text style={styles.expertBtnText}>开始咨询</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1a2e1a', paddingHorizontal: 16, paddingVertical: 8 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#2d5a27' },
  tabLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#4caf50' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  hint: { color: '#666', fontSize: 12, marginBottom: 12 },
  plantCard: {
    backgroundColor: '#1e2e1e', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  plantEmoji: { fontSize: 36, marginRight: 14 },
  plantInfo: { flex: 1 },
  plantName: { color: '#e0e0e0', fontSize: 16, fontWeight: '600' },
  plantFamily: { color: '#4caf50', fontSize: 11, marginTop: 2 },
  plantDesc: { color: '#888', fontSize: 12, marginTop: 4, lineHeight: 17 },
  guideCard: {
    backgroundColor: '#1a2e1a', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8,
  },
  guideEmoji: { fontSize: 24, marginRight: 12, marginTop: 2 },
  guideTitle: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  guideContent: { color: '#aaa', fontSize: 13, lineHeight: 20 },
  expertSection: { alignItems: 'center', paddingVertical: 40 },
  expertEmoji: { fontSize: 72, marginBottom: 16 },
  expertTitle: { color: '#e0e0e0', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  expertDesc: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 },
  expertBtn: {
    backgroundColor: '#2d5a27', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 28, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  expertBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
