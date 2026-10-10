// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  _GlobeViewport,
  type DefaultProps,
  type LayerContext,
  type LayerProps,
  type Viewport
} from '@deck.gl/core';
import type {Buffer, RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {pointGlow, type ShaderModule} from '@luma.gl/shadertools';
import {type NumberArray3, type NumberArray4} from '@math.gl/core';
import type {SkyObserver} from '@math.gl/sun';
import {getSkyObserver, getSkyProjectionMatrix} from './sky-coordinates';

export type SkyBodyLayerProps = LayerProps & {
  /** Direction toward the body in local east, north, up axes on a flat map. */
  direction?: Readonly<NumberArray3>;
  /** Astronomy time. Supply a changing timestamp to animate the sky. */
  timestamp?: number | Date;
  /** Defaults to coordinateOrigin, or the viewport location when no origin is supplied. */
  observer?: SkyObserver;
  /** Reference disk radius in CSS pixels; MoonLayer can scale it with lunar distance. */
  radiusPixels?: number;
  color?: [number, number, number, number];
};

const skyBody = {
  name: 'skyBody',
  uniformTypes: {
    center: 'vec4<f32>',
    color: 'vec4<f32>',
    offset: 'vec2<f32>',
    moon: 'f32',
    phase: 'f32',
    limbAngle: 'f32'
  },
  source: `struct skyBodyUniforms {
    center: vec4f,
    color: vec4f,
    offset: vec2f,
    moon: f32,
    phase: f32,
    limbAngle: f32,
  }; @group(3) @binding(auto) var<uniform> skyBody: skyBodyUniforms;`,
  vs: `layout(std140) uniform skyBodyUniforms {
    vec4 center;
    vec4 color;
    vec2 offset;
    float moon;
    float phase;
    float limbAngle;
  } skyBody;`,
  fs: `layout(std140) uniform skyBodyUniforms {
    vec4 center;
    vec4 color;
    vec2 offset;
    float moon;
    float phase;
    float limbAngle;
  } skyBody;`
} as const satisfies ShaderModule;

/** Shared far-plane billboard. The view translation never affects celestial directions. */
export class SkyBodyLayer<Props extends SkyBodyLayerProps> extends Layer<Props> {
  static override layerName = 'SkyBodyLayer';
  static override defaultProps: DefaultProps<SkyBodyLayerProps> = {
    direction: undefined,
    timestamp: undefined,
    observer: undefined,
    radiusPixels: {type: 'number', value: 12, min: 0},
    color: {type: 'color', value: [255, 235, 170, 255]},
    pickable: false,
    parameters: {
      depthCompare: 'less-equal',
      depthWriteEnabled: false,
      cullMode: 'none',
      blend: true,
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one-minus-src-alpha',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one-minus-src-alpha'
    }
  };
  declare state: {model: Model; corners: Buffer};
  protected getObserver(): SkyObserver {
    return getSkyObserver(this.context.viewport, this.props.observer, this.props.coordinateOrigin);
  }
  protected getBodyDirection(): Readonly<NumberArray3> {
    return this.props.direction ?? [0, 1, 0.15];
  }
  protected getBodyRadius(): number {
    return this.props.radiusPixels ?? 0;
  }
  protected getBodyColor(): NumberArray3 {
    const color = this.props.color ?? [255, 235, 170, 255];
    return [color[0] / 255, color[1] / 255, color[2] / 255];
  }
  protected getBodySettings() {
    return {moon: 0, phase: 0.5, limbAngle: 0, halo: 0.3};
  }

  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext): void {
    const corners = device.createBuffer({
      data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    });
    try {
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [picking, pointGlow, skyBody]
        }),
        id: `${this.id}-sky-body`,
        topology: 'triangle-list',
        vertexCount: 6,
        bufferLayout: [{name: 'corner', format: 'float32x2'}],
        attributes: {corner: corners},
        parameters: {
          depthCompare: 'less-equal',
          depthWriteEnabled: false,
          cullMode: 'none',
          blend: true,
          blendColorSrcFactor: 'one',
          blendColorDstFactor: 'one-minus-src-alpha',
          blendAlphaSrcFactor: 'one',
          blendAlphaDstFactor: 'one-minus-src-alpha'
        }
      });
      this.setState({model, corners});
    } catch (error) {
      corners.destroy();
      throw error;
    }
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const center = getSkyBodyClipPosition(
      this.context.viewport,
      this.getBodyDirection(),
      this.props.coordinateOrigin,
      this.getObserver()
    );
    const radiusPixels = this.getBodyRadius();
    if (!center || !radiusPixels) return;
    const settings = this.getBodySettings();
    const extent = settings.moon ? 1 : 3;
    const viewport = this.context.viewport;
    const color = this.props.color ?? [255, 235, 170, 255];
    this.state.model.shaderInputs.setProps({
      skyBody: {
        center,
        color: [...this.getBodyColor(), (color[3] / 255) * this.props.opacity],
        offset: [
          (2 * radiusPixels * extent) / viewport.width,
          (2 * radiusPixels * extent) / viewport.height
        ],
        moon: settings.moon,
        phase: settings.phase,
        limbAngle: settings.limbAngle
      },
      pointGlow: {coreRadius: 0, coreIntensity: 0, haloIntensity: settings.halo, falloff: 6}
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    this.state.corners?.destroy();
    super.finalizeState(context);
  }
}

/** Projects an infinite ENU sky direction through either map or globe perspective cameras. */
export function getSkyBodyClipPosition(
  viewport: Viewport,
  direction: Readonly<NumberArray3>,
  coordinateOrigin: Readonly<NumberArray3> = [0, 0, 0],
  observer?: SkyObserver
): NumberArray4 | null {
  if (
    (!(viewport instanceof _GlobeViewport) && direction[2] <= 0) ||
    viewport.projectionMatrix[15] !== 0
  )
    return null;
  const clip = getSkyProjectionMatrix(
    viewport,
    getSkyObserver(viewport, observer, coordinateOrigin)
  ).transform([direction[0], direction[1], direction[2], 0]);
  if (clip[3] <= 0) return null;
  return [clip[0] / clip[3], clip[1] / clip[3], 1, 1];
}

const SOURCE = /* wgsl */ `
struct SkyVertex { @builtin(position) position: vec4f, @location(0) coordinate: vec2f };
@vertex fn vertexMain(@location(0) corner: vec2f) -> SkyVertex {
  var output: SkyVertex;
  output.position = vec4f(skyBody.center.xy + corner * skyBody.offset, 1.0, 1.0);
  output.coordinate = corner * select(3.0, 1.0, skyBody.moon > 0.5);
  return output;
}
@fragment fn fragmentMain(input: SkyVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  let radius = length(input.coordinate);
  let edge = max(fwidth(radius), 0.0001);
  let disk = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius);
  var color = skyBody.color.rgb;
  var alpha = disk;
  if (skyBody.moon > 0.5) {
    if (radius > 1.0 + edge) { discard; }
    let cosine = cos(skyBody.limbAngle);
    let sine = sin(skyBody.limbAngle);
    let coordinate = vec2f(cosine * input.coordinate.x + sine * input.coordinate.y,
      -sine * input.coordinate.x + cosine * input.coordinate.y);
    let normal = vec3f(coordinate, sqrt(max(0.0, 1.0 - radius * radius)));
    let angle = skyBody.phase * 6.28318530718;
    let illumination = max(0.0, dot(normal, vec3f(sin(angle), 0.0, -cos(angle))));
    let maria = 0.88 + 0.08 * sin(coordinate.x * 11.0 + sin(coordinate.y * 8.0)) *
      cos(coordinate.y * 13.0 - coordinate.x * 3.0);
    color *= maria * (0.045 + 0.955 * sqrt(illumination));
  } else {
    let halo = pointGlow_getColor(input.coordinate / 3.0, vec3f(1.0));
    color *= disk + halo.r;
    alpha = clamp(disk + halo.r, 0.0, 1.0);
    // RGB is already premultiplied by the disk/halo coverage.
    return vec4f(color * skyBody.color.a, alpha * skyBody.color.a);
  }
  return vec4f(color * alpha * skyBody.color.a, alpha * skyBody.color.a);
}`;

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 corner; out vec2 coordinate;
void main() {
  gl_Position = vec4(skyBody.center.xy + corner * skyBody.offset, 1.0, 1.0);
  coordinate = corner * (skyBody.moon > 0.5 ? 1.0 : 3.0);
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 coordinate; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  float radius = length(coordinate);
  float edge = max(fwidth(radius), 0.0001);
  float disk = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius);
  vec3 color = skyBody.color.rgb;
  float alpha = disk;
  if (skyBody.moon > 0.5) {
    if (radius > 1.0 + edge) discard;
    float cosine = cos(skyBody.limbAngle), sine = sin(skyBody.limbAngle);
    vec2 surface = vec2(cosine * coordinate.x + sine * coordinate.y,
      -sine * coordinate.x + cosine * coordinate.y);
    vec3 normal = vec3(surface, sqrt(max(0.0, 1.0 - radius * radius)));
    float angle = skyBody.phase * 6.28318530718;
    float illumination = max(0.0, dot(normal, vec3(sin(angle), 0.0, -cos(angle))));
    float maria = 0.88 + 0.08 * sin(surface.x * 11.0 + sin(surface.y * 8.0)) *
      cos(surface.y * 13.0 - surface.x * 3.0);
    color *= maria * (0.045 + 0.955 * sqrt(illumination));
  } else {
    float halo = pointGlow_getColor(coordinate / 3.0, vec3(1.0)).r;
    color *= disk + halo;
    alpha = clamp(disk + halo, 0.0, 1.0);
    fragColor = vec4(color * skyBody.color.a, alpha * skyBody.color.a);
    return;
  }
  fragColor = vec4(color * alpha * skyBody.color.a, alpha * skyBody.color.a);
}`;
