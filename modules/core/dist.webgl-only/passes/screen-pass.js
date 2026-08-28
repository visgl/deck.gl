// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { ClipSpace } from '@luma.gl/engine';
import Pass from "./pass.js";
import { screenUniforms } from "./screen-pass-uniforms.js";
/** A base render pass. */
export default class ScreenPass extends Pass {
    constructor(device, props) {
        super(device, props);
        const { module, fs, id } = props;
        const parameters = {
            depthWriteEnabled: false,
            depthCompare: 'always',
            depthBias: 0,
            blend: true,
            blendColorSrcFactor: 'one',
            blendColorDstFactor: 'one-minus-src-alpha',
            blendAlphaSrcFactor: 'one',
            blendAlphaDstFactor: 'one-minus-src-alpha',
            blendColorOperation: 'add',
            blendAlphaOperation: 'add'
        };
        this.model = new ClipSpace(device, { id, fs, modules: [module, screenUniforms], parameters });
    }
    render(params) {
        this._renderPass(this.device, params);
    }
    delete() {
        this.model.destroy();
        this.model = null;
    }
    // Private methods
    /**
     * Renders the pass.
     * This is an abstract method that should be overridden.
     * @param inputBuffer - Frame buffer that contains the result of the previous pass
     * @param outputBuffer - Frame buffer that serves as the output render target
     */
    _renderPass(device, options) {
        const { clearCanvas, inputBuffer, outputBuffer } = options;
        const texSize = [inputBuffer.width, inputBuffer.height];
        const screenProps = {
            texSrc: inputBuffer.colorAttachments[0],
            texSize
        };
        this.model.shaderInputs.setProps({
            screen: screenProps,
            ...options.moduleProps
        });
        const renderPass = this.device.beginRenderPass({
            framebuffer: outputBuffer,
            parameters: { viewport: [0, 0, ...texSize] },
            clearColor: clearCanvas ? [0, 0, 0, 0] : false,
            clearDepth: 1,
            clearStencil: false
        });
        this.model.draw(renderPass);
        renderPass.end();
    }
}
//# sourceMappingURL=screen-pass.js.map