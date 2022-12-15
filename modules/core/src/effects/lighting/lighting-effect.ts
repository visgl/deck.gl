import {Texture2D, ProgramManager} from '@luma.gl/core';
import {AmbientLight} from './ambient-light';
import {DirectionalLight} from './directional-light';
import {PointLight} from './point-light';
import {Matrix4, Vector3} from '@math.gl/core';
import ShadowPass from '../../passes/shadow-pass';
import shadow from '../../shaderlib/shadow/shadow';

import type Layer from '../../lib/layer';
import type {Effect, PreRenderOptions} from '../../lib/effect';

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

type LightingEffectProps = Record<string, PointLight | DirectionalLight | AmbientLight>;

// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect implements Effect {
  id = 'lighting-effect';
  props!: LightingEffectProps;
  shadowColor: number[] = DEFAULT_SHADOW_COLOR;

  private shadow!: boolean;
  private ambientLight!: AmbientLight | null;
  private directionalLights!: DirectionalLight[];
  private pointLights!: PointLight[];
  private shadowPasses: ShadowPass[] = [];
  private shadowMaps: Texture2D[] = [];
  private dummyShadowMap: Texture2D | null = null;
  private programManager?: ProgramManager;
  private shadowMatrices?: Matrix4[];

  constructor(props: LightingEffectProps = {}) {
    this.setProps(props);
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
    this.props = props;
  }

  preRender(
    gl: WebGLRenderingContext,
    {layers, layerFilter, viewports, onViewportActive, views}: PreRenderOptions
  ) {
    if (!this.shadow) return;

    // create light matrix every frame to make sure always updated from light source
    this.shadowMatrices = this._calculateMatrices();

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
        ambientLight: AmbientLight | null;
        directionalLights: DirectionalLight[];
        pointLights: PointLight[];
      };
      shadowMaps?: Texture2D[];
      dummyShadowMap?: Texture2D;
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

  cleanup(): void {
    for (const shadowPass of this.shadowPasses) {
      shadowPass.delete();
    }
    this.shadowPasses.length = 0;
    this.shadowMaps.length = 0;

    if (this.dummyShadowMap) {
      this.dummyShadowMap.delete();
      this.dummyShadowMap = null;
    }

    if (this.shadow && this.programManager) {
      this.programManager.removeDefaultModule(shadow);
      this.programManager = null;
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

  private _createShadowPasses(gl: WebGLRenderingContext): void {
    for (let i = 0; i < this.directionalLights.length; i++) {
      const shadowPass = new ShadowPass(gl);
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
