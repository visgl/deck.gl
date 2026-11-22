// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {GlobeView, GlobeViewport} from '@deck.gl/core';
import {BitmapLayer, PathLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {ClipExtension} from '@deck.gl/extensions';
import {vec4} from '@math.gl/core/matrix';
import {
  AbsoluteGlobeView,
  centroid,
  HEIGHT,
  measureErrors,
  renderFrame,
  samplePositions,
  scatterplot,
  TOLERANCE,
  VIEW_STATE,
  WIDTH,
  withDeck,
  type Pixel,
  type Vec3
} from './globe-camera-relative-test-utils';

test('camera-relative GlobeView: points at zoom 19 land on their float64 projection', async () => {
  let absoluteErrors: number[] = [];
  await withDeck(new AbsoluteGlobeView(), async (deck, read, viewport) => {
    const positions = samplePositions(viewport);
    await renderFrame(deck, {layers: [scatterplot(positions)]});
    absoluteErrors = measureErrors(read(), viewport, positions);
  });
  await withDeck(new GlobeView({_cameraRelative: true}), async (deck, read, viewport) => {
    const positions = samplePositions(viewport);
    await renderFrame(deck, {layers: [scatterplot(positions)]});
    const errors = measureErrors(read(), viewport, positions);
    // Billboards also go through the globe occlusion test and the billboard depth shift
    await renderFrame(deck, {layers: [scatterplot(positions, {billboard: true})]});
    const billboardErrors = measureErrors(read(), viewport, positions);
    console.log('Point errors (px)', {absolute: absoluteErrors, relative: errors, billboardErrors});
    expect(Math.max(...errors)).toBeLessThan(TOLERANCE);
    expect(Math.max(...billboardErrors)).toBeLessThan(TOLERANCE);
  });
  const mean = absoluteErrors.reduce((a, b) => a + b, 0) / absoluteErrors.length;
  expect(mean).toBeGreaterThan(1);
});

/**
 * Centre of the pixels whose centres lie in [min, max) on each axis: the coverage of a box
 * without anti-aliasing.
 */
function boxCoverageCenter(center: Pixel, halfSize: Pixel): Pixel {
  return [0, 1].map(axis => {
    const min = center[axis] - halfSize[axis];
    const max = center[axis] + halfSize[axis];
    const first = Math.ceil(min - 0.5);
    const last = Math.ceil(max - 0.5) - 1;
    return (first + last) / 2 + 0.5;
  }) as Pixel;
}

/** Distances between rendered boxes and the coverage of their float64 projections. */
function measureBoxErrors(
  pixels: Uint8Array,
  viewport: GlobeViewport,
  positions: Vec3[],
  halfSize: Pixel
): number[] {
  return positions.map(p => {
    const projected = viewport.project(p) as Pixel;
    // Rows are counted from the bottom in the coverage rule
    const fromBottom = boxCoverageCenter([projected[0], HEIGHT - projected[1]], halfSize);
    const expected: Pixel = [fromBottom[0], HEIGHT - fromBottom[1]];
    const found = centroid(pixels, expected, 30);
    return found ? Math.hypot(found[0] - expected[0], found[1] - expected[1]) : Infinity;
  });
}

for (const shape of ['SolidPolygonLayer', 'PathLayer'] as const) {
  test(`camera-relative GlobeView: ${shape} at zoom 19`, async () => {
    await withDeck(new GlobeView({_cameraRelative: true}), async (deck, read, viewport) => {
      // Altitude 0: a box at altitude is not a box on screen
      const positions = samplePositions(viewport).map(([x, y]) => [x, y, 0] as Vec3);
      const around = (p: Vec3, dx: number, dy: number): Vec3 => {
        const [x, y] = viewport.project(p);
        const [lng, lat] = viewport.unproject([x + dx, y + dy]);
        return [lng, lat, 0];
      };
      const layer =
        shape === 'SolidPolygonLayer'
          ? new SolidPolygonLayer<Vec3>({
              id: 'polygons',
              data: positions,
              getPolygon: p => [
                around(p, -2, -2),
                around(p, 2, -2),
                around(p, 2, 2),
                around(p, -2, 2)
              ],
              getFillColor: [255, 255, 255]
            })
          : new PathLayer<Vec3>({
              id: 'paths',
              data: positions,
              getPath: p => [around(p, -3, 0), around(p, 3, 0)],
              getWidth: 2,
              widthUnits: 'pixels',
              getColor: [255, 255, 255]
            });
      await renderFrame(deck, {layers: [layer]});
      const halfSize: Pixel = shape === 'SolidPolygonLayer' ? [2, 2] : [3, 1];
      const errors = measureBoxErrors(read(), viewport, positions, halfSize);
      console.log(`${shape} errors (px)`, errors);
      expect(Math.max(...errors)).toBeLessThan(TOLERANCE);
    });
  });
}

/** Float64 pixel of a meter offset in the tangent plane of a globe origin, as the shader does it. */
function getEastNorthUp(origin: Vec3): number[][] {
  const lambda = (origin[0] * Math.PI) / 180;
  const phi = (origin[1] * Math.PI) / 180;
  return [
    [Math.cos(lambda), Math.sin(lambda), 0],
    [-Math.sin(lambda) * Math.sin(phi), Math.cos(lambda) * Math.sin(phi), Math.cos(phi)],
    [Math.sin(lambda) * Math.cos(phi), -Math.cos(lambda) * Math.cos(phi), Math.sin(phi)]
  ];
}

function projectMeterOffset(viewport: GlobeViewport, origin: Vec3, offset: Vec3): Pixel {
  const [east, north, up] = getEastNorthUp(origin);
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter[0];
  const base = viewport.projectPosition(origin);
  const common = base.map(
    (v, i) => v + (east[i] * offset[0] + north[i] * offset[1] + up[i] * offset[2]) * unitsPerMeter
  );
  const [x, y, , w] = vec4.transformMat4([], [...common, 1], viewport.pixelProjectionMatrix);
  return [x / w, y / w];
}

/**
 * Errors of a `meter-offsets` layer whose origin is `originShift` degrees north of a point near
 * the screen centre. A far origin has a different east, north and up frame from the camera target.
 */
async function measureMeterOffsetErrors(views: GlobeView, originShift = 0): Promise<number[]> {
  let errors: number[] = [];
  await withDeck(views, async (deck, read, viewport) => {
    const [lng, lat] = viewport.unproject([WIDTH / 2 + 23.4, HEIGHT / 2 - 11.7]);
    const origin: Vec3 = [lng, lat + originShift, 0];
    const originCommon = viewport.projectPosition(origin);
    const frame = getEastNorthUp(origin);
    const unitsPerMeter = viewport.distanceScales.unitsPerMeter[0];
    // Offsets of the sample points, in the frame of the origin
    const offsets: Vec3[] = samplePositions(viewport).map(p => {
      const delta = viewport
        .projectPosition(p)
        .map((v, i) => (v - originCommon[i]) / unitsPerMeter);
      return frame.map(
        axis => axis[0] * delta[0] + axis[1] * delta[1] + axis[2] * delta[2]
      ) as Vec3;
    });
    await renderFrame(deck, {
      layers: [scatterplot(offsets, {coordinateSystem: 'meter-offsets', coordinateOrigin: origin})]
    });
    const pixels = read();
    errors = offsets.map(offset => {
      const expected = projectMeterOffset(viewport, origin, offset);
      const found = centroid(pixels, expected, 30);
      return found ? Math.hypot(found[0] - expected[0], found[1] - expected[1]) : Infinity;
    });
  });
  return errors;
}

test('camera-relative GlobeView: meter-offsets layer at zoom 19', async () => {
  const absolute = await measureMeterOffsetErrors(new AbsoluteGlobeView());
  const relative = await measureMeterOffsetErrors(new GlobeView({_cameraRelative: true}));
  const farOrigin = await measureMeterOffsetErrors(new GlobeView({_cameraRelative: true}), 0.5);
  console.log('Meter offset errors (px)', {absolute, relative, farOrigin});
  expect(Math.max(...relative)).toBeLessThan(TOLERANCE);
  expect(Math.max(...farOrigin)).toBeLessThan(TOLERANCE);
  expect(Math.max(...absolute)).toBeGreaterThan(0.5);
});

test('camera-relative GlobeView: points across the antimeridian at zoom 19', async () => {
  // Float32 longitudes 2 steps west of 180 and 1 step east of -180
  const seamOrigin = 179.999969482421875;
  const seamPoint = -179.9999847412109375;
  const step = 2 ** -16;
  for (const sign of [1, -1]) {
    await withDeck(new GlobeView({_cameraRelative: true}), async (deck, read) => {
      await renderFrame(deck, {
        viewState: {...VIEW_STATE, longitude: sign * seamOrigin, latitude: 0}
      });
      const viewport = deck.getViewports()[0] as GlobeViewport;
      const positions = [
        seamPoint,
        seamPoint + 9 * step,
        seamPoint + 4.5 * step,
        180 - 5 * step
      ].map((lng, i) => [sign * lng, (i - 1.5) * 1e-4, 0] as Vec3);
      await renderFrame(deck, {layers: [scatterplot(positions)]});
      const errors = measureErrors(read(), viewport, positions);
      console.log('Antimeridian point errors (px)', sign, errors);
      expect(Math.max(...errors)).toBeLessThan(TOLERANCE);
    });
  }
});

test('camera-relative GlobeView: picking at the float64 projection', async () => {
  await withDeck(new GlobeView({_cameraRelative: true}), async (deck, _read, viewport) => {
    const positions = samplePositions(viewport);
    await renderFrame(deck, {layers: [scatterplot(positions, {pickable: true})]});
    positions.forEach((p, index) => {
      const [x, y] = viewport.project(p);
      const info = deck.pickObject({x, y, radius: 0});
      expect(info?.index, `position ${index}`).toBe(index);
    });
  });
});

test('camera-relative GlobeView: ClipExtension bounds at zoom 19', async () => {
  await withDeck(new GlobeView({_cameraRelative: true}), async (deck, read, viewport) => {
    const positions = samplePositions(viewport);
    // Keep the centre column only
    const [west] = viewport.unproject([WIDTH / 2 - 60, HEIGHT / 2]);
    const [east] = viewport.unproject([WIDTH / 2 + 60, HEIGHT / 2]);
    const clipBounds = [west, VIEW_STATE.latitude - 1, east, VIEW_STATE.latitude + 1];
    await renderFrame(deck, {
      layers: [
        scatterplot(positions, {
          extensions: [new ClipExtension()],
          // Clip in flat common space, through project_common_position_to_flat
          clipByInstance: false,
          clipBounds
        })
      ]
    });
    const pixels = read();
    const visible = positions.map(p => centroid(pixels, viewport.project(p) as Pixel, 6) !== null);
    expect(visible).toEqual([false, false, false, true, true, true, false, false, false]);
  });
});

/** Green pixels of a billboard point standing on a ground polygon, at zoom 10 and pitch 60. */
async function countBillboardPixels(views: GlobeView): Promise<number> {
  let count = 0;
  const viewState = {...VIEW_STATE, zoom: 10, pitch: 60};
  await withDeck(views, async (deck, read, viewport) => {
    await renderFrame(deck, {viewState});
    const v = deck.getViewports()[0] as GlobeViewport;
    const anchor = v.unproject([WIDTH / 2 + 0.3, HEIGHT / 2 + 40.6]) as [number, number];
    const ground = new SolidPolygonLayer({
      id: 'ground',
      data: [
        {
          polygon: [
            [anchor[0] - 0.3, anchor[1] - 0.2],
            [anchor[0] + 0.3, anchor[1] - 0.2],
            [anchor[0] + 0.3, anchor[1] + 0.2],
            [anchor[0] - 0.3, anchor[1] + 0.2]
          ]
        }
      ],
      getPolygon: d => d.polygon,
      getFillColor: [255, 0, 0],
      _subdivide: true
    });
    const point = new ScatterplotLayer({
      id: 'point',
      data: [anchor],
      getPosition: d => d,
      getRadius: 8,
      radiusUnits: 'pixels',
      billboard: true,
      getFillColor: [0, 255, 0]
    });
    await renderFrame(deck, {viewState, layers: [ground, point]});
    const pixels = read();
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      if (pixels[i * 4 + 1] > 127) count++;
    }
    expect(viewport).toBeDefined();
  });
  return count;
}

test('camera-relative GlobeView: billboard depth shift matches the absolute path', async () => {
  const absolute = await countBillboardPixels(new AbsoluteGlobeView());
  const relative = await countBillboardPixels(new GlobeView({_cameraRelative: true}));
  console.log('Billboard pixels', {absolute, relative});
  // A disc of radius 8 px; without the depth shift the ground hides about half of it
  expect(absolute).toBeGreaterThan(0.8 * Math.PI * 64);
  // SwiftShader moves the absolute path by a few pixels (low trigonometry precision)
  expect(Math.abs(relative - absolute)).toBeLessThanOrEqual(15);
});

const STRIPES = 16;

/** Tile image of vertical stripes: green on even, black on odd. */
function stripeImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = STRIPES * 8;
  canvas.height = 8;
  const context = canvas.getContext('2d')!;
  for (let i = 0; i < STRIPES; i += 2) {
    context.fillStyle = '#00ff00';
    context.fillRect(i * 8, 0, 8, 8);
  }
  return canvas;
}

/** Signed errors of the green stripe centres, from 50 % crossings along the centre row. */
async function measureStripeErrors(views: GlobeView): Promise<number[]> {
  const centerErrors: number[] = [];
  await withDeck(views, async (deck, read, viewport) => {
    const image = stripeImage();
    let loadedTiles: {bbox: {west: number; east: number}}[] = [];
    const tiles = new TileLayer({
      id: 'tiles',
      getTileData: () => image,
      onViewportLoad: loaded => {
        loadedTiles = loaded as unknown as typeof loadedTiles;
      },
      renderSubLayers: props => {
        const {west, south, east, north} = props.tile.bbox as Record<string, number>;
        return new BitmapLayer({
          id: `${props.id}-bitmap`,
          image: props.data,
          bounds: [west, south, east, north],
          textureParameters: {minFilter: 'linear', magFilter: 'linear'}
        });
      }
    });
    await renderFrame(deck, {layers: [tiles]});
    for (let i = 0; i < 50 && loadedTiles.length === 0; i++) {
      await renderFrame(deck, {layers: [tiles]});
    }
    await renderFrame(deck, {layers: [tiles]});
    expect(loadedTiles.length).toBeGreaterThan(0);
    const pixels = read();

    const row = HEIGHT / 2;
    const latitude = viewport.unproject([WIDTH / 2, HEIGHT - row - 0.5])[1];
    // Stripe edges inside each tile, as screen x. Edges on tile borders are sharper (clamped
    // filtering), so they are left out.
    const edges: number[] = [];
    for (const tile of loadedTiles) {
      for (let i = 1; i < STRIPES; i++) {
        const lng = tile.bbox.west + ((tile.bbox.east - tile.bbox.west) * i) / STRIPES;
        edges.push(viewport.project([lng, latitude])[0]);
      }
    }
    let rise: {error: number} | null = null;
    for (let x = 4; x < WIDTH - 5; x++) {
      const a = pixels[(row * WIDTH + x) * 4 + 1] - 127.5;
      const b = pixels[(row * WIDTH + x + 1) * 4 + 1] - 127.5;
      if (a * b >= 0) continue;
      const crossing = x + 0.5 + a / (a - b);
      const nearest = edges.reduce((best, px) =>
        Math.abs(px - crossing) < Math.abs(best - crossing) ? px : best
      );
      // The filter makes green stripes look narrower: average a rising and a falling edge
      const error = Math.abs(nearest - crossing) < 4 ? crossing - nearest : NaN;
      if (a < 0) {
        rise = {error};
      } else if (rise) {
        const center = (rise.error + error) / 2;
        if (Number.isFinite(center)) centerErrors.push(center);
        rise = null;
      }
    }
  });
  return centerErrors;
}

test('camera-relative GlobeView: TileLayer + BitmapLayer stripes at zoom 19', async () => {
  const absolute = await measureStripeErrors(new AbsoluteGlobeView());
  const relative = await measureStripeErrors(new GlobeView({_cameraRelative: true}));
  console.log('Stripe centre errors (px)', {absolute, relative});
  expect(relative.length).toBeGreaterThan(3);
  expect(Math.max(...relative.map(Math.abs))).toBeLessThan(TOLERANCE);
  // Without the flag the stripes are off by more, or too far off to pair with an edge
  expect(absolute.length < 3 || Math.max(...absolute.map(Math.abs)) > 0.5).toBe(true);
});
