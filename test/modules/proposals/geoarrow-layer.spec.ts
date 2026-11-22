// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {device as webglDevice} from '@deck.gl/test-utils/vitest';
import {load} from '@loaders.gl/core';
import {convertGeoArrowGeometry} from '@loaders.gl/core/geoarrow';
import {GeoJSONLoader} from '@loaders.gl/tables/geojson';
import {Buffer, Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, Schema, Table, tableFromArrays} from 'apache-arrow';
import {expect, test} from 'vitest';
import {ArrowSolidPolygonLayer} from '../../../modules/proposals/src/layers/arrow-solid-polygon-layer';
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

const encodings = ['wkt', 'wkb', 'mixed', 'geojson', 'native', 'native-line', 'separated'] as const;

for (const backend of ['webgl', 'webgpu'] as const) {
  test.for(encodings)(
    `GeoArrowLayer renders and picks %s on ${backend}`,
    async (encoding, {skip}) => {
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
        const inputs = {
          wkt: {data: source, polygon: 'polygon', line: 'line'},
          wkb: {
            data: convertGeoArrowGeometry(source, 'geoarrow.wkb'),
            polygon: 'polygon',
            line: 'line'
          },
          mixed: {
            data: convertGeoArrowGeometry(source, 'geoarrow.geometry'),
            polygon: 'polygon',
            line: 'line'
          },
          geojson: {
            data: new URL('./fixtures/geoarrow-source.geojson', import.meta.url).href,
            polygon: 'loaded polygon',
            line: 'loaded line'
          },
          native: {
            data: new URL('./fixtures/geoarrow-polygon.geojson', import.meta.url).href,
            polygon: 'native polygon'
          },
          separated: {
            data:
              encoding === 'separated'
                ? (
                    load(
                      new URL('./fixtures/geoarrow-polygon.geojson', import.meta.url).href,
                      GeoJSONLoader,
                      {
                        core: {worker: false},
                        geoarrow: {encodingPreference: 'optimized'}
                      }
                    ) as Promise<Table>
                  ).then(table =>
                    convertGeoArrowGeometry(table, 'geoarrow.polygon', {coordinates: 'separated'})
                  )
                : source,
            polygon: 'native polygon'
          },
          'native-line': {
            data: new URL('./fixtures/geoarrow-line.geojson', import.meta.url).href,
            polygon: 'native line'
          }
        };
        const input = inputs[encoding];
        const {data, polygon} = input;
        const nativePolygon = encoding === 'native' || encoding === 'separated';
        const native = nativePolygon || encoding === 'native-line';
        const lineLabel = 'line' in input ? input.line : undefined;
        const loaded: unknown[] = [];
        const layer = new GeoArrowLayer({
          id: 'geometry',
          data,
          loaders: [GeoJSONLoader],
          loadOptions: {
            core: {worker: false},
            ...(native && {geoarrow: {encodingPreference: 'optimized'}})
          },
          onDataLoad: data => loaded.push(data),
          getFillColor: [255, 0, 0, 255],
          colors: [255, 0, 0, 255],
          widths: 2,
          widthScale: 4,
          pickable: true
        });
        deck.setProps({layers: [layer]});
        await expect.poll(() => layer.isLoaded).toBe(true);
        if (nativePolygon) {
          await expect
            .poll(() => {
              const polygonLayer = layer.getSubLayers()[0] as ArrowSolidPolygonLayer | undefined;
              return {
                errors: errors.map(error => error.message),
                models: polygonLayer?.getSubLayers()[0]?.getModels().length
              };
            })
            .toEqual({errors: [], models: 1});
        }
        await expect
          .poll(async () => {
            deck.redraw('GeoArrow color readback');
            expect(errors.map(error => error.message)).toEqual([]);
            target.readBuffer(sample, readback);
            return Array.from(await readback.readAsync(0, 4));
          })
          .toEqual([255, 0, 0, 255]);
        if (typeof data === 'string') {
          expect(loaded).toHaveLength(1);
          expect(loaded[0]).toMatchObject({numRows: native ? 1 : 3});
        }
        const info = await deck.pickObjectAsync({x: 32, y: 32});
        expect(info?.index).toBe(native ? 0 : 1);
        expect(info?.object.label).toBe(polygon);
        if (nativePolygon) {
          expect(layer.getSubLayers()[0]?.constructor.name).toBe('ArrowSolidPolygonLayer');
          const [x, y] = deck.getViewports()[0].project([5, 5]);
          expect(await deck.pickObjectAsync({x: Math.round(x), y: Math.round(y)})).toBeNull();
        } else if (native) {
          expect(layer.getSubLayers()[0]?.constructor.name).toBe('ArrowPathLayer');
        }
        if (lineLabel) {
          const [x, y] = deck.getViewports()[0].project([17, 12]);
          const line = await deck.pickObjectAsync({x: Math.round(x), y: Math.round(y)});
          expect(line?.index).toBe(2);
          expect(line?.object.label).toBe(lineLabel);
        }
        const emptyLayer = new GeoArrowLayer({id: 'geometry', data: null});
        deck.setProps({layers: [emptyLayer]});
        await expect.poll(() => emptyLayer.isLoaded).toBe(true);
        expect(emptyLayer.getSubLayers()).toHaveLength(0);
        expect(errors).toEqual([]);
      } finally {
        deck.finalize();
        parent.remove();
        readback.destroy();
        framebuffer.destroy();
        target.destroy();
      }
    }
  );
}
