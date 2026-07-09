import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, TeamId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ShopTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TEAM_PRICE = 200;
const { width, height } = Dimensions.get('window');

export const ShopScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, unlockedTeams, unlockTeam, deductCoins, user } = useChapasStore();
  const insets = useSafeAreaInsets();

  const handleBuy = (teamId: TeamId, teamName: string) => {
    if (coins < TEAM_PRICE) {
      Alert.alert('Saldo Insuficiente', 'Necesitas jugar más torneos para conseguir monedas.');
      return;
    }

    Alert.alert(
      'Comprar Equipo',
      `¿Quieres comprar a ${teamName} por ${TEAM_PRICE} 🪙?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Comprar', 
          onPress: () => {
            deductCoins(TEAM_PRICE);
            unlockTeam(teamId);
          }
        }
      ]
    );
  };

  const lockedTeams = Object.values(TEAMS).filter(team => !unlockedTeams.includes(team.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            {user?.profilePictureUrl ? (
              <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={{ fontSize: 24 }}>👤</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>PRO STORE</Text>

        <View style={styles.coinsBadgeWrapper}>
          <View style={styles.coinsBadgeShadow} />
          <View style={styles.coinsBadge}>
            <View style={styles.rimLight} />
            <Ionicons name="logo-usd" size={16} color="#2ae500" />
            <Text style={styles.coinsText}>{coins.toLocaleString()} COINS</Text>
          </View>
        </View>
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {lockedTeams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>¡Has comprado todos los equipos disponibles!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {lockedTeams.map((team, index) => {
              const rotation = index % 2 === 0 ? '-6deg' : '6deg';
              const canAfford = coins >= TEAM_PRICE;
              
              return (
                <View key={team.id} style={styles.cardWrapper}>
                  <View style={styles.cardShadow} />
                  <View style={styles.card}>
                    <View style={styles.chapaOuterWrapper}>
                      <View style={styles.chapaDeepShadow} />
                      <View style={styles.chapaWrapper}>
                        <View style={styles.rimLightRound} />
                        <View style={{ transform: [{ rotate: rotation }] }}>
                          {team.svg ? (
                            <ChapaModular size={80} FlagSvg={team.svg} fallbackColor={team.colorSecondary} />
                          ) : (
                            <View style={[styles.teamColorPreview, { backgroundColor: team.colorPrimary }]} />
                          )}
                        </View>
                      </View>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={2}>{team.name}</Text>
                    
                    <TouchableOpacity 
                      style={styles.buyBtnWrapper}
                      onPress={() => handleBuy(team.id, team.name)}
                      activeOpacity={0.8}
                    >
                      {canAfford && <View style={styles.buyBtnShadow} />}
                      <View style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}>
                        <View style={styles.rimLight} />
                        {canAfford ? (
                          <>
                            <Ionicons name="logo-usd" size={18} color="#1c1b1b" />
                            <Text style={styles.buyBtnText}>{TEAM_PRICE}</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="lock-closed" size={18} color="#6b7c63" />
                            <Text style={[styles.buyBtnText, { color: '#6b7c63' }]}>LEVEL 10</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e2e1', // surface-variant
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fcf9f8',
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    paddingHorizontal: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    overflow: 'hidden',
    backgroundColor: '#fcd400',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTitle: {
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#106e00',
  },
  coinsBadgeWrapper: {
    position: 'relative',
  },
  coinsBadgeShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1c1b1b',
    borderRadius: 20,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcd400',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 1,
  },
  rimLightRound: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    zIndex: 1,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6e5c00',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  cardWrapper: {
    width: '47%',
    position: 'relative',
    marginBottom: 10,
  },
  cardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  chapaOuterWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  chapaDeepShadow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: '#1c1b1b',
    borderRadius: 48,
  },
  chapaWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    backgroundColor: '#705d00', // default fallback
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  teamColorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1c1b1b',
  },
  cardTitle: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#1c1b1b',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  buyBtnWrapper: {
    width: '100%',
    position: 'relative',
  },
  buyBtnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1c1b1b',
    borderRadius: 8,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39ff14',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  buyBtnDisabled: {
    backgroundColor: '#f0eded', // surface-container
    opacity: 0.8,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1b1b',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#106e00',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});
