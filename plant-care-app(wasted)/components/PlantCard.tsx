import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { HealthStatus } from '../types';
import { HealthBadge } from './HealthBadge';
import { Colors } from '../theme/colors';

interface PlantCardProps {
  name: string;
  scientificName?: string;
  imageUri?: string;
  healthStatus: HealthStatus;
  healthScore: number;
}

function getScoreColor(score: number): string {
  if (score >= 70) return Colors.healthGood;
  if (score >= 40) return Colors.healthWarning;
  return Colors.healthDanger;
}

export function PlantCard({
  name,
  scientificName,
  imageUri,
  healthStatus,
  healthScore,
}: PlantCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      {imageUri ? (
        <Card.Cover source={{ uri: imageUri }} style={styles.cover} />
      ) : null}
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameArea}>
            <Text
              variant="headlineSmall"
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {name}
            </Text>
            {scientificName ? (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {scientificName}
              </Text>
            ) : null}
          </View>
          <HealthBadge status={healthStatus} />
        </View>

        <View style={styles.scoreRow}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            健康评分
          </Text>
          <View style={styles.scoreBarBg}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${healthScore}%`,
                  backgroundColor: getScoreColor(healthScore),
                },
              ]}
            />
          </View>
          <Text
            variant="titleMedium"
            style={{
              color: getScoreColor(healthScore),
              fontWeight: 'bold',
              minWidth: 45,
              textAlign: 'right',
            }}
          >
            {healthScore}分
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  cover: {
    height: 220,
  },
  content: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameArea: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
