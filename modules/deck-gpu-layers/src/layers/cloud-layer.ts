// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, picking, _GlobeViewport, type LayerContext, type LayerProps} from '@deck.gl/core';
import type {RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {clouds, type CloudProps} from '@luma.gl/shadertools';
import {skyView, getSkyViewUniforms, SKY_VERTEX_SOURCE, SKY_VERTEX_SHADER} from './sky-view';
export {getSkyViewUniforms as getCloudViewUniforms} from './sky-view';

export type CloudLayerProps = LayerProps & CloudProps;

/** Animated sky clouds for flat-map perspective views. Place after celestial layers and before
 * opaque scene layers. The cloud slab remains at far depth and never writes the depth buffer.
 * Cloud uniforms use local metres relative to coordinateOrigin; globe views are not supported.
 */
export class CloudLayer extends Layer<CloudLayerProps> {
  static override layerName = 'CloudLayer';
  static override defaultProps = {
    cover: {type: 'number', value: 0.45, min: 0, max: 1},
    altitude: {type: 'number', value: 1000},
    thickness: {type: 'number', value: 1200, min: 1},
    scale: {type: 'number', value: 1400, min: 1},
    density: {type: 'number', value: 0.005, min: 0},
    time: {type: 'number', value: 0},
    velocity: [14, 4],
    sunDirection: [0, 0.8, 0.6],
    sunColor: [1, 0.95, 0.85],
    pickable: false
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
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [picking, clouds, skyView]
        }),
        id: `${this.id}-clouds`,
        topology: 'triangle-list',
        vertexCount: 3,
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
      viewport instanceof _GlobeViewport ||
      viewport.projectionMatrix[15] !== 0 ||
      !this.props.cover
    )
      return;
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
      skyView: {
        ...getSkyViewUniforms(viewport, this.props.coordinateOrigin),
        opacity: this.props.opacity
      }
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
@fragment fn fragmentMain(input: SkyViewVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  return clouds_getColor(skyView.camera, normalize(input.direction)) * skyView.opacity;
}`;
const VERTEX_SHADER = SKY_VERTEX_SHADER;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec3 direction; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  fragColor = clouds_getColor(skyView.camera, normalize(direction)) * skyView.opacity;
}`;
