# ShweSar Web

ShweSar is a Myanmar-first offline reading and listening app built as a SvelteKit PWA with a later Capacitor mobile wrapper.

## Product Positioning

ShweSar has two product legs:

- Reader: Myanmar novels and long-form reading with offline storage, comfortable Padauk typography, bookmarks, and saved progress.
- Courses: Audio lectures for hands-busy listeners, including people listening while doing chores, commuting, cooking, or working away from a screen.

The same library model should support text chapters, audiobooks, and course lessons. The first web release prioritizes low bandwidth, offline installability, readable Myanmar text, and fast product iteration.

## Target Users

- Myanmar general readers who want novels and serialized content that still works on weak networks.
- Audiobook listeners who want to resume chapters without hunting for the last played point.
- Hands-busy listeners such as housekeepers, drivers, and shop workers who need background playback and lock-screen controls.
- Operators who need a web stack that is easier to ship and maintain than the previous Flutter and Rust prototype.

## Tech Stack

- SvelteKit with TypeScript for the web app shell.
- Tailwind CSS for fast interface work and a shared Padauk font stack.
- vite-plugin-pwa for installability and service worker generation.
- Dexie for IndexedDB-backed offline storage.
- Howler.js for audio playback.
- Capacitor installed for future iOS and Android packaging; native platforms are not initialized yet.
- Padauk fonts are served locally from `static/fonts`.

## Tech Decision Record

The v1 Flutter and Rust codebase was retired for this reboot.

Reasons:

- The combined Flutter, Rust, SQLx, mobile, and web surface was too heavy for the near-term Reader and Courses MVP.
- Flutter Web CanvasKit is a poor fit for a text-heavy reader because selectable text, browser accessibility, font behavior, bundle size, and low-end device performance matter more than canvas rendering.
- Product velocity matters now: SvelteKit makes content pages, PWA behavior, static assets, and browser-native text behavior easier to inspect and ship.
- Rust backend concepts can still inform data models later, but the first milestone should prove the reading and audio experience before reintroducing server complexity.

## Development

Install dependencies:

```sh
npm install
```

Run the web app:

```sh
npm run dev
```

Build and check:

```sh
npm run build
npm run check
```

## Mobile Packaging

Capacitor is present through `@capacitor/core`, `@capacitor/cli`, and `capacitor.config.ts`. iOS and Android platforms will be added in milestone M3 after the PWA shell and audio behavior are stable.

## Security And Privacy

The app currently sets baseline security headers through `src/hooks.server.ts`, including a report-only CSP placeholder. Future releases need a real privacy policy that covers offline storage, imported content, analytics, crash reporting, and account data before production launch.

## Content Licensing

Novel, audiobook, and course content must be owned, licensed, public domain, or explicitly permitted for distribution. Imported user files should remain local unless the user intentionally syncs or uploads them in a later release.

## License

No source license has been chosen yet. Treat this repository as all rights reserved until Leonard selects an explicit license.
