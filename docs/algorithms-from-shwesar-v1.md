# Algorithms From ShweSar v1

These are implementation notes only. They intentionally avoid copying code from the v1 archive.

## Chapter Detection

The v1 importer scans plain text for common chapter-like headings.

Detected heading families:

- Myanmar headings such as `အခန်း ၁` and variants with Myanmar or Arabic numerals.
- English headings such as `Chapter 1`.
- CJK-style headings such as first chapter markers using `第...章`.
- Short generic numbered title lines such as `1. Title` or `1) Title`.

All matches are collected with their character offsets, sorted, and converted into chapter ranges. If the first heading appears after an opening block, that opening block becomes a preface. If no headings are found, the importer creates approximate sections around 3,000 characters and prefers a nearby blank-line paragraph break.

## Myanmar Sentence Splitting

The v1 TTS flow splits Myanmar text on the Myanmar full stop `။`, trims each segment, and drops empty segments. This is useful for basic sentence-by-sentence playback and highlighting, but later web work should also consider question marks, abbreviations, dialogue, and mixed Myanmar or English punctuation.

## Scroll Progress

The v1 reader stores progress as chapter identity plus scroll offset. Saves are debounced for about two seconds after scrolling. On reload, the reader waits until content is rendered, then clamps the saved offset to the current maximum scroll range before jumping.

The web version should preserve this behavior with browser scroll containers and IndexedDB. It should also consider normalized progress for layout changes caused by font size, viewport, or line-height changes.

## TTS Pipeline

The v1 prototype has two TTS directions:

- Platform TTS checks whether Myanmar is supported, sets `my-MM` when available, and speaks sentence units in sequence.
- Local TTS was planned for native builds using an on-device model, with web marked unavailable.

For ShweSar Web, recorded audio and course lectures are the primary near-term path. Browser speech synthesis can remain a later accessibility enhancement, while native on-device TTS belongs in the Capacitor phase only if it proves necessary.
