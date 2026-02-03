import { db } from '../firebase';
import { getLocalStorageItem, setLocalStorageItem } from './storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Checks if a specific list exists in Firebase.
 * @param listCode The list code to check
 * @returns true if the list exists, false otherwise
 */
export async function checkListExists(listCode: string): Promise<boolean> {
  try {
    const listRef = doc(db, 'lists', listCode);
    const listSnap = await getDoc(listRef);
    return listSnap.exists();
  } catch (error) {
    console.error('Error checking list existence:', error);
    return false;
  }
}

/**
 * Checks all localStorage personal list codes against Firebase.
 * Removes any code from localStorage that does not exist in Firebase.
 */
export async function syncLocalListsWithFirebase(): Promise<void> {
  try {
    const stored = getLocalStorageItem('personalListCodes');
    if (!stored) return;

    const codes: string[] = JSON.parse(stored);
    if (!codes.length) return;

    // Fetch all list codes from Firebase
    const firebaseListsSnap = await getDocs(collection(db, 'lists'));
    const firebaseCodes = new Set<string>();
    firebaseListsSnap.forEach((doc) => {
      firebaseCodes.add(doc.id);
    });

    // Filter out codes not in Firebase
    const validCodes = codes.filter((code) => firebaseCodes.has(code));
    if (validCodes.length !== codes.length) {
      setLocalStorageItem('personalListCodes', JSON.stringify(validCodes));
    }
  } catch (error) {
    console.error('Error syncing local lists with Firebase:', error);
  }
}
