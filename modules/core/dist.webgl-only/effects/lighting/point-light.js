// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { projectPosition } from "../../shaderlib/project/project-functions.js";
import { COORDINATE_SYSTEM } from "../../lib/constants.js";
const DEFAULT_LIGHT_COLOR = [255, 255, 255];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_ATTENUATION = [1, 0, 0];
const DEFAULT_LIGHT_POSITION = [0.0, 0.0, 1.0];
let idCount = 0;
export class PointLight {
    constructor(props = {}) {
        this.type = 'point';
        const { color = DEFAULT_LIGHT_COLOR } = props;
        const { intensity = DEFAULT_LIGHT_INTENSITY } = props;
        const { position = DEFAULT_LIGHT_POSITION } = props;
        this.id = props.id || `point-${idCount++}`;
        this.color = color;
        this.intensity = intensity;
        this.type = 'point';
        this.position = position;
        this.attenuation = getAttenuation(props);
        this.projectedLight = { ...this };
    }
    getProjectedLight({ layer }) {
        const { projectedLight } = this;
        const viewport = layer.context.viewport;
        const { coordinateSystem, coordinateOrigin } = layer.props;
        const position = projectPosition(this.position, {
            viewport,
            coordinateSystem,
            coordinateOrigin,
            fromCoordinateSystem: viewport.isGeospatial
                ? COORDINATE_SYSTEM.LNGLAT
                : COORDINATE_SYSTEM.CARTESIAN,
            fromCoordinateOrigin: [0, 0, 0]
        });
        projectedLight.color = this.color;
        projectedLight.intensity = this.intensity;
        projectedLight.position = position;
        return projectedLight;
    }
}
function getAttenuation(props) {
    if (props.attenuation) {
        return props.attenuation;
    }
    return DEFAULT_ATTENUATION;
}
//# sourceMappingURL=point-light.js.map