import type {Metadata} from 'next';
import {env} from 'cloudflare:workers';
import './globals.css';

export function generateMetadata(): Metadata {
  let metadataBase: URL | undefined;
  try {
    const candidate = new URL(env.PUBLIC_SITE_URL || '');
    if (candidate.protocol === 'https:') metadataBase = candidate;
  } catch {}
  return {
    title: 'Abdul Mannan — Built with intent',
    description: 'Software engineering, thoughtful interfaces, and things that connect. The portfolio of Abdul Mannan, a software engineering student at COMSATS.',
    metadataBase,
    icons: {icon: '/favicon.svg'},
    openGraph: {title: 'Abdul Mannan — Built with intent', description: 'A little curiosity. A lot of building.', type: 'website'},
  };
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
