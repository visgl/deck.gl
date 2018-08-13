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

import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import {Deck, View, log} from '@deck.gl/core';
import extractJSXLayers from './utils/extract-jsx-layers';
import {inheritsFrom} from './utils/inherits-from';
import evaluateChildren from './utils/evaluate-children';
import autobind from './utils/autobind';

const propTypes = Deck.getPropTypes(PropTypes);

const defaultProps = Deck.defaultProps;

export default class DeckGL extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      viewState: props.initialViewState
    };
    this.children = [];
    autobind(this);
  }

  componentDidMount() {
    // Allows a subclass of Deck to be used
    // TODO - update propTypes / defaultProps?
    const DeckClass = this.props.Deck || Deck;

    // DEVTOOLS can cause this to be called twice
    this.deck =
      this.deck ||
      new DeckClass(
        Object.assign({}, this.props, {
          initialViewState: null,
          canvas: this.deckCanvas,
          viewState: this._getViewState(this.props),
          // Note: If Deck event handling change size or view state, it calls onResize to update
          onViewStateChange: this._onViewStateChange,
          onResize: this._onResize
        })
      );
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
  _onResize(params) {
    this.setState(params);
    this.props.onResize(params);
  }

  // Forward callback and then call forceUpdate to guarantee that sub components update
  _onViewStateChange(params) {
    // Let app know that view state is changing, and give it a chance to change it
    const viewState = this.props.onViewStateChange(params) || params.viewState;

    // If initialViewState was set on creation, auto track position
    if (this.state.viewState) {
      this.setState({
        viewState: Object.assign({}, this.state.viewState, {
          [params.viewId]: viewState
        })
      });
    }
  }

  // Private Helpers

  // 1. Extract any JSX layers from the react children
  // 2. Handle any backwards compatiblity props for React layer
  // Needs to be called both from initial mount, and when new props arrive
  _updateFromProps(nextProps) {
    if (!this.deck) {
      return;
    }

    if (nextProps.viewports || nextProps.viewport) {
      log.removed('DeckGL.viewport(s)', 'DeckGL.views')();
    }

    // extract any deck.gl layers masquerading as react elements from props.children
    const {layers, views, children} = extractJSXLayers(nextProps);

    const deckProps = Object.assign({}, nextProps, {
      onViewStateChange: this._onViewStateChange,
      onResize: this._onResize,
      layers,
      views
    });

    const viewState = this._getViewState(nextProps);
    if (viewState) {
      deckProps.viewState = viewState;
    }

    this.deck.setProps(deckProps);

    this.children = children;
  }

  // Supports old "geospatial view state as separate props" style (React only!)
  _getViewState(props) {
    if (!props.viewState && 'latitude' in props && 'longitude' in props && 'zoom' in props) {
      if ('maxZoom' in props || 'minZoom' in props) {
        log.removed('maxZoom/minZoom', 'viewState');
      }
      const {latitude, longitude, zoom, pitch = 0, bearing = 0} = props;
      return {latitude, longitude, zoom, pitch, bearing};
    }
    return props.viewState || this.state.viewState;
  }

  // Iterate over views and reposition children associated with views
  // TODO - Can we supply a similar function for the non-React case?
  _positionChildrenUnderViews(children) {
    const {viewManager} = this.deck || {};

    if (!viewManager || !viewManager.views.length) {
      return [];
    }

    const defaultViewId = viewManager.views[0].id;

    return children.map((child, i) => {
      if (child.props.viewportId) {
        log.removed('viewportId', '<View>')();
      }
      if (child.props.viewId) {
        log.removed('viewId', '<View>')();
      }

      // Unless child is a View, position / render as part of the default view
      let viewId = defaultViewId;
      let viewChildren = child;
      if (inheritsFrom(child.type, View)) {
        viewId = child.props.id || defaultViewId;
        viewChildren = child.props.children;
      }

      const viewport = viewManager.getViewport(viewId);
      const viewState = viewManager.getViewState(viewId);

      // Drop (auto-hide) elements with viewId that are not matched by any current view
      if (!viewport) {
        return null;
      }

      // Resolve potentially relative dimensions using the deck.gl container size
      const {x, y, width, height} = viewport;

      viewChildren = evaluateChildren(viewChildren, {
        x,
        y,
        width,
        height,
        viewport,
        viewState
      });

      const style = {position: 'absolute', left: x, top: y, width, height};
      const key = `view-child-${viewId}-${i}`;
      return createElement('div', {key, id: key, style}, viewChildren);
    });
  }

  render() {
    // TODO - expensive to update on every render?
    this._updateFromProps(this.props);

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
