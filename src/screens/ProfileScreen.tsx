import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { ComicPanel } from '../components/ComicPanel';
import { HypercasualButton } from '../components/HypercasualButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, wins, coins, level, xp, setUsername, setProfilePicture } = useChapasStore();
  
  const [localName, setLocalName] = useState('');

  useEffect(() => {
    if (user) {
      setLocalName(user.username);
    }
  }, [user]);

  const handleSave = () => {
    if (user && localName !== user.username) {
      setUsername(localName);
    }
    navigation.goBack();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const renderFakeSlider = (label: string, percentage: string) => {
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: percentage as any }]} />
          <View style={[styles.sliderThumb, { left: percentage as any }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <HypercasualButton 
            title="Atrás" 
            onPress={handleSave} 
            color="secondary" 
            style={styles.backButton}
            textStyle={{fontSize: 16}}
          />
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <ComicPanel style={styles.mainPanel}>
            {/* FOTO DE PERFIL (Cuadrado) */}
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.profilePicturePlaceholder} onPress={pickImage} activeOpacity={0.8}>
                {user?.profilePictureUrl ? (
                  <Image source={{ uri: user.profilePictureUrl }} style={styles.profileImage} />
                ) : (
                  <Text style={styles.profilePictureIcon}>👤</Text>
                )}
                <View style={styles.editIconBadge}>
                  <Text style={{fontSize: 12}}>✏️</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.profileInfoRight}>
                <Text style={styles.playerIdText}>ID: {user ? user.id.slice(0, 8).toUpperCase() : 'CARGANDO...'}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Nivel {level}</Text>
                </View>
              </View>
            </View>

            {/* INPUT DEL NOMBRE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Jugador</Text>
              <TextInput
                style={styles.nameInput}
                value={localName}
                onChangeText={setLocalName}
                placeholder="Introduce tu nombre..."
                placeholderTextColor="#888"
                maxLength={15}
              />
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{wins}</Text>
                <Text style={styles.statLabel}>Victorias</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{coins} 🪙</Text>
                <Text style={styles.statLabel}>Monedas</Text>
              </View>
            </View>

            {/* XP PROGRESS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiencia</Text>
              <View style={styles.xpContainer}>
                <View style={styles.xpBarTrack}>
                  <View style={[styles.xpBarFill, { width: `${(xp / (level * 500)) * 100}%` }]} />
                </View>
                <Text style={styles.xpText}>{xp} / {level * 500} XP</Text>
              </View>
            </View>

            {/* SLIDERS (FALSOS) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ajustes</Text>
              {renderFakeSlider('Sonido', '70%')}
              {renderFakeSlider('Música', '40%')}
            </View>
          </ComicPanel>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  backButton: { width: 100 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  mainPanel: {
    backgroundColor: colors.surface,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfoRight: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  levelBadge: {
    backgroundColor: colors.blueAccent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  levelBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56, // slightly less than the container
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  profilePictureIcon: {
    fontSize: 60,
  },
  playerIdText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  
  nameInput: {
    backgroundColor: '#FFF',
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
    padding: 15,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#000',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
  },
  statBox: { alignItems: 'center' },
  statValue: { color: colors.primary, fontSize: 32, fontWeight: '900', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  statLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },

  xpContainer: {
    marginTop: 10,
  },
  xpBarTrack: {
    height: 20,
    backgroundColor: '#CCC',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  xpText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '900',
    color: '#666',
  },

  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sliderTrack: {
    height: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#000',
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: -4,
    bottom: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#000',
  },
  sliderThumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#000',
    marginLeft: -15, // center it
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});

