// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';

type ClipProps = {
  enabled?: boolean;
  mode?: 'instance' | 'geometry';
  bounds?: Readonly<[number, number, number, number]>;
  /** Width of one world copy in flat common space; 0 disables wrapping */
  worldWidth?: number;
};

type ClipUniforms = {
  enabled: number;
  mode: number;
  bounds: Readonly<[number, number, number, number]>;
  worldWidth: number;
};

const CLIP_MODE_GEOMETRY = 0;
const CLIP_MODE_INSTANCE = 1;

const source = /* wgsl */ `\
struct ClipUniforms {
  enabled: i32,
  mode: i32,
  bounds: vec4<f32>,
  worldWidth: f32,
};

@group(2) @binding(auto) var<uniform> clipUniforms: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clipUniforms.bounds.x &&
    coordinates.y >= clipUniforms.bounds.y &&
    coordinates.x < clipUniforms.bounds.z &&
    coordinates.y < clipUniforms.bounds.w;
}

// Geometry-mode coordinates: flat (Mercator / cartesian) common space, matching the bounds set by
// ClipExtension.draw() in every projection mode including globe. Continuous within each triangle
// (the globe seam is moved opposite the camera); clip_filterColor wraps about the bounds centre.
fn clip_getCoordinates(commonPosition: vec4<f32>) -> vec2<f32> {
  return project_common_position_to_flat_continuous(
    commonPosition.xyz, project_common_position_to_flat(project.cameraPosition).x
  );
}

// Move a flat position to the world copy nearest the bounds centre, so bounds that cross the
// antimeridian (right edge unwrapped past one world width) clip correctly
fn clip_isGeometryInBounds(coordinates: vec2<f32>) -> bool {
  var position = coordinates;
  if (clipUniforms.worldWidth > 0.0) {
    let centerX = 0.5 * (clipUniforms.bounds.x + clipUniforms.bounds.z);
    position.x -= clipUniforms.worldWidth * floor((position.x - centerX) / clipUniforms.worldWidth + 0.5);
  }
  return clip_isInBounds(position);
}

fn clip_filterPosition(position: ptr<function, vec4<f32>>, instanceCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${CLIP_MODE_INSTANCE} &&
    !clip_isInBounds(instanceCoordinates)
  ) {
    *position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }
}

fn clip_filterColor(geometryCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${CLIP_MODE_GEOMETRY} &&
    !clip_isGeometryInBounds(geometryCoordinates)
  ) {
    discard;
  }
}
`;

const clipExtension = {
  name: 'clip',
  source,
  props: {} as ClipProps,
  uniforms: {} as ClipUniforms,
  bindingLayout: [{name: 'clip', group: 2}],
  uniformTypes: {
    enabled: 'i32',
    mode: 'i32',
    bounds: 'vec4<f32>',
    worldWidth: 'f32'
  },
  defaultUniforms: {
    enabled: 0,
    mode: CLIP_MODE_GEOMETRY,
    bounds: [0, 0, 1, 1],
    worldWidth: 0
  },
  getUniforms(props: ClipProps = {}) {
    const uniforms: Partial<ClipUniforms> = {};
    if (props.enabled !== undefined) {
      uniforms.enabled = props.enabled ? 1 : 0;
    }
    if (props.mode !== undefined) {
      uniforms.mode = props.mode === 'instance' ? CLIP_MODE_INSTANCE : CLIP_MODE_GEOMETRY;
    }
    if (props.bounds !== undefined) {
      uniforms.bounds = props.bounds;
    }
    if (props.worldWidth !== undefined) {
      uniforms.worldWidth = props.worldWidth;
    }
    return uniforms;
  }
} as const satisfies ShaderModule<ClipProps, ClipUniforms, {}>;

export default clipExtension;
