import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { useGardenStore } from '../../stores/gardenStore';
import type { GardenPlant } from '../../types';

function PlantCard({ plant }: { plant: GardenPlant }) {
  const router = useRouter();
  const { getPlantStatus, waterPlant, removePlant } = useGardenStore();
  const status = getPlantStatus(plant);

  const handleWater = () => {
    waterPlant(plant.id);
    Alert.alert('已记录', `已为「${plant.nickname}」记录浇水 💧`);
  };

  const handleDelete = () => {
    Alert.alert('删除植物', `确定删除「${plant.nickname}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => removePlant(plant.id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.plantEmoji}>{plant.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.nickname}>{plant.nickname}</Text>
        <Text style={styles.species}>{plant.species}</Text>
        <Text style={styles.lastWatered}>
          {plant.lastWatered
            ? `上次浇水: ${new Date(plant.lastWatered).toLocaleDateString('zh-CN')}`
            : '还没浇过水'}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, status.needsWater && styles.statusBadgeWarn]}>
          <Text style={styles.statusText}>{status.emoji} {status.label}</Text>
        </View>
        <TouchableOpacity onPress={handleWater} activeOpacity={0.7} style={styles.waterBtn}>
          <MaterialCommunityIcons name="watering-can" size={18} color="#81d4fa" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef9a9a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GardenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plants } = useGardenStore();

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>🪴 我的花园</Text>
          <TouchableOpacity
            onPress={() => router.push('/add-plant')}
            activeOpacity={0.7}
            style={styles.addBtn}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#4caf50" />
            <Text style={styles.addBtnText}>添加植物</Text>
          </TouchableOpacity>
        </View>

        {plants.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>花园还是空的</Text>
            <Text style={styles.emptyDesc}>添加你的第一棵植物，开始记录它的成长故事</Text>
            <TouchableOpacity
              onPress={() => router.push('/add-plant')}
              activeOpacity={0.7}
              style={styles.emptyAddBtn}
            >
              <Text style={styles.emptyAddBtnText}>+ 添加植物</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plants.map(plant => <PlantCard key={plant.id} plant={plant} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f1f0f' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { color: '#e0e0e0', fontSize: 20, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3e1e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: '#4caf50', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#1e2e1e', borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardLeft: { marginRight: 12 },
  plantEmoji: { fontSize: 36 },
  cardContent: { flex: 1 },
  nickname: { color: '#e0e0e0', fontSize: 16, fontWeight: '600' },
  species: { color: '#4caf50', fontSize: 12, marginTop: 2 },
  lastWatered: { color: '#666', fontSize: 11, marginTop: 4 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { backgroundColor: '#1a3a1a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeWarn: { backgroundColor: '#3a1a1a' },
  statusText: { color: '#aaa', fontSize: 11 },
  waterBtn: { padding: 6, backgroundColor: '#1a2a3a', borderRadius: 8 },
  deleteBtn: { padding: 6, backgroundColor: '#2a1a1a', borderRadius: 8 },
  emptyCard: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#e0e0e0', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyAddBtn: { backgroundColor: '#2d5a27', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  emptyAddBtnText: { color: '#4caf50', fontSize: 16, fontWeight: '600' },
});
