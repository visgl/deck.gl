// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, color, project32, picking, log, UNIT } from '@deck.gl/core';
import { Model, Geometry } from '@luma.gl/engine';
import { iconUniforms } from "./icon-layer-uniforms.js";
import vs from "./icon-layer-vertex.glsl.js";
import fs from "./icon-layer-fragment.glsl.js";
import { getShaderWGSL } from "./icon-layer.wgsl.js";
import IconManager from "./icon-manager.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
    iconAtlas: { type: 'image', value: null, async: true },
    iconMapping: { type: 'object', value: {}, async: true },
    sizeScale: { type: 'number', value: 1, min: 0 },
    billboard: true,
    sizeUnits: 'pixels',
    sizeBasis: 'height',
    sizeMinPixels: { type: 'number', min: 0, value: 0 }, //  min point radius in pixels
    sizeMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER }, // max point radius in pixels
    alphaCutoff: { type: 'number', value: 0.05, min: 0, max: 1 },
    getPosition: { type: 'accessor', value: (x) => x.position },
    getIcon: { type: 'accessor', value: (x) => x.icon },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    getSize: { type: 'accessor', value: 1 },
    getAngle: { type: 'accessor', value: 0 },
    getPixelOffset: { type: 'accessor', value: [0, 0] },
    onIconError: { type: 'function', value: null, optional: true },
    textureParameters: { type: 'object', ignore: true, value: null }
};
/** Render raster icons at given coordinates. */
class IconLayer extends Layer {
    getShaders() {
        const useRowIndexes = Boolean(this.props.data?.attributes?.rowIndexes);
        return super.getShaders({
            vs,
            fs,
            source: getShaderWGSL(useRowIndexes),
            defines: useRowIndexes ? { USE_ROW_INDEXES: true } : {},
            modules: [project32, color, picking, iconUniforms]
        });
    }
    initializeState() {
        this.state = {
            iconManager: new IconManager(this.context.device, {
                onUpdate: this._onUpdate.bind(this),
                onError: this._onError.bind(this)
            })
        };
        const attributeManager = this.getAttributeManager();
        /* eslint-disable max-len */
        attributeManager.addInstanced({
            instancePositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                transition: true,
                accessor: 'getPosition'
            },
            instanceSizes: {
                size: 1,
                transition: true,
                bufferGroup: 'icon-instance-data',
                accessor: 'getSize',
                defaultValue: 1
            },
            instanceIconDefs: {
                size: 7,
                bufferGroup: 'icon-instance-data',
                accessor: 'getIcon',
                // eslint-disable-next-line @typescript-eslint/unbound-method
                transform: this.getInstanceIconDef,
                shaderAttributes: {
                    instanceOffsets: {
                        size: 2,
                        elementOffset: 0
                    },
                    instanceIconFrames: {
                        size: 4,
                        elementOffset: 2
                    },
                    instanceColorModes: {
                        size: 1,
                        elementOffset: 6
                    }
                }
            },
            instanceColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                bufferGroup: 'icon-instance-data',
                accessor: 'getColor',
                defaultValue: DEFAULT_COLOR
            },
            instanceAngles: {
                size: 1,
                transition: true,
                bufferGroup: 'icon-instance-data',
                accessor: 'getAngle'
            },
            instancePixelOffset: {
                size: 2,
                transition: true,
                bufferGroup: 'icon-instance-data',
                accessor: 'getPixelOffset'
            },
            ...(this.props.data?.attributes?.rowIndexes
                ? {
                    /** Caller-provided logical picking index per icon instance. */
                    rowIndexes: {
                        size: 1,
                        type: 'uint32',
                        noAlloc: true
                    }
                }
                : {})
        });
        /* eslint-enable max-len */
    }
    /* eslint-disable max-statements, complexity */
    updateState(params) {
        super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const attributeManager = this.getAttributeManager();
        const { iconAtlas, iconMapping, data, getIcon, textureParameters } = props;
        const { iconManager } = this.state;
        if (typeof iconAtlas === 'string') {
            return;
        }
        // internalState is always defined during updateState
        const prePacked = iconAtlas || this.internalState.isAsyncPropLoading('iconAtlas');
        iconManager.setProps({
            loadOptions: props.loadOptions,
            autoPacking: !prePacked,
            iconAtlas,
            iconMapping: prePacked ? iconMapping : null,
            textureParameters
        });
        // prepacked iconAtlas from user
        if (prePacked) {
            if (oldProps.iconMapping !== props.iconMapping) {
                attributeManager.invalidate('getIcon');
            }
        }
        else if (changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon))) {
            // Auto packing - getIcon is expected to return an object
            iconManager.packIcons(data, getIcon);
        }
        if (changeFlags.extensionsChanged) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            attributeManager.invalidateAll();
        }
    }
    /* eslint-enable max-statements, complexity */
    get isLoaded() {
        return super.isLoaded && this.state.iconManager.isLoaded;
    }
    finalizeState(context) {
        super.finalizeState(context);
        // Release resources held by the icon manager
        this.state.iconManager.finalize();
    }
    draw({ uniforms }) {
        const { sizeScale, sizeBasis, sizeMinPixels, sizeMaxPixels, sizeUnits, billboard, alphaCutoff } = this.props;
        const { iconManager } = this.state;
        const iconsTexture = iconManager.getTexture();
        if (iconsTexture) {
            const model = this.state.model;
            const iconProps = {
                iconsTexture,
                iconsTextureDim: [iconsTexture.width, iconsTexture.height],
                sizeUnits: UNIT[sizeUnits],
                sizeScale,
                sizeBasis: sizeBasis === 'height' ? 1.0 : 0.0,
                sizeMinPixels,
                sizeMaxPixels,
                billboard,
                alphaCutoff
            };
            model.shaderInputs.setProps({ icon: iconProps });
            model.draw(this.context.renderPass);
        }
    }
    _getModel() {
        // The icon-layer vertex shader uses 2d positions
        // specifed via: in vec2 positions;
        const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            geometry: new Geometry({
                topology: 'triangle-strip',
                attributes: {
                    // The size must be explicitly passed here otherwise luma.gl
                    // will default to assuming that positions are 3D (x,y,z)
                    positions: {
                        size: 2,
                        value: new Float32Array(positions)
                    }
                }
            }),
            isInstanced: true
        });
    }
    _onUpdate(didFrameChange) {
        if (didFrameChange) {
            this.getAttributeManager()?.invalidate('getIcon');
            this.setNeedsUpdate();
        }
        else {
            this.setNeedsRedraw();
        }
    }
    _onError(evt) {
        const onIconError = this.getCurrentLayer()?.props.onIconError;
        if (onIconError) {
            onIconError(evt);
        }
        else {
            log.error(evt.error.message)();
        }
    }
    getInstanceIconDef(icon) {
        const { x, y, width, height, mask, anchorX = width / 2, anchorY = height / 2 } = this.state.iconManager.getIconMapping(icon);
        return [width / 2 - anchorX, height / 2 - anchorY, x, y, width, height, mask ? 1 : 0];
    }
}
IconLayer.defaultProps = defaultProps;
IconLayer.layerName = 'IconLayer';
export default IconLayer;
//# sourceMappingURL=icon-layer.js.map