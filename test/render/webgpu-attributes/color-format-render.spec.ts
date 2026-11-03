// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect, beforeAll, afterEach} from 'vitest';
import {commands} from 'vitest/browser';
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {getRequiredWebGPUDevice} from './webgpu-test-device';
import {isRenderTestDeviceEnabled} from '../render-test-suite';

const WIDTH = 100;
const HEIGHT = 100;
/** Rendered by the RGBA reference scene */
const SCENE_GOLDEN_IMAGE = 'test/render/golden-images/webgpu/scatterplot-color-format.png';
/** CPU reference: 20x20 pixels of [255, 0, 0, 255] */
const SOLID_RED_GOLDEN_IMAGE = 'test/render/golden-images/webgpu/solid-red-20x20.png';
const CENTER_REGION = {x: 40, y: 40, width: 20, height: 20};

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('WebGPU ScatterplotLayer colorFormat', () => {
  let deck: Deck | null = null;
  let container: HTMLDivElement | null = null;

  beforeAll(async () => {
    await getRequiredWebGPUDevice();
  });

  afterEach(() => {
    deck?.finalize();
    deck = null;
    container?.remove();
    container = null;
  });

  async function renderScatterplot(layerProps: Record<string, unknown>): Promise<void> {
    container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      // Cover canvases left by other render tests in the same page
      zIndex: '1000',
      background: 'white'
    });
    document.body.appendChild(container);

    await new Promise<void>((resolve, reject) => {
      deck = new Deck({
        parent: container!,
        width: WIDTH,
        height: HEIGHT,
        useDevicePixels: false,
        deviceProps: {type: 'webgpu', adapters: [webgpuAdapter]},
        initialViewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [
          new ScatterplotLayer({
            id: 'points',
            data: [[0, 0]],
            getPosition: (d: number[]) => [d[0], d[1], 0],
            // ~25 pixels at zoom 1
            getRadius: 1000000,
            ...layerProps
          })
        ],
        onError: error => reject(error),
        onAfterRender: () => {
          const layers = deck?.layerManager?.getLayers() || [];
          if (layers.length && layers.every(layer => layer.isLoaded)) {
            resolve();
          }
        }
      });
    });
    // Wait for the frame to be presented
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function expectRenderedColor(label: string) {
    const sceneResult = await commands.captureAndDiffScreen({
      goldenImage: SCENE_GOLDEN_IMAGE,
      region: {x: 0, y: 0, width: WIDTH, height: HEIGHT},
      threshold: 0.99,
      saveOnFail: true,
      saveAs: `test/render/golden-images/webgpu/scatterplot-color-format-${label}-fail.png`
    });
    expect(sceneResult.error, `${label}: scene diff error`).toBeNull();
    expect(
      sceneResult.success,
      `${label}: matches RGBA golden (${sceneResult.matchPercentage}%)`
    ).toBe(true);

    const pixelResult = await commands.captureAndDiffScreen({
      goldenImage: SOLID_RED_GOLDEN_IMAGE,
      region: CENTER_REGION,
      threshold: 1,
      tolerance: 0.01
    });
    expect(pixelResult.error, `${label}: pixel diff error`).toBeNull();
    expect(pixelResult.success, `${label}: center pixels equal [255, 0, 0, 255]`).toBe(true);
  }

  test('WebGPU ScatterplotLayer RGBA constant color (reference)', async () => {
    await renderScatterplot({colorFormat: 'RGBA', getFillColor: [255, 0, 0, 255]});
    await expectRenderedColor('rgba-constant');
  });

  test('WebGPU ScatterplotLayer colorFormat RGB constant color', async () => {
    await renderScatterplot({colorFormat: 'RGB', getFillColor: [255, 0, 0]});
    await expectRenderedColor('rgb-constant');
  });

  test('WebGPU ScatterplotLayer colorFormat RGB accessor color (buffer group)', async () => {
    await renderScatterplot({colorFormat: 'RGB', getFillColor: () => [255, 0, 0]});
    await expectRenderedColor('rgb-accessor');
  });

  test('WebGPU ScatterplotLayer colorFormat RGB with size-3 Uint8Array colors', async () => {
    await renderScatterplot({
      colorFormat: 'RGB',
      data: {
        length: 1,
        attributes: {
          getPosition: {value: new Float32Array([0, 0, 0]), size: 3},
          getFillColor: {value: new Uint8Array([255, 0, 0]), size: 3}
        }
      }
    });
    await expectRenderedColor('rgb-binary');
  });

  test('WebGPU ScatterplotLayer colorFormat RGBA with size-3 Uint8Array colors', async () => {
    await renderScatterplot({
      colorFormat: 'RGBA',
      data: {
        length: 1,
        attributes: {
          getPosition: {value: new Float32Array([0, 0, 0]), size: 3},
          getFillColor: {value: new Uint8Array([255, 0, 0]), size: 3}
        }
      }
    });
    await expectRenderedColor('rgba-binary-size3');
  });
});
