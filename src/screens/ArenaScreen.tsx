import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { ARENAS, ArenaId, FIELDS } from '../data/chapasData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ArenaTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ArenaScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, unlockedArenas, deductCoins, unlockArena, preferredTeam, preferredFormation } = useChapasStore();

  const handleBuy = (arenaId: ArenaId, arenaName: string, cost: number) => {
    if (coins < cost) {
      Alert.alert('Saldo Insuficiente', 'Necesitas jugar más para conseguir monedas.');
      return;
    }

    Alert.alert(
      'Desbloquear Estadio',
      `¿Quieres desbloquear ${arenaName} por ${cost} 🪙?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Comprar', 
          onPress: () => {
            deductCoins(cost);
            unlockArena(arenaId);
          }
        }
      ]
    );
  };

  const handlePlay = (arenaId: ArenaId) => {
    if (coins < 50) {
      Alert.alert('Saldo Insuficiente', 'Necesitas 50 🪙 para jugar el partido.');
      return;
    }
    deductCoins(50);
    const arena = ARENAS[arenaId];
    // Start match vs IA in this arena
    navigation.navigate('Game', { 
      mode: '1P', 
      p1Team: preferredTeam,
      p1Formation: preferredFormation,
      p2Team: 'france', // La IA
      p2Formation: '1-2-1-1', 
      fieldId: arena.fieldId
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>CHOOSE YOUR ARENA</Text>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {Object.values(ARENAS).map((arena) => {
            const isUnlocked = unlockedArenas.includes(arena.id);
            const canAfford = coins >= arena.unlockCost;
            const field = FIELDS[arena.fieldId];

            return (
              <View key={arena.id} style={styles.card}>
                <View style={styles.imageContainer}>
                  {field.image ? (
                    <Image source={field.image} style={styles.arenaImage} />
                  ) : (
                    <View style={[styles.arenaImagePlaceholder, { backgroundColor: field.color }]} />
                  )}
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>🪙 {arena.unlockCost}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={[styles.statusText, { color: isUnlocked ? colors.primary : colors.textSecondary }]}>
                      {isUnlocked ? 'UNLOCKED' : (canAfford ? 'LOCKED' : 'NEED COINS')}
                    </Text>
                    <Text style={styles.arenaName}>{arena.name}</Text>
                  </View>

                  {isUnlocked ? (
                    <TouchableOpacity style={styles.playButton} onPress={() => handlePlay(arena.id)}>
                      <Text style={styles.playButtonText}>PLAY</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.unlockButton, !canAfford && styles.lockedButton]} 
                      onPress={() => canAfford ? handleBuy(arena.id, arena.name, arena.unlockCost) : null}
                      disabled={!canAfford}
                    >
                      {canAfford && <Text style={styles.unlockIcon}>🔓</Text>}
                      {!canAfford && <Text style={styles.unlockIcon}>🔒</Text>}
                      <Text style={[styles.unlockButtonText, !canAfford && { color: '#888' }]}>
                        {canAfford ? 'UNLOCK' : 'LOCKED'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    overflow: 'hidden',
    elevation: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  arenaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  arenaImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  costBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  costText: {
    fontWeight: '900',
    fontSize: 14,
    color: '#000',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 2,
  },
  arenaName: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueButton,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    gap: 5,
  },
  lockedButton: {
    backgroundColor: '#CCC',
  },
  unlockIcon: {
    fontSize: 14,
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  }
});
