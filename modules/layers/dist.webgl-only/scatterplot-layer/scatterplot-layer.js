// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, color, project32, picking, UNIT } from '@deck.gl/core';
import { Model, Geometry } from '@luma.gl/engine';
import { scatterplotUniforms } from "./scatterplot-layer-uniforms.js";
import vs from "./scatterplot-layer-vertex.glsl.js";
import fs from "./scatterplot-layer-fragment.glsl.js";
import { getShaderWGSL } from "./scatterplot-layer.wgsl.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
    radiusUnits: 'meters',
    radiusScale: { type: 'number', min: 0, value: 1 },
    radiusMinPixels: { type: 'number', min: 0, value: 0 }, //  min point radius in pixels
    radiusMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER }, // max point radius in pixels
    lineWidthUnits: 'meters',
    lineWidthScale: { type: 'number', min: 0, value: 1 },
    lineWidthMinPixels: { type: 'number', min: 0, value: 0 },
    lineWidthMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER },
    stroked: false,
    filled: true,
    billboard: false,
    antialiasing: true,
    getPosition: { type: 'accessor', value: (x) => x.position },
    getRadius: { type: 'accessor', value: 1 },
    getFillColor: { type: 'accessor', value: DEFAULT_COLOR },
    getLineColor: { type: 'accessor', value: DEFAULT_COLOR },
    getLineWidth: { type: 'accessor', value: 1 },
    getPixelOffset: { type: 'accessor', value: [0, 0] },
    // deprecated
    strokeWidth: { deprecatedFor: 'getLineWidth' },
    outline: { deprecatedFor: 'stroked' },
    getColor: { deprecatedFor: ['getFillColor', 'getLineColor'] }
};
/** Render circles at given coordinates. */
class ScatterplotLayer extends Layer {
    getShaders() {
        const useRowIndexes = Boolean(this.props.data?.attributes?.rowIndexes);
        return super.getShaders({
            vs,
            fs,
            source: getShaderWGSL(useRowIndexes),
            defines: useRowIndexes ? { USE_ROW_INDEXES: true } : {},
            modules: [project32, color, picking, scatterplotUniforms]
        });
    }
    initializeState() {
        const attributes = this.props.data?.attributes?.rowIndexes
            ? {
                /** Caller-provided logical picking index per point instance. */
                rowIndexes: {
                    size: 1,
                    type: 'uint32',
                    noAlloc: true
                }
            }
            : {};
        this.getAttributeManager().addInstanced({
            instancePositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                transition: true,
                accessor: 'getPosition'
            },
            instanceRadius: {
                size: 1,
                transition: true,
                accessor: 'getRadius',
                defaultValue: 1
            },
            instanceFillColors: {
                size: this.props.colorFormat.length,
                transition: true,
                type: 'unorm8',
                accessor: 'getFillColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceLineColors: {
                size: this.props.colorFormat.length,
                transition: true,
                type: 'unorm8',
                accessor: 'getLineColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceLineWidths: {
                size: 1,
                transition: true,
                accessor: 'getLineWidth',
                defaultValue: 1
            },
            instancePixelOffset: {
                size: 2,
                transition: true,
                accessor: 'getPixelOffset'
            },
            ...attributes
        });
    }
    updateState(params) {
        super.updateState(params);
        if (params.changeFlags.extensionsChanged) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            this.getAttributeManager().invalidateAll();
        }
    }
    draw({ uniforms }) {
        const { radiusUnits, radiusScale, radiusMinPixels, radiusMaxPixels, stroked, filled, billboard, antialiasing, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels } = this.props;
        const scatterplotProps = {
            stroked,
            filled,
            billboard,
            antialiasing,
            radiusUnits: UNIT[radiusUnits],
            radiusScale,
            radiusMinPixels,
            radiusMaxPixels,
            lineWidthUnits: UNIT[lineWidthUnits],
            lineWidthScale,
            lineWidthMinPixels,
            lineWidthMaxPixels
        };
        const model = this.state.model;
        model.shaderInputs.setProps({ scatterplot: scatterplotProps });
        model.draw(this.context.renderPass);
    }
    _getModel() {
        // a square that minimally cover the unit circle
        const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
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
ScatterplotLayer.defaultProps = defaultProps;
ScatterplotLayer.layerName = 'ScatterplotLayer';
export default ScatterplotLayer;
//# sourceMappingURL=scatterplot-layer.js.map