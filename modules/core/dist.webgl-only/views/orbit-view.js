// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import View from "./view.js";
import OrbitViewport from "../viewports/orbit-viewport.js";
import OrbitController from "../controllers/orbit-controller.js";
class OrbitView extends View {
    constructor(props = {}) {
        super(props);
        this.props.orbitAxis = props.orbitAxis || 'Z';
    }
    getViewportType() {
        return OrbitViewport;
    }
    get ControllerType() {
        return OrbitController;
    }
}
OrbitView.displayName = 'OrbitView';
export default OrbitView;
//# sourceMappingURL=orbit-view.js.map