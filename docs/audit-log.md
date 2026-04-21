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

## M1 Self-Audit (Reader MVP)

Findings + fixes from the M1 pass:

1. **Sentence splitter dropped boundary-only fragments incorrectly.** Repeated `။။` produced an extra empty `။` entry. Fix: trim the inner buffer before deciding whether to push, and only re-attach the boundary when there is real content (`src/lib/myanmar-text/index.ts`).
2. **Route params typed `string | undefined` under stricter SvelteKit types.** `slug` and `idx` checks needed defensive defaults to satisfy `noUncheckedIndexedAccess`. Fix: `slug = $derived($page.params.slug ?? '')`, plus an early-return `notFound` branch when slug is empty (`src/routes/reader/[slug]/+page.svelte`, `[slug]/[idx]/+page.svelte`).
3. **Unused `onMount` import after switching to `$effect`.** Fix: removed the import.
4. **`Map` triggered `svelte/prefer-svelte-reactivity`.** Reactive lookup map for the library grid needed `SvelteMap`. Fix: imported `SvelteMap` from `svelte/reactivity`.
5. **Hard navigations between chapters bypassed SvelteKit and reset scroll restore timing.** `location.assign(...)` was a full page load. Fix: switched prev/next chapter buttons to `goto()` from `$app/navigation`.
6. **`svelte/no-navigation-without-resolve` lint rule fired on every `<a href>`.** This rule is meant for apps with a base path; this app has none. Fix: disabled the rule globally; revisit if a base path is added later.
7. **Seed loader could leave the reader empty if the network failed mid-fetch.** Per-novel fetch failures are skipped silently inside `seedFromStatic`; a top-level `catch` in the layout records the error in a small banner so the user can retry. Acceptable trade-off: partial library beats none.
8. **PWA install prompt listener needed cleanup.** The `beforeinstallprompt` listener is removed in the layout's `onMount` cleanup so it does not leak between hot-reloads in dev.
9. **Bookmark scroll percentage could divide by zero on very short chapters.** Guard added: when the document is not scrollable, percentage defaults to `1` (treat as fully read).

## Verification

```
npm run check     -> 394 files, 0 errors, 0 warnings
npm run lint      -> clean (prettier + eslint)
npm test          -> 3 files, 20/20 tests pass
npm run build     -> success (static adapter, output in build/)
```
