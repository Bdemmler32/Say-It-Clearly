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
  missedWords: new Set(), // normalized words that have been marked wrong at least once
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
  state.missedWords = new Set(await Store.get('missedWords', []));
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

async function persistMissedWords() {
  await Store.set('missedWords', Array.from(state.missedWords));
}

function recordMissedWord(word) {
  if (!word || state.missedWords.has(word)) return;
  state.missedWords.add(word);
  persistMissedWords();
  updatePracticeFabBadge();
}

function updatePracticeFabBadge() {
  const n = state.missedWords.size;
  if (n > 0) {
    el.fabBadge.textContent = n > 99 ? '99+' : String(n);
    el.fabBadge.style.display = 'flex';
  } else {
    el.fabBadge.style.display = 'none';
  }
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
  noSupportMsg: document.getElementById('noSupportMsg'),
  resultBanner: document.getElementById('resultBanner'),
  skipBtn: document.getElementById('skipBtn'),
  nextBtn: document.getElementById('nextBtn'),
  backBtn: document.getElementById('backBtn'),
  practiceFab: document.getElementById('practiceFab'),
  fabBadge: document.getElementById('fabBadge'),
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
  randomResultBanner: document.getElementById('randomResultBanner'),
  randomNoSupportMsg: document.getElementById('randomNoSupportMsg'),
  filterRow: document.getElementById('filterRow'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  fontOptions: document.getElementById('fontOptions'),
  autoPlayToggle: document.getElementById('autoPlayToggle'),
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
const INCORRECT_DELAY_MS = 550;
let incorrectTimer = null;
let incorrectTimerIndex = null;
function clearIncorrectTimer() {
  if (incorrectTimer) { clearTimeout(incorrectTimer); incorrectTimer = null; }
  incorrectTimerIndex = null;
}

// Native text-to-speech for the "Hear it" pronunciation hint and for
// tap-to-hear in Practice — no external service, just the browser's
// built-in SpeechSynthesis. Guards against a common browser quirk where
// calling speak() immediately after cancel() silently does nothing.
function speak(text, onFail) {
  if (!('speechSynthesis' in window)) { if (onFail) onFail(); return; }
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.82;
  utter.lang = 'en-US';
  let started = false;
  utter.onstart = () => { started = true; };
  utter.onerror = () => { if (onFail) onFail(); };
  const kick = () => {
    try { synth.speak(utter); } catch (e) { if (onFail) onFail(); }
  };
  if (synth.speaking || synth.pending) {
    synth.cancel();
    setTimeout(kick, 60);
  } else {
    kick();
  }
  // If neither onstart nor onerror fires within a bit, assume it silently failed.
  setTimeout(() => { if (!started && onFail) onFail(); }, 1500);
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
  const word = attempt.rawWords[attempt.matchedCount] || attempt.text;
  const els = activeEls();
  speak(word, () => flashMicStatus(els, "Couldn't play audio in this browser"));
}

// ---------- Tap-a-word-for-definition (both Levels and Practice) ----------
const definitionCache = {};

async function fetchDefinition(rawWord) {
  const key = normalizeWord(rawWord);
  if (!key) return null;
  if (Object.prototype.hasOwnProperty.call(definitionCache, key)) return definitionCache[key];
  try {
    const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(key));
    if (!res.ok) throw new Error('lookup failed');
    const data = await res.json();
    const meaning = data && data[0] && data[0].meanings && data[0].meanings[0];
    const def = meaning && meaning.definitions && meaning.definitions[0] && meaning.definitions[0].definition;
    const result = def ? { pos: meaning.partOfSpeech, def } : null;
    definitionCache[key] = result;
    return result;
  } catch (e) {
    definitionCache[key] = null;
    return null;
  }
}

async function showDefinitionFor(rawWord, mode) {
  const panel = mode === 'level'
    ? { box: el.definitionPanel, word: el.definitionWord, text: el.definitionText }
    : { box: el.randomDefinitionPanel, word: el.randomDefinitionWord, text: el.randomDefinitionText };
  const clean = rawWord.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
  panel.box.style.display = 'block';
  panel.word.textContent = clean.toLowerCase();
  panel.text.textContent = 'Looking up definition…';
  const result = await fetchDefinition(clean);
  panel.text.textContent = result
    ? (result.pos ? '(' + result.pos + ') ' : '') + result.def
    : "No definition found for this word.";
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
  const rawWord = attempt.rawWords[idx];
  if (!rawWord) return;
  showDefinitionFor(rawWord, mode);
  if (mode === 'practice') speak(rawWord);
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

  el.resultBanner.style.display = 'none';
  el.nextBtn.style.display = 'none';
  el.hearBtn.style.display = 'none';
  el.definitionPanel.style.display = 'none';
  el.skipBtn.style.display = state.levelStatus[n] ? 'none' : 'inline-block';
  updateSkipButton();
  el.micStatus.textContent = 'Tap the mic and say the phrase';
  el.micBtn.classList.remove('listening');

  el.practiceOverlay.classList.add('open');
}

function closeLevel() {
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

    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + ' ';
    }
    const spoken = transcript.trim().split(/\s+/).map(normalizeWord).filter(Boolean);

    // Recompute word-by-word status fresh from the full transcript each time,
    // so interim results that get revised by the recognizer self-correct.
    const target = attempt.targetWords;
    const statuses = target.map(() => 'pending');
    let pointer = 0;
    for (const w of spoken) {
      if (pointer >= target.length) break;
      if (wordsRoughlyMatch(w, target[pointer])) {
        statuses[pointer] = 'correct';
        pointer++;
      } else {
        statuses[pointer] = 'incorrect';
      }
    }
    if (pointer < target.length && statuses[pointer] !== 'incorrect') {
      statuses[pointer] = 'current';
    }
    attempt.statuses = statuses;
    attempt.matchedCount = pointer;

    // Give the mismatched word a short grace period before showing it red —
    // it might just be mid-word, not actually wrong yet.
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
            recordMissedWord(target[pointer]);
          }
          incorrectTimer = null;
          incorrectTimerIndex = null;
        }, INCORRECT_DELAY_MS);
      }
      displayStatuses[pointer] = 'current';
    } else {
      clearIncorrectTimer();
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
    stopRecognition();
    const els = activeEls();
    if (!els) return;
    if (event.error === 'no-speech') {
      els.micStatus.textContent = "Didn't catch that — tap the mic and try again";
    } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      els.micStatus.textContent = 'Microphone access is blocked — enable it in your browser settings';
    } else {
      els.micStatus.textContent = 'Something went wrong — tap the mic to retry';
    }
  };

  recognition.onend = () => {
    recognizing = false;
    clearIncorrectTimer();
    const els = activeEls();
    if (!els) return;
    els.micBtn.classList.remove('listening');
    if (attempt && attempt.matchedCount < attempt.targetWords.length) {
      els.micStatus.textContent = attempt.matchedCount > 0
        ? 'Not quite — tap the mic to try again'
        : 'Mic off — tap the mic to try again';
    }
  };
}

function startRecognition() {
  if (!recognition || !attempt) return;
  clearIncorrectTimer();
  attempt.matchedCount = 0;
  attempt.statuses = freshWordStatuses(attempt.rawWords.length);
  attempt.hasMistake = false;
  attempt.assisted = false;
  renderAttempt(attempt);
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
  // on screen just because the async 'end' event hasn't fired yet.
  if (attempt && attempt.matchedCount < attempt.targetWords.length) {
    els.micStatus.textContent = attempt.matchedCount > 0
      ? 'Mic off — tap to try again'
      : 'Mic off — tap the mic to start listening';
  }
}

function handleMicToggle() {
  if (recognizing) {
    stopRecognition();
  } else {
    startRecognition();
  }
}

el.micBtn.addEventListener('click', handleMicToggle);
el.hearBtn.addEventListener('click', useHearIt);
el.cardText.addEventListener('click', (e) => handleWordTap(e, 'level'));

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
// -----------------------------------------------------------
let randomOrder = [];
let randomIndex = 0;
const activeFilters = new Set(['easy', 'medium', 'hard']);
let missedOnly = false;

function phraseContainsMissedWord(phrase) {
  const { rawWords } = tokenizePhrase(phrase.text);
  return rawWords.some(w => state.missedWords.has(normalizeWord(w)));
}

function shuffledFilteredPhrases() {
  let pool = PHRASES.filter(p => activeFilters.has(p.difficulty));
  if (missedOnly) {
    const narrowed = pool.filter(phraseContainsMissedWord);
    if (narrowed.length > 0) pool = narrowed;
  }
  const arr = pool.slice();
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

  if (state.missedWords.size > 0) {
    const missedBtn = document.createElement('button');
    missedBtn.className = 'filter-btn missed-filter' + (missedOnly ? ' active-missed' : '');
    missedBtn.textContent = '⚠ Missed (' + state.missedWords.size + ')';
    missedBtn.addEventListener('click', () => {
      missedOnly = !missedOnly;
      renderFilterRow();
      randomOrder = shuffledFilteredPhrases();
      randomIndex = 0;
      loadRandomCard();
    });
    el.filterRow.appendChild(missedBtn);
  }
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
  el.randomDefinitionPanel.style.display = 'none';
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
  if (window.speechSynthesis) window.speechSynthesis.getVoices();
  setupRecognition();
  renderFontOptions();
  renderAutoPlayToggle();
  updatePracticeFabBadge();
  renderMap();
  // land on whichever level the player is currently on, not level 1
  requestAnimationFrame(() => { centerOnLevel(unlockedLevel()); });
})();
