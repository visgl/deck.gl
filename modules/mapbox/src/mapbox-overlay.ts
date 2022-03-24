import {Deck} from '@deck.gl/core';
import {getViewState} from './deck-utils';

import type {Map, IControl, MapMouseEvent} from 'mapbox-gl';

/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay implements IControl {
  private _props: any;
  private _deck: Deck;
  private _map?: Map;
  private _container?: HTMLDivElement;

  constructor(props) {
    this._props = {...props};
  }

  /** Update (partial) props of the underlying Deck instance. */
  setProps(props: any): void {
    Object.assign(this._props, props);

    if ('viewState' in this._props) {
      delete this._props.viewState;
    }

    if (this._deck) {
      this._deck.setProps(this._props);
    }
  }

  /** Called when the control is added to a map */
  onAdd(map: Map) {
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
  onRemove() {
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
    this._map = undefined;
    this._container = undefined;
  }

  getDefaultPosition() {
    return 'top-left';
  }

  /** Forwards the Deck.pickObject method */
  pickObject(params) {
    return this._deck && this._deck.pickObject(params);
  }

  /** Forwards the Deck.pickMultipleObjects method */
  pickMultipleObjects(params) {
    return this._deck && this._deck.pickMultipleObjects(params);
  }

  /** Forwards the Deck.pickObjects method */
  pickObjects(params) {
    return this._deck && this._deck.pickObjects(params);
  }

  /** Remove from map and releases all resources */
  finalize() {
    if (this._map) {
      this._map.removeControl(this);
    }
  }

  _updateContainerSize = () => {
    if (this._map && this._container) {
      const {clientWidth, clientHeight} = this._map.getContainer();
      Object.assign(this._container.style, {
        width: `${clientWidth}px`,
        height: `${clientHeight}px`
      });
    }
  };

  _updateViewState = () => {
    const deck = this._deck;
    if (deck) {
      deck.setProps({viewState: getViewState(this._map)});
      // Redraw immediately if view state has changed
      deck.redraw(false);
    }
  };

  _handleMouseEvent = (event: MapMouseEvent) => {
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
        // Hack: because we do not listen to pointer down, perform picking now
        deck._lastPointerDownInfo = deck.pickObject({
          ...mockEvent.offsetCenter,
          radius: deck.props.pickingRadius
        });
        mockEvent.tapCount = 1;
        deck._onEvent(mockEvent);
        break;

      case 'dblclick':
        mockEvent.type = 'click';
        mockEvent.tapCount = 2;
        deck._onEvent(mockEvent);
        break;

      case 'mousemove':
        mockEvent.type = 'pointermove';
        deck._onPointerMove(mockEvent);
        break;

      case 'mouseout':
        mockEvent.type = 'pointerleave';
        deck._onPointerMove(mockEvent);
        break;

      default:
        return;
    }
  };
}
