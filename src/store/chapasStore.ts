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
}

interface ChapasState {
  unlockedTeams: TeamId[];
  unlockedArenas: ArenaId[];
  wins: number;
  coins: number;
  preferredTeam: TeamId;
  preferredFormation: FormationId;
  user: UserProfile | null;
  addWin: () => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
  unlockTeam: (teamId: TeamId) => void;
  unlockArena: (arenaId: ArenaId) => void;
  setPreferredTeam: (teamId: TeamId) => void;
  setPreferredFormation: (formationId: FormationId) => void;
  resetProgress: () => void;
  initializeAuth: () => void;
}

export const useChapasStore = create<ChapasState>()(
  persist(
    (set, get) => ({
      unlockedTeams: ['spain', 'england'],
      unlockedArenas: ['usa'],
      wins: 0,
      coins: 500,
      preferredTeam: 'spain',
      preferredFormation: '1-2-1-1',
      user: null,

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

      resetProgress: () => set((state) => {
        const defaults = { unlockedTeams: ['spain', 'england'] as TeamId[], unlockedArenas: ['usa'] as ArenaId[], wins: 0, coins: 500, preferredTeam: 'spain' as TeamId, preferredFormation: '1-2-1-1' as FormationId };
        if (state.user) updateDoc(doc(db, 'users', state.user.id), defaults).catch(console.error);
        return defaults;
      }),

      initializeAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const data = userSnap.data();
              set({ 
                user: { id: firebaseUser.uid, username: data.username, tag: data.tag },
                coins: data.coins ?? get().coins,
                wins: data.wins ?? get().wins,
                unlockedTeams: data.unlockedTeams ?? get().unlockedTeams,
                unlockedArenas: data.unlockedArenas ?? get().unlockedArenas,
                preferredTeam: data.preferredTeam ?? get().preferredTeam,
                preferredFormation: data.preferredFormation ?? get().preferredFormation
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
                preferredFormation: get().preferredFormation
              };
              
              await setDoc(userRef, newUserProfile);
              set({ user: { id: firebaseUser.uid, username, tag: `#${randomTag}` } });
            }
          } else {
            // Not logged in, sign in anonymously
            signInAnonymously(auth).catch(console.error);
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
