# Abdul Mannan — Portfolio

The original cream, olive and copper portfolio, now built as a static website for GitHub Pages. Profile details, education, projects, certificates, experience and skills are edited through Pages CMS.

**Website after Pages is enabled:** https://abdul-mannan-061.github.io/abdul-mannan-portfolio/  
**Editor:** https://app.pagescms.org/Abdul-Mannan-061/abdul-mannan-portfolio/main/file/portfolio

## One-time setup

1. In this repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Open **Actions → Deploy portfolio → Run workflow**, select `main`, and run it. A successful deployment makes the website available at the address above.
3. Open https://app.pagescms.org and sign in with GitHub. Install the Pages CMS GitHub App for **only this repository**, then select this repository and the `main` branch.
4. Open **Edit portfolio**. The `.pages.yml` configuration already supplies all the editing forms.

No database, Cloudflare account, hosting secret, API token or payment card is required by this setup. GitHub Pages is available on GitHub Free for public repositories, and the hosted Pages CMS currently offers free access. Provider plans and service limits can change; this is not a promise of unlimited or lifetime hosting. Your source and content remain in your GitHub repository.

## Edit your portfolio

Use the **Edit portfolio** link in the website footer to open the GitHub-authenticated CMS.

- **Semester:** Education & semester → Current semester → select 6th, 7th, 8th or Graduated.
- **Certificate:** Achievements & certificates → add an item → enter its title, issuer, date and type → upload a PDF/image or add an issuer verification link.
- **Profile:** change your introduction, contact details, photo or résumé.
- **Projects:** add or reorder entries, upload covers, set technologies and add live/source links.
- **Experience and skills:** add, edit, reorder or remove entries.
- **Web3 lab:** use its toggle to show or hide the section.

Save in Pages CMS. This creates a GitHub commit and starts deployment. Wait for **Deploy portfolio** to finish successfully, then refresh the website. An already open tab does not receive database-style live updates. If validation fails, the last successful deployment stays online; the Actions log identifies the field or missing file to fix.

All published content and uploaded media in this public repository are public. GitHub history also retains earlier committed versions.

## Use the VS Code terminal

Work in the new `abdul-mannan-portfolio-pages` folder. Node.js 24 is supported.

```powershell
git pull --ff-only origin main
npm ci
npm run dev
```

Open the address printed by Vite, including the `/abdul-mannan-portfolio/` suffix.

To check the production build locally:

```powershell
npm run build
npm run preview
```

Before editing locally, pull any changes saved through Pages CMS. To publish a local change, commit the specific changed files and push to `main`. The workflow builds and deploys automatically.

## Tech stack and files

- React 19 + TypeScript + Vite.
- Custom responsive CSS and Lucide icons.
- Zod content validation.
- Static HTML prerendering for initial content and page metadata.
- GitHub Pages hosting, GitHub Actions deployment, Pages CMS editing.

`app/initial-content.json` holds the editable content. `.pages.yml` defines the editor. `public/media/` holds uploads. `app/portfolio.tsx` and `app/globals.css` preserve the original presentation.

The former Cloudflare APIs, Owner Studio and server dependencies have been replaced by GitHub-backed content editing. The original source remains available in Git history.

The Web3 lab reads a connected wallet's public address/network and computes SHA-256 file fingerprints locally. It does not request transactions or signatures. Optional certificate fingerprints compare file bytes; they do not verify the issuer or publish an on-chain record.

## Change the address later

Update `BASE_PATH`, `SITE_URL` and `CMS_URL` in `app/site.ts` if you rename the repository, move accounts or add a custom domain. For a custom domain, use `BASE_PATH = '/'` and configure the domain in GitHub Pages.

Official references: [Vite deployment](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Pages CMS](https://pagescms.org/docs/).
