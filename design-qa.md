# Speakers section QA

- Reference: `.qa/speakers-reference.png`. On desktop, scrolling the page moves the speaker track. On phones, the cards form a continuously looping marquee with the same card ratio as desktop and no pinned empty travel below the row. Tapping a card or the visible pause button freezes the row for reading; tapping again resumes it.
- Current desktop capture: `.qa/speakers-scroll-qa.png` at 1280 × 720 px, taken during vertical scrolling.
- All ten saved speaker cards and photographs remain unchanged.

The speaker stage pins while the page scrolls, and the cards translate horizontally from the first card through the last. At 1280 × 720 px the stage is about 669 px high. The horizontal travel is about 2148 px over 1396 px of vertical scrolling, which keeps the section shorter than the earlier pinned version. The stage uses 5vw vertical padding and is centered in the viewport while pinned.

Browser checks: at the start of the desktop section, the track offset is 0; after one page of scrolling, it is about −903 px; at the end, it reaches −2148 px and the final card's right edge remains inside the 1280 px viewport. On a 390 × 844 px phone, cards measure about 308 × 419 px, matching the desktop 25:34 width-to-height ratio, and the section is about 626 px high. Photos now fill almost the entire inner card width: 276 px on most cards, 267 px on cards with longer descriptions, while retaining 16 px bottom padding. The following gallery begins immediately after the section. The 10-card loop takes 30 seconds; the second copy begins exactly one loop distance after the first (3240.94 px), making the repeat seamless. At 320 × 568 px, cards measure about 253 × 344 px, with photos automatically sized between 159 and 221 px to preserve the full text and padding. There is no page-wide overflow. Reduced-motion visitors see one normal-flow copy of the cards. The production build passes (`npm run build`).

final result: passed
