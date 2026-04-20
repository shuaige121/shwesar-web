# Salvage Manifest From ShweSar v1

Source archive: `/mnt/d/projects/myanmar-reader`

This document records what should be carried forward conceptually or as assets from the Flutter and Rust v1 prototype. The archive is read-only for this reboot.

## Directly Salvaged Assets

- `shwesar_logo.png` copied to `static/brand/shwesar_logo.png`.
- `shwesar_banner.png` copied to `static/brand/shwesar_banner.png`.
- `shwesar_splash.png` copied to `static/brand/shwesar_splash.png`.
- `frontend/assets/fonts/Padauk-Regular.ttf` copied to `static/fonts/Padauk-Regular.ttf`.
- `frontend/assets/fonts/Padauk-Bold.ttf` copied to `static/fonts/Padauk-Bold.ttf`.

## Concepts Worth Keeping

- Local book import supports plain text files and pasted text.
- Local content metadata is separate from full text storage.
- Chapter detection combines Myanmar chapter headings, English chapter headings, CJK-style headings, and generic numbered lines.
- When no chapter headings are found, the reader falls back to approximate sections around 3,000 characters and prefers nearby paragraph breaks.
- Reading progress is stored per novel or local book with chapter number or chapter index plus scroll offset.
- Reader settings include font size and night mode.
- Bookmarks are stored per local book with chapter index, character offset, optional note, and creation time.
- Myanmar TTS attempts to split text into sentence units using the Myanmar full stop `။`.
- TTS state separates stopped, playing, and paused states for UI updates.
- Audio playback in the reader used a chapter audio URL and play or stop toggle.

## Backend Ideas To Revisit Later

- Rust workspace separation into API, domain, database, and storage crates.
- Domain models for users, novels, chapters, bookmarks, and progress.
- SQL migrations for users, novels, chapters, bookmarks, and reading progress.
- Route groups for novels, chapters, bookmarks, auth, and admin.

These backend pieces are not part of the initial web scaffold because the first milestone should prove offline reader and audio behavior in the browser.

## Ideas To Leave Behind

- Flutter Web CanvasKit for the core reader.
- Native-first architecture before the PWA behavior is proven.
- Rust service scaffolding before there is a stable content and sync contract.
- Web TTS assumptions from Flutter that do not translate cleanly to browser PWA behavior.

## New Web Mapping

- SharedPreferences and local files become IndexedDB records managed through Dexie.
- Flutter `ScrollController` progress becomes browser scroll offset or element-relative progress.
- Flutter TTS and audio player state becomes a Howler plus Media Session player module.
- Flutter routes become SvelteKit routes under `reader`, `audiobooks`, `courses`, and `library`.
- Padauk remains local and browser-native through `@font-face`.
