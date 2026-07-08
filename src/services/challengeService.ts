import { db } from '../config/firebaseConfig';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';

export interface ChallengeData {
  id?: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  status: 'pending' | 'accepted' | 'declined' | 'timeout';
  matchId?: string;
  createdAt?: any;
}

/**
 * Envía un desafío a un amigo.
 * Retorna una función para cancelar el desafío.
 */
export const sendChallenge = async (
  challengerId: string,
  challengerName: string,
  challengedId: string,
  onAccepted: (matchId: string) => void,
  onDeclinedOrTimeout: () => void
): Promise<() => void> => {
  try {
    const challengeRef = await addDoc(collection(db, 'challenges'), {
      challengerId,
      challengerName,
      challengedId,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    let isDone = false;

    // Timeout de 30s
    const timeoutTimer = setTimeout(async () => {
      if (!isDone) {
        isDone = true;
        unsubscribe();
        await updateDoc(challengeRef, { status: 'timeout' }).catch(() => {});
        onDeclinedOrTimeout();
      }
    }, 30000);

    const unsubscribe = onSnapshot(challengeRef, (docSnap) => {
      if (isDone) return;
      const data = docSnap.data() as ChallengeData | undefined;
      if (data) {
        if (data.status === 'accepted' && data.matchId) {
          isDone = true;
          clearTimeout(timeoutTimer);
          unsubscribe();
          onAccepted(data.matchId);
        } else if (data.status === 'declined' || data.status === 'timeout') {
          isDone = true;
          clearTimeout(timeoutTimer);
          unsubscribe();
          onDeclinedOrTimeout();
        }
      }
    });

    return () => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timeoutTimer);
        unsubscribe();
        updateDoc(challengeRef, { status: 'declined' }).catch(() => {});
      }
    };
  } catch (error) {
    console.error("Error sending challenge:", error);
    onDeclinedOrTimeout();
    return () => {};
  }
};

/**
 * Escucha desafíos entrantes para el usuario actual.
 */
export const listenForIncomingChallenges = (
  myUserId: string,
  onChallengeReceived: (challenge: ChallengeData) => void
) => {
  const q = query(
    collection(db, 'challenges'),
    where('challengedId', '==', myUserId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data() as ChallengeData;
        
        onChallengeReceived({
          ...data,
          id: change.doc.id
        });
      }
    });
  });
};

/**
 * Responde a un desafío.
 */
export const respondToChallenge = async (challengeId: string, accept: boolean, matchId?: string) => {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    if (accept && matchId) {
      await updateDoc(challengeRef, {
        status: 'accepted',
        matchId
      });
    } else {
      await updateDoc(challengeRef, {
        status: 'declined'
      });
    }
  } catch (error) {
    console.error("Error responding to challenge:", error);
  }
};
