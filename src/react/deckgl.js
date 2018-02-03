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
import autobind from './utils/autobind';
import {inheritsFrom} from '../core/utils/inherits-from';
import {Layer, experimental} from '../core';
const {DeckGLJS, log} = experimental;

export default class DeckGL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.children = [];
    autobind(this);
  }

  componentDidMount() {
    this.deck = new DeckGLJS(Object.assign({}, this.props, {canvas: this.overlay}));
    this._updateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateFromProps(nextProps);
  }

  componentWillUnmount() {
    this.deck.finalize();
  }

  // Public API

  queryObject(opts) {
    log.deprecated('queryObject', 'pickObject');
    return this.deck.pickObject(opts);
  }

  pickObject({x, y, radius = 0, layerIds = null}) {
    return this.deck.pickObject({x, y, radius, layerIds});
  }

  queryVisibleObjects(opts) {
    log.deprecated('queryVisibleObjects', 'pickObjects');
    return this.pickObjects(opts);
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.deck.pickObjects({x, y, width, height, layerIds});
  }

  // Private Helpers

  // Extract any JSX layers from the react children
  // Needs to be called both from initial mount, and when new props arrive
  _updateFromProps(nextProps) {
    // extract any deck.gl layers masquerading as react elements from props.children
    const {layers, children} = this._extractJSXLayers(nextProps.children);

    if (this.deck) {
      this.deck.setProps(
        Object.assign({}, nextProps, {
          // Avoid modifying layers array if no JSX layers were found
          layers: layers ? [...layers, ...nextProps.layers] : nextProps.layers
        })
      );
    }

    this.children = children;
  }

  // extracts any deck.gl layers masquerading as react elements from props.children
  _extractJSXLayers(children) {
    const reactChildren = []; // extract real react elements (i.e. not deck.gl layers)
    let layers = null; // extracted layer from react children, will add to deck.gl layer array

    React.Children.forEach(children, reactElement => {
      if (reactElement) {
        // For some reason Children.forEach doesn't filter out `null`s
        const LayerType = reactElement.type;
        if (inheritsFrom(LayerType, Layer)) {
          const layer = new LayerType(reactElement.props);
          layers = layers || [];
          layers.push(layer);
        } else {
          reactChildren.push(reactElement);
        }
      }
    });

    return {layers, children: reactChildren};
  }

  // Iterate over viewport descriptors and render children associate with viewports
  // at the specified positions
  // TODO - Can we supply a similar function for the non-React case?
  _renderChildrenUnderViewports(children) {
    // Flatten out nested viewports array
    const viewports = this.deck ? this.deck.getViewports() : [];

    // Build a viewport id to viewport index
    const viewportMap = {};
    viewports.forEach(viewport => {
      if (viewport.id) {
        viewportMap[viewport.id] = viewport;
      }
    });

    return children.map(
      // If child specifies props.viewportId, position under viewport, otherwise render as normal
      (child, i) => (child.props.viewportId ? this._positionChild({child, viewportMap, i}) : child)
    );
  }

  _positionChild({child, viewportMap, i}) {
    const {viewportId} = child.props;
    const viewport = viewportId && viewportMap[viewportId];

    // Drop (aut-hide) elements with viewportId that are not matched by any current viewport
    if (!viewport) {
      return null;
    }

    // Resolve potentially relative dimensions using the deck.gl container size
    const {x, y, width, height} = viewport;

    // Clone the element with width and height set per viewport
    const newProps = Object.assign({}, child.props, {width, height});

    // Inject map properties
    // TODO - this is too react-map-gl specific
    Object.assign(newProps, viewport.getMercatorParams(), {
      visible: viewport.isMapSynched()
    });

    const clone = cloneElement(child, newProps);

    // Wrap it in an absolutely positioning div
    const style = {position: 'absolute', left: x, top: y, width, height};
    const key = `viewport-child-${viewportId}-${i}`;
    return createElement('div', {key, id: key, style}, clone);
  }

  render() {
    // Render the background elements (typically react-map-gl instances)
    // using the viewport descriptors
    const children = this._renderChildrenUnderViewports(this.children);

    // Render deck.gl as last child
    const {id, width, height, style} = this.props;
    const deck = createElement('canvas', {
      ref: c => (this.overlay = c),
      key: 'overlay',
      id,
      style: Object.assign({}, {position: 'absolute', left: 0, top: 0, width, height}, style)
    });
    children.push(deck);

    return createElement('div', {id: 'deckgl-wrapper'}, children);
  }
}

DeckGL.propTypes = DeckGLJS.propTypes;
DeckGL.defaultProps = DeckGLJS.defaultProps;
