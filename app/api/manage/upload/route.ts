import {env} from 'cloudflare:workers';
import {ownerIdentity,sameOrigin,json} from '../../../server';
export async function POST(request:Request){try{
 if(!sameOrigin(request)||!await ownerIdentity(request.headers))return json({error:'Owner access required.'},403);
 if(!env.BUCKET)return json({error:'File storage is unavailable.'},503);
 if(Number(request.headers.get('content-length')||0)>9*1024*1024)return json({error:'Choose a file smaller than 8 MB.'},413);
 const form=await request.formData(),file=form.get('file');
 if(!(file instanceof File)||!file.size||file.size>8*1024*1024)return json({error:'Choose a PNG, JPG, WebP or PDF smaller than 8 MB.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());let type='',ext='';
 if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71){type='image/png';ext='png';}
 else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){type='image/jpeg';ext='jpg';}
 else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){type='image/webp';ext='webp';}
 else if(new TextDecoder().decode(bytes.slice(0,5))==='%PDF-'){type='application/pdf';ext='pdf';}
 if(!type)return json({error:'Only PNG, JPG, WebP and PDF files are supported.'},400);
 if(form.get('purpose')==='image'&&type==='application/pdf')return json({error:'Choose an image for this field.'},400);
 const key=crypto.randomUUID()+'.'+ext,hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type},customMetadata:{sha256:hash}});
 return json({url:'/api/files/'+key,fingerprint:hash});
 }catch{return json({error:'Upload failed. Your previous file is unchanged.'},500);}}
