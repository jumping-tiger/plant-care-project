import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScanOverlay } from '../components/ScanOverlay';
import { api } from '../services/api';
import { API_URL } from '../constants';
import { Colors } from '../theme/colors';

export default function ScanScreen() {
  const { imageUri, latitude, longitude } = useLocalSearchParams<{
    imageUri: string;
    latitude?: string;
    longitude?: string;
  }>();
  const router = useRouter();
  const [error, setError] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!imageUri || calledRef.current) return;
    calledRef.current = true;

    const location =
      latitude && longitude ? { latitude, longitude } : undefined;

    (async () => {
      try {
        const response = await api.analyzePlant(imageUri, location);
        if (response.success && response.data) {
          router.replace({
            pathname: '/result',
            params: { resultJson: JSON.stringify(response.data) },
          });
        } else {
          setError(response.error || '分析失败，请重试');
        }
      } catch (e: any) {
        setError(e.message || '分析失败，请重试');
      }
    })();
  }, [imageUri]);

  if (!imageUri) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>缺少图片参数</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.btn}>
          返回
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.dimOverlay} />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.debugText}>API: {API_URL}</Text>
          <Button
            mode="contained"
            onPress={() => {
              calledRef.current = false;
              setError('');
            }}
            style={styles.btn}
            buttonColor={Colors.primaryLight}
          >
            重试
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={[styles.btn, { marginTop: 8 }]}
            textColor={Colors.text}
          >
            返回
          </Button>
        </View>
      ) : (
        <ScanOverlay />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  debugText: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    borderRadius: 12,
    minWidth: 140,
  },
});
