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
import { Layer } from '@deck.gl/core';
import GL from 'luma.gl/constants';
import { Model, Geometry, loadTextures } from 'luma.gl';
import BITMAP_VERTEX_SHADER from './bitmap-layer-vertex';
import BITMAP_FRAGMENT_SHADER from './bitmap-layer-fragment'; // Note: needs to match vertex shader

const MAX_BITMAPS = 11;
const defaultProps = {
  images: [],
  desaturate: 0,
  blendMode: null,
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: [0, 0, 0, 0],
  tintColor: [255, 255, 255],
  // accessors
  getCenter: x => x.center,
  getRotation: x => x.rotation
};
/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */

export default class BitmapLayer extends Layer {
  initializeState() {
    const gl = this.context.gl;
    this.setState({
      model: this.getModel(gl)
    });
    const attributeManager = this.state.attributeManager;
    attributeManager.addInstanced({
      instanceCenter: {
        size: 3,
        update: this.calculateInstanceCenters
      },
      instanceRotation: {
        size: 3,
        update: this.calculateInstanceRotations
      },
      instanceBitmapIndex: {
        size: 1,
        update: this.calculateInstanceBitmapIndex
      }
    });
  }

  updateState({
    props,
    oldProps
  }) {
    if (props.images !== oldProps.images) {
      let changed = !oldProps.images || props.images.length !== oldProps.images.length;

      if (!changed) {
        for (let i = 0; i < props.images.length; ++i) {
          changed = changed || props.images[i] !== oldProps.images[i];
        }
      }

      if (changed) {
        this.loadMapImagesToTextures();
      }
    }

    const desaturate = props.desaturate;
    this.state.model.setUniforms({
      desaturate
    });
  }

  getModel(gl) {
    // Two triangles making up a square to render the bitmap texture on
    const verts = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0]];
    const positions = [];
    const texCoords = [];
    verts.forEach(vertex => {
      // geometry: unit square centered on origin
      positions.push(vertex[0] / 2, vertex[1] / 2, vertex[2] / 2); // texture: unit square with bottom left in origin

      texCoords.push(vertex[0] / 2 + 0.5, -vertex[1] / 2 + 0.5);
    });
    const model = new Model(gl, {
      id: this.props.id,
      vs: BITMAP_VERTEX_SHADER,
      fs: BITMAP_FRAGMENT_SHADER,
      shaderCache: this.context.shaderCache,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        vertexCount: 6,
        attributes: {
          positions: new Float32Array(positions),
          texCoords: new Float32Array(texCoords)
        }
      }),
      isInstanced: true
    });
    return model;
  }

  draw({
    uniforms
  }) {
    const _this$props = this.props,
          transparentColor = _this$props.transparentColor,
          tintColor = _this$props.tintColor; // TODO fix zFighting
    // Render the image

    this.state.model.render(Object.assign({}, uniforms, {
      transparentColor,
      tintColor
    }));
  }

  loadMapImagesToTextures() {
    const model = this.state.model;
    const images = this.props.images;

    for (let i = 0; i < Math.min(images.length, MAX_BITMAPS); i++) {
      loadTextures(this.context.gl, {
        urls: [images[i]]
      }).then(([texture]) => {
        return model.setUniforms({
          [`uBitmap${i}`]: texture
        });
      });
    }
  }

  getBitmapIndex(point) {
    const url = point.imageUrl;
    const idx = Math.max(this.props.images.indexOf(url), 0);
    return idx >= MAX_BITMAPS ? 0 : idx;
  }

  calculateInstanceCenters(attribute, props) {
    const _this$props2 = this.props,
          data = _this$props2.data,
          getCenter = _this$props2.getCenter;
    const value = attribute.value,
          size = attribute.size;
    let i = 0;

    for (const point of data) {
      const center = getCenter(point);
      value[i + 0] = center[0] || 0;
      value[i + 1] = center[1] || 0;
      value[i + 2] = center[2] || 0;
      i += size;
    }
  }

  calculateInstanceRotations(attribute, props) {
    const _this$props3 = this.props,
          data = _this$props3.data,
          getRotation = _this$props3.getRotation;
    const value = attribute.value,
          size = attribute.size;
    let i = 0;

    for (const point of data) {
      const rotation = getRotation(point);
      value[i + 0] = rotation[0] || 0;
      value[i + 1] = rotation[1] || 0;
      value[i + 2] = rotation[2] || 0;
      i += size;
    }
  }

  calculateInstanceBitmapIndex(attribute) {
    const data = this.props.data;
    const value = attribute.value,
          size = attribute.size;
    let i = 0;

    for (const point of data) {
      const bitmapIndex = Number.isFinite(point.bitmapIndex) ? point.bitmapIndex : this.getBitmapIndex(point);
      value[i] = bitmapIndex;
      i += size;
    }
  }

}
BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaXRtYXAtbGF5ZXIvYml0bWFwLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheWVyIiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwibG9hZFRleHR1cmVzIiwiQklUTUFQX1ZFUlRFWF9TSEFERVIiLCJCSVRNQVBfRlJBR01FTlRfU0hBREVSIiwiTUFYX0JJVE1BUFMiLCJkZWZhdWx0UHJvcHMiLCJpbWFnZXMiLCJkZXNhdHVyYXRlIiwiYmxlbmRNb2RlIiwidHJhbnNwYXJlbnRDb2xvciIsInRpbnRDb2xvciIsImdldENlbnRlciIsIngiLCJjZW50ZXIiLCJnZXRSb3RhdGlvbiIsInJvdGF0aW9uIiwiQml0bWFwTGF5ZXIiLCJpbml0aWFsaXplU3RhdGUiLCJnbCIsImNvbnRleHQiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwic3RhdGUiLCJhZGRJbnN0YW5jZWQiLCJpbnN0YW5jZUNlbnRlciIsInNpemUiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZUNlbnRlcnMiLCJpbnN0YW5jZVJvdGF0aW9uIiwiY2FsY3VsYXRlSW5zdGFuY2VSb3RhdGlvbnMiLCJpbnN0YW5jZUJpdG1hcEluZGV4IiwiY2FsY3VsYXRlSW5zdGFuY2VCaXRtYXBJbmRleCIsInVwZGF0ZVN0YXRlIiwicHJvcHMiLCJvbGRQcm9wcyIsImNoYW5nZWQiLCJsZW5ndGgiLCJpIiwibG9hZE1hcEltYWdlc1RvVGV4dHVyZXMiLCJzZXRVbmlmb3JtcyIsInZlcnRzIiwicG9zaXRpb25zIiwidGV4Q29vcmRzIiwiZm9yRWFjaCIsInZlcnRleCIsInB1c2giLCJpZCIsInZzIiwiZnMiLCJzaGFkZXJDYWNoZSIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRVMiLCJ2ZXJ0ZXhDb3VudCIsImF0dHJpYnV0ZXMiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsImRyYXciLCJ1bmlmb3JtcyIsInJlbmRlciIsIk9iamVjdCIsImFzc2lnbiIsIk1hdGgiLCJtaW4iLCJ1cmxzIiwidGhlbiIsInRleHR1cmUiLCJnZXRCaXRtYXBJbmRleCIsInBvaW50IiwidXJsIiwiaW1hZ2VVcmwiLCJpZHgiLCJtYXgiLCJpbmRleE9mIiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwiYml0bWFwSW5kZXgiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxLQUFSLFFBQW9CLGVBQXBCO0FBQ0EsT0FBT0MsRUFBUCxNQUFlLG1CQUFmO0FBQ0EsU0FBUUMsS0FBUixFQUFlQyxRQUFmLEVBQXlCQyxZQUF6QixRQUE0QyxTQUE1QztBQUVBLE9BQU9DLG9CQUFQLE1BQWlDLHVCQUFqQztBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLHlCQUFuQyxDLENBRUE7O0FBQ0EsTUFBTUMsY0FBYyxFQUFwQjtBQUVBLE1BQU1DLGVBQWU7QUFDbkJDLFVBQVEsRUFEVztBQUduQkMsY0FBWSxDQUhPO0FBSW5CQyxhQUFXLElBSlE7QUFLbkI7QUFDQTtBQUNBO0FBQ0FDLG9CQUFrQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FSQztBQVNuQkMsYUFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQVRRO0FBVW5CO0FBQ0FDLGFBQVdDLEtBQUtBLEVBQUVDLE1BWEM7QUFZbkJDLGVBQWFGLEtBQUtBLEVBQUVHO0FBWkQsQ0FBckI7QUFlQTs7Ozs7OztBQU1BLGVBQWUsTUFBTUMsV0FBTixTQUEwQm5CLEtBQTFCLENBQWdDO0FBQzdDb0Isb0JBQWtCO0FBQUEsVUFDVEMsRUFEUyxHQUNILEtBQUtDLE9BREYsQ0FDVEQsRUFEUztBQUVoQixTQUFLRSxRQUFMLENBQWM7QUFBQ0MsYUFBTyxLQUFLQyxRQUFMLENBQWNKLEVBQWQ7QUFBUixLQUFkO0FBRmdCLFVBSVRLLGdCQUpTLEdBSVcsS0FBS0MsS0FKaEIsQ0FJVEQsZ0JBSlM7QUFLaEJBLHFCQUFpQkUsWUFBakIsQ0FBOEI7QUFDNUJDLHNCQUFnQjtBQUFDQyxjQUFNLENBQVA7QUFBVUMsZ0JBQVEsS0FBS0M7QUFBdkIsT0FEWTtBQUU1QkMsd0JBQWtCO0FBQUNILGNBQU0sQ0FBUDtBQUFVQyxnQkFBUSxLQUFLRztBQUF2QixPQUZVO0FBRzVCQywyQkFBcUI7QUFBQ0wsY0FBTSxDQUFQO0FBQVVDLGdCQUFRLEtBQUtLO0FBQXZCO0FBSE8sS0FBOUI7QUFLRDs7QUFFREMsY0FBWTtBQUFDQyxTQUFEO0FBQVFDO0FBQVIsR0FBWixFQUErQjtBQUM3QixRQUFJRCxNQUFNN0IsTUFBTixLQUFpQjhCLFNBQVM5QixNQUE5QixFQUFzQztBQUNwQyxVQUFJK0IsVUFBVSxDQUFDRCxTQUFTOUIsTUFBVixJQUFvQjZCLE1BQU03QixNQUFOLENBQWFnQyxNQUFiLEtBQXdCRixTQUFTOUIsTUFBVCxDQUFnQmdDLE1BQTFFOztBQUNBLFVBQUksQ0FBQ0QsT0FBTCxFQUFjO0FBQ1osYUFBSyxJQUFJRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLE1BQU03QixNQUFOLENBQWFnQyxNQUFqQyxFQUF5QyxFQUFFQyxDQUEzQyxFQUE4QztBQUM1Q0Ysb0JBQVVBLFdBQVdGLE1BQU03QixNQUFOLENBQWFpQyxDQUFiLE1BQW9CSCxTQUFTOUIsTUFBVCxDQUFnQmlDLENBQWhCLENBQXpDO0FBQ0Q7QUFDRjs7QUFDRCxVQUFJRixPQUFKLEVBQWE7QUFDWCxhQUFLRyx1QkFBTDtBQUNEO0FBQ0Y7O0FBWDRCLFVBWXRCakMsVUFac0IsR0FZUjRCLEtBWlEsQ0FZdEI1QixVQVpzQjtBQWE3QixTQUFLaUIsS0FBTCxDQUFXSCxLQUFYLENBQWlCb0IsV0FBakIsQ0FBNkI7QUFBQ2xDO0FBQUQsS0FBN0I7QUFDRDs7QUFFRGUsV0FBU0osRUFBVCxFQUFhO0FBQ1g7QUFDQSxVQUFNd0IsUUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQUQsRUFBWSxDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsRUFBUSxDQUFSLENBQVosRUFBd0IsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLEVBQVEsQ0FBUixDQUF4QixFQUFvQyxDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsRUFBUSxDQUFSLENBQXBDLEVBQWdELENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxFQUFRLENBQVIsQ0FBaEQsRUFBNEQsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFDLENBQU4sRUFBUyxDQUFULENBQTVELENBQWQ7QUFDQSxVQUFNQyxZQUFZLEVBQWxCO0FBQ0EsVUFBTUMsWUFBWSxFQUFsQjtBQUNBRixVQUFNRyxPQUFOLENBQWNDLFVBQVU7QUFDdEI7QUFDQUgsZ0JBQVVJLElBQVYsQ0FBZUQsT0FBTyxDQUFQLElBQVksQ0FBM0IsRUFBOEJBLE9BQU8sQ0FBUCxJQUFZLENBQTFDLEVBQTZDQSxPQUFPLENBQVAsSUFBWSxDQUF6RCxFQUZzQixDQUd0Qjs7QUFDQUYsZ0JBQVVHLElBQVYsQ0FBZUQsT0FBTyxDQUFQLElBQVksQ0FBWixHQUFnQixHQUEvQixFQUFvQyxDQUFDQSxPQUFPLENBQVAsQ0FBRCxHQUFhLENBQWIsR0FBaUIsR0FBckQ7QUFDRCxLQUxEO0FBT0EsVUFBTXpCLFFBQVEsSUFBSXRCLEtBQUosQ0FBVW1CLEVBQVYsRUFBYztBQUMxQjhCLFVBQUksS0FBS2IsS0FBTCxDQUFXYSxFQURXO0FBRTFCQyxVQUFJL0Msb0JBRnNCO0FBRzFCZ0QsVUFBSS9DLHNCQUhzQjtBQUkxQmdELG1CQUFhLEtBQUtoQyxPQUFMLENBQWFnQyxXQUpBO0FBSzFCQyxnQkFBVSxJQUFJcEQsUUFBSixDQUFhO0FBQ3JCcUQsa0JBQVV2RCxHQUFHd0QsU0FEUTtBQUVyQkMscUJBQWEsQ0FGUTtBQUdyQkMsb0JBQVk7QUFDVmIscUJBQVcsSUFBSWMsWUFBSixDQUFpQmQsU0FBakIsQ0FERDtBQUVWQyxxQkFBVyxJQUFJYSxZQUFKLENBQWlCYixTQUFqQjtBQUZEO0FBSFMsT0FBYixDQUxnQjtBQWExQmMsbUJBQWE7QUFiYSxLQUFkLENBQWQ7QUFnQkEsV0FBT3JDLEtBQVA7QUFDRDs7QUFFRHNDLE9BQUs7QUFBQ0M7QUFBRCxHQUFMLEVBQWlCO0FBQUEsd0JBQ3VCLEtBQUt6QixLQUQ1QjtBQUFBLFVBQ1IxQixnQkFEUSxlQUNSQSxnQkFEUTtBQUFBLFVBQ1VDLFNBRFYsZUFDVUEsU0FEVixFQUdmO0FBRUE7O0FBQ0EsU0FBS2MsS0FBTCxDQUFXSCxLQUFYLENBQWlCd0MsTUFBakIsQ0FDRUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JILFFBQWxCLEVBQTRCO0FBQzFCbkQsc0JBRDBCO0FBRTFCQztBQUYwQixLQUE1QixDQURGO0FBTUQ7O0FBRUQ4Qiw0QkFBMEI7QUFBQSxVQUNqQm5CLEtBRGlCLEdBQ1IsS0FBS0csS0FERyxDQUNqQkgsS0FEaUI7QUFBQSxVQUVqQmYsTUFGaUIsR0FFUCxLQUFLNkIsS0FGRSxDQUVqQjdCLE1BRmlCOztBQUd4QixTQUFLLElBQUlpQyxJQUFJLENBQWIsRUFBZ0JBLElBQUl5QixLQUFLQyxHQUFMLENBQVMzRCxPQUFPZ0MsTUFBaEIsRUFBd0JsQyxXQUF4QixDQUFwQixFQUEwRG1DLEdBQTFELEVBQStEO0FBQzdEdEMsbUJBQWEsS0FBS2tCLE9BQUwsQ0FBYUQsRUFBMUIsRUFBOEI7QUFDNUJnRCxjQUFNLENBQUM1RCxPQUFPaUMsQ0FBUCxDQUFEO0FBRHNCLE9BQTlCLEVBRUc0QixJQUZILENBRVEsQ0FBQyxDQUFDQyxPQUFELENBQUQsS0FBZTtBQUNyQixlQUFPL0MsTUFBTW9CLFdBQU4sQ0FBa0I7QUFBQyxXQUFFLFVBQVNGLENBQUUsRUFBYixHQUFpQjZCO0FBQWxCLFNBQWxCLENBQVA7QUFDRCxPQUpEO0FBS0Q7QUFDRjs7QUFFREMsaUJBQWVDLEtBQWYsRUFBc0I7QUFDcEIsVUFBTUMsTUFBTUQsTUFBTUUsUUFBbEI7QUFDQSxVQUFNQyxNQUFNVCxLQUFLVSxHQUFMLENBQVMsS0FBS3ZDLEtBQUwsQ0FBVzdCLE1BQVgsQ0FBa0JxRSxPQUFsQixDQUEwQkosR0FBMUIsQ0FBVCxFQUF5QyxDQUF6QyxDQUFaO0FBQ0EsV0FBT0UsT0FBT3JFLFdBQVAsR0FBcUIsQ0FBckIsR0FBeUJxRSxHQUFoQztBQUNEOztBQUVENUMsMkJBQXlCK0MsU0FBekIsRUFBb0N6QyxLQUFwQyxFQUEyQztBQUFBLHlCQUNmLEtBQUtBLEtBRFU7QUFBQSxVQUNsQzBDLElBRGtDLGdCQUNsQ0EsSUFEa0M7QUFBQSxVQUM1QmxFLFNBRDRCLGdCQUM1QkEsU0FENEI7QUFBQSxVQUVsQ21FLEtBRmtDLEdBRW5CRixTQUZtQixDQUVsQ0UsS0FGa0M7QUFBQSxVQUUzQm5ELElBRjJCLEdBRW5CaUQsU0FGbUIsQ0FFM0JqRCxJQUYyQjtBQUd6QyxRQUFJWSxJQUFJLENBQVI7O0FBQ0EsU0FBSyxNQUFNK0IsS0FBWCxJQUFvQk8sSUFBcEIsRUFBMEI7QUFDeEIsWUFBTWhFLFNBQVNGLFVBQVUyRCxLQUFWLENBQWY7QUFFQVEsWUFBTXZDLElBQUksQ0FBVixJQUFlMUIsT0FBTyxDQUFQLEtBQWEsQ0FBNUI7QUFDQWlFLFlBQU12QyxJQUFJLENBQVYsSUFBZTFCLE9BQU8sQ0FBUCxLQUFhLENBQTVCO0FBQ0FpRSxZQUFNdkMsSUFBSSxDQUFWLElBQWUxQixPQUFPLENBQVAsS0FBYSxDQUE1QjtBQUVBMEIsV0FBS1osSUFBTDtBQUNEO0FBQ0Y7O0FBRURJLDZCQUEyQjZDLFNBQTNCLEVBQXNDekMsS0FBdEMsRUFBNkM7QUFBQSx5QkFDZixLQUFLQSxLQURVO0FBQUEsVUFDcEMwQyxJQURvQyxnQkFDcENBLElBRG9DO0FBQUEsVUFDOUIvRCxXQUQ4QixnQkFDOUJBLFdBRDhCO0FBQUEsVUFFcENnRSxLQUZvQyxHQUVyQkYsU0FGcUIsQ0FFcENFLEtBRm9DO0FBQUEsVUFFN0JuRCxJQUY2QixHQUVyQmlELFNBRnFCLENBRTdCakQsSUFGNkI7QUFHM0MsUUFBSVksSUFBSSxDQUFSOztBQUNBLFNBQUssTUFBTStCLEtBQVgsSUFBb0JPLElBQXBCLEVBQTBCO0FBQ3hCLFlBQU05RCxXQUFXRCxZQUFZd0QsS0FBWixDQUFqQjtBQUVBUSxZQUFNdkMsSUFBSSxDQUFWLElBQWV4QixTQUFTLENBQVQsS0FBZSxDQUE5QjtBQUNBK0QsWUFBTXZDLElBQUksQ0FBVixJQUFleEIsU0FBUyxDQUFULEtBQWUsQ0FBOUI7QUFDQStELFlBQU12QyxJQUFJLENBQVYsSUFBZXhCLFNBQVMsQ0FBVCxLQUFlLENBQTlCO0FBRUF3QixXQUFLWixJQUFMO0FBQ0Q7QUFDRjs7QUFFRE0sK0JBQTZCMkMsU0FBN0IsRUFBd0M7QUFBQSxVQUMvQkMsSUFEK0IsR0FDdkIsS0FBSzFDLEtBRGtCLENBQy9CMEMsSUFEK0I7QUFBQSxVQUUvQkMsS0FGK0IsR0FFaEJGLFNBRmdCLENBRS9CRSxLQUYrQjtBQUFBLFVBRXhCbkQsSUFGd0IsR0FFaEJpRCxTQUZnQixDQUV4QmpELElBRndCO0FBR3RDLFFBQUlZLElBQUksQ0FBUjs7QUFDQSxTQUFLLE1BQU0rQixLQUFYLElBQW9CTyxJQUFwQixFQUEwQjtBQUN4QixZQUFNRSxjQUFjQyxPQUFPQyxRQUFQLENBQWdCWCxNQUFNUyxXQUF0QixJQUNoQlQsTUFBTVMsV0FEVSxHQUVoQixLQUFLVixjQUFMLENBQW9CQyxLQUFwQixDQUZKO0FBR0FRLFlBQU12QyxDQUFOLElBQVd3QyxXQUFYO0FBQ0F4QyxXQUFLWixJQUFMO0FBQ0Q7QUFDRjs7QUFySTRDO0FBd0kvQ1gsWUFBWWtFLFNBQVosR0FBd0IsYUFBeEI7QUFDQWxFLFlBQVlYLFlBQVosR0FBMkJBLFlBQTNCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnQGRlY2suZ2wvY29yZSc7XG5pbXBvcnQgR0wgZnJvbSAnbHVtYS5nbC9jb25zdGFudHMnO1xuaW1wb3J0IHtNb2RlbCwgR2VvbWV0cnksIGxvYWRUZXh0dXJlc30gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCBCSVRNQVBfVkVSVEVYX1NIQURFUiBmcm9tICcuL2JpdG1hcC1sYXllci12ZXJ0ZXgnO1xuaW1wb3J0IEJJVE1BUF9GUkFHTUVOVF9TSEFERVIgZnJvbSAnLi9iaXRtYXAtbGF5ZXItZnJhZ21lbnQnO1xuXG4vLyBOb3RlOiBuZWVkcyB0byBtYXRjaCB2ZXJ0ZXggc2hhZGVyXG5jb25zdCBNQVhfQklUTUFQUyA9IDExO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGltYWdlczogW10sXG5cbiAgZGVzYXR1cmF0ZTogMCxcbiAgYmxlbmRNb2RlOiBudWxsLFxuICAvLyBNb3JlIGNvbnRleHQ6IGJlY2F1c2Ugb2YgdGhlIGJsZW5kaW5nIG1vZGUgd2UncmUgdXNpbmcgZm9yIGdyb3VuZCBpbWFnZXJ5LFxuICAvLyBhbHBoYSBpcyBub3QgZWZmZWN0aXZlIHdoZW4gYmxlbmRpbmcgdGhlIGJpdG1hcCBsYXllcnMgd2l0aCB0aGUgYmFzZSBtYXAuXG4gIC8vIEluc3RlYWQgd2UgbmVlZCB0byBtYW51YWxseSBkaW0vYmxlbmQgcmdiIHZhbHVlcyB3aXRoIGEgYmFja2dyb3VuZCBjb2xvci5cbiAgdHJhbnNwYXJlbnRDb2xvcjogWzAsIDAsIDAsIDBdLFxuICB0aW50Q29sb3I6IFsyNTUsIDI1NSwgMjU1XSxcbiAgLy8gYWNjZXNzb3JzXG4gIGdldENlbnRlcjogeCA9PiB4LmNlbnRlcixcbiAgZ2V0Um90YXRpb246IHggPT4geC5yb3RhdGlvblxufTtcblxuLypcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtvYmplY3R9IHByb3BzXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvcHMudHJhbnNwYXJlbnRDb2xvciAtIGNvbG9yIHRvIGludGVycHJldCB0cmFuc3BhcmVuY3kgdG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy50aW50Q29sb3IgLSBjb2xvciBiaWFzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJpdG1hcExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5nZXRNb2RlbChnbCl9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VDZW50ZXI6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDZW50ZXJzfSxcbiAgICAgIGluc3RhbmNlUm90YXRpb246IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VSb3RhdGlvbnN9LFxuICAgICAgaW5zdGFuY2VCaXRtYXBJbmRleDoge3NpemU6IDEsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZUJpdG1hcEluZGV4fVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wc30pIHtcbiAgICBpZiAocHJvcHMuaW1hZ2VzICE9PSBvbGRQcm9wcy5pbWFnZXMpIHtcbiAgICAgIGxldCBjaGFuZ2VkID0gIW9sZFByb3BzLmltYWdlcyB8fCBwcm9wcy5pbWFnZXMubGVuZ3RoICE9PSBvbGRQcm9wcy5pbWFnZXMubGVuZ3RoO1xuICAgICAgaWYgKCFjaGFuZ2VkKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcHMuaW1hZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2hhbmdlZCA9IGNoYW5nZWQgfHwgcHJvcHMuaW1hZ2VzW2ldICE9PSBvbGRQcm9wcy5pbWFnZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMubG9hZE1hcEltYWdlc1RvVGV4dHVyZXMoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qge2Rlc2F0dXJhdGV9ID0gcHJvcHM7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRVbmlmb3Jtcyh7ZGVzYXR1cmF0ZX0pO1xuICB9XG5cbiAgZ2V0TW9kZWwoZ2wpIHtcbiAgICAvLyBUd28gdHJpYW5nbGVzIG1ha2luZyB1cCBhIHNxdWFyZSB0byByZW5kZXIgdGhlIGJpdG1hcCB0ZXh0dXJlIG9uXG4gICAgY29uc3QgdmVydHMgPSBbWzEsIDEsIDBdLCBbLTEsIDEsIDBdLCBbMSwgLTEsIDBdLCBbLTEsIDEsIDBdLCBbMSwgLTEsIDBdLCBbLTEsIC0xLCAwXV07XG4gICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgY29uc3QgdGV4Q29vcmRzID0gW107XG4gICAgdmVydHMuZm9yRWFjaCh2ZXJ0ZXggPT4ge1xuICAgICAgLy8gZ2VvbWV0cnk6IHVuaXQgc3F1YXJlIGNlbnRlcmVkIG9uIG9yaWdpblxuICAgICAgcG9zaXRpb25zLnB1c2godmVydGV4WzBdIC8gMiwgdmVydGV4WzFdIC8gMiwgdmVydGV4WzJdIC8gMik7XG4gICAgICAvLyB0ZXh0dXJlOiB1bml0IHNxdWFyZSB3aXRoIGJvdHRvbSBsZWZ0IGluIG9yaWdpblxuICAgICAgdGV4Q29vcmRzLnB1c2godmVydGV4WzBdIC8gMiArIDAuNSwgLXZlcnRleFsxXSAvIDIgKyAwLjUpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgbW9kZWwgPSBuZXcgTW9kZWwoZ2wsIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgdnM6IEJJVE1BUF9WRVJURVhfU0hBREVSLFxuICAgICAgZnM6IEJJVE1BUF9GUkFHTUVOVF9TSEFERVIsXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRVMsXG4gICAgICAgIHZlcnRleENvdW50OiA2LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgcG9zaXRpb25zOiBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucyksXG4gICAgICAgICAgdGV4Q29vcmRzOiBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcylcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1vZGVsO1xuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge3RyYW5zcGFyZW50Q29sb3IsIHRpbnRDb2xvcn0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gVE9ETyBmaXggekZpZ2h0aW5nXG5cbiAgICAvLyBSZW5kZXIgdGhlIGltYWdlXG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5yZW5kZXIoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB1bmlmb3Jtcywge1xuICAgICAgICB0cmFuc3BhcmVudENvbG9yLFxuICAgICAgICB0aW50Q29sb3JcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGxvYWRNYXBJbWFnZXNUb1RleHR1cmVzKCkge1xuICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtpbWFnZXN9ID0gdGhpcy5wcm9wcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKGltYWdlcy5sZW5ndGgsIE1BWF9CSVRNQVBTKTsgaSsrKSB7XG4gICAgICBsb2FkVGV4dHVyZXModGhpcy5jb250ZXh0LmdsLCB7XG4gICAgICAgIHVybHM6IFtpbWFnZXNbaV1dXG4gICAgICB9KS50aGVuKChbdGV4dHVyZV0pID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnNldFVuaWZvcm1zKHtbYHVCaXRtYXAke2l9YF06IHRleHR1cmV9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpdG1hcEluZGV4KHBvaW50KSB7XG4gICAgY29uc3QgdXJsID0gcG9pbnQuaW1hZ2VVcmw7XG4gICAgY29uc3QgaWR4ID0gTWF0aC5tYXgodGhpcy5wcm9wcy5pbWFnZXMuaW5kZXhPZih1cmwpLCAwKTtcbiAgICByZXR1cm4gaWR4ID49IE1BWF9CSVRNQVBTID8gMCA6IGlkeDtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ2VudGVycyhhdHRyaWJ1dGUsIHByb3BzKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENlbnRlcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgY2VudGVyID0gZ2V0Q2VudGVyKHBvaW50KTtcblxuICAgICAgdmFsdWVbaSArIDBdID0gY2VudGVyWzBdIHx8IDA7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBjZW50ZXJbMV0gfHwgMDtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGNlbnRlclsyXSB8fCAwO1xuXG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VSb3RhdGlvbnMoYXR0cmlidXRlLCBwcm9wcykge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRSb3RhdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3Qgcm90YXRpb24gPSBnZXRSb3RhdGlvbihwb2ludCk7XG5cbiAgICAgIHZhbHVlW2kgKyAwXSA9IHJvdGF0aW9uWzBdIHx8IDA7XG4gICAgICB2YWx1ZVtpICsgMV0gPSByb3RhdGlvblsxXSB8fCAwO1xuICAgICAgdmFsdWVbaSArIDJdID0gcm90YXRpb25bMl0gfHwgMDtcblxuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQml0bWFwSW5kZXgoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGJpdG1hcEluZGV4ID0gTnVtYmVyLmlzRmluaXRlKHBvaW50LmJpdG1hcEluZGV4KVxuICAgICAgICA/IHBvaW50LmJpdG1hcEluZGV4XG4gICAgICAgIDogdGhpcy5nZXRCaXRtYXBJbmRleChwb2ludCk7XG4gICAgICB2YWx1ZVtpXSA9IGJpdG1hcEluZGV4O1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxufVxuXG5CaXRtYXBMYXllci5sYXllck5hbWUgPSAnQml0bWFwTGF5ZXInO1xuQml0bWFwTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19