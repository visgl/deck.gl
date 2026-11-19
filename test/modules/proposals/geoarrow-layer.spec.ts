// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {device as webglDevice} from '@deck.gl/test-utils/vitest';
import {convertGeoArrowGeometry} from '@loaders.gl/core/geoarrow';
import {Buffer, Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, Schema, Table, tableFromArrays} from 'apache-arrow';
import {expect, test} from 'vitest';
import {GeoArrowLayer} from '../../../modules/proposals/src/layers/geoarrow-layer';

/** Builds a mixed source with a null row before the visible features. */
function makeSource() {
  const rows = tableFromArrays({
    geometry: [null, 'POLYGON ((-8 -8, -8 8, 8 8, 8 -8, -8 -8))', 'LINESTRING (10 12, 25 12)'],
    label: ['missing', 'polygon', 'line']
  });
  const schema = new Schema(
    rows.schema.fields.map(field =>
      field.name === 'geometry'
        ? new Field(
            field.name,
            field.type,
            true,
            new Map([['ARROW:extension:name', 'geoarrow.wkt']])
          )
        : field
    )
  );
  const table = new Table(schema, rows.batches);
  return table.slice(0, 1).concat(table.slice(1));
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`GeoArrowLayer renders and picks encoded and mixed geometry on ${backend}`, async ({
    skip
  }) => {
    const device = backend === 'webgpu' ? await getWebGPUTestDevice('core') : webglDevice;
    if (!device || device.type !== backend) return skip();
    const target = device.createTexture({
      width: 64,
      height: 64,
      format: 'rgba8unorm',
      usage: Texture.RENDER | Texture.COPY_SRC
    });
    const framebuffer = device.createFramebuffer({
      width: 64,
      height: 64,
      colorAttachments: [target],
      depthStencilAttachment: 'depth24plus'
    });
    const sample = {x: 32, y: 32, width: 1, height: 1};
    const readback = device.createBuffer({
      byteLength: target.computeMemoryLayout(sample).byteLength,
      usage: Buffer.COPY_DST | Buffer.MAP_READ
    });
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const errors: Error[] = [];
    const deck = new Deck({
      device,
      parent,
      width: 64,
      height: 64,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      _framebuffer: framebuffer,
      onError: error => errors.push(error)
    });
    try {
      const source = makeSource();
      for (const encoding of ['geoarrow.wkt', 'geoarrow.wkb', 'geoarrow.geometry'] as const) {
        const data =
          encoding === 'geoarrow.wkt' ? source : convertGeoArrowGeometry(source, encoding);
        deck.setProps({
          layers: [
            new GeoArrowLayer({
              id: 'geometry',
              data,
              getFillColor: new Uint8ClampedArray([255, 0, 0, 255]),
              widths: 2,
              widthScale: 4,
              pickable: true
            })
          ]
        });
        await expect
          .poll(async () => {
            deck.redraw('GeoArrow color readback');
            target.readBuffer(sample, readback);
            return Array.from(await readback.readAsync(0, 4));
          })
          .toEqual([255, 0, 0, 255]);
        const info = await deck.pickObjectAsync({x: 32, y: 32});
        expect(info?.index).toBe(1);
        expect(info?.object.label).toBe('polygon');
        const [x, y] = deck.getViewports()[0].project([17, 12]);
        const line = await deck.pickObjectAsync({x: Math.round(x), y: Math.round(y)});
        expect(line?.index).toBe(2);
        expect(line?.object.label).toBe('line');
      }
      const empty = new GeoArrowLayer({id: 'geometry', data: null, pickable: true});
      deck.setProps({layers: [empty]});
      await expect.poll(() => empty.state?.geometry).toBeNull();
      expect(empty.getSubLayers()).toHaveLength(0);
      expect((await deck.pickObjectAsync({x: 32, y: 32}))?.picked ?? false).toBe(false);
      expect(errors).toEqual([]);
    } finally {
      deck.finalize();
      parent.remove();
      readback.destroy();
      framebuffer.destroy();
      target.destroy();
    }
  });
}
