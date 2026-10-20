// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {GLSLShaderAssembler} from '@luma.gl/shadertools';
import {COORDINATE_SYSTEM, project32} from '@deck.gl/core';

import {createRenderTarget} from './utils';
import {mercatorCommonToLngLat} from '../utils/projection-utils';

import type {Device, Framebuffer, Parameters, RenderPass, Texture} from '@luma.gl/core';
import type {ProjectProps} from '@deck.gl/core';
import type {Bounds} from '../utils/projection-utils';

/** Vertices along each side of the grid */
const GRID_SIZE = 256;

const vs = /* glsl */ `\
#version 300 es
in vec2 positions;
in vec2 texCoords;
uniform highp sampler2D heightMap;
out vec2 vTexCoords;

void main() {
  vTexCoords = texCoords;
  float elevation = texture(heightMap, texCoords).r;
  vec3 position = project_position(vec3(positions, elevation));
  gl_Position = project_common_position_to_clipspace(vec4(position, 1.0));
}
`;

const fs = /* glsl */ `\
#version 300 es
precision highp float;
uniform sampler2D pickingCover;
in vec2 vTexCoords;
out vec4 fragColor;

void main() {
  vec4 pickingColor = texture(pickingCover, vTexCoords);
  if (pickingColor.a == 0.0) {
    discard;
  }
  fragColor = pickingColor;
}
`;

/**
 * Stands in for terrain drawn by another renderer in the picking buffer, so that the layers draped
 * over it can be picked: a grid raised by the height map, showing the draped layers' picking colors.
 */
export class TerrainPickingSurface {
  private model: Model;
  private positions: Buffer;
  private texCoords: Buffer;
  private indices: Buffer;
  private pickingCover: Framebuffer;
  private bounds: Bounds | null = null;

  constructor(device: Device) {
    this.pickingCover = createRenderTarget(device, {
      id: 'terrain-picking-surface',
      interpolate: false
    });
    this.positions = device.createBuffer({
      usage: Buffer.VERTEX | Buffer.COPY_DST,
      byteLength: GRID_SIZE * GRID_SIZE * 2 * 4
    });
    this.texCoords = device.createBuffer({usage: Buffer.VERTEX, data: getTexCoords()});
    this.indices = device.createBuffer({
      usage: Buffer.INDEX,
      indexType: 'uint16',
      data: getIndices()
    });
    this.model = new Model(device, {
      id: 'terrain-picking-surface',
      vs,
      fs,
      modules: [project32],
      // Without the default modules of layers, such as the terrain module
      shaderAssembler: new GLSLShaderAssembler(),
      topology: 'triangle-list',
      bufferLayout: [
        {name: 'positions', format: 'float32x2'},
        {name: 'texCoords', format: 'float32x2'}
      ],
      attributes: {positions: this.positions, texCoords: this.texCoords},
      indexBuffer: this.indices,
      vertexCount: (GRID_SIZE - 1) * (GRID_SIZE - 1) * 6
    });
  }

  /** Returns the framebuffer for the draped layers' picking colors, covering the height map */
  getPickingCover(width: number, height: number): Framebuffer {
    this.pickingCover.resize({width: Math.ceil(width), height: Math.ceil(height)});
    return this.pickingCover;
  }

  /** Lays the grid over `bounds` in Web Mercator common space, like the height map */
  setBounds(bounds: Bounds): void {
    if (this.bounds?.every((value, i) => value === bounds[i])) {
      return;
    }
    this.bounds = bounds;
    const [minX, minY, maxX, maxY] = bounds;
    // Longitude only depends on x, and latitude only on y
    const lngs: number[] = [];
    const lats: number[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const t = i / (GRID_SIZE - 1);
      lngs.push(mercatorCommonToLngLat([minX + (maxX - minX) * t, minY])[0]);
      lats.push(mercatorCommonToLngLat([minX, minY + (maxY - minY) * t])[1]);
    }
    const positions = new Float32Array(GRID_SIZE * GRID_SIZE * 2);
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let column = 0; column < GRID_SIZE; column++) {
        positions[(row * GRID_SIZE + column) * 2] = lngs[column];
        positions[(row * GRID_SIZE + column) * 2 + 1] = lats[row];
      }
    }
    this.positions.write(positions);
  }

  /** Draws the surface in the picking pass, with the parameters of the layer that draws it */
  draw({
    renderPass,
    parameters,
    project,
    heightMap
  }: {
    renderPass: RenderPass;
    parameters: Parameters;
    project: ProjectProps;
    heightMap: Texture;
  }): void {
    this.model.setBindings({
      heightMap,
      pickingCover: this.pickingCover.colorAttachments[0].texture
    });
    this.model.shaderInputs.setProps({
      project: {
        ...project,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        coordinateOrigin: [0, 0, 0],
        modelMatrix: null
      }
    });
    this.model.setParameters({
      ...parameters,
      // Keeps the layer index that the picking cover holds in its alpha
      blendAlphaSrcFactor: 'one',
      // Objects on the ground stay in front, and the terrain doesn't hide anything
      depthBias: 1,
      depthBiasSlopeScale: 1,
      depthWriteEnabled: false
    });
    this.model.draw(renderPass);
  }

  delete(): void {
    this.model.destroy();
    this.positions.destroy();
    this.texCoords.destroy();
    this.indices.destroy();
    this.pickingCover.colorAttachments[0].destroy();
    this.pickingCover.destroy();
  }
}

function getTexCoords(): Float32Array {
  const texCoords = new Float32Array(GRID_SIZE * GRID_SIZE * 2);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let column = 0; column < GRID_SIZE; column++) {
      texCoords[(row * GRID_SIZE + column) * 2] = column / (GRID_SIZE - 1);
      texCoords[(row * GRID_SIZE + column) * 2 + 1] = row / (GRID_SIZE - 1);
    }
  }
  return texCoords;
}

function getIndices(): Uint16Array {
  const indices = new Uint16Array((GRID_SIZE - 1) * (GRID_SIZE - 1) * 6);
  let i = 0;
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let column = 0; column < GRID_SIZE - 1; column++) {
      const corner = row * GRID_SIZE + column;
      indices.set(
        [
          corner,
          corner + 1,
          corner + GRID_SIZE,
          corner + 1,
          corner + GRID_SIZE + 1,
          corner + GRID_SIZE
        ],
        i
      );
      i += 6;
    }
  }
  return indices;
}
