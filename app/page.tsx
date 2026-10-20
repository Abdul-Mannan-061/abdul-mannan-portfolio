import Portfolio from './portfolio';
import {readPortfolio} from './server';
export const dynamic='force-dynamic';
export default async function Home(){const r=await readPortfolio();return <Portfolio initial={r.data} updatedAt={r.updatedAt}/>;}
