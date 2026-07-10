import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { useChapasStore } from '../store/chapasStore';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'TournamentsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TOURNAMENTS = [
  { id: 'world', title: 'COPA MUNDIAL', icon: 'earth', color: '#ff3b30', bg: '#ffe5e5', prize: 1000 },
  { id: 'euro', title: 'EUROCOPA', icon: 'star', color: '#007aff', bg: '#e5f1ff', prize: 1000 },
  { id: 'champions', title: 'LIGA CAMPEONES', icon: 'trophy', color: '#ffcc00', bg: '#fffce5', prize: 1000 },
  { id: 'blitz', title: 'RELÁMPAGO', icon: 'flash', color: '#ff9500', bg: '#fff0e5', prize: 1000 },
];

export const TournamentsScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, user } = useChapasStore();

  const handleTournamentPress = (id: string, title: string) => {
    if (id === 'world') {
      navigation.navigate('WorldCup' as never);
    } else {
      Alert.alert('¡Próximamente!', `El torneo ${title} se encuentra en construcción. ¡Vuelve pronto para competir por la gloria!`);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="TORNEOS" />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>¡COMPITE Y GANA MONEDAS!</Text>
        </View>

        {TOURNAMENTS.map((t) => (
          <TouchableOpacity 
            key={t.id} 
            style={styles.cardWrapper}
            activeOpacity={0.8}
            onPress={() => handleTournamentPress(t.id, t.title)}
          >
            <View style={styles.cardShadow} />
            <View style={[styles.card, { backgroundColor: t.bg }]}>
              <View style={[styles.iconContainer, { backgroundColor: t.color }]}>
                <Ionicons name={t.icon as any} size={40} color="#FFF" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{t.title}</Text>
                <View style={styles.prizeBadge}>
                  <Text style={styles.prizeText}>PREMIO: {t.prize}</Text>
                  <Ionicons name="logo-bitcoin" size={12} color="#e9c400" />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={32} color={t.color} />
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bannerContainer: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    transform: [{ rotate: '-1deg' }],
  },
  bannerText: {
    color: '#39ff14',
    fontFamily: 'Anton',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  cardWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  cardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  prizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    gap: 4,
  },
  prizeText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    fontSize: 12,
    color: '#000',
  },
});
