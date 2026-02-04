export default function Loading() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <div className='flex items-center justify-between mb-6'>
        <div className='h-7 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse' />
        <div className='h-9 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse' />
      </div>

      <div className='mb-4'>
        <div className='h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
      </div>

      <div className='flex gap-2 mb-3'>
        <div className='h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse' />
        <div className='h-5 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse' />
        <div className='h-7 w-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
      </div>

      <div className='space-y-3'>
        <div className='h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
        <div className='h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
        <div className='h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse' />
      </div>

      <div className='mt-[5rem] flex justify-center'>
        <div className='h-10 w-48 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse' />
      </div>
    </div>
  );
}
