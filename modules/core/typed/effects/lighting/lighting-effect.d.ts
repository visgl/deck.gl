import type {Device} from '@luma.gl/api';
import {Texture2D} from '@luma.gl/webgl-legacy';
import {AmbientLight} from './ambient-light';
import {DirectionalLight} from './directional-light';
import {PointLight} from './point-light';
import {Matrix4} from '@math.gl/core';
import type Layer from '../../lib/layer';
import type {Effect, PreRenderOptions} from '../../lib/effect';
export default class LightingEffect implements Effect {
  id: string;
  props: any;
  shadowColor: number[];
  private shadow;
  private ambientLight?;
  private directionalLights;
  private pointLights;
  private shadowPasses;
  private shadowMaps;
  private dummyShadowMap;
  private pipelineFactory?;
  private shadowMatrices?;
  constructor(props?: Record<string, PointLight | DirectionalLight | AmbientLight>);
  preRender(
    device: Device,
    {layers, layerFilter, viewports, onViewportActive, views}: PreRenderOptions
  ): void;
  getModuleParameters(layer: Layer): {
    lightSources?: {
      ambientLight?: AmbientLight | null;
      directionalLights: DirectionalLight[];
      pointLights: PointLight[];
    };
    shadowMaps?: Texture2D[];
    dummyShadowMap?: Texture2D;
    shadowColor?: number[];
    shadowMatrices?: Matrix4[];
  };
  cleanup(): void;
  private _calculateMatrices;
  private _createShadowPasses;
  private _applyDefaultLights;
}
// # sourceMappingURL=lighting-effect.d.ts.map
