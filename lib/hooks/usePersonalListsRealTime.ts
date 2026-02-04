import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { setLocalStorageItem, getLocalStorageItem } from '@/lib/utils/storage';

/**
 * Hook that keeps personal list codes in sync with Firebase in real-time.
 * It listens to the 'lists' collection and maintains localStorage with valid codes.
 */
export function usePersonalListsRealTime() {
  useEffect(() => {
    // Create a real-time listener for the lists collection
    const listsQuery = query(collection(db, 'lists'));

    const unsubscribe = onSnapshot(
      listsQuery,
      (snapshot) => {
        // Get all existing list codes from Firebase
        const firebaseListCodes = snapshot.docs.map((doc) => doc.id);

        // Get stored personal list codes
        const stored = getLocalStorageItem('personalListCodes');
        const storedCodes = stored ? JSON.parse(stored) : [];

        // Filter stored codes to only keep those that exist in Firebase
        const validCodes = storedCodes.filter((code: string) =>
          firebaseListCodes.includes(code)
        );

        // Update localStorage if codes changed
        if (validCodes.length !== storedCodes.length) {
          setLocalStorageItem('personalListCodes', JSON.stringify(validCodes));
          // Dispatch custom event to notify hooks of the change
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('personalListsUpdated'));
          }
        }
      },
      (error) => {
        console.error('Error listening to lists:', error);
      }
    );

    return () => unsubscribe();
  }, []);
}
