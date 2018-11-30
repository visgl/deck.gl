// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

// default light source parameters
const DEFAULT_LIGHT_POSITION = [0.0, 0.0, 1.0];
const DEFAULT_LIGHT_DIRECTION = [0.0, 0.0, -1.0];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_LIGHT_COLOR = [255, 255, 255];

class LightSource {
  /**
   * @classdesc
   * LightingSource
   *
   * @class
   * @param props.color {array} - emitted light color from this source
   * @param props.intensity {float} - strength of emitted light, in the range of [0, 1]
   */

  constructor(props) {
    const {color = DEFAULT_LIGHT_COLOR, intensity = DEFAULT_LIGHT_INTENSITY} = props;

    this.color = color;
    this.intensity = intensity;
  }
}

class DirectionalLight extends LightSource {
  constructor(props) {
    super(props);
    const {direction = DEFAULT_LIGHT_DIRECTION} = props;
    this.direction = direction;
  }
}

class AmbientLight extends LightSource {
  constructor(props) {
    super(props);
  }
}

class PointLight extends LightSource {
  constructor(props) {
    super(props);
    const {position = DEFAULT_LIGHT_POSITION} = props;
    this.position = position;
  }
}

export {AmbientLight, DirectionalLight, PointLight};
