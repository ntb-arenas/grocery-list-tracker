import ListClient from './ListClient';

export default async function Page({ params }: { params: Promise<{ listCode: string }> }) {
  const { listCode } = await params;
  
  return (
      <ListClient listCode={listCode} />
  );
}
