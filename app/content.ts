import initialContent from './initial-content.json';
import { z } from 'zod';
import { isLocalMediaPath } from './site';

const emptyString = (value: unknown) => value == null ? '' : value;
const line = z.preprocess(emptyString, z.string().max(300));
const requiredLine = z.string().trim().min(1).max(300);
const paragraph = z.preprocess(emptyString, z.string().max(5000));
const url = z.preprocess(emptyString, z.string().max(1500).refine(value => {
  if (!value || isLocalMediaPath(value)) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
}, 'Use an https:// link or select an uploaded file.'));
const id = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
const list = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z.preprocess(value => value == null ? [] : value, z.array(item).max(max));

export const portfolioSchema = z.object({
  profile: z.object({
    name: requiredLine, role: requiredLine, location: line, availability: line,
    headline: requiredLine, accent: requiredLine, intro: paragraph, about: paragraph,
    email: z.preprocess(emptyString, z.string().email().or(z.literal(''))),
    github: url, linkedin: url, photo: url, resume: url,
  }),
  education: z.object({
    institution: line, degree: line, campus: line,
    startYear: z.coerce.number().int().min(1900).max(2200),
    endYear: z.coerce.number().int().min(1900).max(2200),
    // Pages CMS select fields store strings; the UI consistently uses numbers.
    semester: z.coerce.number().int().min(1).max(9),
  }),
  projects: list(z.object({
    id, title: requiredLine,
    category: z.enum(['Mobile & IoT', 'Web development', 'AI & automation', 'Web3']),
    year: line, summary: paragraph, detail: paragraph, role: line, status: line,
    tech: list(line, 20),
    visual: z.enum(['gridmote', 'transit', 'robot', 'custom']),
    cover: url, demo: url, repo: url,
  }), 40),
  experience: list(z.object({
    id, role: requiredLine, company: line, period: line, description: paragraph,
  }), 20),
  highlights: list(z.object({
    id, title: requiredLine, issuer: line, date: line,
    kind: z.enum(['Milestone', 'Certificate', 'Achievement']),
    description: paragraph, attachment: url, credential: url,
    fingerprint: z.preprocess(emptyString, z.string().regex(/^[a-f0-9]{64}$/).or(z.literal(''))),
  }), 60),
  skills: list(z.object({ id, title: requiredLine, items: list(line, 40) }), 12),
  labEnabled: z.preprocess(value => value == null ? true : value, z.boolean()),
}).superRefine((value, ctx) => {
  if (value.education.endYear < value.education.startYear)
    ctx.addIssue({code: 'custom', message: 'End year must follow the start year.', path: ['education', 'endYear']});
  for (const key of ['projects', 'experience', 'highlights', 'skills'] as const) {
    const ids = value[key].map(item => item.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({code: 'custom', message: 'Each entry needs a unique ID.', path: [key]});
  }
});

export type PortfolioData = z.infer<typeof portfolioSchema>;
export type Project = PortfolioData['projects'][number];
export type Highlight = PortfolioData['highlights'][number];
export const initialData: PortfolioData = portfolioSchema.parse(initialContent);
export function semesterLabel(n: number) {
  return n === 9 ? 'Graduated' : `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} semester`;
}
