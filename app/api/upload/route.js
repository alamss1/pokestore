import { handleUpload } from '@vercel/blob/client';
import { isAdmin } from '@/lib/db';
export async function POST(req){
  if(!isAdmin()) return Response.json({error:'unauthorized'},{status:401});
  const body = await req.json();
  try{
    return Response.json(await handleUpload({ body, request:req,
      onBeforeGenerateToken: async()=>({ allowedContentTypes:['image/*','video/*'], maximumSizeInBytes:500*1024*1024, addRandomSuffix:true }) }));
  }catch(e){ return Response.json({error:e.message},{status:400}); }
}
