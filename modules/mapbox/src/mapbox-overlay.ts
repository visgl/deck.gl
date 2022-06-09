import {Deck, assert} from '@deck.gl/core';
import {getViewState} from './deck-utils';

import type {Map, IControl, MapMouseEvent} from 'mapbox-gl';
import type {MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {DeckProps} from '@deck.gl/core';

/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay implements IControl {
  private _props: DeckProps;
  private _deck?: Deck;
  private _map?: Map;
  private _container?: HTMLDivElement;

  constructor(props: DeckProps) {
    this._props = {...props};
  }

  /** Update (partial) props of the underlying Deck instance. */
  setProps(props: DeckProps): void {
    Object.assign(this._props, props);

    if ('viewState' in this._props) {
      delete this._props.viewState;
    }

    if (this._deck) {
      this._deck.setProps(this._props);
    }
  }

  /** Called when the control is added to a map */
  onAdd(map: Map): HTMLDivElement {
    this._map = map;

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
    map.on('mousemove', this._handleMouseEvent);
    map.on('mouseout', this._handleMouseEvent);
    map.on('click', this._handleMouseEvent);
    map.on('dblclick', this._handleMouseEvent);

    this._updateContainerSize();
    return container;
  }

  /** Called when the control is removed from a map */
  onRemove(): void {
    const map = this._map;

    if (map) {
      map.off('resize', this._updateContainerSize);
      map.off('render', this._updateViewState);
      map.off('mousemove', this._handleMouseEvent);
      map.off('mouseout', this._handleMouseEvent);
      map.off('click', this._handleMouseEvent);
      map.off('dblclick', this._handleMouseEvent);
    }

    this._deck?.finalize();
    this._deck = undefined;
    this._map = undefined;
    this._container = undefined;
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
      deck.redraw();
    }
  };

  private _handleMouseEvent = (event: MapMouseEvent) => {
    const deck = this._deck;
    if (!deck) {
      return;
    }

    const mockEvent: {
      type: string;
      offsetCenter: {x: number; y: number};
      srcEvent: MapMouseEvent;
      tapCount?: number;
    } = {
      type: event.type,
      offsetCenter: event.point,
      srcEvent: event
    };

    switch (event.type) {
      case 'click':
        mockEvent.tapCount = 1;
        // Hack: because we do not listen to pointer down, perform picking now
        deck._onPointerDown(mockEvent as MjolnirGestureEvent);
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
