// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

const WIDTH = 3840;
const HEIGHT = 2160;
const WARMUP_SAMPLES = 5;
const QUERY_TIMEOUT = 5000;

const workloads = [
  {
    id: 'sparse-thin-strokes',
    label: '100K sparse 1px strokes',
    data: createThinPaths(),
    width: 1
  },
  {
    id: 'thick-overdraw',
    label: '256 overlapping 64px strokes',
    data: createThickPaths(),
    width: 64
  }
];

const variants = [
  {
    id: 'plain',
    label: 'plain PathLayer'
  },
  {
    id: 'segment-widths',
    label: "dashMode 'segment', widths",
    extensionOptions: {dashMode: 'segment'}
  },
  {
    id: 'path-widths',
    label: "dashMode 'path', widths",
    extensionOptions: {dashMode: 'path'}
  },
  {
    id: 'path-pixels',
    label: "dashMode 'path', pixels",
    extensionOptions: {dashMode: 'path'},
    layerProps: {dashUnits: 'pixels'}
  },
  {
    id: 'path-pixels-justified',
    label: "dashMode 'path', pixels, justified",
    extensionOptions: {dashMode: 'path'},
    layerProps: {dashUnits: 'pixels', dashJustified: true}
  },
  {
    id: 'offset-only',
    label: 'offset capability',
    extensionOptions: {offset: true},
    layerProps: {getOffset: 0}
  },
  {
    id: 'all-controls',
    label: 'path, pixels, justified, offset capability',
    extensionOptions: {dashMode: 'path', offset: true},
    layerProps: {dashUnits: 'pixels', dashJustified: true, getOffset: 0}
  }
];

const controls = document.querySelector('#controls');
const samplesInput = document.querySelector('#samples');
const statusElement = document.querySelector('#status');
const resultsElement = document.querySelector('#results');
const canvasContainer = document.querySelector('#canvas-container');

const query = new URLSearchParams(location.search);
samplesInput.value = query.get('samples') || '30';

controls.addEventListener('submit', event => {
  event.preventDefault();
  runBenchmark().catch(error => {
    statusElement.textContent = error.message;
    console.error(error);
  });
});

async function runBenchmark() {
  const sampleCount = Number(samplesInput.value);
  controls.querySelector('button').disabled = true;
  resultsElement.replaceChildren();
  canvasContainer.replaceChildren();

  const deck = await createDeck();
  try {
    if (!deck.device.features.has('timestamp-query')) {
      throw new Error('This WebGL2 adapter does not expose GPU timestamp queries.');
    }

    const results = [];
    for (const workload of workloads) {
      statusElement.textContent = `Running ${workload.label}…`;
      const workloadResults = await runWorkload(deck, workload, sampleCount);
      appendResults(workloadResults);
      results.push(...workloadResults);
    }

    const deviceInfo = deck.device.info;
    statusElement.textContent = `Complete: ${deviceInfo.renderer}, ${WIDTH}×${HEIGHT}, ${sampleCount} samples.`;
    logResults(deviceInfo, sampleCount, results);
  } finally {
    deck.finalize();
    controls.querySelector('button').disabled = false;
  }
}

async function createDeck() {
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
        type: 'webgl',
        debugGPUTime: true,
        webgl: {antialias: false}
      },
      onLoad: resolve,
      onError: reject
    });
  });

  deck.animationLoop._cancelAnimationFrame();
  return deck;
}

async function runWorkload(deck, workload, sampleCount) {
  const layers = variants.map(variant => createLayer(workload, variant));
  let activeLayerId;

  deck.setProps({layers});
  deck.layerManager.updateLayers();
  deck.deckRenderer.setProps({
    layerFilter: ({layer}) => layer.id === activeLayerId
  });

  for (let sampleIndex = 0; sampleIndex < WARMUP_SAMPLES; sampleIndex++) {
    for (const variant of getVariantOrder(sampleIndex)) {
      activeLayerId = getLayerId(workload, variant);
      await measureFrame(deck);
    }
  }

  const samplesByVariant = new Map(variants.map(variant => [variant.id, []]));
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    for (const variant of getVariantOrder(sampleIndex)) {
      activeLayerId = getLayerId(workload, variant);
      samplesByVariant.get(variant.id).push(await measureFrame(deck));
    }
  }

  return variants.map(variant => {
    const samples = samplesByVariant.get(variant.id);
    return {workload, variant, samples, ...summarize(samples)};
  });
}

function createLayer(workload, variant) {
  return new PathLayer({
    id: getLayerId(workload, variant),
    data: workload.data,
    getPath: object => object.path,
    getColor: [20, 100, 220, 180],
    getWidth: workload.width,
    widthUnits: 'pixels',
    getDashArray: [4, 4],
    ...(variant.layerProps || {}),
    extensions: variant.extensionOptions ? [new PathStyleExtension(variant.extensionOptions)] : []
  });
}

function getLayerId(workload, variant) {
  return `${workload.id}-${variant.id}`;
}

function getVariantOrder(sampleIndex) {
  const offset = sampleIndex % variants.length;
  const order = variants.slice(offset).concat(variants.slice(0, offset));
  return sampleIndex % 2 === 0 ? order : order.reverse();
}

async function measureFrame(deck) {
  deck.device.commandEncoder._gpuTimeMs = undefined;
  deck.redraw('PathStyleExtension GPU benchmark');
  return await waitForGpuTime(deck.device);
}

async function waitForGpuTime(device) {
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
  for (const result of results) {
    const metrics = getDerivedMetrics(result, results);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${result.workload.label}</td>
      <td>${result.variant.label}</td>
      <td>${result.median.toFixed(3)}</td>
      <td>${result.p95.toFixed(3)}</td>
      <td>${metrics.addedGpuMs.toFixed(3)}</td>
      <td>${metrics.passOnlyFps.toFixed(0)}</td>
      <td>${metrics.percentOf60HzBudget.toFixed(2)}%</td>
      <td>${metrics.percentOf120HzBudget.toFixed(2)}%</td>
      <td>${metrics.relativeToPlain.toFixed(2)}×</td>
      <td>${metrics.relativeToSegment.toFixed(2)}×</td>
    `;
    resultsElement.appendChild(row);
  }
}

function logResults(deviceInfo, sampleCount, results) {
  const output = results.map(result => {
    const workloadResults = results.filter(
      candidate => candidate.workload.id === result.workload.id
    );
    const metrics = getDerivedMetrics(result, workloadResults);
    return {
      workload: result.workload.id,
      variant: result.variant.id,
      medianGpuMs: Number(result.median.toFixed(3)),
      p95GpuMs: Number(result.p95.toFixed(3)),
      addedGpuMs: Number(metrics.addedGpuMs.toFixed(3)),
      passOnlyFps: Number(metrics.passOnlyFps.toFixed(0)),
      percentOf60HzBudget: Number(metrics.percentOf60HzBudget.toFixed(2)),
      percentOf120HzBudget: Number(metrics.percentOf120HzBudget.toFixed(2))
    };
  });
  console.log(
    JSON.stringify(
      {deviceInfo, width: WIDTH, height: HEIGHT, sampleCount, results: output},
      null,
      2
    )
  );
  console.table(output);
}

function getDerivedMetrics(result, results) {
  const plainMedian = results.find(candidate => candidate.variant.id === 'plain').median;
  const segmentMedian = results.find(candidate => candidate.variant.id === 'segment-widths').median;
  const addedGpuMs = result.median - plainMedian;
  return {
    addedGpuMs,
    passOnlyFps: 1000 / result.median,
    percentOf60HzBudget: (addedGpuMs / (1000 / 60)) * 100,
    percentOf120HzBudget: (addedGpuMs / (1000 / 120)) * 100,
    relativeToPlain: result.median / plainMedian,
    relativeToSegment: result.median / segmentMedian
  };
}

function createThinPaths() {
  const columns = 400;
  const rows = 250;
  return Array.from({length: columns * rows}, (_, pathIndex) => {
    const column = pathIndex % columns;
    const row = Math.floor(pathIndex / columns);
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
  return Array.from({length: 256}, (_, pathIndex) => {
    const offset = (pathIndex - 128) * 4;
    return {
      path: [
        [-WIDTH / 2, -HEIGHT / 2 + offset],
        [WIDTH / 2, HEIGHT / 2 + offset]
      ]
    };
  });
}
