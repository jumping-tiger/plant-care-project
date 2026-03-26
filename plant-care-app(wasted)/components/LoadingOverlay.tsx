import { StyleSheet } from 'react-native';
import { Modal, Portal, ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { Colors } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = '加载中...',
}: LoadingOverlayProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: theme.colors.onSurface }]}
        >
          {message}
        </Text>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    margin: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
