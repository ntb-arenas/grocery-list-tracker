'use client';

import { useState, useEffect } from 'react';
import InstallPrompt from './components/InstallPrompt';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from './components/AddItemForm';
import ListCodeBox from './components/ListCodeBox';
import ItemsSection from './components/ItemsSection';
import useSelection from '@/lib/hooks/useSelection';

export default function Home() {
  const {
    globalItems,
    listItems,
    loading,
    listCode,
    setListCode,
    claiming,
    claimList,
    addItemToList,
    addItemToGlobal,
    toggleItem,
    markItems,
    deleteItems,
    getCombinedItems,
  } = useGroceryLists();
  const [newGlobalItem, setNewGlobalItem] = useState('');
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
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  // Check if app should be shown (PWA or bypassed install)
  useEffect(() => {
    const checkShouldShow = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = (window.navigator as any).standalone || standalone;
      const hasBypassed = localStorage.getItem('bypass-install') === 'true';
      setShouldShowApp(isInStandaloneMode || hasBypassed);
    };

    checkShouldShow();

    // Listen for bypass-install event
    window.addEventListener('bypass-install', checkShouldShow);

    return () => {
      window.removeEventListener('bypass-install', checkShouldShow);
    };
  }, []);

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

  // Add to personal list (only when listCode active)
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

  // Selection logic
  const toggleSelectPersonal = () => toggleSelectList(listItems.map((i) => i.id));
  const toggleSelectGlobal = () => toggleSelectList(globalItems.map((i) => i.id));

  const toggleItemCompleted = async (e: React.MouseEvent, combinedId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevent selection toggle
    await toggleItem(combinedId, currentStatus);
  };

  const hasSelectedInPersonal = hasSelectedIn(listItems);
  const hasSelectedInGlobal = hasSelectedIn(globalItems);
  const selectedPersonalIds = selectedIdsFor(listItems);
  const selectedGlobalIds = selectedIdsFor(globalItems);
  const selectedPersonalHasUnbought = selectedHasUnbought(listItems);
  const selectedPersonalHasBought = selectedHasBought(listItems);
  const selectedGlobalHasUnbought = selectedHasUnbought(globalItems);
  const selectedGlobalHasBought = selectedHasBought(globalItems);

  return (
    <>
      <ServiceWorkerRegistration />
      <InstallPrompt />
      {shouldShowApp && (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
          {/* Sidebar / modal for ListCodeBox */}
          <div
            className={`fixed inset-0 z-50 ${isCodeOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!isCodeOpen}
          >
            {/* Backdrop */}
            <div
              className={`fixed inset-0 bg-black/80 transition-opacity ${isCodeOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setIsCodeOpen(false)}
            />

            {/* Slide-over panel (shorter, centered vertically) */}
            <aside
              className={`fixed right-0 top-0 -translate-y-0 w-full px-4 py-6 transition-transform transform ${isCodeOpen ? 'translate-x-0' : 'translate-x-full'} bg-white dark:bg-slate-900 shadow-xl rounded-lg h-[50%] overflow-auto`}
            >
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold'>List code</h2>
                <button
                  aria-label='Close list code'
                  onClick={() => setIsCodeOpen(false)}
                  className='text-slate-500 hover:text-slate-700'
                >
                  ✕
                </button>
              </div>
              <ListCodeBox
                listCode={listCode}
                codeInput={codeInput}
                setCodeInput={setCodeInput}
                claiming={claiming}
                onClaim={(code) => claimList(code)}
                onGenerate={(code) => {
                  setCodeInput(code);
                  claimList(code);
                }}
                onClear={() => {
                  localStorage.removeItem('groceryListCode');
                  setListCode(null);
                  setCodeInput('');
                }}
              />
            </aside>
          </div>

          <div className='container mx-auto px-4 py-8 max-w-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1'>Groceries</h1>
              <button
                aria-label='Open list code'
                onClick={() => setIsCodeOpen(true)}
                className='inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm hover:scale-95 transition'
              >
                {/* Hamburger icon */}
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden
                >
                  <path d='M3 12h18M3 6h18M3 18h18' />
                </svg>
              </button>
            </div>

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
                {/* Personal list section */}
                {listCode && (
                  <div className='p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-white/60 dark:from-indigo-950/30 dark:to-transparent shadow-sm'>
                    <div className='flex items-start gap-3 mb-4'>
                      <div>
                        <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
                          Personal list{listCode ? `: ${listCode}` : ''}
                        </h3>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          Private list tied to a code. Syncs across your devices.
                        </p>
                      </div>
                    </div>

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
                      <div className='text-sm text-slate-400'>{claiming ? 'Claiming...' : ''}</div>
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

                {/* Global section */}
                <div className='p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/60 to-white/60 dark:from-emerald-950/20 dark:to-transparent shadow-sm'>
                  <div className='flex items-start gap-3 mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>Global list</h3>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>Shared list visible to all users.</p>
                    </div>
                  </div>

                  <form onSubmit={addGlobal} className='mb-4'>
                    <h4 className='text-sm text-emerald-600 mb-2'>Add to Global</h4>
                    <AddItemForm value={newGlobalItem} onChange={setNewGlobalItem} />
                  </form>

                  <div className='flex gap-2 mb-3'>
                    <button
                      onClick={toggleSelectGlobal}
                      className='text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
                    >
                      {selectedGlobalIds.length === globalItems.length && globalItems.length > 0 ? 'Deselect' : 'Select all'}
                    </button>
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
                      title='Global list'
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
      )}
    </>
  );
}
