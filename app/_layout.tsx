import ProviderContext from '@/app/context/providerContext';
import '@/global.css';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'LTKaraoke-Bold': require('../assets/fonts/LTKaraoke-Bold.ttf'),
    'LTKaraoke-Light': require('../assets/fonts/LTKaraoke-Light.ttf'),
    'LTKaraoke-Regular': require('../assets/fonts/LTKaraoke-Regular.ttf'),
    'LTKaraoke-Medium': require('../assets/fonts/LTKaraoke-SemiBold.ttf'),
    'LTKaraoke-Semibold': require('../assets/fonts/LTKaraoke-SemiBold.ttf'), 
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ProviderContext>
        <StatusBar barStyle="dark-content" />
        <Slot />
      </ProviderContext>
    </SafeAreaProvider>
  );
}