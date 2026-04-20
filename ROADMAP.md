# Roadmap

## M1: Reader MVP, 2 Weeks

- Ship the SvelteKit PWA shell with installable manifest and service worker.
- Preload around 10 Myanmar reading pieces for the first library.
- Store reader content, bookmarks, and progress offline with IndexedDB.
- Tune Padauk typography, font size controls, and long chapter scrolling.
- Validate low-bandwidth behavior on desktop Chrome, Android Chrome, and iOS Safari.

## M2: Audio Player And Background Playback, 3 Weeks

- Add Howler-backed playback for audiobooks and courses.
- Persist playback position per chapter or lesson.
- Add Media Session metadata, play, pause, seek, next, and previous actions.
- Confirm lock-screen controls and background behavior across Android, iOS Safari PWA, and desktop browsers.
- Add download state for audio lessons and a cache management surface.

## M3: Capacitor iOS And Android Packaging, 2 Weeks

- Initialize Capacitor iOS and Android platforms.
- Wire app icons, splash assets, and native permissions.
- Test packaged offline storage and media playback.
- Prepare store listing assets and privacy disclosures.
- Produce internal builds for device testing.
