import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type OwnerIdentity = {userId: string; email: string; displayName: string};
let cachedIssuer = '';
let cachedKeys: ReturnType<typeof createRemoteJWKSet> | undefined;

// Access headers are untrusted until their signature and claims are verified.
// Missing configuration always keeps the Studio locked, including in development.
export async function ownerIdentity(requestHeaders?: Headers): Promise<OwnerIdentity | null> {
  const issuer = env.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/, '');
  const audience = env.CF_ACCESS_AUD?.trim();
  const expectedEmail = env.PORTFOLIO_OWNER_EMAIL?.trim().toLowerCase();
  if (!issuer || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)
      || !audience || !expectedEmail) return null;

  const incoming = requestHeaders ?? await headers();
  const token = incoming.get('cf-access-jwt-assertion');
  if (!token || token.length > 16384) return null;

  try {
    if (!cachedKeys || cachedIssuer !== issuer) {
      cachedKeys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), {
        timeoutDuration: 5000,
        cooldownDuration: 30000,
        cacheMaxAge: 600000,
      });
      cachedIssuer = issuer;
    }
    const {payload} = await jwtVerify(token, cachedKeys, {
      issuer,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'sub', 'email'],
      clockTolerance: 5,
    });
    if (typeof payload.email !== 'string' || payload.email.toLowerCase() !== expectedEmail
        || !payload.sub || typeof payload.iat !== 'number' || payload.iat > Date.now() / 1000 + 5) return null;
    return {userId: payload.sub, email: payload.email, displayName: payload.email};
  } catch {
    return null;
  }
}
