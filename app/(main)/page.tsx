'use client';

import { useState, useEffect } from 'react';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from '@/app/components/AddItemForm';
import ListCodeBox from '@/app/components/ListCodeBox';
import ItemsSection from '@/app/components/ItemsSection';
import useSelection from '@/lib/hooks/useSelection';
import PersonalListCard from '@/app/components/PersonalListCard';
import { usePersonalListsFacade } from '@/lib/hooks/usePersonalListsFacade';
import { syncLocalListsWithFirebase } from '@/lib/utils/syncLocalListsWithFirebase';
import { useShouldShowApp } from '@/lib/hooks/useShouldShowApp';

export default function HomePage() {
  const { shouldShowApp } = useShouldShowApp();
  const {
    globalItems,
    loading,
    claiming,
    claimList: claimListFirebase,
    addItemToGlobal,
    toggleItem,
    markItems,
    deleteItems,
    getCombinedItems,
  } = useGroceryLists();
  const { personalListCodes, activeListCode, isInitialized, claimList, clearList } = usePersonalListsFacade();

  const [newGlobalItem, setNewGlobalItem] = useState('');
  const {
    selected: selectedItems,
    toggleSelection,
    toggleSelectList,
    selectedIdsFor,
    hasSelectedIn,
    selectedHasUnbought,
    selectedHasBought,
  } = useSelection();

  const [codeInput, setCodeInput] = useState('');
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  // Add to global
  const addGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGlobalItem.trim()) return;
    try {
      await addItemToGlobal(newGlobalItem.trim());
      setNewGlobalItem('');
    } catch (err) {
      console.error(err);
      alert('Error adding to global');
    }
  };

  // Selection logic
  const toggleSelectGlobal = () => toggleSelectList(globalItems.map((i) => i.id));

  const toggleItemCompleted = async (e: React.MouseEvent, combinedId: string, currentStatus: boolean) => {
    e.stopPropagation();
    await toggleItem(combinedId, currentStatus);
  };

  const hasSelectedInGlobal = hasSelectedIn(globalItems);
  const selectedGlobalIds = selectedIdsFor(globalItems);
  const selectedGlobalHasUnbought = selectedHasUnbought(globalItems);
  const selectedGlobalHasBought = selectedHasBought(globalItems);

  useEffect(() => {
    syncLocalListsWithFirebase();
  }, []);

  useEffect(() => {
    if (isCodeOpen) {
      document.body.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.touchAction = '';
        document.body.style.overflow = '';
      };
    }
  }, [isCodeOpen]);

  // List code modal logic
  const handleClaimList = async (code: string) => {
    await claimListFirebase(code);
    claimList(code);
    setIsCodeOpen(false);
  };

  const handleClearList = (code: string) => {
    clearList(code);
  };

  // Don't show the app if not installed or bypassed
  if (!shouldShowApp) {
    return null;
  }

  return (
    <div className=''>
      {/* Modal for ListCodeBox */}
      <div
        className={`inset-0 z-50 ${isCodeOpen ? 'pointer-events-auto fixed' : 'pointer-events-none hidden'}`}
        aria-hidden={!isCodeOpen}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/80 transition-opacity ${isCodeOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsCodeOpen(false)}
        />

        {/* Slide-over panel */}
        <aside
          className={`fixed left-0 w-full transition-transform transform ${isCodeOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <ListCodeBox
            listCode={activeListCode}
            codeInput={codeInput}
            setCodeInput={setCodeInput}
            claiming={claiming}
            onClaim={handleClaimList}
            onGenerate={(code) => {
              setCodeInput(code);
              handleClaimList(code);
            }}
            onClear={() => {
              if (activeListCode) handleClearList(activeListCode);
              setCodeInput('');
            }}
            isOpen={isCodeOpen}
            onClose={() => setIsCodeOpen(false)}
          />
        </aside>
      </div>

      <div aria-hidden={isCodeOpen} className='container mx-auto px-4 py-8 max-w-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1'>Groceries</h1>
          <button
            aria-label='Add new or open your list'
            onClick={() => setIsCodeOpen(true)}
            className='
              inline-flex items-center gap-2 px-5 py-2
              bg-gradient-to-r from-slate-100 to-slate-200
              dark:from-slate-800 dark:to-slate-900
              text-slate-800 dark:text-slate-100
              rounded-full border border-slate-200 dark:border-slate-800
              text-base font-medium

              shadow
              transition-transform transition-shadow duration-150 ease-out
              active:scale-95 active:shadow-inner

              focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900

              [-webkit-tap-highlight-color:transparent]
            '
          >
            <svg
              className='h-5 w-5 transition-transform duration-150 group-active:translate-x-1 text-indigo-500 dark:text-indigo-300'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden
            >
              <path d='M12 5v14M5 12h14' />
            </svg>
            <span>Add/Open list</span>
          </button>
        </div>

        {/* Render all personal lists - only after client hydration */}
        {isInitialized && personalListCodes.length > 0 && (
          <div className='space-y-2 mb-6'>
            {personalListCodes.map((code) => (
              <PersonalListCard
                key={code}
                listCode={code}
              />
            ))}
          </div>
        )}

        {loading ? (
          <div className='text-center py-16'>
            <div className='inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-indigo-500'></div>
          </div>
        ) : getCombinedItems().length === 0 ? (
          <div className='text-center py-16'>
            <p className='text-lg text-slate-400 dark:text-slate-500'>No items yet</p>
            <p className='text-sm text-slate-400 dark:text-slate-600 mt-1'>Add your first item above</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Global section */}
            <div className='p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/60 to-white/60 dark:from-emerald-950/20 dark:to-transparent shadow-sm'>
              <div className='flex items-start gap-3 mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>Global list</h3>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>Shared list visible to all users.</p>
                </div>
              </div>

              <form onSubmit={addGlobal} className='mb-4'>
                <AddItemForm value={newGlobalItem} onChange={setNewGlobalItem} />
              </form>

              <div className='flex gap-2 mb-3'>
                {globalItems.length > 0 && (
                  <button
                    onClick={toggleSelectGlobal}
                    className='text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
                  >
                    {selectedGlobalIds.length === globalItems.length ? 'Deselect' : 'Select all'}
                  </button>
                )}
                {hasSelectedInGlobal && (
                  <>
                    {selectedGlobalHasUnbought && (
                      <button
                        onClick={async () => await markItems(selectedGlobalIds, true)}
                        className='px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm'
                      >
                        ✓ Bought
                      </button>
                    )}
                    {selectedGlobalHasBought && (
                      <button
                        onClick={async () => await markItems(selectedGlobalIds, false)}
                        className='px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm'
                      >
                        ↩ Unbought
                      </button>
                    )}
                    <button
                      onClick={async () => await deleteItems(selectedGlobalIds)}
                      className='px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm'
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>

              {globalItems.length > 0 && (
                <ItemsSection
                  items={globalItems}
                  selected={selectedItems}
                  onToggleSelect={toggleSelection}
                  onToggleComplete={toggleItemCompleted}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
