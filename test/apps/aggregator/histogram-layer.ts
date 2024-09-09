import {
  CPUAggregator,
  WebGLAggregator,
  AggregationOperation,
  _AggregationLayer
} from '@deck.gl/aggregation-layers';
import {GridCellLayer} from '@deck.gl/layers';
import type {Accessor, Color, DefaultProps, UpdateParameters} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

export type HistogramLayerProps<DataT = unknown> = {
  data: DataT[];
  getPosition?: Accessor<DataT, number>;
  getWeight?: Accessor<DataT, number>;
  binSize?: number;
  aggregation?: AggregationOperation;
  gpuAggregation?: boolean;
  fillColor?: Color;
  heightScale?: number;
};

const defaultProps: DefaultProps<HistogramLayerProps> = {
  getPosition: {type: 'accessor', value: (d: any) => d.bin},
  getWeight: {type: 'accessor', value: 1},
  binSize: 1,
  aggregation: 'SUM',
  gpuAggregation: false,
  fillColor: {type: 'color', value: [0, 0, 0, 255]},
  heightScale: {type: 'number', min: 0, value: 1}
};

type BinOptions = {
  binSize: number;
};

const binOptionsUniforms = {
  name: 'binOptions',
  vs: /* glsl */ `\
  uniform binOptionsUniforms {
    float binSize;
  } binOptions;
  `,
  uniformTypes: {
    binSize: 'f32'
  }
} as const satisfies ShaderModule<BinOptions>;

export class HistogramLayer<DataT = unknown> extends _AggregationLayer<
  DataT,
  Required<HistogramLayerProps<DataT>>
> {
  static layerName = 'HistogramLayer';
  static defaultProps = defaultProps;

  getAggregatorType(): string {
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device)
      ? 'gpu'
      : 'cpu';
  }

  createAggregator(type: string) {
    if (type === 'gpu') {
      return new WebGLAggregator(this.context.device, {
        dimensions: 1,
        channelCount: 1,
        bufferLayout: this.getAttributeManager()!.getBufferLayouts({isInstanced: false}),
        modules: [binOptionsUniforms],
        vs: `
  uniform float binSize;
  in float position;
  in float weight;

  void getBin(out int binId) {
    binId = int(floor(position / binOptions.binSize));
  }
  void getValue(out float value) {
    value = weight;
  }
        `
      });
    }
    return new CPUAggregator({
      dimensions: 1,
      getBin: {
        sources: ['position'],
        getValue: (data: {position: number}, index: number, options: {binSize: number}) => [
          Math.floor(data.position / options.binSize)
        ]
      },
      getValue: [
        {
          sources: ['weight'],
          getValue: (data: {weight: number}) => data.weight
        }
      ]
    });
  }

  initializeState() {
    this.getAttributeManager()!.add({
      position: {
        type: 'float32',
        size: 1,
        accessor: 'getPosition'
      },
      weight: {
        type: 'float32',
        size: 1,
        accessor: 'getWeight'
      }
    });
  }

  updateState(params: UpdateParameters<this>) {
    const aggregatorChanged = super.updateState(params);

    const {changeFlags, props, oldProps} = params;
    if (aggregatorChanged || changeFlags.dataChanged || props.binSize !== oldProps.binSize) {
      const {aggregator} = this.state;

      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange: this._getBinIdRange(),
        pointCount: props.data.length,
        operations: [props.aggregation],
        binOptions: {
          binSize: props.binSize
        }
      });
    }
    return aggregatorChanged;
  }

  onAttributeChange(id: string): void {
    const {aggregator} = this.state;
    switch (id) {
      case 'position':
        aggregator.setNeedsUpdate();
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange: this._getBinIdRange(),
          binOptions: {
            binSize: this.props.binSize
          }
        });
        break;

      case 'weight':
        aggregator.setNeedsUpdate(0);
        break;
    }
  }

  _getBinIdRange() {
    const bounds = this.getAttributeManager()?.getBounds(['position']) as [number[], number[]];
    if (!bounds) {
      return [[0, 1]];
    }
    const {binSize} = this.props;
    return [[Math.floor(bounds[0][0] / binSize), Math.floor(bounds[1][0] / binSize) + 1]];
  }

  renderLayers() {
    const {aggregator} = this.state;
    const {heightScale, fillColor, binSize} = this.props;
    const binAttribute = aggregator.getBins();
    const valueAttribute = aggregator.getResult(0);

    // Hack: provide hint to Attribute class to disable fp64
    binAttribute.value = binAttribute.value || new Float32Array(0);

    return new GridCellLayer({
      data: {
        length: aggregator.binCount,
        attributes: {
          getPosition: binAttribute,
          getElevation: valueAttribute
        }
      },
      modelMatrix: new Matrix4().rotateX(Math.PI / 2).scale([binSize, 1, 1]),
      cellSize: 0.9 * binSize,
      extruded: true,
      elevationScale: heightScale,
      getFillColor: fillColor
    });
  }
}
