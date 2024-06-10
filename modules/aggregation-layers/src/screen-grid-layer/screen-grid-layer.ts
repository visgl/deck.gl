// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {
  Accessor,
  Color,
  GetPickingInfoParams,
  CompositeLayerProps,
  Layer,
  project32,
  LayersList,
  PickingInfo,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {GPUAggregator} from '../aggregation-layer-v9/gpu-aggregator/gpu-aggregator';
import {CPUAggregator} from '../aggregation-layer-v9/cpu-aggregator/cpu-aggregator';
import AggregationLayer from '../aggregation-layer-v9/aggregation-layer';
import ScreenGridCellLayer from './screen-grid-cell-layer';

const defaultProps: DefaultProps<ScreenGridLayerProps> = {
  ...(ScreenGridCellLayer.defaultProps as DefaultProps<ScreenGridLayerProps>),
  getPosition: {type: 'accessor', value: (d: any) => d.position},
  getWeight: {type: 'accessor', value: 1},

  gpuAggregation: false, // TODO(v9): Re-enable GPU aggregation.
  aggregation: 'SUM'
};

/** All properties supported by ScreenGridLayer. */
export type ScreenGridLayerProps<DataT = unknown> = _ScreenGridLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by ScreenGridLayer. */
export type _ScreenGridLayerProps<DataT> = {
  /**
   * Unit width/height of the bins.
   * @default 100
   */
  cellSizePixels?: number;

  /**
   * Cell margin size in pixels.
   * @default 2
   */
  cellMarginPixels?: number;

  /**
   * Color scale input domain. The color scale maps continues numeric domain into discrete color range.
   * @default [1, max(weight)]
   */
  colorDomain?: [number, number] | null;

  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];

  /**
   * Method called to retrieve the position of each object.
   *
   * @default d => d.position
   */
  getPosition?: Accessor<DataT, Position>;

  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;

  /**
   * Perform aggregation is performed on GPU.
   *
   * @default true
   */
  gpuAggregation?: boolean;

  /**
   * Defines the type of aggregation operation
   *
   * V valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   *
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
};

/** Aggregates data into histogram bins and renders them as a grid. */
export default class ScreenGridLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends AggregationLayer<DataT, ExtraProps & Required<_ScreenGridLayerProps<DataT>>> {
  static layerName = 'ScreenGridLayer';
  static defaultProps = defaultProps;

  createAggregator(): GPUAggregator | CPUAggregator {
    if (!this.props.gpuAggregation || !GPUAggregator.isSupported(this.context.device)) {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ['positions'],
          getValue: ({positions}, index, opts) => {
            const viewport = this.context.viewport;
            const p = viewport.project(positions as number[]);
            const cellSizePixels: number = opts.cellSizePixels;
            if (p[0] < 0 || p[0] >= viewport.width || p[1] < 0 || p[1] >= viewport.height) {
              // Not on screen
              return null;
            }
            return [Math.floor(p[0] / cellSizePixels), Math.floor(p[1] / cellSizePixels)];
          }
        },
        getValue: [{sources: ['counts'], getValue: ({counts}) => counts}]
      });
    }
    return new GPUAggregator(this.context.device, {
      dimensions: 2,
      numChannels: 1,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts({isInstanced: false}),
      ...super.getShaders({
        modules: [project32],
        vs: `
  uniform float cellSizePixels;
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;
  
  void getBin(out ivec2 binId) {
    vec4 pos = project_position_to_clipspace(positions, positions64Low, vec3(0.0));
    vec2 screenCoords = vec2(pos.x / pos.w + 1.0, 1.0 - pos.y / pos.w) / 2.0 * project.viewportSize / project.devicePixelRatio;
    vec2 gridCoords = floor(screenCoords / cellSizePixels);
    binId = ivec2(gridCoords);
  }
  void getWeight(out float weight) {
    weight = counts;
  }
  `
      })
    });
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {
        size: 3,
        accessor: 'getPosition',
        type: 'float64',
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      counts: {size: 1, accessor: 'getWeight'}
    });
  }

  shouldUpdateState({changeFlags}: UpdateParameters<this>) {
    return changeFlags.somethingChanged;
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    const {cellSizePixels, aggregation} = props;
    if (
      changeFlags.dataChanged ||
      changeFlags.updateTriggersChanged ||
      changeFlags.viewportChanged ||
      aggregation !== oldProps.aggregation ||
      cellSizePixels !== oldProps.cellSizePixels
    ) {
      const {width, height} = this.context.viewport;
      const {aggregator} = this.state;

      if (aggregator instanceof GPUAggregator) {
        aggregator.setProps({
          binIdRange: [
            [0, Math.ceil(width / cellSizePixels)],
            [0, Math.ceil(height / cellSizePixels)]
          ]
        });
      }

      aggregator.setProps({
        pointCount: this.getNumInstances(),
        operations: [aggregation],
        binOptions: {
          cellSizePixels
        }
      });
    }

    if (changeFlags.viewportChanged) {
      // Rerun aggregation on viewport change
      this.state.aggregator.setNeedsUpdate();
    }
  }

  onAttributeChange(id: string) {
    const {aggregator} = this.state;
    switch (id) {
      case 'positions':
        aggregator.setNeedsUpdate();
        break;

      case 'counts':
        aggregator.setNeedsUpdate(0);
        break;

      default:
      // This should not happen
    }
  }

  renderLayers(): LayersList | Layer | null {
    const {aggregator} = this.state;
    const CellLayerClass = this.getSubLayerClass('cells', ScreenGridCellLayer);
    const binAttribute = aggregator.getBins();
    const weightAttribute = aggregator.getResult(0);

    return new CellLayerClass(
      this.props,
      this.getSubLayerProps({
        id: 'cell-layer'
      }),
      {
        data: {
          length: aggregator.numBins,
          attributes: {
            getBin: binAttribute,
            getWeight: weightAttribute
          }
        },
        // Data has changed shallowly, but we likely don't need to update the attributes
        dataComparator: (data, oldData) => data.length === oldData.length,
        updateTriggers: {
          getBin: binAttribute?.buffer,
          getWeight: weightAttribute?.buffer
        },
        parameters: {
          depthWriteEnabled: false,
          ...this.props.parameters
        },
        // Evaluate domain at draw() time
        colorDomain: () => this.props.colorDomain || aggregator.getResultDomain(0),
        // Extensions are already handled by the GPUAggregator, do not pass it down
        extensions: []
      }
    );
  }

  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    const {index} = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      if (bin) {
        info.object = {
          col: bin.id[0],
          row: bin.id[1],
          weight: Number.isFinite(bin.value[0]) ? bin.value[0] : undefined,
          count: bin.count
        };
      }
    }

    return info;
  }
}
