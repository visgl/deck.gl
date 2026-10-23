// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {LayerExtension, project} from '@deck.gl/core';

import type {Layer} from '@deck.gl/core';
import {projectBoundsToFlatCommon, TILE_SIZE} from '../utils/projection-utils';

const defaultProps = {
  clipBounds: [0, 0, 1, 1],
  clipByInstance: undefined
};

export type ClipExtensionProps = {
  /** Rectangular bounds to be used for clipping the rendered region, in `[left, bottom, right, top]`.
   * @default [0, 0, 1, 1]
   */
  clipBounds?: Readonly<[number, number, number, number]>;
  /**
   * Controls whether an object is clipped by its anchor (e.g. icon, point) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  clipByInstance?: boolean;
};

const shaderFunction = /* glsl */ `
layout(std140) uniform clipUniforms {
  vec4 bounds;
  float worldWidth;
} clip;

bool clip_isInBounds(vec2 position) {
  return position.x >= clip.bounds[0] && position.y >= clip.bounds[1] && position.x < clip.bounds[2] && position.y < clip.bounds[3];
}

// Geometry mode: move a flat position to the world copy nearest the bounds centre before the test,
// so bounds that cross the antimeridian (right edge unwrapped past one world width) clip correctly
bool clip_isGeometryInBounds(vec2 position) {
  if (clip.worldWidth > 0.0) {
    float centerX = 0.5 * (clip.bounds[0] + clip.bounds[2]);
    position.x -= clip.worldWidth * floor((position.x - centerX) / clip.worldWidth + 0.5);
  }
  return clip_isInBounds(position);
}
`;

export type ClipModuleProps = {
  bounds: Readonly<[number, number, number, number]>;
  /** Width of one world copy in flat common space; 0 disables wrapping */
  worldWidth: number;
};

type WebGPUClipModuleProps = ClipModuleProps & {
  enabled?: boolean;
  mode?: 'instance' | 'geometry';
};

/*
 * The vertex-shader version clips geometries by their anchor position
 * e.g. ScatterplotLayer - show if the center of a circle is within bounds
 */
const shaderModuleVs: ShaderModule<ClipModuleProps> = {
  name: 'clip',
  vs: shaderFunction,
  uniformTypes: {
    bounds: 'vec4<f32>',
    worldWidth: 'f32'
  }
};

const injectionVs = {
  'vs:#decl': /* glsl */ `
out float clip_isVisible;
`,
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));
`,
  'fs:#decl': /* glsl */ `
in float clip_isVisible;
`,
  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
  if (clip_isVisible < 0.5) discard;
`
};

/*
 * The fragment-shader version clips pixels at the bounds
 * e.g. PolygonLayer - show the part of the polygon that intersect with the bounds
 */
const shaderModuleFs: ShaderModule<ClipModuleProps> = {
  name: 'clip',
  // The vertex injection below calls project_common_position_to_flat_continuous()
  dependencies: [project],
  fs: shaderFunction,
  uniformTypes: {
    bounds: 'vec4<f32>',
    worldWidth: 'f32'
  }
};

const injectionFs = {
  'vs:#decl': /* glsl */ `
out vec2 clip_commonPosition;
`,
  // Flat (Mercator / cartesian) common space, so that the position can be compared with the
  // bounds produced by projectBoundsToFlatCommon() in every projection mode, including globe.
  // Continuous within each triangle (the globe seam is moved opposite the camera); the fragment
  // stage wraps about the bounds centre, which a per-vertex wrap would tear 180° from the bounds.
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  clip_commonPosition = project_common_position_to_flat_continuous(
    geometry.position, project_common_position_to_flat(project.cameraPosition).x
  );
`,
  'fs:#decl': /* glsl */ `
in vec2 clip_commonPosition;
`,
  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
  if (!clip_isGeometryInBounds(clip_commonPosition)) discard;
`
};

/** Adds support for clipping rendered layers by rectangular bounds. */
export default class ClipExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'ClipExtension';

  getShaders(this: Layer<ClipExtensionProps>) {
    // If `clipByInstance: true`, the entire object is shown/hidden based on its anchor position (done by vertex shader)
    // Otherwise, the object is trimmed by the clip bounds (done by fragment shader)

    // Default behavior: consider a layer instanced if it has attribute `instancePositions`
    let clipByInstance = 'instancePositions' in this.getAttributeManager()!.attributes;
    // Users can override by setting the `clipByInstance` prop
    if (this.props.clipByInstance !== undefined) {
      clipByInstance = Boolean(this.props.clipByInstance);
    }
    this.state.clipByInstance = clipByInstance;

    if (this.context.device.type === 'webgpu') {
      return {};
    }

    return clipByInstance
      ? {
          modules: [shaderModuleVs],
          inject: injectionVs
        }
      : {
          modules: [shaderModuleFs],
          inject: injectionFs
        };
  }

  /* eslint-disable camelcase */
  draw(this: Layer<Required<ClipExtensionProps>>): void {
    const {clipBounds} = this.props;
    const {viewport} = this.context;
    const clipProps = {worldWidth: 0} as WebGPUClipModuleProps;
    if (this.state.clipByInstance) {
      // Instance shaders see packed attributes. Match their CPU conversion when
      // the layer source CRS needs preprojection (e.g. tile-local MVT positions).
      const transform = this.usePositionTransforms().transform;
      if (transform) {
        const corner0 = transform.call(this, [clipBounds[0], clipBounds[1], 0]);
        const corner1 = transform.call(this, [clipBounds[2], clipBounds[3], 0]);
        clipProps.bounds = [
          Math.min(corner0[0], corner1[0]),
          Math.min(corner0[1], corner1[1]),
          Math.max(corner0[0], corner1[0]),
          Math.max(corner0[1], corner1[1])
        ];
      } else {
        clipProps.bounds = clipBounds;
      }
    } else {
      // Pairs with project_common_position_to_flat_continuous() in the vertex shader
      clipProps.bounds = projectBoundsToFlatCommon(this, clipBounds);
      if (viewport.isGeospatial && !project.isCustomProjection(viewport)) {
        clipProps.worldWidth = TILE_SIZE;
      }
    }

    if (this.context.device.type === 'webgpu') {
      clipProps.enabled = true;
      clipProps.mode = this.state.clipByInstance ? 'instance' : 'geometry';
    }

    this.setShaderModuleProps({clip: clipProps});
  }
}
