'use client';

import React from 'react';
import { GroceryItem } from '@/lib/hooks/useGroceryLists';

interface Props {
  title: string;
  items: GroceryItem[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleComplete: (e: React.MouseEvent, id: string, current: boolean) => void;
}

export default function ItemsSection({ title, items, selected, onToggleSelect, onToggleComplete }: Props) {
  return (
    <div>
      <h3 className='text-sm text-slate-500 dark:text-slate-400 mb-2'>{title}</h3>
      <ul className='space-y-2'>
        {items.map((item) => (
          <li key={item.id} className='flex items-stretch gap-2'>
            <div
              onClick={() => onToggleSelect(item.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] border flex-1 ${
                selected.has(item.id)
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  selected.has(item.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selected.has(item.id) && (
                  <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                  </svg>
                )}
              </div>
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
        ))}
      </ul>
    </div>
  );
}
