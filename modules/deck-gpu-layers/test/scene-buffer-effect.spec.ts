// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView, type Effect} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {SceneBufferEffect} from '@deck.gl-community/gpu-layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';
import {CaptureTestLayer, waitUntil, readCapture} from './scene-buffer-test-utils';

test.each([false, true])(
  'scene capture selection=%s preserves HDR, depth, per-view history, resize and ownership',
  async (selection, context) => {
    const device = await getWebGPUTestDevice();
    if (!device) {
      context.skip('WebGPU unavailable');
      return;
    }
    const parent = document.createElement('div');
    parent.style.width = '64px';
    parent.style.height = '64px';
    document.body.append(parent);
    let selected = true;
    const effect = new SceneBufferEffect({
      history: true,
      selection,
      getLayerOptions: layer => ({
        mode: layer.id === 'transparent' ? 'transparent' : 'opaque',
        surfaceBuffer: layer.id !== 'transparent',
        selected
      })
    });
    let postprocessDepth = false;
    const postprocess: Effect = {
      id: 'capture-test-postprocess',
      props: {},
      useInPicking: false,
      setup() {},
      preRender() {},
      postRender({inputBuffer}) {
        postprocessDepth = Boolean(inputBuffer.depthStencilAttachment);
        return inputBuffer;
      },
      cleanup() {}
    };
    const errors: string[] = [];
    const deck = new Deck({
      parent,
      device,
      width: 64,
      height: 64,
      useDevicePixels: false,
      views: new OrthographicView({id: 'main'}),
      initialViewState: {target: [0, 0], zoom: 0},
      layers: [
        new CaptureTestLayer({id: 'surface'}),
        new CaptureTestLayer({
          id: 'transparent',
          transparent: true,
          parameters: {blend: true, depthWriteEnabled: false}
        })
      ],
      effects: [effect, postprocess],
      _animate: true,
      onError: error => {
        errors.push(error.message);
      }
    });
    try {
      await waitUntil(() => Boolean(effect.getFrame('main')?.previousBuffer), errors);
      await new Promise(resolve => setTimeout(resolve, 150));
      deck.setProps({_animate: false});
      deck.redraw('capture test');
      expect(postprocessDepth).toBe(true);
      const frame = effect.getFrame('main')!;
      expect(frame.buffer.colorTexture.format).toBe('rgba16float');
      expect(frame.previousBuffer).toBeDefined();
      expect(frame.previousBuffer).not.toBe(frame.buffer);
      expect(frame.buffer.framebuffer.colorAttachments).toHaveLength(selection ? 3 : 2);
      if (!selection) {
        expect(() => frame.buffer.getExtraColorTexture('selection')).toThrow();
      }
      const values = await readCapture(device, effect, 'main');
      expect(values[0]).toBeCloseTo(2, 3);
      expect(values[1]).toBeCloseTo(0.25, 2);
      expect(values[2]).toBeCloseTo(0.3, 3);
      expect(values[3]).toBe(selection ? 1 : 0);
      const firstSlots = [frame.buffer, frame.previousBuffer!];
      selected = false;
      deck.redraw('capture test');
      expect((await readCapture(device, effect, 'main'))[3]).toBe(0);
      selected = true;
      deck.redraw('capture test');
      // Removing all participants clears stale color, depth, normals and selection.
      deck.setProps({layerFilter: () => false});
      deck.redraw('capture test');
      const empty = await readCapture(device, effect, 'main');
      expect(Array.from(empty)).toEqual([0, 1, 1, 0]);
      deck.setProps({layerFilter: null});
      deck.redraw('capture test');

      effect.resetHistory('main');
      deck.redraw('capture test');
      expect(effect.getFrame('main')?.previousBuffer).toBeUndefined();
      deck.redraw('capture test');
      expect(effect.getFrame('main')?.previousBuffer).toBeDefined();
      expect(firstSlots).toContain(effect.getFrame('main')?.buffer);
      // Independent targets prevent views from overwriting each other's history.
      deck.setProps({
        views: [
          new OrthographicView({id: 'left', width: '50%'}),
          new OrthographicView({id: 'right', x: '50%', width: '50%'})
        ]
      });
      deck.redraw('capture test');
      await waitUntil(() => Boolean(effect.getFrame('left') && effect.getFrame('right')), errors);
      expect(effect.getFrame('main')).toBeUndefined();
      expect(firstSlots.every(buffer => buffer.colorTexture.destroyed)).toBe(true);
      const left = effect.getFrame('left')!;
      const right = effect.getFrame('right')!;
      expect(left.buffer).not.toBe(right.buffer);
      expect(left.viewportBounds).toEqual([0, 0, 32, 64]);
      expect(right.viewportBounds).toEqual([32, 0, 32, 64]);
      deck.redraw('capture test');
      const leftValues = await readCapture(device, effect, 'left', [16, 32]);
      const rightValues = await readCapture(device, effect, 'right', [48, 32]);
      expect(leftValues[0]).toBeCloseTo(2, 3);
      expect(rightValues[0]).toBeCloseTo(2, 3);
      deck.setProps({
        views: [
          new OrthographicView({id: 'left', height: '50%'}),
          new OrthographicView({id: 'right', y: '50%', height: '50%'})
        ]
      });
      deck.redraw('capture test');
      expect((await readCapture(device, effect, 'left', [32, 16]))[0]).toBeCloseTo(2, 3);
      expect((await readCapture(device, effect, 'right', [32, 48]))[0]).toBeCloseTo(2, 3);
      expect(effect.getFrame('left')?.viewportBounds).toEqual([0, 0, 64, 32]);
      expect(effect.getFrame('right')?.viewportBounds).toEqual([0, 32, 64, 32]);
      expect(effect.getFrame('left')?.previousBuffer).toBeUndefined();
      const oldColor = effect.getFrame('left')!.buffer.colorTexture;
      deck.setProps({width: 80, height: 48});
      deck.redraw('capture test');
      await waitUntil(
        () => effect.getFrame('left')?.buffer.width === 80,
        errors,
        () => deck.redraw('capture test')
      );
      expect(oldColor.destroyed).toBe(true);
      const finalTexture = effect.getFrame('left')!.buffer.colorTexture;
      deck.finalize();
      effect.cleanup();
      expect(finalTexture.destroyed).toBe(true);
      expect(effect.getFrame('left')).toBeUndefined();
      expect(errors).toEqual([]);
    } finally {
      deck.finalize();
      parent.remove();
    }
  }
);

test('scene capture accepts stock Deck color and depth without inventing normals or selection', async context => {
  const device = await getWebGPUTestDevice();
  if (!device) return context.skip('WebGPU unavailable');
  const errors: string[] = [];
  let stage = 'ordinary stock rendering';
  let deviceLoss: Awaited<typeof device.lost> | undefined;
  void device.lost.then(info => {
    deviceLoss = info;
  });
  const parent = document.createElement('div');
  parent.style.width = '64px';
  parent.style.height = '64px';
  document.body.append(parent);
  type Point = {position: [number, number, number]};
  const capturedData: Point[] = [{position: [0, 0, 0]}];
  const excludedData: Point[] = [{position: [18, 0, 0]}];
  const captured = new ScatterplotLayer<Point>({
    id: 'stock-captured',
    data: capturedData,
    getPosition: point => point.position,
    radiusUnits: 'pixels',
    getRadius: 10,
    getFillColor: [192, 64, 32, 255],
    antialiasing: false,
    pickable: true,
    parameters: {depthCompare: 'less-equal', depthWriteEnabled: true}
  });
  const excluded = new ScatterplotLayer<Point>({
    id: 'stock-excluded',
    data: excludedData,
    getPosition: point => point.position,
    radiusUnits: 'pixels',
    getRadius: 4,
    getFillColor: [255, 255, 255, 255],
    antialiasing: false,
    pickable: true
  });
  const effect = new SceneBufferEffect({
    selection: true,
    getLayerOptions: layer =>
      layer.id === 'stock-excluded'
        ? null
        : {
            mode: layer.id === 'stock-transparent' ? 'transparent' : 'opaque',
            selected: true
          }
  });
  let frames = 0;
  const deck = new Deck({
    parent,
    device,
    width: 64,
    height: 64,
    useDevicePixels: false,
    views: new OrthographicView({id: 'stock'}),
    initialViewState: {target: [0, 0], zoom: 0},
    layers: [captured, excluded],
    effects: [],
    _animate: true,
    onAfterRender: () => {
      frames++;
    },
    onError: error => {
      errors.push(error.message);
    }
  });
  try {
    await waitUntil(
      () => frames >= 3 && captured.isLoaded,
      errors,
      () => deck.redraw('stock scene frame')
    );
    expect(device.isLost, 'stock rendering should keep the WebGPU device active').toBe(false);
    stage = 'captured stock rendering';
    frames = 0;
    deck.setProps({effects: [effect]});
    await waitUntil(
      () => frames >= 3 && captured.isLoaded && Boolean(effect.getFrame('stock')),
      errors,
      () => deck.redraw('stock capture frame')
    );
    deck.setProps({_animate: false});
    deck.redraw('stock capture');
    stage = 'opaque capture readback';
    const opaque = await readCapture(device, effect, 'stock');
    expect(opaque[0]).toBeCloseTo(192 / 255, 3);
    expect(opaque[1]).toBe(1);
    expect(opaque[2]).toBeGreaterThan(0);
    expect(opaque[2]).toBeLessThan(1);
    expect(opaque[3]).toBe(0);
    expect(Array.from(await readCapture(device, effect, 'stock', [50, 32]))).toEqual([0, 1, 1, 0]);
    stage = 'stock picking';
    const picked = await deck.pickObjectAsync({x: 32, y: 32});
    expect(picked?.layer?.id).toBe('stock-captured');
    expect(picked?.index).toBe(0);
    expect(picked?.object).toBe(capturedData[0]);
    const excludedPick = await deck.pickObjectAsync({x: 50, y: 32});
    expect(excludedPick?.layer?.id).toBe('stock-excluded');

    stage = 'transparent capture';
    const transparent = new ScatterplotLayer<Point>({
      id: 'stock-transparent',
      data: capturedData,
      getPosition: point => point.position,
      radiusUnits: 'pixels',
      getRadius: 4,
      getFillColor: [0, 255, 0, 128],
      antialiasing: false,
      parameters: {
        blend: true,
        depthWriteEnabled: false,
        blendColorSrcFactor: 'src-alpha',
        blendColorDstFactor: 'one-minus-src-alpha',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one-minus-src-alpha'
      }
    });
    deck.setProps({layers: [captured, excluded, transparent]});
    await waitUntil(
      () => transparent.isLoaded && transparent.getModels().length > 0,
      errors,
      () => deck.redraw('stock transparency')
    );
    deck.redraw('stock transparency');
    const blended = await readCapture(device, effect, 'stock');
    expect(blended[0]).toBeCloseTo((192 / 255) * (1 - 128 / 255), 3);
    expect(blended.slice(1)).toEqual(opaque.slice(1));
    const texture = effect.getFrame('stock')!.buffer.colorTexture;
    stage = 'capture removal';
    deck.setProps({effects: []});
    await waitUntil(
      () => texture.destroyed,
      errors,
      () => deck.redraw('ordinary stock rendering')
    );
    expect((await deck.pickObjectAsync({x: 32, y: 32}))?.object).toBe(capturedData[0]);
    expect(errors).toEqual([]);
  } catch (error) {
    if (stage === 'ordinary stock rendering' && device.isLost && device.info.gpu === 'software') {
      context.skip('The headless software WebGPU device was destroyed during stock Deck rendering');
    }
    console.error('Stock scene capture failure', {
      stage,
      frames,
      device: device.info,
      isLost: device.isLost,
      deviceLoss,
      errors
    });
    throw error;
  } finally {
    deck.finalize();
    parent.remove();
  }
});
