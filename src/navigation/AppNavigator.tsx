import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { GameScreen } from '../screens/GameScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { CustomizationScreen } from '../screens/CustomizationScreen';
import { ArenaScreen } from '../screens/ArenaScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { CoinShopScreen } from '../screens/CoinShopScreen';
import { TournamentsScreen } from '../screens/TournamentsScreen';
import { WorldCupScreen } from '../screens/WorldCupScreen';
import { colors } from '../theme/colors';
import { TeamId, FormationId, FieldId } from '../data/chapasData';
import { useChapasStore } from '../store/chapasStore';
import { listenForIncomingChallenges, respondToChallenge, ChallengeData } from '../services/challengeService';
import { Modal, Alert } from 'react-native';
import { ComicPanel } from '../components/ComicPanel';
import { HypercasualButton } from '../components/HypercasualButton';

export type TabParamList = {
  HomeTab: undefined;
  TournamentsTab: undefined;
  FriendsTab: undefined;
  CustomizationTab: undefined;
  ShopTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Setup: { mode: '1P' | '2P' | 'ONLINE' };
  Game: { mode: '1P' | '2P' | 'ONLINE' | 'TOURNAMENT', p1Team: TeamId, p2Team: TeamId, p1Formation: FormationId, p2Formation: FormationId, fieldId: FieldId, matchId?: string, entryFee?: number };
  CoinShop: undefined;
  WorldCup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

import { CustomTabBar } from '../components/CustomTabBar';

const HeaderLeft = () => {
  const navigation = useNavigation<any>();
  const { user } = useChapasStore();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerLeftBtn}>
      {user?.profilePictureUrl ? (
        <Image source={{ uri: user.profilePictureUrl }} style={styles.headerProfileImage} />
      ) : (
        <Text style={styles.headerLeftIcon}>👤</Text>
      )}
    </TouchableOpacity>
  );
};

const HeaderRight = () => {
  const { coins, addCoins } = useChapasStore();
  const navigation = useNavigation<any>();

  const handleWatchAd = () => {
    Alert.alert(
      'Recompensa Diaria',
      '¿Ver un anuncio para recibir 50 monedas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver anuncio', onPress: () => addCoins(50) }
      ]
    );
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <TouchableOpacity 
        onPress={handleWatchAd} 
        style={{
          backgroundColor: '#39ff14',
          borderRadius: 15,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderWidth: 2,
          borderColor: '#1c1b1b',
          shadowColor: '#1c1b1b',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1c1b1b' }}>▶ AD</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CoinShop')}>
        <View style={styles.headerRightBadge}>
          <Text style={styles.headerRightIcon}>🪙</Text>
          <Text style={styles.headerRightText}>{coins.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const HeaderTitle = () => (
  <Text style={styles.headerTitleText}>FINGER FOOTBALL</Text>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fcf9f8',
          height: 90,
        },
        headerTitleAlign: 'center',
        headerTitle: () => <HeaderTitle />,
        headerShadowVisible: true,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'JUGAR',
        }} 
      />
      <Tab.Screen 
        name="TournamentsTab" 
        component={TournamentsScreen} 
        options={{ 
          title: 'TORNEOS',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="FriendsTab" 
        component={FriendsScreen} 
        options={{ 
          title: 'AMIGOS',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="CustomizationTab" 
        component={CustomizationScreen} 
        options={{ 
          title: 'CLUB',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="ShopTab" 
        component={ShopScreen} 
        options={{ 
          title: 'STORE',
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
};

const GlobalChallengeListener = () => {
  const { user, coins, deductCoins } = useChapasStore();
  const navigation = useNavigation<any>();
  const [incomingChallenge, setIncomingChallenge] = React.useState<ChallengeData | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = listenForIncomingChallenges(user.id, (challenge) => {
      setIncomingChallenge(challenge);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAccept = async () => {
    if (!incomingChallenge) return;
    if (coins < 50) {
      Alert.alert('Saldo Insuficiente', 'No tienes 50🪙 para aceptar este reto.');
      await respondToChallenge(incomingChallenge.id!, false);
      setIncomingChallenge(null);
      return;
    }
    
    deductCoins(50);
    const matchId = incomingChallenge.id!;
    await respondToChallenge(incomingChallenge.id!, true, matchId);
    
    navigation.navigate('Game', {
      mode: 'ONLINE',
      p1Team: 'spain',
      p1Formation: '1-2-1-1',
      p2Team: 'england',
      p2Formation: '1-2-1-1',
      fieldId: 'stadium-usa',
      matchId
    });
    setIncomingChallenge(null);
  };

  const handleDecline = async () => {
    if (!incomingChallenge) return;
    await respondToChallenge(incomingChallenge.id!, false);
    setIncomingChallenge(null);
  };

  if (!incomingChallenge) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
        <ComicPanel style={{width: 320, alignItems: 'center', padding: 25}}>
          <Text style={{fontSize: 24, fontWeight: '900', color: '#000', textAlign: 'center'}}>¡NUEVO RETO!</Text>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.primary, marginVertical: 15, textAlign: 'center'}}>
            {incomingChallenge.challengerName} quiere jugar.
          </Text>
          <Text style={{fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 20}}>
            Aceptar cuesta 50🪙. ¿Estás listo?
          </Text>
          <HypercasualButton title="ACEPTAR (50🪙)" color="secondary" onPress={handleAccept} style={{width: '100%', marginBottom: 10}} />
          <HypercasualButton title="RECHAZAR" color="primary" onPress={handleDecline} style={{width: '100%'}} />
        </ComicPanel>
      </View>
    </Modal>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <GlobalChallengeListener />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.secondary,
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '900',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            title: 'PERFIL',
            headerStyle: { backgroundColor: '#fcf9f8' },
            headerTintColor: '#1c1b1b',
            headerTitleStyle: {
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: 24,
              color: '#1c1b1b',
            } as any,
            headerTitleAlign: 'center',
            headerShadowVisible: true,
          }} 
        />
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen} 
          options={{ title: 'SETUP' }} 
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ title: 'PARTIDA', headerShown: false }} 
        />
        <Stack.Screen 
          name="CoinShop" 
          component={CoinShopScreen} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="WorldCup" 
          component={WorldCupScreen} 
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerLeftBtn: {
    marginLeft: 15,
    backgroundColor: '#39ff14',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1b1b',
  },
  headerLeftIcon: {
    fontSize: 24,
  },
  headerProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerRightBadge: {
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcd400',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1c1b1b',
  },
  headerRightIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  headerRightText: {
    color: '#6e5c00',
    fontWeight: '900',
    fontSize: 14,
  },
  headerTitleText: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#1c1b1b',
    letterSpacing: -1,
  }
});
