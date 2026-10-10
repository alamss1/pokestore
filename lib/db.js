import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import crypto from 'crypto';
export const redis = Redis.fromEnv();
const sig = () => crypto.createHash('sha256').update((process.env.ADMIN_PASSWORD||'')+(process.env.SESSION_SECRET||'')).digest('hex');
export const makeToken = sig;
export const isAdmin = () => cookies().get('adm')?.value === sig();
export const DEFAULT_SETTINGS = { watermark:'RMDNKII STORE', wa:'', ig:'rmdnkii', fb:'Ekiikuuh', about:'' };
export async function getSettings(){ return { ...DEFAULT_SETTINGS, ...((await redis.get('settings'))||{}) }; }
export async function getItems(all){
  const h = (await redis.hgetall('items')) || {};
  return Object.values(h).filter(i=>all||i.published).sort((a,b)=>(a.index??999)-(b.index??999));
}
