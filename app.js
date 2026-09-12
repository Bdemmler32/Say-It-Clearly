/* ===========================================================
   Say It — app.js
   Level map + points economy + native speech recognition.
   Depends on phrases.js being loaded first (defines PHRASES).
   =========================================================== */

// -----------------------------------------------------------
// Storage adapter.
// Uses the Claude.ai artifact storage API when it's present (preview
// inside a Claude chat), and falls back to localStorage everywhere
// else — which is what runs once this is hosted on GitHub Pages.
// -----------------------------------------------------------
const Store = {
  async get(key, fallback) {
    try {
      if (window.storage) {
        const r = await window.storage.get(key, false);
        return r ? JSON.parse(r.value) : fallback;
      }
    } catch (e) { /* key not found or storage unavailable */ }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  async set(key, value) {
    try {
      if (window.storage) {
        await window.storage.set(key, JSON.stringify(value), false);
        return;
      }
    } catch (e) { /* fall through to localStorage */ }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* ignore */ }
  }
};

// -----------------------------------------------------------
// Deterministic level generation.
// The map has exactly as many levels as there are phrases in the
// database (PHRASES.length) — one level per phrase, no more.
// Levels 1–20 are always "easy". From level 21 on, difficulty is
// derived from a seeded pseudo-random number so the map is stable
// (same level always has the same difficulty/phrase) without ever
// needing to store the map itself — only the player's progress.
// Within each difficulty, phrases are handed out from a shuffled,
// non-repeating cycle so you don't see the same phrase twice before
// you've seen every other phrase of that difficulty.
// -----------------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seed) {
  const rand = mulberry32(seed);
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const POOLS = {
  easy: PHRASES.filter(p => p.difficulty === 'easy'),
  medium: PHRASES.filter(p => p.difficulty === 'medium'),
  hard: PHRASES.filter(p => p.difficulty === 'hard'),
};

const SHUFFLED_POOLS = {
  easy: seededShuffle(POOLS.easy, 111),
  medium: seededShuffle(POOLS.medium, 222),
  hard: seededShuffle(POOLS.hard, 333),
};

const POINTS_FOR = { easy: 1, medium: 2, hard: 3 };
const SKIP_COST = 10;
const FIXED_EASY_LEVELS = 20;
const TOTAL_LEVELS = PHRASES.length;

function difficultyForLevel(n) {
  if (n <= FIXED_EASY_LEVELS) return 'easy';
  const r = mulberry32(n * 2654435761)();
  if (r < 1 / 3) return 'easy';
  if (r < 2 / 3) return 'medium';
  return 'hard';
}

// Precompute the full map once: difficulty + phrase per level, 1..TOTAL_LEVELS.
const LEVELS = (function buildLevels() {
  const counters = { easy: 0, medium: 0, hard: 0 };
  const levels = [null]; // 1-indexed
  for (let n = 1; n <= TOTAL_LEVELS; n++) {
    const difficulty = difficultyForLevel(n);
    const pool = SHUFFLED_POOLS[difficulty];
    const phrase = pool[counters[difficulty] % pool.length];
    counters[difficulty]++;
    levels.push({ difficulty, phrase });
  }
  return levels;
})();

function levelPhrase(n) {
  return LEVELS[n];
}

const MILESTONES = {};

// -----------------------------------------------------------
// Game state
// -----------------------------------------------------------
const state = {
  points: 0,
  levelStatus: {},   // { [levelIndex]: 'completed' | 'skipped' }
  font: 'handwritten',
  autoPlay: false,
  openLevel: null,
};

const FONT_OPTIONS = [
  { id: 'handwritten', label: 'Handwritten', family: "'Caveat', cursive" },
  { id: 'clear', label: 'Clear print (accessible)', family: "'Atkinson Hyperlegible', sans-serif" },
  { id: 'simple', label: 'Simple sans', family: "'Work Sans', sans-serif" },
  { id: 'bold', label: 'Bold block', family: "'Baloo 2', sans-serif" },
];

function unlockedLevel() {
  const keys = Object.keys(state.levelStatus).map(Number);
  const n = keys.length ? Math.max(...keys) + 1 : 1;
  return Math.min(n, TOTAL_LEVELS);
}

async function loadState() {
  state.points = await Store.get('points', 0);
  state.levelStatus = await Store.get('levelStatus', {});
  state.font = await Store.get('font', 'handwritten');
  state.autoPlay = await Store.get('autoPlay', false);
}

async function persistProgress() {
  await Store.set('points', state.points);
  await Store.set('levelStatus', state.levelStatus);
}

async function persistFont() {
  await Store.set('font', state.font);
}

async function persistAutoPlay() {
  await Store.set('autoPlay', state.autoPlay);
}

// -----------------------------------------------------------
// DOM references
// -----------------------------------------------------------
const el = {
  pointsValue: document.getElementById('pointsValue'),
  mapTrack: document.getElementById('mapTrack'),
  mapWrap: document.getElementById('mapWrap'),
  practiceOverlay: document.getElementById('practiceOverlay'),
  welcomeOverlay: document.getElementById('welcomeOverlay'),
  playBtn: document.getElementById('playBtn'),
  levelPill: document.getElementById('levelPill'),
  card: document.getElementById('card'),
  cardText: document.getElementById('cardText'),
  cardFocusTag: document.getElementById('cardFocusTag'),
  micBtn: document.getElementById('micBtn'),
  micStatus: document.getElementById('micStatus'),
  micArea: document.getElementById('micArea'),
  hearBtn: document.getElementById('hearBtn'),
  definitionPanel: document.getElementById('definitionPanel'),
  definitionWord: document.getElementById('definitionWord'),
  definitionText: document.getElementById('definitionText'),
  definitionClose: document.getElementById('definitionClose'),
  noSupportMsg: document.getElementById('noSupportMsg'),
  resultBanner: document.getElementById('resultBanner'),
  skipBtn: document.getElementById('skipBtn'),
  nextBtn: document.getElementById('nextBtn'),
  backBtn: document.getElementById('backBtn'),
  practiceFab: document.getElementById('practiceFab'),
  randomOverlay: document.getElementById('randomOverlay'),
  randomCard: document.getElementById('randomCard'),
  randomCardText: document.getElementById('randomCardText'),
  randomFocusTag: document.getElementById('randomFocusTag'),
  randomPill: document.getElementById('randomPill'),
  randomCounter: document.getElementById('randomCounter'),
  randomPrevBtn: document.getElementById('randomPrevBtn'),
  randomNextBtn: document.getElementById('randomNextBtn'),
  randomBackBtn: document.getElementById('randomBackBtn'),
  randomMicBtn: document.getElementById('randomMicBtn'),
  randomMicStatus: document.getElementById('randomMicStatus'),
  randomMicArea: document.getElementById('randomMicArea'),
  randomHearBtn: document.getElementById('randomHearBtn'),
  randomDefinitionPanel: document.getElementById('randomDefinitionPanel'),
  randomDefinitionWord: document.getElementById('randomDefinitionWord'),
  randomDefinitionText: document.getElementById('randomDefinitionText'),
  randomDefinitionClose: document.getElementById('randomDefinitionClose'),
  randomResultBanner: document.getElementById('randomResultBanner'),
  randomNoSupportMsg: document.getElementById('randomNoSupportMsg'),
  filterRow: document.getElementById('filterRow'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  fontOptions: document.getElementById('fontOptions'),
  autoPlayToggle: document.getElementById('autoPlayToggle'),
  testSoundBtn: document.getElementById('testSoundBtn'),
  testSoundSub: document.getElementById('testSoundSub'),
  resetBtn: document.getElementById('resetBtn'),
};

// -----------------------------------------------------------
// Rendering: level map
// A winding path, level 1 at the bottom, climbing to level TOTAL_LEVELS
// at the top. X position follows a gentle sine sway so the trail curves
// left and right rather than running in a straight line.
// -----------------------------------------------------------
const NODE_SPACING = 92;   // vertical px between levels
const SWAY_PERCENT = 17;   // how far the path drifts left/right, in % of width
const SWAY_PERIOD = 7;     // levels per full left-right cycle
const TOP_PAD = 50;
const BOTTOM_PAD = 60;

function xPercentForLevel(n) {
  return 50 + SWAY_PERCENT * Math.sin((n / SWAY_PERIOD) * Math.PI * 2);
}
function yPxForLevel(n) {
  // level 1 has the largest y (bottom); TOTAL_LEVELS has the smallest (top)
  return BOTTOM_PAD + (TOTAL_LEVELS - n) * NODE_SPACING;
}

function renderMap() {
  const unlocked = unlockedLevel();
  const trackHeight = yPxForLevel(1) + TOP_PAD;
  el.mapTrack.style.height = trackHeight + 'px';
  el.mapTrack.innerHTML = '';

  // Winding trail, drawn once as an SVG path behind the nodes.
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'map-path-svg');
  svg.setAttribute('viewBox', `0 0 100 ${trackHeight}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  let d = '';
  for (let n = 1; n <= TOTAL_LEVELS; n++) {
    const x = xPercentForLevel(n);
    const y = yPxForLevel(n);
    d += (n === 1 ? 'M' : 'L') + x + ' ' + y + ' ';
  }
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(247,241,236,0.16)');
  path.setAttribute('stroke-width', '0.6');
  path.setAttribute('stroke-dasharray', '2,2');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.appendChild(path);
  el.mapTrack.appendChild(svg);

  for (let n = 1; n <= TOTAL_LEVELS; n++) {
    const { difficulty } = levelPhrase(n);
    const status = state.levelStatus[n];
    const x = xPercentForLevel(n);
    const y = yPxForLevel(n);

    const wrap = document.createElement('div');
    wrap.className = 'node-wrap';
    wrap.style.left = x + '%';
    wrap.style.top = y + 'px';

    const node = document.createElement('button');
    node.className = 'level-node difficulty-' + difficulty;
    node.textContent = n;

    if (n > unlocked) {
      node.classList.add('locked');
      node.textContent = '🔒';
    } else if (status === 'completed') {
      node.classList.add('completed');
    } else if (status === 'skipped') {
      node.classList.add('skipped');
    } else if (n === unlocked) {
      node.classList.add('current');
    }

    node.addEventListener('click', () => {
      if (n <= unlocked) openLevel(n);
    });

    wrap.appendChild(node);

    if (MILESTONES[n]) {
      const label = document.createElement('div');
      label.className = 'milestone-label';
      label.innerHTML = `<span class="flag">🚩</span> ${MILESTONES[n]}`;
      wrap.appendChild(label);
    }

    el.mapTrack.appendChild(wrap);
  }

  el.pointsValue.textContent = state.points;
}

// Center the map's scroll position on a given level (used on load, and
// whenever we return to the map, so the player's current level is
// always visible instead of the view resetting to level 1).
function centerOnLevel(n) {
  const y = yPxForLevel(n);
  const target = y - el.mapWrap.clientHeight / 2;
  const max = el.mapTrack.offsetHeight - el.mapWrap.clientHeight;
  el.mapWrap.scrollTop = Math.max(0, Math.min(target, max));
}

// -----------------------------------------------------------
// Practice panel — shared "attempt" engine used by both Levels and
// the Practice (random) screen. An attempt tracks one phrase being
// spoken: its words, per-word status, and whether a pronunciation
// hint was used (which forfeits points, levels only).
// -----------------------------------------------------------
let recognition = null;
let recognizing = false;
let attempt = null; // { mode: 'level'|'practice', text, rawWords, seps, targetWords, statuses, matchedCount, hasMistake, assisted, levelIndex? }

function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z']/g, '');
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function wordsRoughlyMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 4 && levenshtein(a, b) <= 1) return true;
  return false;
}

// Split on spaces AND hyphens, but remember which separator followed each
// word so hyphenated compounds ("low-roofed") render as two independently
// highlightable words with no gap between them — and, crucially, are
// matched against speech as two separate words, since that's how people
// actually say them.
function tokenizePhrase(text) {
  const parts = text.split(/(\s+|-)/).filter(p => p.length > 0);
  const rawWords = [];
  const seps = [];
  let i = 0;
  while (i < parts.length) {
    rawWords.push(parts[i]);
    i++;
    if (i < parts.length && /^(\s+|-)$/.test(parts[i])) {
      seps.push(parts[i] === '-' ? '-' : ' ');
      i++;
    } else {
      seps.push('');
    }
  }
  return { rawWords, seps };
}

function freshWordStatuses(len) {
  return Array.from({ length: len }, (_, i) => (i === 0 ? 'current' : 'pending'));
}

// For a hyphenated compound like "low-roofed" (tokenized as two separate
// words for speech matching), reconstruct the full compound so definitions
// and "Hear it" deal with the real word rather than a meaningless fragment
// like "roofed" on its own.
function compoundWordAt(a, idx) {
  let start = idx, end = idx;
  while (start > 0 && a.seps[start - 1] === '-') start--;
  while (end < a.rawWords.length - 1 && a.seps[end] === '-') end++;
  return a.rawWords.slice(start, end + 1).join('-');
}

// The last target-word index in the same hyphen group as idx (idx itself
// if it isn't hyphenated to the word after it). Used so the matcher can
// accept a hyphenated compound as either two separate spoken words OR one
// fused word — natural speech often runs them together ("low-roofed"
// spoken fluidly can get transcribed as a single "lowroofed" token).
function hyphenGroupEnd(a, idx) {
  let end = idx;
  while (end < a.seps.length - 1 && a.seps[end] === '-') end++;
  return end;
}

function buildAttempt(text, mode, extra) {
  const { rawWords, seps } = tokenizePhrase(text);
  return Object.assign({
    mode,
    text,
    rawWords,
    seps,
    targetWords: rawWords.map(normalizeWord),
    statuses: freshWordStatuses(rawWords.length),
    matchedCount: 0,
    // How many words were already confirmed correct before the CURRENT
    // recognition session started. Each call to recognition.start() begins
    // a fresh transcript at index 0 — without this, resuming after any
    // pause (auto-resume or a manual re-tap) would re-evaluate speech
    // against the target from word one again, wiping out real progress.
    sessionBaseline: 0,
    hasMistake: false,
    assisted: false,
  }, extra || {});
}

// statusesOverride lets us render a "soft" view (e.g. showing a word as
// still-current instead of incorrect during the grace period below)
// without touching the attempt's real, authoritative status array.
function renderAttempt(a, statusesOverride) {
  const statuses = statusesOverride || a.statuses;
  const cardTextEl = a.mode === 'level' ? el.cardText : el.randomCardText;
  const classFor = { correct: 'matched', current: 'current-word', incorrect: 'incorrect-word' };
  let html = '';
  a.rawWords.forEach((w, i) => {
    const cls = classFor[statuses[i]];
    html += `<span class="word${cls ? ' ' + cls : ''}">${w}</span>`;
    if (a.seps[i] === '-') html += '-';
    else if (a.seps[i] === ' ') html += ' ';
  });
  cardTextEl.innerHTML = html;
}

function activeEls() {
  if (!attempt) return null;
  return attempt.mode === 'level'
    ? { micBtn: el.micBtn, micStatus: el.micStatus, hearBtn: el.hearBtn, resultBanner: el.resultBanner }
    : { micBtn: el.randomMicBtn, micStatus: el.randomMicStatus, hearBtn: el.randomHearBtn, resultBanner: el.randomResultBanner };
}

// A mismatch only gets rendered red after this much silence-free grace
// period, so a word that's still being spoken doesn't flash red before
// the person finishes saying it.
const INCORRECT_DELAY_MS = 700;
let incorrectTimer = null;
let incorrectTimerIndex = null;
function clearIncorrectTimer() {
  if (incorrectTimer) { clearTimeout(incorrectTimer); incorrectTimer = null; }
  incorrectTimerIndex = null;
}

// Native text-to-speech for the "Hear it" pronunciation hint and for
// tap-to-hear in Practice — no external service, just the browser's
// built-in SpeechSynthesis.
//
// Chrome on Android frequently has an EMPTY voice list at the exact moment
// speak() is first called — voices load asynchronously, and querying them
// right when a button is tapped is often too early. Pre-warming this at
// boot (and again whenever the browser reports voices are ready) means the
// cache is usually populated well before the person actually taps anything.
let cachedVoices = [];
function warmUpVoices() {
  if (!('speechSynthesis' in window)) return;
  const update = () => { cachedVoices = window.speechSynthesis.getVoices() || []; };
  update();
  window.speechSynthesis.onvoiceschanged = update;
  // Some Android WebViews never fire 'voiceschanged' at all; keep checking
  // for a few seconds as a fallback.
  let attempts = 0;
  const poll = setInterval(() => {
    update();
    attempts++;
    if (cachedVoices.length > 0 || attempts > 10) clearInterval(poll);
  }, 400);
}

// IMPORTANT: on mobile Safari/Chrome, speak() only works if it's called
// synchronously inside the click/tap handler — any setTimeout/await in
// between breaks the "user gesture" chain and the browser silently
// swallows the audio. So this stays fully synchronous; the only async
// thing is the onerror callback for genuine playback errors.
function speak(text, onFail) {
  if (!('speechSynthesis' in window)) { if (onFail) onFail(); return; }
  const synth = window.speechSynthesis;
  try { synth.cancel(); } catch (e) { /* nothing was playing */ }
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.82;
  utter.volume = 1;
  utter.lang = 'en-US';
  const voices = cachedVoices.length ? cachedVoices : (synth.getVoices ? synth.getVoices() : []);
  const enVoice = voices && (voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0]);
  if (enVoice) utter.voice = enVoice;
  let settled = false;
  utter.onstart = () => { settled = true; };
  utter.onend = () => { settled = true; };
  utter.onerror = () => { settled = true; if (onFail) onFail(); };
  try {
    synth.speak(utter);
  } catch (e) {
    if (onFail) onFail();
    return;
  }
  // If neither onstart, onend, nor onerror ever fires, something's silently
  // wrong (often a device-level issue — see the Settings "Test sound" note).
  setTimeout(() => { if (!settled && onFail) onFail(); }, 3000);
}

function flashMicStatus(els, message) {
  if (!els) return;
  const prev = els.micStatus.textContent;
  els.micStatus.textContent = message;
  setTimeout(() => {
    if (els.micStatus.textContent === message) els.micStatus.textContent = prev;
  }, 2200);
}

function useHearIt() {
  if (!attempt) return;
  attempt.assisted = true;
  const word = compoundWordAt(attempt, attempt.matchedCount) || attempt.text;
  const els = activeEls();
  speak(word, () => flashMicStatus(els, "Couldn't play audio in this browser"));
}

// ---------- Tap-a-word-for-definition (both Levels and Practice) ----------
// Tries Wiktionary's REST API first (reliable, genuine CORS support from
// Wikimedia's own infrastructure), then falls back to a second free API.
// Many sentence words are inflected forms ("remade", "studies", "walked"),
// and dictionaries often just say "past tense of remake" for those — not
// useful on its own, so if every candidate definition is just an inflection
// pointer, this chases it back to the base word and shows its real meaning.
const definitionCache = {};

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function isInflectionText(text) {
  return /\b(plural|past tense|past participle|present participle|third-person singular|comparative|superlative|alternative form|alternative spelling|obsolete form|archaic form|dialectal form|informal form|nonstandard form|inflection)\b[^.]*\bof\b/i.test(text);
}

function extractLemma(text) {
  const m = text.match(/of\s+["'“]?([a-zA-Z][a-zA-Z'-]*)["'”]?\.?\s*$/i);
  return m ? m[1] : null;
}

async function fetchDefinition(rawWord, depth) {
  depth = depth || 0;
  const key = normalizeWord(rawWord);
  if (!key) return null;
  const cacheKey = key + ':' + depth;
  if (Object.prototype.hasOwnProperty.call(definitionCache, cacheKey)) return definitionCache[cacheKey];

  const candidates = [];

  try {
    const res = await fetch('https://en.wiktionary.org/api/rest_v1/page/definition/' + encodeURIComponent(key));
    if (res.ok) {
      const data = await res.json();
      const entries = data && data.en;
      if (entries) {
        entries.forEach(entry => {
          (entry.definitions || []).forEach(d => {
            if (d && d.definition) candidates.push({ pos: entry.partOfSpeech, def: stripHtml(d.definition) });
          });
        });
      }
    }
  } catch (e) { /* try the fallback source below */ }

  if (candidates.length === 0) {
    try {
      const res2 = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(key));
      if (res2.ok) {
        const data2 = await res2.json();
        (data2 || []).forEach(entry => {
          (entry.meanings || []).forEach(m => {
            (m.definitions || []).forEach(d => {
              if (d && d.definition) candidates.push({ pos: m.partOfSpeech, def: d.definition });
            });
          });
        });
      }
    } catch (e) { /* both sources failed */ }
  }

  if (candidates.length === 0) {
    definitionCache[cacheKey] = null;
    return null;
  }

  const clean = candidates.find(c => !isInflectionText(c.def));
  if (clean) {
    definitionCache[cacheKey] = clean;
    return clean;
  }

  // Every candidate was just an inflection pointer — chase it back to the
  // real word so the person gets an actual meaning, not a dead end.
  if (depth < 1) {
    const lemma = extractLemma(candidates[0].def);
    if (lemma && normalizeWord(lemma) !== key) {
      const resolved = await fetchDefinition(lemma, depth + 1);
      if (resolved) {
        const combined = { pos: resolved.pos, def: resolved.def, inflectionNote: candidates[0].def };
        definitionCache[cacheKey] = combined;
        return combined;
      }
    }
  }

  definitionCache[cacheKey] = candidates[0];
  return candidates[0];
}

function composeDefinitionText(result) {
  if (!result) return "No definition found for this word.";
  let text = '';
  if (result.inflectionNote) {
    const note = result.inflectionNote.charAt(0).toUpperCase() + result.inflectionNote.slice(1);
    text += note + (note.endsWith('.') ? ' ' : '. ');
  }
  if (result.pos) text += `(${result.pos}) `;
  text += result.def;
  return text;
}

const DEFINITION_HINTS = {
  level: '💡 Tap any word above for its definition.',
  practice: '💡 Tap any word to hear it and see its definition.',
};

function resetDefinitionHint(mode) {
  const panel = mode === 'level'
    ? { word: el.definitionWord, text: el.definitionText }
    : { word: el.randomDefinitionWord, text: el.randomDefinitionText };
  panel.word.textContent = '';
  panel.text.textContent = DEFINITION_HINTS[mode];
  panel.text.classList.add('hint');
}

async function showDefinitionFor(rawWord, mode) {
  const panel = mode === 'level'
    ? { box: el.definitionPanel, word: el.definitionWord, text: el.definitionText }
    : { box: el.randomDefinitionPanel, word: el.randomDefinitionWord, text: el.randomDefinitionText };
  const clean = rawWord.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
  panel.text.classList.remove('hint');
  panel.word.textContent = clean.toLowerCase();
  panel.text.textContent = 'Looking up definition…';
  const result = await fetchDefinition(clean);
  panel.text.textContent = composeDefinitionText(result);
}

// Tapping a word always shows its definition. In Practice, it also always
// speaks the word aloud (no restriction there, since there's no points to
// protect); in Levels, hearing it out loud stays gated behind "Hear it"
// (which only appears after a mistake, and forfeits points).
function handleWordTap(e, mode) {
  if (!attempt || attempt.mode !== mode) return;
  const span = e.target.closest('.word');
  if (!span) return;
  const cardTextEl = mode === 'level' ? el.cardText : el.randomCardText;
  const idx = Array.from(cardTextEl.querySelectorAll('.word')).indexOf(span);
  if (idx < 0 || !attempt.rawWords[idx]) return;
  const word = compoundWordAt(attempt, idx);
  if (mode === 'practice') speak(word); // must stay synchronous — do this before the async lookup
  showDefinitionFor(word, mode);
}

function openLevel(n) {
  state.openLevel = n;
  const { difficulty, phrase } = levelPhrase(n);

  el.levelPill.className = 'level-pill difficulty-' + difficulty;
  el.levelPill.textContent = 'Level ' + n + ' · ' + difficulty[0].toUpperCase() + difficulty.slice(1) + ' · ' + POINTS_FOR[difficulty] + ' pt' + (POINTS_FOR[difficulty] > 1 ? 's' : '');

  el.card.className = 'card difficulty-' + difficulty;
  el.cardFocusTag.textContent = phrase.focus;

  clearIncorrectTimer();
  attempt = buildAttempt(phrase.text, 'level', { levelIndex: n });
  renderAttempt(attempt);
  userPaused = false;

  el.resultBanner.style.display = 'none';
  el.nextBtn.style.display = 'none';
  el.hearBtn.style.display = 'none';
  resetDefinitionHint('level');
  el.skipBtn.style.display = state.levelStatus[n] ? 'none' : 'inline-block';
  updateSkipButton();
  el.micStatus.textContent = 'Tap the mic and say the phrase';
  el.micBtn.classList.remove('listening');

  el.practiceOverlay.classList.add('open');
}

function closeLevel() {
  userPaused = true;
  if (recognizing) stopRecognition();
  clearIncorrectTimer();
  state.openLevel = null;
  attempt = null;
  el.practiceOverlay.classList.remove('open');
  renderMap();
  centerOnLevel(unlockedLevel());
}

function updateSkipButton() {
  el.skipBtn.disabled = state.points < SKIP_COST;
  el.skipBtn.textContent = state.points < SKIP_COST
    ? `Skip (need ${SKIP_COST} pts)`
    : `Skip (${SKIP_COST} pts)`;
}

async function completeLevel(n, opts) {
  const awardPoints = !!(opts && opts.awardPoints);
  const assisted = !!(opts && opts.assisted);
  const alreadyDone = !!state.levelStatus[n];
  const thisAttempt = attempt;
  state.levelStatus[n] = 'completed';
  if (awardPoints && !alreadyDone) {
    const { difficulty } = levelPhrase(n);
    state.points += POINTS_FOR[difficulty];
  }
  await persistProgress();
  el.pointsValue.textContent = state.points;
  el.resultBanner.style.display = 'block';
  el.resultBanner.className = 'result-banner success';
  el.resultBanner.textContent = (!alreadyDone && assisted)
    ? 'Level complete — no points (pronunciation help used)'
    : 'Level complete!';
  el.nextBtn.style.display = 'inline-block';
  el.skipBtn.style.display = 'none';
  el.hearBtn.style.display = 'none';

  if (state.autoPlay) {
    const next = n + 1;
    setTimeout(() => {
      // Only advance if we're still on the attempt that just finished —
      // i.e. the player hasn't already navigated away manually.
      if (attempt === thisAttempt && next <= TOTAL_LEVELS && next <= unlockedLevel()) {
        openLevel(next);
        startRecognition();
      }
    }, 1100);
  }
}

async function skipLevel() {
  const n = state.openLevel;
  if (state.points < SKIP_COST || state.levelStatus[n]) return;
  state.points -= SKIP_COST;
  state.levelStatus[n] = 'skipped';
  await persistProgress();
  el.pointsValue.textContent = state.points;
  el.resultBanner.style.display = 'block';
  el.resultBanner.className = 'result-banner retry';
  el.resultBanner.textContent = 'Level skipped.';
  el.nextBtn.style.display = 'inline-block';
  el.skipBtn.style.display = 'none';
  el.hearBtn.style.display = 'none';
}

// ---------- Speech recognition (mic only — no keyboard input anywhere) ----------
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function setupRecognition() {
  if (!SpeechRecognitionAPI) {
    el.micArea.style.display = 'none';
    el.noSupportMsg.style.display = 'block';
    el.randomMicArea.style.display = 'none';
    el.randomNoSupportMsg.style.display = 'block';
    return;
  }
  recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    // Ignore stray events fired after we've already stopped listening —
    // some browsers deliver one more "result" after stop() is called,
    // which previously caused a level to be marked complete twice.
    if (!recognizing || !attempt) return;

    let finalTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
    }
    // Authoritative progress is based ONLY on finalized speech, never on
    // interim guesses. Interim results can be silently revised by the
    // recognizer's language model as more audio arrives — which was
    // letting a real mispronunciation get quietly "fixed" once later
    // words gave it more context, and the following words would then
    // wrongly turn green too. Waiting for isFinal fixes both that and
    // the earlier premature-red-flash issue, since a word can't be
    // judged at all until the recognizer itself is done with it.
    const finalSpoken = finalTranscript.trim().split(/\s+/).map(normalizeWord).filter(Boolean);
    const target = attempt.targetWords;
    // Seed with whatever was already confirmed correct in a PRIOR listening
    // session (see sessionBaseline above) — this session's transcript only
    // covers speech from the moment it started, so evaluation resumes from
    // there instead of re-judging the whole phrase from word one.
    const baseline = attempt.sessionBaseline || 0;
    const statuses = target.map((_, i) => (i < baseline ? 'correct' : 'pending'));
    let pointer = baseline;
    for (const w of finalSpoken) {
      if (pointer >= target.length) break;

      // Hyphenated compounds ("low-roofed") are frequently transcribed as
      // one fused word when spoken naturally ("lowroofed"), not as two
      // separate words. Accept that as satisfying both halves at once, on
      // top of the normal two-separate-words case below.
      const groupEnd = hyphenGroupEnd(attempt, pointer);
      if (groupEnd > pointer) {
        const fused = target.slice(pointer, groupEnd + 1).join('');
        if (wordsRoughlyMatch(w, fused)) {
          for (let k = pointer; k <= groupEnd; k++) statuses[k] = 'correct';
          pointer = groupEnd + 1;
          continue;
        }
      }

      if (wordsRoughlyMatch(w, target[pointer])) {
        statuses[pointer] = 'correct';
        pointer++;
      } else {
        statuses[pointer] = 'incorrect';
      }
    }
    attempt.statuses = statuses;
    attempt.matchedCount = pointer;

    // Give the mismatched word a grace period before showing it red — it
    // might just be mid-word (an interim guess), not actually wrong yet.
    const displayStatuses = statuses.slice();
    if (pointer < target.length && statuses[pointer] === 'incorrect') {
      if (incorrectTimerIndex !== pointer) {
        clearIncorrectTimer();
        incorrectTimerIndex = pointer;
        incorrectTimer = setTimeout(() => {
          if (attempt && attempt.matchedCount === pointer && attempt.statuses[pointer] === 'incorrect') {
            attempt.hasMistake = true;
            renderAttempt(attempt);
            const stillEls = activeEls();
            if (stillEls) stillEls.hearBtn.style.display = 'inline-flex';
          }
          incorrectTimer = null;
          incorrectTimerIndex = null;
        }, INCORRECT_DELAY_MS);
      }
      displayStatuses[pointer] = 'current'; // soften to yellow until the grace period confirms it
    } else {
      clearIncorrectTimer();
      if (pointer < target.length) displayStatuses[pointer] = 'current';
    }
    renderAttempt(attempt, displayStatuses);

    if (pointer >= target.length) {
      clearIncorrectTimer();
      stopRecognition();
      if (attempt.mode === 'level') {
        completeLevel(attempt.levelIndex, { awardPoints: !attempt.assisted, assisted: attempt.assisted });
      } else {
        completeRandomCard();
      }
    }
  };

  recognition.onerror = (event) => {
    const permissionIssue = event.error === 'not-allowed' || event.error === 'permission-denied' ||
      event.error === 'audio-capture' || event.error === 'service-not-allowed';
    stopRecognition();
    const els = activeEls();
    if (!els) return;
    if (permissionIssue) {
      els.micStatus.textContent = 'Microphone access is blocked — enable it in your browser settings';
      return;
    }
    // "No speech" and similar recoverable hiccups shouldn't require the
    // person to tap the mic again — just pick back up automatically so it
    // feels like the mic stayed on for the whole level.
    if (!userPaused) {
      maybeAutoResume();
    } else {
      els.micStatus.textContent = "Didn't catch that — tap the mic and try again";
    }
  };

  recognition.onend = () => {
    recognizing = false;
    clearIncorrectTimer();
    const els = activeEls();
    if (!els) return;
    els.micBtn.classList.remove('listening');
    if (attempt && attempt.matchedCount >= attempt.targetWords.length) {
      els.micStatus.textContent = '';
      return;
    }
    if (!userPaused) {
      maybeAutoResume();
      return;
    }
    if (attempt && attempt.matchedCount > 0) {
      els.micStatus.textContent = 'Mic off — tap to try again';
    } else {
      els.micStatus.textContent = 'Mic off — tap the mic to try again';
    }
  };
}

// True only while the person has explicitly paused the mic themselves —
// distinguishes an intentional stop from the recognizer just timing out,
// so we know when it's safe to auto-resume without asking.
let userPaused = false;

function isAttemptScreenOpen() {
  return el.practiceOverlay.classList.contains('open') || el.randomOverlay.classList.contains('open');
}

// Keeps the mic effectively "on" for the whole level/card: if listening
// stops for any reason other than the person choosing to pause it (or
// finishing successfully), pick back up automatically instead of making
// them tap the button again — and never wipe their progress when doing so.
function maybeAutoResume() {
  if (userPaused || !attempt || !recognition) return;
  if (attempt.matchedCount >= attempt.targetWords.length) return;
  setTimeout(() => {
    if (userPaused || !attempt || !recognition || !isAttemptScreenOpen()) return;
    if (attempt.matchedCount >= attempt.targetWords.length) return;
    if (recognizing) return;
    try {
      attempt.sessionBaseline = attempt.matchedCount;
      recognition.start();
      recognizing = true;
      const els = activeEls();
      if (els) {
        els.micBtn.classList.add('listening');
        els.micStatus.textContent = 'Listening…';
      }
    } catch (e) { /* already starting — fine */ }
  }, 250);
}

function startRecognition() {
  if (!recognition || !attempt) return;
  userPaused = false;
  attempt.sessionBaseline = attempt.matchedCount;
  const els = activeEls();
  els.resultBanner.style.display = 'none';
  els.hearBtn.style.display = 'none';
  try {
    recognition.start();
    recognizing = true;
    els.micBtn.classList.add('listening');
    els.micStatus.textContent = 'Listening…';
  } catch (e) {
    // recognition already started
  }
}

function stopRecognition() {
  if (!recognition) return;
  try { recognition.stop(); } catch (e) {}
  recognizing = false;
  clearIncorrectTimer();
  const els = activeEls();
  if (!els) return;
  els.micBtn.classList.remove('listening');
  // Make it immediately clear the mic is off — don't leave "Listening…"
  // on screen just because the async 'end' event hasn't fired yet. This
  // covers all three cases: fully correct (banner already says so, so
  // just clear the status line), partially said, or nothing said yet.
  if (attempt) {
    if (attempt.matchedCount >= attempt.targetWords.length) {
      els.micStatus.textContent = '';
    } else if (attempt.matchedCount > 0) {
      els.micStatus.textContent = 'Mic off — tap to try again';
    } else {
      els.micStatus.textContent = 'Mic off — tap the mic to start listening';
    }
  }
}

function handleMicToggle() {
  if (recognizing) {
    userPaused = true;
    stopRecognition();
  } else {
    startRecognition(); // sets userPaused = false internally
  }
}

el.micBtn.addEventListener('click', handleMicToggle);
el.hearBtn.addEventListener('click', useHearIt);
el.cardText.addEventListener('click', (e) => handleWordTap(e, 'level'));
el.definitionClose.addEventListener('click', () => resetDefinitionHint('level'));

el.skipBtn.addEventListener('click', skipLevel);
el.backBtn.addEventListener('click', closeLevel);
el.nextBtn.addEventListener('click', () => {
  const next = state.openLevel + 1;
  closeLevel();
  if (next <= unlockedLevel()) openLevel(next);
});

// -----------------------------------------------------------
// Small reusable chevron icon, used by back/next buttons and the
// random-practice prev/next controls so every arrow in the app matches.
// -----------------------------------------------------------
function arrowIcon(direction, size) {
  size = size || 18;
  const points = direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="${points}"></polyline></svg>`;
}

// -----------------------------------------------------------
// Random practice: shuffles through every phrase in the database.
// No points, no levels — but the mic, word highlighting, and Auto-Play
// all work the same way as Levels. Arrows always browse freely,
// whether or not the current card has been spoken correctly.
//
// Practice has two views: "Cards" (the flashcard deck) and
// "Missed Words" (a plain word bank of everything you've gotten wrong,
// each with its own hear/definition/remove controls — a standalone
// vocabulary tool, not tied to any particular phrase).
// -----------------------------------------------------------
let randomOrder = [];
let randomIndex = 0;
const activeFilters = new Set(['easy', 'medium', 'hard']);

function shuffledFilteredPhrases() {
  const arr = PHRASES.filter(p => activeFilters.has(p.difficulty));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderFilterRow() {
  el.filterRow.innerHTML = '';
  ['easy', 'medium', 'hard'].forEach(diff => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (activeFilters.has(diff) ? ' active' : '');
    btn.dataset.diff = diff;
    btn.textContent = diff[0].toUpperCase() + diff.slice(1);
    btn.addEventListener('click', () => {
      if (activeFilters.has(diff)) {
        if (activeFilters.size === 1) return; // keep at least one active
        activeFilters.delete(diff);
      } else {
        activeFilters.add(diff);
      }
      renderFilterRow();
      randomOrder = shuffledFilteredPhrases();
      randomIndex = 0;
      loadRandomCard();
    });
    el.filterRow.appendChild(btn);
  });
}

function openRandomPractice() {
  renderFilterRow();
  randomOrder = shuffledFilteredPhrases();
  randomIndex = 0;
  loadRandomCard();
  el.randomOverlay.classList.add('open');
}

function loadRandomCard() {
  if (recognizing) stopRecognition();
  clearIncorrectTimer();
  userPaused = false;
  const phrase = randomOrder[randomIndex];
  el.randomCard.className = 'card difficulty-' + phrase.difficulty;
  el.randomFocusTag.textContent = phrase.focus;
  el.randomPill.className = 'level-pill difficulty-' + phrase.difficulty;
  el.randomPill.textContent = 'Practice · ' + phrase.difficulty[0].toUpperCase() + phrase.difficulty.slice(1);
  el.randomCounter.textContent = (randomIndex + 1) + ' / ' + randomOrder.length;

  attempt = buildAttempt(phrase.text, 'practice');
  renderAttempt(attempt);
  el.randomResultBanner.style.display = 'none';
  el.randomHearBtn.style.display = 'none';
  resetDefinitionHint('practice');
  el.randomMicStatus.textContent = 'Tap the mic and say the phrase';
  el.randomMicBtn.classList.remove('listening');
}

function completeRandomCard() {
  const thisAttempt = attempt;
  el.randomResultBanner.style.display = 'block';
  el.randomResultBanner.className = 'result-banner success';
  el.randomResultBanner.textContent = 'Correct!';
  el.randomHearBtn.style.display = 'none';

  if (state.autoPlay) {
    setTimeout(() => {
      // Only auto-advance if the player hasn't already navigated away.
      if (attempt === thisAttempt) {
        randomIndex = (randomIndex + 1) % randomOrder.length;
        loadRandomCard();
        startRecognition();
      }
    }, 1100);
  }
}

function closeRandomPractice() {
  userPaused = true;
  if (recognizing) stopRecognition();
  clearIncorrectTimer();
  attempt = null;
  el.randomOverlay.classList.remove('open');
  renderMap();
}

el.practiceFab.addEventListener('click', openRandomPractice);
el.randomBackBtn.addEventListener('click', closeRandomPractice);
el.randomMicBtn.addEventListener('click', handleMicToggle);
el.randomHearBtn.addEventListener('click', useHearIt);
el.randomCardText.addEventListener('click', (e) => handleWordTap(e, 'practice'));
el.randomDefinitionClose.addEventListener('click', () => resetDefinitionHint('practice'));
el.randomPrevBtn.addEventListener('click', () => {
  randomIndex = (randomIndex - 1 + randomOrder.length) % randomOrder.length;
  loadRandomCard();
});
el.randomNextBtn.addEventListener('click', () => {
  randomIndex = (randomIndex + 1) % randomOrder.length;
  loadRandomCard();
});

// -----------------------------------------------------------
// Settings panel
// -----------------------------------------------------------
function renderFontOptions() {
  el.fontOptions.innerHTML = '';
  FONT_OPTIONS.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'font-option' + (state.font === opt.id ? ' active' : '');
    row.innerHTML = `
      <div>
        <div class="font-option-preview" style="font-family:${opt.family}">Say it clearly</div>
        <div class="font-option-label">${opt.label}</div>
      </div>
      <div class="font-option-check"></div>
    `;
    row.addEventListener('click', async () => {
      state.font = opt.id;
      document.documentElement.style.setProperty('--font-card', opt.family);
      await persistFont();
      renderFontOptions();
    });
    el.fontOptions.appendChild(row);
  });
}

el.settingsBtn.addEventListener('click', () => {
  el.settingsOverlay.classList.add('open');
  el.testSoundSub.textContent = cachedVoices.length > 0
    ? `Not hearing "Hear it" or tap-to-hear? Try a quick test. (${cachedVoices.length} voice${cachedVoices.length === 1 ? '' : 's'} detected in this browser.)`
    : 'Not hearing "Hear it" or tap-to-hear? Try a quick test. (This browser hasn\'t reported any text-to-speech voices yet — that alone would explain silent failures.)';
});
el.closeSettingsBtn.addEventListener('click', () => {
  el.settingsOverlay.classList.remove('open');
});
el.resetBtn.addEventListener('click', async () => {
  state.points = 0;
  state.levelStatus = {};
  await persistProgress();
  el.settingsOverlay.classList.remove('open');
  closeLevel();
});

function renderAutoPlayToggle() {
  el.autoPlayToggle.classList.toggle('on', state.autoPlay);
}
el.autoPlayToggle.addEventListener('click', async () => {
  state.autoPlay = !state.autoPlay;
  renderAutoPlayToggle();
  await persistAutoPlay();
});

el.testSoundBtn.addEventListener('click', () => {
  const originalLabel = el.testSoundBtn.textContent;
  el.testSoundBtn.textContent = '🔊 Playing…';
  speak('This is a test of the sound.', () => {
    el.testSoundBtn.textContent = originalLabel;
    const voiceNote = cachedVoices.length === 0
      ? " This browser reports zero text-to-speech voices available — that's almost certainly why (a Chrome/Android compatibility gap, separate from your device's TTS setting)."
      : '';
    el.testSoundSub.textContent = "No sound?" + voiceNote + " On Android Chrome, also check the site's Sound permission under ⋮ menu → Site settings. On iPhone, check the physical mute switch on the side.";
  });
  setTimeout(() => {
    if (el.testSoundBtn.textContent === '🔊 Playing…') el.testSoundBtn.textContent = originalLabel;
  }, 2500);
});

el.playBtn.addEventListener('click', () => {
  el.welcomeOverlay.classList.add('closed');
});

// -----------------------------------------------------------
// Boot
// -----------------------------------------------------------
(async function init() {
  await loadState();
  document.documentElement.style.setProperty(
    '--font-card',
    (FONT_OPTIONS.find(f => f.id === state.font) || FONT_OPTIONS[0]).family
  );
  document.getElementById('backIcon').innerHTML = arrowIcon('left', 15);
  document.getElementById('nextIcon').innerHTML = arrowIcon('right', 15);
  document.getElementById('randomBackIcon').innerHTML = arrowIcon('left', 15);
  el.randomPrevBtn.innerHTML = arrowIcon('left', 20);
  el.randomNextBtn.innerHTML = arrowIcon('right', 20);
  // Some browsers need voices "warmed up" before speechSynthesis.speak()
  // reliably produces audio the first time it's used.
  warmUpVoices();
  setupRecognition();
  renderFontOptions();
  renderAutoPlayToggle();
  renderMap();
  // land on whichever level the player is currently on, not level 1
  requestAnimationFrame(() => { centerOnLevel(unlockedLevel()); });
})();
