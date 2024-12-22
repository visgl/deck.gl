import type {Viewport, _ShaderModule as ShaderModule} from '@deck.gl/core';
import type {Texture2D} from '@luma.gl/webgl-legacy';
declare type FillStyleModuleSettings =
  | {
      viewport: Viewport;
      fillPatternEnabled?: boolean;
      fillPatternMask?: boolean;
    }
  | {
      fillPatternTexture: Texture2D;
    };
export declare const patternShaders: ShaderModule<FillStyleModuleSettings>;
export {};
// # sourceMappingURL=shaders.glsl.d.ts.map
