import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryRecord } from '../../types';
import { useHistoryStore } from '../../stores/historyStore';
import { HealthBadge } from '../../components/HealthBadge';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GlassCard } from '../../components/GlassCard';
import { Colors } from '../../theme/colors';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { records, loadRecords, deleteRecord } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const filteredRecords = records.filter((r) =>
    r.result.plantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewResult = (record: HistoryRecord) => {
    router.push({
      pathname: '/result',
      params: { resultJson: JSON.stringify(record.result) },
    });
  };

  const renderItem = ({ item }: { item: HistoryRecord }) => (
    <TouchableOpacity onPress={() => handleViewResult(item)} activeOpacity={0.7}>
      <GlassCard style={styles.card} padding={14}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.result.plantName}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString('zh-CN')}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <HealthBadge status={item.result.healthStatus} />
            <IconButton
              icon="delete-outline"
              size={18}
              iconColor={Colors.textMuted}
              onPress={() => deleteRecord(item.id)}
            />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground variant="home">
      <View style={[styles.container, { paddingBottom: 120 + insets.bottom }]}>
        <Text style={styles.pageTitle}>历史记录</Text>

        <GlassCard padding={12} style={styles.searchCard}>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
            <RNTextInput
              placeholder="搜索植物名称..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </GlassCard>

        {filteredRecords.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? '未找到匹配记录' : '暂无历史记录'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? '试试其他关键词' : '点击底部拍照按钮，分析你的第一株植物'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  pageTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    height: 44,
    paddingVertical: 8,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
