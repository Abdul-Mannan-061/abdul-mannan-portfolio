import {database, ownerIdentity, sameOrigin, json} from '../../../server';
import {portfolioSchema} from '../../../content';
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    if (!sameOrigin(request) || !await ownerIdentity(request.headers)) {
      return json({error: 'Your owner session is unavailable. Reload the Studio to sign in again.'}, 403);
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error: 'Send a JSON update.'}, 415);
    const text = await request.text();
    if (text.length > 250000) return json({error: 'This update is too large.'}, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({error: 'Invalid update.'}, 400); }
    if (!body || typeof body !== 'object') return json({error: 'Invalid update.'}, 400);
    const parsed = portfolioSchema.safeParse(body.data);
    if (!parsed.success) return json({error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' ')}, 400);
    if (!Number.isSafeInteger(body.revision) || body.revision < 0) return json({error: 'Invalid content revision.'}, 400);
    const stamp = new Date().toISOString();
    const encoded = JSON.stringify(parsed.data);
    // An old editor must not recreate a missing record or overwrite a newer revision.
    const query = body.revision === 0
      ? database().prepare('INSERT INTO portfolio (id, data, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO NOTHING').bind('main', encoded, stamp)
      : database().prepare('UPDATE portfolio SET data = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?').bind(encoded, stamp, 'main', body.revision);
    const result = await query.run();
    if (!result.meta.changes) return json({error: 'The published content changed. Reload the Studio before publishing again.'}, 409);
    return json({revision: body.revision + 1, updatedAt: stamp});
  } catch {
    return json({error: 'Changes were not saved. Please try again.'}, 500);
  }
}
