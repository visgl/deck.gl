// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import View from "./view.js";
import WebMercatorViewport from "../viewports/web-mercator-viewport.js";
import MapController from "../controllers/map-controller.js";
class MapView extends View {
    constructor(props = {}) {
        super(props);
    }
    getViewportType() {
        return WebMercatorViewport;
    }
    get ControllerType() {
        return MapController;
    }
}
MapView.displayName = 'MapView';
export default MapView;
//# sourceMappingURL=map-view.js.map