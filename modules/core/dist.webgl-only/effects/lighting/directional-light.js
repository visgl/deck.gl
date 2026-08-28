// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Vector3 } from '@math.gl/core';
const DEFAULT_LIGHT_COLOR = [255, 255, 255];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_LIGHT_DIRECTION = [0.0, 0.0, -1.0];
let idCount = 0;
export class DirectionalLight {
    constructor(props = {}) {
        this.type = 'directional';
        const { color = DEFAULT_LIGHT_COLOR } = props;
        const { intensity = DEFAULT_LIGHT_INTENSITY } = props;
        const { direction = DEFAULT_LIGHT_DIRECTION } = props;
        const { _shadow = false } = props;
        this.id = props.id || `directional-${idCount++}`;
        this.color = color;
        this.intensity = intensity;
        this.type = 'directional';
        this.direction = new Vector3(direction).normalize().toArray();
        this.shadow = _shadow;
    }
    getProjectedLight(opts) {
        return this;
    }
}
//# sourceMappingURL=directional-light.js.map