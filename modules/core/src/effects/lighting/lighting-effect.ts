import type {Device} from '@luma.gl/core';
import {Texture} from '@luma.gl/core';
import {AmbientLight} from './ambient-light';
import {DirectionalLight} from './directional-light';
import {PointLight} from './point-light';
import {Matrix4, Vector3} from '@math.gl/core';
import ShadowPass from '../../passes/shadow-pass';
import shadow from '../../shaderlib/shadow/shadow';

import type Layer from '../../lib/layer';
import type {Effect, EffectContext, PreRenderOptions} from '../../lib/effect';

const DEFAULT_AMBIENT_LIGHT_PROPS = {color: [255, 255, 255], intensity: 1.0};
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

export type LightingEffectProps = Record<string, PointLight | DirectionalLight | AmbientLight>;

// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect implements Effect {
  id = 'lighting-effect';
  props!: LightingEffectProps;
  shadowColor: number[] = DEFAULT_SHADOW_COLOR;
  context?: EffectContext;

  private shadow: boolean = false;
  private ambientLight?: AmbientLight | null = null;
  private directionalLights: DirectionalLight[] = [];
  private pointLights: PointLight[] = [];
  private shadowPasses: ShadowPass[] = [];
  private shadowMaps: Texture[] = [];
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

      // @ts-expect-error stricter luma gl types
      deck._addDefaultShaderModule(shadow);

      this.dummyShadowMap = device.createTexture({
        width: 1,
        height: 1
      });
    }
  }

  setProps(props: LightingEffectProps) {
    this.ambientLight = null;
    this.directionalLights = [];
    this.pointLights = [];

    for (const key in props) {
      const lightSource = props[key];

      switch (lightSource.type) {
        case 'ambient':
          this.ambientLight = lightSource;
          break;

        case 'directional':
          this.directionalLights.push(lightSource as DirectionalLight);
          break;

        case 'point':
          this.pointLights.push(lightSource as PointLight);
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
        moduleParameters: {
          shadowLightId: i,
          dummyShadowMap: this.dummyShadowMap,
          shadowMatrices: this.shadowMatrices
        }
      });
    }
  }

  getModuleParameters(layer: Layer) {
    const parameters: {
      lightSources?: {
        ambientLight?: AmbientLight | null;
        directionalLights: DirectionalLight[];
        pointLights: PointLight[];
      };
      shadowMaps?: Texture[];
      dummyShadowMap?: Texture | null;
      shadowColor?: number[];
      shadowMatrices?: Matrix4[];
    } = this.shadow
      ? {
          shadowMaps: this.shadowMaps,
          dummyShadowMap: this.dummyShadowMap,
          shadowColor: this.shadowColor,
          shadowMatrices: this.shadowMatrices
        }
      : {};

    // when not rendering to screen, turn off lighting by adding empty light source object
    // lights shader module relies on the `lightSources` to turn on/off lighting
    parameters.lightSources = {
      ambientLight: this.ambientLight,
      directionalLights: this.directionalLights.map(directionalLight =>
        directionalLight.getProjectedLight({layer})
      ),
      pointLights: this.pointLights.map(pointLight => pointLight.getProjectedLight({layer}))
    };

    return parameters;
  }

  cleanup(context: EffectContext): void {
    for (const shadowPass of this.shadowPasses) {
      shadowPass.delete();
    }
    this.shadowPasses.length = 0;
    this.shadowMaps.length = 0;

    if (this.dummyShadowMap) {
      this.dummyShadowMap.destroy();
      this.dummyShadowMap = null;
      // @ts-expect-error stricter luma gl types
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
      this.shadowMaps[i] = shadowPass.shadowMap;
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
