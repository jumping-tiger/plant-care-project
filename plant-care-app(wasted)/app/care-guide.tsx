import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { GlassCard } from '../components/GlassCard';
import { Colors } from '../theme/colors';

interface GuideSection {
  title: string;
  icon: string;
  items: { title: string; description: string }[];
}

const GUIDE_DATA: GuideSection[] = [
  {
    title: '浇水技巧',
    icon: 'water',
    items: [
      { title: '观察土壤', description: '将手指插入土壤 2-3 厘米深处，如果感觉干燥则需要浇水' },
      { title: '浇水时间', description: '早晨是最佳浇水时间，避免在正午高温时浇水' },
      { title: '浇透原则', description: '每次浇水要浇透，直到盆底有水流出，避免只浇表面' },
      { title: '避免积水', description: '确保花盆有排水孔，积水会导致根部腐烂' },
    ],
  },
  {
    title: '光照管理',
    icon: 'white-balance-sunny',
    items: [
      { title: '了解需求', description: '不同植物对光照需求差异很大，先了解你的植物属于喜阳还是耐阴类型' },
      { title: '散射光', description: '大多数室内植物喜欢明亮的散射光，避免直射阳光灼伤叶片' },
      { title: '定期转盆', description: '每隔 1-2 周转动花盆 90°，让植物均匀受光' },
      { title: '补光灯', description: '冬季光照不足时可使用植物生长灯补光' },
    ],
  },
  {
    title: '施肥指南',
    icon: 'flower',
    items: [
      { title: '生长期施肥', description: '春夏生长期每 2-4 周施一次薄肥，秋冬休眠期减少或停止施肥' },
      { title: '薄肥勤施', description: '宁可浓度低一点多施几次，也不要一次施太浓的肥' },
      { title: '基肥和追肥', description: '换盆时在土壤中混入基肥，生长期定期追施液肥' },
      { title: '有机肥优先', description: '优先使用有机肥，对植物和土壤更友好' },
    ],
  },
  {
    title: '病虫害防治',
    icon: 'bug',
    items: [
      { title: '定期检查', description: '每周检查叶片正反面，及早发现病虫害' },
      { title: '隔离处理', description: '发现病虫害后立即隔离受感染的植物，避免扩散' },
      { title: '通风环境', description: '保持良好的通风可以预防大部分真菌病害' },
      { title: '生物防治', description: '优先使用生物防治方法，如肥皂水喷洒防治蚜虫' },
    ],
  },
];

export default function CareGuideScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground variant="detail">
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        <Text style={styles.intro}>掌握这些基础养护知识，让你的植物茁壮成长</Text>

        {GUIDE_DATA.map((section) => (
          <GlassCard key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name={section.icon as any} size={22} color={Colors.primaryLight} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, idx) => (
              <View key={item.title}>
                {idx > 0 && <Divider style={styles.divider} />}
                <View style={styles.guideItem}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
  intro: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16, lineHeight: 22 },
  sectionCard: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  divider: { backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },
  guideItem: { paddingVertical: 4 },
  itemTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
