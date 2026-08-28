// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import View from "./view.js";
import OrthographicViewport from "../viewports/orthographic-viewport.js";
import OrthographicController from "../controllers/orthographic-controller.js";
class OrthographicView extends View {
    constructor(props = {}) {
        super(props);
    }
    getViewportType() {
        return OrthographicViewport;
    }
    get ControllerType() {
        return OrthographicController;
    }
}
OrthographicView.displayName = 'OrthographicView';
export default OrthographicView;
//# sourceMappingURL=orthographic-view.js.map