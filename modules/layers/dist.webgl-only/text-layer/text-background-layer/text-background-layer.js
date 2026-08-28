// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, color, project32, picking, UNIT } from '@deck.gl/core';
import { Geometry } from '@luma.gl/engine';
import { Model } from '@luma.gl/engine';
import { textBackgroundUniforms } from "./text-background-layer-uniforms.js";
import { textUniforms } from "../text-uniforms.js";
import vs from "./text-background-layer-vertex.glsl.js";
import fs from "./text-background-layer-fragment.glsl.js";
import source from "./text-background-layer.wgsl.js";
const defaultProps = {
    billboard: true,
    sizeScale: 1,
    sizeUnits: 'pixels',
    sizeMinPixels: 0,
    sizeMaxPixels: Number.MAX_SAFE_INTEGER,
    fontSize: 1,
    borderRadius: { type: 'object', value: 0 },
    padding: { type: 'array', value: [0, 0, 0, 0] },
    getPosition: { type: 'accessor', value: (x) => x.position },
    getSize: { type: 'accessor', value: 1 },
    getAngle: { type: 'accessor', value: 0 },
    getPixelOffset: { type: 'accessor', value: [0, 0] },
    getBoundingRect: { type: 'accessor', value: [0, 0, 0, 0] },
    getClipRect: { type: 'accessor', value: [0, 0, -1, -1] },
    getFillColor: { type: 'accessor', value: [0, 0, 0, 255] },
    getLineColor: { type: 'accessor', value: [0, 0, 0, 255] },
    getLineWidth: { type: 'accessor', value: 1 }
};
class TextBackgroundLayer extends Layer {
    getShaders() {
        return super.getShaders({
            vs,
            fs,
            source,
            modules: [project32, color, picking, textBackgroundUniforms, textUniforms]
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
            // Interleave six inputs to stay below WebGPU's portable vertex-buffer and storage-buffer limits.
            instanceSizes: {
                size: 1,
                transition: true,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getSize',
                defaultValue: 1
            },
            instanceAngles: {
                size: 1,
                transition: true,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getAngle'
            },
            instanceRects: {
                size: 4,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getBoundingRect'
            },
            instanceClipRect: {
                size: 4,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getClipRect',
                defaultValue: [0, 0, -1, -1]
            },
            instancePixelOffsets: {
                size: 2,
                transition: true,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getPixelOffset'
            },
            instanceFillColors: {
                size: 4,
                transition: true,
                type: 'unorm8',
                accessor: 'getFillColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceLineColors: {
                size: 4,
                transition: true,
                type: 'unorm8',
                accessor: 'getLineColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceLineWidths: {
                size: 1,
                transition: true,
                bufferGroup: 'text-background-instance-data',
                accessor: 'getLineWidth',
                defaultValue: 1
            }
        });
    }
    updateState(params) {
        super.updateState(params);
        const { changeFlags } = params;
        if (changeFlags.extensionsChanged) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            this.getAttributeManager().invalidateAll();
        }
    }
    draw({ uniforms }) {
        const { billboard, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, getLineWidth, fontSize } = this.props;
        let { padding, borderRadius } = this.props;
        if (padding.length < 4) {
            padding = [padding[0], padding[1], padding[0], padding[1]];
        }
        if (!Array.isArray(borderRadius)) {
            borderRadius = [
                borderRadius,
                borderRadius,
                borderRadius,
                borderRadius
            ];
        }
        const model = this.state.model;
        const textBackgroundProps = {
            billboard,
            stroked: Boolean(getLineWidth),
            borderRadius: borderRadius,
            padding: padding,
            sizeUnits: UNIT[sizeUnits],
            sizeScale,
            sizeMinPixels,
            sizeMaxPixels
        };
        const textProps = {
            fontSize,
            viewport: this.context.viewport
        };
        model.shaderInputs.setProps({ textBackground: textBackgroundProps, text: textProps });
        model.draw(this.context.renderPass);
    }
    _getModel() {
        // a square that minimally cover the unit circle
        const positions = [0, 0, 1, 0, 0, 1, 1, 1];
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            geometry: new Geometry({
                topology: 'triangle-strip',
                vertexCount: 4,
                attributes: {
                    positions: { size: 2, value: new Float32Array(positions) }
                }
            }),
            isInstanced: true
        });
    }
}
TextBackgroundLayer.defaultProps = defaultProps;
TextBackgroundLayer.layerName = 'TextBackgroundLayer';
export default TextBackgroundLayer;
//# sourceMappingURL=text-background-layer.js.map