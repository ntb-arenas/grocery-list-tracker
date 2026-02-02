'use client';

import React from 'react';

interface Props {
  listCode: string | null;
  codeInput: string;
  setCodeInput: (v: string) => void;
  claiming: boolean;
  onClaim: (code: string) => void;
  onGenerate: (code: string) => void;
  onClear: () => void;
}

export default function ListCodeBox({ listCode, codeInput, setCodeInput, claiming, onClaim, onGenerate, onClear }: Props) {
  if (!listCode) {
    return (
      <div className='container mx-auto px-4 py-4 max-w-2xl'>
        <div className='mb-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
          <h2 className='text-lg font-medium mb-2'>Enter or create a private list code</h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mb-3'>
            This code lets you create your personal list. Using this code, you can access your personal list to different devices.
            Keep it secret.
          </p>
          <div className='flex gap-2'>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder='Your code or username'
              className='flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl'
            />
            <button
              onClick={() => onClaim(codeInput.trim())}
              disabled={!codeInput.trim() || claiming}
              className='px-4 py-2 bg-indigo-500 text-white rounded-2xl'
            >
              Use
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-4 max-w-2xl'>
      <div className='mb-4 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3'>
        <div className='flex-1'>
          <p className='text-sm text-slate-500 dark:text-slate-400'>Active list code</p>
          <p className='font-mono font-medium'>{listCode}</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => navigator.clipboard?.writeText(listCode)}
            className='px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-2xl'
          >
            Copy
          </button>
          <button onClick={onClear} className='px-3 py-2 bg-rose-100 text-rose-700 rounded-2xl'>
            Change
          </button>
        </div>
      </div>
    </div>
  );
}
