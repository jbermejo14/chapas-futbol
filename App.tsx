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

  return (
    <SafeAreaProvider>
      {isSplashVisible ? (
        <>
          <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />
          <StatusBar hidden />
        </>
      ) : (
        <>
          <AppNavigator />
          <StatusBar style="light" />
        </>
      )}
    </SafeAreaProvider>
  );
}
