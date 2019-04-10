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
    this.viewports = null;
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
          canvas: this.deckCanvas,
          _customRender: this._customRender
        })
      );
    this._updateFromProps();
  }

  componentDidUpdate() {
    this._redrawDeck();
    this._updateFromProps();
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
  _redrawDeck() {
    this.deck._drawLayers('React update');
  }

  _customRender() {
    const viewports = this.deck.viewManager.getViewports();

    if (viewports !== this.viewports) {
      // Viewports have changed, update children props first
      this.forceUpdate();
    } else {
      this._redrawDeck();
    }
  }

  // Private Helpers

  // 1. Extract any JSX layers from the react children
  // 2. Handle any backwards compatiblity props for React layer
  // Needs to be called both from initial mount, and when new props arrive
  _updateFromProps() {
    if (!this.deck) {
      return;
    }

    // extract any deck.gl layers masquerading as react elements from props.children
    const {layers, views, children} = extractJSXLayers(this.props);

    const deckProps = Object.assign({}, this.props, {
      layers,
      views
    });

    this.deck.setProps(deckProps);

    this.children = children;
  }

  // Iterate over views and reposition children associated with views
  // TODO - Can we supply a similar function for the non-React case?
  _positionChildrenUnderViews(children) {
    const {viewManager} = this.deck || {};

    if (!viewManager || !viewManager.views.length) {
      return [];
    }

    const defaultViewId = viewManager.views[0].id;
    // Save the viewports used for the last render
    this.viewports = viewManager.getViewports();

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

    // Render deck.gl as the last child
    return createElement('div', {id: 'deckgl-wrapper'}, [children, canvas]);
  }
}

DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps;
