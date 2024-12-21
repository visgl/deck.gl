import type {Viewport, _ShaderModule as ShaderModule} from '@deck.gl/core';
import type {BrushingExtensionProps} from './brushing';
declare type BrushingModuleSettings = {
  viewport: Viewport;
  mousePosition?: {
    x: number;
    y: number;
  };
} & BrushingExtensionProps;
declare const _default: ShaderModule<BrushingModuleSettings>;
export default _default;
// # sourceMappingURL=shader-module.d.ts.map
