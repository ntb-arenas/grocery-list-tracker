'use client';

import React, { useState } from 'react';
import { GroceryItem } from '@/lib/hooks/useGroceryLists';

interface Props {
  title?: string;
  items: GroceryItem[];
  onToggleComplete: (e: React.MouseEvent, id: string, current: boolean) => void;
  onClearBought?: (ids: string[]) => void;
}

function ItemRow({
  item,
  onToggleComplete,
}: {
  item: GroceryItem;
  onToggleComplete: (e: React.MouseEvent, id: string, current: boolean) => void;
}) {
  return (
    <li className='flex items-stretch gap-2'>
      <div className='flex items-center gap-3 py-2 pl-4 pr-2 rounded-2xl border flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
        <span
          className={`flex-1 text-base transition-all ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-100'}`}
        >
          {item.name}
        </span>
      </div>
      <button
        onClick={(e) => onToggleComplete(e, item.id, item.completed)}
        className={`px-4 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95 ${
          item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}
        title={item.completed ? 'Mark as unbought' : 'Mark as bought'}
      >
        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
        </svg>
      </button>
    </li>
  );
}

export default function ItemsSection({ title, items, onToggleComplete, onClearBought }: Props) {
  const [isBoughtOpen, setIsBoughtOpen] = useState(false);
  const pendingItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  const handleClearBought = () => {
    if (!onClearBought) return;
    const confirmed = window.confirm(
      `Remove ${completedItems.length} bought item${completedItems.length === 1 ? '' : 's'}?`
    );
    if (confirmed) onClearBought(completedItems.map((item) => item.id));
  };

  return (
    <div>
      <h3 className='text-sm text-slate-500 dark:text-slate-400 mb-2'>{title}</h3>
      <ul className='space-y-2'>
        {pendingItems.map((item) => (
          <ItemRow key={item.id} item={item} onToggleComplete={onToggleComplete} />
        ))}
      </ul>
      {completedItems.length > 0 && (
        <div className='mt-4'>
          <div className='flex items-center gap-2 mb-2'>
            <button
              onClick={() => setIsBoughtOpen((prev) => !prev)}
              className='flex items-center gap-2 flex-1 min-w-0'
            >
              <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
              <span className='text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-shrink-0'>
                Bought ({completedItems.length})
                <svg
                  className={`w-3 h-3 transition-transform ${isBoughtOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </span>
              <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
            </button>
            {onClearBought && (
              <button
                onClick={handleClearBought}
                className='text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium flex-shrink-0 pl-2 border-l border-slate-200 dark:border-slate-700'
              >
                Clear
              </button>
            )}
          </div>
          {isBoughtOpen && (
            <ul className='space-y-2'>
              {completedItems.map((item) => (
                <ItemRow key={item.id} item={item} onToggleComplete={onToggleComplete} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
