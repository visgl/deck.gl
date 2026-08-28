// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Transition from "./transition.js";
import { cloneAttribute, getAttributeBufferLength } from "./gpu-transition-utils.js";
export class GPUTransitionBase {
    constructor({ device, attribute, timeline }) {
        this.buffers = [];
        /** The vertex count of the last buffer.
         * Buffer may be larger than the actual length we want to use
         * because we only reallocate buffers when they grow, not when they shrink,
         * due to performance costs */
        this.currentLength = 0;
        this.device = device;
        this.transition = new Transition(timeline);
        this.attribute = attribute;
        this.attributeInTransition = cloneAttribute(attribute);
        this.currentStartIndices = attribute.startIndices;
    }
    get inProgress() {
        return this.transition.inProgress;
    }
    start(transitionSettings, numInstances, duration = Infinity) {
        this.settings = transitionSettings;
        this.currentStartIndices = this.attribute.startIndices;
        this.currentLength = getAttributeBufferLength(this.attribute, numInstances);
        this.transition.start({ ...transitionSettings, duration });
    }
    update() {
        const updated = this.transition.update();
        if (updated) {
            this.onUpdate();
        }
        return updated;
    }
    setBuffer(buffer) {
        const { stride } = this.attributeInTransition.getAccessor();
        this.attributeInTransition.setData({
            buffer,
            normalized: this.attribute.settings.normalized,
            // Retain placeholder value to generate correct shader layout
            value: this.attributeInTransition.value,
            // A WebGPU Float32-backed fp64 transition still stores interleaved high/low tuples.
            stride
        });
    }
    cancel() {
        this.transition.cancel();
    }
    delete() {
        this.cancel();
        for (const buffer of this.buffers) {
            buffer.destroy();
        }
        this.buffers.length = 0;
    }
}
//# sourceMappingURL=gpu-transition.js.map