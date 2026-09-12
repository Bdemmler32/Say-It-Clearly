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

## How levels work

- Levels 1–20 are always easy, so new players ease in.
- From level 21 on, difficulty (easy/medium/hard) is picked at random
  each time that level is generated — but *deterministically*, using a
  seeded pseudo-random function of the level number. That means level 47
  is always the same difficulty and the same phrase for a given player,
  without the game needing to store a giant map — only your progress
  (points + which levels you've done) is saved.
- Completing a level awards points: **1 for easy, 2 for medium, 3 for
  hard.**
- Skipping a level costs **10 points** and is available any time you
  have enough.
- To add levels, just add more phrases to `phrases.js` — the game pulls
  from whichever difficulty pool it needs and will keep generating new
  levels indefinitely as the map scrolls.

## Speech recognition

Uses the browser's native `SpeechRecognition` (Web Speech API) — no
external API keys or services. As you speak, words in the phrase turn
green in order as they're recognized. There's no text input fallback
by design — if the browser doesn't support speech recognition, the mic
is hidden and a message explains it (you can still use the point-based
skip to move on).

Best support: Chrome on Android/desktop, Safari on iOS/macOS. Requires
mic permission and (for most browsers) HTTPS — which GitHub Pages
gives you automatically.

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
