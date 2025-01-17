// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {Texture} from '@luma.gl/core';
import {AmbientLight} from './ambient-light';
import {DirectionalLight} from './directional-light';
import {PointLight} from './point-light';
import {Matrix4, Vector3} from '@math.gl/core';
import ShadowPass from '../../passes/shadow-pass';
import shadow from '../../shaderlib/shadow/shadow';

import type {LightingProps} from '@luma.gl/shadertools';
import type {ShadowModuleProps} from '../../shaderlib/shadow/shadow';
import type Layer from '../../lib/layer';
import type {Effect, EffectContext, PreRenderOptions} from '../../lib/effect';

const DEFAULT_AMBIENT_LIGHT_PROPS = {
  color: [255, 255, 255] as [number, number, number],
  intensity: 1.0
};
const DEFAULT_DIRECTIONAL_LIGHT_PROPS = [
  {
    color: [255, 255, 255] as [number, number, number],
    intensity: 1.0,
    direction: [-1, 3, -1] as [number, number, number]
  },
  {
    color: [255, 255, 255] as [number, number, number],
    intensity: 0.9,
    direction: [1, -8, -2.5] as [number, number, number]
  }
];
const DEFAULT_SHADOW_COLOR = [0, 0, 0, 200 / 255] as [number, number, number, number];

export type LightingEffectProps = Record<string, PointLight | DirectionalLight | AmbientLight>;

// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect implements Effect {
  id = 'lighting-effect';
  props!: LightingEffectProps;
  shadowColor: [number, number, number, number] = DEFAULT_SHADOW_COLOR;
  context?: EffectContext;

  private shadow: boolean = false;
  private ambientLight?: AmbientLight;
  private directionalLights: DirectionalLight[] = [];
  private pointLights: PointLight[] = [];
  private shadowPasses: ShadowPass[] = [];
  private dummyShadowMap: Texture | null = null;
  private shadowMatrices?: Matrix4[];

  constructor(props: LightingEffectProps = {}) {
    this.setProps(props);
  }

  setup(context: EffectContext) {
    this.context = context;
    const {device, deck} = context;

    if (this.shadow && !this.dummyShadowMap) {
      this._createShadowPasses(device);

      deck._addDefaultShaderModule(shadow);

      this.dummyShadowMap = device.createTexture({
        width: 1,
        height: 1
      });
    }
  }

  setProps(props: LightingEffectProps) {
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

  preRender({layers, layerFilter, viewports, onViewportActive, views}: PreRenderOptions) {
    if (!this.shadow) return;

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

  getShaderModuleProps(layer: Layer, otherShaderModuleProps: Record<string, any>) {
    const shadowProps = this.shadow
      ? ({
          project: otherShaderModuleProps.project,
          shadowMaps: this.shadowPasses.map(shadowPass => shadowPass.getShadowMap()),
          dummyShadowMap: this.dummyShadowMap!,
          shadowColor: this.shadowColor,
          shadowMatrices: this.shadowMatrices
        } satisfies ShadowModuleProps)
      : {};

    // when not rendering to screen, turn off lighting by adding empty light source object
    // lights shader module relies on the `lightSources` to turn on/off lighting
    const lightingProps: LightingProps = {
      enabled: true,
      ambientLight: this.ambientLight,
      directionalLights: this.directionalLights.map(directionalLight =>
        directionalLight.getProjectedLight({layer})
      ),
      pointLights: this.pointLights.map(pointLight => pointLight.getProjectedLight({layer}))
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

  cleanup(context: EffectContext): void {
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

  private _calculateMatrices(): Matrix4[] {
    const lightMatrices: Matrix4[] = [];
    for (const light of this.directionalLights) {
      const viewMatrix = new Matrix4().lookAt({
        eye: new Vector3(light.direction).negate()
      });

      lightMatrices.push(viewMatrix);
    }
    return lightMatrices;
  }

  private _createShadowPasses(device: Device): void {
    for (let i = 0; i < this.directionalLights.length; i++) {
      const shadowPass = new ShadowPass(device);
      this.shadowPasses[i] = shadowPass;
    }
  }

  private _applyDefaultLights(): void {
    const {ambientLight, pointLights, directionalLights} = this;
    if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
      this.ambientLight = new AmbientLight(DEFAULT_AMBIENT_LIGHT_PROPS);
      this.directionalLights.push(
        new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[0]),
        new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[1])
      );
    }
  }
}
