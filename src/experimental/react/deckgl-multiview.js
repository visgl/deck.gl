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

import DeckGL, {Viewport} from 'deck.gl';
import {flatten} from '../../lib/utils/flatten';

/* A flavor of the DeckGL component that renders using multiple viewports */
export default class DeckGLMultiView extends DeckGL {

  _onRendererInitialized(params) {
    super._onRendererInitialized(params);
  }

  _getViewports() {
    const {viewports, viewport} = this.props;
    if (viewports) {
      return flatten(viewports, {filter: Boolean});
    }
    if (viewport) {
      return [viewport];
    }
    const {width, height} = this.props;
    return new Viewport({width, height});
  }

  _getViewportFromDescriptor(viewportOrDescriptor) {
    return viewportOrDescriptor.viewport ?
      viewportOrDescriptor.viewport :
      viewportOrDescriptor;
  }

  _updateLayers(nextProps) {
    // HACK: UpdateLayers need the viewport prop set
    const viewports = this._getViewports();
    if (!nextProps.viewport) {
      nextProps = Object.assign({}, {
        viewport: this._getViewportFromDescriptor(viewports[0])
      }, nextProps);
    }
    super._updateLayers(nextProps);
  }

  _onRenderFrame({gl}) {
    const viewports = this._getViewports();
    this.layerManager.setViewports(viewports);
    this.layerManager.drawLayers({pass: 'render'});
  }
}
