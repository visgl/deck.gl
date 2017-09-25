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
import autobind from './utils/autobind';
import {experimental} from '../core';
const {DeckGLJS} = experimental;

export default class DeckGL extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    autobind(this);
  }

  componentDidMount() {
    this.deck = new DeckGLJS(Object.assign({}, this.props, {canvas: this.refs.overlay}));
  }

  componentWillReceiveProps(nextProps) {
    if (this.deck) {
      this.deck.setProps(nextProps);
    }
  }

  componentWillUnmount() {
    this.deck.finalize();
  }

  // Public API

  queryObject({x, y, radius = 0, layerIds = null}) {
    return this.deck.queryObject({x, y, radius, layerIds});
  }

  queryVisibleObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.deck.queryVisibleObject({x, y, width, height, layerIds});
  }

  render() {
    const {id, width, height, style} = this.props;
    return createElement('canvas', {
      ref: 'overlay',
      key: 'overlay',
      id,
      style: Object.assign({}, style, {width, height})
    });
  }
}

DeckGL.propTypes = DeckGLJS.propTypes;
DeckGL.defaultProps = DeckGLJS.defaultProps;
