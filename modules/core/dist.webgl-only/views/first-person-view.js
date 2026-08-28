// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import View from "./view.js";
import FirstPersonViewport from "../viewports/first-person-viewport.js";
import FirstPersonController from "../controllers/first-person-controller.js";
class FirstPersonView extends View {
    constructor(props = {}) {
        super(props);
    }
    getViewportType() {
        return FirstPersonViewport;
    }
    get ControllerType() {
        return FirstPersonController;
    }
}
FirstPersonView.displayName = 'FirstPersonView';
export default FirstPersonView;
//# sourceMappingURL=first-person-view.js.map