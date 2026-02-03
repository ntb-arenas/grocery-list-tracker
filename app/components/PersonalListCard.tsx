'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PersonalListCard({ listCode }: { listCode: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (listCode) {
      // proactively prefetch personal page when a code exists
      router.prefetch('/personal');
    }
  }, [listCode, router]);

  if (!listCode) return null;

  return (
    <Link href='/personal' className='px-3 py-2 text-white text-sm' onMouseEnter={() => router.prefetch('/personal')}>
      <div className='p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-white/60 dark:from-indigo-950/30 dark:to-transparent shadow-sm flex items-center gap-3'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>Personal list: {listCode}</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Private list tied to a code. Open the dedicated page to manage it.
          </p>
        </div>
        <svg
          className='h-5 w-5 text-white/90'
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
