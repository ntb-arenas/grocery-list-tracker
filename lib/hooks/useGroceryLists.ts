import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore';

export interface GroceryItem {
  id: string;
  origId: string;
  collection: 'global' | 'list';
  name: string;
  completed: boolean;
  createdAt: any;
}

export default function useGroceryLists(initialCode?: string) {
  const [listCode, setListCode] = useState<string | null>(initialCode ?? null);
  const [globalItems, setGlobalItems] = useState<GroceryItem[]>([]);
  const [listItems, setListItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    setListCode(initialCode ?? null);
  }, [initialCode]);

  // Firebase subscriptions
  useEffect(() => {
    setLoading(true);

    // clear the other mode immediately
    if (listCode) {
      setGlobalItems([]);
    } else {
      setListItems([]);
    }

    const unsubscribes: Array<() => void> = [];

    if (!listCode) {
      const globalQuery = query(collection(db, 'groceryItems'), orderBy('createdAt', 'desc'));
      const unsubGlobal = onSnapshot(
        globalQuery,
        (snapshot) => {
          const items: GroceryItem[] = snapshot.docs.map((d) => ({
            id: `global:${d.id}`,
            origId: d.id,
            collection: 'global',
            name: d.data().name,
            completed: d.data().completed,
            createdAt: d.data().createdAt,
          }));
          setGlobalItems(items);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore global error:', error);
          setLoading(false);
        }
      );
      unsubscribes.push(unsubGlobal);
    }

    if (listCode) {
      const listQuery = query(collection(db, 'lists', listCode, 'items'), orderBy('createdAt', 'desc'));
      const unsubList = onSnapshot(
        listQuery,
        (snapshot) => {
          const items: GroceryItem[] = snapshot.docs.map((d) => ({
            id: `list:${listCode}:${d.id}`,
            origId: d.id,
            collection: 'list',
            name: d.data().name,
            completed: d.data().completed,
            createdAt: d.data().createdAt,
          }));
          setListItems(items);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore list error:', error);
          setLoading(false);
        }
      );
      unsubscribes.push(unsubList);
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [listCode]);

  // Helper to parse combined IDs
  const parseCombinedId = useCallback((combinedId: string) => {
    if (combinedId.startsWith('global:')) {
      return { type: 'global' as const, origId: combinedId.slice(7) };
    }
    if (combinedId.startsWith('list:')) {
      const [, code, ...rest] = combinedId.split(':');
      return { type: 'list' as const, listCode: code, origId: rest.join(':') };
    }
    return { type: 'global' as const, origId: combinedId };
  }, []);

  // Get Firestore document reference
  const getDocRef = useCallback((combinedId: string) => {
    const parsed = parseCombinedId(combinedId);
    return parsed.type === 'global'
      ? doc(db, 'groceryItems', parsed.origId)
      : doc(db, 'lists', parsed.listCode, 'items', parsed.origId);
  }, [parseCombinedId]);

  // Generate random list code
  const generateCode = useCallback((length = 8) => {
    return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
  }, []);

  // Claim/create a list
  const claimList = useCallback(async (code: string, name?: string) => {
    setClaiming(true);
    try {
      const docRef = doc(db, 'lists', code);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          name: name || code,
          createdAt: serverTimestamp()
        });
      }
      setListCode(code);
    } catch (err) {
      console.error('Error claiming list:', err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }, []);

  // Add item to currently active collection (list or global)
  const addItemToActive = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const targetCollection = listCode
      ? collection(db, 'lists', listCode, 'items')
      : collection(db, 'groceryItems');
    await addDoc(targetCollection, {
      name: text.trim(),
      completed: false,
      createdAt: serverTimestamp()
    });
  }, [listCode]);

  // Explicit add to global
  const addItemToGlobal = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'groceryItems'), {
      name: text.trim(),
      completed: false,
      createdAt: serverTimestamp()
    });
  }, []);

  // Explicit add to list
  const addItemToList = useCallback(async (text: string) => {
    if (!text.trim() || !listCode) return;
    await addDoc(collection(db, 'lists', listCode, 'items'), {
      name: text.trim(),
      completed: false,
      createdAt: serverTimestamp()
    });
  }, [listCode]);

  // Batch mark items
  const markItems = useCallback(async (combinedIds: string[], completed: boolean) => {
    await Promise.all(
      combinedIds.map((id) => updateDoc(getDocRef(id), { completed }))
    );
  }, [getDocRef]);

  // Batch delete items
  const deleteItems = useCallback(async (combinedIds: string[]) => {
    await Promise.all(
      combinedIds.map((id) => deleteDoc(getDocRef(id)))
    );
  }, [getDocRef]);

  // Toggle single item
  const toggleItem = useCallback(async (combinedId: string, currentStatus: boolean) => {
    await updateDoc(getDocRef(combinedId), { completed: !currentStatus });
  }, [getDocRef]);

  // Get merged and sorted items
  const getCombinedItems = useCallback(() => {
    return [...listItems, ...globalItems].sort((a, b) => {
      const timeA = a.createdAt?.seconds ?? 0;
      const timeB = b.createdAt?.seconds ?? 0;
      return timeB - timeA;
    });
  }, [listItems, globalItems]);

  return {
    globalItems,
    listItems,
    loading,
    listCode,
    setListCode,
    claiming,
    generateCode,
    claimList,
    addItemToActive,
    addItemToGlobal,
    addItemToList,
    markItems,
    deleteItems,
    toggleItem,
    getCombinedItems,
  } as const;
}
