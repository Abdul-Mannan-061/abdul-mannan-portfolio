import { env } from 'cloudflare:workers';
import { initialData, portfolioSchema, type PortfolioData } from './content';
export { ownerIdentity } from './owner-auth';

export function database() {
  if (!env.DB) throw new Error('Database unavailable');
  return env.DB;
}

export async function readPortfolio(): Promise<{data: PortfolioData; revision: number; updatedAt: string | null}> {
  const row = await database().prepare('SELECT data, revision, updated_at FROM portfolio WHERE id = ?')
    .bind('main').first<{data: string; revision: number; updated_at: string}>();
  if (!row) return {data: initialData, revision: 0, updatedAt: null};
  return {data: portfolioSchema.parse(JSON.parse(row.data)), revision: row.revision, updatedAt: row.updated_at};
}

export function sameOrigin(request: Request) {
  return request.headers.get('sec-fetch-site') !== 'cross-site'
    && request.headers.get('origin') === new URL(request.url).origin;
}

export const json = (data: unknown, status = 200) => Response.json(data, {
  status,
  headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'},
});
