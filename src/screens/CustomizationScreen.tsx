import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, FORMATIONS, FormationId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';

const MiniPitch = ({ formationId, isSelected }: { formationId: string, isSelected: boolean }) => {
  const pitchBg = isSelected ? '#39ff14' : '#e5e2e1'; // primary-container vs surface-variant
  const dotColor = isSelected ? '#ffffff' : '#fcf9f8';
  
  const getRows = () => {
    switch(formationId) {
      case '1-3-1': return [[1], [3], [1]];
      case '1-2-1-1': return [[1], [2], [1], [1]];
      case '1-2-2': return [[1], [2], [2]];
      case '1-4': return [[1], [4]];
      default: return [[1], [2], [2]];
    }
  };

  const rows = getRows();

  return (
    <View style={[styles.miniPitch, { backgroundColor: pitchBg }]}>
      <View style={styles.centerLine} />
      {isSelected && <View style={styles.centerCircle} />}
      
      {/* Distribute rows */}
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
        {rows.map((rowArr, i) => (
          <View key={i} style={styles.pitchRow}>
            {Array.from({ length: rowArr[0] }).map((_, j) => (
              <View key={j} style={[styles.pitchDot, { backgroundColor: dotColor }]} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export const CustomizationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { preferredTeam, preferredFormation, setPreferredTeam, setPreferredFormation, unlockedTeams, coins, addCoins, user } = useChapasStore();
  const insets = useSafeAreaInsets();

  const handleWatchAd = () => {
    Alert.alert(
      'Recompensa Diaria',
      '¿Ver un anuncio para recibir 50 monedas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver anuncio', onPress: () => addCoins(50) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader 
          title="CLUB" 
          rightAction={
            <TouchableOpacity 
              onPress={handleWatchAd} 
              style={{
                backgroundColor: '#39ff14',
                borderRadius: 15,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderWidth: 2,
                borderColor: '#1c1b1b',
                shadowColor: '#1c1b1b',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#1c1b1b' }}>▶ AD</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* MY TEAMS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MY TEAMS</Text>
              <View style={styles.dashedLine} />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalScroll}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 16 }}
            >
              {Object.values(TEAMS).map((team) => {
                const isUnlocked = unlockedTeams.includes(team.id);
                const isSelected = preferredTeam === team.id;

                return (
                  <TouchableOpacity
                    key={`team-${team.id}`}
                    style={styles.teamCard}
                    onPress={() => isUnlocked && setPreferredTeam(team.id)}
                    activeOpacity={isUnlocked ? 0.8 : 1}
                  >
                    <View style={[
                      styles.teamChapaContainer, 
                      isSelected && styles.teamChapaSelected,
                      !isUnlocked && styles.teamChapaLocked
                    ]}>
                      <ChapaModular size={80} FlagSvg={team.svg} fallbackColor={team.colorPrimary} />
                      
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={16} color="#022100" style={{fontWeight: 'bold'}} />
                        </View>
                      )}
                      {!isUnlocked && (
                         <View style={styles.lockedBadge}>
                           <Ionicons name="lock-closed" size={16} color="#1c1b1b" />
                         </View>
                      )}
                    </View>
                    <View style={styles.teamNameBox}>
                      <Text style={styles.teamNameText} numberOfLines={1}>{team.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* LINEUPS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>LINEUPS</Text>
              <View style={styles.dashedLine} />
            </View>
            
            <View style={styles.formationGrid}>
              {Object.values(FORMATIONS).map((form) => {
                const isSelected = preferredFormation === form.name as FormationId;
                
                return (
                  <TouchableOpacity
                    key={`form-${form.name}`}
                    style={styles.formationCardWrapper}
                    onPress={() => setPreferredFormation(form.name as FormationId)}
                    activeOpacity={0.9}
                  >
                    <View style={[
                      styles.formationCardShadow, 
                      !isSelected && { backgroundColor: '#1c1b1b' }
                    ]} />
                    <View style={[
                      styles.formationCard,
                      isSelected ? styles.formationCardSelected : styles.formationCardInactive
                    ]}>
                      <View style={styles.rimLight} />
                      
                      <MiniPitch formationId={form.name} isSelected={isSelected} />
                      
                      <View style={styles.formationInfo}>
                        <View>
                          <Text style={[styles.formationName, !isSelected && { color: '#3c4b35' }]}>
                            {form.name}
                          </Text>
                          <Text style={[styles.formationSubtitle, !isSelected && { color: '#3c4b35' }]}>
                            {form.name === '1-3-1' ? 'BALANCED' : form.name === '1-2-1-1' ? 'DIAMOND' : form.name === '1-4' ? 'ATTACK' : 'SQUARE'}
                          </Text>
                        </View>
                        
                        {isSelected ? (
                          <View style={styles.formationSelectedBadge}>
                            <Ionicons name="checkmark" size={12} color="#106e00" style={{fontWeight: 'bold', marginRight: 4}} />
                            <Text style={styles.formationSelectedText}>SELECTED</Text>
                          </View>
                        ) : (
                          <View style={styles.formationEquipBadge}>
                            <Text style={styles.formationEquipText}>EQUIP</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1c1b1b',
    textTransform: 'uppercase',
    zIndex: 10,
  },
  dashedLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#1c1b1b',
    borderRadius: 2,
    opacity: 0.2,
    marginLeft: 12,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  teamCard: {
    alignItems: 'center',
    width: 100,
  },
  teamChapaContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  teamChapaSelected: {
    borderWidth: 6,
    borderColor: '#39ff14',
  },
  teamChapaLocked: {
    opacity: 0.5,
  },
  rimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    zIndex: 1,
  },
  teamChapaImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamColorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1c1b1b',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#39ff14',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lockedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eae7e7',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  teamNameBox: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  teamNameText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1c1b1b',
    textTransform: 'uppercase',
  },

  formationGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  formationCardWrapper: {
    position: 'relative',
  },
  formationCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
  },
  formationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#1c1b1b',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  formationCardSelected: {
    backgroundColor: '#fcd400',
  },
  formationCardInactive: {
    backgroundColor: '#f0eded',
  },
  miniPitch: {
    width: 80,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1c1b1b',
    position: 'relative',
    overflow: 'hidden',
    marginRight: 16,
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#ffffff',
    opacity: 0.5,
    transform: [{ translateY: -1 }],
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    opacity: 0.5,
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  pitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  pitchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1c1b1b',
  },
  formationInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },
  formationName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1c1b1b',
    textTransform: 'uppercase',
  },
  formationSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#c00100',
    marginTop: -4,
  },
  formationSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1c1b1b',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  formationSelectedText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#106e00',
  },
  formationEquipBadge: {
    backgroundColor: '#eae7e7',
    borderWidth: 2,
    borderColor: '#3c4b35',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  formationEquipText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3c4b35',
  },
});
