import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, FORMATIONS, FIELDS, TeamId, FormationId, FieldId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export const SetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode } = route.params;
  const { unlockedTeams, wins, preferredTeam, preferredFormation } = useChapasStore();

  const [selectedField, setSelectedField] = useState<FieldId>('generic');

  const [p1Team, setP1Team] = useState<TeamId>(preferredTeam);
  const [p1Formation, setP1Formation] = useState<FormationId>(preferredFormation);

  const [p2Team, setP2Team] = useState<TeamId>('brazil');
  const [p2Formation, setP2Formation] = useState<FormationId>('1-2-1-1');

  const handleStart = () => {
    navigation.navigate('Game', {
      mode,
      p1Team,
      p1Formation,
      p2Team,
      p2Formation,
      fieldId: selectedField,
    });
  };

  const renderFieldSelector = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Object.values(FIELDS).map((field) => {
            const isSelected = selectedField === field.id;
            
            return (
              <TouchableOpacity
                key={`field-${field.id}`}
                style={[
                  styles.card,
                  styles.fieldCard,
                  { backgroundColor: field.color },
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => setSelectedField(field.id)}
              >
                {field.image && (
                  <Image source={field.image} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} resizeMode="cover" />
                )}
                {!field.image && (
                  <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, { opacity: 0.5 }]}>
                    <View style={{ flex: 1, backgroundColor: field.stripeColor }} />
                    <View style={{ flex: 1, backgroundColor: 'transparent' }} />
                    <View style={{ flex: 1, backgroundColor: field.stripeColor }} />
                  </View>
                )}
                <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                <Text style={styles.cardTextHighlight}>{field.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTeamSelector = (
    playerNum: 1 | 2,
    selectedTeam: TeamId,
    setTeam: (t: TeamId) => void
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Equipo {playerNum === 1 ? 'Jugador 1' : (mode === '1P' ? 'IA' : 'Jugador 2')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Object.values(TEAMS).map((team) => {
            const isUnlocked = unlockedTeams.includes(team.id);
            const isSelected = selectedTeam === team.id;
            
            return (
              <TouchableOpacity
                key={`team-${playerNum}-${team.id}`}
                style={[
                  styles.card,
                  { backgroundColor: isUnlocked ? team.colorSecondary : '#333' },
                  isSelected && styles.cardSelected,
                  !isUnlocked && styles.cardLocked
                ]}
                onPress={() => isUnlocked && setTeam(team.id)}
                disabled={!isUnlocked}
              >
                {team.svg ? (
                  <View style={[{ marginBottom: 8 }, !isUnlocked && { opacity: 0.5 }]}>
                    <ChapaModular size={40} FlagSvg={team.svg} fallbackColor={team.colorSecondary} />
                  </View>
                ) : team.image ? (
                  <Image source={team.image} style={[styles.teamImagePreview, !isUnlocked && { opacity: 0.5 }]} resizeMode="contain" />
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

  const renderFormationSelector = (
    playerNum: 1 | 2,
    selectedFormation: FormationId,
    setFormation: (f: FormationId) => void
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Formación {playerNum === 1 ? 'J1' : (mode === '1P' ? 'IA' : 'J2')}
        </Text>
        <View style={styles.formationGrid}>
          {Object.values(FORMATIONS).map((form) => {
            const isSelected = selectedFormation === form.name as FormationId;
            return (
              <TouchableOpacity
                key={`form-${playerNum}-${form.name}`}
                style={[styles.formationButton, isSelected && styles.formationButtonSelected]}
                onPress={() => setFormation(form.name as FormationId)}
              >
                <Text style={[styles.formationText, isSelected && styles.formationTextSelected]}>
                  {form.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Preparación</Text>
      <Text style={styles.subtitle}>Victorias acumuladas: {wins}</Text>

      {renderFieldSelector()}
      <View style={styles.divider} />

      {renderTeamSelector(1, p1Team, setP1Team)}
      {renderFormationSelector(1, p1Formation, setP1Formation)}

      <View style={styles.divider} />

      {renderTeamSelector(2, p2Team, setP2Team)}
      {renderFormationSelector(2, p2Formation, setP2Formation)}

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>COMENZAR PARTIDO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    paddingBottom: 10,
  },
  card: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  fieldCard: {
    width: 140,
    height: 90,
  },
  cardSelected: {
    borderColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },
  cardLocked: {
    opacity: 0.5,
  },
  teamColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  teamImagePreview: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  cardText: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  cardTextHighlight: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 2,
  },
  lockedText: {
    color: '#FF4444',
    fontSize: 10,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  formationButton: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  formationButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(244, 208, 63, 0.2)', // Soft gold
  },
  formationText: {
    color: colors.text,
    fontSize: 14,
  },
  formationTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 2,
    backgroundColor: colors.surface,
    marginVertical: 15,
  },
  startButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonText: {
    color: '#1a472a',
    fontSize: 18,
    fontWeight: '900',
  },
});
