import initialContent from './initial-content.json';
import { z } from 'zod';
const line=z.string().max(300), paragraph=z.string().max(5000);
const url=z.string().max(1500).refine(v=>!v||/^https:\/\//i.test(v)||/^\/(?:api\/files|media)\/[a-zA-Z0-9.-]+$/.test(v),'Use an https:// link.');
const id=z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
export const portfolioSchema=z.object({
 profile:z.object({name:line.min(1),role:line.min(1),location:line,availability:line,headline:line.min(1),accent:line.min(1),intro:paragraph,about:paragraph,email:z.string().email().or(z.literal('')),github:url,linkedin:url,photo:url,resume:url}),
 education:z.object({institution:line,degree:line,campus:line,startYear:z.number().int().min(1900).max(2200),endYear:z.number().int().min(1900).max(2200),semester:z.number().int().min(1).max(9)}),
 projects:z.array(z.object({id,title:line.min(1),category:z.enum(['Mobile & IoT','Web development','AI & automation','Web3']),year:line,summary:paragraph,detail:paragraph,role:line,status:line,tech:z.array(line).max(20),visual:z.enum(['gridmote','transit','robot','custom']),cover:url,demo:url,repo:url})).max(40),
 experience:z.array(z.object({id,role:line.min(1),company:line,period:line,description:paragraph})).max(20),
 highlights:z.array(z.object({id,title:line.min(1),issuer:line,date:line,kind:z.enum(['Milestone','Certificate','Achievement']),description:paragraph,attachment:url,credential:url,fingerprint:z.string().regex(/^[a-f0-9]{64}$/).or(z.literal(''))})).max(60),
 skills:z.array(z.object({id,title:line.min(1),items:z.array(line).max(40)})).max(12),labEnabled:z.boolean(),
}).superRefine((v,ctx)=>{
 if(v.education.endYear<v.education.startYear)ctx.addIssue({code:'custom',message:'End year must follow the start year.',path:['education','endYear']});
 for(const key of ['projects','experience','highlights','skills'] as const){const ids=v[key].map(x=>x.id);if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Each entry needs a unique ID.',path:[key]});}
});
export type PortfolioData=z.infer<typeof portfolioSchema>;
export type Project=PortfolioData['projects'][number];
export type Highlight=PortfolioData['highlights'][number];
export const initialData:PortfolioData=portfolioSchema.parse(initialContent);
export function semesterLabel(n:number){return n===9?'Graduated':`${n}${n===1?'st':n===2?'nd':n===3?'rd':'th'} semester`;}
