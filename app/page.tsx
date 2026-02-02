'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: any;
}

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'groceryItems'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData: GroceryItem[] = [];
      snapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as GroceryItem);
      });
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

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
    try {
      await updateDoc(doc(db, 'groceryItems', id), {
        completed: !completed,
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'groceryItems', id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900'>
      <div className='container mx-auto px-4 py-8 max-w-2xl'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8'>
          <h1 className='text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            🛒 Grocery List Tracker
          </h1>

          <form onSubmit={addItem} className='mb-8'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder='Add a new item...'
                className='flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors'
              />
              <button
                type='submit'
                className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl'
              >
                Add
              </button>
            </div>
          </form>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
              <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 dark:text-gray-400 text-lg'>No items yet. Add your first grocery item! 🎉</p>
            </div>
          ) : (
            <ul className='space-y-3'>
              {items.map((item) => (
                <li
                  key={item.id}
                  className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow'
                >
                  <input
                    type='checkbox'
                    checked={item.completed}
                    onChange={() => toggleItem(item.id, item.completed)}
                    className='w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer'
                  />
                  <span
                    className={`flex-1 ${
                      item.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'
                    } transition-all`}
                  >
                    {item.name}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium'
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 text-center text-sm text-gray-600 dark:text-gray-400'>
            <p>📱 Install this app for offline access!</p>
            <p className='mt-2'>Next.js + Firestore + PWA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
