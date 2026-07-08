import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { TeamId } from '../data/chapasData';

export type MatchStatus = 'waiting' | 'playing' | 'cancelled';

export interface MatchData {
  id?: string;
  status: MatchStatus;
  player1: string;
  p1Team: TeamId;
  player2?: string;
  p2Team?: TeamId;
  fieldId: string;
  createdAt: any;
}

/**
 * Busca una partida en estado 'waiting'. Si la encuentra, se une a ella.
 * Si no la encuentra, crea una y espera 6 segundos.
 */
export const findOrCreateMatch = async (
  userId: string, 
  preferredTeam: TeamId,
  fieldId: string,
  onMatchFound: (matchId: string, opponentTeam: TeamId) => void,
  onTimeout: () => void
): Promise<() => void> => {
  try {
    const matchesRef = collection(db, 'matches');
    
    // 1. Buscar partida disponible en el mismo campo
    const q = query(matchesRef, where('status', '==', 'waiting'), where('fieldId', '==', fieldId));
    const querySnapshot = await getDocs(q);
    
    let availableMatch: MatchData | null = null;
    let availableMatchId = '';

    querySnapshot.forEach((doc) => {
      // Avoid joining our own ghost matches if any
      if (doc.data().player1 !== userId && !availableMatch) {
        availableMatch = doc.data() as MatchData;
        availableMatchId = doc.id;
      }
    });

    if (availableMatch) {
      // UNIRSE A PARTIDA EXISTENTE
      await updateDoc(doc(db, 'matches', availableMatchId), {
        status: 'playing',
        player2: userId,
        p2Team: preferredTeam
      });
      
      // Todo listo, avisamos a la UI para que navegue al juego
      // @ts-ignore
      onMatchFound(availableMatchId, availableMatch.p1Team);
      return () => {}; // No cleanup needed
    } else {
      // NO HAY PARTIDAS. CREAR UNA.
      const newMatchRef = await addDoc(matchesRef, {
        status: 'waiting',
        player1: userId,
        p1Team: preferredTeam,
        fieldId: fieldId,
        createdAt: serverTimestamp()
      });

      let timeoutReached = false;
      
      // 6 segundos de timeout
      const timeout = setTimeout(async () => {
        timeoutReached = true;
        unsubscribe();
        // Borrar la sala para que no se quede colgada
        await deleteDoc(newMatchRef).catch(() => {});
        onTimeout();
      }, 6000);

      // Escuchar si alguien se une
      const unsubscribe = onSnapshot(newMatchRef, (docSnap) => {
        if (timeoutReached) return;
        
        const data = docSnap.data() as MatchData | undefined;
        if (data && data.status === 'playing' && data.player2) {
          clearTimeout(timeout);
          unsubscribe();
          onMatchFound(docSnap.id, data.p2Team as TeamId);
        }
      }, (error) => {
        // En caso de que se pierdan los permisos de snapshot
        if (!timeoutReached) {
          clearTimeout(timeout);
          unsubscribe();
          onTimeout();
        }
      });

      // Devolver una función para cancelar manualmente si el usuario se arrepiente
      return () => {
        if (!timeoutReached) {
          clearTimeout(timeout);
          unsubscribe();
          deleteDoc(newMatchRef).catch(() => {});
        }
      };
    }
  } catch (error) {
    console.warn("Matchmaking failed due to network or permission error:", error);
    // Timeout inmediato para fallback contra IA
    onTimeout();
    return () => {};
  }
};
