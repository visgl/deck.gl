import {
  AmbientLight,
  Texture2D,
  setDefaultShaderModules,
  getDefaultShaderModules
} from '@luma.gl/core';
import DirectionalLight from './directional-light';
import Effect from '../../lib/effect';
import {Matrix4, Vector3} from 'math.gl';
import ShadowPass from '../../passes/shadow-pass';
import {default as shadow} from '../../shaderlib/shadow/shadow';

const DEFAULT_AMBIENT_LIGHT_PROPS = {color: [255, 255, 255], intensity: 1.0};
const DEFAULT_DIRECTIONAL_LIGHT_PROPS = [
  {
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [-1, -3, -1]
  },
  {
    color: [255, 255, 255],
    intensity: 0.9,
    direction: [1, 8, -2.5]
  }
];
const DEFAULT_SHADOW_COLOR = [0, 0, 0, 200 / 255];

// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect extends Effect {
  constructor(props) {
    super(props);
    this.ambientLight = null;
    this.directionalLights = [];
    this.pointLights = [];

    this.shadowColor = DEFAULT_SHADOW_COLOR;
    this.shadowPasses = [];
    this.lightMatrices = [];
    this.dummyShadowMaps = [];
    this.shadow = false;

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

    if (this.directionalLights.some(light => light.shadow)) {
      this.shadow = true;
      this._addShadowModule();
      this._createLightMatrix();
    }
  }

  prepare(gl, {layers, viewports, onViewportActive, views, pixelRatio}) {
    if (!this.shadow) return {};

    if (this.shadowPasses.length === 0) {
      this._createShadowPasses(gl, pixelRatio);
    }

    if (this.dummyShadowMaps.length === 0) {
      this._createDummyShadowMaps(gl);
    }

    const shadowMaps = [];

    for (let i = 0; i < this.shadowPasses.length; i++) {
      const shadowPass = this.shadowPasses[i];
      shadowPass.render({
        layers,
        viewports,
        onViewportActive,
        views,
        effectProps: {
          shadow_lightId: i,
          dummyShadowMaps: this.dummyShadowMaps,
          shadow_matrices: this.lightMatrices
        }
      });
      shadowMaps.push(shadowPass.shadowMap);
    }

    return {
      shadowMaps,
      dummyShadowMaps: this.dummyShadowMaps,
      shadow_lightId: 0,
      shadowColor: this.shadowColor,
      shadow_matrices: this.lightMatrices
    };
  }

  getParameters(layer) {
    const {ambientLight} = this;
    const pointLights = this._getProjectedPointLights(layer);
    const directionalLights = this._getProjectedDirectionalLights(layer);
    return {
      lightSources: {ambientLight, directionalLights, pointLights}
    };
  }

  cleanup() {
    for (const shadowPass of this.shadowPasses) {
      shadowPass.delete();
    }
    this.shadowPasses.length = 0;

    for (const dummyShadowMap of this.dummyShadowMaps) {
      dummyShadowMap.delete();
    }
    this.dummyShadowMaps.length = 0;

    if (this.shadow) {
      this._removeShadowModule();
      this.shadow = false;
    }
  }

  _createLightMatrix() {
    for (const light of this.directionalLights) {
      const viewMatrix = new Matrix4().lookAt({
        eye: new Vector3(light.direction).negate()
      });

      this.lightMatrices.push(viewMatrix);
    }
  }

  _createShadowPasses(gl, pixelRatio) {
    for (let i = 0; i < this.directionalLights.length; i++) {
      this.shadowPasses.push(new ShadowPass(gl, {pixelRatio}));
    }
  }
  _createDummyShadowMaps(gl) {
    for (let i = 0; i < this.directionalLights.length; i++) {
      this.dummyShadowMaps.push(
        new Texture2D(gl, {
          width: 1,
          height: 1
        })
      );
    }
  }

  _addShadowModule() {
    const defaultShaderModules = getDefaultShaderModules();
    let hasShadowModule = false;
    for (const module of defaultShaderModules) {
      if (module.name === `shadow`) {
        hasShadowModule = true;
        break;
      }
    }
    if (!hasShadowModule) {
      defaultShaderModules.push(shadow);
      setDefaultShaderModules(defaultShaderModules);
    }
  }

  _removeShadowModule() {
    const defaultShaderModules = getDefaultShaderModules();
    for (let i = 0; i < defaultShaderModules.length; i++) {
      if (defaultShaderModules[i].name === `shadow`) {
        defaultShaderModules.splice(i, 1);
        setDefaultShaderModules(defaultShaderModules);
        break;
      }
    }
  }

  _applyDefaultLights() {
    const {ambientLight, pointLights, directionalLights} = this;
    if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
      this.ambientLight = new AmbientLight(DEFAULT_AMBIENT_LIGHT_PROPS);
      this.directionalLights.push(new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[0]));
      this.directionalLights.push(new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[1]));
    }
  }

  _getProjectedPointLights(layer) {
    const projectedPointLights = [];

    for (let i = 0; i < this.pointLights.length; i++) {
      const pointLight = this.pointLights[i];
      projectedPointLights.push(pointLight.getProjectedLight({layer}));
    }
    return projectedPointLights;
  }

  _getProjectedDirectionalLights(layer) {
    const projectedDirectionalLights = [];

    for (let i = 0; i < this.directionalLights.length; i++) {
      const directionalLight = this.directionalLights[i];
      projectedDirectionalLights.push(directionalLight.getProjectedLight({layer}));
    }
    return projectedDirectionalLights;
  }
}
