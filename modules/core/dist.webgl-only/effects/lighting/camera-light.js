// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { PointLight } from "./point-light.js";
import { getUniformsFromViewport } from "../../shaderlib/project/viewport-uniforms.js";
export default class CameraLight extends PointLight {
    getProjectedLight({ layer }) {
        const { projectedLight } = this;
        const viewport = layer.context.viewport;
        const { coordinateSystem, coordinateOrigin, modelMatrix } = layer.props;
        const { cameraPosition } = getUniformsFromViewport({
            viewport,
            modelMatrix: modelMatrix,
            coordinateSystem,
            coordinateOrigin
        });
        projectedLight.color = this.color;
        projectedLight.intensity = this.intensity;
        projectedLight.position = cameraPosition;
        return projectedLight;
    }
}
//# sourceMappingURL=camera-light.js.map