import AttributeManager from './attribute/attribute-manager';
import {Lifecycle} from '../lifecycle/constants';
import Component from '../lifecycle/component';
import LayerState, {ChangeFlags} from './layer-state';
import type {CoordinateSystem} from './constants';
import type Attribute from './attribute/attribute';
import type {Model} from '@luma.gl/webgl-legacy';
import type {PickingInfo, GetPickingInfoParams} from './picking/pick-info';
import type Viewport from '../viewports/viewport';
import type {NumericArray} from '../types/types';
import type {DefaultProps} from '../lifecycle/prop-types';
import type {LayerProps} from '../types/layer-props';
import type {LayerContext} from './layer-manager';
export declare type UpdateParameters<LayerT extends Layer> = {
  props: LayerT['props'];
  oldProps: LayerT['props'];
  context: LayerContext;
  changeFlags: ChangeFlags;
};
export default abstract class Layer<PropsT = {}> extends Component<PropsT & Required<LayerProps>> {
  static defaultProps: DefaultProps<LayerProps<any>>;
  static layerName: string;
  internalState: LayerState<this> | null;
  lifecycle: Lifecycle;
  context: LayerContext;
  state: Record<string, any>;
  parent: Layer | null;
  get root(): Layer;
  toString(): string;
  /** Projects a point with current view state from the current layer's coordinate system to screen */
  project(xyz: number[]): number[];
  /** Unprojects a screen pixel to the current view's default coordinate system
        Note: this does not reverse `project`. */
  unproject(xy: number[]): number[];
  /** Projects a point with current view state from the current layer's coordinate system to the world space */
  projectPosition(
    xyz: number[],
    params?: {
      /** The viewport to use */
      viewport?: Viewport;
      /** The coordinate system that the supplied position is in. Default to the same as `coordinateSystem`. */
      fromCoordinateSystem?: CoordinateSystem;
      /** The coordinate origin that the supplied position is in. Default to the same as `coordinateOrigin`. */
      fromCoordinateOrigin?: [number, number, number];
    }
  ): [number, number, number];
  /** `true` if this layer renders other layers */
  get isComposite(): boolean;
  /** Updates selected state members and marks the layer for redraw */
  setState(partialState: any): void;
  /** Sets the redraw flag for this layer, will trigger a redraw next animation frame */
  setNeedsRedraw(): void;
  /** Mark this layer as needs a deep update */
  setNeedsUpdate(): void;
  /** Returns true if all async resources are loaded */
  get isLoaded(): boolean;
  /** Returns true if using shader-based WGS84 longitude wrapping */
  get wrapLongitude(): boolean;
  /** Returns true if the layer is visible in the picking pass */
  isPickable(): boolean;
  /** Returns an array of models used by this layer, can be overriden by layer subclass */
  getModels(): Model[];
  /** Update shader module parameters */
  setModuleParameters(moduleParameters: any): void;
  /** Returns the attribute manager of this layer */
  getAttributeManager(): AttributeManager | null;
  /** Returns the most recent layer that matched to this state
      (When reacting to an async event, this layer may no longer be the latest) */
  getCurrentLayer(): Layer<PropsT> | null;
  /** Returns the default parse options for async props */
  getLoadOptions(): any;
  use64bitPositions(): boolean;
  onHover(info: PickingInfo, pickingEvent: any): boolean;
  onClick(info: PickingInfo, pickingEvent: any): boolean;
  nullPickingColor(): number[];
  encodePickingColor(i: any, target?: number[]): number[];
  decodePickingColor(color: any): number;
  /** Deduces number of instances. Intention is to support:
      - Explicit setting of numInstances
      - Auto-deduction for ES6 containers that define a size member
      - Auto-deduction for Classic Arrays via the built-in length attribute
      - Auto-deduction via arrays */
  getNumInstances(): number;
  /** Buffer layout describes how many attribute values are packed for each data object
        The default (null) is one value each object.
        Some data formats (e.g. paths, polygons) have various length. Their buffer layout
        is in the form of [L0, L1, L2, ...] */
  getStartIndices(): NumericArray | null;
  getBounds(): [number[], number[]] | null;
  /** Called once to set up the initial state. Layers can create WebGL resources here. */
  abstract initializeState(context: LayerContext): void;
  getShaders(shaders: any): any;
  /** Controls if updateState should be called. By default returns true if any prop has changed */
  shouldUpdateState(params: UpdateParameters<Layer<PropsT>>): boolean;
  /** Default implementation, all attributes will be invalidated and updated when data changes */
  updateState(params: UpdateParameters<Layer<PropsT>>): void;
  /** Called once when layer is no longer matched and state will be discarded. Layers can destroy WebGL resources here. */
  finalizeState(context: LayerContext): void;
  draw(opts: any): void;
  getPickingInfo({info, mode, sourceLayer}: GetPickingInfoParams): PickingInfo;
  /** (Internal) Propagate an error event through the system */
  raiseError(error: Error, message: string): void;
  /** (Internal) Checks if this layer needs redraw */
  getNeedsRedraw(opts?: {
    /** Reset redraw flags to false after the check */
    clearRedrawFlags: boolean;
  }): string | false;
  /** (Internal) Checks if this layer needs a deep update */
  needsUpdate(): boolean;
  /** Checks if this layer has ongoing uniform transition */
  hasUniformTransition(): boolean;
  /** Called when this layer is rendered into the given viewport */
  activateViewport(viewport: Viewport): void;
  /** Default implementation of attribute invalidation, can be redefined */
  protected invalidateAttribute(name?: string): void;
  /** Send updated attributes to the WebGL model */
  protected updateAttributes(changedAttributes: {[id: string]: Attribute}): void;
  /** Recalculate any attributes if needed */
  protected _updateAttributes(): void;
  /** Update attribute transitions. This is called in drawLayer, no model updates required. */
  private _updateAttributeTransition;
  /** Update uniform (prop) transitions. This is called in updateState, may result in model updates. */
  private _updateUniformTransition;
  /** Updater for the automatically populated instancePickingColors attribute */
  protected calculateInstancePickingColors(
    attribute: Attribute,
    {
      numInstances
    }: {
      numInstances: number;
    }
  ): void;
  /** Apply changed attributes to  */
  protected _setModelAttributes(
    model: Model,
    changedAttributes: {
      [id: string]: Attribute;
    }
  ): void;
  /** (Internal) Sets the picking color at the specified index to null picking color. Used for multi-depth picking.
       This method may be overriden by layer implementations */
  disablePickingIndex(objectIndex: number): void;
  protected _disablePickingIndex(objectIndex: number): void;
  /** (Internal) Re-enable all picking indices after multi-depth picking */
  restorePickingColors(): void;
  _initialize(): void;
  /** (Internal) Called by layer manager to transfer state from an old layer */
  _transferState(oldLayer: Layer<PropsT>): void;
  /** (Internal) Called by layer manager when a new layer is added or an existing layer is matched with a new instance */
  _update(): void;
  /** (Internal) Called by manager when layer is about to be disposed
        Note: not guaranteed to be called on application shutdown */
  _finalize(): void;
  _drawLayer({
    moduleParameters,
    uniforms,
    parameters
  }: {
    moduleParameters: any;
    uniforms: any;
    parameters: any;
  }): void;
  /** Returns the current change flags */
  getChangeFlags(): ChangeFlags | undefined;
  /** Dirty some change flags, will be handled by updateLayer */
  setChangeFlags(flags: Partial<ChangeFlags>): void;
  /** Clear all changeFlags, typically after an update */
  private _clearChangeFlags;
  /** Compares the layers props with old props from a matched older layer
        and extracts change flags that describe what has change so that state
        can be update correctly with minimal effort */
  private _diffProps;
  /** (Internal) called by layer manager to perform extra props validation (in development only) */
  validateProps(): void;
  /** (Internal) Called by deck picker when the hovered object changes to update the auto highlight */
  updateAutoHighlight(info: PickingInfo): void;
  /** Update picking module parameters to highlight the hovered object */
  protected _updateAutoHighlight(info: PickingInfo): void;
  /** Create new attribute manager */
  protected _getAttributeManager(): AttributeManager | null;
  /** Called after updateState to perform common tasks */
  protected _postUpdate(updateParams: UpdateParameters<Layer<PropsT>>, forceUpdate: boolean): void;
  private _getUpdateParams;
  /** Checks state of attributes and model */
  private _getNeedsRedraw;
  /** Callback when asyn prop is loaded */
  private _onAsyncPropUpdated;
}
// # sourceMappingURL=layer.d.ts.map
