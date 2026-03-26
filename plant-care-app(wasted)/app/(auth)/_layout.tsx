import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: '注册',
          headerBackTitle: '返回',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#E8E8E8',
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
