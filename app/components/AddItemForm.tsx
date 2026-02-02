'use client';

import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddItemForm({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className='mb-6'>
      <div className='relative'>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}
