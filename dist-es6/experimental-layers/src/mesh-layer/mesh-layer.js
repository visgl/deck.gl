var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

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

import { Layer, COORDINATE_SYSTEM, experimental } from 'deck.gl';
var fp64ify = experimental.fp64ify,
    enable64bitSupport = experimental.enable64bitSupport;

import { GL, Model, Geometry, loadTextures, Texture2D } from 'luma.gl';
import assert from 'assert';

import vs from './mesh-layer-vertex.glsl';
import vs64 from './mesh-layer-vertex-64.glsl';
import fs from './mesh-layer-fragment.glsl';
import project64utils from '../shaderlib/project64utils/project64utils';

function degreeToRadian(degree) {
  return degree * Math.PI / 180;
}

/*
 * Load image data into luma.gl Texture2D objects
 * @param {WebGLContext} gl
 * @param {String|Texture2D|HTMLImageElement|Uint8ClampedArray} src - source of image data
 *   can be url string, Texture2D object, HTMLImageElement or pixel array
 * @returns {Promise} resolves to an object with name -> texture mapping
 */
function getTexture(gl, src, opts) {
  if (typeof src === 'string') {
    // Url, load the image
    return loadTextures(gl, Object.assign({ urls: [src] }, opts)).then(function (textures) {
      return textures[0];
    }).catch(function (error) {
      throw new Error('Could not load texture from ' + src + ': ' + error);
    });
  }
  return new Promise(function (resolve) {
    return resolve(getTextureFromData(gl, src, opts));
  });
}

/*
 * Convert image data into texture
 * @returns {Texture2D} texture
 */
function getTextureFromData(gl, data, opts) {
  if (data instanceof Texture2D) {
    return data;
  }
  return new Texture2D(gl, Object.assign({ data: data }, opts));
}

var defaultProps = {
  mesh: null,
  texture: null,
  sizeScale: 1,

  // TODO - parameters should be merged, not completely overridden
  parameters: {
    depthTest: true,
    depthFunc: GL.LEQUAL
  },
  fp64: false,
  // Optional settings for 'lighting' shader module
  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
  },

  getPosition: function getPosition(x) {
    return x.position;
  },
  getAngleDegreesCW: function getAngleDegreesCW(x) {
    return x.angle || 0;
  },
  getColor: function getColor(x) {
    return x.color || [0, 0, 0, 255];
  }
};

var MeshLayer = function (_Layer) {
  _inherits(MeshLayer, _Layer);

  function MeshLayer() {
    _classCallCheck(this, MeshLayer);

    return _possibleConstructorReturn(this, (MeshLayer.__proto__ || Object.getPrototypeOf(MeshLayer)).apply(this, arguments));
  }

  _createClass(MeshLayer, [{
    key: 'getShaders',
    value: function getShaders(id) {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: [project64utils, 'picking', 'lighting'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['picking', 'lighting'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this.getModel(gl) });

      var attributeManager = this.state.attributeManager;

      attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceAngles: { size: 1, accessor: 'getAngleDegreesCW', update: this.calculateInstanceAngles },
        instanceColors: { size: 4, accessor: 'getColor', update: this.calculateInstanceColors }
      });
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;
      var attributeManager = this.state.attributeManager;

      // super.updateState({props, oldProps, changeFlags});

      if (changeFlags.dataChanged) {
        attributeManager.invalidateAll();
      }

      if (changeFlags.propsChanged) {

        this._updateFP64(props, oldProps);

        if (props.sizeScale !== oldProps.sizeScale) {
          var sizeScale = props.sizeScale;

          this.state.model.setUniforms({ sizeScale: sizeScale });
        }

        if (props.texture !== oldProps.texture) {
          if (props.texture) {
            this.loadTexture(props.texture);
          } else {
            // TODO - reset
          }
        }

        if (props.lightSettings !== oldProps.lightSettings) {
          this.state.model.setUniforms(props.lightSettings);
        }
      }
    }
  }, {
    key: '_updateFP64',
    value: function _updateFP64(props, oldProps) {
      if (props.fp64 !== oldProps.fp64) {
        this.setState({ model: this.getModel(this.context.gl) });

        this.state.model.setUniforms({
          sizeScale: props.sizeScale
        });

        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (enable64bitSupport(this.props)) {
          attributeManager.addInstanced({
            instancePositions64xy: {
              size: 2,
              accessor: 'getPosition',
              update: this.calculateInstancePositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instancePositions64xy']);
        }
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;

      this.state.model.render(uniforms);
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var isValidMesh = this.props.mesh instanceof Geometry && this.props.mesh.attributes.positions;
      assert(isValidMesh);

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.props.mesh,
        isInstanced: true
      }));
    }
  }, {
    key: 'loadTexture',
    value: function loadTexture(src) {
      var _this2 = this;

      var gl = this.context.gl;
      var model = this.state.model;

      getTexture(gl, src).then(function (texture) {
        model.setUniforms({ sampler1: texture });
        _this2.setNeedsRedraw();
      });
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getPosition = _props.getPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var position = getPosition(point);
          value[i++] = position[0];
          value[i++] = position[1];
          value[i++] = position[2] || 0;
          i += size;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'calculateInstancePositions64xyLow',
    value: function calculateInstancePositions64xyLow(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getPosition = _props2.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          var position = getPosition(point);
          value[i++] = fp64ify(position[0])[1];
          value[i++] = fp64ify(position[1])[1];
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceAngles',
    value: function calculateInstanceAngles(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getAngleDegreesCW = _props3.getAngleDegreesCW;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var point = _step3.value;

          var angle = getAngleDegreesCW(point);
          value[i] = -degreeToRadian(angle);
          i += size;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var point = _step4.value;

          var color = getColor(point) || DEFAULT_COLOR;
          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = isNaN(color[3]) ? 255 : color[3];
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return MeshLayer;
}(Layer);

export default MeshLayer;


MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9tZXNoLWxheWVyL21lc2gtbGF5ZXIuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJDT09SRElOQVRFX1NZU1RFTSIsImV4cGVyaW1lbnRhbCIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJsb2FkVGV4dHVyZXMiLCJUZXh0dXJlMkQiLCJhc3NlcnQiLCJ2cyIsInZzNjQiLCJmcyIsInByb2plY3Q2NHV0aWxzIiwiZGVncmVlVG9SYWRpYW4iLCJkZWdyZWUiLCJNYXRoIiwiUEkiLCJnZXRUZXh0dXJlIiwiZ2wiLCJzcmMiLCJvcHRzIiwiT2JqZWN0IiwiYXNzaWduIiwidXJscyIsInRoZW4iLCJ0ZXh0dXJlcyIsImNhdGNoIiwiRXJyb3IiLCJlcnJvciIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0VGV4dHVyZUZyb21EYXRhIiwiZGF0YSIsImRlZmF1bHRQcm9wcyIsIm1lc2giLCJ0ZXh0dXJlIiwic2l6ZVNjYWxlIiwicGFyYW1ldGVycyIsImRlcHRoVGVzdCIsImRlcHRoRnVuYyIsIkxFUVVBTCIsImZwNjQiLCJsaWdodFNldHRpbmdzIiwibGlnaHRzUG9zaXRpb24iLCJhbWJpZW50UmF0aW8iLCJkaWZmdXNlUmF0aW8iLCJzcGVjdWxhclJhdGlvIiwibGlnaHRzU3RyZW5ndGgiLCJudW1iZXJPZkxpZ2h0cyIsImdldFBvc2l0aW9uIiwieCIsInBvc2l0aW9uIiwiZ2V0QW5nbGVEZWdyZWVzQ1ciLCJhbmdsZSIsImdldENvbG9yIiwiY29sb3IiLCJNZXNoTGF5ZXIiLCJpZCIsInNoYWRlckNhY2hlIiwiY29udGV4dCIsInByb3BzIiwibW9kdWxlcyIsInNldFN0YXRlIiwibW9kZWwiLCJnZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZUFuZ2xlcyIsImNhbGN1bGF0ZUluc3RhbmNlQW5nbGVzIiwiaW5zdGFuY2VDb2xvcnMiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJkYXRhQ2hhbmdlZCIsImludmFsaWRhdGVBbGwiLCJwcm9wc0NoYW5nZWQiLCJfdXBkYXRlRlA2NCIsInNldFVuaWZvcm1zIiwibG9hZFRleHR1cmUiLCJpbnN0YW5jZVBvc2l0aW9uczY0eHkiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJyZW1vdmUiLCJ1bmlmb3JtcyIsInJlbmRlciIsImlzVmFsaWRNZXNoIiwiYXR0cmlidXRlcyIsInBvc2l0aW9ucyIsImdldFNoYWRlcnMiLCJnZW9tZXRyeSIsImlzSW5zdGFuY2VkIiwic2FtcGxlcjEiLCJzZXROZWVkc1JlZHJhdyIsImF0dHJpYnV0ZSIsInZhbHVlIiwiaSIsInBvaW50IiwiREVGQVVMVF9DT0xPUiIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFFO0FBQ0Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxLQUFSLEVBQWVDLGlCQUFmLEVBQWtDQyxZQUFsQyxRQUFxRCxTQUFyRDtJQUNPQyxPLEdBQStCRCxZLENBQS9CQyxPO0lBQVNDLGtCLEdBQXNCRixZLENBQXRCRSxrQjs7QUFDaEIsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixFQUE2QkMsWUFBN0IsRUFBMkNDLFNBQTNDLFFBQTJELFNBQTNEO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjs7QUFFQSxPQUFPQyxFQUFQLE1BQWUsMEJBQWY7QUFDQSxPQUFPQyxJQUFQLE1B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Ozs7O0VBckpvQ3pELEs7O2VBQWxCMEQsUzs7O0FBd0pyQkEsVUFBVWdELFNBQVYsR0FBc0IsV0FBdEI7QUFDQWhELFVBQVV2QixZQUFWLEdBQXlCQSxZQUF6QiIsImZpbGUiOiJtZXNoLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiICAvLyBOb3RlOiBUaGlzIGZpbGUgd2lsbCBlaXRoZXIgYmUgbW92ZWQgYmFjayB0byBkZWNrLmdsIG9yIHJlZm9ybWF0dGVkIHRvIHdlYi1tb25vcmVwbyBzdGFuZGFyZHNcbi8vIERpc2FibGluZyBsaW50IHRlbXBvcmFyaWx5IHRvIGZhY2lsaXRhdGUgY29weWluZyBjb2RlIGluIGFuZCBvdXQgb2YgdGhpcyByZXBvXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyLCBDT09SRElOQVRFX1NZU1RFTSwgZXhwZXJpbWVudGFsfSBmcm9tICdkZWNrLmdsJztcbmNvbnN0IHtmcDY0aWZ5LCBlbmFibGU2NGJpdFN1cHBvcnR9ID0gZXhwZXJpbWVudGFsO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5LCBsb2FkVGV4dHVyZXMsIFRleHR1cmUyRH0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB2cyBmcm9tICcuL21lc2gtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9tZXNoLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL21lc2gtbGF5ZXItZnJhZ21lbnQuZ2xzbCc7XG5pbXBvcnQgcHJvamVjdDY0dXRpbHMgZnJvbSAnLi4vc2hhZGVybGliL3Byb2plY3Q2NHV0aWxzL3Byb2plY3Q2NHV0aWxzJztcblxuZnVuY3Rpb24gZGVncmVlVG9SYWRpYW4oZGVncmVlKSB7XG4gIHJldHVybiBkZWdyZWUgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG4vKlxuICogTG9hZCBpbWFnZSBkYXRhIGludG8gbHVtYS5nbCBUZXh0dXJlMkQgb2JqZWN0c1xuICogQHBhcmFtIHtXZWJHTENvbnRleHR9IGdsXG4gKiBAcGFyYW0ge1N0cmluZ3xUZXh0dXJlMkR8SFRNTEltYWdlRWxlbWVudHxVaW50OENsYW1wZWRBcnJheX0gc3JjIC0gc291cmNlIG9mIGltYWdlIGRhdGFcbiAqICAgY2FuIGJlIHVybCBzdHJpbmcsIFRleHR1cmUyRCBvYmplY3QsIEhUTUxJbWFnZUVsZW1lbnQgb3IgcGl4ZWwgYXJyYXlcbiAqIEByZXR1cm5zIHtQcm9taXNlfSByZXNvbHZlcyB0byBhbiBvYmplY3Qgd2l0aCBuYW1lIC0+IHRleHR1cmUgbWFwcGluZ1xuICovXG5mdW5jdGlvbiBnZXRUZXh0dXJlKGdsLCBzcmMsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gVXJsLCBsb2FkIHRoZSBpbWFnZVxuICAgIHJldHVybiBsb2FkVGV4dHVyZXMoZ2wsIE9iamVjdC5hc3NpZ24oe3VybHM6IFtzcmNdfSwgb3B0cykpXG4gICAgLnRoZW4odGV4dHVyZXMgPT4gdGV4dHVyZXNbMF0pXG4gICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGxvYWQgdGV4dHVyZSBmcm9tICR7c3JjfTogJHtlcnJvcn1gKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGdldFRleHR1cmVGcm9tRGF0YShnbCwgc3JjLCBvcHRzKSkpO1xufVxuXG4vKlxuICogQ29udmVydCBpbWFnZSBkYXRhIGludG8gdGV4dHVyZVxuICogQHJldHVybnMge1RleHR1cmUyRH0gdGV4dHVyZVxuICovXG5mdW5jdGlvbiBnZXRUZXh0dXJlRnJvbURhdGEoZ2wsIGRhdGEsIG9wdHMpIHtcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBUZXh0dXJlMkQpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICByZXR1cm4gbmV3IFRleHR1cmUyRChnbCwgT2JqZWN0LmFzc2lnbih7ZGF0YX0sIG9wdHMpKTtcbn1cblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBtZXNoOiBudWxsLFxuICB0ZXh0dXJlOiBudWxsLFxuICBzaXplU2NhbGU6IDEsXG5cbiAgLy8gVE9ETyAtIHBhcmFtZXRlcnMgc2hvdWxkIGJlIG1lcmdlZCwgbm90IGNvbXBsZXRlbHkgb3ZlcnJpZGRlblxuICBwYXJhbWV0ZXJzOiB7XG4gICAgZGVwdGhUZXN0OiB0cnVlLFxuICAgIGRlcHRoRnVuYzogR0wuTEVRVUFMXG4gIH0sXG4gIGZwNjQ6IGZhbHNlLFxuICAvLyBPcHRpb25hbCBzZXR0aW5ncyBmb3IgJ2xpZ2h0aW5nJyBzaGFkZXIgbW9kdWxlXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWy0xMjIuNDUsIDM3Ljc1LCA4MDAwLCAtMTIyLjAsIDM4LjAwLCA1MDAwXSxcbiAgICBhbWJpZW50UmF0aW86IDAuMDUsXG4gICAgZGlmZnVzZVJhdGlvOiAwLjYsXG4gICAgc3BlY3VsYXJSYXRpbzogMC44LFxuICAgIGxpZ2h0c1N0cmVuZ3RoOiBbMi4wLCAwLjAsIDAuMCwgMC4wXSxcbiAgICBudW1iZXJPZkxpZ2h0czogMlxuICB9LFxuXG4gIGdldFBvc2l0aW9uOiB4ID0+IHgucG9zaXRpb24sXG4gIGdldEFuZ2xlRGVncmVlc0NXOiB4ID0+IHguYW5nbGUgfHwgMCxcbiAgZ2V0Q29sb3I6IHggPT4geC5jb2xvciB8fCBbMCwgMCwgMCwgMjU1XVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzaExheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG4gIGdldFNoYWRlcnMoaWQpIHtcbiAgICBjb25zdCB7c2hhZGVyQ2FjaGV9ID0gdGhpcy5jb250ZXh0O1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogW3Byb2plY3Q2NHV0aWxzLCAncGlja2luZycsICdsaWdodGluZyddLCBzaGFkZXJDYWNoZX0gOlxuICAgICAge3ZzLCBmcywgbW9kdWxlczogWydwaWNraW5nJywgJ2xpZ2h0aW5nJ10sIHNoYWRlckNhY2hlfTsgLy8gJ3Byb2plY3QnIG1vZHVsZSBhZGRlZCBieSBkZWZhdWx0LlxuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpfSk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZUFuZ2xlczoge3NpemU6IDEsIGFjY2Vzc29yOiAnZ2V0QW5nbGVEZWdyZWVzQ1cnLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VBbmdsZXN9LFxuICAgICAgaW5zdGFuY2VDb2xvcnM6IHtzaXplOiA0LCBhY2Nlc3NvcjogJ2dldENvbG9yJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIC8vIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gICAgaWYgKGNoYW5nZUZsYWdzLmRhdGFDaGFuZ2VkKSB7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlRmxhZ3MucHJvcHNDaGFuZ2VkKSB7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZUZQNjQocHJvcHMsIG9sZFByb3BzKTtcblxuICAgICAgaWYgKHByb3BzLnNpemVTY2FsZSAhPT0gb2xkUHJvcHMuc2l6ZVNjYWxlKSB7XG4gICAgICAgIGNvbnN0IHtzaXplU2NhbGV9ID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0VW5pZm9ybXMoe3NpemVTY2FsZX0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvcHMudGV4dHVyZSAhPT0gb2xkUHJvcHMudGV4dHVyZSkge1xuICAgICAgICBpZiAocHJvcHMudGV4dHVyZSkge1xuICAgICAgICAgIHRoaXMubG9hZFRleHR1cmUocHJvcHMudGV4dHVyZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVE9ETyAtIHJlc2V0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BzLmxpZ2h0U2V0dGluZ3MgIT09IG9sZFByb3BzLmxpZ2h0U2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRVbmlmb3Jtcyhwcm9wcy5saWdodFNldHRpbmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRlA2NChwcm9wcywgb2xkUHJvcHMpIHtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuZ2V0TW9kZWwodGhpcy5jb250ZXh0LmdsKX0pO1xuXG4gICAgICB0aGlzLnN0YXRlLm1vZGVsLnNldFVuaWZvcm1zKHtcbiAgICAgICAgc2l6ZVNjYWxlOiBwcm9wcy5zaXplU2NhbGVcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG5cbiAgICAgIGlmIChlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgICAgIGluc3RhbmNlUG9zaXRpb25zNjR4eToge1xuICAgICAgICAgICAgc2l6ZTogMixcbiAgICAgICAgICAgIGFjY2Vzc29yOiAnZ2V0UG9zaXRpb24nLFxuICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbJ2luc3RhbmNlUG9zaXRpb25zNjR4eSddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICB0aGlzLnN0YXRlLm1vZGVsLnJlbmRlcih1bmlmb3Jtcyk7XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IGlzVmFsaWRNZXNoID1cbiAgICAgIHRoaXMucHJvcHMubWVzaCBpbnN0YW5jZW9mIEdlb21ldHJ5ICYmXG4gICAgICB0aGlzLnByb3BzLm1lc2guYXR0cmlidXRlcy5wb3NpdGlvbnM7XG4gICAgYXNzZXJ0IChpc1ZhbGlkTWVzaCk7XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogdGhpcy5wcm9wcy5tZXNoLFxuICAgICAgaXNJbnN0YW5jZWQ6IHRydWVcbiAgICB9KSk7XG4gIH1cblxuICBsb2FkVGV4dHVyZShzcmMpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnN0YXRlO1xuICAgIGdldFRleHR1cmUoZ2wsIHNyYykudGhlbih0ZXh0dXJlID0+IHtcbiAgICAgIG1vZGVsLnNldFVuaWZvcm1zKHtzYW1wbGVyMTogdGV4dHVyZX0pO1xuICAgICAgdGhpcy5zZXROZWVkc1JlZHJhdygpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMV0pWzFdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQW5nbGVzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRBbmdsZURlZ3JlZXNDV30gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgYW5nbGUgPSBnZXRBbmdsZURlZ3JlZXNDVyhwb2ludCk7XG4gICAgICB2YWx1ZVtpXSA9IC1kZWdyZWVUb1JhZGlhbihhbmdsZSk7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKHBvaW50KSB8fCBERUZBVUxUX0NPTE9SO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSsrXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgIH1cbiAgfVxufVxuXG5NZXNoTGF5ZXIubGF5ZXJOYW1lID0gJ01lc2hMYXllcic7XG5NZXNoTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19