import {env} from 'cloudflare:workers';
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-f0-9-]{36}\.(png|jpg|webp|pdf)$/.test(key)||!env.BUCKET)return new Response('Not found',{status:404});
 const file=await env.BUCKET.get(key);if(!file)return new Response('Not found',{status:404});
 const headers=new Headers();file.writeHttpMetadata(headers);headers.set('Cache-Control','public, max-age=31536000, immutable');headers.set('X-Content-Type-Options','nosniff');headers.set('Content-Security-Policy',"default-src 'none'; sandbox");headers.set('ETag',file.httpEtag);
 return new Response(file.body,{headers});
}
