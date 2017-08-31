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
import {GL, withParameters} from 'luma.gl';
import {flatten} from '../../lib/utils/flatten';
/* global window */

/* A flavor of the DeckGL component that renders using multiple viewports */
export default class DeckGLMultiView extends DeckGL {

  _onRendererInitialized(params) {
    super._onRendererInitialized(params);
  }

  _getViewports() {
    const {viewports, viewport} = this.props;
    if (viewports) {
      return flatten(viewports);
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
    const {height, useDevicePixelRatio} = this.props;

    // UpdateLayers
    const viewports = this._getViewports();

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // TODO - this should be moved into LayerManager
    this.effectManager.preDraw();

    viewports.forEach((viewportOrDescriptor, i) => {
      const viewport = this._getViewportFromDescriptor(viewportOrDescriptor);

      // this._updateLayers(Object.assign({}, this.props, {viewport}));

      // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
      const pixelRatio = useDevicePixelRatio && typeof window !== 'undefined' ?
        window.devicePixelRatio : 1;
      const glViewport = [
        viewport.x * pixelRatio,
        (height - viewport.y - viewport.height) * pixelRatio,
        viewport.width * pixelRatio,
        viewport.height * pixelRatio
      ];

      // render this viewport
      withParameters(gl, {viewport: glViewport}, () => {
        this.layerManager.setViewport(viewport).drawLayers({pass: `viewport ${i}`});
      });
    });

    this.effectManager.draw();

    // Picking
    // if (this.props.onLayerHover) {
    //   // Arbitrary gaze location
    //   const x = this.props.width * 2 / 3;
    //   const y = this.props.height / 2;

    //   const info = this.queryObject({x, y, radius: this.props.pickingRadius});
    //   this.props.onLayerHover(info);
    // }
  }

}
