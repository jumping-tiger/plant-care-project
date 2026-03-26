import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme } from '../theme';
import { AuthContext, useAuthProvider } from '../stores/authStore';

function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!auth.isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (auth.isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [auth.isLoggedIn, auth.isLoading, segments]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={DarkTheme}>
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="scan"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="result"
            options={{
              headerShown: true,
              title: '分析结果',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#E8E8E8',
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="prediction"
            options={{
              headerShown: true,
              title: '7天预测',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#E8E8E8',
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="encyclopedia"
            options={{
              headerShown: true,
              title: '植物百科',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#E8E8E8',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="care-guide"
            options={{
              headerShown: true,
              title: '养护指南',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#E8E8E8',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </AuthGate>
    </PaperProvider>
  );
}
