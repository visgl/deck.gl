// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, project32, color, picking, UNIT, gouraudMaterial, phongMaterial } from '@deck.gl/core';
import { Geometry, Model, makeInterleavedGeometry } from '@luma.gl/engine';
import ColumnGeometry from "./column-geometry.js";
import { columnUniforms } from "./column-layer-uniforms.js";
import { getColumnLayerWGSL as source } from "./column-layer.wgsl.js";
import vs from "./column-layer-vertex.glsl.js";
import fs from "./column-layer-fragment.glsl.js";
const DEFAULT_COLOR = [0, 0, 0, 255];
const GEOMETRY_BUFFER_LAYOUT = {
    name: 'geometry',
    stepMode: 'vertex',
    byteStride: 24,
    attributes: [
        { attribute: 'positions', format: 'float32x3', byteOffset: 0 },
        { attribute: 'normals', format: 'float32x3', byteOffset: 12 }
    ]
};
const defaultProps = {
    diskResolution: { type: 'number', min: 4, value: 20 },
    vertices: null,
    radius: { type: 'number', min: 0, value: 1000 },
    angle: { type: 'number', value: 0 },
    offset: { type: 'array', value: [0, 0] },
    coverage: { type: 'number', min: 0, max: 1, value: 1 },
    elevationScale: { type: 'number', min: 0, value: 1 },
    radiusUnits: 'meters',
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    extruded: true,
    wireframe: false,
    filled: true,
    stroked: false,
    flatShading: false,
    getPosition: { type: 'accessor', value: (x) => x.position },
    getFillColor: { type: 'accessor', value: DEFAULT_COLOR },
    getLineColor: { type: 'accessor', value: DEFAULT_COLOR },
    getLineWidth: { type: 'accessor', value: 1 },
    getElevation: { type: 'accessor', value: 1000 },
    material: true,
    getColor: { deprecatedFor: ['getFillColor', 'getLineColor'] }
};
/** Render extruded cylinders (tessellated regular polygons) at given coordinates. */
class ColumnLayer extends Layer {
    getShaders() {
        const defines = {};
        const { flatShading } = this.props;
        if (flatShading) {
            defines.FLAT_SHADING = 1;
        }
        return super.getShaders({
            vs,
            fs,
            source: source(flatShading),
            defines,
            modules: [
                project32,
                color,
                flatShading ? phongMaterial : gouraudMaterial,
                picking,
                columnUniforms
            ]
        });
    }
    /**
     * DeckGL calls initializeState when GL context is available
     * Essentially a deferred constructor
     */
    initializeState() {
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
            instanceElevations: {
                size: 1,
                transition: true,
                accessor: 'getElevation'
            },
            instanceFillColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getFillColor',
                defaultValue: DEFAULT_COLOR
            },
            instanceLineColors: {
                size: this.props.colorFormat.length,
                type: 'unorm8',
                transition: true,
                accessor: 'getLineColor',
                defaultValue: DEFAULT_COLOR
            },
            instanceStrokeWidths: {
                size: 1,
                accessor: 'getLineWidth',
                transition: true
            }
        });
        /* eslint-enable max-len */
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const regenerateModels = changeFlags.extensionsChanged || props.flatShading !== oldProps.flatShading;
        if (regenerateModels) {
            this.state.models?.forEach(model => model.destroy());
            this.setState(this._getModels());
            this.getAttributeManager().invalidateAll();
        }
        const instanceCount = this.getNumInstances();
        this.state.fillModel.setInstanceCount(instanceCount);
        this.state.strokeModel.setInstanceCount(instanceCount);
        this.state.wireframeModel.setInstanceCount(instanceCount);
        if (regenerateModels ||
            props.diskResolution !== oldProps.diskResolution ||
            props.vertices !== oldProps.vertices ||
            props.extruded !== oldProps.extruded ||
            props.stroked !== oldProps.stroked) {
            this._updateGeometry(props);
        }
    }
    getGeometry(diskResolution, vertices, hasThinkness) {
        const geometry = new ColumnGeometry({
            radius: 1,
            height: hasThinkness ? 2 : 0,
            vertices,
            nradial: diskResolution
        });
        let meanVertexDistance = 0;
        if (vertices) {
            for (let i = 0; i < diskResolution; i++) {
                const p = vertices[i];
                const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
                meanVertexDistance += d / diskResolution;
            }
        }
        else {
            meanVertexDistance = 1;
        }
        this.setState({
            edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance
        });
        return geometry;
    }
    _getModels() {
        const shaders = this.getShaders();
        const bufferLayout = [
            ...this.getAttributeManager().getBufferLayouts(),
            GEOMETRY_BUFFER_LAYOUT
        ];
        const fillModel = new Model(this.context.device, {
            ...shaders,
            id: `${this.props.id}-fill`,
            bufferLayout,
            isInstanced: true
        });
        const strokeModel = new Model(this.context.device, {
            ...shaders,
            id: `${this.props.id}-stroke`,
            bufferLayout,
            isInstanced: true
        });
        const wireframeModel = new Model(this.context.device, {
            ...shaders,
            id: `${this.props.id}-wireframe`,
            bufferLayout,
            isInstanced: true
        });
        return {
            fillModel,
            strokeModel,
            wireframeModel,
            models: [wireframeModel, fillModel, strokeModel]
        };
    }
    _updateGeometry({ diskResolution, vertices, extruded, stroked }) {
        const geometry = this.getGeometry(diskResolution, vertices, extruded || stroked);
        const positionAttribute = geometry.attributes.POSITION;
        const normalAttribute = geometry.attributes.NORMAL;
        // The fill model renders a triangle-strip with degenerate triangles and does not
        // use indices. Give it a separate Geometry without `indices` so that later buffer
        // layout rebuilds (e.g. binary-data transitions, HMR) cannot re-attach the
        // wireframe indices via `_setGeometryAttributes`.
        this._setFillGeometry(new Geometry({
            topology: 'triangle-strip',
            attributes: { POSITION: positionAttribute, NORMAL: normalAttribute }
        }));
        if (!extruded && stroked) {
            const fillVertexCount = positionAttribute.value.length / 3;
            this._setStrokeGeometry(new Geometry({
                topology: 'triangle-strip',
                // remove the cap
                vertexCount: fillVertexCount - diskResolution - 1,
                attributes: { POSITION: positionAttribute, NORMAL: normalAttribute }
            }));
        }
        if (extruded) {
            this._setWireframeGeometry(geometry);
        }
    }
    _setFillGeometry(geometry) {
        const fillGeometry = makeInterleavedGeometry(geometry, {
            attributes: ['POSITION', 'NORMAL']
        });
        const fillModel = this.state.fillModel;
        fillModel.setGeometry(fillGeometry);
    }
    _setStrokeGeometry(geometry) {
        const strokeGeometry = makeInterleavedGeometry(geometry, {
            attributes: ['POSITION', 'NORMAL']
        });
        const strokeModel = this.state.strokeModel;
        strokeModel.setGeometry(strokeGeometry);
    }
    _setWireframeGeometry(geometry) {
        const wireframeGeometry = makeInterleavedGeometry(geometry, {
            attributes: ['POSITION', 'NORMAL']
        });
        const wireframeModel = this.state.wireframeModel;
        wireframeModel.setGeometry(wireframeGeometry);
        wireframeModel.setTopology('line-list');
    }
    draw({ uniforms }) {
        const { lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, radiusUnits, elevationScale, extruded, filled, stroked, wireframe, offset, coverage, radius, angle } = this.props;
        const fillModel = this.state.fillModel;
        const strokeModel = this.state.strokeModel;
        const wireframeModel = this.state.wireframeModel;
        const { edgeDistance } = this.state;
        const columnProps = {
            radius,
            angle: (angle / 180) * Math.PI,
            offset,
            extruded,
            stroked,
            coverage,
            elevationScale,
            edgeDistance,
            radiusUnits: UNIT[radiusUnits],
            widthUnits: UNIT[lineWidthUnits],
            widthScale: lineWidthScale,
            widthMinPixels: lineWidthMinPixels,
            widthMaxPixels: lineWidthMaxPixels
        };
        // When drawing 3d: draw wireframe first so it doesn't get occluded by depth test
        if (extruded && wireframe) {
            wireframeModel.shaderInputs.setProps({
                column: {
                    ...columnProps,
                    isStroke: true
                }
            });
            wireframeModel.draw(this.context.renderPass);
        }
        if (filled) {
            fillModel.shaderInputs.setProps({
                column: {
                    ...columnProps,
                    isStroke: false
                }
            });
            fillModel.draw(this.context.renderPass);
        }
        // When drawing 2d: draw fill before stroke so that the outline is always on top
        if (!extruded && stroked) {
            strokeModel.shaderInputs.setProps({
                column: {
                    ...columnProps,
                    isStroke: true
                }
            });
            strokeModel.draw(this.context.renderPass);
        }
    }
}
ColumnLayer.layerName = 'ColumnLayer';
ColumnLayer.defaultProps = defaultProps;
export default ColumnLayer;
//# sourceMappingURL=column-layer.js.map