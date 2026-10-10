// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  FireflyLayer,
  getSceneBufferCamera,
  type GlowPointLayerProps
} from '@deck.gl-community/gpu-layers';
import type {RenderPass} from '@luma.gl/core';
import {waterMaterial, riverWaterMaterial, type ShaderModule} from '@luma.gl/shadertools';
import {Matrix4} from '@math.gl/core';

type ReflectionProps = GlowPointLayerProps & {
  surfaceHeight: number;
  surfaceRipples: number;
  surfaceBounds: [number, number, number, number];
};

/** Flat-water mirror adapter: borrows the same sprites, clock, pulse and tint as the source layer. */
export class RiverFireflyReflectionLayer extends FireflyLayer {
  static override layerName = 'RiverFireflyReflectionLayer';
  declare readonly props: FireflyLayer['props'] &
    Pick<ReflectionProps, 'surfaceHeight' | 'surfaceBounds' | 'surfaceRipples'>;
  constructor(props: ReflectionProps) {
    super(props);
  }
  override getShaders(shaders: {source: string; modules: ShaderModule[]}) {
    return super.getShaders({
      ...shaders,
      source: SOURCE,
      vs: VERTEX_SHADER,
      fs: FRAGMENT_SHADER,
      modules: [...shaders.modules, riverMirror, waterMaterial, riverWaterMaterial]
    });
  }
  override draw(options: {renderPass: RenderPass}): void {
    const camera = getSceneBufferCamera(this.context.viewport, this.props.coordinateOrigin);
    const viewProjection = new Matrix4(camera.projectionMatrix).multiplyRight(camera.viewMatrix);
    const canvas = this.context.device.getCanvasContext();
    this.state.model.shaderInputs.setProps({
      waterMaterial: {
        mapping: 'uv',
        coordinateScale: [0.08, 0.08],
        normalStrength: this.props.surfaceRipples,
        waveASpeed: 1.1,
        waveBSpeed: -0.7,
        time: typeof this.props.time === 'function' ? this.props.time() : this.props.time
      },
      riverWaterMaterial: {enabled: 1, flowDirection: [0, 1]},
      riverMirror: {
        viewProjection,
        inverseViewProjection: new Matrix4(viewProjection).invert(),
        surfaceHeight: this.props.surfaceHeight,
        surfaceBounds: this.props.surfaceBounds,
        textureSize: canvas.getDrawingBufferSize()
      }
    });
    super.draw(options);
  }
}
const riverMirror = {
  name: 'riverMirror',
  source: `struct RiverMirrorUniforms {
    viewProjection: mat4x4f,
    inverseViewProjection: mat4x4f,
    surfaceBounds: vec4f,
    textureSize: vec2f,
    surfaceHeight: f32,
  };
  @group(3) @binding(auto) var<uniform> riverMirror: RiverMirrorUniforms;
  fn riverMirror_getPosition(position: vec3f) -> vec3f {
    return vec3f(position.xy, 2.0 * riverMirror.surfaceHeight - position.z);
  }`,
  vs: `layout(std140) uniform riverMirrorUniforms {
    mat4 viewProjection;
    mat4 inverseViewProjection;
    vec4 surfaceBounds;
    vec2 textureSize;
    float surfaceHeight;
  } riverMirror;`,
  fs: `layout(std140) uniform riverMirrorUniforms {
    mat4 viewProjection;
    mat4 inverseViewProjection;
    vec4 surfaceBounds;
    vec2 textureSize;
    float surfaceHeight;
  } riverMirror;`,
  uniformTypes: {
    viewProjection: 'mat4x4<f32>',
    inverseViewProjection: 'mat4x4<f32>',
    surfaceBounds: 'vec4<f32>',
    textureSize: 'vec2<f32>',
    surfaceHeight: 'f32'
  },
  defaultUniforms: {
    viewProjection: new Matrix4(),
    inverseViewProjection: new Matrix4(),
    surfaceBounds: [-85, -625, 85, 625],
    textureSize: [1, 1],
    surfaceHeight: 0
  }
} as const satisfies ShaderModule;

const SOURCE = /* wgsl */ `
struct MirrorVertex {
  @builtin(position) position: vec4f,
  @location(0) coordinates: vec2f,
  @location(1) tint: vec3f,
  @location(2) opacity: f32,
  @location(3) velocity: vec2f,
};
@vertex fn vertexMain(@location(0) corner: vec2f,
  @location(1) position: vec3f, @location(2) tint: vec3f,
  @location(3) opacity: f32, @location(4) featureIndex: f32
) -> MirrorVertex {
  let current = riverMirror_getPosition(firefly_getPosition(position, featureIndex, firefly.time));
  let previous = riverMirror_getPosition(firefly_getPosition(position, featureIndex, motionBuffer.previousTime));
  let center = project_position_to_clipspace(current, vec3f(0.0), vec3f(0.0));
  let previousClip = project_position_to_clipspace(previous, vec3f(0.0), vec3f(0.0));
  let offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  var output: MirrorVertex;
  output.position = vec4f(center.xy + offset * center.w, center.z, center.w);
  output.coordinates = corner;
  output.tint = tint;
  output.opacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  output.velocity = motionBuffer_getVelocity(center, previousClip);
  return output;
}
struct MirrorFragment {
  @location(0) color: vec4f,
  @builtin(frag_depth) depth: f32,
};
@fragment fn fragmentMain(input: MirrorVertex) -> MirrorFragment {
  // Intersect this pixel's camera ray with the real water plane. This clips the mirror to the river,
  // while writing the water depth lets foreground bridges and buildings occlude reflected sprites.
  let coordinate = input.position.xy / riverMirror.textureSize;
  let clipCoordinate = coordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0);
  let nearPoint = riverMirror.inverseViewProjection * vec4f(clipCoordinate, 0.0, 1.0);
  let farPoint = riverMirror.inverseViewProjection * vec4f(clipCoordinate, 1.0, 1.0);
  let start = nearPoint.xyz / nearPoint.w;
  let direction = farPoint.xyz / farPoint.w - start;
  if (abs(direction.z) < 0.00001) { discard; }
  let distance = (riverMirror.surfaceHeight - start.z) / direction.z;
  if (distance < 0.0 || distance > 1.0) { discard; }
  let surface = start + direction * distance;
  if (any(surface.xy < riverMirror.surfaceBounds.xy) || any(surface.xy > riverMirror.surfaceBounds.zw)) { discard; }
  let surfaceClip = riverMirror.viewProjection * vec4f(surface, 1.0);
  var output: MirrorFragment;
  output.depth = clamp(surfaceClip.z / surfaceClip.w - 0.000001, 0.0, 1.0);
  if (motionBuffer.enabled != 0) {
    if (length(input.coordinates) > 0.35) { discard; }
    output.color = vec4f(input.velocity, 0.0, 1.0);
  } else {
    let commonPosition = project_position_to_clipspace_and_commonspace(surface, vec3f(0.0), vec3f(0.0)).commonPosition;
    let normal = riverWater_getNormal(commonPosition.xyz, surface, project_normal(vec3f(0.0, 0.0, 1.0)), surface.xy);
    let rippleOffset = normal.xy * 3.0;
    output.color = vec4f(pointGlow_getColor(input.coordinates + rippleOffset, input.tint) * input.opacity, 1.0);
  }
  return output;
}
`;

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 corner; in vec3 position; in vec3 tint; in float opacity; in float featureIndex;
out vec2 coordinates; out vec3 reflectionTint; out float reflectionOpacity;
void main() {
  vec3 reflected = firefly_getPosition(position, featureIndex, firefly.time);
  reflected.z = 2.0 * riverMirror.surfaceHeight - reflected.z;
  vec4 commonPosition;
  vec4 center = project_position_to_clipspace(reflected, vec3(0.0), vec3(0.0), commonPosition);
  vec2 offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  gl_Position = vec4(center.xy + offset * center.w, center.z, center.w);
  coordinates = corner;
  reflectionTint = tint;
  reflectionOpacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 coordinates; in vec3 reflectionTint; in float reflectionOpacity; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  vec2 coordinate = vec2(gl_FragCoord.x, riverMirror.textureSize.y - gl_FragCoord.y) / riverMirror.textureSize;
  vec2 clipCoordinate = coordinate * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  vec4 nearPoint = riverMirror.inverseViewProjection * vec4(clipCoordinate, 0.0, 1.0);
  vec4 farPoint = riverMirror.inverseViewProjection * vec4(clipCoordinate, 1.0, 1.0);
  vec3 start = nearPoint.xyz / nearPoint.w;
  vec3 direction = farPoint.xyz / farPoint.w - start;
  if (abs(direction.z) < 0.00001) discard;
  float distance = (riverMirror.surfaceHeight - start.z) / direction.z;
  if (distance < 0.0 || distance > 1.0) discard;
  vec3 surface = start + direction * distance;
  if (any(lessThan(surface.xy, riverMirror.surfaceBounds.xy)) || any(greaterThan(surface.xy, riverMirror.surfaceBounds.zw))) discard;
  vec4 surfaceClip = riverMirror.viewProjection * vec4(surface, 1.0);
  gl_FragDepth = clamp(surfaceClip.z / surfaceClip.w - 0.000001, 0.0, 1.0);
  vec3 normal = riverWater_getNormal(surface, surface, vec3(0.0, 0.0, 1.0), surface.xy);
  fragColor = vec4(pointGlow_getColor(coordinates + normal.xy * 3.0, reflectionTint) * reflectionOpacity, 1.0);
}`;
