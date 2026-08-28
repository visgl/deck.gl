// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { createIterable } from '@deck.gl/core';
import { PathLayer } from '@deck.gl/layers';
import { tripsUniforms } from "./trips-layer-uniforms.js";
import { packTripTimestamps, tripsShaderInjectionsWGSL } from "./trips-layer.wgsl.js";
const defaultProps = {
    fadeTrail: true,
    trailLength: { type: 'number', value: 120, min: 0 },
    currentTime: { type: 'number', value: 0, min: 0 },
    getTimestamps: { type: 'accessor', value: (d) => d.timestamps }
};
const tripsShaderInjectionsGLSL = {
    'vs:#decl': `\
in float instanceTimestamps;
in float instanceNextTimestamps;
out float vTime;
`,
    // Timestamp of the vertex
    'vs:#main-end': `\
vTime = instanceTimestamps + (instanceNextTimestamps - instanceTimestamps) * vPathPosition.y / vPathLength;
`,
    'fs:#decl': `\
in float vTime;
`,
    // Drop segments only after PathLayer evaluates analytic-coverage derivatives, then
    // fade the color (currentTime - 100%, end of trail - 0%).
    'fs:DECKGL_FILTER_COLOR': `\
if(vTime > trips.currentTime || (trips.fadeTrail && (vTime < trips.currentTime - trips.trailLength))) {
  discard;
}
if(trips.fadeTrail) {
  color.a *= 1.0 - (trips.currentTime - vTime) / trips.trailLength;
}
`
};
/** Render animated paths that represent vehicle trips. */
class TripsLayer extends PathLayer {
    getShaders() {
        const shaders = super.getShaders();
        shaders.inject =
            tripsShaderInjectionsGLSL;
        shaders.modules = [...shaders.modules, tripsUniforms];
        return shaders;
    }
    initializeState() {
        super.initializeState();
        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            ...({
                timestamps: {
                    size: 1,
                    accessor: 'getTimestamps',
                    shaderAttributes: {
                        instanceTimestamps: {
                            vertexOffset: 0
                        },
                        instanceNextTimestamps: {
                            vertexOffset: 1
                        }
                    }
                }
            })
        });
    }
    /** Materialize timestamps in the same per-path instance layout as the path tessellator. */
    calculateWebGPUTimestamps(attribute, { data, props }) {
        const { pathTesselator } = this.state;
        const { instanceCount, vertexStarts } = pathTesselator;
        const packedTimestamps = new Float32Array(instanceCount * 2);
        const { iterable, objectInfo } = createIterable(data);
        for (const object of iterable) {
            objectInfo.index++;
            const vertexStart = vertexStarts[objectInfo.index];
            const vertexEnd = vertexStarts[objectInfo.index + 1] ?? instanceCount;
            if (vertexEnd <= vertexStart) {
                continue;
            }
            const timestamps = props.getTimestamps?.(object, objectInfo) ?? [];
            packedTimestamps.set(packTripTimestamps(timestamps, vertexEnd - vertexStart, props._pathType === 'loop'), vertexStart * 2);
        }
        attribute.startIndices = vertexStarts;
        attribute.value = packedTimestamps;
    }
    draw(params) {
        const { fadeTrail, trailLength, currentTime } = this.props;
        const tripsProps = { fadeTrail, trailLength, currentTime };
        const model = this.state.model;
        model.shaderInputs.setProps({ trips: tripsProps });
        super.draw(params);
    }
}
TripsLayer.layerName = 'TripsLayer';
TripsLayer.defaultProps = defaultProps;
export default TripsLayer;
//# sourceMappingURL=trips-layer.js.map