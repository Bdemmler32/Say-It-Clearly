# Say It — speak-the-phrase game

A mic-only pronunciation game. Levels are laid out as a vertical map —
level 1 at the bottom, harder levels as you climb. No keyboard input
anywhere; you complete a level by speaking the phrase into your device's
microphone.

## Files

- `index.html` — page shell
- `style.css` — all styling (mobile-first, desktop layout kicks in above 900px)
- `phrases.js` — **the phrase database** (built from your
  `Vocabulary_Phrase_Test_250_No_Repetition.xlsx`). 250 phrases tagged
  with a difficulty (`easy` / `medium` / `hard`) and a `focus` — the
  challenge vocabulary words embedded in that sentence (comma-separated,
  e.g. `meticulous, curator, cataloged, obscure`). 75 easy / 100 medium
  / 75 hard, no repeated phrases or challenge terms.
- `app.js` — game logic: level generation, points, speech recognition,
  settings, storage.
- `manifest.json` — makes the game installable as an app (PWA).
- `sw.js` — service worker for offline support and cache control.
- `icons/` — app icons for the home screen / install prompt.

## Installing it as an app (PWA)

This is now an installable Progressive Web App. On Android Chrome,
visiting the site shows an "Install app" option (or ⋮ menu → "Add to
Home screen"). On iPhone Safari, use the Share button → "Add to Home
Screen". Either way it launches full-screen, without browser chrome,
using the icon in `icons/`.

## Fixing stale/cached files after you push an update

This was a recurring headache before the service worker existed:
GitHub Pages + mobile browsers can cache old JS aggressively, so a
pushed update wouldn't show up without a manual hard-refresh. `sw.js`
fixes this two ways:

1. **Network-first fetching** for the game's own files — the service
   worker always tries to fetch the live version first and only falls
   back to a cached copy if there's no connection. So as long as
   someone's online, they get your latest push automatically. This is
   the main fix.
2. **A version number as a backup**: at the top of `sw.js`,
   `const VERSION = 'v1'` — **bump this string every time you push a
   change** (v1 → v2 → v3...). This makes the browser treat it as a
   brand-new service worker, which wipes out the old cache entirely on
   activation, and the page auto-reloads once the new one takes over.
   It's belt-and-suspenders on top of #1, not strictly required for
   correctness, but costs nothing and keeps things tidy.

If something ever still looks stale despite this, an incognito/private
tab always bypasses all caching and is the fastest way to confirm
whether a given change is actually live.

## How levels work

- Levels 1–20 are always easy, so new players ease in.
- From level 21 on, difficulty (easy/medium/hard) is picked at random
  each time that level is generated — but *deterministically*, using a
  seeded pseudo-random function of the level number. That means level 47
  is always the same difficulty and the same phrase for a given player,
  without the game needing to store a giant map — only your progress
  (points + which levels you've done) is saved.
- Completing a level awards points: **1 for easy, 2 for medium, 3 for
  hard.** Using the "Hear it" pronunciation hint on a level means that
  completion earns 0 points (you still progress, just no reward) —
  try again later without the hint to earn points on that level.
- Skipping a level costs **10 points** and is available any time you
  have enough.
- The map always opens centered on whichever level you're currently
  on, not level 1 — so refreshing or coming back doesn't lose your place.
- To add levels, just add more phrases to `phrases.js` — the game pulls
  from whichever difficulty pool it needs and will keep generating new
  levels indefinitely as the map scrolls.

## Practice mode

The floating "Practice" button opens a separate, points-free mode that
shuffles through every phrase in the database (filterable by Easy/
Medium/Hard). It uses the exact same mic and word-highlighting engine
as Levels — say the phrase, watch words turn green — but there's no
progression: the arrows always move freely whether or not you got the
current card right.

## Speech recognition

Uses the browser's native `SpeechRecognition` (Web Speech API) — no
external API keys or services. As you speak, each word in the phrase
turns yellow (up next), green (correct), or red (didn't match) in
real time. There's no text input fallback by design — if the browser
doesn't support speech recognition, the mic is hidden and a message
explains it (you can still use the point-based skip on Levels, or just
browse cards with the arrows in Practice).

Hyphenated words (e.g. "low-roofed") are matched as their separate
spoken parts, not as one glued-together word, since that's how people
actually say them — they still render as a single hyphenated word on
the card, but each half can be marked correct/incorrect independently.

### Pronunciation help ("Hear it")

If a word comes back marked wrong, a "🔊 Hear it" button appears and
reads that word aloud using the browser's built-in text-to-speech.
Using it on a level means that level completes without earning points
(you still progress) — it's a hint, not a shortcut. In Practice mode
there's no points system, so it's just there to help, with no cost.
In Practice, you can also tap any word directly to hear it — no need
to wait for a mistake.

### Definitions

Tap any word on a card (in either Levels or Practice) to look up its
definition — shown right on the card with a close (✕) button, no
separate app needed. Definitions come from Wikimedia's Wiktionary REST
API first (reliable CORS support), falling back to a second free API
if that's unavailable. Many sentence words are inflected forms
("remade," "studies"), and dictionaries often just say "past tense of
remake" for those — when every candidate definition is just an
inflection pointer like that, the lookup chases it back to the real
word and shows its actual meaning instead. Word text has native
text-selection disabled so your phone's built-in "Look Up" popup
doesn't fire and conflict with this. Hyphenated words ("low-roofed")
are spoken and defined as the whole compound, not as orphaned halves.

A word only turns red once the recognizer has actually *finalized*
hearing something else there — not from a fleeting interim guess while
you're still mid-word, which previously caused false "wrong" flags on
longer words.

Best support: Chrome on Android/desktop, Safari on iOS/macOS. Requires
mic permission and (for most browsers) HTTPS — which GitHub Pages
gives you automatically.

### If "Hear it" or tap-to-hear produce no sound

This is a genuinely tricky one to debug without a physical device, and
speech synthesis bugs are common and inconsistent across mobile
browsers. Settings has a "Test sound" button to check independent of
gameplay. If that's also silent, the most common real-world causes are:

- **iPhone**: the physical mute switch on the side silences this, even
  with the volume turned up — this is different from the
  Accessibility → Spoken Content setting.
- **Android Chrome**: the site's "Sound" permission can be individually
  blocked under Site settings, separate from the device's system-level
  text-to-speech engine.
- Some in-app browsers (opening a link inside Instagram, Facebook,
  etc.) restrict speech APIs beyond what a normal browser allows — try
  opening the link in Safari/Chrome directly if you're testing inside
  one of those.

## Storage

Progress and font settings are saved with `localStorage`, so they
persist per-browser once this is hosted. (If you're previewing this
inside a Claude.ai artifact, it transparently uses Claude's own
sandboxed storage instead — see the `Store` object at the top of
`app.js`.)

## Hosting on GitHub Pages

1. Push these four files to a repo.
2. In the repo settings, enable **GitHub Pages** for the branch/folder
   containing `index.html`.
3. Visit the generated `https://<you>.github.io/<repo>/` URL — speech
   recognition requires the HTTPS that Pages provides.

## Extending later

- `phrases.js` is deliberately flat data — easy to swap in a fetch from
  a real API or CMS later without changing `app.js`.
- The `focus` field lists the challenge vocabulary words in each
  phrase, comma-separated — useful for a future definition lookup or
  "word of the day" mode keyed off the same field.
