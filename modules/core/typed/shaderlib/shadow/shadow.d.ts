import {Matrix4} from '@math.gl/core';
import type {Texture2D} from '@luma.gl/webgl-legacy';
import type {ShaderModule} from '../../types/types';
import type Viewport from '../../viewports/viewport';
declare type ShadowModuleSettings = {
  viewport: Viewport;
  shadowEnabled?: boolean;
  drawToShadowMap?: boolean;
  shadowMaps?: Texture2D[];
  dummyShadowMap?: Texture2D;
  shadowColor?: number[];
  shadowMatrices?: Matrix4[];
  shadowLightId?: number;
};
declare const _default: ShaderModule<ShadowModuleSettings>;
export default _default;
// # sourceMappingURL=shadow.d.ts.map
