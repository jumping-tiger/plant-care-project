import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import { EncyclopediaEntry } from '../types';
import { Colors } from '../theme/colors';

const POPULAR_PLANTS = ['绿萝', '多肉', '月季', '兰花', '仙人掌', '吊兰', '发财树', '茉莉花'];

export default function EncyclopediaScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<EncyclopediaEntry | null>(null);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (plantName?: string) => {
    if (loading) return;
    const searchTerm = plantName || query.trim();
    if (!searchTerm) return;
    setLoading(true);
    setError('');
    setEntry(null);
    try {
      const response = await api.getEncyclopedia(searchTerm);
      if (response.success && response.data) {
        setEntry(response.data);
      } else {
        setError(response.error || '未找到相关信息');
      }
    } catch {
      setError('查询失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [loading, query]);

  return (
    <ScreenBackground variant="detail">
      {loading && (
        <View style={[styles.loadingOverlay, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.loadingText}>AI 正在生成百科内容...</Text>
          </View>
        </View>
      )}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.hint}>输入植物名称，AI 将为你生成详细的百科介绍</Text>

        <GlassCard padding={14}>
          <View style={styles.searchRow} collapsable={false}>
            <TouchableOpacity
              onPress={() => handleSearch()}
              activeOpacity={0.7}
              style={styles.searchIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="magnify" size={22} color={Colors.primaryLight} />
            </TouchableOpacity>
            <RNTextInput
              placeholder="搜索植物名称..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              style={styles.searchInput}
              editable
              selectTextOnFocus={false}
              onFocus={() => console.log('[encyclopedia] input focused')}
            />
          </View>
        </GlassCard>

        <View style={styles.tags} collapsable={false}>
          {POPULAR_PLANTS.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => {
                setQuery(name);
                handleSearch(name);
              }}
              activeOpacity={0.7}
              style={styles.tag}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.tagText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <GlassCard>
            <Text style={styles.errorText}>{error}</Text>
          </GlassCard>
        ) : null}

        {entry && (
          <GlassCard>
            <Text style={styles.plantName}>{entry.name}</Text>
            <Text style={styles.subInfo}>{entry.scientificName} · {entry.family}</Text>
            <Text style={styles.bodyText}>{entry.description}</Text>

            <Text style={styles.sectionTitle}>养护要点</Text>
            <CareItem icon="water" title="浇水" desc={entry.careGuide.water} />
            <CareItem icon="white-balance-sunny" title="光照" desc={entry.careGuide.light} />
            <CareItem icon="thermometer" title="温度" desc={entry.careGuide.temperature} />
            <CareItem icon="terrain" title="土壤" desc={entry.careGuide.soil} />
            <CareItem icon="flower" title="施肥" desc={entry.careGuide.fertilizer} />

            {entry.commonIssues.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>常见问题</Text>
                {entry.commonIssues.map((issue, idx) => (
                  <Text key={idx} style={styles.issueItem}>• {issue}</Text>
                ))}
              </>
            )}
          </GlassCard>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function CareItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.careItem}>
      <MaterialCommunityIcons name={icon as any} size={20} color={Colors.primaryLight} />
      <View style={styles.careText}>
        <Text style={styles.careTitle}>{title}</Text>
        <Text style={styles.careDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
  hint: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchIconBtn: { padding: 4 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, height: 44, paddingVertical: 8, paddingHorizontal: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 20 },
  tag: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderColor: 'rgba(76,175,80,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagText: { fontSize: 13, color: Colors.primaryLight },
  tagPressed: { opacity: 0.7 },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.error, fontSize: 14 },
  plantName: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subInfo: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  bodyText: { color: Colors.text, fontSize: 14, lineHeight: 22 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  careItem: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  careText: { flex: 1 },
  careTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  careDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  issueItem: { color: Colors.textSecondary, fontSize: 14, marginLeft: 8, marginBottom: 6, lineHeight: 22 },
});
