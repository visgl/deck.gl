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
import {assert, type Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import type {FlowParticleStepResult} from '@luma.gl/experimental';
import {flowStreak, SOURCE, VERTEX_SHADER, FRAGMENT_SHADER} from './flow-particle-layer-shaders';

export type FlowParticleLayerProps = LayerProps & {
  /** Borrowed simulation output, or a getter for simulations advanced just before drawing.
   * The layer reads the getter at draw time and never advances or destroys the simulation.
   */
  particles: FlowParticleStepResult | (() => FlowParticleStepResult);
  particleCount: number;
  /** Field bounds in this layer's coordinate system. */
  bounds: readonly [number, number, number, number];
  widthPixels?: number;
  /** Displayed motion extrapolation in seconds, not a retained curved particle trail. */
  trailSeconds?: number;
  altitude?: number;
  /** Linear RGBA components in [0, 1]. */
  color?: readonly [number, number, number, number];
};

const PARAMETERS = {
  depthCompare: 'less-equal',
  depthWriteEnabled: false,
  cullMode: 'none',
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

/** Draws GPU state textures as depth-tested screen-width streaks with stable particle picking. */
export class FlowParticleLayer extends Layer<FlowParticleLayerProps> {
  static override layerName = 'FlowParticleLayer';
  static override defaultProps = {
    // Streak altitude controls occlusion; Deck's default layer offset can pull water above bridges.
    getPolygonOffset: () => [0, 0],
    widthPixels: {type: 'number', value: 1.5, min: 0},
    trailSeconds: {type: 'number', value: 1, min: 0},
    altitude: {type: 'number', value: 1},
    color: [0.4, 0.9, 1, 0.9],
    parameters: PARAMETERS
  };
  declare state: {model: Model; corners: Buffer};
  override getAttributeManager() {
    return null;
  }
  override getNumInstances(): number {
    return this.props.particleCount;
  }
  override initializeState({device}: LayerContext): void {
    const particles = this.getParticles();
    const corners = device.createBuffer({
      data: new Float32Array([0, -1, 1, -1, 0, 1, 0, 1, 1, -1, 1, 1])
    });
    try {
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [project32, picking, flowStreak]
        }),
        shaderLayout: {
          attributes: [],
          bindings: [
            {
              name: 'flowState',
              type: 'texture',
              group: 3,
              location: 1,
              sampleType: 'unfilterable-float'
            },
            {
              name: 'flowPreviousState',
              type: 'texture',
              group: 3,
              location: 2,
              sampleType: 'unfilterable-float'
            }
          ]
        },
        id: this.id,
        topology: 'triangle-list',
        vertexCount: 6,
        isInstanced: true,
        instanceCount: this.props.particleCount,
        bufferLayout: [{name: 'corner', format: 'float32x2'}],
        attributes: {corner: corners},
        bindings: {
          flowState: particles.texture,
          flowPreviousState: particles.previousTexture
        },
        parameters: PARAMETERS
      });
      this.setState({model, corners});
    } catch (error) {
      corners.destroy();
      throw error;
    }
  }
  override updateState({props}: UpdateParameters<this>): void {
    const particles = this.getParticles();
    // Stable picking IDs use the active prefix of the state textures.
    assert(
      Number.isInteger(props.particleCount) &&
        props.particleCount >= 0 &&
        props.particleCount <= particles.texture.width * particles.texture.height
    );
    this.state.model.setInstanceCount(props.particleCount);
    this.state.model.setBindings({
      flowState: particles.texture,
      flowPreviousState: particles.previousTexture
    });
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const particles = this.getParticles();
    this.state.model.setBindings({
      flowState: particles.texture,
      flowPreviousState: particles.previousTexture
    });
    const bounds = [
      this.props.bounds[0],
      this.props.bounds[1],
      this.props.bounds[2] - this.props.bounds[0],
      this.props.bounds[3] - this.props.bounds[1]
    ];
    this.state.model.shaderInputs.setProps({
      flowStreak: {
        bounds: bounds.map(Math.fround),
        boundsLow: bounds.map(value => value - Math.fround(value)),
        appearance: [
          this.props.widthPixels,
          Math.min(600, this.props.trailSeconds! / Math.max(particles.stateDeltaTime, 1 / 600)),
          this.props.altitude,
          this.props.opacity
        ],
        color: this.props.color
      }
    });
    this.state.model.draw(renderPass);
  }
  private getParticles(): FlowParticleStepResult {
    return typeof this.props.particles === 'function'
      ? this.props.particles()
      : this.props.particles;
  }
  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    info.object = info.index >= 0 ? {id: info.index} : null;
    return info;
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    this.state.corners?.destroy();
    super.finalizeState(context);
  }
}
