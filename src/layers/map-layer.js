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

import InstancedLayer from './instanced-layer';
import flatWorld from '../flat-world';
import ViewportMercator from 'viewport-mercator-project';

export default class MapLayer extends InstancedLayer {
  /**
   * @classdesc
   * MapLayer:
   * A map overlay that reacts to mapState: viewport, zoom level, etc.
   * The input data may include latitude & longitude coordinates, which
   * will be converted => screen coordinates using web-mercator projection
   *
   * @class
   * @param {object} opts
   * @param {number} opts.width - viewport width, synced with MapboxGL
   * @param {number} opts.height - viewport width, synced with MapboxGL
   * @param {string} opts.latitude - latitude of map center from MapboxGL
   * @param {string} opts.longitude - longitude of map center from MapboxGL
   * @param {string} opts.zoom - zoom level of map from MapboxGL
   */
  constructor(opts) {
    super(opts);

    this.checkParam(opts.width, 'width');
    this.checkParam(opts.height, 'height');
    this.checkParam(opts.latitude, 'latitude');
    this.checkParam(opts.longitude, 'longitude');
    this.checkParam(opts.zoom, 'zoom');
  }

  initializeState() {
    super.initializeState();

    this.setViewport();
  }

  checkProps(oldProps, newProps) {
    super.checkProps(oldProps, newProps);

    this.state.viewportChanged =
      newProps.width !== oldProps.width ||
      newProps.height !== oldProps.height ||
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom;
  }

  willReceiveProps() {
    this.setViewport();
  }

  setViewport() {
    const {width, height, latitude, longitude, zoom} = this.props;
    this.state.viewport = flatWorld.getViewport(width, height);
    const {x, y} = this.state.viewport;

    this.setState({
      viewportChanged: true,
      needsRedraw: true,
      mercator: ViewportMercator({
        width, height, latitude, longitude, zoom,
        tileSize: 512
      })
    });
    this.setUniforms({
      viewport: [x, y, width, height],
      mapViewport: [longitude, latitude, zoom, flatWorld.size]
    });
  }

  // TODO deprecate: this funtion is only used for calculating radius now
  project(latLng) {
    const {mercator} = this.state;
    const [x, y] = mercator.project([latLng[0], latLng[1]]);
    return {x, y};
  }

  // TODO deprecate: this funtion is only used for calculating radius now
  screenToSpace(x, y) {
    const vp = this.state.viewport;
    return {
      x: ((x - vp.x) / vp.width - 0.5) * flatWorld.size * 2,
      y: ((y - vp.y) / vp.height - 0.5) * flatWorld.size * 2 * -1,
      z: 0
    };
  }

}
