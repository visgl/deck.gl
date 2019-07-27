import LightingEffect from './lighting-effect';
import ShadowPass from '../../passes/shadow-pass';
import {Matrix4, Vector3} from 'math.gl';
import {Texture2D} from '@luma.gl/core';
import {default as shadow} from '../../shaderlib/shadow/shadow';
import {setDefaultShaderModules, getDefaultShaderModules} from '@luma.gl/core';

const DEFAULT_SHADOW_COLOR = [0, 0, 0, 200 / 255];

export default class LightWithShadowEffect extends LightingEffect {
  constructor(props) {
    super(props);
    this.shadowColor = DEFAULT_SHADOW_COLOR;
    this.shadowPasses = [];
    this.lightMatrices = [];
    this.dummyShadowMaps = [];
    this._addShadowModule();
  }

  prepare(gl, {layers, viewports, onViewportActive, views, pixelRatio}) {
    this._createLightMatrix();

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
          shadow_viewProjectionMatrices: this.lightMatrices
        }
      });
      shadowMaps.push(shadowPass.shadowMap);
    }

    return {
      shadowMaps,
      dummyShadowMaps: this.dummyShadowMaps,
      shadow_lightId: 0,
      shadowColor: this.shadowColor,
      shadow_viewProjectionMatrices: this.lightMatrices
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

    this._removeShadowModule();
  }

  _createLightMatrix() {
    const projectionMatrix = new Matrix4().ortho({
      left: -1,
      right: 1,
      bottom: -1,
      top: 1,
      near: 0,
      far: 2
    });

    this.lightMatrices = [];
    for (const light of this.directionalLights) {
      const viewMatrix = new Matrix4()
        .lookAt({
          eye: new Vector3(light.direction).negate()
        })
        // arbitrary number that covers enough grounds
        .scale(1e-3);
      const viewProjectionMatrix = projectionMatrix.clone().multiplyRight(viewMatrix);
      this.lightMatrices.push(viewProjectionMatrix);
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
}
