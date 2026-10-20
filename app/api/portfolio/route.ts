import {readPortfolio, json} from '../../server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return json(await readPortfolio()); }
  catch { return json({error: 'Your portfolio could not be loaded. Please try again.'}, 503); }
}
