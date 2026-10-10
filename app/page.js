import { headers } from 'next/headers';
import { getItems, getSettings } from '@/lib/db';
import Store from '@/components/Store';
export const dynamic = 'force-dynamic';
export default async function Page(){
  const [items, settings] = await Promise.all([getItems(false), getSettings()]);
  return <Store items={items} settings={settings} country={headers().get('x-vercel-ip-country')||'ID'} />;
}
