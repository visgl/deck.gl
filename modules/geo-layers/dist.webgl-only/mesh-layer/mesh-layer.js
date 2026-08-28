// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { parsePBRMaterial } from '@luma.gl/gltf';
import { Model } from '@luma.gl/engine';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { meshUniforms } from "./mesh-layer-uniforms.js";
import { meshPbrMaterial } from "./mesh-pbr-material.js";
import vs from "./mesh-layer-vertex.glsl.js";
import fs from "./mesh-layer-fragment.glsl.js";
import source from "./mesh-layer.wgsl.js";
function validateGeometryAttributes(attributes) {
    const positionAttribute = attributes.positions || attributes.POSITION;
    const vertexCount = positionAttribute.value.length / positionAttribute.size;
    const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
    if (!hasColorAttribute) {
        attributes.colors = {
            size: 4,
            value: new Uint8Array(vertexCount * 4).fill(255),
            normalized: true
        };
    }
}
const defaultProps = {
    pbrMaterial: { type: 'object', value: null },
    featureIds: { type: 'array', value: null, optional: true }
};
class MeshLayer extends SimpleMeshLayer {
    getShaders() {
        const shaders = super.getShaders();
        return {
            ...shaders,
            vs,
            fs,
            source,
            modules: [...shaders.modules, meshPbrMaterial, meshUniforms]
        };
    }
    initializeState() {
        const { featureIds } = this.props;
        super.initializeState();
        const attributeManager = this.getAttributeManager();
        if (featureIds) {
            // attributeManager is always defined in a primitive layer
            attributeManager.add({
                /** Feature id for each mesh vertex. */
                rowIndexes: {
                    type: 'uint32',
                    size: 1,
                    noAlloc: true,
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    update: this.calculateFeatureIdsPickingIndexes
                }
            });
        }
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps } = params;
        if (props.pbrMaterial !== oldProps.pbrMaterial) {
            this.updatePbrMaterialUniforms(props.pbrMaterial);
        }
    }
    draw(opts) {
        const { featureIds } = this.props;
        const { model } = this.state;
        if (!model) {
            return;
        }
        const meshProps = {
            pickFeatureIds: Boolean(featureIds)
        };
        const pbrProjectionProps = {
            camera: this.context.viewport.cameraPosition
        };
        model.shaderInputs.setProps({
            pbrProjection: pbrProjectionProps,
            mesh: meshProps
        });
        super.draw(opts);
    }
    getModel(mesh) {
        const { id } = this.props;
        const parsedPBRMaterial = this.parseMaterial(this.props.pbrMaterial, mesh);
        // Keep material to explicitly remove textures
        this.setState({ parsedPBRMaterial });
        const shaders = this.getShaders();
        validateGeometryAttributes(mesh.attributes);
        const model = new Model(this.context.device, {
            ...this.getShaders(),
            id,
            geometry: mesh,
            bufferLayout: this.getAttributeManager().getBufferLayouts(),
            defines: {
                ...shaders.defines,
                ...parsedPBRMaterial?.defines,
                HAS_UV_REGIONS: mesh.attributes.uvRegions ? 1 : 0,
                HAS_FEATURE_IDS: this.props.featureIds ? 1 : 0
            },
            parameters: parsedPBRMaterial?.parameters,
            isInstanced: true
        });
        return model;
    }
    updatePbrMaterialUniforms(material) {
        const { model } = this.state;
        if (model) {
            const { mesh } = this.props;
            const parsedPBRMaterial = this.parseMaterial(material, mesh);
            // Keep material to explicitly remove textures
            this.setState({ parsedPBRMaterial });
            const { pbr_baseColorSampler } = parsedPBRMaterial.bindings;
            const { emptyTexture } = this.state;
            const simpleMeshProps = {
                sampler: pbr_baseColorSampler || emptyTexture,
                hasTexture: Boolean(pbr_baseColorSampler)
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { camera, ...pbrMaterialProps } = {
                ...parsedPBRMaterial.bindings,
                ...parsedPBRMaterial.uniforms
            };
            model.shaderInputs.setProps({ simpleMesh: simpleMeshProps, pbrMaterial: pbrMaterialProps });
        }
    }
    parseMaterial(material, mesh) {
        const unlit = Boolean(material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture);
        return parsePBRMaterial(this.context.device, { unlit, ...material }, { NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords }, {
            pbrDebug: false,
            lights: true,
            useTangents: false
        });
    }
    calculateFeatureIdsPickingIndexes(attribute) {
        // This updater is only called if featureIds is not null
        const featureIds = this.props.featureIds;
        attribute.value = new Uint32Array(featureIds);
    }
    finalizeState(context) {
        super.finalizeState(context);
        this.state.parsedPBRMaterial?.generatedTextures.forEach(texture => texture.destroy());
        this.setState({ parsedPBRMaterial: null });
    }
}
MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
export default MeshLayer;
//# sourceMappingURL=mesh-layer.js.map