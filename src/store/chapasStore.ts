import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeamId, FormationId, ArenaId } from '../data/chapasData';
import { auth, db, signInAnonymously, onAuthStateChanged } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  username: string;
  tag: string;
  profilePictureUrl?: string | null;
}

export type TournamentRound = 'octavos' | 'cuartos' | 'semis' | 'final' | 'champion';

export interface TournamentMatch {
  id: string;
  team1: TeamId | null;
  team2: TeamId | null;
  score1?: number;
  score2?: number;
  winner?: TeamId;
  isPlayerMatch?: boolean;
}

export interface TournamentState {
  isActive: boolean;
  round: TournamentRound;
  playerTeam: TeamId | null;
  bracket: {
    octavos: TournamentMatch[];
    cuartos: TournamentMatch[];
    semis: TournamentMatch[];
    final: TournamentMatch[];
  };
}

interface ChapasState {
  unlockedTeams: TeamId[];
  unlockedArenas: ArenaId[];
  wins: number;
  coins: number;
  level: number;
  xp: number;
  preferredTeam: TeamId;
  preferredFormation: FormationId;
  user: UserProfile | null;
  friends: string[];
  tournament: TournamentState;
  addWin: () => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  unlockTeam: (teamId: TeamId) => void;
  unlockArena: (arenaId: ArenaId) => void;
  setPreferredTeam: (teamId: TeamId) => void;
  setPreferredFormation: (formationId: FormationId) => void;
  setUsername: (username: string) => void;
  setProfilePicture: (url: string) => void;
  addFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
  resetProgress: () => void;
  initializeAuth: () => void;
  startTournament: (playerTeam: TeamId, bracket: TournamentState['bracket']) => void;
  advanceTournament: (winner: TeamId, newBracket: TournamentState['bracket']) => void;
  abandonTournament: () => void;
}

export const useChapasStore = create<ChapasState>()(
  persist(
    (set, get) => ({
      unlockedTeams: ['spain', 'england'],
      unlockedArenas: ['usa'],
      wins: 0,
      coins: 500,
      level: 1,
      xp: 0,
      preferredTeam: 'spain',
      preferredFormation: '1-2-1-1',
      user: null,
      friends: [],
      tournament: {
        isActive: false,
        round: 'octavos',
        playerTeam: null,
        bracket: { octavos: [], cuartos: [], semis: [], final: [] }
      },

      startTournament: (playerTeam, bracket) => set({
        tournament: {
          isActive: true,
          round: 'octavos',
          playerTeam,
          bracket
        }
      }),

      advanceTournament: (winner, currentBracket) => set((state) => {
        const t = state.tournament;
        if (!t.isActive) return state;

        let nextRound: TournamentRound = 'octavos';
        let newBracket = { ...currentBracket };
        
        // Simular siguiente ronda
        const simMatch = (m1: TournamentMatch, m2: TournamentMatch, nextId: string, isPlayer: boolean) => {
          const w1 = m1.isPlayerMatch ? winner : (Math.random() > 0.5 ? m1.team1 : m1.team2);
          const w2 = m2.isPlayerMatch ? winner : (Math.random() > 0.5 ? m2.team1 : m2.team2);
          return {
            id: nextId,
            team1: w1,
            team2: w2,
            isPlayerMatch: isPlayer
          } as TournamentMatch;
        };

        if (t.round === 'octavos') {
          nextRound = 'cuartos';
          newBracket.cuartos = [];
          for (let i=0; i<4; i++) {
            const m1 = currentBracket.octavos[i*2];
            const m2 = currentBracket.octavos[i*2+1];
            newBracket.cuartos.push(simMatch(m1, m2, `cuartos-${i}`, !!m1.isPlayerMatch || !!m2.isPlayerMatch));
          }
        }
        else if (t.round === 'cuartos') {
          nextRound = 'semis';
          newBracket.semis = [];
          for (let i=0; i<2; i++) {
            const m1 = currentBracket.cuartos[i*2];
            const m2 = currentBracket.cuartos[i*2+1];
            newBracket.semis.push(simMatch(m1, m2, `semis-${i}`, !!m1.isPlayerMatch || !!m2.isPlayerMatch));
          }
        }
        else if (t.round === 'semis') {
          nextRound = 'final';
          newBracket.final = [];
          const m1 = currentBracket.semis[0];
          const m2 = currentBracket.semis[1];
          newBracket.final.push(simMatch(m1, m2, `final-0`, !!m1.isPlayerMatch || !!m2.isPlayerMatch));
        }
        else if (t.round === 'final') {
          nextRound = 'champion';
        }

        return {
          tournament: {
            ...t,
            round: nextRound,
            bracket: newBracket
          }
        };
      }),

      abandonTournament: () => set({
        tournament: {
          isActive: false,
          round: 'octavos',
          playerTeam: null,
          bracket: { octavos: [], cuartos: [], semis: [], final: [] }
        }
      }),

      addFriend: (userId) => set((state) => {
        if (state.friends.includes(userId)) return state;
        const newFriends = [...state.friends, userId];
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { friends: newFriends }).catch(console.error);
        return { friends: newFriends };
      }),

      removeFriend: (userId) => set((state) => {
        const newFriends = state.friends.filter(id => id !== userId);
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { friends: newFriends }).catch(console.error);
        return { friends: newFriends };
      }),

      addWin: () => set((state) => {
        const newWins = state.wins + 1;
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { wins: newWins }).catch(console.error);
        return { wins: newWins };
      }),

      addCoins: (amount) => set((state) => {
        const newCoins = state.coins + amount;
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { coins: newCoins }).catch(console.error);
        return { coins: newCoins };
      }),

      deductCoins: (amount) => set((state) => {
        const newCoins = Math.max(0, state.coins - amount);
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { coins: newCoins }).catch(console.error);
        return { coins: newCoins };
      }),

      addXp: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let xpNeeded = newLevel * 500;
        
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
          xpNeeded = newLevel * 500;
        }

        if (state.user) updateDoc(doc(db, 'users', state.user.id), { xp: newXp, level: newLevel }).catch(console.error);
        return { xp: newXp, level: newLevel };
      }),

      unlockTeam: (teamId) => set((state) => {
        if (state.unlockedTeams.includes(teamId)) return state;
        const newTeams = [...state.unlockedTeams, teamId];
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { unlockedTeams: newTeams }).catch(console.error);
        return { unlockedTeams: newTeams };
      }),

      unlockArena: (arenaId) => set((state) => {
        if (state.unlockedArenas.includes(arenaId)) return state;
        const newArenas = [...state.unlockedArenas, arenaId];
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { unlockedArenas: newArenas }).catch(console.error);
        return { unlockedArenas: newArenas };
      }),

      setPreferredTeam: (teamId) => set((state) => {
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { preferredTeam: teamId }).catch(console.error);
        return { preferredTeam: teamId };
      }),

      setPreferredFormation: (formationId) => set((state) => {
        if (state.user) updateDoc(doc(db, 'users', state.user.id), { preferredFormation: formationId }).catch(console.error);
        return { preferredFormation: formationId };
      }),

      setUsername: (username) => set((state) => {
        if (state.user) {
          const newUser = { ...state.user, username };
          updateDoc(doc(db, 'users', state.user.id), { username }).catch(console.error);
          return { user: newUser };
        }
        return state;
      }),

      setProfilePicture: (url) => set((state) => {
        if (state.user) {
          const newUser = { ...state.user, profilePictureUrl: url };
          updateDoc(doc(db, 'users', state.user.id), { profilePictureUrl: url }).catch(console.error);
          return { user: newUser };
        }
        return state;
      }),

      resetProgress: () => set((state) => {
        const defaults = { unlockedTeams: ['spain', 'england'] as TeamId[], unlockedArenas: ['usa'] as ArenaId[], wins: 0, coins: 500, preferredTeam: 'spain' as TeamId, preferredFormation: '1-2-1-1' as FormationId };
        if (state.user) updateDoc(doc(db, 'users', state.user.id), defaults).catch(console.error);
        return defaults;
      }),

      initializeAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const userRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                const data = userSnap.data();
                set({ 
                  user: { id: firebaseUser.uid, username: data.username || 'Player', tag: data.tag || '#0000' },
                  coins: data.coins ?? get().coins,
                  wins: data.wins ?? get().wins,
                  unlockedTeams: data.unlockedTeams ?? get().unlockedTeams,
                  unlockedArenas: data.unlockedArenas ?? get().unlockedArenas,
                  preferredTeam: data.preferredTeam ?? get().preferredTeam,
                  preferredFormation: data.preferredFormation ?? get().preferredFormation,
                  friends: data.friends ?? get().friends

                });
              } else {
                // Create new user profile in Firestore
                const randomTag = Math.floor(1000 + Math.random() * 9000).toString();
                const username = `Guest#${randomTag}`;
                
                const newUserProfile = {
                  id: firebaseUser.uid,
                  username,
                  tag: `#${randomTag}`,
                  coins: get().coins,
                  wins: get().wins,
                  unlockedTeams: get().unlockedTeams,
                  unlockedArenas: get().unlockedArenas,
                  preferredTeam: get().preferredTeam,
                  preferredFormation: get().preferredFormation,
                  friends: get().friends
                };
                
                await setDoc(userRef, newUserProfile);
                set({ user: { id: firebaseUser.uid, username, tag: `#${randomTag}` } });
              }
            } catch (error) {
              console.error("Error fetching/setting user profile:", error);
              // Fallback para asegurar que 'user' nunca es null si hay login
              set({ user: { id: firebaseUser.uid, username: 'Guest', tag: '#0000' } });
            }
          } else {
            // Not logged in, sign in anonymously
            try {
              await signInAnonymously(auth);
            } catch (error) {
              console.error("Error en signInAnonymously:", error);
              // Fallback local si falla Firebase totalmente
              const localId = 'local_' + Math.random().toString(36).substring(2, 9);
              set({ user: { id: localId, username: 'LocalGuest', tag: '#9999' } });
            }
          }
        });
      }
    }),
    {
      name: 'chapas-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
