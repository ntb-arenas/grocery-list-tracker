'use client';

import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from '@/app/components/AddItemForm';
import ItemsSection from '@/app/components/ItemsSection';
import useSelection from '@/lib/hooks/useSelection';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '@/lib/utils/storage';

export default function PersonalListPage({ params }: { params: Promise<{ listCode: string }> }) {
  const { listCode } = use(params);
  const router = useRouter();
  const {
    listItems,
    listCode: activeListCode,
    addItemToList,
    toggleItem,
    markItems,
    deleteItems,
  } = useGroceryLists(listCode);

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

  const selectedPersonalIds = selectedIdsFor(listItems);
  const hasSelectedInPersonal = hasSelectedIn(listItems);
  const selectedPersonalHasUnbought = selectedHasUnbought(listItems);
  const selectedPersonalHasBought = selectedHasBought(listItems);

  const handleMark = async (completed: boolean) => {
    await markItems(selectedPersonalIds, completed);
  };
  const handleDeleteSelected = async () => {
    await deleteItems(selectedPersonalIds);
  };
  const handleDeleteList = () => {
    // Only remove from localStorage, not from Firebase
    const codes = JSON.parse(getLocalStorageItem('personalListCodes') || '[]');
    const updated = codes.filter((c: string) => c !== activeListCode);
    setLocalStorageItem('personalListCodes', JSON.stringify(updated));
    router.push('/');
  };

  const toggleItemCompleted = async (e: React.MouseEvent, combinedId: string, currentStatus: boolean) => {
    e.stopPropagation();
    await toggleItem(combinedId, currentStatus);
  };

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
      {!activeListCode ? (
        <div className='text-center py-16'>
          <p className='text-lg text-slate-400 dark:text-slate-500'>No active personal list</p>
          <p className='text-sm text-slate-400 dark:text-slate-600 mt-1'>
            You will be redirected to the main page shortly, or click Back.
          </p>
        </div>
      ) : (
        <div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newPersonalItem.trim()) return;
              await addItemToList(newPersonalItem.trim());
              setNewPersonalItem('');
            }}
            className='mb-4'
          >
            <AddItemForm value={newPersonalItem} onChange={setNewPersonalItem} />
          </form>
          <div className='flex gap-2 mb-3'>
            {listItems.length > 0 && (
              <button
                onClick={() => toggleSelectList(listItems.map((i) => i.id))}
                className='text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
              >
                {selectedPersonalIds.length === listItems.length ? 'Deselect' : 'Select all'}
              </button>
            )}
            <div className='text-sm text-slate-400'>{/* placeholder for claiming state */}</div>
            {hasSelectedInPersonal && (
              <>
                {selectedPersonalHasUnbought && (
                  <button
                    onClick={() => handleMark(true)}
                    className='px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm'
                  >
                    ✓ Bought
                  </button>
                )}
                {selectedPersonalHasBought && (
                  <button
                    onClick={() => handleMark(false)}
                    className='px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm'
                  >
                    ↩ Unbought
                  </button>
                )}
                <button
                  onClick={handleDeleteSelected}
                  className='px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm'
                >
                  🗑 Delete
                </button>
              </>
            )}
          </div>
          {listItems.length > 0 && (
            <ItemsSection
              title={`Personal list (${activeListCode})`}
              items={listItems}
              selected={selectedItems}
              onToggleSelect={toggleSelection}
              onToggleComplete={toggleItemCompleted}
            />
          )}
          {activeListCode && (
            <div className='mt-[5rem] flex justify-center'>
              <button
                onClick={handleDeleteList}
                className='inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 text-rose-700 dark:text-rose-200 rounded-full shadow hover:shadow-md hover:bg-rose-300 transition-all border border-rose-200 dark:border-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 text-base font-medium'
              >
                <svg
                  className='h-5 w-5 text-rose-500 dark:text-rose-300'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden
                >
                  <path d='M3 6h18' />
                  <path d='M8 6v14h8V6' />
                  <path d='M10 11v6' />
                  <path d='M14 11v6' />
                </svg>
                <span>Delete this list</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
