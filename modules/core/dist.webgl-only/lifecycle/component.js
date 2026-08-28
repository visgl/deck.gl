// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { COMPONENT_SYMBOL, PROP_TYPES_SYMBOL, ASYNC_ORIGINAL_SYMBOL, ASYNC_RESOLVED_SYMBOL, ASYNC_DEFAULTS_SYMBOL } from "./constants.js";
import { createProps } from "./create-props.js";
let counter = 0;
class Component {
    constructor(...propObjects) {
        // Merge supplied props with default props and freeze them.
        /* eslint-disable prefer-spread */
        this.props = createProps(this, propObjects);
        /* eslint-enable prefer-spread */
        this.id = this.props.id; // The layer's id, used for matching with layers from last render cycle
        this.count = counter++; // Keep track of how many layer instances you are generating
    }
    // clone this layer with modified props
    clone(newProps) {
        const { props } = this;
        // Async props cannot be copied with Object.assign, copy them separately
        const asyncProps = {};
        // See async props definition in create-props.js
        for (const key in props[ASYNC_DEFAULTS_SYMBOL]) {
            if (key in props[ASYNC_RESOLVED_SYMBOL]) {
                asyncProps[key] = props[ASYNC_RESOLVED_SYMBOL][key];
            }
            else if (key in props[ASYNC_ORIGINAL_SYMBOL]) {
                asyncProps[key] = props[ASYNC_ORIGINAL_SYMBOL][key];
            }
        }
        // Some custom layer implementation may not support multiple arguments in the constructor
        // @ts-ignore
        return new this.constructor({ ...props, ...asyncProps, ...newProps });
    }
}
Component.componentName = 'Component';
Component.defaultProps = {};
export default Component;
//# sourceMappingURL=component.js.map