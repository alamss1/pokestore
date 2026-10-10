import { makeToken } from '@/lib/db';
export async function POST(req){
  const { password } = await req.json();
  if(!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return Response.json({error:'Password salah'},{status:401});
  const r = Response.json({ok:true});
  r.headers.append('Set-Cookie',`adm=${makeToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  return r;
}
