// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {GLSLShaderAssembler} from '@luma.gl/shaders';
import {project32} from '@deck.gl/core';

import {createRenderTarget} from './utils';
import {mercatorCommonToLngLat} from '../utils/projection-utils';

import type {Device, Framebuffer, Parameters, RenderPass, Texture} from '@luma.gl/core';
import type {ProjectProps} from '@deck.gl/core';
import type {Bounds} from '../utils/projection-utils';

/**
 * Vertices along each side of the grid, which keeps its `uint16` indices below 65535, the index at
 * which WebGL 2 always restarts primitives
 */
const GRID_SIZE = 255;

const vs = /* glsl */ `\
#version 300 es
in vec2 positions;
in vec2 positions64Low;
in vec2 texCoords;
uniform highp sampler2D heightMap;
out vec2 vTexCoords;
out float vDepth;
out float vKnown;

void main() {
  vTexCoords = texCoords;
  vec4 elevation = texture(heightMap, texCoords);
  vKnown = elevation.a;
  vec3 position = project_position(vec3(positions, elevation.r), vec3(positions64Low, 0.0));
  gl_Position = project_common_position_to_clipspace(vec4(position, 1.0));
  vDepth = gl_Position.z / gl_Position.w;
}
`;

/** Shows the draped layers' picking colors where the elevation is known, like the depth pass */
const fs = /* glsl */ `\
#version 300 es
precision highp float;
uniform sampler2D pickingCover;
in vec2 vTexCoords;
in float vKnown;
out vec4 fragColor;

void main() {
  vec4 pickingColor = texture(pickingCover, vTexCoords);
  if (pickingColor.a == 0.0 || vKnown < 0.5) {
    discard;
  }
  fragColor = pickingColor;
}
`;

/** Writes the depth of the surface where the elevation is known, as layers do in the depth picking pass */
const depthFs = /* glsl */ `\
#version 300 es
precision highp float;
in float vDepth;
in float vKnown;
out vec4 fragColor;

void main() {
  if (vKnown < 0.5) {
    discard;
  }
  fragColor = vec4(vDepth, 0.0, 0.0, 1.0);
}
`;

/**
 * Stands in for terrain drawn by another renderer in the picking buffer, so that the layers draped
 * over it can be picked: a grid raised by the height map, showing the draped layers' picking colors.
 */
export class TerrainPickingSurface {
  private model: Model;
  private depthModel: Model;
  /** Longitudes and latitudes of the grid in float32 */
  private positions: Buffer;
  /** What float32 leaves out of `positions`, which grid cells at high zoom need */
  private positions64Low: Buffer;
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
    this.positions64Low = device.createBuffer({
      usage: Buffer.VERTEX | Buffer.COPY_DST,
      byteLength: GRID_SIZE * GRID_SIZE * 2 * 4
    });
    this.texCoords = device.createBuffer({usage: Buffer.VERTEX, data: getTexCoords()});
    this.indices = device.createBuffer({
      usage: Buffer.INDEX,
      indexType: 'uint16',
      data: getIndices()
    });
    this.model = this._createModel(device, 'terrain-picking-surface', fs);
    this.depthModel = this._createModel(device, 'terrain-picking-surface-depth', depthFs);
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
    const positions64Low = new Float32Array(GRID_SIZE * GRID_SIZE * 2);
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let column = 0; column < GRID_SIZE; column++) {
        const i = (row * GRID_SIZE + column) * 2;
        positions[i] = lngs[column];
        positions[i + 1] = lats[row];
        positions64Low[i] = lngs[column] - positions[i];
        positions64Low[i + 1] = lats[row] - positions[i + 1];
      }
    }
    this.positions.write(positions);
    this.positions64Low.write(positions64Low);
  }

  /**
   * Draws the surface in the picking pass, with the parameters of the layer that draws it.
   * With `depth`, it draws its depth for the picking pass that finds the coordinate of a pick.
   */
  draw({
    renderPass,
    parameters,
    project,
    heightMap,
    depth = false
  }: {
    renderPass: RenderPass;
    parameters: Parameters;
    project: ProjectProps;
    heightMap: Texture;
    depth?: boolean;
  }): void {
    const model = depth ? this.depthModel : this.model;
    model.setBindings(
      depth ? {heightMap} : {heightMap, pickingCover: this.pickingCover.colorAttachments[0].texture}
    );
    model.shaderInputs.setProps({
      project: {
        ...project,
        coordinateSystem: 'lnglat',
        coordinateOrigin: [0, 0, 0],
        modelMatrix: null
      }
    });
    model.setParameters(
      depth
        ? parameters
        : {
            ...parameters,
            // Keeps the layer index that the picking cover holds in its alpha
            blendAlphaSrcFactor: 'one',
            // Objects on the ground stay in front, and the terrain doesn't hide anything
            depthBias: 1,
            depthBiasSlopeScale: 1,
            depthWriteEnabled: false
          }
    );
    model.draw(renderPass);
  }

  delete(): void {
    this.model.destroy();
    this.depthModel.destroy();
    this.positions.destroy();
    this.positions64Low.destroy();
    this.texCoords.destroy();
    this.indices.destroy();
    this.pickingCover.colorAttachments[0].destroy();
    this.pickingCover.destroy();
  }

  private _createModel(device: Device, id: string, fragmentShader: string): Model {
    return new Model(device, {
      id,
      vs,
      fs: fragmentShader,
      modules: [project32],
      // Without the default modules of layers, such as the terrain module
      shaderAssembler: new GLSLShaderAssembler(),
      topology: 'triangle-list',
      bufferLayout: [
        {name: 'positions', format: 'float32x2'},
        {name: 'positions64Low', format: 'float32x2'},
        {name: 'texCoords', format: 'float32x2'}
      ],
      attributes: {
        positions: this.positions,
        positions64Low: this.positions64Low,
        texCoords: this.texCoords
      },
      indexBuffer: this.indices,
      vertexCount: (GRID_SIZE - 1) * (GRID_SIZE - 1) * 6
    });
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
