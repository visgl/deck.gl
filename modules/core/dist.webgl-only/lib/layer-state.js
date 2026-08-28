// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// deck.gl, MIT license
import ComponentState from "../lifecycle/component-state.js";
export default class LayerState extends ComponentState {
    constructor({ attributeManager, layer }) {
        super(layer);
        this.attributeManager = attributeManager;
        this.needsRedraw = true;
        this.needsUpdate = true;
        this.subLayers = null;
        this.usesPickingColorCache = false;
        this.disabledPickingIndices = [];
    }
    get layer() {
        return this.component;
    }
    /* Override base Component methods with Layer-specific handling */
    _fetch(propName, url) {
        const layer = this.layer;
        const fetch = layer?.props.fetch;
        if (fetch) {
            return fetch(url, { propName, layer });
        }
        return super._fetch(propName, url);
    }
    _onResolve(propName, value) {
        const layer = this.layer;
        if (layer) {
            const onDataLoad = layer.props.onDataLoad;
            if (propName === 'data' && onDataLoad) {
                onDataLoad(value, { propName, layer });
            }
        }
    }
    _onError(propName, error) {
        const layer = this.layer;
        if (layer) {
            layer.raiseError(error, `loading ${propName} of ${this.layer}`);
        }
    }
}
//# sourceMappingURL=layer-state.js.map