// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Layer, {UpdateParameters} from './layer';
import debug from '../debug/index';
import {flatten} from '../utils/flatten';

import type AttributeManager from './attribute/attribute-manager';
import type {PickingInfo, GetPickingInfoParams} from './picking/pick-info';
import type {FilterContext} from '../passes/layers-pass';
import type {LayersList, LayerContext} from './layer-manager';
import type {CompositeLayerProps, Accessor, AccessorContext} from '../types/layer-props';
import {ConstructorOf} from '../types/types';
import {PROP_TYPES_SYMBOL} from '../lifecycle/constants';

const TRACE_RENDER_LAYERS = 'compositeLayer.renderLayers';

export default abstract class CompositeLayer<PropsT extends {} = {}> extends Layer<
  PropsT & Required<CompositeLayerProps>
> {
  static layerName: string = 'CompositeLayer';

  /** `true` if this layer renders other layers */
  get isComposite(): boolean {
    return true;
  }

  /** `true` if the layer renders to screen */
  get isDrawable(): boolean {
    return false;
  }

  /** Returns true if all async resources are loaded */
  get isLoaded(): boolean {
    return super.isLoaded && this.getSubLayers().every(layer => layer.isLoaded);
  }

  /** Return last rendered sub layers */
  getSubLayers(): Layer[] {
    return (this.internalState && this.internalState.subLayers) || [];
  }

  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initializeState(context: LayerContext): void {}

  /** Updates selected state members and marks the composite layer to need rerender */
  setState(updateObject: any): void {
    super.setState(updateObject);
    // Trigger a layer update
    // Although conceptually layer.draw and compositeLayer.renderLayers are equivalent,
    // they are executed during different lifecycles.
    // draw can be called without calling updateState (e.g. most viewport changes),
    // while renderLayers can only be called during a recursive layer update.
    this.setNeedsUpdate();
  }

  /** called to augment the info object that is bubbled up from a sublayer
      override Layer.getPickingInfo() because decoding / setting uniform do
      not apply to a composite layer. */
  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    const {object} = info;
    const isDataWrapped =
      object && object.__source && object.__source.parent && object.__source.parent.id === this.id;

    if (!isDataWrapped) {
      return info;
    }

    // override object with picked data
    info.object = object.__source.object;
    info.index = object.__source.index;

    return info;
  }

  // Implement to generate subLayers
  abstract renderLayers(): Layer | null | LayersList;

  /**
   * Filters sub layers at draw time. Return true if the sub layer should be drawn.
   */
  filterSubLayer(context: FilterContext): boolean {
    return true;
  }

  /** Returns true if sub layer needs to be rendered */
  protected shouldRenderSubLayer(subLayerId: string, data: any): boolean {
    return data && data.length;
  }

  /** Returns sub layer class for a specific sublayer */
  protected getSubLayerClass<T extends Layer>(
    subLayerId: string,
    DefaultLayerClass: ConstructorOf<T>
  ): ConstructorOf<T> {
    const {_subLayerProps: overridingProps} = this.props;

    return (
      (overridingProps &&
        overridingProps[subLayerId] &&
        (overridingProps[subLayerId].type as ConstructorOf<T>)) ||
      DefaultLayerClass
    );
  }

  /** When casting user data into another format to pass to sublayers,
      add reference to the original object and object index */
  protected getSubLayerRow<T>(row: T, sourceObject: any, sourceObjectIndex: number): T {
    // @ts-ignore (TS2339) adding undefined property
    row.__source = {
      parent: this,
      object: sourceObject,
      index: sourceObjectIndex
    };
    return row;
  }

  /** Some composite layers cast user data into another format before passing to sublayers
    We need to unwrap them before calling the accessor so that they see the original data
    objects */
  protected getSubLayerAccessor<In, Out>(accessor: Accessor<In, Out>): Accessor<In, Out> {
    if (typeof accessor === 'function') {
      const objectInfo: AccessorContext<In> = {
        index: -1,
        // @ts-ignore accessing resolved data
        data: this.props.data,
        target: []
      };
      return (x: any, i: AccessorContext<In>) => {
        if (x && x.__source) {
          objectInfo.index = x.__source.index;
          // @ts-ignore (TS2349) Out is never a function
          return accessor(x.__source.object as In, objectInfo);
        }
        // @ts-ignore (TS2349) Out is never a function
        return accessor(x as In, i);
      };
    }
    return accessor;
  }

  /** Returns sub layer props for a specific sublayer */
  // eslint-disable-next-line complexity
  protected getSubLayerProps(
    sublayerProps: {
      id?: string;
      updateTriggers?: Record<string, any>;
      [propName: string]: any;
    } = {}
  ): any {
    const {
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix,
      extensions,
      fetch,
      operation,
      _subLayerProps: overridingProps
    } = this.props;
    const newProps = {
      id: '',
      updateTriggers: {},
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix,
      extensions,
      fetch,
      operation
    };

    const overridingSublayerProps =
      overridingProps && sublayerProps.id && overridingProps[sublayerProps.id];
    const overridingSublayerTriggers =
      overridingSublayerProps && overridingSublayerProps.updateTriggers;
    const sublayerId = sublayerProps.id || 'sublayer';

    if (overridingSublayerProps) {
      const propTypes = this.props[PROP_TYPES_SYMBOL];
      const subLayerPropTypes = sublayerProps.type ? sublayerProps.type._propTypes : {};
      for (const key in overridingSublayerProps) {
        const propType = subLayerPropTypes[key] || propTypes[key];
        // eslint-disable-next-line
        if (propType && propType.type === 'accessor') {
          overridingSublayerProps[key] = this.getSubLayerAccessor(overridingSublayerProps[key]);
        }
      }
    }

    Object.assign(
      newProps,
      sublayerProps,
      // experimental feature that allows users to override sublayer props via parent layer prop
      overridingSublayerProps
    );
    newProps.id = `${this.props.id}-${sublayerId}`;
    newProps.updateTriggers = {
      all: this.props.updateTriggers?.all,
      ...sublayerProps.updateTriggers,
      ...overridingSublayerTriggers
    };

    // Pass through extension props
    // @ts-ignore (TS2532) extensions is always defined after merging with default props
    for (const extension of extensions) {
      const passThroughProps = extension.getSubLayerProps.call(this, extension);
      if (passThroughProps) {
        Object.assign(newProps, passThroughProps, {
          updateTriggers: Object.assign(newProps.updateTriggers, passThroughProps.updateTriggers)
        });
      }
    }

    return newProps;
  }

  /** Update sub layers to highlight the hovered object */
  protected _updateAutoHighlight(info: PickingInfo): void {
    for (const layer of this.getSubLayers()) {
      layer.updateAutoHighlight(info);
    }
  }

  /** Override base Layer method */
  protected _getAttributeManager(): AttributeManager | null {
    return null;
  }

  /** (Internal) Called after an update to rerender sub layers */
  protected _postUpdate(updateParams: UpdateParameters<this>, forceUpdate: boolean) {
    // @ts-ignore (TS2531) this method is only called internally when internalState is defined
    let subLayers = this.internalState.subLayers as Layer[];
    const shouldUpdate = !subLayers || this.needsUpdate();
    if (shouldUpdate) {
      const subLayersList = this.renderLayers();
      // Flatten the returned array, removing any null, undefined or false
      // this allows layers to render sublayers conditionally
      // (see CompositeLayer.renderLayers docs)
      subLayers = flatten(subLayersList, Boolean) as Layer[];
      // @ts-ignore (TS2531) this method is only called internally when internalState is defined
      this.internalState.subLayers = subLayers;
    }
    debug(TRACE_RENDER_LAYERS, this, shouldUpdate, subLayers);

    // populate reference to parent layer (this layer)
    // NOTE: needs to be done even when reusing layers as the parent may have changed
    for (const layer of subLayers) {
      layer.parent = this;
    }
  }
}
