// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ArcLayer, type ArcLayerProps} from '@deck.gl/layers';
import type {
  ArrowAccessor,
  DefaultProps,
  _ColumnDefinition as ColumnDefinition
} from '@deck.gl/core';
import type {FixedSizeList, Float32} from 'apache-arrow';
import type {ShaderModule} from '@luma.gl/shaders';

/** Time range and timestamps used to animate a set of flight arcs. */
type AnimationProps = {
  /** Departure and arrival times in seconds on the shared animation timeline. */
  getTimestamps?: ArrowAccessor<unknown, [number, number], FixedSizeList<Float32>>;
  /** Time window displayed by the shader, in seconds. */
  timeRange?: [number, number];
};

/** Styling and animation props for a group of flight arcs. */
export type AnimatedArcLayerProps = ArcLayerProps & AnimationProps;

const defaultProps: DefaultProps<AnimationProps> = {
  getTimestamps: {type: 'accessor', arrow: true, constantTypes: ['array'], value: [0, 1]},
  timeRange: {type: 'array', compare: true, value: [0, 1]}
};

/** Timestamp window layout for the GLSL shader stages. */
const uniformBlock = `uniform flightTimeUniforms { vec2 timeRange; } flightTime;`;
/** Shared time window uniforms for both shader backends. */
const flightTimeUniforms = {
  name: 'flightTime',
  vs: uniformBlock,
  fs: uniformBlock,
  source: `struct FlightTimeUniforms { timeRange: vec2<f32> };
@group(0) @binding(auto) var<uniform> flightTime: FlightTimeUniforms;`,
  uniformTypes: {timeRange: 'vec2<f32>'}
} as const satisfies ShaderModule<Pick<AnimationProps, 'timeRange'>>;

/** Draws a time window through flight arcs using a packed Arrow timestamp pair. */
export default class AnimatedArcLayer extends ArcLayer<unknown, Required<AnimationProps>> {
  static layerName = 'AnimatedArcLayer';
  static defaultProps = defaultProps;

  /** Binds timestamps when the layer uses the accessor model. */
  protected override initializeAccessorAttributes() {
    super.initializeAccessorAttributes();
    this.getAttributeManager()!.addInstanced({
      instanceTimestamps: {size: 2, accessor: 'getTimestamps'}
    });
  }

  /** Binds packed departure and arrival times to the Arrow model. */
  protected override getExtraColumnDefinitions(): Readonly<Record<string, ColumnDefinition>> {
    return {
      timestamps: {
        attribute: 'instanceTimestamps',
        accessor: 'getTimestamps',
        arrowAccessor: true,
        semantic: 'vector',
        size: 2
      }
    };
  }

  override getShaders() {
    const shaders = super.getShaders();
    const interpolate =
      'flightTimestamp = mix(instanceTimestamps.x, instanceTimestamps.y, segmentRatio);';
    const clip = `if (flightTimestamp < flightTime.timeRange.x || flightTimestamp > flightTime.timeRange.y) {
  discard;
}`;
    const opacity =
      '(flightTimestamp - flightTime.timeRange.x) / (flightTime.timeRange.y - flightTime.timeRange.x)';
    shaders.plugins = [
      ...(shaders.plugins || []),
      {
        name: 'animatedArc',
        module: flightTimeUniforms,
        vertexInputs: {instanceTimestamps: 'vec2<f32>'},
        interStageVariables: {flightTimestamp: {type: 'f32'}},
        injections: {
          'glsl:vs:#main-end': interpolate,
          'glsl:fs:#main-start': clip,
          'glsl:fs:DECKGL_FILTER_COLOR': `color.a *= ${opacity};`,
          'wgsl:vs:DECKGL_FILTER_GL_POSITION':
            'flightTimestamp = mix(instanceTimestamps.x, instanceTimestamps.y, geometry.uv.x);',
          'wgsl:fs:DECKGL_FILTER_COLOR': `${clip}
(*color).a *= ${opacity};`
        }
      }
    ];
    return shaders;
  }

  override draw(params: {uniforms: Record<string, unknown>}) {
    this.state.model!.shaderInputs.setProps({flightTime: {timeRange: this.props.timeRange}});
    super.draw(params);
  }
}
