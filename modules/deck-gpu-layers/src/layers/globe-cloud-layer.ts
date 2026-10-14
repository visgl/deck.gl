// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, picking, _GlobeViewport, type LayerContext, type LayerProps} from '@deck.gl/core';
import type {RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {Matrix4, type NumberArray3} from '@math.gl/core';
import {
  globeClouds,
  type CloudProps,
  type GlobeCloudProps,
  type ShaderModule
} from '@luma.gl/shadertools';
import {skyView, SKY_VERTEX_SOURCE, SKY_VERTEX_SHADER} from './sky-view';

export type GlobeCloudLayerProps = LayerProps & CloudProps & GlobeCloudProps;

/** Globe-centered camera and rays in planet-radius units, independent of map longitude/latitude. */
export function getGlobeCloudViewUniforms(viewport: _GlobeViewport) {
  const commonRadius = Math.hypot(...viewport.projectPosition([0, 0, 0]));
  const inverseProjection = new Matrix4(viewport.projectionMatrix).invert();
  const inverseView = new Matrix4(viewport.viewMatrix).invert();
  function getRay(horizontal: number, vertical: number): NumberArray3 {
    const position = inverseProjection.transform([horizontal, vertical, 1, 1]);
    const direction = inverseView.transform([position[0], position[1], position[2], 0]);
    return [direction[0], direction[1], direction[2]];
  }
  const camera: NumberArray3 = [
    viewport.cameraPosition[0] / commonRadius,
    viewport.cameraPosition[1] / commonRadius,
    viewport.cameraPosition[2] / commonRadius
  ];
  return {
    camera,
    lowerLeft: getRay(-1, -1),
    lowerRight: getRay(1, -1),
    upperLeft: getRay(-1, 1),
    viewProjectionMatrix: new Matrix4(viewport.viewProjectionMatrix).scale([
      commonRadius,
      commonRadius,
      commonRadius
    ])
  };
}
const globeView = {
  name: 'globeView',
  uniformTypes: {viewProjectionMatrix: 'mat4x4<f32>'},
  source: `struct globeViewUniforms { viewProjectionMatrix: mat4x4f }; @group(3) @binding(auto) var<uniform> globeView: globeViewUniforms;`,
  vs: `layout(std140) uniform globeViewUniforms { mat4 viewProjectionMatrix; } globeView;`,
  fs: `layout(std140) uniform globeViewUniforms { mat4 viewProjectionMatrix; } globeView;`
} as const satisfies ShaderModule;

/** Animated, depth-tested spherical cloud shell for Deck GlobeView. Never writes depth or picks.
 * Shares the existing cloud density field and lighting; planet-centered XYZ replaces local ENU.
 */
export class GlobeCloudLayer extends Layer<GlobeCloudLayerProps> {
  static override layerName = 'GlobeCloudLayer';
  static override defaultProps = {
    ...globeClouds.defaultUniforms,
    cover: 0.45,
    altitude: 12000,
    thickness: 12000,
    scale: 900000,
    density: 0.0001,
    time: 0,
    velocity: [14, 4],
    sunDirection: [0, -1, 0.3],
    sunColor: [1, 0.95, 0.85],
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
  declare state: {model: Model};
  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext): void {
    this.setState({
      model: new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: SKY_VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [picking, globeClouds, skyView, globeView]
        }),
        id: `${this.id}-globe-clouds`,
        vertexCount: 3,
        topology: 'triangle-list',
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
      })
    });
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const viewport = this.context.viewport;
    if (
      !(viewport instanceof _GlobeViewport) ||
      viewport.projectionMatrix[15] !== 0 ||
      !this.props.cover
    )
      return;
    const view = getGlobeCloudViewUniforms(viewport);
    this.state.model.shaderInputs.setProps({
      clouds: {
        cover: this.props.cover,
        altitude: this.props.altitude,
        thickness: this.props.thickness,
        scale: this.props.scale,
        density: this.props.density,
        time: this.props.time,
        velocity: this.props.velocity,
        sunDirection: this.props.sunDirection,
        sunColor: this.props.sunColor
      },
      globeClouds: {planetRadius: this.props.planetRadius},
      skyView: {...view, opacity: this.props.opacity},
      globeView: {viewProjectionMatrix: view.viewProjectionMatrix}
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    super.finalizeState(context);
  }
}
const SOURCE =
  SKY_VERTEX_SOURCE +
  /* wgsl */ `
struct GlobeCloudFragment { @location(0) color: vec4f, @builtin(frag_depth) depth: f32 };
@fragment fn fragmentMain(input: SkyViewVertex) -> GlobeCloudFragment {
  if (picking.isActive > 0.5) { discard; }
  let direction = normalize(input.direction);
  let color = globeClouds_getColor(skyView.camera, direction) * skyView.opacity;
  if (color.a < 0.001) { discard; }
  let radius = 1.0 + (clouds.altitude + clouds.thickness) / globeClouds.planetRadius;
  let interval = globeClouds_intersectSphere(skyView.camera, direction, radius);
  // A camera inside the shell must still project a point in front of its eye.
  let clip = globeView.viewProjectionMatrix * vec4f(skyView.camera + direction * max(interval.x, 0.000001), 1.0);
  var output: GlobeCloudFragment;
  output.color = color;
  output.depth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);
  return output;
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec3 direction; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  vec3 rayDirection = normalize(direction);
  fragColor = globeClouds_getColor(skyView.camera, rayDirection) * skyView.opacity;
  if (fragColor.a < 0.001) discard;
  float radius = 1.0 + (clouds.altitude + clouds.thickness) / globeClouds.planetRadius;
  vec2 interval = globeClouds_intersectSphere(skyView.camera, rayDirection, radius);
  // Avoid projecting the camera itself (clip.w == 0) from inside the shell.
  vec4 clip = globeView.viewProjectionMatrix * vec4(skyView.camera + rayDirection * max(interval.x, 0.000001), 1.0);
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);
}`;
