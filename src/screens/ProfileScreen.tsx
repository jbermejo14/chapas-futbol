import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { ComicPanel } from '../components/ComicPanel';
import { HypercasualButton } from '../components/HypercasualButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, wins, coins, setUsername } = useChapasStore();
  
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

  const renderFakeSlider = (label: string, percentage: string) => {
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: percentage }]} />
          <View style={[styles.sliderThumb, { left: percentage }]} />
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
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureIcon}>👤</Text>
              </View>
              <Text style={styles.playerIdText}>ID: {user ? user.id.slice(0, 8).toUpperCase() : 'CARGANDO...'}</Text>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
  statLabel: { color: '#000', fontSize: 14, marginTop: 5, textTransform: 'uppercase', fontWeight: '900' },

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

