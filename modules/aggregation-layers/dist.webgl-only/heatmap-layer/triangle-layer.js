// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Model } from '@luma.gl/engine';
import { Layer, color, project32 } from '@deck.gl/core';
import source from "./triangle-layer.wgsl.js";
import vs from "./triangle-layer-vertex.glsl.js";
import fs from "./triangle-layer-fragment.glsl.js";
import { triangleUniforms } from "./triangle-layer-uniforms.js";
class TriangleLayer extends Layer {
    getShaders() {
        return super.getShaders({ source, vs, fs, modules: [project32, color, triangleUniforms] });
    }
    initializeState({ device }) {
        this.setState({ model: this._getModel(device) });
    }
    _getModel(device) {
        const { vertexCount, data } = this.props;
        return new Model(device, {
            ...this.getShaders(),
            id: this.props.id,
            attributes: data.attributes,
            bufferLayout: [
                { name: 'positions', format: 'float32x3' },
                { name: 'texCoords', format: 'float32x2' }
            ],
            topology: 'triangle-strip',
            vertexCount
        });
    }
    draw() {
        const { model } = this.state;
        const { aggregationMode, colorDomain, intensity, threshold, colorTexture, maxTexture, weightsTexture } = this.props;
        const triangleProps = {
            aggregationMode,
            colorDomain,
            intensity,
            threshold,
            colorTexture,
            maxTexture,
            weightsTexture
        };
        model.shaderInputs.setProps({ triangle: triangleProps });
        model.draw(this.context.renderPass);
    }
}
TriangleLayer.layerName = 'TriangleLayer';
export default TriangleLayer;
//# sourceMappingURL=triangle-layer.js.map