'use client';

import { useState } from 'react';
import { exportListAsImage } from '@/lib/utils/exportList';

interface ExportListButtonProps {
  listId: string;
  listName?: string;
  disabled?: boolean;
}

export default function ExportListButton({ listId, listName = 'grocery-list', disabled = false }: ExportListButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportListAsImage(listId, listName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export list');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        aria-label='Export list as image'
        className={`
          inline-flex items-center gap-2 px-4 py-2
          text-sm font-medium rounded-lg
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            showSuccess
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
          }
        `}
      >
        {isExporting ? (
          <>
            <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' opacity='0.25' />
              <path
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            Exporting...
          </>
        ) : showSuccess ? (
          <>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            Saved!
          </>
        ) : (
          <>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
            Export as Image
          </>
        )}
      </button>
    </>
  );
}
