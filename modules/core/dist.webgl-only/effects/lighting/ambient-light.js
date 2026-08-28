// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const DEFAULT_LIGHT_COLOR = [255, 255, 255];
const DEFAULT_LIGHT_INTENSITY = 1.0;
let idCount = 0;
export class AmbientLight {
    constructor(props = {}) {
        this.type = 'ambient';
        const { color = DEFAULT_LIGHT_COLOR } = props;
        const { intensity = DEFAULT_LIGHT_INTENSITY } = props;
        this.id = props.id || `ambient-${idCount++}`;
        this.color = color;
        this.intensity = intensity;
    }
}
//# sourceMappingURL=ambient-light.js.map