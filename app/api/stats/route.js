import { redis, isAdmin } from '@/lib/db';
export async function GET(){
  if(!isAdmin()) return Response.json({},{status:401});
  const [visit,view,dm,country,day] = await Promise.all(['s:visit','s:view','s:dm','s:country','s:day'].map(k=>redis.hgetall(k)));
  return Response.json({ visit:visit||{}, view:view||{}, dm:dm||{}, country:country||{}, day:day||{} });
}
