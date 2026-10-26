// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {
  Model,
  makeStrokeGeometry,
  type StrokeGeometryOptions,
  type StrokePosition
} from '@luma.gl/engine';
import {
  pathDash,
  pointGlow,
  sketchStroke,
  type PathDashProps,
  type ShaderModule
} from '@luma.gl/shadertools';

export type StrokeAppearance = 'plain' | 'sketch' | 'glow';
export type Route = {
  name: string;
  path: readonly StrokePosition[];
  color: [number, number, number];
  closed?: boolean;
  /** Stable feature seed. Defaults to a hash of the name, independent of array order. */
  seed?: number;
};
type StrokeMeshLayerProps = LayerProps & {
  routes: readonly Route[];
  geometryOptions: StrokeGeometryOptions;
  dash: PathDashProps;
  appearance: StrokeAppearance;
  grain: number;
  glowIntensity: number;
};

const strokeStyle = {
  name: 'strokeStyle',
  bindingLayout: [{name: 'strokeStyle', group: 3}],
  source: `struct StrokeStyleUniforms {
  width: f32,
  appearance: f32,
  cap: f32,
  intensity: f32,
};
@group(3) @binding(auto) var<uniform> strokeStyle: StrokeStyleUniforms;`,
  fs: `layout(std140) uniform strokeStyleUniforms {
  float width;
  float appearance;
  float cap;
  float intensity;
} strokeStyle;`,
  uniformTypes: {width: 'f32', appearance: 'f32', cap: 'f32', intensity: 'f32'},
  defaultUniforms: {width: 1, appearance: 0, cap: 0, intensity: 1}
} as const satisfies ShaderModule;

const STROKE_PARAMETERS = {
  depthCompare: 'less-equal',
  depthWriteEnabled: false,
  cullMode: 'none',
  blend: true,
  blendColorOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaOperation: 'add',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;
const GLOW_PARAMETERS = {
  ...STROKE_PARAMETERS,
  blendColorSrcFactor: 'one',
  blendColorDstFactor: 'one',
  blendAlphaSrcFactor: 'zero',
  blendAlphaDstFactor: 'one'
} as const;

/** Deck's WebGL render pass and the model must agree on the additive blend state. */
export function getStrokeParameters(appearance: StrokeAppearance) {
  return appearance === 'glow' ? GLOW_PARAMETERS : STROKE_PARAMETERS;
}

/** Local world-unit strokes composing shared dash, pencil, and glow shaders. */
export class StrokeMeshLayer extends Layer<StrokeMeshLayerProps> {
  static override layerName = 'StrokeMeshLayer';
  declare state: {model?: Model; vertices?: Buffer};
  override getAttributeManager() {
    return null;
  }
  override initializeState(): void {}
  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (
      this.state.model &&
      props.routes === oldProps.routes &&
      props.geometryOptions === oldProps.geometryOptions &&
      props.appearance === oldProps.appearance
    )
      return;
    this.destroyMesh();
    const mesh: number[] = [];
    const width = props.geometryOptions.width ?? 1;
    const envelopeScale = props.appearance === 'glow' ? 4 : props.appearance === 'sketch' ? 2 : 1;
    props.routes.forEach((route, featureIndex) => {
      const path = route.path.filter(
        (position, index) =>
          index === 0 ||
          position[0] !== route.path[index - 1][0] ||
          position[1] !== route.path[index - 1][1]
      );
      if (
        route.closed &&
        path.length > 1 &&
        path[0][0] === path.at(-1)![0] &&
        path[0][1] === path.at(-1)![1]
      )
        path.pop();
      const closed = Boolean(route.closed && path.length > 2);
      let length = 0;
      for (let index = 1; index < path.length + Number(closed); index++) {
        const current = path[index % path.length];
        const previous = path[index - 1];
        length += Math.hypot(current[0] - previous[0], current[1] - previous[1]);
      }
      let seed = 2166136261;
      for (const character of route.name)
        seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
      seed = route.seed ?? (seed >>> 0) % 1024;
      const geometry = makeStrokeGeometry(path, {
        ...props.geometryOptions,
        width: width * envelopeScale,
        closed
      });
      const positions = geometry.attributes['POSITION']!.value;
      const coordinates = geometry.attributes['TEXCOORD_0']!.value;
      for (let index = 0; index < positions.length / 3; index++) {
        mesh.push(
          positions[index * 3],
          positions[index * 3 + 1],
          positions[index * 3 + 2],
          coordinates[index * 2],
          coordinates[index * 2 + 1],
          ...route.color,
          featureIndex,
          length,
          seed,
          Number(closed)
        );
      }
    });
    const vertices = this.context.device.createBuffer({
      data: mesh.length ? new Float32Array(mesh) : new Float32Array(12)
    });
    try {
      const model = new Model(this.context.device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [project32, picking, pathDash, sketchStroke, pointGlow, strokeStyle]
        }),
        id: `${this.id}-mesh`,
        topology: 'triangle-list',
        vertexCount: mesh.length / 12,
        bufferLayout: [
          {
            name: 'vertices',
            byteStride: 48,
            attributes: [
              {attribute: 'position', format: 'float32x3', byteOffset: 0},
              {attribute: 'coordinates', format: 'float32x2', byteOffset: 12},
              {attribute: 'color', format: 'float32x3', byteOffset: 20},
              {attribute: 'pathInformation', format: 'float32x4', byteOffset: 32}
            ]
          }
        ],
        attributes: {vertices},
        parameters: getStrokeParameters(props.appearance)
      });
      this.setState({model, vertices});
    } catch (error) {
      vertices.destroy();
      throw error;
    }
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const width = this.props.geometryOptions.width ?? 1;
    const cap = this.props.geometryOptions.cap ?? 'butt';
    this.state.model?.shaderInputs.setProps({
      pathDash: this.props.dash,
      sketchStroke: {
        width,
        jitter: width * 0.12,
        variation: 0.35,
        grain: this.props.grain,
        // The cap-distance coordinate supplies endpoint coverage for the reserved mesh.
        extension: width,
        minimumAntialias: 0,
        sketch: 1
      },
      pointGlow: {coreRadius: 0.14, coreIntensity: 0.7, haloIntensity: 0.6, falloff: 5},
      strokeStyle: {
        width,
        appearance:
          this.props.appearance === 'glow' ? 2 : this.props.appearance === 'sketch' ? 1 : 0,
        cap: cap === 'round' ? 2 : cap === 'square' ? 1 : 0,
        intensity: this.props.glowIntensity
      }
    });
    this.state.model?.draw(renderPass);
  }
  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    info.object = this.props.routes[info.index];
    return info;
  }
  override finalizeState(context: LayerContext): void {
    this.destroyMesh();
    super.finalizeState(context);
  }
  private destroyMesh(): void {
    this.state.model?.destroy();
    this.state.vertices?.destroy();
    this.setState({model: undefined, vertices: undefined});
  }
}
const SOURCE = /* wgsl */ `
struct StrokeVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) coordinates: vec2<f32>,
  @location(3) @interpolate(flat) pathInformation: vec3<f32>,
};
@vertex fn vertexMain(@location(0) position: vec3<f32>, @location(1) coordinates: vec2<f32>,
  @location(2) color: vec3<f32>, @location(3) pathInformation: vec4<f32>) -> StrokeVertex {
  var output: StrokeVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = color;
  output.pickingColor = picking_getPickingColorFromIndex(u32(pathInformation.x));
  output.coordinates = coordinates;
  output.pathInformation = pathInformation.yzw;
  return output;
}
@fragment fn fragmentMain(input: StrokeVertex) -> @location(0) vec4<f32> {
  let pathLength = max(input.pathInformation.x, 0.0001);
  let endDistance = select(max(max(-input.coordinates.x, input.coordinates.x - pathLength), 0.0), 0.0, input.pathInformation.z > 0.5);
  var across = input.coordinates.y;
  if (strokeStyle.cap > 1.5) {
    across = select(-1.0, 1.0, across >= 0.0) * length(vec2<f32>(endDistance, across));
  } else if (strokeStyle.cap > 0.5) {
    across = select(-1.0, 1.0, across >= 0.0) * max(endDistance, abs(across));
  }
  var coverage = pathDash_getCoverage(input.coordinates.x);
  let pencil = sketchStroke_getCoverage(vec2<f32>(clamp(input.coordinates.x / pathLength, 0.0, 1.0), across), pathLength, input.pathInformation.y);
  if (strokeStyle.appearance > 0.5 && strokeStyle.appearance < 1.5) { coverage *= pencil; }
  let radiance = pointGlow_getColor(vec2<f32>(0.0, across / max(strokeStyle.width * 2.0, 0.0001)), input.color) * coverage * layer.opacity * strokeStyle.intensity;
  if (coverage <= 0.01 || layer.opacity <= 0.0 || (strokeStyle.appearance > 1.5 && strokeStyle.intensity <= 0.0)) { discard; }
  if (picking.isActive > 0.5) {
    if (strokeStyle.appearance > 1.5 && abs(across) > strokeStyle.width * 0.5) { discard; }
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = select(input.color, radiance, strokeStyle.appearance > 1.5);
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    let energy = select(1.0, max(max(color.r, color.g), color.b), strokeStyle.appearance > 1.5);
    color = mix(color, picking.highlightColor.rgb * energy, picking.highlightColor.a);
  }
  return vec4<f32>(color, select(coverage * layer.opacity, 0.0, strokeStyle.appearance > 1.5));
}
`;
const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 position;
in vec2 coordinates;
in vec3 color;
in vec4 pathInformation;
out vec4 vertexColor;
out vec2 strokeCoordinates;
flat out vec3 strokePathInformation;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(pathInformation.x);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vertexColor = vec4(color, layer.opacity);
  strokeCoordinates = coordinates;
  strokePathInformation = pathInformation.yzw;
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec4 vertexColor;
in vec2 strokeCoordinates;
flat in vec3 strokePathInformation;
out vec4 fragColor;
void main() {
  float pathLength = max(strokePathInformation.x, 0.0001);
  float endDistance = strokePathInformation.z > 0.5 ? 0.0 : max(max(-strokeCoordinates.x, strokeCoordinates.x - pathLength), 0.0);
  float across = strokeCoordinates.y;
  if (strokeStyle.cap > 1.5) across = (across >= 0.0 ? 1.0 : -1.0) * length(vec2(endDistance, across));
  else if (strokeStyle.cap > 0.5) across = (across >= 0.0 ? 1.0 : -1.0) * max(endDistance, abs(across));
  float coverage = pathDash_getCoverage(strokeCoordinates.x);
  float pencil = sketchStroke_getCoverage(vec2(clamp(strokeCoordinates.x / pathLength, 0.0, 1.0), across), pathLength, strokePathInformation.y);
  if (strokeStyle.appearance > 0.5 && strokeStyle.appearance < 1.5) coverage *= pencil;
  vec3 radiance = pointGlow_getColor(vec2(0.0, across / max(strokeStyle.width * 2.0, 0.0001)), vertexColor.rgb) * coverage * vertexColor.a * strokeStyle.intensity;
  if (coverage <= 0.01 || vertexColor.a <= 0.0 || (strokeStyle.appearance > 1.5 && strokeStyle.intensity <= 0.0)) discard;
  if (picking.isActive > 0.5 && strokeStyle.appearance > 1.5 && abs(across) > strokeStyle.width * 0.5) discard;
  if (strokeStyle.appearance > 1.5) {
    float energy = max(max(radiance.r, radiance.g), radiance.b);
    fragColor = vec4(radiance / max(energy, 0.0001), 1.0);
    DECKGL_FILTER_COLOR(fragColor, geometry);
    if (picking.isActive < 0.5) fragColor = vec4(fragColor.rgb * energy, 0.0);
  } else {
    fragColor = vec4(vertexColor.rgb, vertexColor.a * coverage);
    DECKGL_FILTER_COLOR(fragColor, geometry);
  }
}
`;
