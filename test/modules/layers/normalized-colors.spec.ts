// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, OrthographicView} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {tableFromArrays} from 'apache-arrow';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device as webglDevice} from '@deck.gl/test-utils/vitest';
import {Buffer} from '@luma.gl/core';
import {Timeline} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`ScatterplotLayer preserves explicit color encodings across Deck toggles on ${backend}`, async ({
    skip
  }) => {
    const device = backend === 'webgpu' ? await getWebGPUTestDevice('core') : webglDevice;
    if (!device || device.type !== backend) {
      return skip();
    }
    const viewport = new OrthographicView().makeViewport({width: 32, height: 32, viewState: {}});
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      sqlParser,
      onError: error => {
        throw error;
      }
    });

    const bytes = new Uint8Array([1, 64, 128, 0]);
    const buffer = device.createBuffer({
      data: bytes,
      usage: Buffer.VERTEX | Buffer.COPY_DST | Buffer.COPY_SRC
    });
    const data = [{position: [0, 0] as const}];
    const plain = new ScatterplotLayer({
      id: 'plain',
      data,
      getFillColor: () => [1, 0.5, 0, 0],
      getLineColor: [0, 0.5, 1]
    });
    const typed = new ScatterplotLayer({
      id: 'typed',
      data,
      getFillColor: () => bytes
    });
    const binary = new ScatterplotLayer({
      id: 'binary',
      data: {length: 1, attributes: {getFillColor: {value: bytes, size: 4}}},
      getPosition: [0, 0]
    });
    const external = new ScatterplotLayer({
      id: 'external',
      data: {length: 1, attributes: {getFillColor: {buffer, size: 4}}},
      getPosition: [0, 0]
    });
    const sql = new ScatterplotLayer({
      id: 'sql',
      data: tableFromArrays({x: new Float32Array([0]), y: new Float32Array([0])}),
      getPosition: {sql: 'FLOAT32x2(x, y)'},
      getFillColor: [1, 0.5, 0, 0]
    });
    const getAttributes = (layer: ScatterplotLayer<any>) => layer.getAttributeManager()!.attributes;
    const readBytes = (layer: ScatterplotLayer<any>) =>
      Array.from(getAttributes(layer).instanceFillColors.value!.slice(0, 4));

    try {
      manager.setLayers([plain, typed, binary, external, sql]);
      for (const normalizedColors of [false, true, false]) {
        manager.setProps({normalizedColors});
        manager.updateLayers();
        const expected = normalizedColors ? [255, 128, 0, 0] : [1, 0, 0, 0];
        expect(readBytes(plain)).toEqual(expected);
        await expect
          .poll(() => {
            manager.updateLayers();
            const columns = (sql.state as any).columns?.prepared?.columns;
            return columns?.instanceFillColors && Array.from(columns.instanceFillColors.value);
          })
          .toEqual(expected);
        expect(getAttributes(plain).instanceLineColors.value).toEqual(
          new Float32Array(normalizedColors ? [0, 128 / 255, 1, 1] : [0, 0.5 / 255, 1 / 255, 1])
        );
        expect(readBytes(typed)).toEqual(Array.from(bytes));
        expect(readBytes(binary)).toEqual(Array.from(bytes));
        expect(getAttributes(external).instanceFillColors.getBuffer()).toBe(buffer);
      }
    } finally {
      manager.finalize();
      buffer.destroy();
    }
  });

  // WebGPU does not yet implement the BufferTransform used by attribute transitions.
  test.skipIf(backend === 'webgpu')(
    `ScatterplotLayer interpolates normalized colors across a Deck toggle on ${backend}`,
    async ({skip}) => {
      const device = backend === 'webgpu' ? await getWebGPUTestDevice('core') : webglDevice;
      if (!device || device.type !== backend) {
        return skip();
      }
      const viewport = new OrthographicView().makeViewport({width: 32, height: 32, viewState: {}});
      const timeline = new Timeline();
      const manager = new LayerManager(device, {viewport, timeline});
      manager.setProps({
        onError: error => {
          throw error;
        }
      });
      const layer = new ScatterplotLayer({
        data: [{position: [0, 0]}],
        getFillColor: () => [1, 0.5, 0, 0],
        transitions: {getFillColor: 100}
      });

      try {
        timeline.setTime(0);
        manager.setLayers([layer]);
        const attributes = layer.getAttributeManager()!;
        attributes.updateTransition();
        timeline.setTime(100);
        attributes.updateTransition();
        const target = attributes.attributes.instanceFillColors;

        manager.setProps({normalizedColors: true});
        manager.updateLayers();
        attributes.updateTransition();
        timeline.setTime(150);
        attributes.updateTransition();
        const animated = attributes.getAttributes().instanceFillColors;
        expect(animated).not.toBe(target);
        const bytes = await animated.getBuffer()!.readAsync();
        const color = new Float32Array(bytes.buffer, bytes.byteOffset, 4);
        expect(color[0]).toBeCloseTo((1 + 1 / 255) / 2, 5);
        expect(color[1]).toBeCloseTo(64 / 255, 5);
        expect(Array.from(color.slice(2))).toEqual([0, 0]);

        timeline.setTime(200);
        attributes.updateTransition();
        expect(attributes.getAttributes().instanceFillColors).toBe(target);
        expect(Array.from(target.value!.slice(0, 4))).toEqual([255, 128, 0, 0]);
      } finally {
        manager.finalize();
      }
    }
  );
}
