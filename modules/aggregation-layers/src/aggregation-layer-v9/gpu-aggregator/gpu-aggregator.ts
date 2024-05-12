import {ModelProps} from '@luma.gl/engine';
import {WebGLBinSorter} from './webgl-bin-sorter';
import {WebGLAggregationTransform} from './webgl-aggregation-transform';
import {_deepEqual as deepEqual, log, BinaryAttribute} from '@deck.gl/core';

import type {Aggregator, AggregationProps} from '../aggregator';
import type {Device, Buffer, BufferLayout, TypedArray} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

/** Settings used to construct a new GPUAggregator */
export type GPUAggregatorSettings = {
  /** Size of bin IDs */
  dimensions: 1 | 2;
  /** How many properties to perform aggregation on */
  numChannels: 1 | 2 | 3;
  /** Buffer layout for input attributes */
  bufferLayout?: BufferLayout[];
  /** Define a shader function with one of the signatures
   *  `void getBin(out int binId)`: if dimensions=1
   *  `void getBin(out ivec2 binId)`: if dimensions=2
   * And a shader function with one of the signatures
   *  `void getWeight(out float weight)`: if numChannels=1
   *  `void getWeight(out vec2 weight)`: if numChannels=2
   *  `void getWeight(out vec3 weight)`: if numChannels=3
   */
  vs: string;
  /** Shader modules
   * Required to support certain layer extensions (e.g. data filter)
   */
  modules?: ShaderModule[];
  /** Shadertool module defines */
  defines?: Record<string, string | number | boolean>;
};

/** Options used to run GPU aggregation, can be changed at any time */
export type GPUAggregationProps = AggregationProps & {
  /** Limits of binId defined for each dimension. Ids outside of the [start, end) are ignored.
   */
  binIdRange: [start: number, end: number][];
  /** Context props passed to the shader modules */
  moduleSettings?: ModelProps['moduleSettings'];
};

/** An Aggregator implementation that calculates aggregation on the GPU */
export class GPUAggregator implements Aggregator {
  /** Checks if the current device supports GPU aggregation */
  static isSupported(device: Device): boolean {
    return (
      device.features.has('float32-renderable-webgl') &&
      device.features.has('texture-blend-float-webgl')
    );
  }

  dimensions: 1 | 2;
  numChannels: 1 | 2 | 3;
  numBins: number = 0;

  device: Device;
  props: GPUAggregationProps = {
    pointCount: 0,
    binIdRange: [[0, 0]],
    operations: [],
    attributes: {},
    binOptions: {}
  };

  /** Dirty flag per channel */
  protected needsUpdate: boolean[];
  /** Step 1. sort data points into bins, blended using an aggregation opera†ion */
  protected binSorter: WebGLBinSorter;
  /** Step 2. (optional) calculate the min/max across all bins */
  protected aggregationTransform: WebGLAggregationTransform;

  constructor(device: Device, settings: GPUAggregatorSettings) {
    this.device = device;
    this.dimensions = settings.dimensions;
    this.numChannels = settings.numChannels;
    this.needsUpdate = new Array(this.numChannels).fill(true);
    this.binSorter = new WebGLBinSorter(device, settings);
    this.aggregationTransform = new WebGLAggregationTransform(device, settings);
  }

  getBins(): BinaryAttribute | null {
    const buffer = this.aggregationTransform.binBuffer;
    if (!buffer) {
      return null;
    }
    return {buffer, type: 'float32', size: this.dimensions};
  }

  /** Returns an accessor to the output for a given channel. */
  getResult(channel: 0 | 1 | 2): BinaryAttribute | null {
    const buffer = this.aggregationTransform.valueBuffer;
    if (!buffer || channel >= this.numChannels) {
      return null;
    }
    return {buffer, type: 'float32', size: 1, stride: this.numChannels * 4, offset: channel * 4};
  }

  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel: 0 | 1 | 2): [min: number, max: number] {
    return this.aggregationTransform.domains[channel];
  }

  /** Returns the information for a given bin. */
  getBin(index: number): {
    /** The original id */
    id: number | [number, number];
    /** Aggregated values by channel */
    value: number[];
    /** Count of data points in this bin */
    count: number;
  } | null {
    if (index < 0 || index >= this.numBins) {
      return null;
    }
    const {binIdRange} = this.props;
    let id: number | [number, number];

    if (this.dimensions === 1) {
      id = index + binIdRange[0][0];
    } else {
      const [[x0, x1], [y0]] = binIdRange;
      const width = x1 - x0;
      id = [(index % width) + x0, Math.floor(index / width) + y0];
    }

    const pixel = this.binSorter.getBinValues(index);
    if (!pixel) {
      return null;
    }
    const count = pixel[3];
    const value: number[] = [];
    for (let channel = 0; channel < this.numChannels; channel++) {
      if (count === 0) {
        value[channel] = NaN;
      } else {
        value[channel] =
          this.props.operations[channel] === 'MEAN' ? pixel[channel] / count : pixel[channel];
      }
    }
    return {id, value, count};
  }

  /** Release GPU resources */
  destroy() {
    this.binSorter.destroy();
    this.aggregationTransform.destroy();
  }

  /** Update aggregation props. Normalize prop values and set change flags. */
  setProps(props: Partial<GPUAggregationProps>) {
    const oldProps = this.props;

    // Update local settings. These will set the flag this._needsUpdate
    if ('binIdRange' in props && !deepEqual(props.binIdRange, oldProps.binIdRange, 2)) {
      const binIdRange = props.binIdRange!;
      log.assert(binIdRange.length === this.dimensions);

      if (this.dimensions === 1) {
        const [[x0, x1]] = binIdRange;
        this.numBins = x1 - x0;
      } else {
        const [[x0, x1], [y0, y1]] = binIdRange;
        this.numBins = (x1 - x0) * (y1 - y0);
      }

      this.binSorter.setDimensions(this.numBins, binIdRange);
      this.aggregationTransform.setDimensions(this.numBins, binIdRange);
      this.setNeedsUpdate();
    }
    if (props.operations) {
      for (let channel = 0; channel < this.numChannels; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== undefined && props.pointCount !== oldProps.pointCount) {
      this.binSorter.setModelProps({vertexCount: props.pointCount});
      this.setNeedsUpdate();
    }
    if (props.binOptions) {
      if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
      this.binSorter.setModelProps({uniforms: props.binOptions});
    }
    if (props.attributes) {
      const attributeBuffers: Record<string, Buffer> = {};
      const constantAttributes: Record<string, TypedArray> = {};

      for (const attribute of Object.values(props.attributes)) {
        for (const [attributeName, value] of Object.entries(attribute.getValue())) {
          if (ArrayBuffer.isView(value)) {
            constantAttributes[attributeName] = value;
          } else if (value) {
            attributeBuffers[attributeName] = value;
          }
        }
      }
      this.binSorter.setModelProps({attributes: attributeBuffers, constantAttributes});
    }
    if (props.moduleSettings) {
      this.binSorter.setModelProps({moduleSettings: props.moduleSettings});
    }

    Object.assign(this.props, props);
  }

  /** Flags a channel to need update.
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel?: number) {
    if (channel === undefined) {
      this.needsUpdate.fill(true);
    } else {
      this.needsUpdate[channel] = true;
    }
  }

  /** Run aggregation */
  update(
    /** Parameters only available at runtime  */
    opts: {
      moduleSettings?: ModelProps['moduleSettings'];
    }
  ) {
    if (!this.needsUpdate.some(Boolean)) {
      return;
    }

    if (opts.moduleSettings) {
      this.binSorter.setModelProps(opts);
    }

    const {operations} = this.props;
    const operationsToUpdate = this.needsUpdate.map((needsUpdate, i) =>
      needsUpdate ? operations[i] : null
    );
    // Render data to bins
    this.binSorter.update(operationsToUpdate);
    // Read to buffer and calculate domain
    this.aggregationTransform.update(this.binSorter.texture, operations);

    this.needsUpdate.fill(false);

    // Uncomment to debug
    // console.log('binsFBO', new Float32Array(this.device.readPixelsToArrayWebGL(this.binSorter.texture!).buffer));
    // console.log('binsBuffer', new Float32Array(this.aggregationTransform.binBuffer?.readSyncWebGL().buffer!));
    // console.log('resultBuffer', new Float32Array(this.aggregationTransform.valueBuffer?.readSyncWebGL().buffer!));
  }
}
