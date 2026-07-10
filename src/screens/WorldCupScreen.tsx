import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useChapasStore, TournamentMatch, TournamentRound } from '../store/chapasStore';
import { TEAMS, TeamId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldCup'>;

const COUNTRY_TEAMS: TeamId[] = [
  'argentina', 'brazil', 'chile', 'colombia', 'denmark', 'england', 'france', 'germany',
  'italy', 'japan', 'netherlands', 'norway', 'peru', 'portugal', 'scotland', 'spain',
  'sweden', 'uruguay', 'us', 'china', 'india', 'indonesia', 'korea', 'malasia', 'pakistan'
];

const ENTRY_FEE = 250;

export const WorldCupScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, deductCoins, user, tournament, startTournament, preferredTeam } = useChapasStore();
  const insets = useSafeAreaInsets();
  
  const handleEnroll = () => {
    if (!COUNTRY_TEAMS.includes(preferredTeam)) {
      Alert.alert('Chapa No Válida', 'Debes tener seleccionada la chapa de un PAÍS en tu Club para jugar el Mundial.');
      return;
    }
    if (coins < ENTRY_FEE) {
      Alert.alert('Sin Monedas', `Necesitas ${ENTRY_FEE} monedas para inscribirte en el Mundial.`);
      return;
    }
    
    Alert.alert(
      'Inscripción Mundial',
      `¿Pagar ${ENTRY_FEE} 🪙 para inscribirte con ${TEAMS[preferredTeam].name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Inscribirse', 
          onPress: () => {
            deductCoins(ENTRY_FEE);
            generateAndStartBracket(preferredTeam);
          }
        }
      ]
    );
  };
  
  const generateAndStartBracket = (playerTeam: TeamId) => {
    let others = COUNTRY_TEAMS.filter(t => t !== playerTeam);
    others.sort(() => Math.random() - 0.5);
    const selected = [playerTeam, ...others.slice(0, 15)];
    selected.sort(() => Math.random() - 0.5);
    
    const octavos: TournamentMatch[] = [];
    for (let i = 0; i < 8; i++) {
      const t1 = selected[i*2];
      const t2 = selected[i*2+1];
      octavos.push({
        id: `octavos-${i}`,
        team1: t1,
        team2: t2,
        isPlayerMatch: t1 === playerTeam || t2 === playerTeam,
      });
    }
    
    startTournament(playerTeam, {
      octavos,
      cuartos: Array(4).fill(null).map((_,i) => ({ id: `cuartos-${i}`, team1: null, team2: null })),
      semis: Array(2).fill(null).map((_,i) => ({ id: `semis-${i}`, team1: null, team2: null })),
      final: [{ id: 'final-0', team1: null, team2: null }]
    });
  };

  const handlePlayMatch = () => {
    let activeMatches: TournamentMatch[] = [];
    if (tournament.round === 'octavos') activeMatches = tournament.bracket.octavos;
    if (tournament.round === 'cuartos') activeMatches = tournament.bracket.cuartos;
    if (tournament.round === 'semis') activeMatches = tournament.bracket.semis;
    if (tournament.round === 'final') activeMatches = tournament.bracket.final;
    
    const playerMatch = activeMatches.find(m => m.isPlayerMatch);
    if (playerMatch && playerMatch.team1 && playerMatch.team2) {
      const cpuTeam = playerMatch.team1 === tournament.playerTeam ? playerMatch.team2 : playerMatch.team1;
      navigation.navigate('Game', {
        mode: 'TOURNAMENT' as any,
        p1Team: tournament.playerTeam!,
        p2Team: cpuTeam,
        p1Formation: '1-2-1-1',
        p2Formation: '1-2-1-1',
        fieldId: 'estadio-rio'
      });
    }
  };

  const renderTeamBox = (teamId: TeamId | null, score?: number, isPlayer?: boolean) => {
    if (!teamId) {
      return (
        <View style={[styles.teamBox, { opacity: 0.5 }]}>
          <View style={styles.teamBoxInfo}>
            <Text style={{fontSize: 16}}>❓</Text>
            <Text style={styles.teamBoxLabel}>---</Text>
          </View>
        </View>
      );
    }
    
    const team = TEAMS[teamId];
    return (
      <View style={[styles.teamBox, isPlayer ? { backgroundColor: '#39ff14' } : {}]}>
        <View style={styles.teamBoxInfo}>
          <ChapaModular size={20} FlagSvg={team.svg} fallbackColor={team.colorSecondary} />
          <Text style={styles.teamBoxLabel}>{team.name.substring(0,3).toUpperCase()}</Text>
        </View>
        {score !== undefined && (
          <Text style={[styles.teamBoxScore, isPlayer ? { color: '#000' } : {}]}>{score}</Text>
        )}
      </View>
    );
  };

  const renderMatchCard = (match: TournamentMatch, tilt: number) => {
    return (
      <View key={match.id} style={[styles.matchCard, { transform: [{ rotate: `${tilt}deg` }] }]}>
        {renderTeamBox(match.team1, match.score1, match.team1 === tournament.playerTeam)}
        <View style={{height: 4}} />
        {renderTeamBox(match.team2, match.score2, match.team2 === tournament.playerTeam)}
      </View>
    );
  };

  const getTilt = (idx: number) => {
    if (idx % 3 === 0) return -1.5;
    if (idx % 3 === 1) return 1.5;
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={32} color="#106e00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MUNDIAL</Text>
        </View>

        <View style={styles.coinsBadge}>
          <Ionicons name="logo-usd" size={16} color="#705d00" />
          <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView horizontal contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false}>
        
        {!tournament.isActive ? (
          <View style={styles.enrollContainer}>
            <View style={styles.enrollCard}>
              <Ionicons name="earth" size={80} color="#ff3b30" />
              <Text style={styles.enrollTitle}>LA COPA DEL MUNDO</Text>
              <Text style={styles.enrollDesc}>16 Selecciones. Solo un ganador.</Text>
              <TouchableOpacity style={styles.enrollBtn} onPress={handleEnroll}>
                <Text style={styles.enrollBtnText}>INSCRIBIRSE (250 🪙)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bracketContainer}>
            {/* OCTAVOS */}
            <View style={styles.roundColumn}>
              <Text style={styles.roundTitle}>OCTAVOS</Text>
              {tournament.bracket.octavos.map((m, i) => renderMatchCard(m, getTilt(i)))}
            </View>
            
            {/* CUARTOS */}
            <View style={styles.roundColumn}>
              <Text style={styles.roundTitle}>CUARTOS</Text>
              {tournament.bracket.cuartos.map((m, i) => renderMatchCard(m, getTilt(i)))}
            </View>
            
            {/* SEMIS */}
            <View style={styles.roundColumn}>
              <Text style={styles.roundTitle}>SEMIS</Text>
              {tournament.bracket.semis.map((m, i) => renderMatchCard(m, getTilt(i)))}
            </View>
            
            {/* FINAL */}
            <View style={styles.roundColumn}>
              <Text style={styles.roundTitle}>FINAL</Text>
              <View style={styles.finalWrapper}>
                {tournament.bracket.final.map((m, i) => renderMatchCard(m, getTilt(i)))}
                
                {tournament.round !== 'champion' && (
                  <TouchableOpacity style={styles.playBtn} onPress={handlePlayMatch}>
                    <Text style={styles.playBtnText}>JUGAR PARTIDO</Text>
                  </TouchableOpacity>
                )}
                
                {tournament.round === 'champion' && (
                  <View style={styles.championBox}>
                    <Ionicons name="trophy" size={60} color="#ffcc00" />
                    <Text style={styles.championText}>¡CAMPEÓN!</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  header: {
    backgroundColor: '#fcf9f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  headerTitle: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#106e00',
    fontStyle: 'italic',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcd400',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1c1b1b',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  coinsText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  enrollContainer: {
    width: Dimensions.get('window').width - 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enrollCard: {
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    transform: [{ rotate: '-1deg' }],
  },
  enrollTitle: {
    fontFamily: 'Anton',
    fontSize: 32,
    fontStyle: 'italic',
    marginTop: 10,
  },
  enrollDesc: {
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 15,
    color: '#3c4b35',
  },
  enrollBtn: {
    backgroundColor: '#39ff14',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1c1b1b',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginTop: 10,
  },
  enrollBtnText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#000',
  },
  bracketContainer: {
    flexDirection: 'row',
    gap: 40,
    height: 650,
  },
  roundColumn: {
    width: 180,
    justifyContent: 'space-around',
    height: '100%',
  },
  roundTitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    fontStyle: 'italic',
    color: '#3c4b35',
    textAlign: 'center',
    position: 'absolute',
    top: -10,
    width: '100%',
  },
  matchCard: {
    backgroundColor: '#eae7e7',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  teamBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  teamBoxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamBoxLabel: {
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    fontSize: 14,
  },
  teamBoxScore: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#106e00',
  },
  finalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  playBtn: {
    backgroundColor: '#c00100',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    transform: [{ rotate: '1.5deg' }],
  },
  playBtnText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#fff',
  },
  championBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  championText: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#1c1b1b',
    marginTop: 10,
  }
});
