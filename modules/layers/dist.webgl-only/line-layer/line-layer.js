// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, project32, color, picking, UNIT } from '@deck.gl/core';
import { Model, Geometry } from '@luma.gl/engine';
import { lineUniforms } from "./line-layer-uniforms.js";
import { shaderWGSL } from "./line-layer.wgsl.js";
import vs from "./line-layer-vertex.glsl.js";
import fs from "./line-layer-fragment.glsl.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
    getSourcePosition: { type: 'accessor', value: (x) => x.sourcePosition },
    getTargetPosition: { type: 'accessor', value: (x) => x.targetPosition },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    getWidth: { type: 'accessor', value: 1 },
    widthUnits: 'pixels',
    widthScale: { type: 'number', value: 1, min: 0 },
    widthMinPixels: { type: 'number', value: 0, min: 0 },
    widthMaxPixels: { type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0 },
    antialiasing: false
};
/**
 * A layer that renders straight lines joining pairs of source and target coordinates.
 */
class LineLayer extends Layer {
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
            modules: [project32, color, picking, lineUniforms]
        });
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
            instanceColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceWidths: {
                size: 1,
                transition: true,
                accessor: 'getWidth',
                defaultValue: 1
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
        const { widthUnits, widthScale, widthMinPixels, widthMaxPixels, wrapLongitude } = this.props;
        const model = this.state.model;
        const lineProps = {
            widthUnits: UNIT[widthUnits],
            widthScale,
            widthMinPixels,
            widthMaxPixels,
            useShortestPath: wrapLongitude ? 1 : 0
        };
        model.shaderInputs.setProps({ line: lineProps });
        model.draw(this.context.renderPass);
        if (wrapLongitude) {
            // Render a second copy for the clipped lines at the 180th meridian
            model.shaderInputs.setProps({ line: { ...lineProps, useShortestPath: -1 } });
            model.draw(this.context.renderPass);
        }
    }
    _getModel() {
        /*
         *  (0, -1)-------------_(1, -1)
         *       |          _,-"  |
         *       o      _,-"      o
         *       |  _,-"          |
         *   (0, 1)"-------------(1, 1)
         */
        const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            geometry: new Geometry({
                topology: 'triangle-strip',
                attributes: {
                    positions: { size: 3, value: new Float32Array(positions) }
                }
            }),
            isInstanced: true
        });
    }
}
LineLayer.layerName = 'LineLayer';
LineLayer.defaultProps = defaultProps;
export default LineLayer;
//# sourceMappingURL=line-layer.js.map