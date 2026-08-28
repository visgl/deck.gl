// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export default class ViewState {
    constructor(props, state, makeViewport, constraintContext) {
        this.makeViewport = makeViewport;
        this._viewportProps = this.applyConstraints(props, constraintContext);
        this._state = state;
    }
    getViewportProps() {
        return this._viewportProps;
    }
    getState() {
        return this._state;
    }
}
//# sourceMappingURL=view-state.js.map