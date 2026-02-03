'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PersonalListCard({
  listCode,
  isActive,
  onClear,
}: {
  listCode: string;
  isActive: boolean;
  onClear: () => void;
}) {
  const router = useRouter();

  if (!listCode) return null;

  return (
    <Link href={`/lists/${listCode}`} className='flex mb-2'>
      <div
        className={`flex items-center gap-4 py-3 px-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40
        bg-gradient-to-br from-indigo-50/60 to-white/60 dark:from-indigo-950/30 dark:to-transparent shadow-sm hover:shadow-md active:shadow-lg focus:ring-2 focus:ring-indigo-300 transition-shadow`}
      >
        <div>
          <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>Personal list: {listCode}</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Private list tied to a code. Open the dedicated page to manage it.
          </p>
        </div>
        <svg
          className='h-5 w-5 text-slate-600 dark:text-slate-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden
        >
          <path d='M5 12h14' />
          <path d='M12 5l7 7-7 7' />
        </svg>
      </div>
    </Link>
  );
}
