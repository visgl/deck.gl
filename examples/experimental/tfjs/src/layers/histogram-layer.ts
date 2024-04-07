/* global console */
/* eslint-disable no-console */
import * as tf from '@tensorflow/tfjs';
import {
  CompositeLayer,
  LayerData,
  Accessor,
  AccessorFunction,
  Color,
  CompositeLayerProps,
  DefaultProps,
  UpdateParameters,
  AttributeManager,
  _deepEqual
} from '@deck.gl/core';
import {GridCellLayer} from '@deck.gl/layers';
import {Buffer} from '@luma.gl/core';
import {Matrix4} from '@math.gl/core';

import {CustomTFContext} from '../tf-utils/tf-context';
import {tensorToBuffer} from '../tf-utils/tensor-data';

const defaultProps: DefaultProps<HistogramLayerProps> = {
  getValue: {type: 'accessor', value: x => x.value},
  getHeightWeight: {type: 'accessor', value: 1},
  binSize: {type: 'number', min: 0, value: 1},
  gap: {type: 'number', min: 0, max: 1, value: 0},
  heightScale: {type: 'object', compare: true, value: {}}
};

export type HistogramLayerProps<DataT = any> = _HistogramLayerProps<DataT> & CompositeLayerProps;

type _HistogramLayerProps<DataT> = {
  data?: LayerData<DataT>;
  getValue: AccessorFunction<DataT, number>;
  getHeightWeight?: Accessor<DataT, number>;
  color?: Color;
  binSize?: number;
  gap?: number;
  heightScale?: {type?: 'linear' | 'log' | 'sqrt'; factor?: number; max?: number};
};

export class HistogramLayer<DataT = any> extends CompositeLayer<
  Required<HistogramLayerProps<DataT>>
> {
  static layerName = 'HistogramLayer';
  static defaultProps = defaultProps;

  state!: {
    tfContext: CustomTFContext;
    aggregationAttributes: AttributeManager;
    binRange?: [number, number];
    heightValues?: number[];
    heightBuffer?: Buffer;
    heightScale?: number;
  };

  initializeState() {
    const context = this.context;
    const attributeManager = new AttributeManager(context.device, {
      id: this.props.id,
      stats: context.stats,
      timeline: context.timeline
    });

    attributeManager.add({
      values: {
        size: 1,
        accessor: 'getValue'
      },
      heightWeights: {
        size: 1,
        accessor: 'getHeightWeight'
      }
    });

    this.setState({
      aggregationAttributes: attributeManager,
      tfContext: CustomTFContext.getDefaultContext(context.gl)
    });
  }

  getPickingInfo({info}) {
    const {binSize} = this.props;
    const {binRange, heightValues} = this.state;
    if (info.picked && heightValues) {
      info.object = [(binRange[0] + info.index) * binSize, heightValues[info.index]];
    }
    return info;
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    // Figure out data length
    const numInstances = this.getNumInstances();
    const startIndices = this.getStartIndices();

    const {props, oldProps} = params;
    const {aggregationAttributes} = this.state;
    aggregationAttributes.update({
      data: props.data,
      numInstances,
      startIndices,
      props,
      transitions: props.transitions,
      buffers: (props.data as any).attributes,
      context: this
    });

    const changedAttributes = aggregationAttributes.getChangedAttributes({clearChangedFlags: true});

    if (
      Object.keys(changedAttributes).length ||
      props.binSize !== oldProps.binSize ||
      !_deepEqual(props.heightScale, oldProps.heightScale, 1)
    ) {
      this._calculateBins();
    }
  }

  finalizeState() {
    this.state.heightBuffer?.delete();
    this.state.aggregationAttributes.finalize();
  }

  renderLayers() {
    const {binSize, gap, color} = this.props;
    const {binRange, heightBuffer, heightScale} = this.state;
    if (!binRange) return null;

    return new GridCellLayer(this.getSubLayerProps({id: 'bars'}), {
      data: {
        length: binRange[1] - binRange[0] + 1,
        attributes: {
          getElevation: {buffer: heightBuffer, size: 1}
        }
      },
      getFillColor: color,
      cellSize: binSize,
      coverage: 1 - gap,
      offset: [0, 0],
      modelMatrix: new Matrix4()
        .rotateX(Math.PI / 2)
        .scale([binSize, 0, 1])
        .translate([binRange[0], 0, 0]),
      getPosition: (_, {index}) => [index, 0, 0],
      elevationScale: heightScale,
      material: false
    });
  }

  protected _calculateBins() {
    const {tfContext, aggregationAttributes} = this.state;
    const {binSize, heightScale, pickable} = this.props;
    const {values, heightWeights} = aggregationAttributes.attributes;
    const hScaleType = heightScale.type ?? 'linear';

    tfContext.tidy(() => {
      console.time('bin aggregation');
      const length = values.numInstances;
      const binIds = tf
        .tensor1d((values.value as Float32Array).subarray(0, length))
        .floorDiv(binSize);

      const min = binIds.min();
      const binsToCount = binIds.sub(min);

      const minBin = min.arraySync() as number;
      const maxBin = binIds.max().arraySync() as number;
      const nBins = maxBin - minBin + 1;

      const hWeight = heightWeights.isConstant
        ? (tf.fill([length], heightWeights.value[0]) as tf.Tensor1D)
        : tf.tensor1d((heightWeights.value as Float32Array).subarray(0, length));
      let hBins = tf.bincount(binsToCount, hWeight, nBins);

      const heightValues = pickable ? hBins.flatten().arraySync() : null;
      if (hScaleType === 'log') {
        hBins = hBins.add(1).log() as tf.Tensor1D;
      } else if (hScaleType === 'sqrt') {
        hBins = hBins.sqrt();
      }
      let hScaleFactor = heightScale.factor ?? 1;
      if (heightScale.max) {
        const maxCount = hBins.max().arraySync() as number;
        if (maxCount > 0) {
          hScaleFactor = Math.min(heightScale.max / maxCount, heightScale.factor ?? Infinity);
        }
      }

      const heightBuffer = tensorToBuffer(hBins);

      this.setState({
        binRange: [minBin, maxBin],
        heightValues,
        heightBuffer,
        heightScale: hScaleFactor
      });

      console.timeEnd('bin aggregation');
    });
  }
}
