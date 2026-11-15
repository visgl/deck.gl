// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {cpus, totalmem, platform, release} from 'node:os';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {getPlaywrightLaunchOptions} from '../../../../scripts/playwright/get-playwright-launch-options.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const samples = Number(process.env.CITY_SCENE_BENCHMARK_SAMPLES || 120);
const rounds = Number(process.env.CITY_SCENE_BENCHMARK_ROUNDS || 3);
const warmupFrames = 30;
const baseline = process.env.CITY_SCENE_BENCHMARK_BASELINE
  ? JSON.parse(readFileSync(resolve(root, process.env.CITY_SCENE_BENCHMARK_BASELINE), 'utf8'))
  : null;
const machine = {
  processor: cpus()[0]?.model,
  model:
    platform() === 'darwin'
      ? execFileSync('/usr/sbin/sysctl', ['-n', 'hw.model'], {encoding: 'utf8'}).trim()
      : null,
  memoryBytes: totalmem(),
  platform: platform(),
  release: release()
};
assert(Number.isInteger(samples) && samples >= 20);
assert(Number.isInteger(rounds) && rounds >= 1);
const configurations = [
  {name: 'district', water: false, reflections: false, edges: 'none', quality: 'balanced'},
  {name: 'river', water: true, reflections: false, edges: 'none', quality: 'balanced'},
  {name: 'river-pencil', water: true, reflections: false, edges: 'pencil', quality: 'balanced'},
  {name: 'reflections-fast', water: true, reflections: true, edges: 'none', quality: 'fast'},
  {
    name: 'reflections-balanced',
    water: true,
    reflections: true,
    edges: 'none',
    quality: 'balanced'
  },
  {
    name: 'reflections-detailed',
    water: true,
    reflections: true,
    edges: 'none',
    quality: 'detailed'
  },
  {name: 'reflections-pencil', water: true, reflections: true, edges: 'pencil', quality: 'balanced'}
];
const server = process.env.CITY_SCENE_URL
  ? null
  : await createServer({
      root,
      logLevel: 'error',
      server: {host: '127.0.0.1', port: 0, open: false}
    });
let browser;
try {
  await server?.listen();
  const url = new URL(process.env.CITY_SCENE_URL || server.resolvedUrls.local[0]);
  url.searchParams.set('backend', 'webgpu');
  browser = await chromium.launch(
    getPlaywrightLaunchOptions({headless: true, backend: 'webgpu', softwareGpu: false})
  );
  const page = await browser.newPage({viewport: {width: 1280, height: 720}, deviceScaleFactor: 1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(url.href);
  await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
    timeout: 60_000
  });
  await page.evaluate(() => {
    window.cityScene.setTime(2);
    window.cityScene.setCamera('district');
  });
  await page.waitForFunction(
    () => !window.cityScene.deck.props._animate && !window.cityScene.deck.needsRedraw(),
    undefined,
    {timeout: 60_000}
  );
  const device = await page.evaluate(() => {
    const device = window.cityScene.deck.device;
    const {
      vendor,
      architecture,
      device: identifier,
      description,
      isFallbackAdapter
    } = device.adapterInfo;
    return {
      type: device.type,
      info: device.info,
      adapter: {vendor, architecture, identifier, description, isFallbackAdapter},
      debug: Boolean(device.props.debug),
      debugGPUTime: Boolean(device.props.debugGPUTime)
    };
  });
  assert.equal(device.type, 'webgpu');
  assert(
    !device.adapter.isFallbackAdapter &&
      !/swiftshader|llvmpipe|software|warp/i.test(JSON.stringify(device)),
    'Use a hardware WebGPU adapter for performance measurements'
  );
  assert(
    !device.debug && !device.debugGPUTime,
    'Disable debug validation and timestamp instrumentation for completed-frame measurements'
  );
  if (baseline) {
    assert.deepEqual(
      machine,
      baseline.machine,
      'Use a baseline from the same hardware and operating system'
    );
    assert.equal(
      browser.version(),
      baseline.browser,
      'Use a baseline from the same browser version'
    );
    assert.deepEqual(
      device.adapter,
      baseline.device.adapter,
      'Use a baseline from the same GPU adapter'
    );
    assert.equal(
      process.env.CITY_SCENE_URL ? 'served build' : 'development server',
      baseline.source,
      'Match the baseline build mode'
    );
    assert.equal(samples, baseline.samples, 'Match the baseline sample count');
    assert(rounds >= baseline.rounds, 'Collect at least the baseline number of rounds');
    assert.equal(warmupFrames, baseline.warmupFrames);
    assert.deepEqual(baseline.viewport, {width: 1280, height: 720, devicePixelRatio: 1});
    assert.equal(baseline.camera, 'district');
    assert.equal(baseline.timeSeconds, 2);
    assert.deepEqual(configurations, baseline.configurations);
    assert(baseline.budgets, 'The comparison file must include reviewed regression budgets');
  }
  const measurements = [];
  for (let round = 0; round < rounds; round++) {
    // Rotate case order between rounds to expose warm-cache and thermal-order effects.
    for (let offset = 0; offset < configurations.length; offset++) {
      const configuration = configurations[(round + offset) % configurations.length];
      await page.evaluate(configuration => {
        const scene = window.cityScene;
        scene.setReflectionsEnabled(false);
        scene.setWaterEnabled(configuration.water);
        scene.setEdgeStyle(configuration.edges);
        scene.setReflectionQuality(configuration.quality);
        scene.setReflectionsEnabled(configuration.reflections);
        scene.setTime(2);
      }, configuration);
      await page.waitForFunction(
        () => !window.cityScene.deck.props._animate && !window.cityScene.deck.needsRedraw(),
        undefined,
        {timeout: 60_000}
      );
      const measurement = await page.evaluate(
        async ({samples, warmupFrames}) => {
          const scene = window.cityScene;
          const device = scene.deck.device;
          const queue = device.handle.queue;
          const memory = device.statsManager.getStats('GPU Time and Memory');
          const readMemory = () => ({
            ownedBytes: memory.get('Buffer Memory').count + memory.get('Texture Memory').count,
            bufferBytes: memory.get('Buffer Memory').count,
            textureBytes: memory.get('Texture Memory').count,
            externalBytes:
              memory.get('External Buffer Memory').count +
              memory.get('External Texture Memory').count
          });
          const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
          await scene.deck.pickObjectAsync({x: 900, y: 400});
          for (let frame = 0; frame < warmupFrames; frame++) {
            await nextFrame();
            scene.deck.redraw('benchmark warmup');
            await queue.onSubmittedWorkDone();
          }
          const initialMemory = readMemory();
          const initialFrames = scene.diagnostics.frames;
          const submissionMilliseconds = [];
          const completedMilliseconds = [];
          for (let frame = 0; frame < samples; frame++) {
            await nextFrame();
            const start = performance.now();
            scene.deck.redraw('benchmark sample');
            submissionMilliseconds.push(performance.now() - start);
            await queue.onSubmittedWorkDone();
            completedMilliseconds.push(performance.now() - start);
          }
          return {
            submissionMilliseconds,
            completedMilliseconds,
            initialMemory,
            finalMemory: readMemory(),
            renderedFrames: scene.diagnostics.frames - initialFrames,
            time: scene.diagnostics.timeSeconds,
            animate: scene.deck.props._animate,
            size: device.getCanvasContext().getDrawingBufferSize()
          };
        },
        {samples, warmupFrames}
      );
      assert.equal(
        measurement.renderedFrames,
        samples,
        'Only the requested sample frames rendered'
      );
      assert.equal(measurement.time, 2, 'The water clock remains fixed');
      assert.equal(measurement.animate, false, 'Automatic animation remains disabled');
      assert.deepEqual(measurement.size, [1280, 720]);
      const result = {
        name: configuration.name,
        round: round + 1,
        samples,
        submissionMilliseconds: summarize(measurement.submissionMilliseconds),
        completedMilliseconds: summarize(measurement.completedMilliseconds),
        initialMemory: measurement.initialMemory,
        finalMemory: measurement.finalMemory
      };
      measurements.push(result);
      process.stderr.write(
        `${configuration.name} round ${round + 1}: ${result.completedMilliseconds.median.toFixed(2)} ms median completed frame, ${(result.finalMemory.ownedBytes / 1048576).toFixed(2)} MiB tracked buffers/textures\n`
      );
    }
  }
  assert.deepEqual(errors, [], 'No browser errors');
  const summaries = configurations.map(configuration => {
    const results = measurements.filter(measurement => measurement.name === configuration.name);
    return {
      name: configuration.name,
      medianCompletedMilliseconds: summarize(
        results.map(result => result.completedMilliseconds.median)
      ).median,
      maximumRoundPercentile95Milliseconds: Math.max(
        ...results.map(result => result.completedMilliseconds.percentile95)
      ),
      maximumOwnedBytes: Math.max(...results.map(result => result.finalMemory.ownedBytes)),
      maximumGrowthBytes: Math.max(
        ...results.map(result => result.finalMemory.ownedBytes - result.initialMemory.ownedBytes)
      )
    };
  });
  const report = {
    recordedAt: new Date().toISOString(),
    repositoryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8'
    }).trim(),
    source: process.env.CITY_SCENE_URL ? 'served build' : 'development server',
    browser: browser.version(),
    machine,
    device,
    viewport: {width: 1280, height: 720, devicePixelRatio: 1},
    camera: 'district',
    timeSeconds: 2,
    warmupFrames,
    samples,
    rounds,
    timing:
      'CPU submission through native queue completion; excludes animation-frame wait; not GPU-only time or FPS',
    memory:
      'luma-tracked buffer/texture bytes after queue completion; excludes driver overhead; external references reported separately',
    configurations,
    summaries,
    measurements
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (baseline) {
    for (const summary of summaries) {
      const budget = baseline.budgets[summary.name];
      assert(budget, `Missing budget for ${summary.name}`);
      assert(
        summary.medianCompletedMilliseconds <= budget.medianCompletedMilliseconds,
        `${summary.name}: median completed-frame budget exceeded`
      );
      assert(
        summary.maximumRoundPercentile95Milliseconds <= budget.maximumRoundPercentile95Milliseconds,
        `${summary.name}: p95 completed-frame budget exceeded`
      );
      assert(
        summary.maximumOwnedBytes <= budget.maximumOwnedBytes,
        `${summary.name}: tracked GPU memory budget exceeded`
      );
      assert(
        summary.maximumGrowthBytes <= budget.maximumGrowthBytes,
        `${summary.name}: tracked GPU memory grew during steady sampling`
      );
    }
    process.stderr.write('All hardware-specific regression budgets passed.\n');
  }
} finally {
  await browser?.close();
  await server?.close();
}

function summarize(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const round = value => Math.round(value * 1000) / 1000;
  return {
    median: round(sorted[Math.floor(sorted.length / 2)]),
    percentile95: round(sorted[Math.ceil(sorted.length * 0.95) - 1]),
    maximum: round(sorted.at(-1))
  };
}
