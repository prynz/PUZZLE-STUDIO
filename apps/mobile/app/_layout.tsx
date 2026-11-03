import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { color } from '@puzzle-studio/ui';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ImagesProvider } from '@/store/images';
import { PuzzlesProvider } from '@/store/puzzles';
import { SettingsProvider } from '@/store/settings';

// Keep the native splash until fonts are ready (prevents a flash of fallback text).
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. fast refresh) – safe to ignore.
});

export default function RootLayout() {
  // Fonts are bundled with the app (offline), no network request.
  const [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // On a font error we still render (system fallback); the system check reports it.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ImagesProvider>
            <PuzzlesProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: color.background.primary },
                  animation: 'fade',
                }}
              />
            </PuzzlesProvider>
          </ImagesProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
