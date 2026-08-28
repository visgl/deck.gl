// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { log, createIterable } from '@deck.gl/core';
import IconLayer from "../../icon-layer/icon-layer.js";
import { sdfUniforms } from "./sdf-uniforms.js";
import { textUniforms } from "../text-uniforms.js";
import vs from "./multi-icon-layer-vertex.glsl.js";
import fs from "./multi-icon-layer-fragment.glsl.js";
import { shaderWGSL as source } from "./multi-icon-layer.wgsl.js";
// TODO expose as layer properties
const DEFAULT_BUFFER = 192.0 / 256;
const EMPTY_ARRAY = [];
const defaultProps = {
    getIconOffsets: { type: 'accessor', value: (x) => x.offsets },
    getContentBox: { type: 'accessor', value: [0, 0, -1, -1] },
    fontSize: 1,
    alphaCutoff: 0.001,
    smoothing: 0.1,
    outlineWidth: 0,
    outlineColor: { type: 'color', value: [0, 0, 0, 255] },
    contentCutoffPixels: { type: 'array', value: [0, 0] },
    contentAlignHorizontal: 'none',
    contentAlignVertical: 'none'
};
class MultiIconLayer extends IconLayer {
    getShaders() {
        const shaders = super.getShaders();
        return {
            ...shaders,
            modules: [...shaders.modules, textUniforms, sdfUniforms],
            vs,
            fs,
            source
        };
    }
    initializeState() {
        super.initializeState();
        const attributeManager = this.getAttributeManager();
        const instanceIconDefs = attributeManager.attributes.instanceIconDefs;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        instanceIconDefs.settings.update = this.calculateInstanceIconDefs;
        attributeManager.addInstanced({
            /** Source text row for each generated character instance. */
            rowIndexes: {
                type: 'uint32',
                size: 1,
                bufferGroup: 'icon-instance-data',
                accessor: (object, { index }) => index
            },
            instanceClipRect: {
                size: 4,
                bufferGroup: 'icon-instance-data',
                accessor: 'getContentBox',
                defaultValue: [0, 0, -1, -1]
            }
        });
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const { outlineColor } = props;
        if (changeFlags.updateTriggersChanged &&
            (changeFlags.updateTriggersChanged.getIcon ||
                changeFlags.updateTriggersChanged.getIconOffsets)) {
            this.getAttributeManager().invalidate('instanceIconDefs');
        }
        if (outlineColor !== oldProps.outlineColor) {
            const normalizedOutlineColor = [
                outlineColor[0] / 255,
                outlineColor[1] / 255,
                outlineColor[2] / 255,
                (outlineColor[3] ?? 255) / 255
            ];
            this.setState({
                outlineColor: normalizedOutlineColor
            });
        }
        if (!props.sdf && props.outlineWidth) {
            log.warn(`${this.id}: fontSettings.sdf is required to render outline`)();
        }
    }
    draw(params) {
        const { sdf, smoothing, fontSize, outlineWidth, contentCutoffPixels, contentAlignHorizontal, contentAlignVertical } = this.props;
        const { outlineColor } = this.state;
        const outlineBuffer = outlineWidth
            ? Math.max(smoothing, DEFAULT_BUFFER * (1 - outlineWidth))
            : -1;
        const model = this.state.model;
        const sdfProps = {
            buffer: DEFAULT_BUFFER,
            outlineBuffer,
            gamma: smoothing,
            enabled: Boolean(sdf),
            outlineColor
        };
        const textProps = {
            contentCutoffPixels,
            contentAlignHorizontal,
            contentAlignVertical,
            fontSize,
            viewport: this.context.viewport
        };
        model.shaderInputs.setProps({ sdf: sdfProps, text: textProps });
        super.draw(params);
        // draw text without outline on top to ensure a thick outline won't occlude other characters
        if (sdf && outlineWidth) {
            const { iconManager } = this.state;
            const iconsTexture = iconManager.getTexture();
            if (iconsTexture) {
                model.shaderInputs.setProps({ sdf: { ...sdfProps, outlineBuffer: DEFAULT_BUFFER } });
                model.draw(this.context.renderPass);
            }
        }
    }
    calculateInstanceIconDefs(attribute, { startRow, endRow }) {
        const { data, getIcon, getIconOffsets } = this.props;
        let i = attribute.getVertexOffset(startRow);
        const output = attribute.value;
        const { iterable, objectInfo } = createIterable(data, startRow, endRow);
        for (const object of iterable) {
            objectInfo.index++;
            const text = getIcon(object, objectInfo); // forwarded getText
            const offsets = getIconOffsets(object, objectInfo); // text length x 2
            if (text) {
                let j = 0;
                for (const char of Array.from(text)) {
                    const def = super.getInstanceIconDef(char);
                    def[0] = offsets[j * 2];
                    def[1] += offsets[j * 2 + 1];
                    def[6] = 1; // mask
                    output.set(def, i);
                    i += attribute.size;
                    j++;
                }
            }
        }
    }
}
MultiIconLayer.defaultProps = defaultProps;
MultiIconLayer.layerName = 'MultiIconLayer';
export default MultiIconLayer;
//# sourceMappingURL=multi-icon-layer.js.map