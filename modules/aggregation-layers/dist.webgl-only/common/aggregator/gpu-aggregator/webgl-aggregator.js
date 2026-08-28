// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { WebGLBinSorter } from "./webgl-bin-sorter.js";
import { WebGLAggregationTransform } from "./webgl-aggregation-transform.js";
import { _deepEqual as deepEqual, log } from '@deck.gl/core';
/** An Aggregator implementation that calculates aggregation on the GPU */
export class WebGLAggregator {
    /** Checks if the current device supports GPU aggregation */
    static isSupported(device) {
        return (device.features.has('float32-renderable-webgl') &&
            device.features.has('texture-blend-float-webgl'));
    }
    constructor(device, props) {
        this.binCount = 0;
        /** Cached outputs */
        this.binIds = null;
        this.results = [];
        this.device = device;
        this.dimensions = props.dimensions;
        this.channelCount = props.channelCount;
        this.props = {
            ...props,
            pointCount: 0,
            binIdRange: [[0, 0]],
            operations: [],
            attributes: {},
            binOptions: {}
        };
        this.needsUpdate = new Array(this.channelCount).fill(true);
        this.binSorter = new WebGLBinSorter(device, props);
        this.aggregationTransform = new WebGLAggregationTransform(device, props);
        this.setProps(props);
    }
    getBins() {
        const buffer = this.aggregationTransform.binBuffer;
        if (!buffer) {
            return null;
        }
        if (this.binIds?.buffer !== buffer) {
            // deck.gl Attribute.setBinaryValue uses shallow comparison to determine if attribute value has changed
            // For performance, only create a new binary attribute descriptor when Buffer changes
            this.binIds = { buffer, type: 'float32', size: this.dimensions };
        }
        return this.binIds;
    }
    /** Returns an accessor to the output for a given channel. */
    getResult(channel) {
        const buffer = this.aggregationTransform.valueBuffer;
        if (!buffer || channel >= this.channelCount) {
            return null;
        }
        if (this.results[channel]?.buffer !== buffer) {
            this.results[channel] = {
                buffer,
                type: 'float32',
                size: 1,
                stride: this.channelCount * 4,
                offset: channel * 4
            };
        }
        return this.results[channel];
    }
    /** Returns the [min, max] of aggregated values for a given channel. */
    getResultDomain(channel) {
        return this.aggregationTransform.domains[channel];
    }
    /** Returns the information for a given bin. */
    getBin(index) {
        if (index < 0 || index >= this.binCount) {
            return null;
        }
        const { binIdRange } = this.props;
        let id;
        if (this.dimensions === 1) {
            id = [index + binIdRange[0][0]];
        }
        else {
            const [[x0, x1], [y0]] = binIdRange;
            const width = x1 - x0;
            id = [(index % width) + x0, Math.floor(index / width) + y0];
        }
        const pixel = this.binSorter.getBinValues(index);
        if (!pixel) {
            return null;
        }
        const count = pixel[3];
        const value = [];
        for (let channel = 0; channel < this.channelCount; channel++) {
            const operation = this.props.operations[channel];
            if (operation === 'COUNT') {
                value[channel] = count;
            }
            else if (count === 0) {
                value[channel] = NaN;
            }
            else {
                value[channel] = operation === 'MEAN' ? pixel[channel] / count : pixel[channel];
            }
        }
        return { id, value, count };
    }
    /** Release GPU resources */
    destroy() {
        this.binSorter.destroy();
        this.aggregationTransform.destroy();
    }
    /** Update aggregation props. Normalize prop values and set change flags. */
    // eslint-disable-next-line complexity, max-statements
    setProps(props) {
        const oldProps = this.props;
        // Update local settings. These will set the flag this._needsUpdate
        if ('binIdRange' in props && !deepEqual(props.binIdRange, oldProps.binIdRange, 2)) {
            const binIdRange = props.binIdRange;
            log.assert(binIdRange.length === this.dimensions);
            if (this.dimensions === 1) {
                const [[x0, x1]] = binIdRange;
                this.binCount = x1 - x0;
            }
            else {
                const [[x0, x1], [y0, y1]] = binIdRange;
                this.binCount = (x1 - x0) * (y1 - y0);
            }
            this.binSorter.setDimensions(this.binCount, binIdRange);
            this.aggregationTransform.setDimensions(this.binCount, binIdRange);
            this.setNeedsUpdate();
        }
        if (props.operations) {
            for (let channel = 0; channel < this.channelCount; channel++) {
                if (props.operations[channel] !== oldProps.operations[channel]) {
                    this.setNeedsUpdate(channel);
                }
            }
        }
        if (props.pointCount !== undefined && props.pointCount !== oldProps.pointCount) {
            this.binSorter.setModelProps({ vertexCount: props.pointCount });
            this.setNeedsUpdate();
        }
        if (props.binOptions) {
            if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
                this.setNeedsUpdate();
            }
            this.binSorter.model.shaderInputs.setProps({ binOptions: props.binOptions });
        }
        if (props.attributes) {
            const attributeBuffers = {};
            const constantAttributes = {};
            for (const attribute of Object.values(props.attributes)) {
                for (const [attributeName, value] of Object.entries(attribute.getValue())) {
                    if (ArrayBuffer.isView(value)) {
                        constantAttributes[attributeName] = value;
                    }
                    else if (value) {
                        attributeBuffers[attributeName] = value;
                    }
                }
            }
            this.binSorter.setModelProps({ attributes: attributeBuffers, constantAttributes });
        }
        if (props.shaderModuleProps) {
            this.binSorter.setModelProps({ shaderModuleProps: props.shaderModuleProps });
        }
        Object.assign(this.props, props);
    }
    /** Flags a channel to need update.
     * This is called internally by setProps() if certain props change
     * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
     * the underlying buffers could have been updated and require rerunning the aggregation
     * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
     */
    setNeedsUpdate(channel) {
        if (channel === undefined) {
            this.needsUpdate.fill(true);
        }
        else {
            this.needsUpdate[channel] = true;
        }
    }
    update() { }
    /** Run aggregation */
    preDraw() {
        if (!this.needsUpdate.some(Boolean)) {
            return;
        }
        const { operations } = this.props;
        const operationsToUpdate = this.needsUpdate.map((needsUpdate, i) => needsUpdate ? operations[i] : null);
        // Render data to bins
        this.binSorter.update(operationsToUpdate);
        // Read to buffer and calculate domain
        this.aggregationTransform.update(this.binSorter.texture, operations);
        for (let i = 0; i < this.channelCount; i++) {
            if (this.needsUpdate[i]) {
                this.needsUpdate[i] = false;
                this.props.onUpdate?.({ channel: i });
            }
        }
        // Uncomment to debug
        // console.log('binsFBO', new Float32Array(this.device.readPixelsToArrayWebGL(this.binSorter.texture!).buffer));
        // console.log('binsBuffer', new Float32Array(this.aggregationTransform.binBuffer?.readSyncWebGL().buffer!));
        // console.log('resultBuffer', new Float32Array(this.aggregationTransform.valueBuffer?.readSyncWebGL().buffer!));
    }
}
//# sourceMappingURL=webgl-aggregator.js.map