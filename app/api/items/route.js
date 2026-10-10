import { redis, isAdmin, getItems } from '@/lib/db';
const no = () => Response.json({error:'unauthorized'},{status:401});
export async function GET(){ return isAdmin()? Response.json(await getItems(true)) : no(); }
export async function POST(req){
  if(!isAdmin()) return no();
  const it = await req.json();
  it.id = it.id || Date.now().toString(36);
  await redis.hset('items',{[it.id]:it});
  return Response.json(it);
}
export async function DELETE(req){
  if(!isAdmin()) return no();
  await redis.hdel('items', new URL(req.url).searchParams.get('id'));
  return Response.json({ok:true});
}
