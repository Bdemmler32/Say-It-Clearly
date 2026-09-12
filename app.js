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
  return keys.length ? Math.max(...keys) + 1 : 1;
}

async function loadState() {
  state.points = await Store.get('points', 0);
  state.levelStatus = await Store.get('levelStatus', {});
  state.font = await Store.get('font', 'handwritten');
}

async function persistProgress() {
  await Store.set('points', state.points);
  await Store.set('levelStatus', state.levelStatus);
}

async function persistFont() {
  await Store.set('font', state.font);
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
  filterRow: document.getElementById('filterRow'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  fontOptions: document.getElementById('fontOptions'),
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

// -----------------------------------------------------------
// Practice panel
// -----------------------------------------------------------
let recognition = null;
let recognizing = false;
let targetWords = [];
let matchedCount = 0;

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

function openLevel(n) {
  state.openLevel = n;
  const { difficulty, phrase } = levelPhrase(n);

  el.levelPill.className = 'level-pill difficulty-' + difficulty;
  el.levelPill.textContent = 'Level ' + n + ' · ' + difficulty[0].toUpperCase() + difficulty.slice(1) + ' · ' + POINTS_FOR[difficulty] + ' pt' + (POINTS_FOR[difficulty] > 1 ? 's' : '');

  el.card.className = 'card difficulty-' + difficulty;
  el.cardFocusTag.textContent = phrase.focus;

  targetWords = phrase.text.split(' ').map(normalizeWord);
  matchedCount = 0;
  renderCardWords(phrase.text);

  el.resultBanner.style.display = 'none';
  el.nextBtn.style.display = 'none';
  el.skipBtn.style.display = state.levelStatus[n] ? 'none' : 'inline-block';
  updateSkipButton();
  el.micStatus.textContent = 'Tap the mic and say the phrase';
  el.micBtn.classList.remove('listening');

  el.practiceOverlay.classList.add('open');
}

function renderCardWords(text) {
  const words = text.split(' ');
  el.cardText.innerHTML = words
    .map((w, i) => `<span class="word${i < matchedCount ? ' matched' : ''}">${w}</span>`)
    .join(' ');
}

function closeLevel() {
  if (recognizing) stopRecognition();
  state.openLevel = null;
  el.practiceOverlay.classList.remove('open');
  renderMap();
}

function updateSkipButton() {
  el.skipBtn.disabled = state.points < SKIP_COST;
  el.skipBtn.textContent = state.points < SKIP_COST
    ? `Skip (need ${SKIP_COST} pts)`
    : `Skip (${SKIP_COST} pts)`;
}

async function completeLevel(n, awardPoints) {
  const alreadyDone = !!state.levelStatus[n];
  state.levelStatus[n] = 'completed';
  if (awardPoints && !alreadyDone) {
    const { difficulty } = levelPhrase(n);
    state.points += POINTS_FOR[difficulty];
  }
  await persistProgress();
  el.pointsValue.textContent = state.points;
  el.resultBanner.style.display = 'block';
  el.resultBanner.className = 'result-banner success';
  el.resultBanner.textContent = alreadyDone ? 'Nice — practiced again!' : 'Level complete!';
  el.nextBtn.style.display = 'inline-block';
  el.skipBtn.style.display = 'none';
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
}

// ---------- Speech recognition (mic only — no keyboard input anywhere) ----------
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function setupRecognition() {
  if (!SpeechRecognitionAPI) {
    el.micArea.style.display = 'none';
    el.noSupportMsg.style.display = 'block';
    return;
  }
  recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + ' ';
    }
    const spoken = transcript.trim().split(/\s+/).map(normalizeWord).filter(Boolean);

    let pointer = 0;
    for (const w of spoken) {
      if (pointer < targetWords.length && wordsRoughlyMatch(w, targetWords[pointer])) {
        pointer++;
      }
    }
    matchedCount = pointer;
    const currentPhrase = el.cardText.textContent.trim();
    renderCardWords(levelPhrase(state.openLevel).phrase.text);

    if (matchedCount >= targetWords.length) {
      stopRecognition();
      completeLevel(state.openLevel, true);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech') {
      el.micStatus.textContent = "Didn't catch that — tap the mic and try again";
    } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      el.micStatus.textContent = 'Microphone access is blocked — enable it in your browser settings';
    } else {
      el.micStatus.textContent = 'Something went wrong — tap the mic to retry';
    }
    stopRecognition();
  };

  recognition.onend = () => {
    recognizing = false;
    el.micBtn.classList.remove('listening');
    if (matchedCount < targetWords.length && matchedCount > 0) {
      el.micStatus.textContent = 'Not quite — tap the mic to try again';
    }
  };
}

function startRecognition() {
  if (!recognition) return;
  matchedCount = 0;
  renderCardWords(levelPhrase(state.openLevel).phrase.text);
  el.resultBanner.style.display = 'none';
  try {
    recognition.start();
    recognizing = true;
    el.micBtn.classList.add('listening');
    el.micStatus.textContent = 'Listening…';
  } catch (e) {
    // recognition already started
  }
}

function stopRecognition() {
  if (!recognition) return;
  try { recognition.stop(); } catch (e) {}
  recognizing = false;
  el.micBtn.classList.remove('listening');
}

el.micBtn.addEventListener('click', () => {
  if (recognizing) {
    stopRecognition();
  } else {
    startRecognition();
  }
});

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
// No points, no mic, no levels — just forward/back through cards.
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
      renderRandomCard();
    });
    el.filterRow.appendChild(btn);
  });
}

function openRandomPractice() {
  renderFilterRow();
  randomOrder = shuffledFilteredPhrases();
  randomIndex = 0;
  renderRandomCard();
  el.randomOverlay.classList.add('open');
}

function renderRandomCard() {
  const phrase = randomOrder[randomIndex];
  el.randomCard.className = 'card difficulty-' + phrase.difficulty;
  el.randomCardText.textContent = phrase.text;
  el.randomFocusTag.textContent = phrase.focus;
  el.randomPill.className = 'level-pill difficulty-' + phrase.difficulty;
  el.randomPill.textContent = 'Practice · ' + phrase.difficulty[0].toUpperCase() + phrase.difficulty.slice(1);
  el.randomCounter.textContent = (randomIndex + 1) + ' / ' + randomOrder.length;
}

function closeRandomPractice() {
  el.randomOverlay.classList.remove('open');
  renderMap();
}

el.practiceFab.addEventListener('click', openRandomPractice);
el.randomBackBtn.addEventListener('click', closeRandomPractice);
el.randomPrevBtn.addEventListener('click', () => {
  randomIndex = (randomIndex - 1 + randomOrder.length) % randomOrder.length;
  renderRandomCard();
});
el.randomNextBtn.addEventListener('click', () => {
  randomIndex = (randomIndex + 1) % randomOrder.length;
  renderRandomCard();
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
  renderMap();
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
  setupRecognition();
  renderFontOptions();
  renderMap();
  // start scrolled to the bottom (level 1)
  requestAnimationFrame(() => { el.mapWrap.scrollTop = el.mapWrap.scrollHeight; });
})();
