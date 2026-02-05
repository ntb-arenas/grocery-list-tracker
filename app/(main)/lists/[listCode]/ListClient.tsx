'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from '@/app/components/AddItemForm';
import ItemsSection from '@/app/components/ItemsSection';
import useSelection from '@/lib/hooks/useSelection';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/utils/storage';
import ConfirmationModal from '@/app/components/ConfirmationModal';

export default function ListClient({ listCode }: { listCode: string }) {
  const router = useRouter();
  const { listItems, addItemToList, toggleItem, markItems, deleteItems, deleteList } = useGroceryLists(listCode);
  const [newPersonalItem, setNewPersonalItem] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleForgetList = () => {
    // Only remove from localStorage, not from Firebase
    const codes = JSON.parse(getLocalStorageItem('personalListCodes') || '[]');
    const updated = codes.filter((c: string) => c !== listCode);
    setLocalStorageItem('personalListCodes', JSON.stringify(updated));
    router.push('/');
  };

  const handleDeleteListForEveryone = async () => {
    try {
      // Delete from Firebase
      await deleteList(listCode);
      // Also remove from localStorage
      const codes = JSON.parse(getLocalStorageItem('personalListCodes') || '[]');
      const updated = codes.filter((c: string) => c !== listCode);
      setLocalStorageItem('personalListCodes', JSON.stringify(updated));
      router.push('/');
    } catch (error) {
      console.error('Failed to delete list:', error);
      alert('Failed to delete the list. Please try again.');
    }
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
      {!listCode ? (
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
              title={`Personal list (${listCode})`}
              items={listItems}
              selected={selectedItems}
              onToggleSelect={toggleSelection}
              onToggleComplete={toggleItemCompleted}
            />
          )}
          {listCode && (
            <div className='mt-[5rem] flex flex-col gap-3 items-center'>
              <button
                onClick={handleForgetList}
                className='
                    inline-flex items-center gap-2 px-5 py-2
                    bg-gradient-to-r from-slate-100 to-slate-200
                    dark:from-slate-700 dark:to-slate-600
                    text-slate-700 dark:text-slate-200
                    rounded-full border border-slate-200 dark:border-slate-600
                    text-base font-medium

                    shadow
                    transition-transform transition-shadow duration-150 ease-out
                    active:scale-95 active:shadow-inner

                    [-webkit-tap-highlight-color:transparent]
                  '
              >
                <svg
                  className='h-5 w-5 text-slate-500 dark:text-slate-300'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                  <polyline points='16 17 21 12 16 7' />
                  <line x1='21' y1='12' x2='9' y2='12' />
                </svg>
                <span>Forget list on this device</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className='
                    inline-flex items-center gap-2 px-5 py-2
                    bg-gradient-to-r from-rose-100 to-rose-200
                    dark:from-rose-900 dark:to-rose-800
                    text-rose-700 dark:text-rose-200
                    rounded-full border border-rose-200 dark:border-rose-900
                    text-base font-medium

                    shadow
                    transition-transform transition-shadow duration-150 ease-out
                    active:scale-95 active:shadow-inner

                    [-webkit-tap-highlight-color:transparent]
                  '
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
                <span>Delete list for everyone</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteListForEveryone}
        title='Delete list for everyone?'
        message='This will permanently delete the list and all its items for everyone who has access to it. This action cannot be undone.'
        confirmText='Delete permanently'
        cancelText='Cancel'
        requireCodeConfirmation={true}
        codeToMatch={listCode}
        isDangerous={true}
      />
    </div>
  );
}
