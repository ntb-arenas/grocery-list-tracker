'use client';

import { useState, useEffect } from 'react';
import InstallPrompt from './components/InstallPrompt';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import useGroceryLists from '@/lib/hooks/useGroceryLists';
import AddItemForm from './components/AddItemForm';
import ListCodeBox from './components/ListCodeBox';
import ItemsSection from './components/ItemsSection';

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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [codeInput, setCodeInput] = useState('');

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
  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    const combined = getCombinedItems();
    setSelectedItems(selectedItems.size === combined.length ? new Set() : new Set(combined.map((item) => item.id)));
  };

  // Bulk actions (scoped per-item based on combined id)
  const markSelectedAsBought = async () => {
    if (selectedItems.size === 0) return;
    await markItems(Array.from(selectedItems), true);
    setSelectedItems(new Set());
  };

  const markSelectedAsUnbought = async () => {
    if (selectedItems.size === 0) return;
    await markItems(Array.from(selectedItems), false);
    setSelectedItems(new Set());
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    await deleteItems(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const toggleItemCompleted = async (e: React.MouseEvent, combinedId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevent selection toggle
    await toggleItem(combinedId, currentStatus);
  };

  return (
    <>
      <ServiceWorkerRegistration />
      <InstallPrompt />
      {shouldShowApp && (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
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
          <div className='container mx-auto px-4 py-8 max-w-2xl'>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1'>Groceries</h1>
            </div>

            {/* Select All & Actions */}
            {getCombinedItems().length > 0 && (
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
                      {selectedItems.size === getCombinedItems().length ? 'Deselect all' : `${selectedItems.size} selected`}
                    </button>
                    <div className='flex-1'></div>
                    {Array.from(selectedItems).some((id) => !getCombinedItems().find((item) => item.id === id)?.completed) && (
                      <button
                        onClick={markSelectedAsBought}
                        className='px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium rounded-full transition-all shadow-sm'
                      >
                        ✓ Bought
                      </button>
                    )}
                    {Array.from(selectedItems).some((id) => getCombinedItems().find((item) => item.id === id)?.completed) && (
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
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white'>
                          Personal
                        </span>
                        <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mt-2'>
                          Personal list{listCode ? `: ${listCode}` : ''}
                        </h3>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          Private list tied to a code. Syncs across your devices.
                        </p>
                      </div>
                      <div className='ml-auto text-sm text-slate-400'>{claiming ? 'Claiming...' : ''}</div>
                    </div>

                    <form onSubmit={addPersonal} className='mb-4'>
                      <h4 className='text-sm text-indigo-600 mb-2'>Add to Personal</h4>
                      <AddItemForm value={newPersonalItem} onChange={setNewPersonalItem} onSubmit={addPersonal} />
                    </form>

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
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white'>
                        Global
                      </span>
                      <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mt-2'>Global list</h3>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>Shared list visible to all users.</p>
                    </div>
                    <div className='ml-auto flex items-center gap-2'>
                      {globalItems.length > 0 && (
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'>
                          {globalItems.length} {globalItems.length === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={addGlobal} className='mb-4'>
                    <h4 className='text-sm text-emerald-600 mb-2'>Add to Global</h4>
                    <AddItemForm value={newGlobalItem} onChange={setNewGlobalItem} onSubmit={addGlobal} />
                  </form>

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
