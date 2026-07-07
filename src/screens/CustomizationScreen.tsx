import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, FORMATIONS, FormationId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';

export const CustomizationScreen: React.FC = () => {
  const { preferredTeam, preferredFormation, setPreferredTeam, setPreferredFormation, unlockedTeams } = useChapasStore();

  const renderTeamSelector = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu Equipo Favorito</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Object.values(TEAMS).map((team) => {
            const isUnlocked = unlockedTeams.includes(team.id);
            const isSelected = preferredTeam === team.id;
            
            return (
              <TouchableOpacity
                key={`team-${team.id}`}
                style={[
                  styles.card,
                  { backgroundColor: isUnlocked ? team.colorSecondary : '#333' },
                  isSelected && styles.cardSelected,
                  !isUnlocked && styles.cardLocked
                ]}
                onPress={() => isUnlocked && setPreferredTeam(team.id)}
                disabled={!isUnlocked}
              >
                {team.svg ? (
                  <View style={[{ marginBottom: 8 }, !isUnlocked && { opacity: 0.5 }]}>
                    <ChapaModular size={40} FlagSvg={team.svg} fallbackColor={team.colorSecondary} />
                  </View>
                ) : (
                  <View style={[styles.teamColorPreview, { backgroundColor: team.colorPrimary }, !isUnlocked && { opacity: 0.5 }]} />
                )}
                
                <Text style={styles.cardText}>{team.name}</Text>
                {!isUnlocked && (
                  <Text style={styles.lockedText}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFormationSelector = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu Alineación Favorita</Text>
        <View style={styles.formationGrid}>
          {Object.values(FORMATIONS).map((form) => {
            const isSelected = preferredFormation === form.name as FormationId;
            return (
              <TouchableOpacity
                key={`form-${form.name}`}
                style={[
                  styles.formationCard,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => setPreferredFormation(form.name as FormationId)}
              >
                <Text style={styles.cardText}>{form.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.description}>
            Este equipo y formación se usarán automáticamente cuando juegues torneos o partidas rápidas.
          </Text>

          {renderTeamSelector()}
          {renderFormationSelector()}

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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  card: {
    width: 100,
    height: 120,
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: '#FFD700',
    transform: [{ scale: 1.05 }],
  },
  cardLocked: {
    opacity: 0.7,
  },
  lockedText: {
    fontSize: 16,
    marginTop: 5,
  },
  cardText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  teamColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  formationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  formationCard: {
    width: '45%',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
});
