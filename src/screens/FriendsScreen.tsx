import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore, UserProfile } from '../store/chapasStore';
import { searchUsersByTag, getFriendsProfiles } from '../services/friendsService';
import { sendChallenge } from '../services/challengeService';
import { ComicPanel } from '../components/ComicPanel';
import { HypercasualButton } from '../components/HypercasualButton';
import { ARENAS } from '../data/chapasData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'FriendsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const FriendsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, friends, addFriend, removeFriend, coins, deductCoins, addCoins, preferredTeam, preferredFormation } = useChapasStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  
  const [friendsProfiles, setFriendsProfiles] = useState<UserProfile[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  const [isChallenging, setIsChallenging] = useState(false);
  const [cancelChallengeFn, setCancelChallengeFn] = useState<(() => void) | null>(null);

  const loadFriends = async () => {
    if (friends.length === 0) {
      setFriendsProfiles([]);
      return;
    }
    setIsLoadingFriends(true);
    const profiles = await getFriendsProfiles(friends);
    setFriendsProfiles(profiles);
    setIsLoadingFriends(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [friends])
  );

  const handleSearch = async () => {
    if (!searchQuery.startsWith('#')) {
      Alert.alert('Búsqueda', 'El tag debe empezar por # (ej. #1234)');
      return;
    }
    setIsSearching(true);
    const results = await searchUsersByTag(searchQuery);
    setSearchResults(results.filter(r => r.id !== user?.id)); // Exclude self
    setIsSearching(false);
  };

  const handleAddFriend = (profile: UserProfile) => {
    addFriend(profile.id);
    Alert.alert('Añadido', `${profile.username} ha sido añadido a tu lista de amigos.`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFriend = (profileId: string, username: string) => {
    Alert.alert('Eliminar', `¿Estás seguro de eliminar a ${username}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeFriend(profileId) }
    ]);
  };

  const handleChallenge = async (friendId: string, friendName: string) => {
    if (!user) {
      Alert.alert('Error', 'Necesitas conexión para retar a un amigo.');
      return;
    }
    if (coins < 50) {
      Alert.alert('Saldo Insuficiente', 'Necesitas 50 🪙 para invitar a un amigo.');
      return;
    }

    // Cobrar por adelantado
    deductCoins(50);
    setIsChallenging(true);

    const cancelFn = await sendChallenge(
      user.id,
      user.username,
      friendId,
      (matchId) => {
        // ACEPTADO
        setIsChallenging(false);
        setCancelChallengeFn(null);
        navigation.navigate('Game', {
          mode: 'ONLINE',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: 'england', // Se actualizará en el juego
          p2Formation: '1-2-1-1',
          fieldId: ARENAS['usa'].fieldId, // Estadio por defecto para retos
          matchId
        });
      },
      () => {
        // RECHAZADO O TIMEOUT
        setIsChallenging(false);
        setCancelChallengeFn(null);
        addCoins(50); // Devolver dinero
        Alert.alert('Reto cancelado', `${friendName} no ha respondido o ha rechazado el reto.`);
      }
    );

    setCancelChallengeFn(() => cancelFn);
  };

  const cancelCurrentChallenge = () => {
    if (cancelChallengeFn) {
      cancelChallengeFn();
    }
    setIsChallenging(false);
    setCancelChallengeFn(null);
    addCoins(50); // Devolver dinero al cancelar manualmente
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>AMIGOS</Text>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* BUSCADOR */}
          <ComicPanel style={styles.section}>
            <Text style={styles.sectionTitle}>BUSCAR AMIGO</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder="#1234"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              <HypercasualButton 
                title="BUSCAR" 
                color="blueAccent" 
                onPress={handleSearch} 
                style={styles.searchBtn} 
                textStyle={{fontSize: 14}}
              />
            </View>

            {isSearching && <ActivityIndicator size="small" color={colors.primary} style={{marginTop: 10}} />}
            
            {searchResults.map(res => (
              <View key={res.id} style={styles.resultRow}>
                <View>
                  <Text style={styles.friendName}>{res.username}</Text>
                  <Text style={styles.friendTag}>{res.tag}</Text>
                </View>
                {!friends.includes(res.id) ? (
                  <HypercasualButton 
                    title="AÑADIR" 
                    color="secondary" 
                    onPress={() => handleAddFriend(res)} 
                    style={styles.actionBtn}
                    textStyle={{fontSize: 12}}
                  />
                ) : (
                  <Text style={styles.alreadyFriendText}>Añadido</Text>
                )}
              </View>
            ))}
          </ComicPanel>

          {/* LISTA DE AMIGOS */}
          <ComicPanel style={styles.section}>
            <Text style={styles.sectionTitle}>MIS AMIGOS</Text>
            {isLoadingFriends ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : friendsProfiles.length === 0 ? (
              <Text style={styles.noFriendsText}>Aún no tienes amigos añadidos.</Text>
            ) : (
              friendsProfiles.map(friend => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.username}</Text>
                    <Text style={styles.friendTag}>{friend.tag}</Text>
                  </View>
                  <View style={styles.friendActions}>
                    <HypercasualButton 
                      title="ELIMINAR" 
                      color="primary" 
                      onPress={() => handleRemoveFriend(friend.id, friend.username)} 
                      style={styles.smallBtn}
                      textStyle={{fontSize: 10}}
                    />
                    <HypercasualButton 
                      title="RETAR 50🪙" 
                      color="secondary" 
                      onPress={() => handleChallenge(friend.id, friend.username)} 
                      style={[styles.smallBtn, {marginLeft: 5}]}
                      textStyle={{fontSize: 10, color: '#000'}}
                    />
                  </View>
                </View>
              ))
            )}
          </ComicPanel>
        </ScrollView>

        {/* MODAL DE ESPERA DE RETO */}
        <Modal visible={isChallenging} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <ComicPanel style={styles.modalContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.modalTitle}>ESPERANDO RESPUESTA...</Text>
              <Text style={styles.modalSub}>Tus 50🪙 están reservadas. Si rechaza, se te devolverán.</Text>
              <HypercasualButton 
                title="CANCELAR" 
                color="primary" 
                onPress={cancelCurrentChallenge} 
                textStyle={{fontSize: 16}}
              />
            </ComicPanel>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  headerTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { padding: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 15,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  searchBtn: { marginVertical: 0, marginLeft: 10, paddingHorizontal: 15, paddingVertical: 12 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#000',
  },
  friendName: { fontSize: 18, fontWeight: '900', color: '#000' },
  friendTag: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  actionBtn: { marginVertical: 0, paddingVertical: 8, paddingHorizontal: 12 },
  alreadyFriendText: { fontSize: 14, fontWeight: 'bold', color: '#555', paddingRight: 10 },
  noFriendsText: { fontSize: 16, fontWeight: 'bold', color: '#555', textAlign: 'center', marginVertical: 20 },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#EEE',
  },
  friendInfo: { flex: 1 },
  friendActions: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: { marginVertical: 0, paddingVertical: 8, paddingHorizontal: 10, minWidth: 70 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: 320, alignItems: 'center', padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#000', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  modalSub: { fontSize: 14, fontWeight: 'bold', color: '#555', textAlign: 'center', marginBottom: 20 },
});
