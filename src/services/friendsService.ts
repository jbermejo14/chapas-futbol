import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { UserProfile } from '../store/chapasStore';

export const searchUsersByTag = async (tagQuery: string): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('tag', '==', tagQuery)
    );
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        username: data.username || 'Player',
        tag: data.tag || '#0000'
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

export const getFriendsProfiles = async (friendIds: string[]): Promise<UserProfile[]> => {
  if (friendIds.length === 0) return [];

  try {
    const friends: UserProfile[] = [];
    
    // Firestore 'in' query supports up to 10 items at a time
    for (let i = 0; i < friendIds.length; i += 10) {
      const chunk = friendIds.slice(i, i + 10);
      const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        friends.push({
          id: doc.id,
          username: data.username || 'Player',
          tag: data.tag || '#0000'
        });
      });
    }

    return friends;
  } catch (error) {
    console.error("Error fetching friend profiles:", error);
    return [];
  }
};
