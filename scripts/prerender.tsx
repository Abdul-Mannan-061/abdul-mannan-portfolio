import assert from 'node:assert/strict';
import {readFile, writeFile, stat} from 'node:fs/promises';
import {renderToString} from 'react-dom/server';
import Portfolio from '../app/portfolio';
import {initialData, portfolioSchema} from '../app/content';
import {BASE_PATH, CMS_URL, SITE_URL, mediaUrl, isLocalMediaPath} from '../app/site';

// Check referenced uploads before publishing: a missing file must not replace the live site.
const media = [
  initialData.profile.photo, initialData.profile.resume,
  ...initialData.projects.flatMap(p => [p.cover, p.demo, p.repo]),
  ...initialData.highlights.flatMap(h => [h.attachment, h.credential]),
];
for (const path of new Set(media.filter(isLocalMediaPath))) {
  const source = await stat('public' + path).catch(() => null);
  assert(source?.isFile(), 'Uploaded file is missing from public' + path);
  const built = await stat('dist' + path).catch(() => null);
  assert(built?.isFile(), 'Uploaded file is missing from dist' + path);
}

// Exercise the CMS-to-page boundary, including select strings and cleared upload fields.
for (const [semester, label, completed] of [['6', '6th semester', '5 of 8 completed'], ['9', 'Graduated', '8 of 8 completed']]) {
  const edited = portfolioSchema.parse({
    ...initialData,
    education: {...initialData.education, semester},
    profile: {...initialData.profile, photo: null, resume: null},
  });
  const rendered = renderToString(<Portfolio initial={edited}/>).replace(/<!--[\s\S]*?-->/g, '');
  assert(rendered.includes(label) && rendered.includes(completed), 'CMS semester did not render correctly');
}
assert.equal(mediaUrl('/media/my certificate.pdf'), BASE_PATH + 'media/my%20certificate.pdf');
assert.equal(mediaUrl('https://example.com/file.pdf'), 'https://example.com/file.pdf');
assert.equal(isLocalMediaPath('/media/../private.txt'), false);

const escape = (value: string) => value.replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]!));
const title = initialData.profile.name + ' — Built with intent';
const description = initialData.profile.intro || initialData.profile.role;
const image = initialData.profile.photo
  ? new URL(mediaUrl(initialData.profile.photo), SITE_URL).href
  : '';
const metadata = [
  '<link rel="canonical" href="' + escape(SITE_URL) + '"/>',
  '<meta property="og:type" content="website"/>',
  '<meta property="og:title" content="' + escape(title) + '"/>',
  '<meta property="og:description" content="' + escape(description) + '"/>',
  '<meta property="og:url" content="' + escape(SITE_URL) + '"/>',
  ...(image ? ['<meta property="og:image" content="' + escape(image) + '"/>'] : []),
  '<meta name="twitter:card" content="summary"/>',
].join('\n    ');
let html = await readFile('dist/index.html', 'utf8');
assert(html.includes('<!--portfolio-html-->') && html.includes('<!--portfolio-meta-->'), 'HTML build markers are missing');
html = html
  .replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + escape(title) + '</title>')
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, () => '<meta name="description" content="' + escape(description) + '"/>')
  .replace('<!--portfolio-meta-->', () => metadata)
  .replace('<!--portfolio-html-->', () => renderToString(<Portfolio initial={initialData}/>));
assert(html.includes(escape(CMS_URL)), 'CMS edit link is missing');
assert(!html.includes('/api/portfolio') && !html.includes('href="/studio"'), 'Old backend link remains');
for (const match of html.matchAll(/(?:src|href)="(\/[^"]*)"/g)) {
  assert(match[1].startsWith(BASE_PATH), 'An asset is missing the GitHub Pages base path: ' + match[1]);
}
await writeFile('dist/index.html', html);
console.log('Validated CMS edits, upload paths, semester progression and static HTML.');
console.log('Portfolio build ready: ' + SITE_URL);
