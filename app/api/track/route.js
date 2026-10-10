import { redis } from '@/lib/db';
export async function POST(req){
  const { type, id } = await req.json();
  if(!['visit','view','dm'].includes(type)) return Response.json({ok:0});
  const cc = req.headers.get('x-vercel-ip-country') || '??';
  const day = new Date().toISOString().slice(0,10);
  const ops = [ redis.hincrby(`s:${type}`, id||'site', 1) ];
  if(type==='visit') ops.push(redis.hincrby('s:country',cc,1), redis.hincrby('s:day',day,1));
  await Promise.all(ops);
  return Response.json({ok:1});
}
