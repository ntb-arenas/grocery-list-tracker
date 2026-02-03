'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from '../components/AddItemForm';
import ItemsSection from '../components/ItemsSection';
import useSelection from '@/lib/hooks/useSelection';

export default function PersonalPage() {
  const { listItems, listCode, addItemToList, toggleItem, markItems, deleteItems } = useGroceryLists();

  const [newPersonalItem, setNewPersonalItem] = useState('');
  const {
    selected: selectedItems,
    toggleSelection,
    toggleSelectList,
    selectedIdsFor,
    hasSelectedIn,
    selectedHasUnbought,
    selectedHasBought,
  } = useSelection();

  const toggleSelectPersonal = () => toggleSelectList(listItems.map((i) => i.id));

  const addPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonalItem.trim()) return;
    try {
      if (!listCode) throw new Error('No active personal list');
      await addItemToList(newPersonalItem.trim());
      setNewPersonalItem('');
    } catch (err) {
      console.error(err);
      alert('Error adding to personal list');
    }
  };

  const toggleItemCompleted = async (e: React.MouseEvent, combinedId: string, currentStatus: boolean) => {
    e.stopPropagation();
    await toggleItem(combinedId, currentStatus);
  };

  const hasSelectedInPersonal = hasSelectedIn(listItems);
  const selectedPersonalIds = selectedIdsFor(listItems);
  const selectedPersonalHasUnbought = selectedHasUnbought(listItems);
  const selectedPersonalHasBought = selectedHasBought(listItems);

  return (
      <div className='container mx-auto px-4 py-8 max-w-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1'>Personal list</h1>
          <Link
            href='/'
            className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm hover:scale-95 transition'
          >
            Back
          </Link>
        </div>

        {!listCode ? (
          <div className='text-center py-16'>
            <p className='text-lg text-slate-400 dark:text-slate-500'>No active personal list</p>
            <p className='text-sm text-slate-400 dark:text-slate-600 mt-1'>
              You will be redirected to the main page shortly, or click Back.
            </p>
          </div>
        ) : (
          <div>
            <form onSubmit={addPersonal} className='mb-4'>
              <h4 className='text-sm text-indigo-600 mb-2'>Add to Personal</h4>
              <AddItemForm value={newPersonalItem} onChange={setNewPersonalItem} />
            </form>

            <div className='flex gap-2 mb-3'>
              <button
                onClick={toggleSelectPersonal}
                className='text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
              >
                {selectedPersonalIds.length === listItems.length && listItems.length > 0 ? 'Deselect' : 'Select all'}
              </button>
              <div className='text-sm text-slate-400'>{/* placeholder for claiming state */}</div>
              {hasSelectedInPersonal && (
                <>
                  {selectedPersonalHasUnbought && (
                    <button
                      onClick={async () => await markItems(selectedPersonalIds, true)}
                      className='px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm'
                    >
                      ✓ Bought
                    </button>
                  )}
                  {selectedPersonalHasBought && (
                    <button
                      onClick={async () => await markItems(selectedPersonalIds, false)}
                      className='px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm'
                    >
                      ↩ Unbought
                    </button>
                  )}
                  <button
                    onClick={async () => await deleteItems(selectedPersonalIds)}
                    className='px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm'
                  >
                    🗑 Delete
                  </button>
                </>
              )}
            </div>

            {listItems.length > 0 && (
              <ItemsSection
                title={`Personal list (${listCode})`}
                items={listItems}
                selected={selectedItems}
                onToggleSelect={toggleSelection}
                onToggleComplete={toggleItemCompleted}
              />
            )}
          </div>
        )}
      </div>
  );
}
