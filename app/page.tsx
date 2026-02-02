'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import InstallPrompt from './components/InstallPrompt';

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: any;
}

const STORAGE_KEY = 'grocery-items';

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<'firebase' | 'local'>('local');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const USE_FIREBASE = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    console.log('🔥 Firebase check:', {
      USE_FIREBASE,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    if (!USE_FIREBASE) {
      console.log('📦 Using localStorage mode');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      setLoading(false);
      setStorageMode('local');
      return;
    }

    // Try Firebase first
    console.log('☁️ Attempting Firebase connection...');
    setStorageMode('firebase');
    const q = query(collection(db, 'groceryItems'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData: GroceryItem[] = [];
        snapshot.forEach((doc) => {
          itemsData.push({ id: doc.id, ...doc.data() } as GroceryItem);
        });
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error, falling back to localStorage:', error);
        setStorageMode('local');
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Save to localStorage whenever items change (for local mode)
  useEffect(() => {
    if (storageMode === 'local' && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, storageMode, loading]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    if (storageMode === 'local') {
      const newItemObj: GroceryItem = {
        id: Date.now().toString(),
        name: newItem,
        completed: false,
        createdAt: Date.now(),
      };
      setItems([newItemObj, ...items]);
      setNewItem('');
      return;
    }

    try {
      await addDoc(collection(db, 'groceryItems'), {
        name: newItem,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please check your Firebase configuration.');
    }
  };

  const toggleItem = async (id: string, completed: boolean) => {
    if (storageMode === 'local') {
      setItems(items.map((item) => (item.id === id ? { ...item, completed: !completed } : item)));
      return;
    }

    try {
      await updateDoc(doc(db, 'groceryItems', id), {
        completed: !completed,
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (storageMode === 'local') {
      setItems(items.filter((item) => item.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, 'groceryItems', id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const markSelectedAsBought = async () => {
    if (selectedItems.size === 0) return;

    if (storageMode === 'local') {
      setItems(items.map((item) => (selectedItems.has(item.id) ? { ...item, completed: true } : item)));
      setSelectedItems(new Set());
      return;
    }

    try {
      const promises = Array.from(selectedItems).map((id) => updateDoc(doc(db, 'groceryItems', id), { completed: true }));
      await Promise.all(promises);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error marking items as bought:', error);
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    if (storageMode === 'local') {
      setItems(items.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      return;
    }

    try {
      const promises = Array.from(selectedItems).map((id) => deleteDoc(doc(db, 'groceryItems', id)));
      await Promise.all(promises);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  return (
    <>
      <InstallPrompt />
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900'>
        <div className='container mx-auto px-4 py-8 max-w-2xl'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-1'>Groceries</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>{storageMode === 'firebase' ? '☁️ Synced' : '📱 Local'}</p>
          </div>

          {/* Add Item */}
          <form onSubmit={addItem} className='mb-6'>
            <div className='relative'>
              <input
                type='text'
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder='Add item...'
                className='w-full px-4 py-3.5 text-base bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400'
              />
              <button
                type='submit'
                className='absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full transition-all flex items-center justify-center font-bold text-lg'
              >
                +
              </button>
            </div>
          </form>

          {/* Select All & Actions */}
          {items.length > 0 && (
            <div className='mb-4'>
              {selectedItems.size === 0 ? (
                <button
                  onClick={toggleSelectAll}
                  className='text-sm text-blue-500 hover:text-blue-600 active:text-blue-700 font-medium'
                >
                  Select all
                </button>
              ) : (
                <div className='flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl'>
                  <button onClick={toggleSelectAll} className='text-sm text-blue-600 dark:text-blue-400 font-medium'>
                    {selectedItems.size === items.length ? 'Deselect all' : `${selectedItems.size} selected`}
                  </button>
                  <div className='flex-1'></div>
                  <button
                    onClick={markSelectedAsBought}
                    className='px-4 py-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all'
                  >
                    ✓ Bought
                  </button>
                  <button
                    onClick={deleteSelectedItems}
                    className='px-4 py-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all'
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className='text-center py-16'>
              <div className='inline-block animate-spin rounded-full h-10 w-10 border-3 border-gray-300 border-t-blue-500'></div>
            </div>
          ) : items.length === 0 ? (
            <div className='text-center py-16'>
              <p className='text-lg text-gray-400 dark:text-gray-500'>No items yet</p>
              <p className='text-sm text-gray-400 dark:text-gray-600 mt-1'>Add your first item above</p>
            </div>
          ) : (
            <ul className='space-y-2'>
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                    selectedItems.has(item.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selectedItems.has(item.id) && (
                      <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-base transition-all ${
                      item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.completed && (
                    <span className='px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full'>
                      Bought
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
