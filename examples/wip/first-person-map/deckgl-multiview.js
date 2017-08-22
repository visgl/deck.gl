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
import {GL, setParameters} from 'luma.gl';

/* A flavor of the DeckGL component that renders VR using perspective viewports */
export default class DeckGLVR extends DeckGL {

  componentWillReceiveProps(nextProps, nextState) {
  }

  _onRendererInitialized(params) {
    super._onRendererInitialized(params);

    setParameters(params.gl, {
      depthTest: true,
      depthFunc: GL.LEQUAL
    });
  }

  _updateLayers(nextProps) {
    const {leftViewport, width, height} = nextProps;
    const viewport = leftViewport || new Viewport({width: width / 2, height});

    super._updateLayers({...nextProps, viewport});
  }

  _onRenderFrame({gl}) {
    const {leftViewport, rightViewport} = this.props;
    // const leftViewport = new Viewport({
    //   width: this.props.width / 2,
    //   height: this.props.height,
    //   // Description
    //   viewMatrix: frameData.leftViewMatrix,
    //   projectionMatrix: frameData.leftProjectionMatrix
    // });

    // const rightViewport = new Viewport({
    //   width: this.props.width / 2,
    //   height: this.props.height,
    //   // Description
    //   viewMatrix: frameData.rightViewMatrix,
    //   projectionMatrix: frameData.rightProjectionMatrix
    // });

    // UpdateLayers
    this._updateLayers({...this.props, leftViewport, rightViewport});

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.effectManager.preDraw();

    const {width, height} = gl.canvas;
    // render left viewport
    setParameters(gl, {
      viewport: [0, 0, width / 2, height]
    });
    this.layerManager.setViewport(leftViewport).drawLayers({pass: 'left viewport'});

    // render right viewport
    setParameters(gl, {
      viewport: [width / 2, 0, width / 2, height]
    });
    this.layerManager.setViewport(rightViewport).drawLayers({pass: 'right viewport'});

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
