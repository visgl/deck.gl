// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { AmbientLight } from "./ambient-light.js";
import { DirectionalLight } from "./directional-light.js";
import { Matrix4, Vector3 } from '@math.gl/core';
import ShadowPass from "../../passes/shadow-pass.js";
import shadow from "../../shaderlib/shadow/shadow.js";
const DEFAULT_AMBIENT_LIGHT_PROPS = {
    color: [255, 255, 255],
    intensity: 1.0
};
const DEFAULT_DIRECTIONAL_LIGHT_PROPS = [
    {
        color: [255, 255, 255],
        intensity: 1.0,
        direction: [-1, 3, -1]
    },
    {
        color: [255, 255, 255],
        intensity: 0.9,
        direction: [1, -8, -2.5]
    }
];
const DEFAULT_SHADOW_COLOR = [0, 0, 0, 200 / 255];
// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect {
    constructor(props = {}) {
        this.id = 'lighting-effect';
        this.shadowColor = DEFAULT_SHADOW_COLOR;
        this.shadow = false;
        this.directionalLights = [];
        this.pointLights = [];
        this.shadowPasses = [];
        this.dummyShadowMap = null;
        this.setProps(props);
    }
    setup(context) {
        this.context = context;
        const { device, deck } = context;
        if (this.shadow && !this.dummyShadowMap) {
            this._createShadowPasses(device);
            deck._addDefaultShaderModule(shadow);
            this.dummyShadowMap = device.createTexture({
                width: 1,
                height: 1
            });
        }
    }
    setProps(props) {
        this.ambientLight = undefined;
        this.directionalLights = [];
        this.pointLights = [];
        for (const key in props) {
            const lightSource = props[key];
            switch (lightSource.type) {
                case 'ambient':
                    this.ambientLight = lightSource;
                    break;
                case 'directional':
                    this.directionalLights.push(lightSource);
                    break;
                case 'point':
                    this.pointLights.push(lightSource);
                    break;
                default:
            }
        }
        this._applyDefaultLights();
        this.shadow = this.directionalLights.some(light => light.shadow);
        if (this.context) {
            // Create resources if necessary
            this.setup(this.context);
        }
        this.props = props;
    }
    preRender({ layers, layerFilter, viewports, onViewportActive, views }) {
        if (!this.shadow)
            return;
        // create light matrix every frame to make sure always updated from light source
        this.shadowMatrices = this._calculateMatrices();
        for (let i = 0; i < this.shadowPasses.length; i++) {
            const shadowPass = this.shadowPasses[i];
            shadowPass.render({
                layers,
                layerFilter,
                viewports,
                onViewportActive,
                views,
                shaderModuleProps: {
                    shadow: {
                        shadowLightId: i,
                        dummyShadowMap: this.dummyShadowMap,
                        shadowMatrices: this.shadowMatrices
                    }
                }
            });
        }
    }
    getShaderModuleProps(layer, otherShaderModuleProps) {
        const shadowProps = this.shadow
            ? {
                project: otherShaderModuleProps.project,
                shadowMaps: this.shadowPasses.map(shadowPass => shadowPass.getShadowMap()),
                dummyShadowMap: this.dummyShadowMap,
                shadowColor: this.shadowColor,
                shadowMatrices: this.shadowMatrices
            }
            : {};
        const lightingProps = {
            enabled: true,
            lights: this._getLights(layer)
        };
        // @ts-expect-error material is not a Layer prop
        const materialProps = layer.props.material;
        return {
            shadow: shadowProps,
            lighting: lightingProps,
            phongMaterial: materialProps,
            gouraudMaterial: materialProps
        };
    }
    cleanup(context) {
        for (const shadowPass of this.shadowPasses) {
            shadowPass.delete();
        }
        this.shadowPasses.length = 0;
        if (this.dummyShadowMap) {
            this.dummyShadowMap.destroy();
            this.dummyShadowMap = null;
            context.deck._removeDefaultShaderModule(shadow);
        }
    }
    _calculateMatrices() {
        const lightMatrices = [];
        for (const light of this.directionalLights) {
            const viewMatrix = new Matrix4().lookAt({
                eye: new Vector3(light.direction).negate()
            });
            lightMatrices.push(viewMatrix);
        }
        return lightMatrices;
    }
    _createShadowPasses(device) {
        for (let i = 0; i < this.directionalLights.length; i++) {
            const shadowPass = new ShadowPass(device);
            this.shadowPasses[i] = shadowPass;
        }
    }
    _applyDefaultLights() {
        const { ambientLight, pointLights, directionalLights } = this;
        if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
            this.ambientLight = new AmbientLight(DEFAULT_AMBIENT_LIGHT_PROPS);
            this.directionalLights.push(new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[0]), new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[1]));
        }
    }
    _getLights(layer) {
        const lights = [];
        if (this.ambientLight) {
            lights.push(this.ambientLight);
        }
        for (const pointLight of this.pointLights) {
            lights.push(pointLight.getProjectedLight({ layer }));
        }
        for (const directionalLight of this.directionalLights) {
            lights.push(directionalLight.getProjectedLight({ layer }));
        }
        return lights;
    }
}
//# sourceMappingURL=lighting-effect.js.map