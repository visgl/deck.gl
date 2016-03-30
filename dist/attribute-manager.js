'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable guard-for-in */


var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// auto: -
// instanced: - implies auto
//

var AttributeManager = function () {

  /**
   * @classdesc
   * Manages a list of attributes and an instance count
   * Auto allocates and updates "instanced" attributes as necessary
   *
   * - keeps track of valid state for each attribute
   * - auto reallocates attributes when needed
   * - auto updates attributes with registered updater functions
   * - allows overriding with application supplied buffers
   */

  function AttributeManager(_ref) {
    var _ref$id = _ref.id;
    var id = _ref$id === undefined ? '' : _ref$id;

    _classCallCheck(this, AttributeManager);

    this.id = id;
    this.attributes = {};
    this.instancedAttributes = {};
    this.allocedInstances = -1;
    this.needsRedraw = true;
    this.userData = {};
    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  // Returns attributes in a format suitable for use with Luma.gl objects
  //


  _createClass(AttributeManager, [{
    key: 'getAttributes',
    value: function getAttributes() {
      return this.attributes;
    }
  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw(_ref2) {
      var clearFlag = _ref2.clearFlag;

      var needsRedraw = this.needsRedraw;
      if (clearFlag) {
        this.needsRedraw = false;
      }
      return needsRedraw;
    }
  }, {
    key: 'add',
    value: function add(attributes, updaters) {
      var newAttributes = this._add(attributes, updaters, {});
      // and instancedAttributes (for updating when data changes)
      Object.assign(this.attributes, newAttributes);
    }
  }, {
    key: 'addInstanced',
    value: function addInstanced(attributes, updaters) {
      var newAttributes = this._add(attributes, updaters, {
        instanced: 1,
        autoUpdate: true
      });
      Object.assign(this.attributes, newAttributes);
      Object.assign(this.instancedAttributes, newAttributes);
    }
  }, {
    key: 'addVertices',
    value: function addVertices(vertexArray) {
      (0, _assert2.default)(vertexArray instanceof Float32Array);
      this.add({
        vertices: { value: vertexArray, size: 3, '0': 'x', '1': 'y', '2': 'z' }
      });
    }
  }, {
    key: 'addNormals',
    value: function addNormals(normalArray) {
      (0, _assert2.default)(normalArray instanceof Float32Array);
      this.add({
        normals: { value: normalArray, size: 3, '0': 'x', '1': 'y', '2': 'z' }
      });
    }
  }, {
    key: 'addIndices',
    value: function addIndices(indexArray, gl) {
      (0, _assert2.default)(indexArray instanceof Uint16Array);
      (0, _assert2.default)(gl);
      this.add({
        indices: {
          value: indexArray,
          size: 1,
          bufferType: gl.ELEMENT_ARRAY_BUFFER,
          drawMode: gl.STATIC_DRAW,
          '0': 'index'
        }
      });
    }

    // Marks an attribute for update

  }, {
    key: 'invalidate',
    value: function invalidate(attributeName) {
      var attributes = this.attributes;

      var attribute = attributes[attributeName];
      (0, _assert2.default)(attribute);
      attribute.needsUpdate = true;
    }
  }, {
    key: 'invalidateAll',
    value: function invalidateAll() {
      var attributes = this.attributes;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        attribute.needsUpdate = true;
      }
    }

    // Ensure all attribute buffers are updated from props or data

  }, {
    key: 'update',
    value: function update() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var numInstances = _ref3.numInstances;
      var _ref3$buffers = _ref3.buffers;
      var buffers = _ref3$buffers === undefined ? {} : _ref3$buffers;
      var context = _ref3.context;
      var data = _ref3.data;
      var getValue = _ref3.getValue;

      var opts = _objectWithoutProperties(_ref3, ['numInstances', 'buffers', 'context', 'data', 'getValue']);

      this._checkBuffers(buffers, opts);
      this._setBuffers(buffers);
      this._allocateBuffers({ numInstances: numInstances });
      this._updateBuffers({ numInstances: numInstances, context: context, data: data, getValue: getValue });
    }

    // Set the buffers for the supplied attributes
    // Update attribute buffers from any attributes in props
    // Detach any previously set buffers, marking all
    // Attributes for auto allocation

  }, {
    key: '_setBuffers',
    value: function _setBuffers(bufferMap, opt) {
      var attributes = this.attributes;

      // Copy the refs of any supplied buffers in the props

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var buffer = bufferMap[attributeName];
        if (buffer) {
          attribute.isExternalBuffer = true;
          attribute.needsUpdate = false;
          if (attribute.value !== buffer) {
            attribute.value = buffer;
            this.needsRedraw = true;
          }
        } else {
          attribute.isExternalBuffer = false;
        }
      }
    }

    // Auto allocates buffers for attributes
    // Note: To reduce allocations, only grows buffers
    // Note: Only allocates buffers not set by setBuffer

  }, {
    key: '_allocateBuffers',
    value: function _allocateBuffers(_ref4) {
      var numInstances = _ref4.numInstances;
      var allocedInstances = this.allocedInstances;
      var attributes = this.attributes;

      (0, _assert2.default)(numInstances !== undefined);

      if (numInstances > allocedInstances) {
        // Allocate at least one element to ensure a valid buffer
        var allocCount = Math.max(numInstances, 1);
        for (var attributeName in attributes) {
          var attribute = attributes[attributeName];
          var size = attribute.size;
          var isExternalBuffer = attribute.isExternalBuffer;
          var autoUpdate = attribute.autoUpdate;

          if (!isExternalBuffer && autoUpdate) {
            var ArrayType = attribute.type || Float32Array;
            attribute.value = new ArrayType(size * allocCount);
            attribute.needsUpdate = true;
            (0, _log2.default)(2, 'autoallocated ' + allocCount + ' ' + attributeName + ' for ' + this.id);
          }
        }
        this.allocedInstances = allocCount;
      }
    }
  }, {
    key: '_updateBuffers',
    value: function _updateBuffers(_ref5) {
      var numInstances = _ref5.numInstances;
      var data = _ref5.data;
      var getValue = _ref5.getValue;
      var context = _ref5.context;
      var attributes = this.attributes;

      // If app supplied all attributes, no need to iterate over data

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var update = attribute.update;

        if (attribute.needsUpdate && attribute.autoUpdate) {
          if (update) {
            (0, _log2.default)(2, 'autoupdating ' + numInstances + ' ' + attributeName + ' for ' + this.id);
            update.call(context, attribute, numInstances);
          } else {
            (0, _log2.default)(2, 'autocalculating ' + numInstances + ' ' + attributeName + ' for ' + this.id);
            this._updateAttributeFromData(attribute, data, getValue);
          }
          attribute.needsUpdate = false;
          this.needsRedraw = true;
        }
      }
    }
  }, {
    key: '_updateAttributeFromData',
    value: function _updateAttributeFromData(attribute) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var getValue = arguments.length <= 2 || arguments[2] === undefined ? function (x) {
        return x;
      } : arguments[2];


      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var values = getValue(object);
          // If this attribute's buffer wasn't copied from props, initialize it
          if (!attribute.isExternalBuffer) {
            var value = attribute.value;
            var size = attribute.size;

            value[i * size + 0] = values[attribute[0]];
            if (size >= 2) {
              value[i * size + 1] = values[attribute[0]];
            }
            if (size >= 3) {
              value[i * size + 2] = values[attribute[0]];
            }
            if (size >= 4) {
              value[i * size + 3] = values[attribute[0]];
            }
          }
          i++;
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

    // Checks that any attribute buffers in props are valid
    // Note: This is just to help app catch mistakes

  }, {
    key: '_checkBuffers',
    value: function _checkBuffers() {
      var bufferMap = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var attributes = this.attributes;
      var numInstances = this.numInstances;


      for (var attributeName in bufferMap) {
        var attribute = attributes[attributeName];
        var buffer = bufferMap[attributeName];
        if (!attribute && !opts.ignoreUnknownAttributes) {
          throw new Error('Unknown attribute prop ' + attributeName);
        }
        if (attribute) {
          if (!(buffer instanceof Float32Array)) {
            throw new Error('Attribute properties must be of type Float32Array');
          }
          if (attribute.auto && buffer.length <= numInstances * attribute.size) {
            throw new Error('Attribute prop array must match length and size');
          }
        }
      }
    }

    // Used to register an attribute

  }, {
    key: '_add',
    value: function _add(attributes, updaters) {
      var _extraProps = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var newAttributes = {};

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var updater = updaters && updaters[attributeName];

        // Check all fields and generate helpful error messages
        this._validate(attributeName, attribute, updater);

        // Initialize the attribute descriptor, with WebGL and metadata fields
        var attributeData = _extends({}, attribute, updater, {

          // State
          isExternalBuffer: false,
          needsUpdate: true,

          // Reserved for application
          userData: {},

          // WebGL fields
          size: attribute.size,
          value: attribute.value || null

        }, _extraProps);
        // Sanity - no app fields on our attributes. Use userData instead.
        Object.seal(attributeData);

        // Add to both attributes list (for registration with model)
        this.attributes[attributeName] = attributeData;
      }

      return newAttributes;
    }
  }, {
    key: '_validate',
    value: function _validate(attributeName, attribute, updater) {
      (0, _assert2.default)(typeof attribute.size === 'number', 'Attribute definition for ' + attributeName + ' missing size');

      // Check that value extraction keys are set
      (0, _assert2.default)(typeof attribute[0] === 'string', 'Attribute definition for ' + attributeName + ' missing key 0');
      if (attribute.size >= 2) {
        (0, _assert2.default)(typeof attribute[1] === 'string', 'Attribute definition for ' + attributeName + ' missing key 1');
      }
      if (attribute.size >= 3) {
        (0, _assert2.default)(typeof attribute[2] === 'string', 'Attribute definition for ' + attributeName + ' missing key 2');
      }
      if (attribute.size >= 4) {
        (0, _assert2.default)(typeof attribute[3] === 'string', 'Attribute definition for ' + attributeName + ' missing key 3');
      }

      // Check the updater
      (0, _assert2.default)(!updater || typeof updater.update === 'function', 'Attribute updater for ' + attributeName + ' missing update method');
    }
  }]);

  return AttributeManager;
}();

exports.default = AttributeManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdHRyaWJ1dGUtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFPcUI7Ozs7Ozs7Ozs7Ozs7QUFZbkIsV0FabUIsZ0JBWW5CLE9BQXVCO3VCQUFWLEdBQVU7UUFBViw2QkFBSyxhQUFLOzswQkFaSixrQkFZSTs7QUFDckIsU0FBSyxFQUFMLEdBQVUsRUFBVixDQURxQjtBQUVyQixTQUFLLFVBQUwsR0FBa0IsRUFBbEIsQ0FGcUI7QUFHckIsU0FBSyxtQkFBTCxHQUEyQixFQUEzQixDQUhxQjtBQUlyQixTQUFLLGdCQUFMLEdBQXdCLENBQUMsQ0FBRCxDQUpIO0FBS3JCLFNBQUssV0FBTCxHQUFtQixJQUFuQixDQUxxQjtBQU1yQixTQUFLLFFBQUwsR0FBZ0IsRUFBaEI7O0FBTnFCLFVBUXJCLENBQU8sSUFBUCxDQUFZLElBQVosRUFScUI7R0FBdkI7Ozs7OztlQVptQjs7b0NBeUJIO0FBQ2QsYUFBTyxLQUFLLFVBQUwsQ0FETzs7OzswQ0FJWTtVQUFaLDRCQUFZOztBQUMxQixVQUFNLGNBQWMsS0FBSyxXQUFMLENBRE07QUFFMUIsVUFBSSxTQUFKLEVBQWU7QUFDYixhQUFLLFdBQUwsR0FBbUIsS0FBbkIsQ0FEYTtPQUFmO0FBR0EsYUFBTyxXQUFQLENBTDBCOzs7O3dCQVF4QixZQUFZLFVBQVU7QUFDeEIsVUFBTSxnQkFBZ0IsS0FBSyxJQUFMLENBQVUsVUFBVixFQUFzQixRQUF0QixFQUFnQyxFQUFoQyxDQUFoQjs7QUFEa0IsWUFHeEIsQ0FBTyxNQUFQLENBQWMsS0FBSyxVQUFMLEVBQWlCLGFBQS9CLEVBSHdCOzs7O2lDQU1iLFlBQVksVUFBVTtBQUNqQyxVQUFNLGdCQUFnQixLQUFLLElBQUwsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCLEVBQWdDO0FBQ3BELG1CQUFXLENBQVg7QUFDQSxvQkFBWSxJQUFaO09BRm9CLENBQWhCLENBRDJCO0FBS2pDLGFBQU8sTUFBUCxD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OztBQVJnQyxjQTJCdEMsQ0FBTyxJQUFQLENBQVksYUFBWjs7O0FBM0JzQyxZQThCdEMsQ0FBSyxVQUFMLENBQWdCLGFBQWhCLElBQWlDLGFBQWpDLENBOUJzQztPQUF4Qzs7QUFpQ0EsYUFBTyxhQUFQLENBckMyQzs7Ozs4QkF3Q25DLGVBQWUsV0FBVyxTQUFTO0FBQzNDLDRCQUFPLE9BQU8sVUFBVSxJQUFWLEtBQW1CLFFBQTFCLGdDQUN1QiwrQkFEOUI7OztBQUQyQywyQkFLM0MsQ0FBTyxPQUFPLFVBQVUsQ0FBVixDQUFQLEtBQXdCLFFBQXhCLGdDQUN1QixnQ0FEOUIsRUFMMkM7QUFPM0MsVUFBSSxVQUFVLElBQVYsSUFBa0IsQ0FBbEIsRUFBcUI7QUFDdkIsOEJBQU8sT0FBTyxVQUFVLENBQVYsQ0FBUCxLQUF3QixRQUF4QixnQ0FDdUIsZ0NBRDlCLEVBRHVCO09BQXpCO0FBSUEsVUFBSSxVQUFVLElBQVYsSUFBa0IsQ0FBbEIsRUFBcUI7QUFDdkIsOEJBQU8sT0FBTyxVQUFVLENBQVYsQ0FBUCxLQUF3QixRQUF4QixnQ0FDdUIsZ0NBRDlCLEVBRHVCO09BQXpCO0FBSUEsVUFBSSxVQUFVLElBQVYsSUFBa0IsQ0FBbEIsRUFBcUI7QUFDdkIsOEJBQU8sT0FBTyxVQUFVLENBQVYsQ0FBUCxLQUF3QixRQUF4QixnQ0FDdUIsZ0NBRDlCLEVBRHVCO09BQXpCOzs7QUFmMkMsMkJBcUIzQyxDQUFPLENBQUMsT0FBRCxJQUFZLE9BQU8sUUFBUSxNQUFSLEtBQW1CLFVBQTFCLDZCQUNRLHdDQUQzQixFQXJCMkM7Ozs7U0F0UTFCIiwiZmlsZSI6ImF0dHJpYnV0ZS1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgZ3VhcmQtZm9yLWluICovXG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLy8gYXV0bzogLVxuLy8gaW5zdGFuY2VkOiAtIGltcGxpZXMgYXV0b1xuLy9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0dHJpYnV0ZU1hbmFnZXIge1xuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIE1hbmFnZXMgYSBsaXN0IG9mIGF0dHJpYnV0ZXMgYW5kIGFuIGluc3RhbmNlIGNvdW50XG4gICAqIEF1dG8gYWxsb2NhdGVzIGFuZCB1cGRhdGVzIFwiaW5zdGFuY2VkXCIgYXR0cmlidXRlcyBhcyBuZWNlc3NhcnlcbiAgICpcbiAgICogLSBrZWVwcyB0cmFjayBvZiB2YWxpZCBzdGF0ZSBmb3IgZWFjaCBhdHRyaWJ1dGVcbiAgICogLSBhdXRvIHJlYWxsb2NhdGVzIGF0dHJpYnV0ZXMgd2hlbiBuZWVkZWRcbiAgICogLSBhdXRvIHVwZGF0ZXMgYXR0cmlidXRlcyB3aXRoIHJlZ2lzdGVyZWQgdXBkYXRlciBmdW5jdGlvbnNcbiAgICogLSBhbGxvd3Mgb3ZlcnJpZGluZyB3aXRoIGFwcGxpY2F0aW9uIHN1cHBsaWVkIGJ1ZmZlcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHtpZCA9ICcnfSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLmluc3RhbmNlZEF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLmFsbG9jZWRJbnN0YW5jZXMgPSAtMTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICB0aGlzLnVzZXJEYXRhID0ge307XG4gICAgLy8gRm9yIGRlYnVnZ2luZyBzYW5pdHksIHByZXZlbnQgdW5pbml0aWFsaXplZCBtZW1iZXJzXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGF0dHJpYnV0ZXMgaW4gYSBmb3JtYXQgc3VpdGFibGUgZm9yIHVzZSB3aXRoIEx1bWEuZ2wgb2JqZWN0c1xuICAvL1xuICBnZXRBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXM7XG4gIH1cblxuICBnZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSkge1xuICAgIGNvbnN0IG5lZWRzUmVkcmF3ID0gdGhpcy5uZWVkc1JlZHJhdztcbiAgICBpZiAoY2xlYXJGbGFnKSB7XG4gICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBuZWVkc1JlZHJhdztcbiAgfVxuXG4gIGFkZChhdHRyaWJ1dGVzLCB1cGRhdGVycykge1xuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB0aGlzLl9hZGQoYXR0cmlidXRlcywgdXBkYXRlcnMsIHt9KTtcbiAgICAvLyBhbmQgaW5zdGFuY2VkQXR0cmlidXRlcyAoZm9yIHVwZGF0aW5nIHdoZW4gZGF0YSBjaGFuZ2VzKVxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5hdHRyaWJ1dGVzLCBuZXdBdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIGFkZEluc3RhbmNlZChhdHRyaWJ1dGVzLCB1cGRhdGVycykge1xuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB0aGlzLl9hZGQoYXR0cmlidXRlcywgdXBkYXRlcnMsIHtcbiAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgIGF1dG9VcGRhdGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmluc3RhbmNlZEF0dHJpYnV0ZXMsIG5ld0F0dHJpYnV0ZXMpO1xuICB9XG5cbiAgYWRkVmVydGljZXModmVydGV4QXJyYXkpIHtcbiAgICBhc3NlcnQodmVydGV4QXJyYXkgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpO1xuICAgIHRoaXMuYWRkKHtcbiAgICAgIHZlcnRpY2VzOiB7dmFsdWU6IHZlcnRleEFycmF5LCBzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3onfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkTm9ybWFscyhub3JtYWxBcnJheSkge1xuICAgIGFzc2VydChub3JtYWxBcnJheSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSk7XG4gICAgdGhpcy5hZGQoe1xuICAgICAgbm9ybWFsczoge3ZhbHVlOiBub3JtYWxBcnJheSwgc2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd6J31cbiAgICB9KTtcbiAgfVxuXG4gIGFkZEluZGljZXMoaW5kZXhBcnJheSwgZ2wpIHtcbiAgICBhc3NlcnQoaW5kZXhBcnJheSBpbnN0YW5jZW9mIFVpbnQxNkFycmF5KTtcbiAgICBhc3NlcnQoZ2wpO1xuICAgIHRoaXMuYWRkKHtcbiAgICAgIGluZGljZXM6IHtcbiAgICAgICAgdmFsdWU6IGluZGV4QXJyYXksXG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGJ1ZmZlclR5cGU6IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLFxuICAgICAgICBkcmF3TW9kZTogZ2wuU1RBVElDX0RSQVcsXG4gICAgICAgICcwJzogJ2luZGV4J1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gTWFya3MgYW4gYXR0cmlidXRlIGZvciB1cGRhdGVcbiAgaW52YWxpZGF0ZShhdHRyaWJ1dGVOYW1lKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgIGFzc2VydChhdHRyaWJ1dGUpO1xuICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBpbnZhbGlkYXRlQWxsKCkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVuc3VyZSBhbGwgYXR0cmlidXRlIGJ1ZmZlcnMgYXJlIHVwZGF0ZWQgZnJvbSBwcm9wcyBvciBkYXRhXG4gIHVwZGF0ZSh7bnVtSW5zdGFuY2VzLCBidWZmZXJzID0ge30sIGNvbnRleHQsIGRhdGEsIGdldFZhbHVlLCAuLi5vcHRzfSA9IHt9KSB7XG4gICAgdGhpcy5fY2hlY2tCdWZmZXJzKGJ1ZmZlcnMsIG9wdHMpO1xuICAgIHRoaXMuX3NldEJ1ZmZlcnMoYnVmZmVycyk7XG4gICAgdGhpcy5fYWxsb2NhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXN9KTtcbiAgICB0aGlzLl91cGRhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXMsIGNvbnRleHQsIGRhdGEsIGdldFZhbHVlfSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIGJ1ZmZlcnMgZm9yIHRoZSBzdXBwbGllZCBhdHRyaWJ1dGVzXG4gIC8vIFVwZGF0ZSBhdHRyaWJ1dGUgYnVmZmVycyBmcm9tIGFueSBhdHRyaWJ1dGVzIGluIHByb3BzXG4gIC8vIERldGFjaCBhbnkgcHJldmlvdXNseSBzZXQgYnVmZmVycywgbWFya2luZyBhbGxcbiAgLy8gQXR0cmlidXRlcyBmb3IgYXV0byBhbGxvY2F0aW9uXG4gIF9zZXRCdWZmZXJzKGJ1ZmZlck1hcCwgb3B0KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcblxuICAgIC8vIENvcHkgdGhlIHJlZnMgb2YgYW55IHN1cHBsaWVkIGJ1ZmZlcnMgaW4gdGhlIHByb3BzXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCBidWZmZXIgPSBidWZmZXJNYXBbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgIGF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGlmIChhdHRyaWJ1dGUudmFsdWUgIT09IGJ1ZmZlcikge1xuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9IGJ1ZmZlcjtcbiAgICAgICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlLmlzRXh0ZXJuYWxCdWZmZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBdXRvIGFsbG9jYXRlcyBidWZmZXJzIGZvciBhdHRyaWJ1dGVzXG4gIC8vIE5vdGU6IFRvIHJlZHVjZSBhbGxvY2F0aW9ucywgb25seSBncm93cyBidWZmZXJzXG4gIC8vIE5vdGU6IE9ubHkgYWxsb2NhdGVzIGJ1ZmZlcnMgbm90IHNldCBieSBzZXRCdWZmZXJcbiAgX2FsbG9jYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzfSkge1xuICAgIGNvbnN0IHthbGxvY2VkSW5zdGFuY2VzLCBhdHRyaWJ1dGVzfSA9IHRoaXM7XG4gICAgYXNzZXJ0KG51bUluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKTtcblxuICAgIGlmIChudW1JbnN0YW5jZXMgPiBhbGxvY2VkSW5zdGFuY2VzKSB7XG4gICAgICAvLyBBbGxvY2F0ZSBhdCBsZWFzdCBvbmUgZWxlbWVudCB0byBlbnN1cmUgYSB2YWxpZCBidWZmZXJcbiAgICAgIGNvbnN0IGFsbG9jQ291bnQgPSBNYXRoLm1heChudW1JbnN0YW5jZXMsIDEpO1xuICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgICAgY29uc3Qge3NpemUsIGlzRXh0ZXJuYWxCdWZmZXIsIGF1dG9VcGRhdGV9ID0gYXR0cmlidXRlO1xuICAgICAgICBpZiAoIWlzRXh0ZXJuYWxCdWZmZXIgJiYgYXV0b1VwZGF0ZSkge1xuICAgICAgICAgIGNvbnN0IEFycmF5VHlwZSA9IGF0dHJpYnV0ZS50eXBlIHx8IEZsb2F0MzJBcnJheTtcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgQXJyYXlUeXBlKHNpemUgKiBhbGxvY0NvdW50KTtcbiAgICAgICAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgIGxvZygyLCBgYXV0b2FsbG9jYXRlZCAke2FsbG9jQ291bnR9ICR7YXR0cmlidXRlTmFtZX0gZm9yICR7dGhpcy5pZH1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gYWxsb2NDb3VudDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzLCBkYXRhLCBnZXRWYWx1ZSwgY29udGV4dH0pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuXG4gICAgLy8gSWYgYXBwIHN1cHBsaWVkIGFsbCBhdHRyaWJ1dGVzLCBubyBuZWVkIHRvIGl0ZXJhdGUgb3ZlciBkYXRhXG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGNvbnN0IHt1cGRhdGV9ID0gYXR0cmlidXRlO1xuICAgICAgaWYgKGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSAmJiBhdHRyaWJ1dGUuYXV0b1VwZGF0ZSkge1xuICAgICAgICBpZiAodXBkYXRlKSB7XG4gICAgICAgICAgbG9nKDIsXG4gICAgICAgICAgICBgYXV0b3VwZGF0aW5nICR7bnVtSW5zdGFuY2VzfSAke2F0dHJpYnV0ZU5hbWV9IGZvciAke3RoaXMuaWR9YCk7XG4gICAgICAgICAgdXBkYXRlLmNhbGwoY29udGV4dCwgYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZygyLFxuICAgICAgICAgICAgYGF1dG9jYWxjdWxhdGluZyAke251bUluc3RhbmNlc30gJHthdHRyaWJ1dGVOYW1lfSBmb3IgJHt0aGlzLmlkfWApO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUF0dHJpYnV0ZUZyb21EYXRhKGF0dHJpYnV0ZSwgZGF0YSwgZ2V0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQXR0cmlidXRlRnJvbURhdGEoYXR0cmlidXRlLCBkYXRhID0gW10sIGdldFZhbHVlID0geCA9PiB4KSB7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgdmFsdWVzID0gZ2V0VmFsdWUob2JqZWN0KTtcbiAgICAgIC8vIElmIHRoaXMgYXR0cmlidXRlJ3MgYnVmZmVyIHdhc24ndCBjb3BpZWQgZnJvbSBwcm9wcywgaW5pdGlhbGl6ZSBpdFxuICAgICAgaWYgKCFhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlcikge1xuICAgICAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDBdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIGlmIChzaXplID49IDIpIHtcbiAgICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpemUgPj0gMykge1xuICAgICAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2l6ZSA+PSA0KSB7XG4gICAgICAgICAgdmFsdWVbaSAqIHNpemUgKyAzXSA9IHZhbHVlc1thdHRyaWJ1dGVbMF1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2tzIHRoYXQgYW55IGF0dHJpYnV0ZSBidWZmZXJzIGluIHByb3BzIGFyZSB2YWxpZFxuICAvLyBOb3RlOiBUaGlzIGlzIGp1c3QgdG8gaGVscCBhcHAgY2F0Y2ggbWlzdGFrZXNcbiAgX2NoZWNrQnVmZmVycyhidWZmZXJNYXAgPSB7fSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXMsIG51bUluc3RhbmNlc30gPSB0aGlzO1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGJ1ZmZlck1hcCkge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlck1hcFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmICghYXR0cmlidXRlICYmICFvcHRzLmlnbm9yZVVua25vd25BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBhdHRyaWJ1dGUgcHJvcCAke2F0dHJpYnV0ZU5hbWV9YCk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGlmICghKGJ1ZmZlciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dHJpYnV0ZSBwcm9wZXJ0aWVzIG11c3QgYmUgb2YgdHlwZSBGbG9hdDMyQXJyYXknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cmlidXRlLmF1dG8gJiYgYnVmZmVyLmxlbmd0aCA8PSBudW1JbnN0YW5jZXMgKiBhdHRyaWJ1dGUuc2l6ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3AgYXJyYXkgbXVzdCBtYXRjaCBsZW5ndGggYW5kIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFVzZWQgdG8gcmVnaXN0ZXIgYW4gYXR0cmlidXRlXG4gIF9hZGQoYXR0cmlidXRlcywgdXBkYXRlcnMsIF9leHRyYVByb3BzID0ge30pIHtcblxuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3QgdXBkYXRlciA9IHVwZGF0ZXJzICYmIHVwZGF0ZXJzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyBDaGVjayBhbGwgZmllbGRzIGFuZCBnZW5lcmF0ZSBoZWxwZnVsIGVycm9yIG1lc3NhZ2VzXG4gICAgICB0aGlzLl92YWxpZGF0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUsIHVwZGF0ZXIpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBhdHRyaWJ1dGUgZGVzY3JpcHRvciwgd2l0aCBXZWJHTCBhbmQgbWV0YWRhdGEgZmllbGRzXG4gICAgICBjb25zdCBhdHRyaWJ1dGVEYXRhID0ge1xuICAgICAgICAvLyBNZXRhZGF0YVxuICAgICAgICAuLi5hdHRyaWJ1dGUsXG4gICAgICAgIC4uLnVwZGF0ZXIsXG5cbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgaXNFeHRlcm5hbEJ1ZmZlcjogZmFsc2UsXG4gICAgICAgIG5lZWRzVXBkYXRlOiB0cnVlLFxuXG4gICAgICAgIC8vIFJlc2VydmVkIGZvciBhcHBsaWNhdGlvblxuICAgICAgICB1c2VyRGF0YToge30sXG5cbiAgICAgICAgLy8gV2ViR0wgZmllbGRzXG4gICAgICAgIHNpemU6IGF0dHJpYnV0ZS5zaXplLFxuICAgICAgICB2YWx1ZTogYXR0cmlidXRlLnZhbHVlIHx8IG51bGwsXG5cbiAgICAgICAgLi4uX2V4dHJhUHJvcHNcbiAgICAgIH07XG4gICAgICAvLyBTYW5pdHkgLSBubyBhcHAgZmllbGRzIG9uIG91ciBhdHRyaWJ1dGVzLiBVc2UgdXNlckRhdGEgaW5zdGVhZC5cbiAgICAgIE9iamVjdC5zZWFsKGF0dHJpYnV0ZURhdGEpO1xuXG4gICAgICAvLyBBZGQgdG8gYm90aCBhdHRyaWJ1dGVzIGxpc3QgKGZvciByZWdpc3RyYXRpb24gd2l0aCBtb2RlbClcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZURhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0F0dHJpYnV0ZXM7XG4gIH1cblxuICBfdmFsaWRhdGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlLCB1cGRhdGVyKSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGUuc2l6ZSA9PT0gJ251bWJlcicsXG4gICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBzaXplYCk7XG5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGV4dHJhY3Rpb24ga2V5cyBhcmUgc2V0XG4gICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMF0gPT09ICdzdHJpbmcnLFxuICAgICAgYEF0dHJpYnV0ZSBkZWZpbml0aW9uIGZvciAke2F0dHJpYnV0ZU5hbWV9IG1pc3Npbmcga2V5IDBgKTtcbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gMikge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMV0gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMWApO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gMykge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMl0gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMmApO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gNCkge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbM10gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgM2ApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSB1cGRhdGVyXG4gICAgYXNzZXJ0KCF1cGRhdGVyIHx8IHR5cGVvZiB1cGRhdGVyLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyxcbiAgICAgIGBBdHRyaWJ1dGUgdXBkYXRlciBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIHVwZGF0ZSBtZXRob2RgKTtcbiAgfVxuXG59XG4iXX0=