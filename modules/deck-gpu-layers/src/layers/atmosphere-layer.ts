// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, picking, _GlobeViewport, type LayerContext, type LayerProps} from '@deck.gl/core';
import type {RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {atmosphere, type AtmosphereProps} from '@luma.gl/shadertools';
import {skyView, getSkyViewUniforms, SKY_VERTEX_SOURCE, SKY_VERTEX_SHADER} from './sky-view';

export type AtmosphereLayerProps = LayerProps & AtmosphereProps;

/** Flat-map perspective sky. Draw before celestial bodies, clouds and opaque geometry.
 * Uses metre-space east/north/up rays and does not write depth or participate in picking.
 */
export class AtmosphereLayer extends Layer<AtmosphereLayerProps> {
  static override layerName = 'AtmosphereLayer';
  static override defaultProps = {...atmosphere.defaultUniforms, pickable: false};
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
          modules: [picking, atmosphere, skyView]
        }),
        id: `${this.id}-atmosphere`,
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
      !this.props.enabled
    )
      return;
    this.state.model.shaderInputs.setProps({
      atmosphere: {
        enabled: this.props.enabled,
        sunDirection: this.props.sunDirection,
        sunIntensity: this.props.sunIntensity,
        haze: this.props.haze,
        rayleigh: this.props.rayleigh,
        planetRadius: this.props.planetRadius,
        exposure: this.props.exposure,
        groundColor: this.props.groundColor
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
  return vec4f(atmosphere_getSkyColor(skyView.camera, normalize(input.direction)) * skyView.opacity, skyView.opacity);
}`;
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec3 direction; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  fragColor = vec4(atmosphere_getSkyColor(skyView.camera, normalize(direction)) * skyView.opacity, skyView.opacity);
}`;
