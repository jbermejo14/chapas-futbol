import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, ActivityIndicator, Alert, Image, SafeAreaView } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { findOrCreateMatch } from '../services/matchmaking';
import { ARENAS, ArenaId, FIELDS } from '../data/chapasData';
import { HypercasualButton } from '../components/HypercasualButton';
import { ComicPanel } from '../components/ComicPanel';

import { SoccerFieldBackground } from '../components/SoccerFieldBackground';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, preferredTeam, preferredFormation } = useChapasStore();
  const [isSearching, setIsSearching] = useState(false);
  const [cancelMatchmaking, setCancelMatchmaking] = useState<(() => void) | null>(null);

  const handlePlayArena = async (arenaId: ArenaId) => {
    const arena = ARENAS[arenaId];

    if (!user) {
      // Si por lo que sea Firebase no ha cargado, jugamos contra la IA directamente
      navigation.navigate('Game', {
        mode: '1P',
        p1Team: preferredTeam,
        p1Formation: preferredFormation,
        p2Team: 'france', // IA
        p2Formation: '1-2-1-1',
        fieldId: arena.fieldId
      });
      return;
    }

    setIsSearching(true);
    const cancelFn = await findOrCreateMatch(
      user.id,
      preferredTeam,
      arena.fieldId,
      (matchId, opponentTeam) => {
        setIsSearching(false);
        setCancelMatchmaking(null);
        navigation.navigate('Game', {
          mode: 'ONLINE',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: opponentTeam,
          p2Formation: '1-2-1-1', // Default for now
          fieldId: arena.fieldId,
          matchId
        });
      },
      () => {
        // Timeout reached (6 segundos) o error de conexión
        setIsSearching(false);
        setCancelMatchmaking(null);
        // Fallback: vs IA
        navigation.navigate('Game', {
          mode: '1P',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: 'france', // IA
          p2Formation: '1-2-1-1',
          fieldId: arena.fieldId
        });
      }
    );
    
    setCancelMatchmaking(() => cancelFn);
  };

  const handleCancelSearch = () => {
    if (cancelMatchmaking) {
      cancelMatchmaking();
    }
    setIsSearching(false);
    setCancelMatchmaking(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SoccerFieldBackground>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>FÚTBOL</Text>
            <Text style={styles.subtitle}>CHAPAS</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
            
            {Object.values(ARENAS).map((arena) => {
              const field = FIELDS[arena.fieldId];

              return (
                <View key={arena.id} style={styles.card}>
                  <View style={styles.imageContainer}>
                    {field.image ? (
                      <Image source={field.image} style={styles.arenaImage} />
                    ) : (
                      <View style={[styles.arenaImagePlaceholder, { backgroundColor: field.color }]} />
                    )}
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.arenaName}>{arena.name}</Text>
                    </View>

                    <View style={styles.cardActionContainer}>
                      <HypercasualButton 
                        title="JUGAR" 
                        color="secondary" 
                        onPress={() => handlePlayArena(arena.id)} 
                        style={styles.cardButton} 
                        textStyle={{fontSize: 16}}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.divider} />

            <HypercasualButton 
              title="👥 1 VS 1 LOCAL" 
              color="primary" 
              onPress={() => navigation.navigate('Setup', { mode: '2P' })} 
              style={{ width: '90%' }}
            />

          </ScrollView>

          <Modal visible={isSearching} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <ComicPanel style={styles.modalContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.searchingText}>Buscando rival...</Text>
                <HypercasualButton 
                  title="Cancelar" 
                  color="primary" 
                  onPress={handleCancelSearch} 
                  textStyle={{fontSize: 16}}
                />
              </ComicPanel>
            </View>
          </Modal>

        </View>
      </SoccerFieldBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#106e00', // Matches the grass
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary, // Cherry Red
    letterSpacing: 5,
    marginTop: -10,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Comic style hard shadow
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    borderBottomWidth: 4,
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
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardActionContainer: {
    marginLeft: 10,
  },
  cardButton: {
    marginVertical: 0,
  },
  arenaName: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
  },
  divider: {
    width: '80%',
    height: 4,
    backgroundColor: '#000',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    alignItems: 'center',
  },
  searchingText: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 20,
  }
});

