import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, TeamId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ShopTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TEAM_PRICE = 200;

export const ShopScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, unlockedTeams, deductCoins, unlockTeam } = useChapasStore();

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

  // Filtrar los equipos que tengan diseño modular (svg) o en general los que no estén desbloqueados
  // De momento mostraremos todos los que no estén en unlockedTeams
  const lockedTeams = Object.values(TEAMS).filter(team => !unlockedTeams.includes(team.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <Text style={styles.headerTitle}>Tienda</Text>
          <View style={styles.coinsHeader}>
            <Text style={styles.coinsText}>🪙 {coins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.description}>
            Invierte tus ganancias de los torneos en desbloquear nuevas selecciones.
          </Text>

          {lockedTeams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>¡Has comprado todos los equipos disponibles!</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {lockedTeams.map((team) => (
                <View key={team.id} style={styles.card}>
                  <View style={styles.chapaContainer}>
                    {team.svg ? (
                      <ChapaModular size={60} FlagSvg={team.svg} fallbackColor={team.colorSecondary} />
                    ) : (
                      <View style={[styles.teamColorPreview, { backgroundColor: team.colorPrimary }]} />
                    )}
                  </View>
                  <Text style={styles.cardText}>{team.name}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.buyButton, coins < TEAM_PRICE && styles.buyButtonDisabled]}
                    onPress={() => handleBuy(team.id, team.name)}
                  >
                    <Text style={styles.buyButtonText}>{TEAM_PRICE} 🪙</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.surface,
    elevation: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  coinsHeader: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  description: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  chapaContainer: {
    marginBottom: 10,
    height: 60,
    justifyContent: 'center',
  },
  teamColorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#555',
  },
  buyButtonText: {
    color: '#1a472a',
    fontWeight: '900',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
