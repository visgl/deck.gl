import Effect from '../lib/effect';
import ShadowPass from '../passes/shadow-pass';
import {Matrix4, Vector3} from 'math.gl';
import {Texture2D} from '@luma.gl/core';

export default class ShadowEffect extends Effect {
  constructor(props) {
    super(props);
    const {shadowColor = [2, 0, 5, 200], lights = []} = props;
    this.shadowPasses = [];
    this.shadowColor = shadowColor;
    this.lights = lights;
    this.lightMatrices = [];
    this.dummyShadowMaps = [];

    this.createLightMatrix();
  }

  createLightMatrix() {
    const projectionMatrix = new Matrix4().ortho({
      left: -1,
      right: 1,
      bottom: 1,
      top: -1,
      near: 0,
      far: 2
    });

    for (const light of this.lights) {
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

  createShadowPasses(gl, pixelRatio) {
    for (let i = 0; i < this.lights.length; i++) {
      this.shadowPasses.push(new ShadowPass(gl, {pixelRatio}));
    }
  }
  createDummyShadowMaps(gl) {
    this.dummyShadowMaps.push(
      new Texture2D(gl, {
        width: 1,
        height: 1
      })
    );
    this.dummyShadowMaps.push(
      new Texture2D(gl, {
        width: 1,
        height: 1
      })
    );
  }

  prepare(gl, {layers, viewports, onViewportActive, views, effects, pixelRatio}) {
    if (this.shadowPasses.length === 0) {
      this.createShadowPasses(gl, pixelRatio);
    }

    if (this.dummyShadowMaps.length === 0) {
      this.createDummyShadowMaps(gl);
    }

    const shadowMaps = [];

    for (let i = 0; i < this.shadowPasses.length; i++) {
      const shadowPass = this.shadowPasses[i];
      shadowPass.render({
        layers,
        viewports,
        onViewportActive,
        views,
        effects,
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
    if (this.shadowPass) {
      this.shadowPass.delete();
      this.shadowPass = null;
    }
  }
}
