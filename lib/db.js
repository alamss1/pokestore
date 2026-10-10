import Redis from 'ioredis';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const g = globalThis;
const client = g._rc || (g._rc = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 }));
const parse = v => { try { return JSON.parse(v); } catch { return v; } };

export const redis = {
  async hgetall(k){ const h = await client.hgetall(k); return Object.fromEntries(Object.entries(h).map(([a,b])=>[a,parse(b)])); },
  hset: (k,o)=>client.hset(k, Object.fromEntries(Object.entries(o).map(([a,b])=>[a,JSON.stringify(b)]))),
  hdel: (k,f)=>client.hdel(k,f),
  hincrby: (k,f,n)=>client.hincrby(k,f,n),
  async get(k){ const v = await client.get(k); return v==null?null:parse(v); },
  set: (k,v)=>client.set(k,JSON.stringify(v)),
};

const sig = () => crypto.createHash('sha256').update((process.env.ADMIN_PASSWORD||'')+(process.env.SESSION_SECRET||'')).digest('hex');
export const makeToken = sig;
export const isAdmin = () => cookies().get('adm')?.value === sig();
export const DEFAULT_SETTINGS = { watermark:'Rama Store', wa:'', ig:'rmdnkii', fb:'Ekiikuuh', about:'' };
export async function getSettings(){ return { ...DEFAULT_SETTINGS, ...((await redis.get('settings'))||{}) }; }
export async function getItems(all){
  const h = (await redis.hgetall('items')) || {};
  return Object.values(h).filter(i=>all||i.published).sort((a,b)=>(a.index??999)-(b.index??999));
}
