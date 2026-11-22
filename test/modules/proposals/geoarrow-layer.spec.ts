// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {Matrix4} from '@math.gl/core/matrix';
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

const encodings = [
  'wkt',
  'wkb',
  'mixed',
  'geojson',
  'native',
  'native-line',
  'separated',
  'styled'
] as const;

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
          styled: {
            data: new URL('./fixtures/geoarrow-polygon.geojson', import.meta.url).href,
            polygon: 'native polygon'
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
        const styled = encoding === 'styled';
        const lineLabel = 'line' in input ? input.line : undefined;
        const loaded: unknown[] = [];
        const layer = new GeoArrowLayer({
          id: 'geometry',
          data,
          loaders: [GeoJSONLoader],
          loadOptions: {
            core: {worker: false},
            ...((native || styled) && {geoarrow: {encodingPreference: 'optimized'}})
          },
          onDataLoad: data => loaded.push(data),
          getFillColor: [255, 0, 0, 255],
          ...(styled && {
            extruded: true,
            getElevation: 8,
            material: false,
            modelMatrix: new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, -0.5, 0.05, 0, 0, 0, 0, 1])
          }),
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
            const [red, green, blue, alpha] = new Uint8Array(await readback.readAsync(0, 4));
            // Standard polygon lighting can change the intensity of the extruded fill.
            return (
              red >= (styled ? 128 : 255) &&
              green <= (styled ? 64 : 0) &&
              blue <= (styled ? 64 : 0) &&
              alpha === 255
            );
          })
          .toBe(true);
        if (typeof data === 'string') {
          expect(loaded).toHaveLength(1);
          expect(loaded[0]).toMatchObject({numRows: native || styled ? 1 : 3});
        }
        const [pickX, pickY] = deck.getViewports()[0].project([0, 0]);
        const info = await deck.pickObjectAsync({x: Math.round(pickX), y: Math.round(pickY)});
        expect(info?.index).toBe(native || styled ? 0 : 1);
        expect(info?.object.label).toBe(polygon);
        if (nativePolygon) {
          expect(layer.getSubLayers()[0]?.constructor.name).toBe('ArrowSolidPolygonLayer');
          const [x, y] = deck.getViewports()[0].project([5, 5]);
          expect(await deck.pickObjectAsync({x: Math.round(x), y: Math.round(y)})).toBeNull();
        } else if (native) {
          expect(layer.getSubLayers()[0]?.constructor.name).toBe('ArrowPathLayer');
        }
        if (styled) {
          const child = layer.getSubLayers()[0];
          expect(child.constructor.name).toBe('GeoJsonLayer');
          expect(child.props).toMatchObject({extruded: true, material: false});
          // Shearing Z into Y exposes the side wall between the base and top edges.
          const [wallX, wallY] = deck.getViewports()[0].project([0, 6]);
          const wall = {x: Math.round(wallX), y: Math.round(wallY)};
          expect((await deck.pickObjectAsync(wall))?.object.label).toBe(polygon);

          const wireframeLayer = layer.clone({wireframe: true, colors: [0, 255, 0, 255]});
          deck.setProps({layers: [wireframeLayer]});
          const region = {x: 0, y: 0, width: 64, height: 64};
          const pixels = device.createBuffer({
            byteLength: target.computeMemoryLayout(region).byteLength,
            usage: Buffer.COPY_DST | Buffer.MAP_READ
          });
          try {
            await expect
              .poll(async () => {
                deck.redraw('GeoArrow wireframe readback');
                target.readBuffer(region, pixels);
                const rgba = new Uint8Array(await pixels.readAsync());
                return rgba.some(
                  (green, index) =>
                    index % 4 === 1 && green > 100 && rgba[index - 1] < 64 && rgba[index + 1] < 64
                );
              })
              .toBe(true);
          } finally {
            pixels.destroy();
          }

          const filterProps = {
            extensions: [new ClipExtension()],
            clipByInstance: false,
            clipBounds: [20, 20, 30, 30] as const
          };
          const hiddenLayer = layer.clone(filterProps);
          deck.setProps({layers: [hiddenLayer]});
          await expect
            .poll(async () => {
              deck.redraw('Apply GeoArrow clipping bounds');
              target.readBuffer(sample, readback);
              return new Uint8Array(await readback.readAsync(0, 4))[3];
            })
            .toBe(0);
          const visibleLayer = hiddenLayer.clone({
            ...filterProps,
            clipBounds: [-20, -20, 20, 20] as const
          });
          deck.setProps({layers: [visibleLayer]});
          await expect
            .poll(async () => (await deck.pickObjectAsync(wall))?.object.label)
            .toBe(polygon);
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
