// ============================================================
// Morse Studio 3D — Interactive Binary Tree Decoder & Translator
// ============================================================

(() => {
  'use strict';

  // ---- Layout Constants ----
  const SVG_W = 2200;
  const SVG_H = 720;
  const TOP_PAD = 55;
  const LEVEL_GAP = 135;
  const NODE_RADII = [30, 26, 24, 22, 19];
  const FONT_SIZES = [14, 14, 13, 12, 11];

  // ---- Input Timing (ms) ----
  const DASH_THRESHOLD = 180; // Hold >= 180ms -> dash, else dot
  const DECODE_DELAY = 700;   // After 700ms silence -> decode letter

  // ---- Morse Binary Tree (1-indexed heap layout) ----
  // Left child (2*i) = dash (—), Right child (2*i + 1) = dot (·)
  const TREE = [
    null,
    { ch: '⌂', code: '' },       // 1  root
    { ch: 'T', code: '—' },      // 2
    { ch: 'E', code: '·' },      // 3
    { ch: 'M', code: '——' },     // 4
    { ch: 'N', code: '—·' },     // 5
    { ch: 'A', code: '·—' },     // 6
    { ch: 'I', code: '··' },     // 7
    { ch: 'O', code: '———' },    // 8
    { ch: 'G', code: '——·' },    // 9
    { ch: 'K', code: '—·—' },    // 10
    { ch: 'D', code: '—··' },    // 11
    { ch: 'W', code: '·——' },    // 12
    { ch: 'R', code: '·—·' },    // 13
    { ch: 'U', code: '··—' },    // 14
    { ch: 'S', code: '···' },    // 15
    null,                        // 16
    null,                        // 17
    { ch: 'Q', code: '——·—' },   // 18
    { ch: 'Z', code: '——··' },   // 19
    { ch: 'Y', code: '—·——' },   // 20
    { ch: 'C', code: '—·—·' },   // 21
    { ch: 'X', code: '—··—' },   // 22
    { ch: 'B', code: '—···' },   // 23
    { ch: 'J', code: '·———' },   // 24
    { ch: 'P', code: '·——·' },   // 25
    null,                        // 26
    { ch: 'L', code: '·—··' },   // 27
    null,                        // 28
    { ch: 'F', code: '··—·' },   // 29
    { ch: 'V', code: '···—' },   // 30
    { ch: 'H', code: '····' },   // 31
  ];

  const MORSE_RAW = {
    T: '-', E: '.', M: '--', N: '-.', A: '.-', I: '..',
    O: '---', G: '--.', K: '-.-', D: '-..', W: '.--',
    R: '.-.', U: '..-', S: '...', Q: '--.-', Z: '--..',
    Y: '-.--', C: '-.-.', X: '-..-', B: '-...', J: '.---',
    P: '.--.', L: '.-..', F: '..-.', V: '...-', H: '....',
  };

  const NATO_PHONETIC = {
    A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
    F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
    K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
    P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
    U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee',
    Z: 'Zulu',
  };

  const MORSE_TO_LETTER = {};
  for (const [letter, code] of Object.entries(MORSE_RAW)) {
    MORSE_TO_LETTER[code] = letter;
  }

  const PRESET_PHRASES = {
    emergencia: [
      { text: 'SOS', morse: '··· ——— ···' },
      { text: 'MAYDAY', morse: '—— ·— —·—— —·· ·— —·——' },
      { text: 'HELP', morse: '···· · ·—·· ·——·' },
      { text: 'SOS DE', morse: '··· ——— ···   —·· ·' },
      { text: 'SINKING', morse: '··· ·· —· —·— ·· —· ——·' },
      { text: 'OK', morse: '——— —·—' },
    ],
    basico: [
      { text: 'HOLA', morse: '···· ——— ·—·· ·—' },
      { text: 'ADIOS', morse: '·— —·· ·· ——— ···' },
      { text: 'GRACIAS', morse: '——· ·—· ·— —·—· ·· ·— ···' },
      { text: 'SI', morse: '··· ··' },
      { text: 'NO', morse: '—· ———' },
      { text: 'BIENVENIDO', morse: '—··· ·· · —· ·—— · —· ·· —·· ———' },
    ],
  };

  // ---- DOM References ----
  const appShell = document.getElementById('app-shell');
  const svg = document.getElementById('morse-tree-svg');
  const edgesG = document.getElementById('edges-group');
  const labelsG = document.getElementById('edge-labels-group');
  const nodesG = document.getElementById('nodes-group');

  const infoChar = document.getElementById('info-char');
  const infoPhonetic = document.getElementById('info-phonetic');
  const infoCode = document.getElementById('info-code');
  const infoPanel = document.getElementById('info-panel');
  const btnPlayActiveNode = document.getElementById('btn-play-active-node');

  const treeStage = document.getElementById('tree-stage');
  const treeBoard3d = document.getElementById('tree-board-3d');
  const treeScrollContainer = document.getElementById('tree-scroll-container');
  const treeWrapper = document.getElementById('tree-wrapper');
  const btnToggle3d = document.getElementById('btn-toggle-3d');
  const btnFitTree = document.getElementById('btn-fit-tree');

  const tapArea = document.getElementById('tap-area');
  const telegraphPaddle3d = document.getElementById('telegraph-paddle-3d');
  const signalLed3d = document.getElementById('signal-led-3d');
  const inputSymbols = document.getElementById('input-symbols');
  const inputPreview = document.getElementById('input-preview');
  const previewChar = document.getElementById('input-preview-char');
  const keyFill = document.getElementById('key-fill');
  const decodedMsg = document.getElementById('decoded-message');

  const btnInsertDot = document.getElementById('btn-insert-dot');
  const btnInsertDash = document.getElementById('btn-insert-dash');
  const btnPlayMessage = document.getElementById('btn-play-message');
  const btnCopyMessage = document.getElementById('btn-copy-message');
  const btnClear = document.getElementById('btn-clear');
  const btnWordSpace = document.getElementById('btn-word-space');

  const wpmSelect = document.getElementById('wpm-select');
  const freqSelect = document.getElementById('freq-select');
  const btnMuteAudio = document.getElementById('btn-mute-audio');
  const muteIcon = document.getElementById('mute-icon');

  // Translator & Presets DOM refs
  const translatorTextInput = document.getElementById('translator-text-input');
  const translatorOutputLabel = document.getElementById('translator-output-label');
  const btnPlayTranslated = document.getElementById('btn-play-translated');
  const btnCopyTranslated = document.getElementById('btn-copy-translated');
  const translatorMorseOutput = document.getElementById('translator-morse-output');

  const phraseCategoryToggle = document.getElementById('phrase-category-toggle');
  const phraseCategoryLabel = document.getElementById('phrase-category-label');
  const predefinedPhrasesContainer = document.getElementById('predefined-phrases-container');

  // Input mode toggle
  const inputModeToggle = document.getElementById('input-mode-toggle');
  const inputModeLabel = document.getElementById('input-mode-label');

  // Drawers DOM refs
  const btnToggleLeftDrawer = document.getElementById('btn-toggle-left-drawer');
  const btnToggleRightDrawer = document.getElementById('btn-toggle-right-drawer');
  const drawerLeft = document.getElementById('drawer-left');
  const drawerRight = document.getElementById('drawer-right');
  const btnCloseLeft = document.getElementById('btn-close-left');
  const btnCloseRight = document.getElementById('btn-close-right');
  const drawerOverlay = document.getElementById('drawer-overlay');

  // ---- Audio & UI State ----
  let audioCtx = null;
  let speedMultiplier = 1;
  let toneFreq = 680;
  let isMuted = false;
  let activeSelectedLetter = '';
  let isTreeFitMode = true;
  let is3dMode = true;
  let lastDrawerTrigger = null;
  let ledFlashTimer = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 3D Hardware LED & Paddle Feedback ----
  function flashSignalHardware(symbol, durationMs = 150) {
    if (ledFlashTimer) clearTimeout(ledFlashTimer);
    signalLed3d.classList.remove('led-dot', 'led-dash');
    signalLed3d.classList.add(symbol === '-' ? 'led-dash' : 'led-dot');
    telegraphPaddle3d.classList.add('active');

    ledFlashTimer = setTimeout(() => {
      signalLed3d.classList.remove('led-dot', 'led-dash');
      telegraphPaddle3d.classList.remove('active');
    }, durationMs);
  }

  // ---- Tree Geometry Helpers ----
  function level(i) { return Math.floor(Math.log2(i)); }
  function posInLevel(i) { return i - (1 << level(i)); }

  function nodePos(i) {
    const l = level(i);
    const p = posInLevel(i);
    const count = 1 << l;
    const x = ((p + 0.5) * SVG_W) / count;
    const y = l * LEVEL_GAP + TOP_PAD;
    return { x, y, l };
  }

  function pathToRoot(i) {
    const path = [];
    while (i >= 1) {
      path.unshift(i);
      i >>= 1;
    }
    return path;
  }

  function edgeId(parent, child) { return `edge-${parent}-${child}`; }
  function edgeLabelId(parent, child) { return `elbl-${parent}-${child}`; }

  function findNodeIndex(letter) {
    for (let i = 1; i < TREE.length; i++) {
      if (TREE[i] && TREE[i].ch === letter) return i;
    }
    return null;
  }

  function findPartialNodeIndex(rawMorse) {
    if (!rawMorse) return null;
    let idx = 1;
    for (const sym of rawMorse) {
      idx = sym === '-' ? idx * 2 : idx * 2 + 1;
      if (idx >= TREE.length || !TREE[idx]) return null;
    }
    return idx;
  }

  // ---- SVG Element Factory ----
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  const nodeEls = {};
  const circleEls = {};
  const labelEls = {};

  function buildTree() {
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    svg.setAttribute('width', '100%');
    svg.style.maxHeight = '64vh';

    // Draw smooth cubic Bezier edges
    for (let i = 2; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      const parentIdx = i >> 1;
      if (!TREE[parentIdx]) continue;

      const pPos = nodePos(parentIdx);
      const cPos = nodePos(i);
      const startY = pPos.y + NODE_RADII[pPos.l];
      const endY = cPos.y - NODE_RADII[cPos.l];
      const midY = (startY + endY) / 2;

      const pathD = `M ${pPos.x},${startY} C ${pPos.x},${midY} ${cPos.x},${midY} ${cPos.x},${endY}`;
      const isLeft = i % 2 === 0;

      const path = svgEl('path', {
        d: pathD,
        id: edgeId(parentIdx, i),
        class: 'tree-edge',
        'data-dir': isLeft ? 'dash' : 'dot',
        fill: 'none',
      });
      edgesG.appendChild(path);

      const lx = (pPos.x + cPos.x) / 2;
      const ly = midY;
      const labelText = svgEl('text', {
        x: lx,
        y: ly - 7,
        id: edgeLabelId(parentIdx, i),
        class: 'edge-label',
      });
      labelText.textContent = isLeft ? '—' : '·';
      labelsG.appendChild(labelText);
    }

    // Draw tree nodes
    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      const pos = nodePos(i);
      const r = NODE_RADII[pos.l] || 18;
      const fs = FONT_SIZES[pos.l] || 11;

      const g = svgEl('g', {
        class: 'tree-node-group',
        'data-idx': i,
        tabindex: '0',
        role: 'button',
        'aria-label': i === 1
          ? 'Raíz del árbol Morse'
          : `${TREE[i].ch} (${NATO_PHONETIC[TREE[i].ch] || ''}) — Morse: ${TREE[i].code}`,
      });

      const circle = svgEl('circle', {
        cx: pos.x,
        cy: pos.y,
        r: r,
        class: 'tree-node-circle' + (i === 1 ? ' root-circle' : ''),
      });

      const text = svgEl('text', {
        x: pos.x,
        y: pos.y,
        class: 'tree-node-label',
        'font-size': fs,
      });
      text.textContent = TREE[i].ch;

      const codeText = svgEl('text', {
        x: pos.x,
        y: pos.y + r + 10,
        class: 'tree-node-code',
      });
      codeText.textContent = TREE[i].code || '';

      g.appendChild(circle);
      g.appendChild(text);
      g.appendChild(codeText);
      nodesG.appendChild(g);

      nodeEls[i] = g;
      circleEls[i] = circle;
      labelEls[i] = text;
    }
  }

  // ---- Highlight Path & Dynamic Island HUD ----
  function highlightPath(idx) {
    clearHighlight();
    if (!idx || !TREE[idx]) return;

    const path = pathToRoot(idx);

    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      if (!path.includes(i)) {
        nodeEls[i].classList.add('dimmed');
      }
    }

    document.querySelectorAll('.tree-edge').forEach((e) => e.classList.add('dimmed'));
    document.querySelectorAll('.edge-label').forEach((e) => e.classList.add('dimmed'));

    for (let k = 1; k < path.length; k++) {
      const pIdx = path[k - 1];
      const cIdx = path[k];
      const edgeEl = document.getElementById(edgeId(pIdx, cIdx));
      const labelEl = document.getElementById(edgeLabelId(pIdx, cIdx));
      if (edgeEl) {
        edgeEl.classList.remove('dimmed');
        edgeEl.classList.add('highlighted');
      }
      if (labelEl) {
        labelEl.classList.remove('dimmed');
        labelEl.classList.add('highlighted');
      }
    }

    path.forEach((ni) => {
      if (nodeEls[ni]) {
        nodeEls[ni].classList.remove('dimmed');
        circleEls[ni].classList.add('highlighted');
        labelEls[ni].classList.add('highlighted');
      }
    });

    const node = TREE[idx];
    if (node && idx !== 1) {
      activeSelectedLetter = node.ch;
      infoChar.textContent = node.ch;
      infoPhonetic.textContent = NATO_PHONETIC[node.ch] || 'Letra';
      infoCode.textContent = node.code || '—';
      infoPanel.classList.add('active');
    }
  }

  function clearHighlight() {
    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      nodeEls[i].classList.remove('dimmed');
      circleEls[i].classList.remove('highlighted', 'active-node');
      labelEls[i].classList.remove('highlighted', 'active-label');
    }
    document.querySelectorAll('.tree-edge').forEach((e) => {
      e.classList.remove('highlighted', 'dimmed');
    });
    document.querySelectorAll('.edge-label').forEach((e) => {
      e.classList.remove('highlighted', 'dimmed');
    });
    activeSelectedLetter = '';
    infoChar.textContent = '—';
    infoPhonetic.textContent = 'Listo';
    infoCode.textContent = '···';
    infoPanel.classList.remove('active');
  }

  // ---- Audio Synthesizer ----
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(durationSec, freq = toneFreq) {
    if (isMuted) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime + 0.01;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.008);
    gain.gain.setValueAtTime(0.22, t + durationSec - 0.008);
    gain.gain.linearRampToValueAtTime(0, t + durationSec);

    osc.start(t);
    osc.stop(t + durationSec);
  }

  function getTimingProfile() {
    const scale = 1 / speedMultiplier;
    return {
      dot: 0.08 * scale,
      dash: 0.24 * scale,
      symbolGap: 0.08 * scale,
      letterGap: 0.24 * scale,
      wordGap: 0.56 * scale,
    };
  }

  function playMorse(letter) {
    if (isMuted) return;
    const code = MORSE_RAW[letter];
    if (!code) return;

    const ctx = getAudioCtx();
    const { dot, dash, symbolGap } = getTimingProfile();

    let t = ctx.currentTime + 0.03;
    for (const sym of code) {
      const dur = sym === '.' ? dot : dash;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = toneFreq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.008);
      gain.gain.setValueAtTime(0.25, t + dur - 0.008);
      gain.gain.linearRampToValueAtTime(0, t + dur);

      osc.start(t);
      osc.stop(t + dur);
      t += dur + symbolGap;
    }
  }

  let activeAudioPlaybackTimeouts = [];

  function stopAllActivePlaybacks() {
    activeAudioPlaybackTimeouts.forEach((t) => clearTimeout(t));
    activeAudioPlaybackTimeouts = [];
    clearHighlight();
  }

  function playMorseSentence(text) {
    stopAllActivePlaybacks();
    if (!text || !text.trim()) return;

    const ctx = getAudioCtx();
    const { dot, dash, symbolGap, letterGap, wordGap } = getTimingProfile();

    let currentTime = ctx.currentTime + 0.05;
    let visualDelay = 50;
    const uppercaseText = text.toUpperCase();

    for (let w = 0; w < uppercaseText.length; w++) {
      const char = uppercaseText[w];

      if (char === ' ') {
        currentTime += wordGap;
        visualDelay += wordGap * 1000;
        continue;
      }

      const code = MORSE_RAW[char];
      if (!code) continue;

      let charDuration = 0;
      let tempTime = currentTime;
      for (const sym of code) {
        const dur = sym === '.' ? dot : dash;
        if (!isMuted) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = toneFreq;
          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(0, tempTime);
          gain.gain.linearRampToValueAtTime(0.25, tempTime + 0.008);
          gain.gain.setValueAtTime(0.25, tempTime + dur - 0.008);
          gain.gain.linearRampToValueAtTime(0, tempTime + dur);

          osc.start(tempTime);
          osc.stop(tempTime + dur);
        }

        const ledTimer = setTimeout(() => {
          flashSignalHardware(sym, Math.max(80, dur * 1000));
        }, Math.max(0, (tempTime - ctx.currentTime) * 1000));
        activeAudioPlaybackTimeouts.push(ledTimer);

        tempTime += dur + symbolGap;
        charDuration += dur + symbolGap;
      }

      const currentHighlightIndex = findNodeIndex(char);
      if (currentHighlightIndex) {
        const highlightTimeout = setTimeout(() => {
          highlightPath(currentHighlightIndex);
          if (circleEls[currentHighlightIndex]) {
            circleEls[currentHighlightIndex].classList.add('active-node', 'playing');
            labelEls[currentHighlightIndex].classList.add('active-label');
            setTimeout(() => {
              if (circleEls[currentHighlightIndex]) {
                circleEls[currentHighlightIndex].classList.remove('playing');
              }
            }, 400);
          }
        }, visualDelay);
        activeAudioPlaybackTimeouts.push(highlightTimeout);
      }

      currentTime += charDuration + letterGap;
      visualDelay += (charDuration + letterGap) * 1000;
    }

    const endTimeout = setTimeout(() => {
      clearHighlight();
    }, visualDelay);
    activeAudioPlaybackTimeouts.push(endTimeout);
  }

  // ---- Side Drawer Controllers (with inert + focus management) ----
  function setShellInert(isInert) {
    if (isInert) {
      appShell.setAttribute('inert', '');
    } else {
      appShell.removeAttribute('inert');
    }
  }

  function openLeftDrawer() {
    closeRightDrawer(false);
    lastDrawerTrigger = btnToggleLeftDrawer;
    drawerLeft.classList.add('open');
    drawerLeft.setAttribute('aria-hidden', 'false');
    btnToggleLeftDrawer.setAttribute('aria-expanded', 'true');
    setShellInert(true);
    showOverlay();
    setTimeout(() => translatorTextInput.focus(), 120);
  }

  function closeLeftDrawer(restoreFocus = true) {
    drawerLeft.classList.remove('open');
    drawerLeft.setAttribute('aria-hidden', 'true');
    btnToggleLeftDrawer.setAttribute('aria-expanded', 'false');
    checkHideOverlay(restoreFocus);
  }

  function openRightDrawer() {
    closeLeftDrawer(false);
    lastDrawerTrigger = btnToggleRightDrawer;
    drawerRight.classList.add('open');
    drawerRight.setAttribute('aria-hidden', 'false');
    btnToggleRightDrawer.setAttribute('aria-expanded', 'true');
    setShellInert(true);
    showOverlay();
    setTimeout(() => btnCloseRight.focus(), 120);
  }

  function closeRightDrawer(restoreFocus = true) {
    drawerRight.classList.remove('open');
    drawerRight.setAttribute('aria-hidden', 'true');
    btnToggleRightDrawer.setAttribute('aria-expanded', 'false');
    checkHideOverlay(restoreFocus);
  }

  function showOverlay() {
    drawerOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      drawerOverlay.classList.add('opacity-100');
    });
  }

  function checkHideOverlay(restoreFocus) {
    const leftOpen = drawerLeft.classList.contains('open');
    const rightOpen = drawerRight.classList.contains('open');
    if (!leftOpen && !rightOpen) {
      setShellInert(false);
      drawerOverlay.classList.remove('opacity-100');
      setTimeout(() => {
        if (!drawerLeft.classList.contains('open') && !drawerRight.classList.contains('open')) {
          drawerOverlay.classList.add('hidden');
        }
      }, 280);
      if (restoreFocus && lastDrawerTrigger) {
        lastDrawerTrigger.focus();
        lastDrawerTrigger = null;
      }
    }
  }

  function closeAllDrawers() {
    closeLeftDrawer(true);
    closeRightDrawer(true);
  }

  // ---- Morse Telegraph Input System ----
  let inputBuffer = '';
  let keyDownTime = 0;
  let isKeyDown = false;
  let decodeTimer = null;
  let phraseTimer = null;
  let holdInterval = null;
  let message = '';
  let isPhraseMode = false;
  let pendingPhrase = '';

  function updateInputDisplay() {
    const symbolsStr = inputBuffer
      .split('')
      .map((s) => (s === '.' ? '·' : '—'))
      .join(' ');

    if (isPhraseMode) {
      inputSymbols.textContent = pendingPhrase + (symbolsStr ? ` [${symbolsStr}]` : '');
    } else {
      inputSymbols.textContent = symbolsStr;
    }

    if (inputBuffer.length > 0) {
      const partialIdx = findPartialNodeIndex(inputBuffer);
      if (partialIdx) {
        highlightPath(partialIdx);
      }
    }

    const letter = MORSE_TO_LETTER[inputBuffer];
    if (inputBuffer.length > 0) {
      inputPreview.classList.remove('hidden');
      inputPreview.classList.add('visible');
      if (letter) {
        previewChar.textContent = letter;
        inputPreview.classList.remove('fail');
        inputPreview.classList.add('success');
      } else {
        previewChar.textContent = '?';
        inputPreview.classList.remove('success');
        if (inputBuffer.length >= 4) {
          inputPreview.classList.add('fail');
        } else {
          inputPreview.classList.remove('fail');
        }
      }
    } else {
      inputPreview.classList.remove('visible', 'success', 'fail');
      inputPreview.classList.add('hidden');
    }
  }

  function finalizePhrase() {
    if (!pendingPhrase) return;
    playMorseSentence(pendingPhrase);
    pendingPhrase = '';
    updateInputDisplay();
  }

  function resetPhraseTimer() {
    if (phraseTimer) clearTimeout(phraseTimer);
    phraseTimer = setTimeout(finalizePhrase, 2200);
  }

  function decodeCurrent() {
    if (!inputBuffer) return;

    const letter = MORSE_TO_LETTER[inputBuffer];
    if (letter) {
      if (isPhraseMode) {
        pendingPhrase += letter;
        message += letter;
        updateMessage();
        updateInputDisplay();

        const idx = findNodeIndex(letter);
        if (idx) {
          highlightPath(idx);
          circleEls[idx].classList.add('active-node');
          labelEls[idx].classList.add('active-label');
          setTimeout(() => {
            if (circleEls[idx]) circleEls[idx].classList.remove('active-node');
            if (labelEls[idx]) labelEls[idx].classList.remove('active-label');
          }, 600);
        }
        resetPhraseTimer();
      } else {
        message += letter;
        updateMessage();
        playMorse(letter);

        const idx = findNodeIndex(letter);
        if (idx) {
          highlightPath(idx);
          circleEls[idx].classList.add('active-node', 'playing');
          labelEls[idx].classList.add('active-label');
          setTimeout(() => {
            if (circleEls[idx]) circleEls[idx].classList.remove('playing');
          }, 500);
          setTimeout(() => {
            if (!inputBuffer) clearHighlight();
          }, 1800);
        }
      }
    } else {
      playTone(0.05, 300);
    }

    inputBuffer = '';
    updateInputDisplay();
  }

  function resetDecodeTimer() {
    if (decodeTimer) clearTimeout(decodeTimer);
    decodeTimer = setTimeout(decodeCurrent, DECODE_DELAY);
  }

  function pushMorseSymbol(symbol) {
    if (decodeTimer) clearTimeout(decodeTimer);
    if (phraseTimer) clearTimeout(phraseTimer);

    playTone(symbol === '.' ? 0.06 : 0.18, toneFreq);
    flashSignalHardware(symbol, symbol === '.' ? 130 : 240);
    inputBuffer += symbol;
    updateInputDisplay();
    resetDecodeTimer();
  }

  function onSpaceDown() {
    if (isKeyDown) return;
    isKeyDown = true;
    keyDownTime = performance.now();

    tapArea.classList.add('pressing');
    telegraphPaddle3d.classList.add('active');
    signalLed3d.classList.remove('led-dash');
    signalLed3d.classList.add('led-dot');
    keyFill.style.width = '0%';
    keyFill.classList.remove('dot-zone', 'dash-zone');
    keyFill.classList.add('dot-zone');

    if (decodeTimer) clearTimeout(decodeTimer);
    if (phraseTimer) clearTimeout(phraseTimer);

    holdInterval = setInterval(() => {
      const elapsed = performance.now() - keyDownTime;
      const pct = Math.min(elapsed / 500, 1) * 100;
      keyFill.style.width = `${pct}%`;

      if (elapsed >= DASH_THRESHOLD) {
        keyFill.classList.remove('dot-zone');
        keyFill.classList.add('dash-zone');
        signalLed3d.classList.remove('led-dot');
        signalLed3d.classList.add('led-dash');
      }
    }, 16);
  }

  function onSpaceUp() {
    if (!isKeyDown) return;
    isKeyDown = false;
    tapArea.classList.remove('pressing');
    telegraphPaddle3d.classList.remove('active');
    signalLed3d.classList.remove('led-dot', 'led-dash');

    clearInterval(holdInterval);
    keyFill.style.width = '0%';
    keyFill.classList.remove('dot-zone', 'dash-zone');

    const elapsed = performance.now() - keyDownTime;
    const symbol = elapsed >= DASH_THRESHOLD ? '-' : '.';
    pushMorseSymbol(symbol);
  }

  function updateMessage() {
    decodedMsg.textContent = message;
    if (message.length > 0) {
      decodedMsg.classList.remove('letter-flash');
      void decodedMsg.offsetWidth;
      decodedMsg.classList.add('letter-flash');
    }
  }

  // ---- Bidirectional Translator (Text <-> Morse) ----
  let translatorPlainText = '';

  function normalizeMorseInput(raw) {
    return raw
      .replace(/·/g, '.')
      .replace(/[—–−]/g, '-')
      .replace(/_/g, '-');
  }

  function isLikelyMorseInput(text) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    return /^[.\-·—–−_/\s]+$/.test(trimmed);
  }

  function updateLiveTranslation() {
    const raw = translatorTextInput.value;
    if (!raw.trim()) {
      translatorOutputLabel.textContent = 'Morse Resultante:';
      translatorMorseOutput.textContent = '- - -';
      translatorPlainText = '';
      return;
    }

    if (isLikelyMorseInput(raw)) {
      translatorOutputLabel.textContent = 'Texto Decodificado:';
      const normalized = normalizeMorseInput(raw.trim());
      const words = normalized.split(/\s*\/\s*|\s{3,}/);
      const decodedWords = words.map((word) =>
        word
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((code) => MORSE_TO_LETTER[code] || '?')
          .join('')
      );
      const result = decodedWords.join(' ').trim();
      translatorMorseOutput.textContent = result || '???';
      translatorPlainText = result.replace(/\?/g, '');
    } else {
      translatorOutputLabel.textContent = 'Morse Resultante:';
      const morseResult = raw
        .toUpperCase()
        .split('')
        .map((char) => {
          if (char === ' ') return '   ';
          const code = MORSE_RAW[char];
          return code ? code.replace(/\./g, '·').replace(/-/g, '—') : '';
        })
        .filter((x) => x !== '')
        .join(' ');
      translatorMorseOutput.textContent = morseResult || '???';
      translatorPlainText = raw;
    }
  }

  // ---- Copy Helper ----
  async function copyWithFeedback(buttonEl, textValue) {
    if (!textValue || !textValue.trim() || textValue === '- - -' || textValue === '???') return;
    const originalHTML = buttonEl.innerHTML;
    try {
      await navigator.clipboard.writeText(textValue.trim());
      buttonEl.innerHTML = '<span>✓ Copiado</span>';
      setTimeout(() => {
        buttonEl.innerHTML = originalHTML;
      }, 1500);
    } catch {
      buttonEl.innerHTML = '<span>! Error</span>';
      setTimeout(() => {
        buttonEl.innerHTML = originalHTML;
      }, 1500);
    }
  }

  // ---- Predefined Phrases Populator ----
  function renderPresets(category) {
    predefinedPhrasesContainer.innerHTML = '';
    const phrases = PRESET_PHRASES[category] || [];

    phrases.forEach((phrase) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'phrase-text';
      titleSpan.textContent = phrase.text;

      const morseSpan = document.createElement('span');
      morseSpan.className = 'phrase-morse';
      morseSpan.textContent = phrase.morse;

      chip.appendChild(titleSpan);
      chip.appendChild(morseSpan);

      chip.addEventListener('click', () => {
        message = phrase.text;
        updateMessage();
        playMorseSentence(phrase.text);
      });

      predefinedPhrasesContainer.appendChild(chip);
    });
  }

  // ---- 3D Spatial Parallax & Mode Controller ----
  function initSpatial3D() {
    treeStage.addEventListener('pointermove', (e) => {
      if (!is3dMode || prefersReducedMotion()) return;
      const rect = treeBoard3d.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;  // -1 .. 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;  // -1 .. 1
      const rx = (10 - ny * 4.5).toFixed(2);
      const ry = (nx * 5.5).toFixed(2);
      const gx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
      const gy = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);

      treeBoard3d.style.setProperty('--rx', `${rx}deg`);
      treeBoard3d.style.setProperty('--ry', `${ry}deg`);
      treeBoard3d.style.setProperty('--glare-x', `${gx}%`);
      treeBoard3d.style.setProperty('--glare-y', `${gy}%`);
    });

    treeStage.addEventListener('pointerleave', () => {
      treeBoard3d.style.setProperty('--rx', '10deg');
      treeBoard3d.style.setProperty('--ry', '0deg');
      treeBoard3d.style.setProperty('--glare-x', '50%');
      treeBoard3d.style.setProperty('--glare-y', '30%');
    });

    infoPanel.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion()) return;
      const rect = infoPanel.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      infoPanel.style.setProperty('--hud-rx', `${(-ny * 5).toFixed(2)}deg`);
      infoPanel.style.setProperty('--hud-ry', `${(nx * 6).toFixed(2)}deg`);
    });

    infoPanel.addEventListener('pointerleave', () => {
      infoPanel.style.setProperty('--hud-rx', '0deg');
      infoPanel.style.setProperty('--hud-ry', '0deg');
    });
  }

  function toggle3dMode() {
    is3dMode = !is3dMode;
    btnToggle3d.setAttribute('aria-pressed', String(is3dMode));
    treeBoard3d.classList.toggle('is-3d-active', is3dMode);
    if (!is3dMode) {
      treeBoard3d.style.setProperty('--rx', '0deg');
      treeBoard3d.style.setProperty('--ry', '0deg');
    } else {
      treeBoard3d.style.setProperty('--rx', '10deg');
      treeBoard3d.style.setProperty('--ry', '0deg');
    }
  }

  // ---- Responsive Tree Fit/Zoom ----
  function centerScroll() {
    if (isTreeFitMode) {
      treeScrollContainer.scrollLeft = 0;
      return;
    }
    const scrollLeft = (treeWrapper.scrollWidth - treeScrollContainer.clientWidth) / 2;
    if (scrollLeft > 0) treeScrollContainer.scrollLeft = scrollLeft;
  }

  function toggleTreeFit() {
    isTreeFitMode = !isTreeFitMode;
    btnFitTree.setAttribute('aria-pressed', String(isTreeFitMode));
    if (isTreeFitMode) {
      treeWrapper.classList.add('tree-wrapper--fit');
      treeWrapper.classList.remove('tree-wrapper--zoomed');
      btnFitTree.innerHTML = '<span>⤢ Vista detallada</span>';
    } else {
      treeWrapper.classList.remove('tree-wrapper--fit');
      treeWrapper.classList.add('tree-wrapper--zoomed');
      btnFitTree.innerHTML = '<span>⊡ Ajustar a pantalla</span>';
    }
    requestAnimationFrame(centerScroll);
  }

  // ---- Event Listeners ----
  function attachEvents() {
    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      const g = nodeEls[i];

      const activateNode = () => {
        if (i === 1) return;
        const node = TREE[i];
        highlightPath(i);
        playMorse(node.ch);
        circleEls[i].classList.add('active-node', 'playing');
        labelEls[i].classList.add('active-label');
        setTimeout(() => {
          if (circleEls[i]) circleEls[i].classList.remove('playing');
        }, 500);
      };

      g.addEventListener('mouseenter', () => highlightPath(i));
      g.addEventListener('focus', () => highlightPath(i));
      g.addEventListener('click', activateNode);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          activateNode();
        }
      });
    }

    svg.addEventListener('mouseleave', () => {
      if (!inputBuffer) clearHighlight();
    });

    document.addEventListener('touchstart', (e) => {
      if (!svg.contains(e.target) && !infoPanel.contains(e.target) && !inputBuffer) {
        clearHighlight();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDrawers();
        return;
      }

      if (drawerLeft.classList.contains('open') || drawerRight.classList.contains('open')) {
        return;
      }

      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        if (e.target.closest('button') || e.target.closest('.tree-node-group')) return;
        e.preventDefault();
        onSpaceDown();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          updateInputDisplay();
          resetDecodeTimer();
        } else if (message.length > 0) {
          message = message.slice(0, -1);
          updateMessage();
          if (isPhraseMode && pendingPhrase.length > 0) {
            pendingPhrase = pendingPhrase.slice(0, -1);
            updateInputDisplay();
          }
        }
      } else if (e.code === 'Enter') {
        if (e.target.closest('button') || e.target.closest('.tree-node-group')) return;
        e.preventDefault();
        if (inputBuffer) decodeCurrent();
        message += ' ';
        updateMessage();
        if (isPhraseMode) {
          pendingPhrase += ' ';
          updateInputDisplay();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && isKeyDown) {
        e.preventDefault();
        onSpaceUp();
      }
    });

    let tapDown = 0;
    tapArea.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tapArea.focus();
      tapDown = performance.now();
      onSpaceDown();
    });

    tapArea.addEventListener('pointerup', (e) => {
      e.preventDefault();
      keyDownTime = tapDown;
      onSpaceUp();
    });

    tapArea.addEventListener('pointercancel', () => {
      if (isKeyDown) {
        isKeyDown = false;
        tapArea.classList.remove('pressing');
        telegraphPaddle3d.classList.remove('active');
        signalLed3d.classList.remove('led-dot', 'led-dash');
        clearInterval(holdInterval);
        keyFill.style.width = '0%';
      }
    });

    btnInsertDot.addEventListener('click', () => {
      btnInsertDot.classList.add('keycap-pressed');
      setTimeout(() => btnInsertDot.classList.remove('keycap-pressed'), 120);
      pushMorseSymbol('.');
    });

    btnInsertDash.addEventListener('click', () => {
      btnInsertDash.classList.add('keycap-pressed');
      setTimeout(() => btnInsertDash.classList.remove('keycap-pressed'), 180);
      pushMorseSymbol('-');
    });

    btnPlayActiveNode.addEventListener('click', () => {
      if (activeSelectedLetter) playMorse(activeSelectedLetter);
    });

    btnPlayMessage.addEventListener('click', () => {
      if (message.trim()) playMorseSentence(message);
    });

    btnCopyMessage.addEventListener('click', () => copyWithFeedback(btnCopyMessage, message));

    btnClear.addEventListener('click', () => {
      stopAllActivePlaybacks();
      message = '';
      inputBuffer = '';
      pendingPhrase = '';
      decodedMsg.textContent = '';
      updateInputDisplay();
      clearHighlight();
    });

    btnWordSpace.addEventListener('click', () => {
      if (inputBuffer) decodeCurrent();
      message += ' ';
      updateMessage();
      if (isPhraseMode) {
        pendingPhrase += ' ';
        updateInputDisplay();
      }
    });

    wpmSelect.addEventListener('change', (e) => {
      speedMultiplier = parseFloat(e.target.value) || 1;
    });

    freqSelect.addEventListener('change', (e) => {
      toneFreq = parseInt(e.target.value, 10) || 680;
    });

    btnMuteAudio.addEventListener('click', () => {
      isMuted = !isMuted;
      btnMuteAudio.setAttribute('aria-pressed', String(isMuted));
      btnMuteAudio.setAttribute('aria-label', isMuted ? 'Activar audio' : 'Silenciar audio');
      muteIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    btnToggle3d.addEventListener('click', toggle3dMode);
    btnFitTree.addEventListener('click', toggleTreeFit);

    translatorTextInput.addEventListener('input', updateLiveTranslation);
    btnPlayTranslated.addEventListener('click', () => {
      const targetText = translatorPlainText || translatorTextInput.value;
      if (targetText.trim()) playMorseSentence(targetText);
    });
    btnCopyTranslated.addEventListener('click', () =>
      copyWithFeedback(btnCopyTranslated, translatorMorseOutput.textContent)
    );

    phraseCategoryToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      const category = checked ? 'basico' : 'emergencia';
      phraseCategoryLabel.textContent = checked ? 'Básico' : 'Emergencia';
      renderPresets(category);
    });

    inputModeToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      isPhraseMode = checked;
      inputModeLabel.textContent = checked ? 'Modo Frase' : 'Letra a Letra';
      if (phraseTimer) clearTimeout(phraseTimer);
      if (decodeTimer) clearTimeout(decodeTimer);
      inputBuffer = '';
      pendingPhrase = '';
      updateInputDisplay();
    });

    btnToggleLeftDrawer.addEventListener('click', openLeftDrawer);
    btnToggleRightDrawer.addEventListener('click', openRightDrawer);
    btnCloseLeft.addEventListener('click', () => closeLeftDrawer(true));
    btnCloseRight.addEventListener('click', () => closeRightDrawer(true));
    drawerOverlay.addEventListener('click', closeAllDrawers);
  }

  function init() {
    buildTree();
    attachEvents();
    initSpatial3D();
    renderPresets('emergencia');
    requestAnimationFrame(() => requestAnimationFrame(centerScroll));
    window.addEventListener('resize', centerScroll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
