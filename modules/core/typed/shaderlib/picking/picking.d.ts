import type {ShaderModule} from '../../types/types';
declare type PickingModuleSettings = {
  /** Set to a picking color to visually highlight that item */
  pickingSelectedColor?: [number, number, number] | null;
  /** Color of the highlight */
  pickingHighlightColor?: [number, number, number, number];
  /** Set to true when rendering to off-screen "picking" buffer */
  pickingActive?: boolean;
  /** Set to true when picking an attribute value instead of object index */
  pickingAttribute?: boolean;
};
declare const _default: ShaderModule<PickingModuleSettings>;
export default _default;
// # sourceMappingURL=picking.d.ts.map
