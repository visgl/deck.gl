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

import React, {createElement, cloneElement} from 'react';
import PropTypes from 'prop-types';
import {Deck, log} from '@deck.gl/core';
import extractJSXLayers from './utils/extract-jsx-layers';
import autobind from './utils/autobind';

const propTypes = Deck.getPropTypes(PropTypes);

const defaultProps = Deck.defaultProps;

export default class DeckGL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.children = [];
    autobind(this);
  }

  componentDidMount() {
    this.deck = new Deck(
      Object.assign({}, this.props, {
        canvas: this.deckCanvas,
        viewState: this._getViewState(this.props),
        // Note: If Deck event handling change size or view state, it calls onResize to update
        onViewStateChange: this._onViewStateChange,
        onResize: this._onResize
      })
    );
    this._updateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateFromProps(nextProps);
  }

  componentWillUnmount() {
    this.deck.finalize();
  }

  // Public API

  pickObject({x, y, radius = 0, layerIds = null}) {
    return this.deck.pickObject({x, y, radius, layerIds});
  }

  pickMultipleObjects({x, y, radius = 0, layerIds = null, depth = 10}) {
    return this.deck.pickMultipleObjects({x, y, radius, layerIds, depth});
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.deck.pickObjects({x, y, width, height, layerIds});
  }

  queryObject(opts) {
    log.removed('queryObject', 'pickObject')();
  }

  queryVisibleObjects(opts) {
    log.removed('queryVisibleObjects', 'pickObjects')();
  }

  // Callbacks

  // Forward callback and then call forceUpdate to guarantee that sub components update
  _onResize(...args) {
    this.props.onResize(...args);
    this.forceUpdate();
  }

  // Forward callback and then call forceUpdate to guarantee that sub components update
  _onViewStateChange(...args) {
    const viewState = this.props.onViewStateChange(...args);
    this.forceUpdate();
    return viewState;
  }

  // Private Helpers

  // 1. Extract any JSX layers from the react children
  // 2. Handle any backwards compatiblity props for React layer
  // Needs to be called both from initial mount, and when new props arrive
  _updateFromProps(nextProps) {
    if (nextProps.viewports || nextProps.viewport) {
      log.removed('DeckGL.viewport(s)', 'DeckGL.views')();
    }

    // extract any deck.gl layers masquerading as react elements from props.children
    const {layers, children} = extractJSXLayers(nextProps.children, nextProps.layers);

    this.deck.setProps(
      Object.assign({}, nextProps, {
        viewState: this._getViewState(nextProps),
        layers
      })
    );

    this.children = children;
  }

  // Supports old "geospatial view state as separate props" style (React only!)
  _getViewState(props) {
    if (!props.viewState && 'latitude' in props && 'longitude' in props && 'zoom' in props) {
      const {latitude, longitude, zoom, pitch = 0, bearing = 0} = props;
      return {latitude, longitude, zoom, pitch, bearing};
    }
    return props.viewState;
  }

  // Iterate over views and reposition children associated with views
  // TODO - Can we supply a similar function for the non-React case?
  _positionChildrenUnderViews(children) {
    return children.map((child, i) => {
      if (child.props.viewportId) {
        log.removed('viewportId', 'viewId')();
      }

      const {viewId} = child.props;

      // If child does not specify props.viewId, position / render as normal
      if (!viewId) {
        return child;
      }

      const viewport = this.deck.viewManager.getViewport(viewId);

      // Drop (auto-hide) elements with viewId that are not matched by any current view
      if (!viewport) {
        return null;
      }

      // Resolve potentially relative dimensions using the deck.gl container size
      const {x, y, width, height} = viewport;

      // Clone the element with width and height set per view
      const newProps = Object.assign({}, child.props, {width, height});

      // Inject map properties
      // TODO - this is too react-map-gl specific
      Object.assign(newProps, viewport.getMercatorParams(), {
        visible: viewport.isMapSynched()
      });

      const clone = cloneElement(child, newProps);

      // Wrap it in an absolutely positioning div
      const style = {position: 'absolute', left: x, top: y, width, height};
      const key = `view-child-${viewId}-${i}`;
      return createElement('div', {key, id: key, style}, clone);
    });
  }

  render() {
    // Render the background elements (typically react-map-gl instances)
    // using the view descriptors
    const children = this._positionChildrenUnderViews(this.children);

    // TODO - this styling is enforced for correct positioning with children
    // It can override the styling set by `Deck`, this should be consolidated.
    // Note that width and height are handled by deck.gl
    const style = Object.assign({}, {position: 'absolute', left: 0, top: 0}, this.props.style);

    const canvas = createElement('canvas', {
      ref: c => (this.deckCanvas = c),
      key: 'deck-canvas',
      id: this.props.id,
      style
    });

    // Render deck.gl as last child
    children.push(canvas);

    return createElement('div', {id: 'deckgl-wrapper'}, children);
  }
}

DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps;
