// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Model, Geometry } from '@luma.gl/engine';
import { Layer, color, picking } from '@deck.gl/core';
import { createColorRangeTexture, updateColorRangeTexture } from "../common/utils/color-utils.js";
import source from "./screen-grid-cell-layer.wgsl.js";
import vs from "./screen-grid-layer-vertex.glsl.js";
import fs from "./screen-grid-layer-fragment.glsl.js";
import { screenGridUniforms } from "./screen-grid-layer-uniforms.js";
class ScreenGridCellLayer extends Layer {
    getShaders() {
        return super.getShaders({ source, vs, fs, modules: [color, picking, screenGridUniforms] });
    }
    initializeState() {
        this.getAttributeManager().addInstanced({
            instancePositions: {
                size: 2,
                type: 'float32',
                accessor: 'getBin'
            },
            instanceWeights: {
                size: 1,
                type: 'float32',
                accessor: 'getWeight'
            }
        });
        this.state.model = this._getModel();
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const model = this.state.model;
        if (oldProps.colorRange !== props.colorRange) {
            this.state.colorTexture?.destroy();
            this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
            const screenGridProps = { colorRange: this.state.colorTexture };
            model.shaderInputs.setProps({ screenGrid: screenGridProps });
        }
        else if (oldProps.colorScaleType !== props.colorScaleType) {
            updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
        }
        if (oldProps.cellMarginPixels !== props.cellMarginPixels ||
            oldProps.cellSizePixels !== props.cellSizePixels ||
            changeFlags.viewportChanged) {
            const { width, height } = this.context.viewport;
            const { cellSizePixels: gridSize, cellMarginPixels } = this.props;
            const cellSize = Math.max(gridSize - cellMarginPixels, 0);
            const screenGridProps = {
                gridSizeClipspace: [(gridSize / width) * 2, (gridSize / height) * 2],
                cellSizeClipspace: [(cellSize / width) * 2, (cellSize / height) * 2]
            };
            model.shaderInputs.setProps({ screenGrid: screenGridProps });
        }
    }
    finalizeState(context) {
        super.finalizeState(context);
        this.state.colorTexture?.destroy();
    }
    draw({ uniforms }) {
        const colorDomain = this.props.colorDomain();
        const model = this.state.model;
        const screenGridProps = { colorDomain };
        model.shaderInputs.setProps({ screenGrid: screenGridProps });
        model.draw(this.context.renderPass);
    }
    // Private Methods
    _getModel() {
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            geometry: new Geometry({
                topology: 'triangle-strip',
                attributes: {
                    positions: {
                        value: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
                        size: 2
                    }
                }
            }),
            isInstanced: true
        });
    }
}
ScreenGridCellLayer.layerName = 'ScreenGridCellLayer';
export default ScreenGridCellLayer;
//# sourceMappingURL=screen-grid-cell-layer.js.map