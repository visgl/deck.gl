var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
import { COORDINATE_SYSTEM, Layer, experimental } from '../../core';
var fp64ify = experimental.fp64ify,
    enable64bitSupport = experimental.enable64bitSupport;

import { GL, Model, Geometry, Texture2D, loadTextures } from 'luma.gl';

import vs from './icon-layer-vertex.glsl';
import vs64 from './icon-layer-vertex-64.glsl';
import fs from './icon-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];
var DEFAULT_TEXTURE_MIN_FILTER = GL.LINEAR_MIPMAP_LINEAR;
// GL.LINEAR is the default value but explicitly set it here
var DEFAULT_TEXTURE_MAG_FILTER = GL.LINEAR;

/*
 * @param {object} props
 * @param {Texture2D | string} props.iconAtlas - atlas image url or texture
 * @param {object} props.iconMapping - icon names mapped to icon definitions
 * @param {object} props.iconMapping[icon_name].x - x position of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].y - y position of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].width - width of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].height - height of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].anchorX - x anchor of icon on the atlas image,
 *   default to width / 2
 * @param {object} props.iconMapping[icon_name].anchorY - y anchor of icon on the atlas image,
 *   default to height / 2
 * @param {object} props.iconMapping[icon_name].mask - whether icon is treated as a transparency
 *   mask. If true, user defined color is applied. If false, original color from the image is
 *   applied. Default to false.
 * @param {number} props.size - icon size in pixels
 * @param {func} props.getPosition - returns anchor position of the icon, in [lng, lat, z]
 * @param {func} props.getIcon - returns icon name as a string
 * @param {func} props.getSize - returns icon size multiplier as a number
 * @param {func} props.getColor - returns color of the icon in [r, g, b, a]. Only works on icons
 *   with mask: true.
 * @param {func} props.getAngle - returns rotating angle (in degree) of the icon.
 */
var defaultProps = {
  iconAtlas: null,
  iconMapping: {},
  sizeScale: 1,
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getIcon: function getIcon(x) {
    return x.icon;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  },
  getSize: function getSize(x) {
    return x.size || 1;
  },
  getAngle: function getAngle(x) {
    return x.angle || 0;
  }
};

var IconLayer = function (_Layer) {
  _inherits(IconLayer, _Layer);

  function IconLayer() {
    _classCallCheck(this, IconLayer);

    return _possibleConstructorReturn(this, (IconLayer.__proto__ || Object.getPrototypeOf(IconLayer)).apply(this, arguments));
  }

  _createClass(IconLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'picking'] } : { vs: vs, fs: fs, modules: ['picking'] }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var attributeManager = this.state.attributeManager;
      var gl = this.context.gl;

      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceSizes: { size: 1, accessor: 'getSize', update: this.calculateInstanceSizes },
        instanceOffsets: { size: 2, accessor: 'getIcon', update: this.calculateInstanceOffsets },
        instanceIconFrames: { size: 4, accessor: 'getIcon', update: this.calculateInstanceIconFrames },
        instanceColorModes: { size: 1, type: GL.UNSIGNED_BYTE, accessor: 'getIcon', update: this.calculateInstanceColorMode },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors },
        instanceAngles: { size: 1, accessor: 'getAngle', update: this.calculateInstanceAngles }
      });
      /* eslint-enable max-len */

      this.setState({ model: this._getModel(gl) });
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.addInstanced({
            instancePositions64xyLow: {
              size: 2,
              accessor: 'getPosition',
              update: this.calculateInstancePositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instancePositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var _this2 = this;

      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      _get(IconLayer.prototype.__proto__ || Object.getPrototypeOf(IconLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

      var iconAtlas = props.iconAtlas,
          iconMapping = props.iconMapping;


      if (oldProps.iconMapping !== iconMapping) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidate('instanceOffsets');
        attributeManager.invalidate('instanceIconFrames');
        attributeManager.invalidate('instanceColorModes');
      }

      if (oldProps.iconAtlas !== iconAtlas) {

        if (iconAtlas instanceof Texture2D) {
          var _iconAtlas$setParamet;

          iconAtlas.setParameters((_iconAtlas$setParamet = {}, _defineProperty(_iconAtlas$setParamet, GL.TEXTURE_MIN_FILTER, DEFAULT_TEXTURE_MIN_FILTER), _defineProperty(_iconAtlas$setParamet, GL.TEXTURE_MAG_FILTER, DEFAULT_TEXTURE_MAG_FILTER), _iconAtlas$setParamet));
          this.setState({ iconsTexture: iconAtlas });
        } else if (typeof iconAtlas === 'string') {
          loadTextures(this.context.gl, {
            urls: [iconAtlas]
          }).then(function (_ref3) {
            var _texture$setParameter;

            var _ref4 = _slicedToArray(_ref3, 1),
                texture = _ref4[0];

            texture.setParameters((_texture$setParameter = {}, _defineProperty(_texture$setParameter, GL.TEXTURE_MIN_FILTER, DEFAULT_TEXTURE_MIN_FILTER), _defineProperty(_texture$setParameter, GL.TEXTURE_MAG_FILTER, DEFAULT_TEXTURE_MAG_FILTER), _texture$setParameter));
            _this2.setState({ iconsTexture: texture });
          });
        }
      }

      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
    }
  }, {
    key: 'draw',
    value: function draw(_ref5) {
      var uniforms = _ref5.uniforms;
      var sizeScale = this.props.sizeScale;
      var iconsTexture = this.state.iconsTexture;


      if (iconsTexture) {
        this.state.model.render(Object.assign({}, uniforms, {
          iconsTexture: iconsTexture,
          iconsTextureDim: [iconsTexture.width, iconsTexture.height],
          sizeScale: sizeScale
        }));
      }
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {

      var positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getPosition = _props.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var position = getPosition(object);
          value[i++] = position[0];
          value[i++] = position[1];
          value[i++] = position[2] || 0;
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
    key: 'calculateInstanceSizes',
    value: function calculateInstanceSizes(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getSize = _props3.getSize;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          value[i++] = getSize(object);
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
    key: 'calculateInstanceAngles',
    value: function calculateInstanceAngles(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getAngle = _props4.getAngle;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          value[i++] = getAngle(object);
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
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props5 = this.props,
          data = _props5.data,
          getColor = _props5.getColor;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var object = _step5.value;

          var color = getColor(object);

          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = isNaN(color[3]) ? 255 : color[3];
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceOffsets',
    value: function calculateInstanceOffsets(attribute) {
      var _props6 = this.props,
          data = _props6.data,
          iconMapping = _props6.iconMapping,
          getIcon = _props6.getIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var object = _step6.value;

          var icon = getIcon(object);
          var rect = iconMapping[icon] || {};
          value[i++] = rect.width / 2 - rect.anchorX || 0;
          value[i++] = rect.height / 2 - rect.anchorY || 0;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceColorMode',
    value: function calculateInstanceColorMode(attribute) {
      var _props7 = this.props,
          data = _props7.data,
          iconMapping = _props7.iconMapping,
          getIcon = _props7.getIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = data[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var object = _step7.value;

          var icon = getIcon(object);
          var colorMode = iconMapping[icon] && iconMapping[icon].mask;
          value[i++] = colorMode ? 1 : 0;
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceIconFrames',
    value: function calculateInstanceIconFrames(attribute) {
      var _props8 = this.props,
          data = _props8.data,
          iconMapping = _props8.iconMapping,
          getIcon = _props8.getIcon;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = data[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var object = _step8.value;

          var icon = getIcon(object);
          var rect = iconMapping[icon] || {};
          value[i++] = rect.x || 0;
          value[i++] = rect.y || 0;
          value[i++] = rect.width || 0;
          value[i++] = rect.height || 0;
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }]);

  return IconLayer;
}(Layer);

export default IconLayer;


IconLayer.layerName = 'IconLayer';
IconLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9pY29uLWxheWVyL2ljb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiQ09PUkRJTkFURV9TWVNURU0iLCJMYXllciIsImV4cGVyaW1lbnRhbCIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJUZXh0dXJlMkQiLCJsb2FkVGV4dHVyZXMiLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJERUZBVUxUX1RFWFRVUkVfTUlOX0ZJTFRFUiIsIkxJTkVBUl9NSVBNQVBfTElORUFSIiwiREVGQVVMVF9URVhUVVJFX01BR19GSUxURVIiLCJMSU5FQVIiLCJkZWZhdWx0UHJvcHMiLCJpY29uQXRsYXMiLCJpY29uTWFwcGluZyIsInNpemVTY2FsZSIsImZwNjQiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImdldEljb24iLCJpY29uIiwiZ2V0Q29sb3IiLCJjb2xvciIsImdldFNpemUiLCJzaXplIiwiZ2V0QW5nbGUiLCJhbmdsZSIsIkljb25MYXllciIsInByb3BzIiwibW9kdWxlcyIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImdsIiwiY29udGV4dCIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlU2l6ZXMiLCJjYWxjdWxhdGVJbnN0YW5jZVNpemVzIiwiaW5zdGFuY2VPZmZzZXRzIiwiY2FsY3VsYXRlSW5zdGFuY2VPZmZzZXRzIiwiaW5zdGFuY2VJY29uRnJhbWVzIiwiY2FsY3VsYXRlSW5zdGFuY2VJY29uRnJhbWVzIiwiaW5zdGFuY2VDb2xvck1vZGVzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9yTW9kZSIsImluc3RhbmNlQ29sb3JzIiwiY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMiLCJpbnN0YW5jZUFuZ2xlcyIsImNhbGN1bGF0ZUluc3RhbmNlQW5nbGVzIiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwiY29vcmRpbmF0ZVN5c3RlbSIsIkxOR0xBVCIsImluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsImludmFsaWRhdGUiLCJzZXRQYXJhbWV0ZXJzIiwiVEVYVFVSRV9NSU5fRklMVEVSIiwiVEVYVFVSRV9NQUdfRklMVEVSIiwiaWNvbnNUZXh0dXJlIiwidXJscyIsInRoZW4iLCJ0ZXh0dXJlIiwidXBkYXRlQXR0cmlidXRlIiwidW5pZm9ybXMiLCJyZW5kZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJpY29uc1RleHR1cmVEaW0iLCJ3aWR0aCIsImhlaWdodCIsInBvc2l0aW9ucyIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRV9GQU4iLCJhdHRyaWJ1dGVzIiwiRmxvYXQzMkFycmF5IiwiaXNJbnN0YW5jZWQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJvYmplY3QiLCJwb2ludCIsImlzTmFOIiwicmVjdCIsImFuY2hvclgiLCJhbmNob3JZIiwiY29sb3JNb2RlIiwibWFzayIsInkiLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxpQkFBUixFQUEyQkMsS0FBM0IsRUFBa0NDLFlBQWxDLFFBQXFELFlBQXJEO0lBQ09DLE8sR0FBK0JELFksQ0FBL0JDLE87SUFBU0Msa0IsR0FBc0JGLFksQ0FBdEJFLGtCOztBQUNoQixT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QjtBQUNBVixnQkFBTUMsR0FBTixJQUFhSSxLQUFLbkIsS0FBTCxJQUFjLENBQTNCO0FBQ0FjLGdCQUFNQyxHQUFOLElBQWFJLEtBQUtsQixNQUFMLElBQWUsQ0FBNUI7QUFDRDtBQVhvQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXRDOzs7O0VBbE5vQ3JGLEs7O2VBQWxCaUMsUzs7O0FBcU5yQkEsVUFBVTRFLFNBQVYsR0FBc0IsV0FBdEI7QUFDQTVFLFVBQVVoQixZQUFWLEdBQXlCQSxZQUF6QiIsImZpbGUiOiJpY29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge0NPT1JESU5BVEVfU1lTVEVNLCBMYXllciwgZXhwZXJpbWVudGFsfSBmcm9tICcuLi8uLi9jb3JlJztcbmNvbnN0IHtmcDY0aWZ5LCBlbmFibGU2NGJpdFN1cHBvcnR9ID0gZXhwZXJpbWVudGFsO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5LCBUZXh0dXJlMkQsIGxvYWRUZXh0dXJlc30gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCB2cyBmcm9tICcuL2ljb24tbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9pY29uLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL2ljb24tbGF5ZXItZnJhZ21lbnQuZ2xzbCc7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1IgPSBbMCwgMCwgMCwgMjU1XTtcbmNvbnN0IERFRkFVTFRfVEVYVFVSRV9NSU5fRklMVEVSID0gR0wuTElORUFSX01JUE1BUF9MSU5FQVI7XG4vLyBHTC5MSU5FQVIgaXMgdGhlIGRlZmF1bHQgdmFsdWUgYnV0IGV4cGxpY2l0bHkgc2V0IGl0IGhlcmVcbmNvbnN0IERFRkFVTFRfVEVYVFVSRV9NQUdfRklMVEVSID0gR0wuTElORUFSO1xuXG4vKlxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzXG4gKiBAcGFyYW0ge1RleHR1cmUyRCB8IHN0cmluZ30gcHJvcHMuaWNvbkF0bGFzIC0gYXRsYXMgaW1hZ2UgdXJsIG9yIHRleHR1cmVcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcy5pY29uTWFwcGluZyAtIGljb24gbmFtZXMgbWFwcGVkIHRvIGljb24gZGVmaW5pdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcy5pY29uTWFwcGluZ1tpY29uX25hbWVdLnggLSB4IHBvc2l0aW9uIG9mIGljb24gb24gdGhlIGF0bGFzIGltYWdlXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvcHMuaWNvbk1hcHBpbmdbaWNvbl9uYW1lXS55IC0geSBwb3NpdGlvbiBvZiBpY29uIG9uIHRoZSBhdGxhcyBpbWFnZVxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzLmljb25NYXBwaW5nW2ljb25fbmFtZV0ud2lkdGggLSB3aWR0aCBvZiBpY29uIG9uIHRoZSBhdGxhcyBpbWFnZVxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzLmljb25NYXBwaW5nW2ljb25fbmFtZV0uaGVpZ2h0IC0gaGVpZ2h0IG9mIGljb24gb24gdGhlIGF0bGFzIGltYWdlXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvcHMuaWNvbk1hcHBpbmdbaWNvbl9uYW1lXS5hbmNob3JYIC0geCBhbmNob3Igb2YgaWNvbiBvbiB0aGUgYXRsYXMgaW1hZ2UsXG4gKiAgIGRlZmF1bHQgdG8gd2lkdGggLyAyXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvcHMuaWNvbk1hcHBpbmdbaWNvbl9uYW1lXS5hbmNob3JZIC0geSBhbmNob3Igb2YgaWNvbiBvbiB0aGUgYXRsYXMgaW1hZ2UsXG4gKiAgIGRlZmF1bHQgdG8gaGVpZ2h0IC8gMlxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzLmljb25NYXBwaW5nW2ljb25fbmFtZV0ubWFzayAtIHdoZXRoZXIgaWNvbiBpcyB0cmVhdGVkIGFzIGEgdHJhbnNwYXJlbmN5XG4gKiAgIG1hc2suIElmIHRydWUsIHVzZXIgZGVmaW5lZCBjb2xvciBpcyBhcHBsaWVkLiBJZiBmYWxzZSwgb3JpZ2luYWwgY29sb3IgZnJvbSB0aGUgaW1hZ2UgaXNcbiAqICAgYXBwbGllZC4gRGVmYXVsdCB0byBmYWxzZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5zaXplIC0gaWNvbiBzaXplIGluIHBpeGVsc1xuICogQHBhcmFtIHtmdW5jfSBwcm9wcy5nZXRQb3NpdGlvbiAtIHJldHVybnMgYW5jaG9yIHBvc2l0aW9uIG9mIHRoZSBpY29uLCBpbiBbbG5nLCBsYXQsIHpdXG4gKiBAcGFyYW0ge2Z1bmN9IHByb3BzLmdldEljb24gLSByZXR1cm5zIGljb24gbmFtZSBhcyBhIHN0cmluZ1xuICogQHBhcmFtIHtmdW5jfSBwcm9wcy5nZXRTaXplIC0gcmV0dXJucyBpY29uIHNpemUgbXVsdGlwbGllciBhcyBhIG51bWJlclxuICogQHBhcmFtIHtmdW5jfSBwcm9wcy5nZXRDb2xvciAtIHJldHVybnMgY29sb3Igb2YgdGhlIGljb24gaW4gW3IsIGcsIGIsIGFdLiBPbmx5IHdvcmtzIG9uIGljb25zXG4gKiAgIHdpdGggbWFzazogdHJ1ZS5cbiAqIEBwYXJhbSB7ZnVuY30gcHJvcHMuZ2V0QW5nbGUgLSByZXR1cm5zIHJvdGF0aW5nIGFuZ2xlIChpbiBkZWdyZWUpIG9mIHRoZSBpY29uLlxuICovXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGljb25BdGxhczogbnVsbCxcbiAgaWNvbk1hcHBpbmc6IHt9LFxuICBzaXplU2NhbGU6IDEsXG4gIGZwNjQ6IGZhbHNlLFxuXG4gIGdldFBvc2l0aW9uOiB4ID0+IHgucG9zaXRpb24sXG4gIGdldEljb246IHggPT4geC5pY29uLFxuICBnZXRDb2xvcjogeCA9PiB4LmNvbG9yIHx8IERFRkFVTFRfQ09MT1IsXG4gIGdldFNpemU6IHggPT4geC5zaXplIHx8IDEsXG4gIGdldEFuZ2xlOiB4ID0+IHguYW5nbGUgfHwgMFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWNvbkxheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnLCAncGlja2luZyddfSA6XG4gICAgICB7dnMsIGZzLCBtb2R1bGVzOiBbJ3BpY2tpbmcnXX07ICAvLyAncHJvamVjdCcgbW9kdWxlIGFkZGVkIGJ5IGRlZmF1bHQuXG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZVNpemVzOiB7c2l6ZTogMSwgYWNjZXNzb3I6ICdnZXRTaXplJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlU2l6ZXN9LFxuICAgICAgaW5zdGFuY2VPZmZzZXRzOiB7c2l6ZTogMiwgYWNjZXNzb3I6ICdnZXRJY29uJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlT2Zmc2V0c30sXG4gICAgICBpbnN0YW5jZUljb25GcmFtZXM6IHtzaXplOiA0LCBhY2Nlc3NvcjogJ2dldEljb24nLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VJY29uRnJhbWVzfSxcbiAgICAgIGluc3RhbmNlQ29sb3JNb2Rlczoge3NpemU6IDEsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0SWNvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZUNvbG9yTW9kZX0sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9LFxuICAgICAgaW5zdGFuY2VBbmdsZXM6IHtzaXplOiAxLCBhY2Nlc3NvcjogJ2dldEFuZ2xlJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlQW5nbGVzfVxuICAgIH0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICB9XG5cbiAgdXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG5cbiAgICAgIGlmIChwcm9wcy5mcDY0ICYmIHByb3BzLmNvb3JkaW5hdGVTeXN0ZW0gPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiAyLFxuICAgICAgICAgICAgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtvbGRQcm9wcywgcHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG5cbiAgICBjb25zdCB7aWNvbkF0bGFzLCBpY29uTWFwcGluZ30gPSBwcm9wcztcblxuICAgIGlmIChvbGRQcm9wcy5pY29uTWFwcGluZyAhPT0gaWNvbk1hcHBpbmcpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGUoJ2luc3RhbmNlT2Zmc2V0cycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlKCdpbnN0YW5jZUljb25GcmFtZXMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZSgnaW5zdGFuY2VDb2xvck1vZGVzJyk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFByb3BzLmljb25BdGxhcyAhPT0gaWNvbkF0bGFzKSB7XG5cbiAgICAgIGlmIChpY29uQXRsYXMgaW5zdGFuY2VvZiBUZXh0dXJlMkQpIHtcbiAgICAgICAgaWNvbkF0bGFzLnNldFBhcmFtZXRlcnMoe1xuICAgICAgICAgIFtHTC5URVhUVVJFX01JTl9GSUxURVJdOiBERUZBVUxUX1RFWFRVUkVfTUlOX0ZJTFRFUixcbiAgICAgICAgICBbR0wuVEVYVFVSRV9NQUdfRklMVEVSXTogREVGQVVMVF9URVhUVVJFX01BR19GSUxURVJcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ljb25zVGV4dHVyZTogaWNvbkF0bGFzfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpY29uQXRsYXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxvYWRUZXh0dXJlcyh0aGlzLmNvbnRleHQuZ2wsIHtcbiAgICAgICAgICB1cmxzOiBbaWNvbkF0bGFzXVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoW3RleHR1cmVdKSA9PiB7XG4gICAgICAgICAgdGV4dHVyZS5zZXRQYXJhbWV0ZXJzKHtcbiAgICAgICAgICAgIFtHTC5URVhUVVJFX01JTl9GSUxURVJdOiBERUZBVUxUX1RFWFRVUkVfTUlOX0ZJTFRFUixcbiAgICAgICAgICAgIFtHTC5URVhUVVJFX01BR19GSUxURVJdOiBERUZBVUxUX1RFWFRVUkVfTUFHX0ZJTFRFUlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2ljb25zVGV4dHVyZTogdGV4dHVyZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcblxuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge3NpemVTY2FsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtpY29uc1RleHR1cmV9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmIChpY29uc1RleHR1cmUpIHtcbiAgICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICAgIGljb25zVGV4dHVyZSxcbiAgICAgICAgaWNvbnNUZXh0dXJlRGltOiBbaWNvbnNUZXh0dXJlLndpZHRoLCBpY29uc1RleHR1cmUuaGVpZ2h0XSxcbiAgICAgICAgc2l6ZVNjYWxlXG4gICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG5cbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbLTEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCwgMSwgLTEsIDBdO1xuXG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRV9GQU4sXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMV0pWzFdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU2l6ZXMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNpemV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpKytdID0gZ2V0U2l6ZShvYmplY3QpO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQW5nbGVzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRBbmdsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2krK10gPSBnZXRBbmdsZShvYmplY3QpO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3Iob2JqZWN0KTtcblxuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSsrXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlT2Zmc2V0cyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgaWNvbk1hcHBpbmcsIGdldEljb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBpY29uID0gZ2V0SWNvbihvYmplY3QpO1xuICAgICAgY29uc3QgcmVjdCA9IGljb25NYXBwaW5nW2ljb25dIHx8IHt9O1xuICAgICAgdmFsdWVbaSsrXSA9IChyZWN0LndpZHRoIC8gMiAtIHJlY3QuYW5jaG9yWCkgfHwgMDtcbiAgICAgIHZhbHVlW2krK10gPSAocmVjdC5oZWlnaHQgLyAyIC0gcmVjdC5hbmNob3JZKSB8fCAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ29sb3JNb2RlKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBpY29uTWFwcGluZywgZ2V0SWNvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGljb24gPSBnZXRJY29uKG9iamVjdCk7XG4gICAgICBjb25zdCBjb2xvck1vZGUgPSBpY29uTWFwcGluZ1tpY29uXSAmJiBpY29uTWFwcGluZ1tpY29uXS5tYXNrO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yTW9kZSA/IDEgOiAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlSWNvbkZyYW1lcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgaWNvbk1hcHBpbmcsIGdldEljb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBpY29uID0gZ2V0SWNvbihvYmplY3QpO1xuICAgICAgY29uc3QgcmVjdCA9IGljb25NYXBwaW5nW2ljb25dIHx8IHt9O1xuICAgICAgdmFsdWVbaSsrXSA9IHJlY3QueCB8fCAwO1xuICAgICAgdmFsdWVbaSsrXSA9IHJlY3QueSB8fCAwO1xuICAgICAgdmFsdWVbaSsrXSA9IHJlY3Qud2lkdGggfHwgMDtcbiAgICAgIHZhbHVlW2krK10gPSByZWN0LmhlaWdodCB8fCAwO1xuICAgIH1cbiAgfVxufVxuXG5JY29uTGF5ZXIubGF5ZXJOYW1lID0gJ0ljb25MYXllcic7XG5JY29uTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19