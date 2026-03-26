import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { IMAGE_CONFIG } from '../constants';
import { Colors } from '../theme/colors';

async function toSafeUri(originalUri: string): Promise<string> {
  if (Platform.OS === 'web') return originalUri;
  try {
    const dest = `${FileSystem.cacheDirectory}plant_pick_${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: originalUri, to: dest });
    return dest;
  } catch {
    return originalUri;
  }
}

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
}

export function ImagePickerButton({ onImageSelected }: ImagePickerButtonProps) {
  const theme = useTheme();
  const [error, setError] = useState('');

  const pickFromCamera = async () => {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: IMAGE_CONFIG.QUALITY,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(await toSafeUri(result.assets[0].uri));
    }
  };

  const pickFromGallery = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('需要相册权限才能选择照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: IMAGE_CONFIG.QUALITY,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(await toSafeUri(result.assets[0].uri));
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconArea,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Text style={styles.emoji}>📷</Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
        >
          拍照或从相册选择植物照片
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          icon="camera"
          onPress={pickFromCamera}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          拍照
        </Button>
        <Button
          mode="outlined"
          icon="image"
          onPress={pickFromGallery}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          从相册选择
        </Button>
      </View>

      {error ? (
        <Text
          variant="bodySmall"
          style={[styles.error, { color: Colors.error }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  iconArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  error: {
    marginTop: 12,
    textAlign: 'center',
  },
});
