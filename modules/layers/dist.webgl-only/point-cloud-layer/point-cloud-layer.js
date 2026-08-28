// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, color, project32, picking, UNIT } from '@deck.gl/core';
import { gouraudMaterial } from '@deck.gl/core';
import { Model, Geometry } from '@luma.gl/engine';
import { pointCloudUniforms } from "./point-cloud-layer-uniforms.js";
import vs from "./point-cloud-layer-vertex.glsl.js";
import fs from "./point-cloud-layer-fragment.glsl.js";
import { shaderWGSL } from "./point-cloud-layer.wgsl.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const DEFAULT_NORMAL = [0, 0, 1];
const defaultProps = {
    sizeUnits: 'pixels',
    pointSize: { type: 'number', min: 0, value: 10 }, //  point radius in pixels
    antialiasing: false,
    getPosition: { type: 'accessor', value: (x) => x.position },
    getNormal: { type: 'accessor', value: DEFAULT_NORMAL },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    material: true,
    // Depreated
    radiusPixels: { deprecatedFor: 'pointSize' }
};
// support loaders.gl point cloud format
function normalizeData(data) {
    const { header, attributes } = data;
    if (!header || !attributes) {
        return;
    }
    data.length = header.vertexCount;
    if (attributes.POSITION) {
        attributes.instancePositions = attributes.POSITION;
    }
    if (attributes.NORMAL) {
        attributes.instanceNormals = attributes.NORMAL;
    }
    if (attributes.COLOR_0) {
        const { size, value } = attributes.COLOR_0;
        attributes.instanceColors = { size, type: 'unorm8', value };
    }
}
/** Render a point cloud with 3D positions, normals and colors. */
class PointCloudLayer extends Layer {
    getShaders() {
        const { antialiasing } = this.props;
        return super.getShaders({
            vs,
            fs,
            source: shaderWGSL,
            defines: antialiasing ? { ANTIALIASING: 1 } : {},
            modules: [project32, color, gouraudMaterial, picking, pointCloudUniforms]
        });
    }
    initializeState() {
        this.getAttributeManager().addInstanced({
            instancePositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                transition: true,
                accessor: 'getPosition'
            },
            instanceNormals: {
                size: 3,
                transition: true,
                accessor: 'getNormal',
                defaultValue: DEFAULT_NORMAL
            },
            instanceColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getColor',
                defaultValue: DEFAULT_COLOR
            }
        });
    }
    updateState(params) {
        const { changeFlags, props, oldProps } = params;
        super.updateState(params);
        if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            this.getAttributeManager().invalidateAll();
        }
        if (changeFlags.dataChanged) {
            normalizeData(props.data);
        }
    }
    draw({ uniforms }) {
        const { pointSize, sizeUnits } = this.props;
        const model = this.state.model;
        const pointCloudProps = {
            sizeUnits: UNIT[sizeUnits],
            radiusPixels: pointSize
        };
        model.shaderInputs.setProps({ pointCloud: pointCloudProps });
        model.draw(this.context.renderPass);
    }
    _getModel() {
        // a triangle that minimally cover the unit circle
        const positions = [];
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
        }
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            geometry: new Geometry({
                topology: 'triangle-list',
                attributes: {
                    positions: new Float32Array(positions)
                }
            }),
            isInstanced: true
        });
    }
}
PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;
export default PointCloudLayer;
//# sourceMappingURL=point-cloud-layer.js.map