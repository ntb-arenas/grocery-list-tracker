'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  listCode: string | null;
  codeInput: string;
  setCodeInput: (v: string) => void;
  claiming: boolean;
  onClaim: (code: string) => void;
  onGenerate: (code: string) => void;
  onClear: () => void;
  isOpen: boolean;
}

export default function ListCodeBox({
  listCode,
  codeInput,
  setCodeInput,
  claiming,
  onClaim,
  onGenerate,
  onClear,
  isOpen,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim();
    if (!code) return;
    try {
      await Promise.resolve(onClaim(code));
      setCodeInput('');
      // Optionally navigate or show feedback
    } catch (err) {
      console.error('Failed to claim list code', err);
    }
  };

  // Always show the input for adding a new code
  return (
    <div className='py-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
      <h2 className='text-lg font-medium mb-2'>Enter or create a private list code</h2>
      <p className='text-sm text-slate-500 dark:text-slate-400 mb-3'>
        This code lets you create your personal list. Using this code, you can access your personal list on different devices.
        Keep it secret.
      </p>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          ref={inputRef}
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder='Your code or username'
          autoFocus={false}
          className='flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl'
        />
        <button
          type='submit'
          disabled={!codeInput.trim() || claiming}
          className='inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full shadow hover:shadow-md hover:bg-indigo-300 transition-all border border-indigo-200 dark:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 text-sm font-medium'
        >
          <svg
            className='h-4 w-4 text-indigo-500 dark:text-indigo-300'
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
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
