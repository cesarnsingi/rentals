import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar }                    from 'expo-status-bar';
import * as SplashScreen                from 'expo-splash-screen';
import * as Notifications               from 'expo-notifications';
import * as Device                      from 'expo-device';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider }             from 'react-native-safe-area-context';
import Navigation                       from './src/navigation';
import { useAuthStore }                 from './src/store/auth.store';
import { authApi }                      from './src/lib/api';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

async function registerPushToken() {
  if (!Device.isDevice) return;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await authApi.savePushToken(token);
  } catch { /* non-critical */ }
}

function AppInner() {
  const { hydrate, hydrated, isAuth } = useAuthStore();

  useEffect(() => {
    hydrate().then(async () => {
      await SplashScreen.hideAsync();
      if (isAuth()) registerPushToken();
    });
  }, []);

  if (!hydrated) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0a0f" />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
