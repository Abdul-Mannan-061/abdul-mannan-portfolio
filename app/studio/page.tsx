import {ownerIdentity, readPortfolio} from '../server';
import Studio from './studio';
export const dynamic = 'force-dynamic';
export const metadata = {title: 'Owner Studio — Abdul Mannan', robots: {index: false, follow: false}};

export default async function StudioPage() {
  const user = await ownerIdentity();
  if (!user) return <main className="access-message"><h1>Owner access required.</h1><p>The Studio is available only to the verified portfolio owner.</p><a href="/">Back to portfolio →</a></main>;
  const record = await readPortfolio();
  return <Studio initial={record.data} initialRevision={record.revision} updatedAt={record.updatedAt} ownerName={user.displayName}/>;
}
