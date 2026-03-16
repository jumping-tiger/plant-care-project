import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { useGardenStore } from '../../stores/gardenStore';
import { useAuth } from '../../stores/authStore';
import { CARE_TIPS } from '../../data/plants';
import type { GardenPlant } from '../../types';

function PlantBubble({ plant }: { plant: GardenPlant }) {
  const { getPlantStatus } = useGardenStore();
  const status = getPlantStatus(plant);

  return (
    <View style={styles.bubbleRow}>
      <View style={styles.bubbleAvatar}>
        <Text style={styles.bubbleEmoji}>{plant.emoji}</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.bubbleName}>{plant.nickname}</Text>
        <Text style={styles.bubbleMsg}>
          {status.emoji} {status.needsWater
            ? `我好渴呀，快来浇水吧！`
            : `我今天状态${status.label === '状态良好' ? '不错哦~' : status.label}`}
        </Text>
        <Text style={styles.bubbleSpecies}>{plant.species}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plants } = useGardenStore();
  const { user } = useAuth();

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 问候语 */}
        <Text style={styles.greeting}>
          你好，{user?.nickname || '植物爱好者'} 🌱
        </Text>

        {/* 今日植览 */}
        <Text style={styles.sectionTitle}>今日植览</Text>
        {plants.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>花园里还没有植物，去添加一棵吧~</Text>
            <TouchableOpacity onPress={() => router.push('/add-plant')} activeOpacity={0.7} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ 添加植物</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plants.map(plant => <PlantBubble key={plant.id} plant={plant} />)
        )}

        {/* 识别植物 */}
        <Text style={styles.sectionTitle}>识别植物</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/diagnosis')}
          activeOpacity={0.7}
          style={styles.identifyCard}
        >
          <MaterialCommunityIcons name="camera" size={32} color="#4caf50" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.identifyTitle}>拍照识别</Text>
            <Text style={styles.identifyDesc}>AI 分析植物种类、健康状态和养护建议</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* 今日提醒 + 光度计 */}
        <View style={styles.toolRow}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/garden')}
            activeOpacity={0.7}
            style={[styles.toolCard, { marginRight: 8 }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={28} color="#ffb74d" />
            <Text style={styles.toolTitle}>今日提醒</Text>
            <Text style={styles.toolDesc}>
              {plants.filter(p => {
                const s = useGardenStore.getState().getPlantStatus(p);
                return s.needsWater;
              }).length} 棵植物需要浇水
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/light-meter')}
            activeOpacity={0.7}
            style={[styles.toolCard, { marginLeft: 8 }]}
          >
            <MaterialCommunityIcons name="white-balance-sunny" size={28} color="#fff176" />
            <Text style={styles.toolTitle}>光度计</Text>
            <Text style={styles.toolDesc}>检测当前环境光照</Text>
          </TouchableOpacity>
        </View>

        {/* 养护指南 */}
        <Text style={styles.sectionTitle}>养护小贴士</Text>
        {CARE_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipContent}>{tip.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  greeting: { color: '#e0e0e0', fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 4 },
  sectionTitle: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10, letterSpacing: 1 },
  emptyCard: { backgroundColor: '#1e2e1e', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  addBtn: { backgroundColor: '#2d5a27', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#4caf50', fontSize: 14, fontWeight: '600' },
  bubbleRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  bubbleAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1e3e1e', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  bubbleEmoji: { fontSize: 24 },
  bubble: { flex: 1, backgroundColor: '#1e3e1e', borderRadius: 12, padding: 12 },
  bubbleName: { color: '#4caf50', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  bubbleMsg: { color: '#e0e0e0', fontSize: 14, lineHeight: 20 },
  bubbleSpecies: { color: '#666', fontSize: 11, marginTop: 4 },
  identifyCard: {
    backgroundColor: '#1e3e1e', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  identifyTitle: { color: '#e0e0e0', fontSize: 16, fontWeight: '600' },
  identifyDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  toolRow: { flexDirection: 'row', marginTop: 4 },
  toolCard: {
    flex: 1, backgroundColor: '#1e3e1e', borderRadius: 12, padding: 16, alignItems: 'center',
  },
  toolTitle: { color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginTop: 8 },
  toolDesc: { color: '#888', fontSize: 11, marginTop: 4, textAlign: 'center' },
  tipCard: {
    backgroundColor: '#1a2e1a', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8,
  },
  tipEmoji: { fontSize: 22, marginRight: 12, marginTop: 2 },
  tipTitle: { color: '#4caf50', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  tipContent: { color: '#aaa', fontSize: 12, lineHeight: 18 },
});
