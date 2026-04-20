# Audit Log

## Bootstrap Self-Audit

Findings fixed in this scaffold:

1. TypeScript strictness needed more than the default `strict` flag. Added `exactOptionalPropertyTypes`, `noImplicitOverride`, and `noUncheckedIndexedAccess`.
2. PWA metadata needed a Burmese name, theme color, start URL, service worker scope, and icons. Added the vite-plugin-pwa manifest and root scope.
3. Padauk needed to be proven through both Tailwind and global CSS. Added `@font-face`, imported global CSS, and set Tailwind font families.
4. Security headers needed a placeholder. Added baseline headers and a report-only CSP in `src/hooks.server.ts`.
5. README needed license, content licensing, privacy, and mobile packaging notes. Added all sections.
6. Capacitor needed a config sketch without mobile platform initialization. Added `capacitor.config.ts`.
7. Route placeholders needed visible rendered content. Added visible pages for reader, audiobooks, courses, and library.
8. Lighthouse basics needed robots and sitemap coverage. Updated `robots.txt` and added `sitemap.xml`.
9. Service worker scope needed to be explicit. Set PWA `scope` and manifest `scope` to `/`.
10. Scaffold markers needed to be absent before commit. Checked for common unfinished-work markers and removed none because none were present in project-authored files.
11. PWA Workbox patterns initially targeted the wrong SvelteKit output root. Replaced them with root-relative client output patterns.
12. Capacitor `webDir` needed to match the build output. Switched to SvelteKit static adapter output in `build`.

Verification commands for this audit are recorded in the final run output, alongside build and check results.
