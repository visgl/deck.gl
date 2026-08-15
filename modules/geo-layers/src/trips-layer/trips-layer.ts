// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {NumericArray} from '@math.gl/core';
import {createIterable} from '@deck.gl/core';
import type {AccessorFunction, Attribute, DefaultProps} from '@deck.gl/core';
import {PathLayer, PathLayerProps} from '@deck.gl/layers';

import {tripsUniforms, TripsProps} from './trips-layer-uniforms';
import {packTripTimestamps, tripsShaderInjectionsWGSL} from './trips-layer.wgsl';

const defaultProps: DefaultProps<TripsLayerProps> = {
  fadeTrail: true,
  trailLength: {type: 'number', value: 120, min: 0},
  currentTime: {type: 'number', value: 0, min: 0},
  getTimestamps: {type: 'accessor', value: (d: any) => d.timestamps}
};

const tripsShaderInjectionsGLSL = {
  'vs:#decl': `\
in float instanceTimestamps;
in float instanceNextTimestamps;
out float vTime;
`,
  // Timestamp of the vertex
  'vs:#main-end': `\
vTime = instanceTimestamps + (instanceNextTimestamps - instanceTimestamps) * vPathPosition.y / vPathLength;
`,
  'fs:#decl': `\
in float vTime;
`,
  // Drop segments only after PathLayer evaluates analytic-coverage derivatives, then
  // fade the color (currentTime - 100%, end of trail - 0%).
  'fs:DECKGL_FILTER_COLOR': `\
if(vTime > trips.currentTime || (trips.fadeTrail && (vTime < trips.currentTime - trips.trailLength))) {
  discard;
}
if(trips.fadeTrail) {
  color.a *= 1.0 - (trips.currentTime - vTime) / trips.trailLength;
}
`
} as const;

/** All properties supported by TripsLayer. */
export type TripsLayerProps<DataT = unknown> = _TripsLayerProps<DataT> & PathLayerProps<DataT>;

/** Properties added by TripsLayer. */
type _TripsLayerProps<DataT = unknown> = {
  /**
   * Whether or not the path fades out.
   * @default true
   */
  fadeTrail?: boolean;
  /**
   * Trail length.
   * @default 120
   */
  trailLength?: number;
  /**
   * The current time of the frame.
   * @default 0
   */
  currentTime?: number;
  /**
   * Timestamp accessor.
   */
  getTimestamps?: AccessorFunction<DataT, NumericArray>;
};

/** Render animated paths that represent vehicle trips. */
export default class TripsLayer<DataT = any, ExtraProps extends {} = {}> extends PathLayer<
  DataT,
  Required<_TripsLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'TripsLayer';
  static defaultProps = defaultProps;

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject =
      this.context.device.type === 'webgpu' ? tripsShaderInjectionsWGSL : tripsShaderInjectionsGLSL;
    shaders.modules = [...shaders.modules, tripsUniforms];
    return shaders;
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager!.addInstanced({
      ...(this.context.device.type === 'webgpu'
        ? {
            instanceTimestamps: {
              size: 2,
              accessor: 'getTimestamps',
              // eslint-disable-next-line @typescript-eslint/unbound-method
              update: this.calculateWebGPUTimestamps,
              bufferGroup: 'path-instance-data'
            }
          }
        : {
            timestamps: {
              size: 1,
              accessor: 'getTimestamps',
              shaderAttributes: {
                instanceTimestamps: {
                  vertexOffset: 0
                },
                instanceNextTimestamps: {
                  vertexOffset: 1
                }
              }
            }
          })
    });
  }

  /** Materialize timestamps in the same per-path instance layout as the path tessellator. */
  protected calculateWebGPUTimestamps(
    attribute: Attribute,
    {data, props}: {data: TripsLayerProps<DataT>['data']; props: TripsLayerProps<DataT>}
  ): void {
    const {pathTesselator} = this.state;
    const {instanceCount, vertexStarts} = pathTesselator;
    const packedTimestamps = new Float32Array(instanceCount * 2);
    const {iterable, objectInfo} = createIterable(data);

    for (const object of iterable) {
      objectInfo.index++;

      const vertexStart = vertexStarts[objectInfo.index];
      const vertexEnd = vertexStarts[objectInfo.index + 1] ?? instanceCount;

      if (vertexEnd <= vertexStart) {
        continue;
      }

      const timestamps = props.getTimestamps?.(object, objectInfo) ?? [];
      packedTimestamps.set(
        packTripTimestamps(timestamps, vertexEnd - vertexStart, props._pathType === 'loop'),
        vertexStart * 2
      );
    }

    attribute.startIndices = vertexStarts;
    attribute.value = packedTimestamps;
  }

  draw(params) {
    const {fadeTrail, trailLength, currentTime} = this.props;
    const tripsProps: TripsProps = {fadeTrail, trailLength, currentTime};

    const model = this.state.model!;
    model.shaderInputs.setProps({trips: tripsProps});
    super.draw(params);
  }
}
