// Copyright (c) 2015 Uber Technologies, Inc.
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

import BaseLayer from './base-layer';
import flatWorld from '../flat-world';
import MercatorProjector from 'viewport-mercator-project';

export default class BaseMapLayer extends BaseLayer {
  /**
   * @classdesc
   * BaseMapLayer:
   * A map overlay that reacts to mapState: viewport, zoom level, etc.
   * The input data may include latitude & longitude coordinates, which
   * will be converted => screen coordinates using web-mercator projection
   *
   * @class
   * @param {object} opts
   * @param {string} opts.mapState - mapState from MapboxGL
   */
  constructor(opts) {
    super(opts);

    this.mapState = opts.mapState || this._throwUndefinedError('mapState');
    this.mercator = MercatorProjector({
      center: [opts.mapState.longitude, opts.mapState.latitude],
      zoom: opts.mapState.zoom,
      tileSize: 512,
      dimensions: [opts.width, opts.height]
    });
    this.cameraHeight = flatWorld.getCameraHeight();
  }

  project(latLng) {
    const pixel = this.mercator.project([latLng[1], latLng[0]]);
    return {
      x: pixel[0],
      y: pixel[1]
    };
  }

  screenToSpace(x, y) {
    return flatWorld.screenToSpace(x, y, this.width, this.height);
  }

}
