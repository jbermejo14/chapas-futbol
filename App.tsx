import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useChapasStore } from './src/store/chapasStore';
import { CustomSplashScreen } from './src/screens/CustomSplashScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const initializeAuth = useChapasStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isSplashVisible) {
    return (
      <>
        <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />
        <StatusBar hidden />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
