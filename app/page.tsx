'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import InstallPrompt from './components/InstallPrompt';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

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
  const [isPWA, setIsPWA] = useState(false);

  // Check if running as PWA
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = (window.navigator as any).standalone || standalone;
    setIsPWA(isInStandaloneMode);
  }, []);

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

  // Utility: get item by id
  const getItemById = (id: string) => items.find(item => item.id === id);

  // Add item
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

  // Selection logic
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    setSelectedItems(selectedItems.size === items.length ? new Set() : new Set(items.map(item => item.id)));
  };

  // Bulk actions
  const markSelectedAsBought = async () => {
    if (selectedItems.size === 0) return;
    if (storageMode === 'local') {
      setItems(items.map((item) => (selectedItems.has(item.id) ? { ...item, completed: true } : item)));
      setSelectedItems(new Set());
      return;
    }
    try {
      await Promise.all(Array.from(selectedItems).map((id) => updateDoc(doc(db, 'groceryItems', id), { completed: true })));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error marking items as bought:', error);
    }
  };

  const markSelectedAsUnbought = async () => {
    if (selectedItems.size === 0) return;
    if (storageMode === 'local') {
      setItems(items.map((item) => (selectedItems.has(item.id) ? { ...item, completed: false } : item)));
      setSelectedItems(new Set());
      return;
    }
    try {
      await Promise.all(Array.from(selectedItems).map((id) => updateDoc(doc(db, 'groceryItems', id), { completed: false })));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error marking items as unbought:', error);
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
      await Promise.all(Array.from(selectedItems).map((id) => deleteDoc(doc(db, 'groceryItems', id))));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  return (
    <>
      <ServiceWorkerRegistration />
      <InstallPrompt />
      {isPWA && (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
          <div className='container mx-auto px-4 py-8 max-w-2xl'>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1'>Groceries</h1>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {storageMode === 'firebase' ? '☁️ Synced' : '📱 Local'}
              </p>
            </div>

            {/* Add Item */}
            <form onSubmit={addItem} className='mb-6'>
              <div className='relative'>
                <input
                  type='text'
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder='Add item...'
                  className='w-full px-4 py-3.5 text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:text-slate-100 placeholder-slate-400'
                />
                <button
                  type='submit'
                  className='absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-full transition-all flex items-center justify-center font-bold text-lg shadow-sm'
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
                    className='text-sm text-indigo-600 hover:text-indigo-700 active:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
                  >
                    Select all
                  </button>
                ) : (
                  <div className='flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 backdrop-blur-sm rounded-2xl border border-indigo-100 dark:border-indigo-900/50'>
                    <button onClick={toggleSelectAll} className='text-sm text-indigo-700 dark:text-indigo-300 font-medium'>
                      {selectedItems.size === items.length ? 'Deselect all' : `${selectedItems.size} selected`}
                    </button>
                    <div className='flex-1'></div>
                    {Array.from(selectedItems).some(id => !items.find(item => item.id === id)?.completed) && (
                      <button
                        onClick={markSelectedAsBought}
                        className='px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all shadow-sm'
                      >
                        ✓ Bought
                      </button>
                    )}
                    {Array.from(selectedItems).some(id => items.find(item => item.id === id)?.completed) && (
                      <button
                        onClick={markSelectedAsUnbought}
                        className='px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all shadow-sm'
                      >
                        ↩ Unbought
                      </button>
                    )}
                    <button
                      onClick={deleteSelectedItems}
                      className='px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all shadow-sm'
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className='text-center py-16'>
                <div className='inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-indigo-500'></div>
              </div>
            ) : items.length === 0 ? (
              <div className='text-center py-16'>
                <p className='text-lg text-slate-400 dark:text-slate-500'>No items yet</p>
                <p className='text-sm text-slate-400 dark:text-slate-600 mt-1'>Add your first item above</p>
              </div>
            ) : (
              <ul className='space-y-2'>
                {items.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] border ${
                      selectedItems.has(item.id)
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.has(item.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'
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
                        item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-100'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.completed && (
                      <span className='px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full'>
                        Bought
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
