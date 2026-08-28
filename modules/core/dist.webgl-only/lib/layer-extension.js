// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { deepEqual } from "../utils/deep-equal.js";
class LayerExtension {
    static get componentName() {
        return Object.prototype.hasOwnProperty.call(this, 'extensionName') ? this.extensionName : '';
    }
    constructor(opts) {
        if (opts) {
            this.opts = opts;
        }
    }
    /** Returns true if two extensions are equivalent */
    equals(extension) {
        if (this === extension) {
            return true;
        }
        // Compare extensions shallowly
        return this.constructor === extension.constructor && deepEqual(this.opts, extension.opts, 1);
    }
    /** Only called if attached to a primitive layer */
    getShaders(extension) {
        return null;
    }
    /** Only called if attached to a CompositeLayer */
    getSubLayerProps(extension) {
        const { defaultProps } = extension.constructor;
        const newProps = {
            updateTriggers: {}
        };
        /* eslint-disable max-depth */
        for (const key in defaultProps) {
            if (key in this.props) {
                const propDef = defaultProps[key];
                const propValue = this.props[key];
                newProps[key] = propValue;
                if (propDef && propDef.type === 'accessor') {
                    newProps.updateTriggers[key] = this.props.updateTriggers[key];
                    if (typeof propValue === 'function') {
                        newProps[key] = this.getSubLayerAccessor(propValue);
                    }
                }
            }
        }
        /* eslint-enable max-depth */
        return newProps;
    }
    /* eslint-disable @typescript-eslint/no-empty-function */
    initializeState(context, extension) { }
    updateState(params, extension) { }
    onNeedsRedraw(extension) { }
    getNeedsPickingBuffer(extension) {
        return false;
    }
    draw(params, extension) { }
    finalizeState(context, extension) { }
}
LayerExtension.defaultProps = {};
LayerExtension.extensionName = 'LayerExtension';
export default LayerExtension;
//# sourceMappingURL=layer-extension.js.map