// ============================================================
// Morse Code Binary Tree — Interactive Decoder & Translator
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

  // ---- Input timing (ms) ----
  const DASH_THRESHOLD = 180;   // Hold > 180ms → dash, else dot
  const DECODE_DELAY   = 700;   // After 700ms silence → decode letter

  // ---- Morse tree data (1-indexed array) ----
  // Left child = dash (–), Right child = dot (·)
  const TREE = [
    null,
    { ch: '⌂', code: '' },        // 1  root
    { ch: 'T', code: '−' },       // 2
    { ch: 'E', code: '·' },       // 3
    { ch: 'M', code: '−−' },      // 4
    { ch: 'N', code: '−·' },      // 5
    { ch: 'A', code: '·−' },      // 6
    { ch: 'I', code: '··' },      // 7
    { ch: 'O', code: '−−−' },     // 8
    { ch: 'G', code: '−−·' },     // 9
    { ch: 'K', code: '−·−' },     // 10
    { ch: 'D', code: '−··' },     // 11
    { ch: 'W', code: '·−−' },     // 12
    { ch: 'R', code: '·−·' },     // 13
    { ch: 'U', code: '··−' },     // 14
    { ch: 'S', code: '···' },     // 15
    null,                          // 16
    null,                          // 17
    { ch: 'Q', code: '−−·−' },    // 18
    { ch: 'Z', code: '−−··' },    // 19
    { ch: 'Y', code: '−·−−' },    // 20
    { ch: 'C', code: '−·−·' },    // 21
    { ch: 'X', code: '−··−' },    // 22
    { ch: 'B', code: '−···' },    // 23
    { ch: 'J', code: '·−−−' },    // 24
    { ch: 'P', code: '·−−·' },    // 25
    null,                          // 26
    { ch: 'L', code: '·−··' },    // 27
    null,                          // 28
    { ch: 'F', code: '··−·' },    // 29
    { ch: 'V', code: '···−' },    // 30
    { ch: 'H', code: '····' },    // 31
  ];

  // Raw morse (dots/dashes) for audio playback
  const MORSE_RAW = {
    'T': '-', 'E': '.', 'M': '--', 'N': '-.', 'A': '.-', 'I': '..',
    'O': '---', 'G': '--.', 'K': '-.-', 'D': '-..', 'W': '.--',
    'R': '.-.', 'U': '..-', 'S': '...', 'Q': '--.-', 'Z': '--..',
    'Y': '-.--', 'C': '-.-.', 'X': '-..-', 'B': '-...', 'J': '.---',
    'P': '.--.', 'L': '.-..', 'F': '..-.', 'V': '...-', 'H': '....',
  };

  // Reverse lookup: raw morse string → letter
  const MORSE_TO_LETTER = {};
  for (const [letter, code] of Object.entries(MORSE_RAW)) {
    MORSE_TO_LETTER[code] = letter;
  }

  // Predefined key phrases categorized
  const PRESET_PHRASES = {
    emergencia: [
      { text: 'SOS', morse: '··· −−− ···' },
      { text: 'MAYDAY', morse: '−− ·− −·−− −·· ·− −·−−' },
      { text: 'HELP', morse: '···· · ·−·· ·−−·' },
      { text: 'SOS DE', morse: '··· −−− ···   −·· ·' },
      { text: 'SINKING', morse: '··· ·· −· −·− ·· −· −−·' },
      { text: 'OK', morse: '−−− −·−' }
    ],
    basico: [
      { text: 'HOLA', morse: '···· −−− ·−·· ·−' },
      { text: 'ADIOS', morse: '·− −·· ·· −−− ···' },
      { text: 'GRACIAS', morse: '−−· ·−· ·− −·−· ·· ·− ···' },
      { text: 'SI', morse: '··· ··' },
      { text: 'NO', morse: '−· −−−' },
      { text: 'BIENVENIDO', morse: '−··· ·· · −· ·−− · −· ·· −·· −−−' }
    ]
  };

  // ---- DOM refs ----
  const svg          = document.getElementById('morse-tree-svg');
  const edgesG       = document.getElementById('edges-group');
  const labelsG      = document.getElementById('edge-labels-group');
  const nodesG       = document.getElementById('nodes-group');
  const infoChar     = document.getElementById('info-char');
  const infoCode     = document.getElementById('info-code');
  const infoPanel    = document.getElementById('info-panel');
  const treeWrapper  = document.getElementById('tree-wrapper');
  const tapArea      = document.getElementById('tap-area');
  const inputSymbols = document.getElementById('input-symbols');
  const inputPreview = document.getElementById('input-preview');
  const previewChar  = document.getElementById('input-preview-char');
  const keyFill      = document.getElementById('key-fill');
  const decodedMsg   = document.getElementById('decoded-message');
  const btnClear     = document.getElementById('btn-clear');
  const btnWordSpace = document.getElementById('btn-word-space');

  // Dashboard DOM refs
  const translatorTextInput        = document.getElementById('translator-text-input');
  const btnPlayTranslated          = document.getElementById('btn-play-translated');
  const translatorMorseOutput      = document.getElementById('translator-morse-output');
  const phraseCategoryToggle       = document.getElementById('phrase-category-toggle');
  const phraseCategoryLabel        = document.getElementById('phrase-category-label');
  const predefinedPhrasesContainer = document.getElementById('predefined-phrases-container');

  // Input Mode selectors
  const inputModeToggle            = document.getElementById('input-mode-toggle');
  const inputModeLabel             = document.getElementById('input-mode-label');

  // Side drawers DOM refs
  const btnToggleLeftDrawer  = document.getElementById('btn-toggle-left-drawer');
  const btnToggleRightDrawer = document.getElementById('btn-toggle-right-drawer');
  const drawerLeft           = document.getElementById('drawer-left');
  const drawerRight          = document.getElementById('drawer-right');
  const btnCloseLeft         = document.getElementById('btn-close-left');
  const btnCloseRight        = document.getElementById('btn-close-right');
  const drawerOverlay        = document.getElementById('drawer-overlay');

  // ---- Helpers ----
  function level(i) { return Math.floor(Math.log2(i)); }
  function posInLevel(i) { return i - (1 << level(i)); }

  function nodePos(i) {
    const l = level(i);
    const p = posInLevel(i);
    const count = 1 << l;
    const x = (p + 0.5) * SVG_W / count;
    const y = l * LEVEL_GAP + TOP_PAD;
    return { x, y, l };
  }

  function pathToRoot(i) {
    const path = [];
    while (i >= 1) { path.unshift(i); i = i >> 1; }
    return path;
  }

  function edgeId(parent, child) { return `edge-${parent}-${child}`; }
  function edgeLabelId(parent, child) { return `elbl-${parent}-${child}`; }

  // Find tree index by letter
  function findNodeIndex(letter) {
    for (let i = 1; i < TREE.length; i++) {
      if (TREE[i] && TREE[i].ch === letter) return i;
    }
    return null;
  }

  // ---- SVG element factory ----
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  // ---- Build the tree ----
  const nodeEls = {};
  const circleEls = {};
  const labelEls = {};

  function buildTree() {
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    svg.setAttribute('width', '100%');
    svg.style.maxHeight = '68vh';

    // Draw edges
    for (let i = 2; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      const parentIdx = i >> 1;
      if (!TREE[parentIdx]) continue;

      const pPos = nodePos(parentIdx);
      const cPos = nodePos(i);

      const midY = (pPos.y + cPos.y) / 2;
      const pathD = `M${pPos.x},${pPos.y + NODE_RADII[pPos.l]} L${pPos.x},${midY} L${cPos.x},${midY} L${cPos.x},${cPos.y - NODE_RADII[cPos.l]}`;

      const path = svgEl('path', {
        d: pathD,
        id: edgeId(parentIdx, i),
        class: 'tree-edge',
        fill: 'none',
      });
      edgesG.appendChild(path);

      const isLeft = (i % 2 === 0);
      const lx = (pPos.x + cPos.x) / 2;
      const ly = midY;
      const labelText = svgEl('text', {
        x: lx,
        y: ly - 8,
        id: edgeLabelId(parentIdx, i),
        class: 'edge-label',
      });
      labelText.textContent = isLeft ? '—' : '·';
      labelsG.appendChild(labelText);
    }

    // Draw nodes
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
        'aria-label': `${TREE[i].ch} — Morse: ${TREE[i].code || 'Start'}`,
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

  // ---- Highlight path on hover ----
  let currentHighlight = [];

  function highlightPath(idx) {
    clearHighlight();
    if (!idx || !TREE[idx]) return;

    const path = pathToRoot(idx);
    currentHighlight = path;

    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      if (!path.includes(i)) {
        nodeEls[i].classList.add('dimmed');
      }
    }

    document.querySelectorAll('.tree-edge').forEach(e => e.classList.add('dimmed'));
    document.querySelectorAll('.edge-label').forEach(e => e.classList.add('dimmed'));

    for (let k = 1; k < path.length; k++) {
      const pIdx = path[k - 1];
      const cIdx = path[k];
      const edgeEl = document.getElementById(edgeId(pIdx, cIdx));
      const labelEl = document.getElementById(edgeLabelId(pIdx, cIdx));
      if (edgeEl) { edgeEl.classList.remove('dimmed'); edgeEl.classList.add('highlighted'); }
      if (labelEl) { labelEl.classList.remove('dimmed'); labelEl.classList.add('highlighted'); }
    }

    path.forEach(ni => {
      if (nodeEls[ni]) {
        nodeEls[ni].classList.remove('dimmed');
        circleEls[ni].classList.add('highlighted');
        labelEls[ni].classList.add('highlighted');
      }
    });

    const node = TREE[idx];
    if (node && idx !== 1) {
      infoChar.textContent = node.ch;
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
    document.querySelectorAll('.tree-edge').forEach(e => {
      e.classList.remove('highlighted', 'dimmed');
    });
    document.querySelectorAll('.edge-label').forEach(e => {
      e.classList.remove('highlighted', 'dimmed');
    });
    infoChar.textContent = '—';
    infoCode.textContent = '···';
    infoPanel.classList.remove('active');
    currentHighlight = [];
  }

  // ---- Morse Audio Playback ----
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(durationSec, freq = 680) {
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

  function playMorse(letter) {
    const code = MORSE_RAW[letter];
    if (!code) return;

    const ctx = getAudioCtx();
    const DOT = 0.08;
    const DASH = 0.24;
    const GAP = 0.1;
    const FREQ = 680;

    let t = ctx.currentTime + 0.03;
    for (const sym of code) {
      const dur = sym === '.' ? DOT : DASH;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = FREQ;
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.008);
      gain.gain.setValueAtTime(0.25, t + dur - 0.008);
      gain.gain.linearRampToValueAtTime(0, t + dur);

      osc.start(t);
      osc.stop(t + dur);
      t += dur + GAP;
    }
  }

  // Play a full sentence with perfect spacing and dynamic tree path highlighting
  let activeAudioPlaybackTimeouts = [];

  function stopAllActivePlaybacks() {
    activeAudioPlaybackTimeouts.forEach(t => clearTimeout(t));
    activeAudioPlaybackTimeouts = [];
    clearHighlight();
  }

  function playMorseSentence(text) {
    stopAllActivePlaybacks();
    
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    
    const DOT = 0.08;
    const DASH = 0.24;
    const SYMBOL_GAP = 0.08;
    const LETTER_GAP = 0.24;
    const WORD_GAP = 0.56;
    const FREQ = 680;
    
    let currentTime = ctx.currentTime + 0.05;
    let visualDelay = 50; // ms
    
    const uppercaseText = text.toUpperCase();
    
    for (let w = 0; w < uppercaseText.length; w++) {
      const char = uppercaseText[w];
      
      if (char === ' ') {
        currentTime += WORD_GAP;
        visualDelay += WORD_GAP * 1000;
        continue;
      }
      
      const code = MORSE_RAW[char];
      if (!code) continue;
      
      // Schedule audio for this character
      let charDuration = 0;
      let tempTime = currentTime;
      for (const sym of code) {
        const dur = sym === '.' ? DOT : DASH;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = FREQ;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, tempTime);
        gain.gain.linearRampToValueAtTime(0.25, tempTime + 0.008);
        gain.gain.setValueAtTime(0.25, tempTime + dur - 0.008);
        gain.gain.linearRampToValueAtTime(0, tempTime + dur);
        
        osc.start(tempTime);
        osc.stop(tempTime + dur);
        
        tempTime += dur + SYMBOL_GAP;
        charDuration += dur + SYMBOL_GAP;
      }
      
      // Highlight tree node to perfectly align with audio
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
      
      currentTime += charDuration + LETTER_GAP;
      visualDelay += (charDuration + LETTER_GAP) * 1000;
    }
    
    // Clear final highlight after full sentence is done
    const endTimeout = setTimeout(() => {
      clearHighlight();
    }, visualDelay);
    activeAudioPlaybackTimeouts.push(endTimeout);
  }

  // ---- Side Drawer State Controllers ----
  function openLeftDrawer() {
    closeRightDrawer();
    drawerLeft.classList.add('open');
    showOverlay();
  }

  function closeLeftDrawer() {
    drawerLeft.classList.remove('open');
    checkHideOverlay();
  }

  function openRightDrawer() {
    closeLeftDrawer();
    drawerRight.classList.add('open');
    showOverlay();
  }

  function closeRightDrawer() {
    drawerRight.classList.remove('open');
    checkHideOverlay();
  }

  function showOverlay() {
    drawerOverlay.classList.remove('hidden');
    setTimeout(() => {
      drawerOverlay.classList.add('opacity-100');
    }, 10);
  }

  function checkHideOverlay() {
    if (!drawerLeft.classList.contains('open') && !drawerRight.classList.contains('open')) {
      drawerOverlay.classList.remove('opacity-100');
      setTimeout(() => {
        if (!drawerLeft.classList.contains('open') && !drawerRight.classList.contains('open')) {
          drawerOverlay.classList.add('hidden');
        }
      }, 300);
    }
  }

  function closeAllDrawers() {
    closeLeftDrawer();
    closeRightDrawer();
  }

  // ---- Spacebar Morse Input System ----
  let inputBuffer = '';      // Current morse sequence: dots and dashes
  let keyDownTime = 0;       // Timestamp of spacebar press
  let isKeyDown = false;     // Is space currently held?
  let decodeTimer = null;    // Timer to auto-decode after silence
  let phraseTimer = null;    // Timer to finalize and play full phrase
  let holdInterval = null;   // Interval for updating the press bar animation
  let message = '';          // Full decoded message
  let isPhraseMode = false;  // Decoded whole phrase mode state
  let pendingPhrase = '';    // Phrase accumulator string

  function updateInputDisplay() {
    if (isPhraseMode) {
      const symbolsStr = inputBuffer
        .split('')
        .map(s => s === '.' ? '·' : '—')
        .join(' ');
      inputSymbols.textContent = pendingPhrase + (symbolsStr ? ' [' + symbolsStr + ']' : '');
    } else {
      const display = inputBuffer
        .split('')
        .map(s => s === '.' ? '·' : '—')
        .join(' ');
      inputSymbols.textContent = display;
    }

    // Live preview
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
    
    // Play full acoustic/visual sequence for the newly compiled phrase segment
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
        
        // Output to the bottom board immediately in real-time!
        message += letter;
        updateMessage();
        
        updateInputDisplay();
        
        // Quiet letter trace on the tree (no sound to not disrupt input flow)
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
            circleEls[idx].classList.remove('playing');
          }, 600);
          setTimeout(() => clearHighlight(), 2000);
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

  function onSpaceDown(e) {
    if (isKeyDown) return;
    isKeyDown = true;
    keyDownTime = performance.now();

    tapArea.classList.add('pressing');
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
      }
    }, 16);
  }

  function onSpaceUp(e) {
    if (!isKeyDown) return;
    isKeyDown = false;
    tapArea.classList.remove('pressing');

    clearInterval(holdInterval);
    keyFill.style.width = '0%';
    keyFill.classList.remove('dot-zone', 'dash-zone');

    const elapsed = performance.now() - keyDownTime;
    const symbol = elapsed >= DASH_THRESHOLD ? '-' : '.';

    playTone(symbol === '.' ? 0.06 : 0.18, 680);

    inputBuffer += symbol;
    updateInputDisplay();

    resetDecodeTimer();
  }

  function updateMessage() {
    decodedMsg.textContent = message;
    if (message.length > 0) {
      decodedMsg.classList.remove('letter-flash');
      void decodedMsg.offsetWidth; 
      decodedMsg.classList.add('letter-flash');
    }
  }

  // ---- Text Translator Live updates ----
  function updateLiveTranslation() {
    const text = translatorTextInput.value;
    if (!text.trim()) {
      translatorMorseOutput.textContent = '- - -';
      return;
    }
    
    const morseResult = text.toUpperCase().split('').map(char => {
      if (char === ' ') return '   ';
      const code = MORSE_RAW[char];
      if (code) {
        return code.replace(/\./g, '·').replace(/-/g, '—');
      }
      return '';
    }).filter(x => x !== '').join(' ');
    
    translatorMorseOutput.textContent = morseResult || '???';
  }

  // ---- Predefined Phrases Grid populator ----
  function renderPresets(category) {
    predefinedPhrasesContainer.innerHTML = '';
    const phrases = PRESET_PHRASES[category] || [];
    
    phrases.forEach(phrase => {
      const chip = document.createElement('button');
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
        playMorseSentence(phrase.text);
        
        // Populate typed area
        message = phrase.text;
        updateMessage();
      });
      
      predefinedPhrasesContainer.appendChild(chip);
    });
  }

  // ---- Event listeners ----
  function attachEvents() {
    // Tree node hover/click
    for (let i = 1; i < TREE.length; i++) {
      if (!TREE[i]) continue;
      const g = nodeEls[i];

      g.addEventListener('mouseenter', () => highlightPath(i));
      g.addEventListener('focus', () => highlightPath(i));

      g.addEventListener('click', () => {
        if (i === 1) return;
        const node = TREE[i];
        playMorse(node.ch);

        circleEls[i].classList.add('active-node', 'playing');
        labelEls[i].classList.add('active-label');
        setTimeout(() => {
          circleEls[i].classList.remove('playing');
        }, 500);
      });
    }

    svg.addEventListener('mouseleave', clearHighlight);

    document.addEventListener('touchstart', (e) => {
      if (!svg.contains(e.target)) clearHighlight();
    });

    // ---- Spacebar input (global) ----
    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onSpaceDown(e);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onSpaceUp(e);
      }
    });

    // Tap area click/touch
    let tapDown = 0;
    tapArea.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.action-btn')) return;
      e.preventDefault();
      tapDown = performance.now();
      onSpaceDown(e);
    });
    tapArea.addEventListener('pointerup', (e) => {
      if (e.target.closest('.action-btn')) return;
      e.preventDefault();
      keyDownTime = tapDown;
      onSpaceUp(e);
    });

    // Clear button
    btnClear.addEventListener('click', () => {
      stopAllActivePlaybacks();
      message = '';
      inputBuffer = '';
      pendingPhrase = '';
      decodedMsg.textContent = '';
      updateInputDisplay();
      clearHighlight();
    });

    // Word space button
    btnWordSpace.addEventListener('click', () => {
      if (inputBuffer) decodeCurrent();
      message += ' ';
      updateMessage();
      if (isPhraseMode) {
        pendingPhrase += ' ';
        updateInputDisplay();
      }
    });

    // Backspace to delete last letter
    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.code === 'Backspace') {
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
      }

      if (e.code === 'Enter') {
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

    // ---- Live Translator events ----
    translatorTextInput.addEventListener('input', updateLiveTranslation);
    
    btnPlayTranslated.addEventListener('click', () => {
      const text = translatorTextInput.value;
      if (text.trim()) {
        playMorseSentence(text);
      }
    });

    // ---- Predefined Phrases Switch Toggle ----
    phraseCategoryToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      const category = checked ? 'basico' : 'emergencia';
      phraseCategoryLabel.textContent = checked ? 'Básico' : 'Emergencia';
      renderPresets(category);
    });

    // ---- Input Mode Toggle (Letras vs Frases) ----
    inputModeToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      isPhraseMode = checked;
      inputModeLabel.textContent = checked ? 'Modo Frase' : 'Letra a Letra';
      
      // Reset buffers on toggle to prevent leaks
      if (phraseTimer) clearTimeout(phraseTimer);
      if (decodeTimer) clearTimeout(decodeTimer);
      inputBuffer = '';
      pendingPhrase = '';
      updateInputDisplay();
    });

    // ---- Side Drawer Toggle & Close Events ----
    btnToggleLeftDrawer.addEventListener('click', openLeftDrawer);
    btnToggleRightDrawer.addEventListener('click', openRightDrawer);
    
    btnCloseLeft.addEventListener('click', closeLeftDrawer);
    btnCloseRight.addEventListener('click', closeRightDrawer);
    
    drawerOverlay.addEventListener('click', closeAllDrawers);
    
    // Support Escape key to close drawers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDrawers();
      }
    });
  }

  // ---- Responsive: auto-center scroll ----
  function centerScroll() {
    const container = document.getElementById('tree-container');
    const wrapper = treeWrapper;
    const scrollLeft = (wrapper.scrollWidth - container.clientWidth) / 2;
    if (scrollLeft > 0) container.scrollLeft = scrollLeft;
  }

  // ---- Init ----
  function init() {
    buildTree();
    attachEvents();
    renderPresets('emergencia'); // default preset category
    requestAnimationFrame(() => {
      requestAnimationFrame(centerScroll);
    });
    window.addEventListener('resize', centerScroll);
    tapArea.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
