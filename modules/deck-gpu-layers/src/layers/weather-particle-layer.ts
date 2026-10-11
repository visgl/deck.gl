// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  COORDINATE_SYSTEM,
  Layer,
  project32,
  type LayerContext,
  type LayerProps,
  type UpdateParameters,
  type Viewport
} from '@deck.gl/core';
import {assert, type Buffer, type RenderPass, type Texture} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {getMeterOffsetPosition} from '../projection/meter-offset-position';
import {
  heightFog,
  precipitation,
  type HeightFogProps,
  type PrecipitationProps
} from '@luma.gl/shadertools';
import {
  weatherRender,
  SOURCE,
  VERTEX_SHADER,
  FRAGMENT_SHADER
} from './weather-particle-layer-shaders';

export type WeatherParticleLayerProps = LayerProps & {
  weather?: 'rain' | 'snow';
  time?: number | (() => number);
  particleCount?: number;
  precipitation?: PrecipitationProps | ((viewport: Viewport) => PrecipitationProps);
  fog?: HeightFogProps | (() => HeightFogProps);
  widthPixels?: number;
  streakLength?: number;
  color?: [number, number, number, number];
  /** Borrowed r32float surface heights in local metres, row zero at the south edge. */
  surfaceTexture?: Texture | null;
  surfaceBounds?: [number, number, number, number];
};
const PARAMETERS = {
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

/** Local metre-space rain and snow. The application controls the animation clock and volume. */
export class WeatherParticleLayer extends Layer<WeatherParticleLayerProps> {
  static override layerName = 'WeatherParticleLayer';
  static override defaultProps = {
    weather: 'rain',
    time: 0,
    particleCount: 12000,
    precipitation: {},
    fog: {},
    widthPixels: 1.2,
    streakLength: 12,
    color: [0.75, 0.85, 0.95, 0.7],
    surfaceTexture: null,
    surfaceBounds: [-1, -1, 1, 1],
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    getPolygonOffset: () => [0, 0],
    parameters: PARAMETERS
  };
  declare state: {model: Model; corners: Buffer; emptySurface: Texture};
  override getAttributeManager() {
    return null;
  }
  override getNumInstances(): number {
    return this.props.particleCount!;
  }
  override initializeState({device}: LayerContext): void {
    const corners = device.createBuffer({
      data: new Float32Array([0, -1, 1, -1, 0, 1, 0, 1, 1, -1, 1, 1])
    });
    let emptySurface: Texture | undefined;
    try {
      emptySurface = device.createTexture({
        width: 1,
        height: 1,
        format: 'r32float',
        data: new Float32Array([0])
      });
      const model = new Model(device, {
        ...this.getShaders({
          source: SOURCE,
          vs: VERTEX_SHADER,
          fs: FRAGMENT_SHADER,
          modules: [project32, precipitation, heightFog, weatherRender]
        }),
        id: this.id,
        topology: 'triangle-list',
        vertexCount: 6,
        isInstanced: true,
        instanceCount: this.props.particleCount,
        bufferLayout: [{name: 'corner', format: 'float32x2'}],
        attributes: {corner: corners},
        shaderLayout: {
          attributes: [],
          bindings: [
            {
              name: 'surfaceElevation',
              type: 'texture',
              group: 3,
              location: 7,
              sampleType: 'unfilterable-float'
            }
          ]
        },
        bindings: {surfaceElevation: this.props.surfaceTexture || emptySurface},
        parameters: PARAMETERS
      });
      this.setState({model, corners, emptySurface});
    } catch (error) {
      corners.destroy();
      emptySurface?.destroy();
      throw error;
    }
  }
  override updateState({props}: UpdateParameters<this>): void {
    // This adapter's fog and precipitation coordinates are local east/north/up metres.
    assert(props.coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS);
    assert(
      Number.isInteger(props.particleCount) &&
        props.particleCount! >= 0 &&
        props.particleCount! <= 262144
    );
    if (props.surfaceTexture)
      assert(
        props.surfaceTexture.device === this.context.device &&
          props.surfaceTexture.format === 'r32float'
      );
    this.state.model.setParameters({...PARAMETERS, ...props.parameters});
    this.state.model.setInstanceCount(props.particleCount!);
    this.state.model.setBindings({
      surfaceElevation: props.surfaceTexture || this.state.emptySurface
    });
  }
  override getModels(): Model[] {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const props = this.props;
    const surfaceBounds = props.surfaceBounds!;
    this.state.model.shaderInputs.setProps({
      precipitation: {
        ...(typeof props.precipitation === 'function'
          ? props.precipitation(this.context.viewport)
          : props.precipitation),
        time: typeof props.time === 'function' ? props.time() : props.time
      },
      heightFog: {
        ...heightFog.defaultUniforms,
        ...(typeof props.fog === 'function' ? props.fog() : props.fog)
      },
      weatherRender: {
        cameraPosition: getMeterOffsetPosition(
          this.context.viewport,
          props.coordinateOrigin!,
          this.context.viewport.cameraPosition
        ),
        appearance: [
          props.widthPixels,
          props.streakLength,
          props.weather === 'snow' ? 1 : 0,
          props.surfaceTexture ? 1 : 0
        ],
        surfaceBounds: [
          surfaceBounds[0],
          surfaceBounds[1],
          surfaceBounds[2] - surfaceBounds[0],
          surfaceBounds[3] - surfaceBounds[1]
        ],
        color: props.color
      }
    });
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model?.destroy();
    this.state.corners?.destroy();
    this.state.emptySurface?.destroy();
    super.finalizeState(context);
  }
}
