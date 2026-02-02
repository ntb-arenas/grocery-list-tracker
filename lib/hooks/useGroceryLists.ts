import { useEffect, useState } from 'react';
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
} from 'firebase/firestore';

export interface GroceryItem {
  id: string; // combined id
  origId: string;
  collection: 'global' | 'list';
  name: string;
  completed: boolean;
  createdAt: any;
}

export default function useGroceryLists(initialCode?: string) {
  const [globalItems, setGlobalItems] = useState<GroceryItem[]>([]);
  const [listItems, setListItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listCode, setListCode] = useState<string | null>(initialCode ?? null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribes: Array<() => void> = [];

    const qGlobal = query(collection(db, 'groceryItems'), orderBy('createdAt', 'desc'));
    const unsubGlobal = onSnapshot(
      qGlobal,
      (snapshot) => {
        const newGlobal: GroceryItem[] = [];
        snapshot.forEach((d) => {
          const data: any = d.data();
          newGlobal.push({
            id: `global:${d.id}`,
            origId: d.id,
            collection: 'global',
            name: data.name,
            completed: data.completed,
            createdAt: data.createdAt,
          });
        });
        setGlobalItems(newGlobal);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore global subscribe error', error);
        setLoading(false);
      },
    );
    unsubscribes.push(() => unsubGlobal());

    if (listCode) {
      const qList = query(collection(db, 'lists', listCode, 'items'), orderBy('createdAt', 'desc'));
      const unsubList = onSnapshot(
        qList,
        (snapshot) => {
          const newList: GroceryItem[] = [];
          snapshot.forEach((d) => {
            const data: any = d.data();
            newList.push({
              id: `list:${listCode}:${d.id}`,
              origId: d.id,
              collection: 'list',
              name: data.name,
              completed: data.completed,
              createdAt: data.createdAt,
            });
          });
          setListItems(newList);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore list subscribe error', error);
          setLoading(false);
        },
      );
      unsubscribes.push(() => unsubList());
    }

    return () => unsubscribes.forEach((u) => u());
  }, [listCode]);

  useEffect(() => {
    const saved = localStorage.getItem('groceryListCode');
    if (saved) setListCode(saved);
  }, []);

  useEffect(() => {
    if (!listCode) setListItems([]);
  }, [listCode]);

  function generateCode(len = 8) {
    return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
  }

  async function claimList(code: string, name?: string) {
    setClaiming(true);
    try {
      const docRef = doc(db, 'lists', code);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { name: name || code, createdAt: serverTimestamp() });
      }
      localStorage.setItem('groceryListCode', code);
      setListCode(code);
    } catch (err) {
      console.error('Error claiming list:', err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }

  function parseCombinedId(combinedId: string) {
    if (combinedId.startsWith('global:')) return { type: 'global' as const, origId: combinedId.slice('global:'.length) };
    if (combinedId.startsWith('list:')) {
      const parts = combinedId.split(':');
      return { type: 'list' as const, listCode: parts[1], origId: parts.slice(2).join(':') };
    }
    return { type: 'global' as const, origId: combinedId };
  }

  function getDocRefForCombinedId(combinedId: string) {
    const p = parseCombinedId(combinedId);
    if (p.type === 'global') return doc(db, 'groceryItems', p.origId);
    return doc(db, 'lists', p.listCode!, 'items', p.origId);
  }

  async function addItemToActive(text: string) {
    if (!text.trim()) return;
    if (listCode) {
      await addDoc(collection(db, 'lists', listCode, 'items'), { name: text, completed: false, createdAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'groceryItems'), { name: text, completed: false, createdAt: serverTimestamp() });
    }
  }

  async function markItems(combinedIds: string[], completed: boolean) {
    await Promise.all(combinedIds.map((id) => updateDoc(getDocRefForCombinedId(id), { completed })));
  }

  async function deleteItems(combinedIds: string[]) {
    await Promise.all(combinedIds.map((id) => deleteDoc(getDocRefForCombinedId(id))));
  }

  async function toggleItem(combinedId: string, currentStatus: boolean) {
    await updateDoc(getDocRefForCombinedId(combinedId), { completed: !currentStatus });
  }

  function getCombinedItems() {
    const merged = [...listItems, ...globalItems];
    merged.sort((a, b) => {
      const at = a.createdAt?.seconds ?? a.createdAt ?? 0;
      const bt = b.createdAt?.seconds ?? b.createdAt ?? 0;
      return bt - at;
    });
    return merged;
  }

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
    markItems,
    deleteItems,
    toggleItem,
    getCombinedItems,
  } as const;
}
