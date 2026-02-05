'use client';

import { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireCodeConfirmation?: boolean;
  codeToMatch?: string;
  isDangerous?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireCodeConfirmation = false,
  codeToMatch = '',
  isDangerous = false,
}: ConfirmationModalProps) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [canConfirm, setCanConfirm] = useState(!requireCodeConfirmation);

  useEffect(() => {
    if (!isOpen) {
      setConfirmationCode('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (requireCodeConfirmation) {
      setCanConfirm(confirmationCode.toUpperCase() === codeToMatch.toUpperCase());
    } else {
      setCanConfirm(true);
    }
  }, [confirmationCode, codeToMatch, requireCodeConfirmation]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>{title}</h2>

        <p className='text-slate-600 dark:text-slate-300'>{message}</p>

        {requireCodeConfirmation && (
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Type <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>{codeToMatch}</span> to confirm:
            </label>
            <input
              type='text'
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500'
              placeholder={`Type ${codeToMatch}`}
              autoFocus
            />
          </div>
        )}

        <div className='flex gap-3 pt-2'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition'
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              isDangerous
                ? 'bg-rose-500 hover:bg-rose-600 text-white disabled:bg-rose-300 dark:disabled:bg-rose-900'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-indigo-300 dark:disabled:bg-indigo-900'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
