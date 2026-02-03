import { db } from '../firebase';
import { getLocalStorageItem, setLocalStorageItem } from './storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Cache for sync to prevent multiple calls
let syncPromise: Promise<void> | null = null;
let lastSyncTime = 0;
const SYNC_CACHE_DURATION = 60000; // 1 minute

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
 * Uses caching to prevent multiple simultaneous calls.
 */
export async function syncLocalListsWithFirebase(): Promise<void> {
  // Return cached promise if sync is already in progress
  if (syncPromise) {
    return syncPromise;
  }

  // Check if we synced recently
  const now = Date.now();
  if (now - lastSyncTime < SYNC_CACHE_DURATION) {
    return Promise.resolve();
  }

  syncPromise = (async () => {
    try {
      const stored = getLocalStorageItem('personalListCodes');
      if (!stored) return;

      const codes: string[] = JSON.parse(stored);
      if (!codes.length) return;

      // Check each code individually instead of fetching all lists
      const validationPromises = codes.map(async (code) => {
        const exists = await checkListExists(code);
        return exists ? code : null;
      });

      const results = await Promise.all(validationPromises);
      const validCodes = results.filter((code): code is string => code !== null);

      if (validCodes.length !== codes.length) {
        setLocalStorageItem('personalListCodes', JSON.stringify(validCodes));
      }

      lastSyncTime = Date.now();
    } catch (error) {
      console.error('Error syncing local lists with Firebase:', error);
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}
