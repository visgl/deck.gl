import Layer, {UpdateParameters} from './layer';
import type AttributeManager from './attribute/attribute-manager';
import type {PickingInfo, GetPickingInfoParams} from './picking/pick-info';
import type {FilterContext} from '../passes/layers-pass';
import type {LayersList, LayerContext} from './layer-manager';
import type {CompositeLayerProps, Accessor} from '../types/layer-props';
import {ConstructorOf} from '../types/types';
export default abstract class CompositeLayer<PropsT = {}> extends Layer<
  PropsT & Required<CompositeLayerProps>
> {
  static layerName: string;
  /** `true` if this layer renders other layers */
  get isComposite(): boolean;
  /** Returns true if all async resources are loaded */
  get isLoaded(): boolean;
  /** Return last rendered sub layers */
  getSubLayers(): Layer[];
  initializeState(context: LayerContext): void;
  /** Updates selected state members and marks the composite layer to need rerender */
  setState(updateObject: any): void;
  /** called to augment the info object that is bubbled up from a sublayer
        override Layer.getPickingInfo() because decoding / setting uniform do
        not apply to a composite layer. */
  getPickingInfo({info}: GetPickingInfoParams): PickingInfo;
  abstract renderLayers(): Layer | null | LayersList;
  /**
   * Filters sub layers at draw time. Return true if the sub layer should be drawn.
   */
  filterSubLayer(context: FilterContext): boolean;
  /** Returns true if sub layer needs to be rendered */
  protected shouldRenderSubLayer(subLayerId: string, data: any): boolean;
  /** Returns sub layer class for a specific sublayer */
  protected getSubLayerClass<T extends Layer>(
    subLayerId: string,
    DefaultLayerClass: ConstructorOf<T>
  ): ConstructorOf<T>;
  /** When casting user data into another format to pass to sublayers,
        add reference to the original object and object index */
  protected getSubLayerRow<T>(row: T, sourceObject: any, sourceObjectIndex: number): T;
  /** Some composite layers cast user data into another format before passing to sublayers
      We need to unwrap them before calling the accessor so that they see the original data
      objects */
  protected getSubLayerAccessor<In, Out>(accessor: Accessor<In, Out>): Accessor<In, Out>;
  /** Returns sub layer props for a specific sublayer */
  protected getSubLayerProps(sublayerProps?: {
    id?: string;
    updateTriggers?: Record<string, any>;
    [propName: string]: any;
  }): any;
  /** Update sub layers to highlight the hovered object */
  protected _updateAutoHighlight(info: PickingInfo): void;
  /** Override base Layer method */
  protected _getAttributeManager(): AttributeManager | null;
  /** (Internal) Called after an update to rerender sub layers */
  protected _postUpdate(updateParams: UpdateParameters<this>, forceUpdate: boolean): void;
}
// # sourceMappingURL=composite-layer.d.ts.map
