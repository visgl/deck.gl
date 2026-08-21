// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {ArcLayer, LineLayer, PathLayer} from '@deck.gl/layers';
import {webgpuAdapter} from '@luma.gl/webgpu';

const WIDTH = 3840;
const HEIGHT = 2160;
const WARMUP_SAMPLES = 20;
const QUERY_TIMEOUT = 5000;

const thinPaths = createThinPaths();
const thickPaths = createThickPaths();
const thinLines = thinPaths.map(({path}) => ({sourcePosition: path[0], targetPosition: path[1]}));
const sparseArcs = createSparseArcs();

const workloads = [
  {
    id: 'path-thin-strokes',
    label: 'PathLayer vertex-bound: 100K sparse 1px strokes',
    data: thinPaths,
    width: 1,
    picking: false,
    createLayer: createPathLayer
  },
  {
    id: 'path-thick-overdraw',
    label: 'PathLayer fragment-bound: 256 overlapping 64px strokes',
    data: thickPaths,
    width: 64,
    picking: false,
    createLayer: createPathLayer
  },
  {
    id: 'path-picking',
    label: 'PathLayer picking pass: 100K sparse 1px strokes',
    data: thinPaths,
    width: 1,
    picking: true,
    createLayer: createPathLayer
  },
  {
    id: 'line-thin-strokes',
    label: 'LineLayer vertex-bound: 100K sparse 1px strokes',
    data: thinLines,
    width: 1,
    picking: false,
    createLayer: createLineLayer
  },
  {
    id: 'arc-thin-strokes',
    label: 'ArcLayer vertex-bound: 10K sparse 1px arcs with 50 segments',
    data: sparseArcs,
    width: 1,
    picking: false,
    createLayer: createArcLayer
  }
];

const controls = document.querySelector('#controls');
const backendInput = document.querySelector('#backend');
const samplesInput = document.querySelector('#samples');
const statusElement = document.querySelector('#status');
const resultsElement = document.querySelector('#results');
const canvasContainer = document.querySelector('#canvas-container');

const query = new URLSearchParams(location.search);
backendInput.value = query.get('backend') || 'webgl';
samplesInput.value = query.get('samples') || '100';

controls.addEventListener('submit', event => {
  event.preventDefault();
  runBenchmark().catch(error => {
    statusElement.textContent = error.message;
    console.error(error);
  });
});

async function runBenchmark() {
  const backend = backendInput.value;
  const sampleCount = Number(samplesInput.value);
  controls.querySelector('button').disabled = true;
  resultsElement.replaceChildren();
  canvasContainer.replaceChildren();

  const deck = await createDeck(backend);
  try {
    if (!deck.device.features.has('timestamp-query')) {
      throw new Error(`${backend} does not expose GPU timestamp queries on this browser/adapter.`);
    }

    const results = [];
    for (const workload of workloads) {
      statusElement.textContent = `Running ${workload.label}, alternating AA off/on…`;
      const workloadResults = await runWorkload(deck, workload, sampleCount);
      appendResults(workloadResults);
      results.push(...workloadResults);
    }

    const deviceInfo = deck.device.info;
    statusElement.textContent = `Complete: ${backend}, ${deviceInfo.renderer}, ${WIDTH}×${HEIGHT}, ${sampleCount} samples.`;
    logResults(deviceInfo, sampleCount, results);
  } finally {
    deck.finalize();
    controls.querySelector('button').disabled = false;
  }
}

async function createDeck(backend) {
  let deck;
  await new Promise((resolve, reject) => {
    deck = new Deck({
      parent: canvasContainer,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false,
      views: new OrthographicView(),
      viewState: {target: [0, 0, 0], zoom: 0},
      controller: false,
      parameters: {blend: true},
      deviceProps: {
        type: backend,
        adapters: backend === 'webgpu' ? [webgpuAdapter] : [],
        featureLevel: backend === 'webgpu' ? 'max' : undefined,
        debugGPUTime: true,
        webgl: {antialias: false}
      },
      onLoad: resolve,
      onError: reject
    });
  });

  // Benchmark frames are driven explicitly so the animation loop cannot consume timestamp results.
  deck.animationLoop._cancelAnimationFrame();
  return deck;
}

async function runWorkload(deck, workload, sampleCount) {
  const layers = [false, true].map(antialiasing => workload.createLayer(workload, antialiasing));
  let activeLayerId;

  deck.setProps({layers});
  deck.layerManager.updateLayers();
  deck.deckRenderer.setProps({
    layerFilter: ({layer}) => layer.id === activeLayerId,
    drawPickingColors: workload.picking
  });

  for (let index = 0; index < WARMUP_SAMPLES; index++) {
    for (const antialiasing of getComparisonOrder(index)) {
      activeLayerId = getLayerId(workload, antialiasing);
      await measureFrame(deck, workload);
    }
  }

  const samplesByVariant = new Map([
    [false, []],
    [true, []]
  ]);
  for (let index = 0; index < sampleCount; index++) {
    for (const antialiasing of getComparisonOrder(index)) {
      activeLayerId = getLayerId(workload, antialiasing);
      samplesByVariant.get(antialiasing).push(await measureFrame(deck, workload));
    }
  }
  return [false, true].map(antialiasing => {
    const samples = samplesByVariant.get(antialiasing);
    return {workload, antialiasing, samples, ...summarize(samples)};
  });
}

function createPathLayer(workload, antialiasing) {
  return new PathLayer({
    id: getLayerId(workload, antialiasing),
    data: workload.data,
    getPath: object => object.path,
    getColor: [20, 100, 220, 180],
    getWidth: workload.width,
    widthUnits: 'pixels',
    jointRounded: false,
    capRounded: false,
    pickable: workload.picking,
    antialiasing
  });
}

function createLineLayer(workload, antialiasing) {
  return new LineLayer({
    id: getLayerId(workload, antialiasing),
    data: workload.data,
    getSourcePosition: object => object.sourcePosition,
    getTargetPosition: object => object.targetPosition,
    getColor: [20, 100, 220, 180],
    getWidth: workload.width,
    widthUnits: 'pixels',
    pickable: workload.picking,
    antialiasing
  });
}

function createArcLayer(workload, antialiasing) {
  return new ArcLayer({
    id: getLayerId(workload, antialiasing),
    data: workload.data,
    getSourcePosition: object => object.sourcePosition,
    getTargetPosition: object => object.targetPosition,
    getSourceColor: [20, 100, 220, 180],
    getTargetColor: [20, 100, 220, 180],
    getWidth: workload.width,
    getHeight: 0.25,
    widthUnits: 'pixels',
    numSegments: 50,
    pickable: workload.picking,
    antialiasing
  });
}

function getLayerId(workload, antialiasing) {
  return `${workload.id}-${antialiasing ? 'on' : 'off'}`;
}

function getComparisonOrder(index) {
  return index % 2 === 0 ? [false, true] : [true, false];
}

async function measureFrame(deck, workload) {
  deck.device.commandEncoder._gpuTimeMs = undefined;
  deck.redraw(workload.picking ? 'antialiasing picking benchmark' : 'antialiasing benchmark');
  return await waitForGpuTime(deck.device);
}

async function waitForGpuTime(device) {
  if (device.type === 'webgpu') {
    return await device._debugGPUTimeQuery.readTimestampDuration(0, 1);
  }

  const startTime = performance.now();
  while (performance.now() - startTime < QUERY_TIMEOUT) {
    const gpuTime = device.commandEncoder._gpuTimeMs;
    if (Number.isFinite(gpuTime)) {
      device.commandEncoder._gpuTimeMs = undefined;
      return gpuTime;
    }
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  throw new Error('Timed out waiting for a GPU timestamp query.');
}

function summarize(samples) {
  const sorted = samples.toSorted((left, right) => left - right);
  return {
    median: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95)
  };
}

function percentile(sorted, fraction) {
  return sorted[Math.min(Math.floor(sorted.length * fraction), sorted.length - 1)];
}

function appendResults(results) {
  const baseline = results.find(result => !result.antialiasing).median;
  for (const result of results) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${result.workload.label}</td>
      <td>${result.antialiasing ? 'on' : 'off'}</td>
      <td>${result.median.toFixed(3)}</td>
      <td>${result.p95.toFixed(3)}</td>
      <td>${(result.median / baseline).toFixed(2)}×</td>
    `;
    resultsElement.appendChild(row);
  }
}

function logResults(deviceInfo, sampleCount, results) {
  const output = results.map(result => ({
    workload: result.workload.id,
    antialiasing: result.antialiasing,
    medianGpuMs: Number(result.median.toFixed(3)),
    p95GpuMs: Number(result.p95.toFixed(3))
  }));
  console.log(
    JSON.stringify(
      {deviceInfo, width: WIDTH, height: HEIGHT, sampleCount, results: output},
      null,
      2
    )
  );
  console.table(output);
}

function createThinPaths() {
  const columns = 400;
  const rows = 250;
  return Array.from({length: columns * rows}, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = -WIDTH / 2 + 4 + column * ((WIDTH - 8) / columns);
    const y = -HEIGHT / 2 + 4 + row * ((HEIGHT - 8) / rows);
    return {
      path: [
        [x, y],
        [x + 4, y + 0.75]
      ]
    };
  });
}

function createThickPaths() {
  return Array.from({length: 256}, (_, index) => {
    const offset = (index - 128) * 4;
    return {
      path: [
        [-WIDTH / 2, -HEIGHT / 2 + offset],
        [WIDTH / 2, HEIGHT / 2 + offset]
      ]
    };
  });
}

function createSparseArcs() {
  const columns = 100;
  const rows = 100;
  return Array.from({length: columns * rows}, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = -WIDTH / 2 + 20 + column * ((WIDTH - 40) / columns);
    const y = -HEIGHT / 2 + 12 + row * ((HEIGHT - 24) / rows);
    return {
      sourcePosition: [x, y],
      targetPosition: [x + 20, y + 4]
    };
  });
}
