// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { DirectionalLight } from "./directional-light.js";
import { getSunDirection } from '@math.gl/sun';
export default class SunLight extends DirectionalLight {
    constructor(opts) {
        super(opts);
        this.timestamp = opts.timestamp;
    }
    getProjectedLight({ layer }) {
        const { viewport } = layer.context;
        const isGlobe = viewport.resolution && viewport.resolution > 0;
        if (isGlobe) {
            // Rotate vector to align with the direction of the globe projection (up at lon:0,lat:0 is [0, -1, 0])
            const [x, y, z] = getSunDirection(this.timestamp, 0, 0);
            this.direction = [x, -z, y];
        }
        else {
            // @ts-expect-error longitude and latitude are not defined on all viewports
            const { latitude, longitude } = viewport;
            this.direction = getSunDirection(this.timestamp, latitude, longitude);
        }
        return this;
    }
}
//# sourceMappingURL=sun-light.js.map