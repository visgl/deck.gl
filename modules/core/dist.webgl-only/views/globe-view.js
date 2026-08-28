// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import View from "./view.js";
import GlobeViewport from "../viewports/globe-viewport.js";
import WebMercatorViewport from "../viewports/web-mercator-viewport.js";
import GlobeController from "../controllers/globe-controller.js";
const GLOBE_VIEW_DEFAULT_PARAMETERS = {
    cullMode: 'back'
};
class GlobeView extends View {
    constructor(props = {}) {
        super({
            ...props,
            parameters: {
                ...GLOBE_VIEW_DEFAULT_PARAMETERS,
                ...props.parameters
            }
        });
    }
    getViewportType(viewState) {
        return viewState.zoom > 12 ? WebMercatorViewport : GlobeViewport;
    }
    get ControllerType() {
        return GlobeController;
    }
}
GlobeView.displayName = 'GlobeView';
export default GlobeView;
//# sourceMappingURL=globe-view.js.map