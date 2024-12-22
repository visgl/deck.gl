import type Layer from './layer';
import type CompositeLayer from './composite-layer';
import type {UpdateParameters} from './layer';
import type {LayerContext} from './layer-manager';
export default abstract class LayerExtension<OptionsT = undefined> {
  /**
     * Note that defaultProps of a LayerExtension does not behave like defaultProps of a Layer:
        - The default values are not automatically merged with user-supplied props when the layer is constructed
        - The types are not used during props diff
     * Currently they are only used in getSubLayerProps
     * TODO: find a more consistent solution
     */
  static defaultProps: any;
  opts: OptionsT;
  constructor(opts?: OptionsT);
  /** Returns true if two extensions are equivalent */
  equals(extension: LayerExtension<OptionsT>): boolean;
  /** Only called if attached to a primitive layer */
  getShaders(this: Layer, extension: this): any;
  /** Only called if attached to a CompositeLayer */
  getSubLayerProps(this: CompositeLayer, extension: this): any;
  initializeState(this: Layer, context: LayerContext, extension: this): void;
  updateState(this: Layer, params: UpdateParameters<Layer>, extension: this): void;
  draw(this: Layer, params: any, extension: this): void;
  finalizeState(this: Layer, context: LayerContext, extension: this): void;
}
// # sourceMappingURL=layer-extension.d.ts.map
