import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='h-[100dvh] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center'>
      <div className='text-center px-4'>
        <h1 className='text-6xl font-bold text-slate-900 dark:text-white mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-6'>Page Not Found</h2>
        <p className='text-slate-600 dark:text-slate-400 mb-8'>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href='/'
          className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition'
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
