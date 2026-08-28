// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, project32, color, picking, UNIT } from '@deck.gl/core';
import { Model } from '@luma.gl/engine';
import { arcUniforms } from "./arc-layer-uniforms.js";
import { shaderWGSL } from "./arc-layer.wgsl.js";
import vs from "./arc-layer-vertex.glsl.js";
import fs from "./arc-layer-fragment.glsl.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
    getSourcePosition: { type: 'accessor', value: (x) => x.sourcePosition },
    getTargetPosition: { type: 'accessor', value: (x) => x.targetPosition },
    getSourceColor: { type: 'accessor', value: DEFAULT_COLOR },
    getTargetColor: { type: 'accessor', value: DEFAULT_COLOR },
    getWidth: { type: 'accessor', value: 1 },
    getHeight: { type: 'accessor', value: 1 },
    getTilt: { type: 'accessor', value: 0 },
    greatCircle: false,
    numSegments: { type: 'number', value: 50, min: 1 },
    widthUnits: 'pixels',
    widthScale: { type: 'number', value: 1, min: 0 },
    widthMinPixels: { type: 'number', value: 0, min: 0 },
    widthMaxPixels: { type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0 },
    antialiasing: false
};
/** Render raised arcs joining pairs of source and target coordinates. */
class ArcLayer extends Layer {
    getBounds() {
        return this.getAttributeManager()?.getBounds([
            'instanceSourcePositions',
            'instanceTargetPositions'
        ]);
    }
    getShaders() {
        const { antialiasing } = this.props;
        return super.getShaders({
            vs,
            fs,
            source: shaderWGSL,
            defines: antialiasing ? { ANTIALIASING: 1 } : {},
            modules: [project32, color, picking, arcUniforms]
        }); // 'project' module added by default.
    }
    // This layer has its own wrapLongitude logic
    get wrapLongitude() {
        return false;
    }
    initializeState() {
        const attributeManager = this.getAttributeManager();
        /* eslint-disable max-len */
        attributeManager.addInstanced({
            instanceSourcePositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                transition: true,
                accessor: 'getSourcePosition'
            },
            instanceTargetPositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                transition: true,
                accessor: 'getTargetPosition'
            },
            instanceSourceColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getSourceColor',
                defaultValue: DEFAULT_COLOR
            },
            instanceTargetColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getTargetColor',
                defaultValue: DEFAULT_COLOR
            },
            instanceWidths: {
                size: 1,
                transition: true,
                accessor: 'getWidth',
                defaultValue: 1
            },
            instanceHeights: {
                size: 1,
                transition: true,
                accessor: 'getHeight',
                defaultValue: 1
            },
            instanceTilts: {
                size: 1,
                transition: true,
                accessor: 'getTilt',
                defaultValue: 0
            }
        });
        /* eslint-enable max-len */
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            this.getAttributeManager().invalidateAll();
        }
    }
    draw({ uniforms }) {
        const { widthUnits, widthScale, widthMinPixels, widthMaxPixels, greatCircle, wrapLongitude, numSegments } = this.props;
        const arcProps = {
            numSegments,
            widthUnits: UNIT[widthUnits],
            widthScale,
            widthMinPixels,
            widthMaxPixels,
            greatCircle,
            useShortestPath: wrapLongitude
        };
        const model = this.state.model;
        model.shaderInputs.setProps({ arc: arcProps });
        model.setVertexCount(numSegments * 2);
        model.draw(this.context.renderPass);
    }
    _getModel() {
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            topology: 'triangle-strip',
            isInstanced: true
        });
    }
}
ArcLayer.layerName = 'ArcLayer';
ArcLayer.defaultProps = defaultProps;
export default ArcLayer;
//# sourceMappingURL=arc-layer.js.map