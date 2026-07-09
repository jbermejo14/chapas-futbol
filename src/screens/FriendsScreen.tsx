import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, SafeAreaView, Modal, TouchableOpacity, Image } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'FriendsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const STATUS_MOCK = ['ONLINE', 'OFFLINE', 'IN MATCH'];
const AVATAR_MOCK = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBJ2drX67_H_4bIDiGocl2vhZgZZ84-txKe7DJewldi474rUpKdJZWqq5aa14snoMfb0y7rlDvSlSBRzMIpUQAFiZ_UdtTtBs9Fo32R-30vm-Svh5W7f35mP-qUAoZZL660RALk0qKYVAB246PmKaQ3tiY7Htg068zrIynszukXK1GNgIvIW-SxtdmpZ4-cJfaHUM40WspBWRZCa1p7F8uI3DQTArNVvLAeGyLG9XkJK2-oantCCxYd7v9OUeSQxfPb-53EYVbHb0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ9_IynTFi16B3zmcCWqGS-TzKrRAbhGmXX4jT_StXEHe1GBw45aRHKH6igheCMaqqUZ5L6aADbiTrV8ChkKC_AIGvsFTXx6z4Zk7x0nltvYtRkZmopxQ-p8lLavLu3usVhAQYVQDiTsob9rs_rqbHpc6NwDXjCGeQd6UuNu1XasT93P-ZBzU6NYIri_hrkq8Imvxe7cQ-bri3JWnrpn3Jz_5mgiT1VfZ6wCsHWiPeKHbspk-m5t_U1nNHOCS9kTXFCf8qsluqBU8',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCGgNTj9LdTJrQMIf0nqDLekcU_Lrb_KfrDtFhkLq16iqMijFBRHD-elR9l5-o0KVOUOK4M7EL5Ob_22AorLIOXRJNjb3G8ixVkmLrL04sNTREaDyXs0nPELULAODu1lM3eqX9JBbK2WNEdAVYwK13PelRBpjcb8O0P9k-XbSNZaA8mr0uUki23osQdGb06x22jPwBDMwfQiPhlStv1l_WD6QrcKicCGEj_29sMrY5Ra49XoBOV4X4UpowXCnv0wmYhpZdCadIOWZg'
];

export const FriendsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, friends, addFriend, removeFriend, coins, deductCoins, addCoins, preferredTeam, preferredFormation } = useChapasStore();
  const insets = useSafeAreaInsets();
  
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
    setSearchResults(results.filter(r => r.id !== user?.id));
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

    deductCoins(50);
    setIsChallenging(true);

    const cancelFn = await sendChallenge(
      user.id,
      user.username,
      friendId,
      (matchId) => {
        setIsChallenging(false);
        setCancelChallengeFn(null);
        navigation.navigate('Game', {
          mode: 'ONLINE',
          p1Team: preferredTeam,
          p1Formation: preferredFormation,
          p2Team: 'england',
          p2Formation: '1-2-1-1',
          fieldId: ARENAS['usa'].fieldId,
          matchId
        });
      },
      () => {
        setIsChallenging(false);
        setCancelChallengeFn(null);
        addCoins(50);
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
    addCoins(50);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>FRIENDS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Search Section */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchShadow} />
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={24} color="#106e00" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="SEARCH FRIENDS BY NAME OR ID"
              placeholderTextColor="#3c4b35"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {isSearching && <ActivityIndicator size="small" color="#106e00" style={{marginTop: 10}} />}

        {searchResults.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            {searchResults.map(res => (
              <View key={res.id} style={styles.searchResultCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.friendName}>{res.username}</Text>
                  <Text style={styles.friendTag}>{res.tag}</Text>
                </View>
                {!friends.includes(res.id) ? (
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAddFriend(res)}>
                    <Text style={styles.addBtnText}>AÑADIR</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.alreadyFriendText}>Añadido</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.accentSquare} />
          <Text style={styles.sectionTitle}>MY FRIENDS</Text>
          <View style={styles.dashedLine} />
        </View>

        {/* Friends List */}
        {isLoadingFriends ? (
          <ActivityIndicator size="large" color="#106e00" style={{ marginTop: 20 }} />
        ) : friendsProfiles.length === 0 ? (
          <Text style={styles.noFriendsText}>Aún no tienes amigos añadidos.</Text>
        ) : (
          <View style={styles.friendsList}>
            {friendsProfiles.map((friend, index) => {
              const mockStatus = STATUS_MOCK[index % 3];
              const mockAvatar = AVATAR_MOCK[index % 3];
              const isOffline = mockStatus === 'OFFLINE';
              const isInMatch = mockStatus === 'IN MATCH';
              
              return (
                <TouchableOpacity 
                  key={friend.id} 
                  style={styles.friendCardWrapper}
                  onLongPress={() => handleRemoveFriend(friend.id, friend.username)}
                  delayLongPress={800}
                >
                  <View style={styles.friendCardShadow} />
                  <View style={styles.friendCard}>
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: mockAvatar }} style={styles.avatarImg} />
                    </View>
                    
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName} numberOfLines={1}>{friend.username}</Text>
                      <View style={styles.statusRow}>
                        <View style={[
                          styles.statusDot, 
                          isOffline && { backgroundColor: '#dcd9d9' },
                          isInMatch && { backgroundColor: '#705d00' }
                        ]} />
                        <Text style={styles.statusText}>{mockStatus}</Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.actionBtnWrapper}
                      onPress={() => !isOffline && !isInMatch && handleChallenge(friend.id, friend.username)}
                      activeOpacity={0.8}
                      disabled={isOffline || isInMatch}
                    >
                      <View style={styles.actionBtnShadow} />
                      <View style={[
                        styles.actionBtn, 
                        isOffline && { backgroundColor: '#dcd9d9' },
                        isInMatch && { backgroundColor: '#fcd400' }
                      ]}>
                        <View style={styles.rimLight} />
                        {isInMatch ? (
                          <Ionicons name="eye" size={20} color="#1c1b1b" />
                        ) : (
                          <Text style={[
                            styles.actionBtnText,
                            isOffline && { color: '#888' }
                          ]}>VS</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* MODAL DE ESPERA DE RETO */}
      <Modal visible={isChallenging} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ComicPanel style={styles.modalContent}>
            <ActivityIndicator size="large" color="#106e00" />
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
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcf9f8' // surface
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fcf9f8',
    borderBottomWidth: 4,
    borderBottomColor: '#1c1b1b',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#106e00',
    textTransform: 'uppercase',
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 30,
    paddingBottom: 120 
  },
  
  // Search Box
  searchWrapper: {
    position: 'relative',
    marginBottom: 40,
    width: '100%',
  },
  searchShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#705d00', // secondary
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#1c1b1b',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: '#1c1b1b',
    textTransform: 'uppercase',
  },

  // Search Results
  searchResultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e5e2e1',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  friendTag: {
    fontSize: 12,
    color: '#106e00',
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#fcd400',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1b1b',
  },
  alreadyFriendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3c4b35',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 8,
  },
  accentSquare: {
    width: 16,
    height: 16,
    backgroundColor: '#39ff14',
    borderWidth: 3,
    borderColor: '#1c1b1b',
    transform: [{ rotate: '45deg' }],
    marginRight: 12,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dashedLine: {
    flex: 1,
    height: 0,
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderStyle: 'dashed',
    opacity: 0.3,
    marginLeft: 16,
  },

  // Friends List
  friendsList: {
    flexDirection: 'column',
    gap: 16,
  },
  friendCardWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  friendCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#1c1b1b',
    overflow: 'hidden',
    backgroundColor: '#ffd3cc', // fallback color
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#39ff14',
    borderWidth: 2,
    borderColor: '#1c1b1b',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3c4b35',
    textTransform: 'uppercase',
  },

  // Action Button
  actionBtnWrapper: {
    position: 'relative',
  },
  actionBtnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1c1b1b',
    borderRadius: 8,
  },
  actionBtn: {
    backgroundColor: '#106e00', // primary
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    position: 'relative',
    overflow: 'hidden',
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 1,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#ffffff',
    letterSpacing: 1,
  },

  noFriendsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginVertical: 40,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { 
    width: 320, 
    alignItems: 'center', 
    padding: 25 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#000', 
    marginTop: 20, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  modalSub: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#555', 
    textAlign: 'center', 
    marginBottom: 20 
  },
});
