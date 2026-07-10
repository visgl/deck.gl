import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

// --- State ---

const controllerOptions = {
  doubleClickZoom: true,
  doubleClickDragZoom: false,
  dragPan: true,
  dragRotate: true,
  scrollZoom: true,
  touchZoom: true,
  touchRotate: false,
  keyboard: true,
  inertia: false
};

const INITIAL_VIEW_STATE = {
  longitude: -122.45,
  latitude: 37.78,
  zoom: 11,
  pitch: 30,
  bearing: 0
};

const timing = {
  lastPointerDown: 0,
  lastPointerUp: 0,
  lastWheel: 0,
  lastKeyDown: 0,
  lastMoveTime: {},
  gestureStartTime: {},
  log: [],
  clickDelays: []
};

// --- Deck Setup ---

const DATA = [];
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 20; j++) {
    DATA.push({
      position: [-122.45 + i * 0.005, 37.78 + j * 0.005],
      radius: 50 + (((i * 20 + j) * 7) % 100),
      color: [70 + ((i * 13) % 180), 100 + ((j * 17) % 155), 200]
    });
  }
}

let viewState = {...INITIAL_VIEW_STATE};

const deck = new Deck({
  parent: document.getElementById('deck-container'),
  views: new MapView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: {...controllerOptions},
  onViewStateChange: ({viewState: vs}) => {
    viewState = vs;
    deck.setProps({viewState});
  },
  onClick: (info, event) => {
    const tapCount = event.tapCount || 1;
    onGesture(`pick:click(tap=${tapCount})`);
  },
  onDragStart: () => onGesture('pick:dragstart'),
  onDragEnd: () => onGesture('pick:dragend'),
  layers: [
    new ScatterplotLayer({
      id: 'scatter',
      data: DATA,
      pickable: true,
      getPosition: d => d.position,
      getRadius: d => d.radius,
      getFillColor: d => d.color,
      radiusMinPixels: 5,
      radiusMaxPixels: 30
    })
  ],
  onLoad: () => setupTimingListeners()
});

// --- Timing Measurement ---

function setupTimingListeners() {
  const canvas = deck.getCanvas();
  const eventManager = deck.getEventManager();

  // Raw DOM events — capture phase for earliest possible timestamp
  canvas.addEventListener(
    'pointerdown',
    () => {
      timing.lastPointerDown = performance.now();
    },
    {capture: true}
  );

  canvas.addEventListener(
    'pointerup',
    () => {
      timing.lastPointerUp = performance.now();
    },
    {capture: true}
  );

  canvas.addEventListener(
    'wheel',
    () => {
      timing.lastWheel = performance.now();
    },
    {capture: true}
  );

  canvas.addEventListener(
    'keydown',
    () => {
      timing.lastKeyDown = performance.now();
    },
    {capture: true}
  );

  // Recognized gesture events — all passive (watch) to avoid affecting recognizer state
  const gestureEvents = [
    'click',
    'dblclick',
    'panstart',
    'panmove',
    'panend',
    'pinchstart',
    'pinchmove',
    'pinchend',
    'dblclickdragstart',
    'dblclickdragmove',
    'dblclickdragend'
  ];

  for (const eventType of gestureEvents) {
    eventManager.watch(eventType, () => onGesture(eventType));
  }

  // Wheel and keyboard go through EventManager too
  eventManager.watch('wheel', () => onGesture('wheel'));
  eventManager.watch('keydown', () => onGesture('keydown'));
}

function onGesture(type) {
  const now = performance.now();
  let delta = null;

  if (type === 'click' || type === 'dblclick' || type.startsWith('pick:click')) {
    // Recognizer delay: time from pointerup to recognized click
    delta = timing.lastPointerUp ? now - timing.lastPointerUp : null;
  } else if (type === 'wheel') {
    delta = timing.lastWheel ? now - timing.lastWheel : null;
  } else if (type === 'keydown') {
    delta = timing.lastKeyDown ? now - timing.lastKeyDown : null;
  } else if (type.endsWith('start')) {
    // Start events: delay from pointerdown to gesture recognition
    delta = timing.lastPointerDown ? now - timing.lastPointerDown : null;
  } else if (type.endsWith('move')) {
    // Move events: frame interval (time since last move of same type)
    const lastMove = timing.lastMoveTime[type];
    delta = lastMove ? now - lastMove : null;
    timing.lastMoveTime[type] = now;
  } else if (type.endsWith('end') || type.endsWith('cancel')) {
    // End events: total gesture duration from start
    const startKey = type.replace(/end$|cancel$/, 'start');
    const startTime = timing.gestureStartTime[startKey];
    delta = startTime ? now - startTime : null;
  }

  // Track gesture start times for duration measurement
  if (type.endsWith('start')) {
    timing.gestureStartTime[type] = now;
  }

  const entry = {type, delta, time: now};
  timing.log.unshift(entry);
  if (timing.log.length > 80) timing.log.pop();

  if (type === 'click' && delta !== null) {
    timing.clickDelays.unshift(delta);
    if (timing.clickDelays.length > 20) timing.clickDelays.pop();
  }

  renderLog();
  renderStats();
}

// --- UI Rendering ---

function renderControls() {
  const section = document.getElementById('controls-section');
  const toggles = [
    {key: 'doubleClickZoom', label: 'doubleClickZoom', hint: '+300ms / enables onClick(tap=2)'},
    {key: 'doubleClickDragZoom', label: 'doubleClickDragZoom', hint: '+300ms click delay'},
    {key: 'dragPan', label: 'dragPan'},
    {key: 'dragRotate', label: 'dragRotate'},
    {key: 'scrollZoom', label: 'scrollZoom'},
    {key: 'touchZoom', label: 'touchZoom'},
    {key: 'touchRotate', label: 'touchRotate'},
    {key: 'keyboard', label: 'keyboard'},
    {key: 'inertia', label: 'inertia'}
  ];

  let html = '<h2>Controller Options</h2>';
  for (const {key, label, hint} of toggles) {
    const checked = controllerOptions[key] ? 'checked' : '';
    const hintHtml = hint ? `<span class="hint">${hint}</span>` : '';
    html += `<label class="toggle-row">
      <input type="checkbox" data-key="${key}" ${checked}>
      ${label}${hintHtml}
    </label>`;
  }
  html += `<div style="margin-top:8px;font-size:10px;color:#888;line-height:1.4">
    <b>Note:</b> doubleClickZoom controls both zoom-on-dblclick AND whether
    onClick fires with tapCount=2 on double-click (PR #9629). Disabling it
    gives instant clicks but loses onClick(tap=2).
  </div>`;
  section.innerHTML = html;

  section.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.key;
      if (key === 'inertia') {
        controllerOptions[key] = cb.checked ? 300 : false;
      } else {
        controllerOptions[key] = cb.checked;
      }
      deck.setProps({controller: {...controllerOptions}});
    });
  });
}

function renderPresets() {
  const section = document.getElementById('presets-section');
  section.innerHTML = `<h2>Presets</h2>
    <div class="presets">
      <button id="preset-default">Default (dblclick on)</button>
      <button id="preset-fast">Fast Clicks (dblclick off)</button>
      <button id="preset-clear">Clear Log</button>
    </div>`;

  document.getElementById('preset-default').addEventListener('click', () => {
    controllerOptions.doubleClickZoom = true;
    controllerOptions.doubleClickDragZoom = false;
    deck.setProps({controller: {...controllerOptions}});
    timing.clickDelays.length = 0;
    renderControls();
  });

  document.getElementById('preset-fast').addEventListener('click', () => {
    controllerOptions.doubleClickZoom = false;
    controllerOptions.doubleClickDragZoom = false;
    deck.setProps({controller: {...controllerOptions}});
    timing.clickDelays.length = 0;
    renderControls();
  });

  document.getElementById('preset-clear').addEventListener('click', () => {
    timing.log.length = 0;
    timing.clickDelays.length = 0;
    renderLog();
    renderStats();
  });
}

function renderStats() {
  const section = document.getElementById('stats-section');
  const delays = timing.clickDelays;

  if (delays.length === 0) {
    section.innerHTML = `<h2>Click Latency</h2>
      <div class="stats">
        <div class="stat-box"><div class="stat-value">—</div><div class="stat-label">avg</div></div>
        <div class="stat-box"><div class="stat-value">—</div><div class="stat-label">min</div></div>
        <div class="stat-box"><div class="stat-value">—</div><div class="stat-label">max</div></div>
      </div>`;
    return;
  }

  const avg = delays.reduce((s, d) => s + d, 0) / delays.length;
  const min = Math.min(...delays);
  const max = Math.max(...delays);

  const colorClass = avg < 50 ? 'color-green' : avg < 200 ? 'color-yellow' : 'color-red';

  section.innerHTML = `<h2>Click Latency (n=${delays.length})</h2>
    <div class="stats">
      <div class="stat-box"><div class="stat-value ${colorClass}">${avg.toFixed(0)}ms</div><div class="stat-label">avg</div></div>
      <div class="stat-box"><div class="stat-value">${min.toFixed(0)}ms</div><div class="stat-label">min</div></div>
      <div class="stat-box"><div class="stat-value">${max.toFixed(0)}ms</div><div class="stat-label">max</div></div>
    </div>`;
}

function renderLog() {
  const section = document.getElementById('event-log');
  let html = '<h2>Event Timeline</h2>';

  for (const entry of timing.log.slice(0, 50)) {
    const colorClass = getColorClass(entry.delta);
    const deltaStr = entry.delta !== null ? `${entry.delta.toFixed(1)}ms` : '—';
    const timeStr = formatTime(entry.time);
    html += `<div class="log-entry ${colorClass}">
      <span class="log-type">${entry.type}</span>
      <span class="log-delta">${deltaStr}</span>
      <span class="log-time">${timeStr}</span>
    </div>`;
  }

  section.innerHTML = html;
}

function getColorClass(delta) {
  if (delta === null) return 'color-gray';
  if (delta < 50) return 'color-green';
  if (delta < 200) return 'color-yellow';
  return 'color-red';
}

function formatTime(perfNow) {
  const d = new Date(performance.timeOrigin + perfNow);
  return d.toISOString().slice(11, 23);
}

// --- Init ---

renderControls();
renderPresets();
renderStats();
renderLog();
