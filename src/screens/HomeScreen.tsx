import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { findOrCreateMatch } from '../services/matchmaking';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, deductCoins, addCoins, preferredTeam, preferredFormation, user } = useChapasStore();
  const [isSearching, setIsSearching] = useState(false);
  const [cancelMatchmaking, setCancelMatchmaking] = useState<(() => void) | null>(null);

  const handlePlayOnline = async () => {
    if (!user) {
      Alert.alert('Error', 'Necesitas estar conectado a internet.');
      return;
    }

    setIsSearching(true);
    const cancelFn = await findOrCreateMatch(
      user.id,
      preferredTeam,
      (matchId, opponentTeam) => {
        setIsSearching(false);
        setCancelMatchmaking(null);
        navigation.navigate('Game', {
          mode: 'ONLINE',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: opponentTeam,
          p2Formation: '1-2-1-1', // Default for now
          fieldId: 'generic',
          matchId
        });
      },
      () => {
        // Timeout reached (6 seconds)
        setIsSearching(false);
        setCancelMatchmaking(null);
        // Fallback: vs IA
        navigation.navigate('Game', {
          mode: '1P',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: 'france', // IA
          p2Formation: '1-2-1-1',
          fieldId: 'generic'
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
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>FÚTBOL</Text>
        <Text style={styles.subtitle}>CHAPAS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        
        {/* Botón Jugar Online */}
        <TouchableOpacity 
          style={[styles.brutalButton, styles.onlineButton]}
          onPress={handlePlayOnline}
        >
          <Text style={styles.onlineButtonText}>🌐 JUGAR ONLINE</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Botón Local */}
        <TouchableOpacity 
          style={[styles.brutalButton, styles.localButton]}
          onPress={() => navigation.navigate('Setup', { mode: '2P' })}
        >
          <Text style={styles.localButtonText}>👥 1 VS 1 LOCAL</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de Búsqueda */}
      <Modal visible={isSearching} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.searchingText}>Buscando oponente...</Text>
            <Text style={styles.searchingSubtext}>Si no se encuentra a nadie en 6s, jugarás contra la IA.</Text>
            
            <TouchableOpacity style={styles.cancelSearchButton} onPress={handleCancelSearch}>
              <Text style={styles.cancelSearchText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 50,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 5,
    marginTop: -5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
  brutalButton: {
    width: '100%',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 20,
  },
  onlineButton: {
    backgroundColor: colors.primary,
  },
  onlineButtonText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  localButton: {
    backgroundColor: colors.blueButton,
  },
  localButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  divider: {
    width: '80%',
    height: 3,
    backgroundColor: '#000',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  searchingText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  searchingSubtext: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  cancelSearchButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  cancelSearchText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
