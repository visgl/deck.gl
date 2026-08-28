// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { _deepEqual as deepEqual } from '@deck.gl/core';
import { sortBins, packBinIds } from "./sort-bins.js";
import { aggregate, BUILT_IN_OPERATIONS } from "./aggregate.js";
import { evaluateVertexAccessor } from "./vertex-accessor.js";
/** An Aggregator implementation that calculates aggregation on the CPU */
export class CPUAggregator {
    constructor(props) {
        this.bins = [];
        this.binIds = null;
        this.results = [];
        this.dimensions = props.dimensions;
        this.channelCount = props.getValue.length;
        this.props = {
            ...props,
            binOptions: {},
            pointCount: 0,
            operations: [],
            customOperations: [],
            attributes: {}
        };
        this.needsUpdate = true;
        this.setProps(props);
    }
    destroy() { }
    get binCount() {
        return this.bins.length;
    }
    /** Update aggregation props */
    // eslint-disable-next-line complexity
    setProps(props) {
        const oldProps = this.props;
        if (props.binOptions) {
            if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
                this.setNeedsUpdate();
            }
        }
        if (props.operations) {
            for (let channel = 0; channel < this.channelCount; channel++) {
                if (props.operations[channel] !== oldProps.operations[channel]) {
                    this.setNeedsUpdate(channel);
                }
            }
        }
        if (props.customOperations) {
            for (let channel = 0; channel < this.channelCount; channel++) {
                if (Boolean(props.customOperations[channel]) !== Boolean(oldProps.customOperations[channel])) {
                    this.setNeedsUpdate(channel);
                }
            }
        }
        if (props.pointCount !== undefined && props.pointCount !== oldProps.pointCount) {
            this.setNeedsUpdate();
        }
        if (props.attributes) {
            props.attributes = { ...oldProps.attributes, ...props.attributes };
        }
        Object.assign(this.props, props);
    }
    /** Flags a channel to need update
     * This is called internally by setProps() if certain props change
     * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
     * the underlying buffers could have been updated and require rerunning the aggregation
     * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
     */
    setNeedsUpdate(channel) {
        if (channel === undefined) {
            this.needsUpdate = true;
        }
        else if (this.needsUpdate !== true) {
            this.needsUpdate = this.needsUpdate || [];
            this.needsUpdate[channel] = true;
        }
    }
    /** Run aggregation */
    update() {
        if (this.needsUpdate === true) {
            this.bins = sortBins({
                pointCount: this.props.pointCount,
                getBinId: evaluateVertexAccessor(this.props.getBin, this.props.attributes, this.props.binOptions)
            });
            const value = packBinIds({
                bins: this.bins,
                dimensions: this.dimensions,
                // Reuse allocated typed array
                target: this.binIds?.value
            });
            this.binIds = { value, type: 'float32', size: this.dimensions };
        }
        for (let channel = 0; channel < this.channelCount; channel++) {
            if (this.needsUpdate === true || this.needsUpdate[channel]) {
                const operation = this.props.customOperations[channel] ||
                    BUILT_IN_OPERATIONS[this.props.operations[channel]];
                const { value, domain } = aggregate({
                    bins: this.bins,
                    getValue: evaluateVertexAccessor(this.props.getValue[channel], this.props.attributes, undefined),
                    operation,
                    // Reuse allocated typed array
                    target: this.results[channel]?.value
                });
                this.results[channel] = { value, domain, type: 'float32', size: 1 };
                this.props.onUpdate?.({ channel });
            }
        }
        this.needsUpdate = false;
    }
    preDraw() { }
    /** Returns an accessor to the bins. */
    getBins() {
        return this.binIds;
    }
    /** Returns an accessor to the output for a given channel. */
    getResult(channel) {
        return this.results[channel];
    }
    /** Returns the [min, max] of aggregated values for a given channel. */
    getResultDomain(channel) {
        return this.results[channel]?.domain ?? [Infinity, -Infinity];
    }
    /** Returns the information for a given bin. */
    getBin(index) {
        const bin = this.bins[index];
        if (!bin) {
            return null;
        }
        const value = new Array(this.channelCount);
        for (let i = 0; i < value.length; i++) {
            const result = this.results[i];
            value[i] = result?.value[index];
        }
        return {
            id: bin.id,
            value,
            count: bin.points.length,
            pointIndices: bin.points
        };
    }
}
//# sourceMappingURL=cpu-aggregator.js.map