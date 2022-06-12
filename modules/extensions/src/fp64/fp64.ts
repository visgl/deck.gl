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

import {LayerExtension, COORDINATE_SYSTEM} from '@deck.gl/core';
import project64 from './project64';

import type {Layer} from '@deck.gl/core';

/** @deprecated Adds the legacy 64-bit precision to geospatial layers. */
export default class Fp64Extension extends LayerExtension {
  static extensionName = 'Fp64Extension';

  getShaders(this: Layer): any {
    const {coordinateSystem} = this.props;
    if (
      coordinateSystem !== COORDINATE_SYSTEM.LNGLAT &&
      coordinateSystem !== COORDINATE_SYSTEM.DEFAULT
    ) {
      throw new Error('fp64: coordinateSystem must be LNGLAT');
    }

    return {
      modules: [project64]
    };
  }
}
