// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Base class for passes
 * @todo v9 - should the luma.gl RenderPass be owned by this class?
 * Currently owned by subclasses
 */
export default class Pass {
    /** Create a new Pass instance */
    constructor(device, props = { id: 'pass' }) {
        const { id } = props;
        this.id = id; // id of this pass
        this.device = device;
        this.props = { ...props };
    }
    setProps(props) {
        Object.assign(this.props, props);
    }
    render(params) { } // eslint-disable-line @typescript-eslint/no-empty-function
    cleanup() { } // eslint-disable-line @typescript-eslint/no-empty-function
}
//# sourceMappingURL=pass.js.map