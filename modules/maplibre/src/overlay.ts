// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, assert} from '@deck.gl/core';
import {
  createMapLibreInterleavedDeck,
  getMapLibreDefaultParameters,
  getMapLibreDefaultView,
  getMapLibreProjection,
  getMapLibreViewState,
  MAPLIBRE_VIEW_ID,
  removeMapLibreDeckInstance
} from './deck-utils';
import {resolveMapLibreLayerGroups} from './resolve-layer-groups';

import type {DeckProps} from '@deck.gl/core';
import type {MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {
  ControlPosition,
  IControl,
  Map as MapLibreMap,
  MapMouseEvent,
  MapMovementEvent
} from 'maplibre-gl';

/** Properties for MapLibreOverlay. */
export type MapLibreOverlayProps = Omit<
  DeckProps,
  | 'width'
  | 'height'
  | 'gl'
  | 'parent'
  | 'canvas'
  | '_customRender'
  | 'viewState'
  | 'initialViewState'
  | 'controller'
> & {
  /**
   * If true, deck.gl layers are inserted into MapLibre's layer stack and share its WebGL2 context.
   * @default false
   */
  interleaved?: boolean;
};

/** Renders deck.gl layers over a MapLibre map and synchronizes with its camera. */
export default class MapLibreOverlay implements IControl {
  private _props: MapLibreOverlayProps;
  private _deck?: Deck<any>;
  private _map?: MapLibreMap;
  private _container?: HTMLDivElement;
  private readonly _interleaved: boolean;

  private _lastMouseDownPoint?: {x: number; y: number; clientX: number; clientY: number};

  /** Creates a MapLibre overlay. */
  constructor(props: MapLibreOverlayProps) {
    const {interleaved = false} = props;
    this._interleaved = interleaved;
    this._props = this._filterProps(props);
  }

  private _filterProps(props: MapLibreOverlayProps): MapLibreOverlayProps {
    const {interleaved: _, useDevicePixels, device, ...deckProps} = props;
    if (!this._interleaved) {
      if (useDevicePixels !== undefined) {
        Object.assign(deckProps, {useDevicePixels});
      }
      if (device !== undefined) {
        Object.assign(deckProps, {device});
      }
    }
    return deckProps as MapLibreOverlayProps;
  }

  /** Updates partial properties of the underlying Deck instance. */
  setProps(props: MapLibreOverlayProps): void {
    if (this._interleaved && props.layers) {
      resolveMapLibreLayerGroups(this._map, this._props.layers, props.layers);
    }

    Object.assign(this._props, this._filterProps(props));

    if (this._deck && this._map) {
      this._deck.setProps({
        ...this._props,
        views: this._getViews(this._map),
        parameters: {
          ...getMapLibreDefaultParameters(this._map, this._interleaved),
          ...this._props.parameters
        }
      });
    }
  }

  /** Called when the control is added to a map. */
  onAdd(map: MapLibreMap): HTMLDivElement {
    this._map = map;
    try {
      return this._interleaved ? this._onAddInterleaved(map) : this._onAddOverlaid(map);
    } catch (error) {
      if (this._deck) {
        if (this._interleaved) {
          this._onRemoveInterleaved(map);
        } else {
          this._onRemoveOverlaid(map);
        }
      }
      this._deck = undefined;
      this._map = undefined;
      this._container = undefined;
      throw error;
    }
  }

  /** Called when the control is removed from a map. */
  onRemove(_map: MapLibreMap): void {
    const map = this._map;

    if (map) {
      if (this._interleaved) {
        this._onRemoveInterleaved(map);
      } else {
        this._onRemoveOverlaid(map);
      }
    }

    this._deck = undefined;
    this._map = undefined;
    this._container = undefined;
  }

  /** Default control position. */
  getDefaultPosition(): ControlPosition {
    return 'top-left';
  }

  /** Forwards to Deck.pickObject. */
  pickObject(params: Parameters<Deck['pickObject']>[0]): ReturnType<Deck['pickObject']> {
    assert(this._deck);
    return this._deck.pickObject(params);
  }

  /** Forwards to Deck.pickMultipleObjects. */
  pickMultipleObjects(
    params: Parameters<Deck['pickMultipleObjects']>[0]
  ): ReturnType<Deck['pickMultipleObjects']> {
    assert(this._deck);
    return this._deck.pickMultipleObjects(params);
  }

  /** Forwards to Deck.pickObjects. */
  pickObjects(params: Parameters<Deck['pickObjects']>[0]): ReturnType<Deck['pickObjects']> {
    assert(this._deck);
    return this._deck.pickObjects(params);
  }

  /** Removes the control from its map and releases resources. */
  finalize(): void {
    this._map?.removeControl(this);
  }

  /** Returns the basemap canvas in interleaved mode and Deck's canvas otherwise. */
  getCanvas(): HTMLCanvasElement | null {
    if (!this._map) {
      return null;
    }
    return this._interleaved ? this._map.getCanvas() : this._deck!.getCanvas();
  }

  private _onAddOverlaid(map: MapLibreMap): HTMLDivElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      left: 0,
      top: 0,
      textAlign: 'initial',
      pointerEvents: 'none'
    });
    this._container = container;

    this._deck = new Deck<any>({
      ...this._props,
      parent: container,
      deviceProps: {
        ...this._props.deviceProps,
        createCanvasContext: {
          ...(typeof this._props.deviceProps?.createCanvasContext === 'object'
            ? this._props.deviceProps.createCanvasContext
            : undefined),
          pixelSizeSource: 'css-dpr'
        }
      },
      parameters: {
        ...getMapLibreDefaultParameters(map, false),
        ...this._props.parameters
      },
      views: this._getViews(map),
      viewState: getMapLibreViewState(map)
    });

    map.on('resize', this._updateContainerSize);
    map.on('render', this._updateViewState);
    map.on('mousedown', this._handleMouseEvent);
    map.on('dragstart', this._handleMouseEvent);
    map.on('drag', this._handleMouseEvent);
    map.on('dragend', this._handleMouseEvent);
    map.on('mousemove', this._handleMouseEvent);
    map.on('mouseout', this._handleMouseEvent);
    map.on('click', this._handleMouseEvent);
    map.on('dblclick', this._handleMouseEvent);

    this._updateContainerSize();
    return container;
  }

  private _onAddInterleaved(map: MapLibreMap): HTMLDivElement {
    this._deck = createMapLibreInterleavedDeck(map, {
      ...this._props,
      views: this._getViews(map),
      parameters: {
        ...getMapLibreDefaultParameters(map, true),
        ...this._props.parameters
      }
    });

    map.on('styledata', this._handleStyleChange);
    resolveMapLibreLayerGroups(map, [], this._props.layers);

    return document.createElement('div');
  }

  private _onRemoveOverlaid(map: MapLibreMap): void {
    map.off('resize', this._updateContainerSize);
    map.off('render', this._updateViewState);
    map.off('mousedown', this._handleMouseEvent);
    map.off('dragstart', this._handleMouseEvent);
    map.off('drag', this._handleMouseEvent);
    map.off('dragend', this._handleMouseEvent);
    map.off('mousemove', this._handleMouseEvent);
    map.off('mouseout', this._handleMouseEvent);
    map.off('click', this._handleMouseEvent);
    map.off('dblclick', this._handleMouseEvent);
    this._deck?.finalize();
  }

  private _onRemoveInterleaved(map: MapLibreMap): void {
    map.off('styledata', this._handleStyleChange);
    try {
      resolveMapLibreLayerGroups(map, this._props.layers, []);
    } finally {
      removeMapLibreDeckInstance(map);
    }
  }

  private _handleStyleChange = () => {
    resolveMapLibreLayerGroups(this._map, this._props.layers, this._props.layers);
    if (!this._map) {
      return;
    }

    if (getMapLibreProjection(this._map)) {
      this._deck?.setProps({views: this._getViews(this._map)});
    }
  };

  private _updateContainerSize = () => {
    if (this._map && this._container) {
      const {clientWidth, clientHeight} = this._map.getContainer();
      Object.assign(this._container.style, {
        width: `${clientWidth}px`,
        height: `${clientHeight}px`
      });
    }
  };

  private _getViews(map: MapLibreMap): any {
    if (!this._props.views) {
      return getMapLibreDefaultView(map);
    }

    const views = Array.isArray(this._props.views) ? this._props.views : [this._props.views];
    const hasMapLibreView = views.some((view: any) => view.id === MAPLIBRE_VIEW_ID);
    if (hasMapLibreView) {
      return this._props.views;
    }
    return [getMapLibreDefaultView(map), ...views];
  }

  private _updateViewState = () => {
    const deck = this._deck;
    const map = this._map;
    if (deck && map) {
      deck.setProps({
        views: this._getViews(map),
        viewState: getMapLibreViewState(map)
      });
      if (deck.isInitialized) {
        deck.redraw();
      }
    }
  };

  // eslint-disable-next-line complexity
  private _handleMouseEvent = (event: MapMouseEvent | MapMovementEvent) => {
    const deck = this._deck;
    if (!deck || !deck.isInitialized) {
      return;
    }

    const mockEvent: {
      type: string;
      deltaX?: number;
      deltaY?: number;
      offsetCenter: {x: number; y: number};
      srcEvent: MapMouseEvent | MapMovementEvent;
      tapCount?: number;
    } = {
      type: event.type,
      offsetCenter: 'point' in event ? event.point : {x: 0, y: 0},
      srcEvent: event
    };

    const lastDown = this._lastMouseDownPoint;
    if (!('point' in event) && lastDown && event.originalEvent instanceof MouseEvent) {
      mockEvent.deltaX = event.originalEvent.clientX - lastDown.clientX;
      mockEvent.deltaY = event.originalEvent.clientY - lastDown.clientY;
      mockEvent.offsetCenter = {
        x: lastDown.x + mockEvent.deltaX,
        y: lastDown.y + mockEvent.deltaY
      };
    }

    switch (mockEvent.type) {
      case 'mousedown':
        deck._onPointerDown(mockEvent as unknown as MjolnirPointerEvent);
        if (!(event.originalEvent instanceof MouseEvent)) {
          return;
        }
        this._lastMouseDownPoint = {
          ...mockEvent.offsetCenter,
          clientX: event.originalEvent.clientX,
          clientY: event.originalEvent.clientY
        };
        break;

      case 'dragstart':
        mockEvent.type = 'panstart';
        deck._onEvent(mockEvent as unknown as MjolnirGestureEvent);
        break;

      case 'drag':
        mockEvent.type = 'panmove';
        deck._onEvent(mockEvent as unknown as MjolnirGestureEvent);
        break;

      case 'dragend':
        mockEvent.type = 'panend';
        deck._onEvent(mockEvent as unknown as MjolnirGestureEvent);
        break;

      case 'click':
        mockEvent.tapCount = 1;
        deck._onEvent(mockEvent as unknown as MjolnirGestureEvent);
        break;

      case 'dblclick':
        mockEvent.type = 'click';
        mockEvent.tapCount = 2;
        deck._onEvent(mockEvent as unknown as MjolnirGestureEvent);
        break;

      case 'mousemove':
        mockEvent.type = 'pointermove';
        deck._onPointerMove(mockEvent as unknown as MjolnirPointerEvent);
        break;

      case 'mouseout':
        mockEvent.type = 'pointerleave';
        deck._onPointerMove(mockEvent as unknown as MjolnirPointerEvent);
        break;

      default:
        return;
    }
  };
}
