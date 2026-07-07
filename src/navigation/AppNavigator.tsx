import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
import { colors } from '../theme/colors';
import { TeamId, FormationId, FieldId } from '../data/chapasData';
import { useChapasStore } from '../store/chapasStore';

export type TabParamList = {
  HomeTab: undefined;
  ArenaTab: undefined;
  CustomizationTab: undefined;
  ShopTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Setup: { mode: '1P' | '2P' | 'ONLINE' };
  Game: { mode: '1P' | '2P' | 'ONLINE', p1Team: TeamId, p2Team: TeamId, p1Formation: FormationId, p2Formation: FormationId, fieldId: FieldId, matchId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const HeaderLeft = () => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerLeftBtn}>
      <Text style={styles.headerLeftIcon}>👤</Text>
    </TouchableOpacity>
  );
};

const HeaderRight = () => {
  const { coins } = useChapasStore();
  return (
    <View style={styles.headerRightBadge}>
      <Text style={styles.headerRightText}>🪙 {coins}</Text>
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.secondary,
          height: 90,
        },
        headerTitleAlign: 'center',
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 20,
        },
        headerShadowVisible: false,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        tabBarStyle: {
          backgroundColor: '#000', // Black background for tabs
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#666',
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 5,
        },
        tabBarActiveBackgroundColor: colors.secondary, // Orange pill for active tab
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'HOME',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>
        }} 
      />
      <Tab.Screen 
        name="ArenaTab" 
        component={ArenaScreen} 
        options={{ 
          title: 'STADIUM SELECT',
          tabBarLabel: 'ARENA',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚽</Text>
        }} 
      />
      <Tab.Screen 
        name="CustomizationTab" 
        component={CustomizationScreen} 
        options={{ 
          title: 'CLUB',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>
        }} 
      />
      <Tab.Screen 
        name="ShopTab" 
        component={ShopScreen} 
        options={{ 
          title: 'STORE',
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>
        }} 
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
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
          options={{ title: 'PROFILE' }} 
        />
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen} 
          options={{ title: 'SETUP' }} 
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ title: '', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerLeftBtn: {
    marginLeft: 15,
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  headerLeftIcon: {
    fontSize: 20,
  },
  headerRightBadge: {
    marginRight: 15,
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  headerRightText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 14,
  }
});
