// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Layer, project32, color, picking, log } from '@deck.gl/core';
import { pbrMaterial } from '@luma.gl/shadertools';
import { ScenegraphNode, GroupNode, ModelNode } from '@luma.gl/engine';
import { createScenegraphsFromGLTF } from '@luma.gl/gltf';
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf';
import { waitForGLTFAssets } from "./gltf-utils.js";
import { MATRIX_ATTRIBUTES, shouldComposeModelMatrix } from "../utils/matrix.js";
import { scenegraphUniforms } from "./scenegraph-layer-uniforms.js";
import vs from "./scenegraph-layer-vertex.glsl.js";
import fs from "./scenegraph-layer-fragment.glsl.js";
import source from "./scenegraph-layer.wgsl.js";
import { scenegraphPbrMaterial } from "./scenegraph-pbr-material.js";
const DEFAULT_COLOR = [255, 255, 255, 255];
const defaultProps = {
    scenegraph: { type: 'object', value: null, async: true },
    getScene: gltf => {
        if (gltf && gltf.scenes) {
            // gltf post processor replaces `gltf.scene` number with the scene `object`
            return typeof gltf.scene === 'object' ? gltf.scene : gltf.scenes[gltf.scene || 0];
        }
        return gltf;
    },
    getAnimator: scenegraph => scenegraph && scenegraph.animator,
    _animations: null,
    onFirstDraw: { type: 'function', value: () => { } },
    sizeScale: { type: 'number', value: 1, min: 0 },
    sizeMinPixels: { type: 'number', min: 0, value: 0 },
    sizeMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER },
    getPosition: { type: 'accessor', value: (x) => x.position },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    // flat or pbr
    _lighting: 'flat',
    // _lighting must be pbr for this to work
    _imageBasedLightingEnvironment: undefined,
    // yaw, pitch and roll are in degrees
    // https://en.wikipedia.org/wiki/Euler_angles
    // [pitch, yaw, roll]
    getOrientation: { type: 'accessor', value: [0, 0, 0] },
    getScale: { type: 'accessor', value: [1, 1, 1] },
    getTranslation: { type: 'accessor', value: [0, 0, 0] },
    // 4x4 matrix
    getTransformMatrix: { type: 'accessor', value: [] },
    loaders: [GLTFLoader]
};
/** Render a number of instances of a complete glTF scenegraph. */
class ScenegraphLayer extends Layer {
    getShaders() {
        const defines = {};
        let pbr;
        const isWebGPU = false;
        if (this.props._lighting === 'pbr') {
            // The stock pbrMaterial module supplies the existing GLSL PBR path.
            // WebGPU uses a Scenegraph-specific wrapper because its WGSL source must
            // adapt the PBR position/normal inputs and camera binding to deck.gl's
            // project module.
            pbr = isWebGPU ? scenegraphPbrMaterial : pbrMaterial;
            defines.LIGHTING_PBR = 1;
        }
        else if (isWebGPU) {
            // The flat WGSL path can still sample a glTF base-color texture, so it
            // needs the Scenegraph PBR module's sampler bindings even though
            // LIGHTING_PBR is not enabled.
            pbr = scenegraphPbrMaterial;
        }
        else {
            // The flat GLSL shader declares pbr_baseColorSampler itself. Register a
            // name-only module so the glTF material binding is still routed to that
            // sampler without injecting the full PBR lighting module.
            pbr = { name: 'pbrMaterial' };
        }
        const modules = [project32, color, picking, scenegraphUniforms, pbr];
        return super.getShaders({ defines, vs, fs, source, modules });
    }
    initializeState() {
        const attributeManager = this.getAttributeManager();
        const supportsTransitions = this.context.device.type !== 'webgpu';
        // attributeManager is always defined for primitive layers
        attributeManager.addInstanced({
            instancePositions: {
                size: 3,
                type: 'float64',
                fp64: this.use64bitPositions(),
                accessor: 'getPosition',
                transition: supportsTransitions
            },
            instanceColors: {
                type: 'unorm8',
                size: this.props.colorFormat.length,
                accessor: 'getColor',
                defaultValue: DEFAULT_COLOR,
                transition: supportsTransitions
            },
            instanceModelMatrix: MATRIX_ATTRIBUTES
        });
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps } = params;
        if (props.scenegraph !== oldProps.scenegraph) {
            this._updateScenegraph();
        }
        else if (props._animations !== oldProps._animations) {
            this._applyAnimationsProp(this.state.animator, props._animations);
        }
    }
    finalizeState(context) {
        super.finalizeState(context);
        this._destroyScenegraphAssets();
    }
    get isLoaded() {
        return Boolean(this.state?.scenegraph && super.isLoaded);
    }
    _updateScenegraph() {
        const props = this.props;
        const { device } = this.context;
        let scenegraphData = null;
        if (props.scenegraph instanceof ScenegraphNode) {
            // Signature 1: props.scenegraph is a proper luma.gl Scenegraph
            scenegraphData = { scenes: [props.scenegraph] };
        }
        else if (props.scenegraph && typeof props.scenegraph === 'object') {
            // Converts loaders.gl gltf to luma.gl scenegraph using the undocumented @luma.gl/experimental function
            const gltf = props.scenegraph;
            // Tiles3DLoader already processes GLTF
            const processedGLTF = gltf.json ? postProcessGLTF(gltf) : gltf;
            const gltfObjects = createScenegraphsFromGLTF(device, processedGLTF, this._getModelOptions());
            scenegraphData = gltfObjects;
            waitForGLTFAssets(gltfObjects)
                .then(() => this.setNeedsRedraw())
                .catch(ex => {
                this.raiseError(ex, 'loading glTF');
            });
        }
        const options = { layer: this, device: this.context.device };
        const scenegraph = props.getScene(scenegraphData, options);
        const animator = props.getAnimator(scenegraphData, options);
        if (scenegraph instanceof GroupNode) {
            this._destroyScenegraphAssets();
            this._applyAnimationsProp(animator, props._animations);
            const models = [];
            scenegraph.traverse(node => {
                if (node instanceof ModelNode) {
                    models.push(node.model);
                }
            });
            this.setState({
                scenegraph,
                animator,
                materials: scenegraphData?.materials || null,
                models,
                firstDrawSignaled: false
            });
            this.getAttributeManager().invalidateAll();
        }
        else if (scenegraph !== null) {
            log.warn('invalid scenegraph:', scenegraph)();
        }
    }
    _destroyScenegraphAssets() {
        this.state.scenegraph?.destroy();
        this.state.materials?.forEach(material => material.destroy());
        this.state.scenegraph = null;
        this.state.animator = null;
        this.state.materials = null;
        this.state.models = [];
    }
    _applyAnimationsProp(animator, animationsProp) {
        if (!animator || !animationsProp) {
            return;
        }
        const animations = animator.getAnimations();
        // sort() to ensure '*' comes first so that other values can override
        Object.keys(animationsProp)
            .sort()
            .forEach(key => {
            // Key can be:
            //  - number for index number
            //  - name for animation name
            //  - * to affect all animations
            const value = animationsProp[key];
            if (key === '*') {
                animations.forEach(animation => {
                    Object.assign(animation, value);
                });
            }
            else if (Number.isFinite(Number(key))) {
                const number = Number(key);
                if (number >= 0 && number < animations.length) {
                    Object.assign(animations[number], value);
                }
                else {
                    log.warn(`animation ${key} not found`)();
                }
            }
            else {
                const findResult = animations.find(({ animation }) => animation.name === key);
                if (findResult) {
                    Object.assign(findResult, value);
                }
                else {
                    log.warn(`animation ${key} not found`)();
                }
            }
        });
    }
    _getModelOptions() {
        const { _imageBasedLightingEnvironment } = this.props;
        let env;
        if (_imageBasedLightingEnvironment) {
            if (typeof _imageBasedLightingEnvironment === 'function') {
                env = _imageBasedLightingEnvironment({
                    device: this.context.device,
                    gl: this.context.gl,
                    layer: this
                });
            }
            else {
                env = _imageBasedLightingEnvironment;
            }
        }
        const parameters = undefined;
        return {
            imageBasedLightingEnvironment: env,
            modelOptions: {
                id: this.props.id,
                isInstanced: true,
                bufferLayout: this.getAttributeManager().getBufferLayouts(),
                parameters,
                ...this.getShaders()
            },
            // tangents are not supported
            useTangents: false
        };
    }
    draw({ context }) {
        if (!this.state.scenegraph)
            return;
        if (this.props._animations && this.state.animator) {
            this.state.animator.setTime(context.timeline.getTime());
            this.setNeedsRedraw();
        }
        const { viewport, renderPass } = this.context;
        const { sizeScale, sizeMinPixels, sizeMaxPixels, coordinateSystem } = this.props;
        const pbrProjectionProps = {
            camera: viewport.cameraPosition
        };
        const numInstances = this.getNumInstances();
        this.state.scenegraph.traverse((node, { worldMatrix }) => {
            if (node instanceof ModelNode) {
                const { model } = node;
                model.setInstanceCount(numInstances);
                const scenegraphProps = {
                    sizeScale,
                    sizeMinPixels,
                    sizeMaxPixels,
                    composeModelMatrix: shouldComposeModelMatrix(viewport, coordinateSystem) ? 1 : 0,
                    sceneModelMatrix: worldMatrix
                };
                model.shaderInputs.setProps({
                    pbrProjection: pbrProjectionProps,
                    scenegraph: scenegraphProps
                });
                model.draw(renderPass);
            }
        });
        if (!this.state.firstDrawSignaled) {
            this.state.firstDrawSignaled = true;
            this.props.onFirstDraw?.();
        }
    }
}
ScenegraphLayer.defaultProps = defaultProps;
ScenegraphLayer.layerName = 'ScenegraphLayer';
export default ScenegraphLayer;
//# sourceMappingURL=scenegraph-layer.js.map