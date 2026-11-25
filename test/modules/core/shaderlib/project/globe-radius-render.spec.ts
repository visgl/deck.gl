// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// GlobeView with a radius other than the Earth's: rendered positions, sizes, picking and the
// horizon against the float64 viewport of the same radius.

import {expect, test} from 'vitest';
import {Deck, GlobeView, GlobeViewport, type GlobeViewState, type Layer} from '@deck.gl/core';
import {Buffer, Texture, type Framebuffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {ArcLayer} from '@deck.gl/layers';
import {vec3} from '@math.gl/core/matrix';
import {
  centroid,
  HEIGHT,
  measureErrors,
  renderFrame,
  scatterplot,
  TOLERANCE,
  WIDTH,
  withDeck,
  type Pixel,
  type Vec3
} from './globe-camera-relative-test-utils';

const EARTH_RADIUS = 6370972;
const MOON_RADIUS = 1737400;
const NEAR_SIDE = {longitude: 23.47, latitude: 0.67, zoom: 4, pitch: 0, bearing: 0};

/** Positions on a 3 x 3 grid around the screen centre; every second one at `altitude`. */
function gridPositions(viewport: GlobeViewport, altitude: number): Vec3[] {
  const positions: Vec3[] = [];
  for (const dx of [-110, 0, 105]) {
    for (const dy of [-80, 0, 75]) {
      const [lng, lat] = viewport.unproject([WIDTH / 2 + dx + 0.3, HEIGHT / 2 + dy + 0.6]);
      positions.push([lng, lat, positions.length % 2 ? altitude : 0]);
    }
  }
  return positions;
}

/** Pixel of a position on a sphere of another radius, seen by the same camera. */
function projectWithRadius(p: Vec3, radius: number): Pixel {
  const other = new GlobeViewport({width: WIDTH, height: HEIGHT, ...NEAR_SIDE, _radius: radius});
  return other.project(p) as Pixel;
}

for (const cameraRelative of [false, true]) {
  const label = cameraRelative ? ' (camera-relative)' : '';
  const view = () => new GlobeView({_radius: MOON_RADIUS, _cameraRelative: cameraRelative});

  test(`GlobeView radius${label}: points at altitude land on their projection`, async () => {
    await withDeck(
      view(),
      async (deck, read, viewport) => {
        expect(viewport.radius).toBe(MOON_RADIUS);
        const positions = gridPositions(viewport, 150000);
        await renderFrame(deck, {layers: [scatterplot(positions)]});
        const errors = measureErrors(read(), viewport, positions);
        console.log(`Moon point errors (px)${label}`, errors);
        expect(Math.max(...errors)).toBeLessThan(TOLERANCE);
        // With the Earth's radius, points at altitude would land elsewhere
        const p = positions[1];
        const [x, y] = viewport.project(p);
        const [xEarth, yEarth] = projectWithRadius(p, EARTH_RADIUS);
        expect(Math.hypot(x - xEarth, y - yEarth)).toBeGreaterThan(5);
      },
      NEAR_SIDE
    );
  });

  test(`GlobeView radius${label}: sizes in meters`, async () => {
    await withDeck(
      view(),
      async (deck, read, viewport) => {
        const radius = 40000;
        const center: Vec3 = [NEAR_SIDE.longitude, NEAR_SIDE.latitude, 0];
        await renderFrame(deck, {
          layers: [scatterplot([center], {getRadius: radius, radiusUnits: 'meters'})]
        });
        const pixels = read();
        let lit = 0;
        for (let i = 1; i < pixels.length; i += 4) lit += pixels[i] / 255;
        const measured = Math.sqrt(lit / Math.PI);
        // A point `radius` meters east of the centre, along the surface
        const east: Vec3 = [
          center[0] +
            (radius / MOON_RADIUS / Math.cos((center[1] * Math.PI) / 180)) * (180 / Math.PI),
          center[1],
          0
        ];
        const [x0, y0] = viewport.project(center);
        const [x1, y1] = viewport.project(east);
        const expected = Math.hypot(x1 - x0, y1 - y0);
        console.log(`Moon disc radius (px)${label}`, {measured, expected});
        expect(expected).toBeGreaterThan(20);
        expect(Math.abs(measured / expected - 1)).toBeLessThan(0.02);
      },
      NEAR_SIDE
    );
  });

  test(`GlobeView radius${label}: unproject3D picks the altitude`, async () => {
    await withDeck(
      view(),
      async (deck, _read, viewport) => {
        const altitude = 100000;
        const center: Vec3 = [NEAR_SIDE.longitude, NEAR_SIDE.latitude, altitude];
        await renderFrame(deck, {
          layers: [
            scatterplot([center], {getRadius: 200000, radiusUnits: 'meters', pickable: true})
          ]
        });
        const [x, y] = viewport.project(center);
        const info = deck.pickObject({x, y, radius: 0, unproject3D: true});
        expect(info?.index).toBe(0);
        const picked = info!.coordinate!;
        console.log(`Moon picked coordinate${label}`, picked);
        expect(Math.abs(picked[2] - altitude)).toBeLessThan(altitude * 0.02);
        expect(Math.abs(picked[0] - center[0])).toBeLessThan(0.05);
        expect(Math.abs(picked[1] - center[1])).toBeLessThan(0.05);
      },
      NEAR_SIDE
    );
  });

  test(`GlobeView radius${label}: the horizon hides points by their altitude`, async () => {
    const viewState = {longitude: 0, latitude: 0, zoom: 1, pitch: 0, bearing: 0};
    await withDeck(
      view(),
      async (deck, read, viewport) => {
        const altitude = 300000;
        const earth = new GlobeViewport({
          width: WIDTH,
          height: HEIGHT,
          ...viewState,
          _radius: EARTH_RADIUS
        });
        /** Float64 port of project_globe_is_occluded */
        const isOccluded = (v: GlobeViewport, p: Vec3): boolean => {
          const eye = v.cameraPosition;
          const ray = vec3.sub([], v.projectPosition(p), eye);
          const t = Math.min(Math.max(-vec3.dot(eye, ray) / vec3.sqrLen(ray), 0), 1);
          const closest = vec3.scaleAndAdd([], eye, ray, t);
          return t < 1 && vec3.sqrLen(closest) < 256 * 256;
        };
        let differ = 0;
        let hidden = 0;
        for (let lng = 80; lng <= 128; lng += 3) {
          const p: Vec3 = [lng, 0, altitude];
          const occluded = isOccluded(viewport, p);
          if (occluded !== isOccluded(earth, p)) differ++;
          await renderFrame(deck, {layers: [scatterplot([p], {billboard: true})]});
          const expected = viewport.project(p) as Pixel;
          const found = centroid(read(), expected, 4);
          if (occluded) {
            hidden++;
            expect(found, `lng ${lng} is behind the horizon`).toBeNull();
          } else {
            expect(found, `lng ${lng} is in view`).not.toBeNull();
            const error = Math.hypot(found![0] - expected[0], found![1] - expected[1]);
            expect(error, `lng ${lng}`).toBeLessThan(TOLERANCE);
          }
        }
        console.log(`Moon horizon${label}`, {hidden, differ});
        // Both cases occur, and the Earth's radius would hide some of the visible points
        expect(hidden).toBeGreaterThanOrEqual(2);
        expect(differ).toBeGreaterThanOrEqual(2);
      },
      viewState
    );
  });

  test(`GlobeView radius${label}: ArcLayer height`, async () => {
    const viewState = {longitude: 0, latitude: 0, zoom: 1, pitch: 0, bearing: 0};
    await withDeck(
      view(),
      async (deck, read, viewport) => {
        // Along a meridian: the plane of the arc is not edge-on to the camera
        const source: Vec3 = [70, -10, 0];
        const target: Vec3 = [70, 10, 0];
        await renderFrame(deck, {
          layers: [
            new ArcLayer({
              id: 'arc',
              data: [0],
              getSourcePosition: () => source,
              getTargetPosition: () => target,
              getSourceColor: [255, 255, 255],
              getTargetColor: [255, 255, 255],
              getWidth: 3,
              numSegments: 51
            })
          ]
        });
        // The arc peaks halfway, at half its length on the sphere: 0.5 * angle * radius
        const peak = (radius: number): Vec3 => [70, 0, 0.5 * ((20 * Math.PI) / 180) * radius];
        const expected = viewport.project(peak(MOON_RADIUS)) as Pixel;
        const onEarth = viewport.project(peak(EARTH_RADIUS)) as Pixel;
        expect(Math.hypot(expected[0] - onEarth[0], expected[1] - onEarth[1])).toBeGreaterThan(5);
        const found = centroid(read(), expected, 2);
        expect(found).not.toBeNull();
        const error = Math.hypot(found![0] - expected[0], found![1] - expected[1]);
        console.log(`Moon arc peak error (px)${label}`, error);
        expect(error).toBeLessThan(0.5);
      },
      viewState
    );
  });
}

/** Runs `run` on a WebGPU Deck of WIDTH x HEIGHT; `render` returns rows bottom-up, as on WebGL. */
async function withWebGPUDeck(
  views: GlobeView,
  viewState: GlobeViewState,
  run: (render: (layers: Layer[]) => Promise<Uint8Array>, viewport: GlobeViewport) => Promise<void>
): Promise<boolean> {
  const device = await getWebGPUTestDevice();
  if (!device) return false;
  let deck: Deck<GlobeView> | undefined;
  let framebuffer: Framebuffer | undefined;
  try {
    framebuffer = device.createFramebuffer({
      width: WIDTH,
      height: HEIGHT,
      colorAttachments: [
        device.createTexture({
          format: 'rgba8unorm',
          width: WIDTH,
          height: HEIGHT,
          usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
        })
      ],
      depthStencilAttachment: 'depth24plus'
    });
    deck = new Deck({
      device,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false,
      _framebuffer: framebuffer,
      views,
      viewState,
      layers: []
    });
    await renderFrame(deck);
    // The first frames of a Deck on a shared WebGPU device can use the previous canvas size
    for (let attempt = 0; attempt < 50 && deck.getViewports()[0]?.width !== WIDTH; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      deck.redraw('resize');
    }
    const viewport = deck.getViewports()[0] as GlobeViewport;
    expect(viewport.width).toBe(WIDTH);
    const texture = framebuffer.colorAttachments[0].texture;
    const read = async (): Promise<Uint8Array> => {
      const {bytesPerRow, byteLength} = texture.computeMemoryLayout({});
      const buffer = device.createBuffer({
        byteLength,
        usage: Buffer.COPY_DST | Buffer.MAP_READ
      });
      try {
        texture.readBuffer({}, buffer);
        const data = await buffer.readAsync();
        const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
        for (let row = 0; row < HEIGHT; row++) {
          const start = (HEIGHT - 1 - row) * bytesPerRow;
          pixels.set(data.subarray(start, start + WIDTH * 4), row * WIDTH * 4);
        }
        return pixels;
      } finally {
        buffer.destroy();
      }
    };
    const render = async (layers: Layer[]): Promise<Uint8Array> => {
      await renderFrame(deck!, {layers});
      return read();
    };
    await run(render, viewport);
  } finally {
    deck?.finalize();
    framebuffer?.destroy();
  }
  return true;
}

for (const cameraRelative of [false, true]) {
  const label = cameraRelative ? ' (camera-relative)' : '';
  test(`GlobeView radius${label}: WebGPU points at altitude and sizes in meters`, async ({
    skip
  }) => {
    const ran = await withWebGPUDeck(
      new GlobeView({_radius: MOON_RADIUS, _cameraRelative: cameraRelative}),
      NEAR_SIDE,
      async (render, viewport) => {
        const positions = gridPositions(viewport, 150000);
        const errors = measureErrors(await render([scatterplot(positions)]), viewport, positions);
        console.log(`WebGPU Moon point errors (px)${label}`, errors);
        expect(Math.max(...errors)).toBeLessThan(TOLERANCE);

        const center: Vec3 = [NEAR_SIDE.longitude, NEAR_SIDE.latitude, 0];
        const pixels = await render([
          scatterplot([center], {getRadius: 40000, radiusUnits: 'meters'})
        ]);
        let lit = 0;
        for (let i = 1; i < pixels.length; i += 4) lit += pixels[i] / 255;
        const measured = Math.sqrt(lit / Math.PI);
        const east: Vec3 = [
          center[0] +
            (40000 / MOON_RADIUS / Math.cos((center[1] * Math.PI) / 180)) * (180 / Math.PI),
          center[1],
          0
        ];
        const [x0, y0] = viewport.project(center);
        const [x1, y1] = viewport.project(east);
        const expected = Math.hypot(x1 - x0, y1 - y0);
        console.log(`WebGPU Moon disc radius (px)${label}`, {measured, expected});
        expect(Math.abs(measured / expected - 1)).toBeLessThan(0.02);
      }
    );
    if (!ran) skip();
  });
}

test('GlobeView radius: WebGPU ArcLayer height', async ({skip}) => {
  const ran = await withWebGPUDeck(
    new GlobeView({_radius: MOON_RADIUS}),
    {longitude: 0, latitude: 0, zoom: 1, pitch: 0, bearing: 0},
    async (render, viewport) => {
      const pixels = await render([
        new ArcLayer({
          id: 'arc',
          data: [0],
          getSourcePosition: () => [70, -10, 0],
          getTargetPosition: () => [70, 10, 0],
          getSourceColor: [255, 255, 255],
          getTargetColor: [255, 255, 255],
          getWidth: 3,
          numSegments: 51
        })
      ]);
      const expected = viewport.project([
        70,
        0,
        0.5 * ((20 * Math.PI) / 180) * MOON_RADIUS
      ]) as Pixel;
      const found = centroid(pixels, expected, 2);
      expect(found).not.toBeNull();
      const error = Math.hypot(found![0] - expected[0], found![1] - expected[1]);
      console.log('WebGPU Moon arc peak error (px)', error);
      expect(error).toBeLessThan(0.5);
    }
  );
  if (!ran) skip();
});
