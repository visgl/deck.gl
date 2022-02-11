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

import {BitmapLayer} from '@deck.gl/layers';

const defaultProps = {
  ...BitmapLayer.defaultProps,
  animationCurrentFrame: {type: 'number', value: 0, min: 0},
  animationNumCols: {type: 'number', value: 0, min: 1},
  animationNumRows: {type: 'number', value: 0, min: 1}
};

export default class SpriteLayer extends BitmapLayer {
  getShaders() {
    const shaders = super.getShaders();

    shaders.inject = {
      'vs:#decl': `\
uniform float animationNumColsRatio;
uniform float animationNumRowsRatio;
uniform float animationCol;
uniform float animationRow;
`,
      'vs:#main-end': `\
vTexCoord = vec2((animationCol + texCoords.x) * (animationNumColsRatio), (animationRow + texCoords.y) * animationNumRowsRatio);
`
    };
    return shaders;
  }

  draw(params) {
    const {animationCurrentFrame, animationNumCols, animationNumRows} = this.props;

    const animationCol = animationCurrentFrame % animationNumRows;
    const animationRow = Math.floor(animationCurrentFrame / animationNumCols);

    params.uniforms = {
      ...params.uniforms,
      animationNumColsRatio: 1 / animationNumCols,
      animationNumRowsRatio: 1 / animationNumRows,
      animationCol,
      animationRow
    };

    super.draw(params);
  }
}

SpriteLayer.layerName = 'SpriteLayer';
SpriteLayer.defaultProps = defaultProps;
