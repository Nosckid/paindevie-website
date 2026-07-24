# Pain de Vie — Official Website

Website of **Pain de Vie Sarl**, premium frozen food importer and distributor in Cotonou, Benin.

**Live site:** [pain2vie.com](https://pain2vie.com)

## What this site is

A fast, single-page static website. No build step, no framework, no dependencies to install. What is in this folder is exactly what gets deployed.

- `index.html` — the entire website (content, styles, scripts, 4 languages)
- `thank-you.html` — confirmation page shown after the contact form is submitted
- `Images/` — every picture the site uses, sorted into folders
- `robots.txt`, `sitemap.xml` — search engine configuration
- `READ ME FIRST.txt` — plain-language instructions for updating photos (no code needed)

## Features

- **4 languages** (French, English, Spanish, Chinese) with automatic detection of the visitor's device language
- **Contact form** delivering inquiries directly to the company inbox (FormSubmit), with spam protection
- **SEO** structured data (WholesaleStore + full product catalogue), sitemap, localized titles
- **Responsive** layout for phones, tablets and desktops
- Accessible: keyboard navigation, skip link, reduced-motion support
- Total size ~1.5 MB, no external dependencies except Google Fonts

## Updating photos (non-technical)

See `READ ME FIRST.txt`. Short version: drop a picture named `photo.jpg` (or `.png` / `.jpeg` / `.webp`) into the matching folder inside `Images/`, redeploy, done. Empty supplier slots (09–14) activate automatically when a logo is added.

## Deployment (Cloudflare Pages)

1. Cloudflare Dashboard → Workers & Pages → Create → Pages
2. Connect to this repository (or drag the folder for direct upload)
3. Build settings: **none** (no build command, output directory `/`)
4. Attach the custom domain `pain2vie.com`

Any commit to `main` redeploys the site automatically when connected via Git.

## Contact

Pain de Vie Sarl · Irédé, Cotonou, Bénin · +229 01 69 29 64 92
