import { redis, isAdmin, getSettings } from '@/lib/db';
export async function GET(){ return isAdmin()? Response.json(await getSettings()) : Response.json({},{status:401}); }
export async function POST(req){ if(!isAdmin()) return Response.json({},{status:401}); await redis.set('settings', await req.json()); return Response.json({ok:true}); }
