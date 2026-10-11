// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {expect, it} from 'vitest';
import {COORDINATE_SYSTEM, WebMercatorViewport, _GlobeViewport, project32} from '@deck.gl/core';
import {Buffer, Texture} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {getTestDevice} from '@luma.gl/test-utils';
import {getMeterOffsetPosition} from '../../src/projection/meter-offset-position';
import type {ShaderModule} from '@luma.gl/shadertools';

const cameraTest = {
  name: 'cameraTest',
  bindingLayout: [{name: 'cameraTest', group: 3}],
  uniformTypes: {localPosition: 'vec3<f32>'},
  source:
    'struct cameraTestUniforms { localPosition: vec3f }; @group(3) @binding(auto) var<uniform> cameraTest: cameraTestUniforms;',
  vs: 'layout(std140) uniform cameraTestUniforms { vec3 localPosition; } cameraTest;'
} as const satisfies ShaderModule;

for (const backend of ['webgpu', 'webgl'] as const) {
  it(`local camera conversion round-trips through Deck projection on ${backend}`, async context => {
    const device = await getTestDevice(backend);
    if (!device || !device.isTextureFormatRenderable('rgba32float')) return context.skip();
    const texture = device.createTexture({
      width: 1,
      height: 1,
      format: 'rgba32float',
      usage: Texture.COPY_SRC | Texture.RENDER_ATTACHMENT
    });
    const framebuffer = device.createFramebuffer({
      width: 1,
      height: 1,
      colorAttachments: [texture]
    });
    const model = new Model(device, {
      modules: [project32, cameraTest],
      vertexCount: 3,
      source: `struct Vertex { @builtin(position) position: vec4f, @location(0) commonPosition: vec3f };
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Vertex {
          let positions = array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));
          var output: Vertex;
          output.position = vec4f(positions[index],0,1);
          output.commonPosition = project_position_vec4_f32(vec4f(cameraTest.localPosition,1)).xyz;
          return output;
        }
        @fragment fn fragmentMain(input: Vertex) -> @location(0) vec4f {return vec4f(input.commonPosition,1);}`,
      vs: `#version 300 es
        out vec3 commonPosition;
        void main() {
          vec2 positions[3] = vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));
          gl_Position = vec4(positions[gl_VertexID],0,1);
          commonPosition = project_position(vec4(cameraTest.localPosition,1)).xyz;
        }`,
      fs: '#version 300 es\nprecision highp float; in vec3 commonPosition; out vec4 fragmentColor; void main() {fragmentColor = vec4(commonPosition,1);}'
    });
    const layout = texture.computeMemoryLayout();
    const buffer = device.createBuffer({
      byteLength: layout.byteLength,
      usage: Buffer.COPY_DST | Buffer.MAP_READ
    });
    try {
      for (const ViewportType of [WebMercatorViewport, _GlobeViewport]) {
        for (const latitude of ViewportType === _GlobeViewport
          ? [-90, -70, 0, 40.7, 70, 90]
          : [-70, 0, 40.7, 70]) {
          const coordinateOrigin: [number, number, number] = [20, latitude, 100];
          const viewport = new ViewportType({
            width: 800,
            height: 600,
            longitude: 20.1,
            latitude: latitude + 0.2,
            zoom: 13,
            pitch: 50,
            bearing: 25
          });
          const localPosition = getMeterOffsetPosition(
            viewport,
            coordinateOrigin,
            viewport.cameraPosition
          );
          expect(localPosition.every(Number.isFinite)).toBe(true);
          expect(Math.hypot(...localPosition)).toBeLessThan(100000);
          model.shaderInputs.setProps({
            project: {
              viewport,
              coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
              coordinateOrigin
            },
            cameraTest: {localPosition}
          });
          const encoder = device.createCommandEncoder();
          model.predraw(encoder);
          const pass = encoder.beginRenderPass({
            framebuffer,
            clearColor: [0, 0, 0, 0],
            clearDepth: false
          });
          model.draw(pass);
          pass.end();
          device.submit(encoder.finish());
          texture.readBuffer({}, buffer);
          const bytes = await buffer.readAsync();
          const common = new Float32Array(bytes.buffer, bytes.byteOffset, 4);
          const origin = viewport.projectPosition(coordinateOrigin);
          viewport.cameraPosition.forEach((value, index) => {
            const expected = viewport instanceof _GlobeViewport ? value : value - origin[index];
            expect(common[index]).toBeCloseTo(expected, 4);
          });
          expect(
            getMeterOffsetPosition(viewport, coordinateOrigin, origin).every(value => value === 0)
          ).toBe(true);
        }
      }
    } finally {
      buffer.destroy();
      model.destroy();
      framebuffer.destroy();
      texture.destroy();
    }
  });
}
