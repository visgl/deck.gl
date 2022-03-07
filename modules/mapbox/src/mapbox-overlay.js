import {Deck} from '@deck.gl/core';
import {getViewState} from './deck-utils';

export default class MapboxOverlay {
  constructor(props) {
    this._props = {...props};
  }

  setProps(props) {
    Object.assign(this._props, props);

    if ('viewState' in this._props) {
      delete this._props.viewState;
    }

    if (this._deck) {
      this._deck.setProps(this._props);
    }
  }

  onAdd(map) {
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

  onRemove() {
    const map = this._map;
    map.off('resize', this._updateContainerSize);
    map.off('render', this._updateViewState);
    map.off('mousemove', this._handleMouseEvent);
    map.off('mouseout', this._handleMouseEvent);
    map.off('click', this._handleMouseEvent);
    map.off('dblclick', this._handleMouseEvent);

    this._deck.finalize();
    this._map = undefined;
    this._container = undefined;
  }

  getDefaultPosition() {
    return 'top-left';
  }

  pickObject(params) {
    return this._deck && this._deck.pickObject(params);
  }

  pickMultipleObjects(params) {
    return this._deck && this._deck.pickMultipleObjects(params);
  }

  pickObjects(params) {
    return this._deck && this._deck.pickObjects(params);
  }

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

  _handleMouseEvent = event => {
    const deck = this._deck;
    if (!deck) {
      return;
    }

    const mockEvent = {
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
