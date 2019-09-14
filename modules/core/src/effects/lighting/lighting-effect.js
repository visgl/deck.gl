import {AmbientLight, Texture2D, ProgramManager} from '@luma.gl/core';
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
    this.dummyShadowMap = null;
    this.shadow = false;
    this.programManager = null;

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
  }

  prepare(gl, {layers, viewports, onViewportActive, views}) {
    if (!this.shadow) return {};

    // create light matrix every frame to make sure always updated from light source
    const shadowMatrices = this._createLightMatrix();

    if (this.shadowPasses.length === 0) {
      this._createShadowPasses(gl);
    }
    if (!this.programManager) {
      // TODO - support multiple contexts
      this.programManager = ProgramManager.getDefaultProgramManager(gl);
      if (shadow) {
        this.programManager.addDefaultModule(shadow);
      }
    }

    if (!this.dummyShadowMap) {
      this.dummyShadowMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    const shadowMaps = [];

    for (let i = 0; i < this.shadowPasses.length; i++) {
      const shadowPass = this.shadowPasses[i];
      shadowPass.render({
        layers: layers.filter(layer => layer.props.shadowEnabled !== false),
        viewports,
        onViewportActive,
        views,
        effectProps: {
          shadowLightId: i,
          dummyShadowMap: this.dummyShadowMap,
          shadowMatrices
        }
      });
      shadowMaps.push(shadowPass.shadowMap);
    }

    return {
      shadowMaps,
      dummyShadowMap: this.dummyShadowMap,
      shadowColor: this.shadowColor,
      shadowMatrices
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

    if (this.dummyShadowMap) {
      this.dummyShadowMap.delete();
      this.dummyShadowMap = null;
    }

    if (this.shadow && this.programManager) {
      this.programManager.removeDefaultModule(shadow);
      this.programManager = null;
    }
  }

  _createLightMatrix() {
    const lightMatrices = [];
    for (const light of this.directionalLights) {
      const viewMatrix = new Matrix4().lookAt({
        eye: new Vector3(light.direction).negate()
      });

      lightMatrices.push(viewMatrix);
    }
    return lightMatrices;
  }

  _createShadowPasses(gl) {
    for (let i = 0; i < this.directionalLights.length; i++) {
      this.shadowPasses.push(new ShadowPass(gl));
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
