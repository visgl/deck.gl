// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, color as colorModule, project32, picking } from '@deck.gl/core';
import { Model } from '@luma.gl/engine';
import { lngLatToWorld } from '@math.gl/web-mercator';
import createMesh from "./create-mesh.js";
import { bitmapUniforms } from "./bitmap-layer-uniforms.js";
import source from "./bitmap-layer.wgsl.js";
import vs from "./bitmap-layer-vertex.js";
import fs from "./bitmap-layer-fragment.js";
const defaultProps = {
    image: { type: 'image', value: null, async: true },
    bounds: { type: 'array', value: [1, 0, 0, 1], compare: true },
    _imageCoordinateSystem: 'default',
    desaturate: { type: 'number', min: 0, max: 1, value: 0 },
    // More context: because of the blending mode we're using for ground imagery,
    // alpha is not effective when blending the bitmap layers with the base map.
    // Instead we need to manually dim/blend rgb values with a background color.
    transparentColor: { type: 'color', value: [0, 0, 0, 0] },
    tintColor: { type: 'color', value: [255, 255, 255] },
    textureParameters: { type: 'object', ignore: true, value: null }
};
/** Render a bitmap at specified boundaries. */
class BitmapLayer extends Layer {
    getShaders() {
        return super.getShaders({
            vs,
            fs,
            source,
            modules: [colorModule, project32, picking, bitmapUniforms]
        });
    }
    initializeState() {
        const attributeManager = this.getAttributeManager();
        const noAlloc = true;
        attributeManager.add({
            indices: {
                size: 1,
                isIndexed: true,
                update: attribute => (attribute.value = this.state.mesh.indices),
                noAlloc
            },
            positions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                update: attribute => (attribute.value = this.state.mesh.positions),
                noAlloc
            },
            texCoords: {
                size: 2,
                update: attribute => (attribute.value = this.state.mesh.texCoords),
                noAlloc
            }
        });
    }
    updateState({ props, oldProps, changeFlags }) {
        // setup model first
        const attributeManager = this.getAttributeManager();
        if (changeFlags.extensionsChanged) {
            this.state.model?.destroy();
            this.state.model = this._getModel();
            attributeManager.invalidateAll();
        }
        if (props.bounds !== oldProps.bounds) {
            const oldMesh = this.state.mesh;
            const mesh = this._createMesh();
            this.state.model.setVertexCount(mesh.vertexCount);
            for (const key in mesh) {
                if (oldMesh && oldMesh[key] !== mesh[key]) {
                    attributeManager.invalidate(key);
                }
            }
            this.setState({ mesh, ...this._getCoordinateUniforms() });
        }
        else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
            this.setState(this._getCoordinateUniforms());
        }
    }
    getPickingInfo(params) {
        const { image } = this.props;
        const info = params.info;
        if (!info.color || !image) {
            info.bitmap = null;
            return info;
        }
        const { width, height } = image;
        // Picking color doesn't represent object index in this layer
        info.index = 0;
        // Calculate uv and pixel in bitmap
        const uv = unpackUVsFromRGB(info.color);
        info.bitmap = {
            size: { width, height },
            uv,
            pixel: [Math.floor(uv[0] * width), Math.floor(uv[1] * height)]
        };
        return info;
    }
    // Override base Layer multi-depth picking logic
    disablePickingIndex() {
        this.setState({ disablePicking: true });
    }
    restorePickingColors() {
        this.setState({ disablePicking: false });
    }
    _updateAutoHighlight(info) {
        super._updateAutoHighlight({
            ...info,
            color: this.encodePickingColor(0)
        });
    }
    _createMesh() {
        const { bounds } = this.props;
        let normalizedBounds = bounds;
        // bounds as [minX, minY, maxX, maxY]
        if (isRectangularBounds(bounds)) {
            /*
              (minX0, maxY3) ---- (maxX2, maxY3)
                     |                  |
                     |                  |
                     |                  |
              (minX0, minY1) ---- (maxX2, minY1)
           */
            normalizedBounds = [
                [bounds[0], bounds[1]],
                [bounds[0], bounds[3]],
                [bounds[2], bounds[3]],
                [bounds[2], bounds[1]]
            ];
        }
        return createMesh(normalizedBounds, this.context.viewport.resolution);
    }
    _getModel() {
        /*
          0,0 --- 1,0
           |       |
          0,1 --- 1,1
        */
        const bufferLayout = this.getAttributeManager().getBufferLayouts();
        return new Model(this.context.device, {
            ...this.getShaders(),
            id: this.props.id,
            bufferLayout,
            topology: 'triangle-list',
            isInstanced: false
        });
    }
    draw(opts) {
        const { shaderModuleProps } = opts;
        const { model, coordinateConversion, bounds, disablePicking } = this.state;
        const { image, desaturate, transparentColor, tintColor } = this.props;
        if (shaderModuleProps.picking.isActive && disablePicking) {
            return;
        }
        // // TODO fix zFighting
        // Render the image
        if (image && model) {
            const bitmapProps = {
                bitmapTexture: image,
                bounds,
                coordinateConversion,
                desaturate,
                tintColor: tintColor.slice(0, 3).map(x => x / 255),
                transparentColor: transparentColor.map(x => x / 255)
            };
            model.shaderInputs.setProps({ bitmap: bitmapProps });
            model.draw(this.context.renderPass);
        }
    }
    _getCoordinateUniforms() {
        let { _imageCoordinateSystem: imageCoordinateSystem } = this.props;
        if (imageCoordinateSystem !== 'default') {
            const { bounds } = this.props;
            if (!isRectangularBounds(bounds)) {
                throw new Error('_imageCoordinateSystem only supports rectangular bounds');
            }
            // The default behavior (linearly interpolated tex coords)
            const defaultImageCoordinateSystem = this.context.viewport.resolution
                ? 'lnglat'
                : 'cartesian';
            imageCoordinateSystem = imageCoordinateSystem === 'lnglat' ? 'lnglat' : 'cartesian';
            if (imageCoordinateSystem === 'lnglat' && defaultImageCoordinateSystem === 'cartesian') {
                // LNGLAT in Mercator, e.g. display LNGLAT-encoded image in WebMercator projection
                return { coordinateConversion: -1, bounds };
            }
            if (imageCoordinateSystem === 'cartesian' && defaultImageCoordinateSystem === 'lnglat') {
                // Mercator in LNGLAT, e.g. display WebMercator encoded image in Globe projection
                const bottomLeft = lngLatToWorld([bounds[0], bounds[1]]);
                const topRight = lngLatToWorld([bounds[2], bounds[3]]);
                return {
                    coordinateConversion: 1,
                    bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
                };
            }
        }
        return {
            coordinateConversion: 0,
            bounds: [0, 0, 0, 0]
        };
    }
}
BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps;
export default BitmapLayer;
/**
 * Decode uv floats from rgb bytes where b contains 4-bit fractions of uv
 * @param {number[]} color
 * @returns {number[]} uvs
 * https://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab
 */
function unpackUVsFromRGB(color) {
    const [u, v, fracUV] = color;
    const vFrac = (fracUV & 0xf0) / 256;
    const uFrac = (fracUV & 0x0f) / 16;
    return [(u + uFrac) / 256, (v + vFrac) / 256];
}
function isRectangularBounds(bounds) {
    return Number.isFinite(bounds[0]);
}
//# sourceMappingURL=bitmap-layer.js.map