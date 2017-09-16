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

import Layer from './layer';
import {log} from './utils';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  get isComposite() {
    return true;
  }

  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeState() {
  }

  // No-op for the invalidateAttribute function as the composite
  // layer has no AttributeManager
  invalidateAttribute() {
  }

  // called to augment the info object that is bubbled up from a sublayer
  // override Layer.getPickingInfo() because decoding / setting uniform do
  // not apply to a composite layer.
  // @return null to cancel event
  getPickingInfo({info}) {
    return info;
  }

  // Implement to generate sublayers
  renderLayers() {
    return null;
  }

  // Returns props that should be forwarded to children
  // TODO - implement autoforwarding?
  getForwardProps() {
    const {
      // base layer props
      opacity, pickable, visible, parameters, getPolygonOffset,
      highlightedObjectIndex, autoHighlight, highlightColor,
      // viewport props
      coordinateSystem, coordinateOrigin, modelMatrix
    } = this.props;

    return {
      // Forward layer props
      opacity, pickable, visible, parameters, getPolygonOffset,
      highlightedObjectIndex, autoHighlight, highlightColor,
      coordinateSystem, coordinateOrigin, modelMatrix
    };
  }

  _renderLayers(updateParams) {
    if (!this.shouldUpdateState(updateParams)) {
      log.log(2, 'Composite layer reusing sublayers', this.state.oldSubLayers);
      return this.state.oldSubLayers;
    }
    const subLayers = this.renderLayers();
    this.state.oldSubLayers = subLayers;
    log.log(2, 'Composite layer saving sublayers', this.state.oldSubLayers);
    return subLayers;
  }
}
