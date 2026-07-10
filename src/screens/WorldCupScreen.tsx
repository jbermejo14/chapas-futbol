import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useChapasStore, TournamentMatch, TournamentRound } from '../store/chapasStore';
import { TEAMS, TeamId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldCup'>;

const COUNTRY_TEAMS: TeamId[] = [
  'argentina', 'brazil', 'chile', 'colombia', 'denmark', 'england', 'france', 'germany',
  'italy', 'japan', 'netherlands', 'norway', 'peru', 'portugal', 'scotland', 'spain',
  'sweden', 'uruguay', 'us', 'china', 'india', 'indonesia', 'korea', 'malasia', 'pakistan'
];

const ENTRY_FEE = 250;

export const WorldCupScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, deductCoins, user, tournament, startTournament, preferredTeam } = useChapasStore();
  
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

  const renderMatchCard = (match: TournamentMatch, tilt: number, matchRound: TournamentRound) => {
    const isCurrentActive = match.isPlayerMatch && tournament.round === matchRound;
    
    return (
      <View key={match.id} style={{ alignItems: 'center', marginVertical: 10 }}>
        <View style={[styles.matchCard, { transform: [{ rotate: `${tilt}deg` }] }]}>
          {renderTeamBox(match.team1, match.score1, match.team1 === tournament.playerTeam)}
          <View style={{height: 4}} />
          {renderTeamBox(match.team2, match.score2, match.team2 === tournament.playerTeam)}
        </View>
        
        {isCurrentActive && tournament.round !== 'champion' && (
          <TouchableOpacity style={styles.playBtnInline} onPress={handlePlayMatch}>
            <Text style={styles.playBtnTextInline}>JUGAR</Text>
          </TouchableOpacity>
        )}
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
      <AppHeader title="MUNDIAL" showBack />

      {/* Content */}
      <ScrollView horizontal bounces={false} contentContainerStyle={{flexGrow: 1}} showsHorizontalScrollIndicator={false}>
        <ScrollView bounces={false} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
            <View style={styles.treeContainer}>
              {/* Lado Izquierdo */}
              <View style={styles.treeSide}>
                <View style={styles.roundColumn}>
                  {tournament.bracket.octavos.slice(0,4).map((m, i) => renderMatchCard(m, getTilt(i), 'octavos'))}
                </View>
                <View style={[styles.roundColumn, { justifyContent: 'space-around' }]}>
                  {tournament.bracket.cuartos.slice(0,2).map((m, i) => renderMatchCard(m, getTilt(i), 'cuartos'))}
                </View>
                <View style={[styles.roundColumn, { justifyContent: 'center' }]}>
                  {tournament.bracket.semis.slice(0,1).map((m, i) => renderMatchCard(m, getTilt(i), 'semis'))}
                </View>
              </View>

              {/* Centro: Final */}
              <View style={styles.treeCenter}>
                <Text style={styles.roundTitleCenter}>FINAL</Text>
                {tournament.bracket.final.map((m, i) => renderMatchCard(m, getTilt(i), 'final'))}
                
                {tournament.round === 'champion' && (
                  <View style={styles.championBox}>
                    <Ionicons name="trophy" size={60} color="#ffcc00" />
                    <Text style={styles.championText}>¡CAMPEÓN!</Text>
                  </View>
                )}
              </View>

              {/* Lado Derecho */}
              <View style={[styles.treeSide, { flexDirection: 'row-reverse' }]}>
                <View style={styles.roundColumn}>
                  {tournament.bracket.octavos.slice(4,8).map((m, i) => renderMatchCard(m, getTilt(i), 'octavos'))}
                </View>
                <View style={[styles.roundColumn, { justifyContent: 'space-around' }]}>
                  {tournament.bracket.cuartos.slice(2,4).map((m, i) => renderMatchCard(m, getTilt(i), 'cuartos'))}
                </View>
                <View style={[styles.roundColumn, { justifyContent: 'center' }]}>
                  {tournament.bracket.semis.slice(1,2).map((m, i) => renderMatchCard(m, getTilt(i), 'semis'))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  treeContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 900,
  },
  treeSide: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treeCenter: {
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  roundColumn: {
    width: 140,
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  roundTitleCenter: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#106e00',
    marginBottom: 20,
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
  playBtnInline: {
    backgroundColor: '#ff3b30',
    borderWidth: 3,
    borderColor: '#1c1b1b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: -10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  playBtnTextInline: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
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
