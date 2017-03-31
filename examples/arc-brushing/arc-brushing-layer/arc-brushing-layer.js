// Copyright (c) 2016 Uber Technologies, Inc.
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

import {ArcLayer} from 'deck.gl';

import arcVertex from './arc-brushing-layer-vertex.glsl';
import arcFragment from './arc-brushing-layer-fragment.glsl';

const defaultProps = {
  ...ArcLayer.defaultProps,

  // show arc if source is in brush
  brushSource: true,
  // show arc if target is in brush
  brushTarget: true,
  enableBrushing: true,
  // brush radius in meters
  brushRadius: 100000,
  mousePosition: [0, 0]
};

export default class ArcBrushingLayer extends ArcLayer {

  getShaders() {
    return {vs: arcVertex, fs: arcFragment, modules: []};
  }

  draw({uniforms}) {
    const {viewport} = this.context;

    if (this.props.mousePosition) {
      //console.log(this.props.mousePosition)
      console.log(this.unproject(this.props.mousePosition));
    }
    super.draw({uniforms: {
      ...uniforms,
      brushSource: this.props.brushSource ? 1 : 0,
      brushTarget: this.props.brushTarget ? 1 : 0,
      brushRadius: this.props.brushRadius,
      mousePos: this.props.mousePosition ? new Float32Array(this.unproject(this.props.mousePosition)) : defaultProps.mousePosition,
      enableBrushing: this.props.enableBrushing ? 1 : 0
    }});
  }
}

ArcBrushingLayer.layerName = 'ArcBrushingLayer';
ArcBrushingLayer.defaultProps = defaultProps;
