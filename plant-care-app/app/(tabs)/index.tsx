import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../stores/authStore';
import { Colors } from '../../theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground variant="home">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              你好, {user?.nickname || '植物爱好者'}
            </Text>
            <Text style={styles.subtitle}>探索植物世界，呵护绿色生命</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarBtn}
          >
            {user?.avatar ? (
              <View style={styles.avatarImg}>
                <MaterialCommunityIcons name="account" size={24} color={Colors.primaryLight} />
              </View>
            ) : (
              <View style={styles.avatarImg}>
                <MaterialCommunityIcons name="account" size={24} color={Colors.primaryLight} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.heroCard}>
          <MaterialCommunityIcons name="camera" size={36} color={Colors.primaryLight} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>AI 植物识别</Text>
            <Text style={styles.heroDesc}>
              点击底部拍照按钮，拍摄或选择植物照片，AI 将为你分析健康状况
            </Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>发现更多</Text>

        <View style={styles.entryRow}>
          <Link href="/encyclopedia" asChild>
            <TouchableOpacity activeOpacity={0.8} style={styles.entryCard}>
              <GlassCard padding={16} style={styles.entryGlass}>
                <View style={styles.entryIconWrap}>
                  <MaterialCommunityIcons name="book-open-variant" size={28} color={Colors.primaryLight} />
                </View>
                <Text style={styles.entryTitle}>植物百科</Text>
                <Text style={styles.entryDesc}>搜索植物，获取 AI 生成的百科介绍</Text>
              </GlassCard>
            </TouchableOpacity>
          </Link>

          <Link href="/care-guide" asChild>
            <TouchableOpacity activeOpacity={0.8} style={styles.entryCard}>
              <GlassCard padding={16} style={styles.entryGlass}>
                <View style={styles.entryIconWrap}>
                  <MaterialCommunityIcons name="flower-tulip" size={28} color={Colors.primaryLight} />
                </View>
                <Text style={styles.entryTitle}>养护指南</Text>
                <Text style={styles.entryDesc}>浇水、施肥、光照等养护技巧</Text>
              </GlassCard>
            </TouchableOpacity>
          </Link>
        </View>

        <GlassCard style={styles.tipCard} padding={16}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={Colors.warning} />
            <Text style={styles.tipTitle}>养护小贴士</Text>
          </View>
          <Text style={styles.tipText}>
            早晨是浇水的最佳时间，让植物在白天充分吸收水分。浇水要浇透，直到盆底有水流出。
          </Text>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  entryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  entryCard: {
    flex: 1,
  },
  entryGlass: {
    alignItems: 'center',
  },
  entryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(76,175,80,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  entryTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  entryDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipCard: {
    marginTop: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
