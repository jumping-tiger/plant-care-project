import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { HealthStatus } from '../types';
import { Colors } from '../theme/colors';
import { HEALTH_LABELS } from '../constants';

interface HealthBadgeProps {
  status: HealthStatus;
  compact?: boolean;
}

const STATUS_CONFIG: Record<HealthStatus, { bg: string; text: string; icon: string }> = {
  healthy: { bg: '#E8F5E9', text: Colors.healthGood, icon: 'check-circle' },
  warning: { bg: '#FFF3E0', text: Colors.healthWarning, icon: 'alert-circle' },
  danger: { bg: '#FFEBEE', text: Colors.healthDanger, icon: 'close-circle' },
};

export function HealthBadge({ status, compact = false }: HealthBadgeProps) {
  const config = STATUS_CONFIG[status];
  const label = HEALTH_LABELS[status] || status;

  return (
    <Chip
      icon={config.icon}
      compact={compact}
      style={[styles.badge, { backgroundColor: config.bg }]}
      textStyle={[styles.text, { color: config.text }]}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 13,
  },
});
