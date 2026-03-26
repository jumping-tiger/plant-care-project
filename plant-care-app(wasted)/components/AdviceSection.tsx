import { View, StyleSheet } from 'react-native';
import { Card, Text, List, useTheme, Divider, Chip } from 'react-native-paper';
import { CareAdvice } from '../types';
import { CARE_CATEGORY_LABELS, CARE_CATEGORY_ICONS } from '../constants';
import { Colors } from '../theme/colors';

interface AdviceSectionProps {
  advice: CareAdvice[];
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: '紧急', color: Colors.healthDanger },
  medium: { label: '重要', color: Colors.healthWarning },
  low: { label: '建议', color: Colors.healthGood },
};

export function AdviceSection({ advice }: AdviceSectionProps) {
  const theme = useTheme();

  if (advice.length === 0) return null;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          养护建议
        </Text>

        {advice.map((item, idx) => {
          const icon = CARE_CATEGORY_ICONS[item.category] || 'leaf';
          const categoryLabel =
            CARE_CATEGORY_LABELS[item.category] || item.category;
          const priorityInfo = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;

          return (
            <View key={idx}>
              {idx > 0 && <Divider style={styles.divider} />}
              <View style={styles.adviceItem}>
                <View style={styles.adviceHeader}>
                  <List.Icon icon={icon} color={Colors.primary} />
                  <View style={styles.adviceHeaderText}>
                    <Text
                      variant="titleSmall"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.tags}>
                      <Chip
                        compact
                        textStyle={[styles.tagText, { color: priorityInfo.color }]}
                        style={styles.tag}
                      >
                        {priorityInfo.label}
                      </Chip>
                      <Chip compact textStyle={styles.tagText} style={styles.tag}>
                        {categoryLabel}
                      </Chip>
                    </View>
                  </View>
                </View>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.description,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 8,
  },
  adviceItem: {
    paddingVertical: 4,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviceHeaderText: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    height: 26,
  },
  tagText: {
    fontSize: 11,
  },
  description: {
    marginTop: 8,
    marginLeft: 40,
    lineHeight: 22,
  },
});
