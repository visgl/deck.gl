// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  _GlobeViewport as GlobeViewport,
  WebMercatorViewport,
  fp64LowPart,
  project,
  project32,
  type ProjectProps,
  type Viewport
} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import type {NumberArray3} from '@math.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

const EARTH_RADIUS = 6370972;
const GLOBE_METERS_TO_COMMON = 256 / EARTH_RADIUS;
const DEGREES_TO_RADIANS = Math.PI / 180;

// [longitude, latitude]. The poles use longitude 0, where east is +x on the globe.
const LOCATIONS = [
  [-122, 38],
  [0, 0],
  [135, -45],
  [170, 60],
  [20, 89.9],
  [-60, -89.9],
  [0, 90],
  [0, -90]
];

/** East, north and up at a location, in GlobeViewport common space. */
function getEastNorthUp(longitude: number, latitude: number): number[][] {
  const lambda = longitude * DEGREES_TO_RADIANS;
  const phi = latitude * DEGREES_TO_RADIANS;
  return [
    [Math.cos(lambda), Math.sin(lambda), 0],
    [-Math.sin(lambda) * Math.sin(phi), Math.cos(lambda) * Math.sin(phi), Math.cos(phi)],
    [Math.sin(lambda) * Math.cos(phi), -Math.cos(lambda) * Math.cos(phi), Math.sin(phi)]
  ];
}

/** Runs a WGSL compute snippet that writes `count` vec4 results to `output`. */
async function runWGSL(
  webgpuDevice: Device,
  modules: ShaderModule[],
  props: {project: ProjectProps},
  body: string,
  count: number
): Promise<Float32Array> {
  const output = webgpuDevice.createBuffer({
    byteLength: count * 16,
    usage: Buffer.STORAGE | Buffer.COPY_SRC
  });
  const computation = new Computation(webgpuDevice, {
    modules,
    source: `
      @group(0) @binding(0) var<storage, read_write> output: array<vec4<f32>>;
      @compute @workgroup_size(1)
      fn main() {
        ${body}
      }`,
    bindings: {output}
  });
  try {
    computation.shaderInputs.setProps(props);
    computation.predraw(webgpuDevice.commandEncoder);
    const pass = webgpuDevice.beginComputePass();
    computation.dispatch(pass, 1);
    pass.end();
    webgpuDevice.submit();
    const bytes = await output.readAsync();
    return new Float32Array(bytes.buffer, bytes.byteOffset, count * 4);
  } finally {
    computation.destroy();
    output.destroy();
  }
}

const wgslVec3 = (value: number[]) => `vec3<f32>(${value.map(x => x.toFixed(9)).join(', ')})`;

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`project_get_orientation_matrix points east, north and up on the globe: ${backend}`, async ({
    skip
  }) => {
    const targetDevice = backend === 'webgpu' ? await getWebGPUTestDevice() : device;
    if (!targetDevice || targetDevice.type !== backend) return skip();

    const viewport = new GlobeViewport({longitude: 0, latitude: 0, zoom: 1});
    const ups = LOCATIONS.map(([longitude, latitude]) =>
      viewport.projectPosition([longitude, latitude, 0])
    );
    let columns: number[][];
    if (backend === 'webgl') {
      columns = [];
      for (const up of ups) {
        for (const axis of [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1]
        ]) {
          const result = await runOnGPU({
            vs: `#version 300 es
              out vec3 outValue;
              void main() {
                outValue = project_get_orientation_matrix(test.uDirUp) * test.uInput;
              }`,
            varying: 'outValue',
            modules: [project, testUniforms],
            vertexCount: 1,
            shaderInputProps: {
              project: {viewport},
              test: {uDirUp: up as NumberArray3, uInput: axis as NumberArray3}
            }
          });
          columns.push(Array.from(result.slice(0, 3)));
        }
      }
    } else {
      // Use the project uniforms so that their binding is kept
      const body = `_ = project.projectionMode;\n${ups
        .map(
          (up, i) => `{
            let transform = project_get_orientation_matrix(${wgslVec3(up)});
            output[${i * 3}] = vec4<f32>(transform[0], 0.0);
            output[${i * 3 + 1}] = vec4<f32>(transform[1], 0.0);
            output[${i * 3 + 2}] = vec4<f32>(transform[2], 0.0);
          }`
        )
        .join('\n')}`;
      const result = await runWGSL(
        targetDevice,
        [project],
        {project: {viewport}},
        body,
        ups.length * 3
      );
      columns = ups.flatMap((_, i) =>
        [0, 1, 2].map(axis => Array.from(result.slice((i * 3 + axis) * 4, (i * 3 + axis) * 4 + 3)))
      );
    }

    LOCATIONS.forEach(([longitude, latitude], i) => {
      getEastNorthUp(longitude, latitude).forEach((expected, axis) => {
        const actual = columns[i * 3 + axis];
        const label = `${['east', 'north', 'up'][axis]} at ${longitude}, ${latitude}`;
        expected.forEach((value, component) =>
          expect(actual[component], label).toBeCloseTo(value, 5)
        );
      });
    });
  });

  test(`Globe meter offsets point east, north and up of the origin: ${backend}`, async ({skip}) => {
    const targetDevice = backend === 'webgpu' ? await getWebGPUTestDevice() : device;
    if (!targetDevice || targetDevice.type !== backend) return skip();

    const offset = [300, -200, 100];
    for (const [longitude, latitude] of LOCATIONS) {
      const props = {
        viewport: new GlobeViewport({longitude, latitude, zoom: 10}),
        coordinateSystem: 'meter-offsets' as const,
        coordinateOrigin: [longitude, latitude, 0] as [number, number, number]
      };
      let result: Float32Array;
      if (backend === 'webgl') {
        result = await runOnGPU({
          vs: `#version 300 es
            out vec3 outValue;
            void main() {
              outValue = project_position(test.uPos, test.uPos64Low);
            }`,
          varying: 'outValue',
          modules: [project, testUniforms],
          vertexCount: 1,
          shaderInputProps: {
            project: props,
            test: {uPos: offset as NumberArray3, uPos64Low: [0, 0, 0]}
          }
        });
      } else {
        result = await runWGSL(
          targetDevice,
          [project],
          {project: props},
          `output[0] = vec4<f32>(project_position_vec3_f64(${wgslVec3(offset)}, vec3<f32>(0.0)), 1.0);`,
          1
        );
      }
      const origin = props.viewport.projectPosition(props.coordinateOrigin);
      const axes = getEastNorthUp(longitude, latitude);
      const expected = origin.map(
        (value, i) =>
          value +
          (axes[0][i] * offset[0] + axes[1][i] * offset[1] + axes[2][i] * offset[2]) *
            GLOBE_METERS_TO_COMMON
      );
      // Within a metre: common positions are 32-bit on a 256-unit globe
      expected.forEach((value, i) =>
        expect(
          Math.abs(result[i] - value) / GLOBE_METERS_TO_COMMON,
          `${longitude}, ${latitude}`
        ).toBeLessThan(1)
      );
    }
  });
}

/** Screen pixel of a meter offset from an anchor, via project32. */
async function projectOffset(
  viewport: Viewport,
  anchor: number[],
  offset: number[],
  coordinateSystem: 'lnglat' | 'cartesian' = 'lnglat'
) {
  const clip = await runOnGPU({
    vs: `#version 300 es
      out vec4 outValue;
      void main() {
        geometry.worldPosition = test.uPos;
        outValue = project_position_to_clipspace(test.uPos, test.uPos64Low, project_size(test.uInput));
      }`,
    varying: 'outValue',
    modules: [project32, testUniforms],
    vertexCount: 1,
    shaderInputProps: {
      project: {viewport, coordinateSystem},
      test: {
        uPos: anchor as NumberArray3,
        uPos64Low: anchor.map(fp64LowPart) as NumberArray3,
        uInput: offset as NumberArray3
      }
    }
  });
  return [
    ((clip[0] / clip[3] + 1) / 2) * viewport.width,
    ((1 - clip[1] / clip[3]) / 2) * viewport.height
  ];
}

/** Geographic position `offset` meters east, north and up of a lng/lat anchor. */
function moveLngLat([longitude, latitude]: number[], offset: number[]): number[] {
  return [
    longitude +
      offset[0] / (EARTH_RADIUS * Math.cos(latitude * DEGREES_TO_RADIANS)) / DEGREES_TO_RADIANS,
    latitude + offset[1] / EARTH_RADIUS / DEGREES_TO_RADIANS,
    offset[2]
  ];
}

const webglTest = device.type === 'webgl' ? test : test.skip;

webglTest('project32 meter offsets agree across the GlobeView zoom-12 switch', async () => {
  const offsets = [
    [500, 0, 0],
    [0, 500, 0],
    [0, 0, 500]
  ];
  for (const [longitude, latitude] of [
    [-122, 38],
    [20, 70]
  ]) {
    for (const [pitch, bearing] of [
      [0, 0],
      [50, -35]
    ]) {
      const viewState = {width: 800, height: 600, longitude, latitude, pitch, bearing};
      const globe = new GlobeViewport({...viewState, zoom: 11.999});
      const mercator = new WebMercatorViewport({...viewState, zoom: 12.001});
      const anchor = [longitude, latitude, 0];
      // The same anchor as globe-centered meters: 32-bit sin/cos of lng/lat on the GPU can move
      // a globe position by several pixels at zoom 12, which would hide the offset under test.
      const globeAnchor = globe.projectPosition(anchor).map(x => x / GLOBE_METERS_TO_COMMON);
      const project = async (viewport: Viewport, offset: number[], cartesian = false) => {
        const [x0, y0] = await projectOffset(
          viewport,
          cartesian ? globeAnchor : anchor,
          [0, 0, 0],
          cartesian ? 'cartesian' : 'lnglat'
        );
        const [x1, y1] = await projectOffset(
          viewport,
          cartesian ? globeAnchor : anchor,
          offset,
          cartesian ? 'cartesian' : 'lnglat'
        );
        return [x1 - x0, y1 - y0];
      };
      // Looking straight down, an up offset does not move on screen
      for (const offset of pitch ? offsets : offsets.slice(0, 2)) {
        const label = `${JSON.stringify(offset)} at ${longitude}, ${latitude}, pitch ${pitch}`;
        const mercatorDelta = await project(mercator, offset);
        const globeDelta = await project(globe, offset, true);
        expect(Math.hypot(...mercatorDelta), label).toBeGreaterThan(10);
        // GlobeViewport projects the moved geographic position to the same place
        const [anchorX, anchorY] = globe.project(anchor);
        const [movedX, movedY] = globe.project(moveLngLat(anchor, offset));
        for (const expected of [mercatorDelta, [movedX - anchorX, movedY - anchorY]])
          expect(
            Math.hypot(globeDelta[0] - expected[0], globeDelta[1] - expected[1]),
            label
          ).toBeLessThan(0.5);
        // Lng/lat anchors, as SimpleMeshLayer passes them, point the same way (a frame turned
        // half a turn gives -1); 32-bit trig moves the anchor itself, hence the loose bound
        const lngLatDelta = await project(globe, offset);
        const cosine =
          (lngLatDelta[0] * mercatorDelta[0] + lngLatDelta[1] * mercatorDelta[1]) /
          (Math.hypot(...lngLatDelta) * Math.hypot(...mercatorDelta));
        expect(cosine, label).toBeGreaterThan(0.99);
      }
    }
  }
});
