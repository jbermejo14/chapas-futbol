import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useChapasStore } from '../store/chapasStore';
import { TEAMS, FORMATIONS, TeamId, FormationId } from '../data/chapasData';
import { ChapaModular } from '../components/ChapaModular';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, wins, coins } = useChapasStore();

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSave} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {user ? (
            <View style={styles.userInfoCard}>
              <Text style={styles.usernameText}>{user.username}</Text>
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
            </View>
          ) : (
            <Text style={styles.description}>Cargando perfil...</Text>
          )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
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
  userInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  usernameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#CCC',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'uppercase',
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
