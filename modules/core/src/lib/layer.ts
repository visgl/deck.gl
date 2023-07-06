// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable react/no-direct-mutation-state */
import {COORDINATE_SYSTEM} from './constants';
import AttributeManager from './attribute/attribute-manager';
import UniformTransitionManager from './uniform-transition-manager';
import {diffProps, validateProps} from '../lifecycle/props';
import {LIFECYCLE, Lifecycle} from '../lifecycle/constants';
import {count} from '../utils/count';
import log from '../utils/log';
import debug from '../debug';
import GL from '@luma.gl/constants';
import {withParameters, setParameters} from '@luma.gl/core';
import assert from '../utils/assert';
import memoize from '../utils/memoize';
import {mergeShaders} from '../utils/shader';
import {projectPosition, getWorldPosition} from '../shaderlib/project/project-functions';
import typedArrayManager from '../utils/typed-array-manager';

import Component from '../lifecycle/component';
import LayerState, {ChangeFlags} from './layer-state';

import {worldToPixels} from '@math.gl/web-mercator';

import {load} from '@loaders.gl/core';

import type {Loader} from '@loaders.gl/loader-utils';
import type {CoordinateSystem} from './constants';
import type Attribute from './attribute/attribute';
import type {Model} from '@luma.gl/engine';
import type {PickingInfo, GetPickingInfoParams} from './picking/pick-info';
import type Viewport from '../viewports/viewport';
import type {NumericArray} from '../types/types';
import type {DefaultProps} from '../lifecycle/prop-types';
import type {LayerData, LayerProps} from '../types/layer-props';
import type {LayerContext} from './layer-manager';
import type {BinaryAttribute} from './attribute/attribute';

const TRACE_CHANGE_FLAG = 'layer.changeFlag';
const TRACE_INITIALIZE = 'layer.initialize';
const TRACE_UPDATE = 'layer.update';
const TRACE_FINALIZE = 'layer.finalize';
const TRACE_MATCHED = 'layer.matched';

const MAX_PICKING_COLOR_CACHE_SIZE = 2 ** 24 - 1;

const EMPTY_ARRAY = Object.freeze([]);

// Only compare the same two viewports once
const areViewportsEqual = memoize(
  ({oldViewport, viewport}: {oldViewport: Viewport; viewport: Viewport}): boolean => {
    return oldViewport.equals(viewport);
  }
);

let pickingColorCache = new Uint8ClampedArray(0);

const defaultProps: DefaultProps<LayerProps> = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataComparator: {type: 'function', value: null, optional: true},
  _dataDiff: {
    type: 'function',
    // @ts-ignore __diff is not defined on data
    value: data => data && data.__diff,
    optional: true
  },
  dataTransform: {type: 'function', value: null, optional: true},
  onDataLoad: {type: 'function', value: null, optional: true},
  onError: {type: 'function', value: null, optional: true},
  fetch: {
    type: 'function',
    value: <LayerT extends Layer>(
      url: string,
      {
        propName,
        layer,
        loaders,
        loadOptions,
        signal
      }: {
        propName: string;
        layer: LayerT;
        loaders?: Loader[];
        loadOptions?: any;
        signal?: AbortSignal;
      }
    ) => {
      const {resourceManager} = layer.context;
      loadOptions = loadOptions || layer.getLoadOptions();
      loaders = loaders || layer.props.loaders;
      if (signal) {
        loadOptions = {
          ...loadOptions,
          fetch: {
            ...loadOptions?.fetch,
            signal
          }
        };
      }

      let inResourceManager = resourceManager.contains(url);

      if (!inResourceManager && !loadOptions) {
        // If there is no layer-specific load options, then attempt to cache this resource in the data manager
        resourceManager.add({resourceId: url, data: load(url, loaders), persistent: false});
        inResourceManager = true;
      }
      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: data => layer.internalState?.reloadAsyncProp(propName, data),
          consumerId: layer.id,
          requestId: propName
        });
      }

      return load(url, loaders, loadOptions);
    }
  },
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl

  visible: true,
  pickable: false,
  opacity: {type: 'number', min: 0, max: 1, value: 1},
  operation: 'draw',

  onHover: {type: 'function', value: null, optional: true},
  onClick: {type: 'function', value: null, optional: true},
  onDragStart: {type: 'function', value: null, optional: true},
  onDrag: {type: 'function', value: null, optional: true},
  onDragEnd: {type: 'function', value: null, optional: true},

  coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin: {type: 'array', value: [0, 0, 0], compare: true},
  modelMatrix: {type: 'array', value: null, compare: true, optional: true},
  wrapLongitude: false,
  positionFormat: 'XYZ',
  colorFormat: 'RGBA',

  parameters: {type: 'object', value: {}, optional: true, compare: 2},
  loadOptions: {type: 'object', value: null, optional: true, ignore: true},
  transitions: null,
  extensions: [],
  loaders: {type: 'array', value: [], optional: true, ignore: true},

  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: {
    type: 'function',
    value: ({layerIndex}) => [0, -layerIndex * 100]
  },

  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: {type: 'accessor', value: [0, 0, 128, 128]}
};

export type UpdateParameters<LayerT extends Layer> = {
  props: LayerT['props'];
  oldProps: LayerT['props'];
  context: LayerContext;
  changeFlags: ChangeFlags;
};

export default abstract class Layer<PropsT extends {} = {}> extends Component<
  PropsT & Required<LayerProps>
> {
  static defaultProps: DefaultProps = defaultProps;
  static layerName: string = 'Layer';

  static override get componentName() {
    return Object.prototype.hasOwnProperty.call(this, 'layerName') ? this.layerName : '';
  }

  internalState: LayerState<this> | null = null;
  lifecycle: Lifecycle = LIFECYCLE.NO_STATE; // Helps track and debug the life cycle of the layers

  // context and state can technically be null before a layer is initialized/matched.
  // However, they are most extensively accessed in a layer's lifecycle methods, where they are always defined.
  // Checking for null state constantly in layer implementation is unnecessarily verbose.
  context!: LayerContext; // Will reference layer manager's context, contains state shared by layers
  state!: Record<string, any>; // Will be set to the shared layer state object during layer matching

  parent: Layer | null = null;

  get root(): Layer {
    // eslint-disable-next-line
    let layer: Layer = this;
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }

  toString(): string {
    const className = (this.constructor as typeof Layer).layerName || this.constructor.name;
    return `${className}({id: '${this.props.id}'})`;
  }

  // Public API for users

  /** Projects a point with current view state from the current layer's coordinate system to screen */
  project(xyz: number[]): number[] {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;

    const worldPosition = getWorldPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem
    });
    const [x, y, z] = worldToPixels(worldPosition, viewport.pixelProjectionMatrix);
    return xyz.length === 2 ? [x, y] : [x, y, z];
  }

  /** Unprojects a screen pixel to the current view's default coordinate system
      Note: this does not reverse `project`. */
  unproject(xy: number[]): number[] {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    return viewport.unproject(xy);
  }

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
      /** Whether to apply offset mode automatically as does the project shader module.
       * Offset mode places the origin of the common space at the given viewport's center. It is used in some use cases
       * to improve precision in the vertex shader due to the fp32 float limitation.
       * Use `autoOffset:false` if the returned position should not be dependent on the current viewport.
       * Default `true` */
      autoOffset?: boolean;
    }
  ): [number, number, number] {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;

    return projectPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem,
      ...params
    });
  }

  // Public API for custom layer implementation

  /** `true` if this layer renders other layers */
  get isComposite(): boolean {
    return false;
  }

  /** Updates selected state members and marks the layer for redraw */
  setState(partialState: any): void {
    this.setChangeFlags({stateChanged: true});
    Object.assign(this.state, partialState);
    this.setNeedsRedraw();
  }

  /** Sets the redraw flag for this layer, will trigger a redraw next animation frame */
  setNeedsRedraw(): void {
    if (this.internalState) {
      this.internalState.needsRedraw = true;
    }
  }

  /** Mark this layer as needs a deep update */
  setNeedsUpdate() {
    if (this.internalState) {
      this.context.layerManager.setNeedsUpdate(String(this));
      this.internalState.needsUpdate = true;
    }
  }

  /** Returns true if all async resources are loaded */
  get isLoaded(): boolean {
    return this.internalState ? !this.internalState.isAsyncPropLoading() : false;
  }

  /** Returns true if using shader-based WGS84 longitude wrapping */
  get wrapLongitude(): boolean {
    return this.props.wrapLongitude;
  }

  /** @deprecated Returns true if the layer is visible in the picking pass */
  isPickable(): boolean {
    return this.props.pickable && this.props.visible;
  }

  /** Returns an array of models used by this layer, can be overriden by layer subclass */
  getModels(): Model[] {
    return (this.state && (this.state.models || (this.state.model && [this.state.model]))) || [];
  }

  /** Update shader module parameters */
  setModuleParameters(moduleParameters: any): void {
    for (const model of this.getModels()) {
      model.updateModuleSettings(moduleParameters);
    }
  }

  /** Returns the attribute manager of this layer */
  getAttributeManager(): AttributeManager | null {
    return this.internalState && this.internalState.attributeManager;
  }

  /** Returns the most recent layer that matched to this state
    (When reacting to an async event, this layer may no longer be the latest) */
  getCurrentLayer(): Layer<PropsT> | null {
    return this.internalState && this.internalState.layer;
  }

  /** Returns the default parse options for async props */
  getLoadOptions(): any {
    return this.props.loadOptions;
  }

  use64bitPositions(): boolean {
    const {coordinateSystem} = this.props;
    return (
      coordinateSystem === COORDINATE_SYSTEM.DEFAULT ||
      coordinateSystem === COORDINATE_SYSTEM.LNGLAT ||
      coordinateSystem === COORDINATE_SYSTEM.CARTESIAN
    );
  }

  // Event handling
  onHover(info: PickingInfo, pickingEvent): boolean {
    if (this.props.onHover) {
      return this.props.onHover(info, pickingEvent) || false;
    }
    return false;
  }

  onClick(info: PickingInfo, pickingEvent): boolean {
    if (this.props.onClick) {
      return this.props.onClick(info, pickingEvent) || false;
    }
    return false;
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  // @return {Array} - a black color
  nullPickingColor() {
    return [0, 0, 0];
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  encodePickingColor(i, target: number[] = []): number[] {
    target[0] = (i + 1) & 255;
    target[1] = ((i + 1) >> 8) & 255;
    target[2] = (((i + 1) >> 8) >> 8) & 255;
    return target;
  }

  // Returns the index corresponding to a picking color that doesn't match any subfeature
  // @param {Uint8Array} color - color array to be decoded
  // @return {Array} - the decoded picking color
  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    // 1 was added to seperate from no selection
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }

  /** Deduces number of instances. Intention is to support:
    - Explicit setting of numInstances
    - Auto-deduction for ES6 containers that define a size member
    - Auto-deduction for Classic Arrays via the built-in length attribute
    - Auto-deduction via arrays */
  getNumInstances(): number {
    // First Check if app has provided an explicit value
    if (Number.isFinite(this.props.numInstances)) {
      return this.props.numInstances as number;
    }

    // Second check if the layer has set its own value
    if (this.state && this.state.numInstances !== undefined) {
      return this.state.numInstances;
    }

    // Use container library to get a count for any ES6 container or object
    return count(this.props.data);
  }

  /** Buffer layout describes how many attribute values are packed for each data object
      The default (null) is one value each object.
      Some data formats (e.g. paths, polygons) have various length. Their buffer layout
      is in the form of [L0, L1, L2, ...] */
  getStartIndices(): NumericArray | null {
    // First Check if startIndices is provided as an explicit value
    if (this.props.startIndices) {
      return this.props.startIndices;
    }

    // Second check if the layer has set its own value
    if (this.state && this.state.startIndices) {
      return this.state.startIndices;
    }

    return null;
  }

  // Default implementation
  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds(['positions', 'instancePositions']);
  }

  // / LIFECYCLE METHODS - overridden by the layer subclasses

  /** Called once to set up the initial state. Layers can create WebGL resources here. */
  abstract initializeState(context: LayerContext): void;

  getShaders(shaders: any): any {
    for (const extension of this.props.extensions) {
      shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
    }
    return shaders;
  }

  /** Controls if updateState should be called. By default returns true if any prop has changed */
  shouldUpdateState(params: UpdateParameters<Layer<PropsT>>): boolean {
    return params.changeFlags.propsOrDataChanged;
  }

  /** Default implementation, all attributes will be invalidated and updated when data changes */
  // eslint-disable-next-line complexity
  updateState(params: UpdateParameters<Layer<PropsT>>): void {
    const attributeManager = this.getAttributeManager();
    const {dataChanged} = params.changeFlags;
    if (dataChanged && attributeManager) {
      if (Array.isArray(dataChanged)) {
        // is partial update
        for (const dataRange of dataChanged) {
          attributeManager.invalidateAll(dataRange);
        }
      } else {
        attributeManager.invalidateAll();
      }
    }

    // Enable/disable picking buffer
    if (attributeManager) {
      const {props} = params;
      const hasPickingBuffer = this.internalState!.hasPickingBuffer;
      const needsPickingBuffer =
        Number.isInteger(props.highlightedObjectIndex) ||
        props.pickable ||
        props.extensions.some(extension => extension.getNeedsPickingBuffer.call(this, extension));

      // Only generate picking buffer if needed
      if (hasPickingBuffer !== needsPickingBuffer) {
        this.internalState!.hasPickingBuffer = needsPickingBuffer;
        const {pickingColors, instancePickingColors} = attributeManager.attributes;
        const pickingColorsAttribute = pickingColors || instancePickingColors;
        if (pickingColorsAttribute) {
          if (needsPickingBuffer && pickingColorsAttribute.constant) {
            pickingColorsAttribute.constant = false;
            attributeManager.invalidate(pickingColorsAttribute.id);
          }
          if (!pickingColorsAttribute.value && !needsPickingBuffer) {
            pickingColorsAttribute.constant = true;
            pickingColorsAttribute.value = [0, 0, 0];
          }
        }
      }
    }
  }

  /** Called once when layer is no longer matched and state will be discarded. Layers can destroy WebGL resources here. */
  finalizeState(context: LayerContext): void {
    for (const model of this.getModels()) {
      model.delete();
    }
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.finalize();
    }
    if (this.context) {
      this.context.resourceManager.unsubscribe({consumerId: this.id});
    }
    if (this.internalState) {
      this.internalState.uniformTransitions.clear();
      this.internalState.finalize();
    }
  }

  // If state has a model, draw it with supplied uniforms
  draw(opts) {
    for (const model of this.getModels()) {
      model.draw(opts);
    }
  }

  // called to populate the info object that is passed to the event handler
  // @return null to cancel event
  getPickingInfo({info, mode, sourceLayer}: GetPickingInfoParams) {
    const {index} = info;

    if (index >= 0) {
      // If props.data is an indexable array, get the object
      if (Array.isArray(this.props.data)) {
        info.object = this.props.data[index];
      }
    }

    return info;
  }

  // END LIFECYCLE METHODS

  // / INTERNAL METHODS - called by LayerManager, DeckRenderer and DeckPicker

  /** (Internal) Propagate an error event through the system */
  raiseError(error: Error, message: string): void {
    if (message) {
      // Duplicating error message for backward compatibility, see #7986
      // TODO - revisit in v9
      error = new Error(`${message}: ${error.message}`, {cause: error});
    }
    if (!this.props.onError?.(error)) {
      this.context?.onError?.(error, this);
    }
  }

  /** (Internal) Checks if this layer needs redraw */
  getNeedsRedraw(
    opts: {
      /** Reset redraw flags to false after the check */
      clearRedrawFlags: boolean;
    } = {clearRedrawFlags: false}
  ): string | false {
    return this._getNeedsRedraw(opts);
  }

  /** (Internal) Checks if this layer needs a deep update */
  needsUpdate(): boolean {
    if (!this.internalState) {
      return false;
    }

    // Call subclass lifecycle method
    return (
      this.internalState.needsUpdate ||
      this.hasUniformTransition() ||
      this.shouldUpdateState(this._getUpdateParams())
    );
    // End lifecycle method
  }

  /** Checks if this layer has ongoing uniform transition */
  hasUniformTransition(): boolean {
    return this.internalState?.uniformTransitions.active || false;
  }

  /** Called when this layer is rendered into the given viewport */
  activateViewport(viewport: Viewport): void {
    if (!this.internalState) {
      return;
    }

    const oldViewport = this.internalState.viewport;
    this.internalState.viewport = viewport;

    if (!oldViewport || !areViewportsEqual({oldViewport, viewport})) {
      this.setChangeFlags({viewportChanged: true});

      if (this.isComposite) {
        if (this.needsUpdate()) {
          // Composite layers may add/remove sublayers on viewport change
          // Because we cannot change the layers list during a draw cycle, we don't want to update sublayers right away
          // This will not call update immediately, but mark the layerManager as needs update on the next frame
          this.setNeedsUpdate();
        }
      } else {
        this._update();
      }
    }
  }

  /** Default implementation of attribute invalidation, can be redefined */
  protected invalidateAttribute(name = 'all'): void {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }

    if (name === 'all') {
      attributeManager.invalidateAll();
    } else {
      attributeManager.invalidate(name);
    }
  }

  /** Send updated attributes to the WebGL model */
  protected updateAttributes(changedAttributes: {[id: string]: Attribute}) {
    for (const model of this.getModels()) {
      this._setModelAttributes(model, changedAttributes);
    }
  }

  /** Recalculate any attributes if needed */
  protected _updateAttributes(): void {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }
    const props = this.props;

    // Figure out data length
    const numInstances = this.getNumInstances();
    const startIndices = this.getStartIndices();

    attributeManager.update({
      data: props.data,
      numInstances,
      startIndices,
      props,
      transitions: props.transitions,
      // @ts-ignore (TS2339) property attribute is not present on some acceptable data types
      buffers: props.data.attributes,
      context: this
    });

    const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
    this.updateAttributes(changedAttributes);
  }

  /** Update attribute transitions. This is called in drawLayer, no model updates required. */
  private _updateAttributeTransition() {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.updateTransition();
    }
  }

  /** Update uniform (prop) transitions. This is called in updateState, may result in model updates. */
  private _updateUniformTransition(): Layer<PropsT>['props'] {
    // @ts-ignore (TS2339) internalState is alwasy defined when this method is called
    const {uniformTransitions} = this.internalState;
    if (uniformTransitions.active) {
      // clone props
      const propsInTransition = uniformTransitions.update();
      const props = Object.create(this.props);
      for (const key in propsInTransition) {
        Object.defineProperty(props, key, {value: propsInTransition[key]});
      }
      return props;
    }
    return this.props;
  }

  /** Updater for the automatically populated instancePickingColors attribute */
  protected calculateInstancePickingColors(
    attribute: Attribute,
    {numInstances}: {numInstances: number}
  ) {
    if (attribute.constant) {
      return;
    }

    // calculateInstancePickingColors always generates the same sequence.
    // pickingColorCache saves the largest generated sequence for reuse
    const cacheSize = Math.floor(pickingColorCache.length / 3);

    // Record when using the picking buffer cache, so that layers can always point at the most recently allocated cache
    // @ts-ignore (TS2531) internalState is always defined when this method is called
    this.internalState.usesPickingColorCache = true;

    if (cacheSize < numInstances) {
      if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
        log.warn(
          'Layer has too many data objects. Picking might not be able to distinguish all objects.'
        )();
      }

      pickingColorCache = typedArrayManager.allocate(pickingColorCache, numInstances, {
        size: 3,
        copy: true,
        maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
      });

      // If the attribute is larger than the cache, resize the cache and populate the missing chunk
      const newCacheSize = Math.floor(pickingColorCache.length / 3);
      const pickingColor = [];
      for (let i = cacheSize; i < newCacheSize; i++) {
        this.encodePickingColor(i, pickingColor);
        pickingColorCache[i * 3 + 0] = pickingColor[0];
        pickingColorCache[i * 3 + 1] = pickingColor[1];
        pickingColorCache[i * 3 + 2] = pickingColor[2];
      }
    }

    attribute.value = pickingColorCache.subarray(0, numInstances * 3);
  }

  /** Apply changed attributes to  */
  protected _setModelAttributes(
    model: Model,
    changedAttributes: {
      [id: string]: Attribute;
    }
  ) {
    const attributeManager = this.getAttributeManager();
    // @ts-ignore luma.gl type issue
    const excludeAttributes = model.userData.excludeAttributes || {};
    // @ts-ignore (TS2531) this method is only called internally with attributeManager defined
    const shaderAttributes = attributeManager.getShaderAttributes(
      changedAttributes,
      excludeAttributes
    );

    model.setAttributes(shaderAttributes);
  }

  /** (Internal) Sets the picking color at the specified index to null picking color. Used for multi-depth picking.
     This method may be overriden by layer implementations */
  disablePickingIndex(objectIndex: number) {
    const data = this.props.data as LayerData<any>;
    if (!('attributes' in data)) {
      this._disablePickingIndex(objectIndex);
      return;
    }

    // @ts-ignore (TS2531) this method is only called internally with attributeManager defined
    const {pickingColors, instancePickingColors} = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    const externalColorAttribute =
      colors && data.attributes && (data.attributes[colors.id] as BinaryAttribute);
    if (externalColorAttribute && externalColorAttribute.value) {
      const values = externalColorAttribute.value;
      const objectColor = this.encodePickingColor(objectIndex);
      for (let index = 0; index < data.length; index++) {
        const i = colors.getVertexOffset(index);
        if (
          values[i] === objectColor[0] &&
          values[i + 1] === objectColor[1] &&
          values[i + 2] === objectColor[2]
        ) {
          this._disablePickingIndex(index);
        }
      }
    } else {
      this._disablePickingIndex(objectIndex);
    }
  }

  // TODO - simplify subclassing interface
  protected _disablePickingIndex(objectIndex: number): void {
    // @ts-ignore (TS2531) this method is only called internally with attributeManager defined
    const {pickingColors, instancePickingColors} = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    if (!colors) {
      return;
    }

    const start = colors.getVertexOffset(objectIndex);
    const end = colors.getVertexOffset(objectIndex + 1);

    // Fill the sub buffer with 0s
    colors.buffer.subData({
      data: new Uint8Array(end - start),
      offset: start // 1 byte per element
    });
  }

  /** (Internal) Re-enable all picking indices after multi-depth picking */
  restorePickingColors(): void {
    // @ts-ignore (TS2531) this method is only called internally with attributeManager defined
    const {pickingColors, instancePickingColors} = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    if (!colors) {
      return;
    }
    // The picking color cache may have been freed and then reallocated. This ensures we read from the currently allocated cache.
    if (
      // @ts-ignore (TS2531) this method is only called internally with internalState defined
      this.internalState.usesPickingColorCache &&
      (colors.value as Uint8ClampedArray).buffer !== pickingColorCache.buffer
    ) {
      colors.value = pickingColorCache.subarray(0, (colors.value as Uint8ClampedArray).length);
    }
    colors.updateSubBuffer({startOffset: 0});
  }

  /* eslint-disable max-statements */
  /* (Internal) Called by layer manager when a new layer is found */
  _initialize() {
    assert(!this.internalState); // finalized layer cannot be reused
    assert(Number.isFinite(this.props.coordinateSystem)); // invalid coordinateSystem

    debug(TRACE_INITIALIZE, this);

    const attributeManager = this._getAttributeManager();

    if (attributeManager) {
      // All instanced layers get instancePickingColors attribute by default
      // Their shaders can use it to render a picking scene
      // TODO - this slightly slows down non instanced layers
      attributeManager.addInstanced({
        instancePickingColors: {
          type: GL.UNSIGNED_BYTE,
          size: 3,
          noAlloc: true,
          // Updaters are always called with `this` pointing to the layer
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateInstancePickingColors
        }
      });
    }

    this.internalState = new LayerState<this>({
      attributeManager,
      layer: this
    });
    this._clearChangeFlags(); // populate this.internalState.changeFlags

    this.state = {};
    // for backwards compatibility with older layers
    // TODO - remove in next release
    /* eslint-disable accessor-pairs */
    Object.defineProperty(this.state, 'attributeManager', {
      get: () => {
        log.deprecated('layer.state.attributeManager', 'layer.getAttributeManager()')();
        return attributeManager;
      }
    });
    /* eslint-enable accessor-pairs */

    this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
    this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);

    // Ensure any async props are updated
    this.internalState.setAsyncProps(this.props);

    // Call subclass lifecycle methods
    this.initializeState(this.context);

    // Initialize extensions
    for (const extension of this.props.extensions) {
      extension.initializeState.call(this, this.context, extension);
    }
    // End subclass lifecycle methods

    // initializeState callback tends to clear state
    this.setChangeFlags({
      dataChanged: 'init',
      propsChanged: 'init',
      viewportChanged: true,
      extensionsChanged: true
    });

    this._update();
  }

  /** (Internal) Called by layer manager to transfer state from an old layer */
  _transferState(oldLayer: Layer<PropsT>): void {
    debug(TRACE_MATCHED, this, this === oldLayer);

    const {state, internalState} = oldLayer;

    if (this === oldLayer) {
      return;
    }

    // Move internalState
    this.internalState = internalState as LayerState<this>;

    // Move state
    this.state = state;
    // We keep the state ref on old layers to support async actions
    // oldLayer.state = null;

    // Ensure any async props are updated
    this.internalState.setAsyncProps(this.props);

    this._diffProps(this.props, this.internalState.getOldProps() as Layer<PropsT>['props']);
  }

  /** (Internal) Called by layer manager when a new layer is added or an existing layer is matched with a new instance */
  _update(): void {
    // Call subclass lifecycle method
    const stateNeedsUpdate = this.needsUpdate();
    // End lifecycle method
    debug(TRACE_UPDATE, this, stateNeedsUpdate);

    if (!stateNeedsUpdate) {
      return;
    }

    const currentProps = this.props;
    const context = this.context;
    const internalState = this.internalState as LayerState<this>;

    const currentViewport = context.viewport;
    const propsInTransition = this._updateUniformTransition();
    internalState.propsInTransition = propsInTransition;
    // Overwrite this.context.viewport during update to use the last activated viewport on this layer
    // In multi-view applications, a layer may only be drawn in one of the views
    // Which would make the "active" viewport different from the shared context
    context.viewport = internalState.viewport || currentViewport;
    // Overwrite this.props during update to use in-transition prop values
    this.props = propsInTransition;

    try {
      const updateParams = this._getUpdateParams();
      const oldModels = this.getModels();

      // Safely call subclass lifecycle methods
      if (context.gl) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {
          // ignore error if gl context is missing
        }
      }
      // Execute extension updates
      for (const extension of this.props.extensions) {
        extension.updateState.call(this, updateParams, extension);
      }

      const modelChanged = this.getModels()[0] !== oldModels[0];
      this._postUpdate(updateParams, modelChanged);
      // End subclass lifecycle methods
    } finally {
      // Restore shared context
      context.viewport = currentViewport;
      this.props = currentProps;
      this._clearChangeFlags();
      internalState.needsUpdate = false;
      internalState.resetOldProps();
    }
  }
  /* eslint-enable max-statements */

  /** (Internal) Called by manager when layer is about to be disposed 
      Note: not guaranteed to be called on application shutdown */
  _finalize(): void {
    debug(TRACE_FINALIZE, this);

    // Call subclass lifecycle method
    this.finalizeState(this.context);
    // Finalize extensions
    for (const extension of this.props.extensions) {
      extension.finalizeState.call(this, this.context, extension);
    }
  }

  // Calculates uniforms
  _drawLayer({
    moduleParameters = null,
    uniforms = {},
    parameters = {}
  }: {
    moduleParameters: any;
    uniforms: any;
    parameters: any;
  }): void {
    this._updateAttributeTransition();

    const currentProps = this.props;
    const context = this.context;
    // Overwrite this.props during redraw to use in-transition prop values
    // `internalState.propsInTransition` could be missing if `updateState` failed
    // @ts-ignore (TS2339) internalState is alwasy defined when this method is called
    this.props = this.internalState.propsInTransition || currentProps;

    const opacity = this.props.opacity;
    // apply gamma to opacity to make it visually "linear"
    uniforms.opacity = Math.pow(opacity, 1 / 2.2);

    try {
      // TODO/ib - hack move to luma Model.draw
      if (moduleParameters) {
        this.setModuleParameters(moduleParameters);
      }

      // Apply polygon offset to avoid z-fighting
      // TODO - move to draw-layers
      const {getPolygonOffset} = this.props;
      const offsets = (getPolygonOffset && getPolygonOffset(uniforms)) || [0, 0];

      setParameters(context.gl, {polygonOffset: offsets});

      // Call subclass lifecycle method
      withParameters(context.gl, parameters, () => {
        const opts = {moduleParameters, uniforms, parameters, context};

        // extensions
        for (const extension of this.props.extensions) {
          extension.draw.call(this, opts, extension);
        }

        this.draw(opts);
      });
    } finally {
      this.props = currentProps;
    }

    // End lifecycle method
  }

  // Helper methods
  /** Returns the current change flags */
  getChangeFlags(): ChangeFlags | undefined {
    return this.internalState?.changeFlags;
  }

  /* eslint-disable complexity */
  /** Dirty some change flags, will be handled by updateLayer */
  setChangeFlags(flags: Partial<ChangeFlags>): void {
    if (!this.internalState) {
      return;
    }
    const {changeFlags} = this.internalState;

    /* eslint-disable no-fallthrough, max-depth */
    for (const key in flags) {
      if (flags[key]) {
        let flagChanged = false;
        switch (key) {
          case 'dataChanged':
            // changeFlags.dataChanged may be `false`, a string (reason) or an array of ranges
            const dataChangedReason = flags[key];
            const prevDataChangedReason = changeFlags[key];
            if (dataChangedReason && Array.isArray(prevDataChangedReason)) {
              // Merge partial updates
              changeFlags.dataChanged = Array.isArray(dataChangedReason)
                ? prevDataChangedReason.concat(dataChangedReason)
                : dataChangedReason;
              flagChanged = true;
            }

          default:
            if (!changeFlags[key]) {
              changeFlags[key] = flags[key];
              flagChanged = true;
            }
        }
        if (flagChanged) {
          debug(TRACE_CHANGE_FLAG, this, key, flags);
        }
      }
    }
    /* eslint-enable no-fallthrough, max-depth */

    // Update composite flags
    const propsOrDataChanged = Boolean(
      changeFlags.dataChanged ||
        changeFlags.updateTriggersChanged ||
        changeFlags.propsChanged ||
        changeFlags.extensionsChanged
    );
    changeFlags.propsOrDataChanged = propsOrDataChanged;
    changeFlags.somethingChanged =
      propsOrDataChanged || changeFlags.viewportChanged || changeFlags.stateChanged;
  }
  /* eslint-enable complexity */

  /** Clear all changeFlags, typically after an update */
  private _clearChangeFlags(): void {
    // @ts-ignore TS2531 this method can only be called internally with internalState assigned
    this.internalState.changeFlags = {
      dataChanged: false,
      propsChanged: false,
      updateTriggersChanged: false,
      viewportChanged: false,
      stateChanged: false,
      extensionsChanged: false,
      propsOrDataChanged: false,
      somethingChanged: false
    };
  }

  /** Compares the layers props with old props from a matched older layer
      and extracts change flags that describe what has change so that state
      can be update correctly with minimal effort */
  private _diffProps(newProps: Layer<PropsT>['props'], oldProps: Layer<PropsT>['props']) {
    const changeFlags = diffProps(newProps, oldProps);

    // iterate over changedTriggers
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this.invalidateAttribute(key);
        }
      }
    }

    // trigger uniform transitions
    if (changeFlags.transitionsChanged) {
      for (const key in changeFlags.transitionsChanged) {
        // prop changed and transition is enabled
        // @ts-ignore (TS2531) internalState is always defined when this method is called
        this.internalState.uniformTransitions.add(
          key,
          oldProps[key],
          newProps[key],
          newProps.transitions?.[key]
        );
      }
    }

    return this.setChangeFlags(changeFlags);
  }

  /** (Internal) called by layer manager to perform extra props validation (in development only) */
  validateProps(): void {
    validateProps(this.props);
  }

  /** (Internal) Called by deck picker when the hovered object changes to update the auto highlight */
  updateAutoHighlight(info: PickingInfo): void {
    if (this.props.autoHighlight && !Number.isInteger(this.props.highlightedObjectIndex)) {
      this._updateAutoHighlight(info);
    }
  }

  // May be overriden by subclasses

  // TODO - simplify subclassing interface
  /** Update picking module parameters to highlight the hovered object */
  protected _updateAutoHighlight(info: PickingInfo): void {
    const pickingModuleParameters: any = {
      pickingSelectedColor: info.picked ? info.color : null
    };
    const {highlightColor} = this.props;
    if (info.picked && typeof highlightColor === 'function') {
      pickingModuleParameters.pickingHighlightColor = highlightColor(info);
    }
    this.setModuleParameters(pickingModuleParameters);
    // setModuleParameters does not trigger redraw
    this.setNeedsRedraw();
  }

  /** Create new attribute manager */
  protected _getAttributeManager(): AttributeManager | null {
    const context = this.context;
    return new AttributeManager(context.gl, {
      id: this.props.id,
      stats: context.stats,
      timeline: context.timeline
    });
  }

  // Private methods

  /** Called after updateState to perform common tasks */
  protected _postUpdate(updateParams: UpdateParameters<Layer<PropsT>>, forceUpdate: boolean) {
    const {props, oldProps} = updateParams;

    this.setNeedsRedraw();
    // Check if attributes need recalculation
    this._updateAttributes();

    // Note: Automatic instance count update only works for single layers
    const {model} = this.state;
    model?.setInstanceCount(this.getNumInstances());

    // Set picking module parameters to match props
    const {autoHighlight, highlightedObjectIndex, highlightColor} = props;
    if (
      forceUpdate ||
      oldProps.autoHighlight !== autoHighlight ||
      oldProps.highlightedObjectIndex !== highlightedObjectIndex ||
      oldProps.highlightColor !== highlightColor
    ) {
      const parameters: any = {};
      if (!autoHighlight) {
        parameters.pickingSelectedColor = null;
      }
      if (Array.isArray(highlightColor)) {
        parameters.pickingHighlightColor = highlightColor;
      }

      // highlightedObjectIndex will overwrite any settings from auto highlighting.
      // Do not reset unless the value has changed.
      if (forceUpdate || highlightedObjectIndex !== oldProps.highlightedObjectIndex) {
        parameters.pickingSelectedColor =
          Number.isFinite(highlightedObjectIndex) && (highlightedObjectIndex as number) >= 0
            ? this.encodePickingColor(highlightedObjectIndex)
            : null;
      }

      this.setModuleParameters(parameters);
    }
  }

  private _getUpdateParams(): UpdateParameters<Layer<PropsT>> {
    return {
      props: this.props,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      oldProps: this.internalState.getOldProps() as PropsT,
      context: this.context,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      changeFlags: this.internalState.changeFlags
    };
  }

  /** Checks state of attributes and model */
  private _getNeedsRedraw(opts: {clearRedrawFlags: boolean}): string | false {
    // this method may be called by the render loop as soon a the layer
    // has been created, so guard against uninitialized state
    if (!this.internalState) {
      return false;
    }

    let redraw: string | false = false;
    redraw = redraw || (this.internalState.needsRedraw && this.id);

    // TODO - is attribute manager needed? - Model should be enough.
    const attributeManager = this.getAttributeManager();
    const attributeManagerNeedsRedraw = attributeManager
      ? attributeManager.getNeedsRedraw(opts)
      : false;
    redraw = redraw || attributeManagerNeedsRedraw;

    if (redraw) {
      for (const extension of this.props.extensions) {
        extension.onNeedsRedraw.call(this, extension);
      }
    }

    this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;
    return redraw;
  }

  /** Callback when asyn prop is loaded */
  private _onAsyncPropUpdated(): void {
    // @ts-ignore TS2531 this method can only be called internally with internalState assigned
    this._diffProps(this.props, this.internalState.getOldProps());
    this.setNeedsUpdate();
  }
}
