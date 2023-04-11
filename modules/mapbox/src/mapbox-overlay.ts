import {Deck, assert} from '@deck.gl/core';
import {getViewState, getDeckInstance, removeDeckInstance, getInterleavedProps} from './deck-utils';

import type {Map, IControl, MapMouseEvent} from 'mapbox-gl';
import type {MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {DeckProps} from '@deck.gl/core';

import {resolveLayers} from './resolve-layers';

export type MapboxOverlayProps = Omit<
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
  interleaved?: boolean;
};

/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay implements IControl {
  private _props: MapboxOverlayProps;
  private _deck?: Deck;
  private _map?: Map;
  private _container?: HTMLDivElement;
  private _interleaved: boolean;
  private _lastMouseDownPoint?: {x: number; y: number; clientX: number; clientY: number};

  constructor(props: MapboxOverlayProps) {
    const {interleaved = false, ...otherProps} = props;
    this._interleaved = interleaved;
    this._props = otherProps;
  }

  /** Update (partial) props of the underlying Deck instance. */
  setProps(props: MapboxOverlayProps): void {
    if (this._interleaved && props.layers) {
      resolveLayers(this._map, this._deck, this._props.layers, props.layers);
    }

    Object.assign(this._props, props);

    if (this._deck) {
      this._deck.setProps(this._interleaved ? getInterleavedProps(this._props) : this._props);
    }
  }

  /** Called when the control is added to a map */
  onAdd(map: Map): HTMLDivElement {
    this._map = map;
    return this._interleaved ? this._onAddInterleaved(map) : this._onAddOverlaid(map);
  }

  private _onAddOverlaid(map: Map): HTMLDivElement {
    /* global document */
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      left: 0,
      top: 0,
      pointerEvents: 'none'
    });
    this._container = container;

    this._deck = new Deck({
      ...this._props,
      parent: container,
      viewState: getViewState(map)
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

  private _onAddInterleaved(map: Map): HTMLDivElement {
    this._deck = getDeckInstance({
      map,
      // @ts-ignore non-public map property
      gl: map.painter.context.gl,
      deck: new Deck({
        ...this._props,
        // @ts-ignore non-public map property
        gl: map.painter.context.gl
      })
    });

    map.on('styledata', this._handleStyleChange);
    resolveLayers(map, this._deck, [], this._props.layers);

    return document.createElement('div');
  }

  /** Called when the control is removed from a map */
  onRemove(): void {
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

  private _onRemoveOverlaid(map: Map): void {
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

  private _onRemoveInterleaved(map: Map): void {
    map.off('styledata', this._handleStyleChange);
    resolveLayers(map, this._deck, this._props.layers, []);
    removeDeckInstance(map);
  }

  getDefaultPosition() {
    return 'top-left';
  }

  /** Forwards the Deck.pickObject method */
  pickObject(params: Parameters<Deck['pickObject']>[0]): ReturnType<Deck['pickObject']> {
    assert(this._deck);
    return this._deck.pickObject(params);
  }

  /** Forwards the Deck.pickMultipleObjects method */
  pickMultipleObjects(
    params: Parameters<Deck['pickMultipleObjects']>[0]
  ): ReturnType<Deck['pickMultipleObjects']> {
    assert(this._deck);
    return this._deck.pickMultipleObjects(params);
  }

  /** Forwards the Deck.pickObjects method */
  pickObjects(params: Parameters<Deck['pickObjects']>[0]): ReturnType<Deck['pickObjects']> {
    assert(this._deck);
    return this._deck.pickObjects(params);
  }

  /** Remove from map and releases all resources */
  finalize() {
    if (this._map) {
      this._map.removeControl(this);
    }
  }

  private _handleStyleChange = () => {
    resolveLayers(this._map, this._deck, this._props.layers, this._props.layers);
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

  private _updateViewState = () => {
    const deck = this._deck;
    if (deck) {
      // @ts-ignore (2345) map is always defined if deck is
      deck.setProps({viewState: getViewState(this._map)});
      // Redraw immediately if view state has changed
      if (deck.isInitialized) {
        deck.redraw();
      }
    }
  };

  private _handleMouseEvent = (event: MapMouseEvent) => {
    const deck = this._deck;
    if (!deck || !deck.isInitialized) {
      return;
    }

    const mockEvent: {
      type: string;
      deltaX?: number;
      deltaY?: number;
      offsetCenter: {x: number; y: number};
      srcEvent: MapMouseEvent;
      tapCount?: number;
    } = {
      type: event.type,
      offsetCenter: event.point,
      srcEvent: event
    };

    const lastDown = this._lastMouseDownPoint;
    if (!event.point && lastDown) {
      // drag* events do not contain a `point` field
      mockEvent.deltaX = event.originalEvent.clientX - lastDown.clientX;
      mockEvent.deltaY = event.originalEvent.clientY - lastDown.clientY;
      mockEvent.offsetCenter = {
        x: lastDown.x + mockEvent.deltaX,
        y: lastDown.y + mockEvent.deltaY
      };
    }

    switch (mockEvent.type) {
      case 'mousedown':
        deck._onPointerDown(mockEvent as MjolnirGestureEvent);
        this._lastMouseDownPoint = {
          ...event.point,
          clientX: event.originalEvent.clientX,
          clientY: event.originalEvent.clientY
        };
        break;

      case 'dragstart':
        mockEvent.type = 'panstart';
        deck._onEvent(mockEvent as MjolnirGestureEvent);
        break;

      case 'drag':
        mockEvent.type = 'panmove';
        deck._onEvent(mockEvent as MjolnirGestureEvent);
        break;

      case 'dragend':
        mockEvent.type = 'panend';
        deck._onEvent(mockEvent as MjolnirGestureEvent);
        break;

      case 'click':
        mockEvent.tapCount = 1;
        deck._onEvent(mockEvent as MjolnirGestureEvent);
        break;

      case 'dblclick':
        mockEvent.type = 'click';
        mockEvent.tapCount = 2;
        deck._onEvent(mockEvent as MjolnirGestureEvent);
        break;

      case 'mousemove':
        mockEvent.type = 'pointermove';
        deck._onPointerMove(mockEvent as MjolnirPointerEvent);
        break;

      case 'mouseout':
        mockEvent.type = 'pointerleave';
        deck._onPointerMove(mockEvent as MjolnirPointerEvent);
        break;

      default:
        return;
    }
  };
}
