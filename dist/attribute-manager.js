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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdHRyaWJ1dGUtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztJQUtxQjs7Ozs7Ozs7Ozs7OztBQVluQixXQVptQixnQkFZbkIsT0FBdUI7dUJBQVYsR0FBVTtRQUFWLDZCQUFLLGFBQUs7OzBCQVpKLGtCQVlJOztBQUNyQixTQUFLLEVBQUwsR0FBVSxFQUFWLENBRHFCO0FBRXJCLFNBQUssVUFBTCxHQUFrQixFQUFsQixDQUZxQjtBQUdyQixTQUFLLG1CQUFMLEdBQTJCLEVBQTNCLENBSHFCO0FBSXJCLFNBQUssZ0JBQUwsR0FBd0IsQ0FBQyxDQUFELENBSkg7QUFLckIsU0FBSyxXQUFMLEdBQW1CLElBQW5CLENBTHFCO0FBTXJCLFNBQUssUUFBTCxHQUFnQixFQUFoQjs7QUFOcUIsVUFRckIsQ0FBTyxJQUFQLENBQVksSUFBWixFQVJxQjtHQUF2Qjs7Ozs7O2VBWm1COztvQ0F5Qkg7QUFDZCxhQUFPLEtBQUssVUFBTCxDQURPOzs7OzBDQUlZO1VBQVosNEJBQVk7O0FBQzFCLFVBQU0sY0FBYyxLQUFLLFdBQUwsQ0FETTtBQUUxQixVQUFJLFNBQUosRUFBZTtBQUNiLGFBQUssV0FBTCxHQUFtQixLQUFuQixDQURhO09BQWY7QUFHQSxhQUFPLFdBQVAsQ0FMMEI7Ozs7d0JBUXhCLFlBQVksVUFBVTtBQUN4QixVQUFNLGdCQUFnQixLQUFLLElBQUwsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCLEVBQWdDLEVBQWhDLENBQWhCOztBQURrQixZQUd4QixDQUFPLE1BQVAsQ0FBYyxLQUFLLFVBQUwsRUFBaUIsYUFBL0IsRUFId0I7Ozs7aUNBTWIsWUFBWSxVQUFVO0FBQ2pDLFVBQU0sZ0JBQWdCLEtBQUssSUFBTCxDQUFVLFVBQVYsRUFBc0IsUUFBdEIsRUFBZ0M7QUFDcEQsbUJBQVcsQ0FBWDtBQUNBLG9CQUFZLElBQVo7T0FGb0IsQ0FBaEIsQ0FEMkI7QUFLakMsYUFB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RUosWUFoQkM7O0FBUmdDLGNBMkJ0QyxDQUFPLElBQVAsQ0FBWSxhQUFaOzs7QUEzQnNDLFlBOEJ0QyxDQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsSUFBaUMsYUFBakMsQ0E5QnNDO09BQXhDOztBQWlDQSxhQUFPLGFBQVAsQ0FyQzJDOzs7OzhCQXdDbkMsZUFBZSxXQUFXLFNBQVM7QUFDM0MsNEJBQU8sT0FBTyxVQUFVLElBQVYsS0FBbUIsUUFBMUIsZ0NBQ3VCLCtCQUQ5Qjs7O0FBRDJDLDJCQUszQyxDQUFPLE9BQU8sVUFBVSxDQUFWLENBQVAsS0FBd0IsUUFBeEIsZ0NBQ3VCLGdDQUQ5QixFQUwyQztBQU8zQyxVQUFJLFVBQVUsSUFBVixJQUFrQixDQUFsQixFQUFxQjtBQUN2Qiw4QkFBTyxPQUFPLFVBQVUsQ0FBVixDQUFQLEtBQXdCLFFBQXhCLGdDQUN1QixnQ0FEOUIsRUFEdUI7T0FBekI7QUFJQSxVQUFJLFVBQVUsSUFBVixJQUFrQixDQUFsQixFQUFxQjtBQUN2Qiw4QkFBTyxPQUFPLFVBQVUsQ0FBVixDQUFQLEtBQXdCLFFBQXhCLGdDQUN1QixnQ0FEOUIsRUFEdUI7T0FBekI7QUFJQSxVQUFJLFVBQVUsSUFBVixJQUFrQixDQUFsQixFQUFxQjtBQUN2Qiw4QkFBTyxPQUFPLFVBQVUsQ0FBVixDQUFQLEtBQXdCLFFBQXhCLGdDQUN1QixnQ0FEOUIsRUFEdUI7T0FBekI7OztBQWYyQywyQkFxQjNDLENBQU8sQ0FBQyxPQUFELElBQVksT0FBTyxRQUFRLE1BQVIsS0FBbUIsVUFBMUIsNkJBQ1Esd0NBRDNCLEVBckIyQzs7OztTQXRRMUIiLCJmaWxlIjoiYXR0cmlidXRlLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBndWFyZC1mb3ItaW4gKi9cbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG4vLyBhdXRvOiAtXG4vLyBpbnN0YW5jZWQ6IC0gaW1wbGllcyBhdXRvXG4vL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXR0cmlidXRlTWFuYWdlciB7XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogTWFuYWdlcyBhIGxpc3Qgb2YgYXR0cmlidXRlcyBhbmQgYW4gaW5zdGFuY2UgY291bnRcbiAgICogQXV0byBhbGxvY2F0ZXMgYW5kIHVwZGF0ZXMgXCJpbnN0YW5jZWRcIiBhdHRyaWJ1dGVzIGFzIG5lY2Vzc2FyeVxuICAgKlxuICAgKiAtIGtlZXBzIHRyYWNrIG9mIHZhbGlkIHN0YXRlIGZvciBlYWNoIGF0dHJpYnV0ZVxuICAgKiAtIGF1dG8gcmVhbGxvY2F0ZXMgYXR0cmlidXRlcyB3aGVuIG5lZWRlZFxuICAgKiAtIGF1dG8gdXBkYXRlcyBhdHRyaWJ1dGVzIHdpdGggcmVnaXN0ZXJlZCB1cGRhdGVyIGZ1bmN0aW9uc1xuICAgKiAtIGFsbG93cyBvdmVycmlkaW5nIHdpdGggYXBwbGljYXRpb24gc3VwcGxpZWQgYnVmZmVyc1xuICAgKi9cbiAgY29uc3RydWN0b3Ioe2lkID0gJyd9KSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMuaW5zdGFuY2VkQXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMuYWxsb2NlZEluc3RhbmNlcyA9IC0xO1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIHRoaXMudXNlckRhdGEgPSB7fTtcbiAgICAvLyBGb3IgZGVidWdnaW5nIHNhbml0eSwgcHJldmVudCB1bmluaXRpYWxpemVkIG1lbWJlcnNcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYXR0cmlidXRlcyBpbiBhIGZvcm1hdCBzdWl0YWJsZSBmb3IgdXNlIHdpdGggTHVtYS5nbCBvYmplY3RzXG4gIC8vXG4gIGdldEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcztcbiAgfVxuXG4gIGdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KSB7XG4gICAgY29uc3QgbmVlZHNSZWRyYXcgPSB0aGlzLm5lZWRzUmVkcmF3O1xuICAgIGlmIChjbGVhckZsYWcpIHtcbiAgICAgIHRoaXMubmVlZHNSZWRyYXcgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG5lZWRzUmVkcmF3O1xuICB9XG5cbiAgYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzKSB7XG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHRoaXMuX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycywge30pO1xuICAgIC8vIGFuZCBpbnN0YW5jZWRBdHRyaWJ1dGVzIChmb3IgdXBkYXRpbmcgd2hlbiBkYXRhIGNoYW5nZXMpXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIG5ld0F0dHJpYnV0ZXMpO1xuICB9XG5cbiAgYWRkSW5zdGFuY2VkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzKSB7XG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHRoaXMuX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycywge1xuICAgICAgaW5zdGFuY2VkOiAxLFxuICAgICAgYXV0b1VwZGF0ZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5hdHRyaWJ1dGVzLCBuZXdBdHRyaWJ1dGVzKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuaW5zdGFuY2VkQXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyk7XG4gIH1cblxuICBhZGRWZXJ0aWNlcyh2ZXJ0ZXhBcnJheSkge1xuICAgIGFzc2VydCh2ZXJ0ZXhBcnJheSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSk7XG4gICAgdGhpcy5hZGQoe1xuICAgICAgdmVydGljZXM6IHt2YWx1ZTogdmVydGV4QXJyYXksIHNpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAneid9XG4gICAgfSk7XG4gIH1cblxuICBhZGROb3JtYWxzKG5vcm1hbEFycmF5KSB7XG4gICAgYXNzZXJ0KG5vcm1hbEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KTtcbiAgICB0aGlzLmFkZCh7XG4gICAgICBub3JtYWxzOiB7dmFsdWU6IG5vcm1hbEFycmF5LCBzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3onfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkSW5kaWNlcyhpbmRleEFycmF5LCBnbCkge1xuICAgIGFzc2VydChpbmRleEFycmF5IGluc3RhbmNlb2YgVWludDE2QXJyYXkpO1xuICAgIGFzc2VydChnbCk7XG4gICAgdGhpcy5hZGQoe1xuICAgICAgaW5kaWNlczoge1xuICAgICAgICB2YWx1ZTogaW5kZXhBcnJheSxcbiAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgYnVmZmVyVHlwZTogZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsXG4gICAgICAgIGRyYXdNb2RlOiBnbC5TVEFUSUNfRFJBVyxcbiAgICAgICAgJzAnOiAnaW5kZXgnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBNYXJrcyBhbiBhdHRyaWJ1dGUgZm9yIHVwZGF0ZVxuICBpbnZhbGlkYXRlKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgYXNzZXJ0KGF0dHJpYnV0ZSk7XG4gICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIGludmFsaWRhdGVBbGwoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gRW5zdXJlIGFsbCBhdHRyaWJ1dGUgYnVmZmVycyBhcmUgdXBkYXRlZCBmcm9tIHByb3BzIG9yIGRhdGFcbiAgdXBkYXRlKHtudW1JbnN0YW5jZXMsIGJ1ZmZlcnMgPSB7fSwgY29udGV4dCwgZGF0YSwgZ2V0VmFsdWUsIC4uLm9wdHN9ID0ge30pIHtcbiAgICB0aGlzLl9jaGVja0J1ZmZlcnMoYnVmZmVycywgb3B0cyk7XG4gICAgdGhpcy5fc2V0QnVmZmVycyhidWZmZXJzKTtcbiAgICB0aGlzLl9hbGxvY2F0ZUJ1ZmZlcnMoe251bUluc3RhbmNlc30pO1xuICAgIHRoaXMuX3VwZGF0ZUJ1ZmZlcnMoe251bUluc3RhbmNlcywgY29udGV4dCwgZGF0YSwgZ2V0VmFsdWV9KTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgYnVmZmVycyBmb3IgdGhlIHN1cHBsaWVkIGF0dHJpYnV0ZXNcbiAgLy8gVXBkYXRlIGF0dHJpYnV0ZSBidWZmZXJzIGZyb20gYW55IGF0dHJpYnV0ZXMgaW4gcHJvcHNcbiAgLy8gRGV0YWNoIGFueSBwcmV2aW91c2x5IHNldCBidWZmZXJzLCBtYXJraW5nIGFsbFxuICAvLyBBdHRyaWJ1dGVzIGZvciBhdXRvIGFsbG9jYXRpb25cbiAgX3NldEJ1ZmZlcnMoYnVmZmVyTWFwLCBvcHQpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuXG4gICAgLy8gQ29weSB0aGUgcmVmcyBvZiBhbnkgc3VwcGxpZWQgYnVmZmVycyBpbiB0aGUgcHJvcHNcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlck1hcFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgYXR0cmlidXRlLmlzRXh0ZXJuYWxCdWZmZXIgPSB0cnVlO1xuICAgICAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWx1ZSAhPT0gYnVmZmVyKSB7XG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlID0gYnVmZmVyO1xuICAgICAgICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlciA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG8gYWxsb2NhdGVzIGJ1ZmZlcnMgZm9yIGF0dHJpYnV0ZXNcbiAgLy8gTm90ZTogVG8gcmVkdWNlIGFsbG9jYXRpb25zLCBvbmx5IGdyb3dzIGJ1ZmZlcnNcbiAgLy8gTm90ZTogT25seSBhbGxvY2F0ZXMgYnVmZmVycyBub3Qgc2V0IGJ5IHNldEJ1ZmZlclxuICBfYWxsb2NhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXN9KSB7XG4gICAgY29uc3Qge2FsbG9jZWRJbnN0YW5jZXMsIGF0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBhc3NlcnQobnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQpO1xuXG4gICAgaWYgKG51bUluc3RhbmNlcyA+IGFsbG9jZWRJbnN0YW5jZXMpIHtcbiAgICAgIC8vIEFsbG9jYXRlIGF0IGxlYXN0IG9uZSBlbGVtZW50IHRvIGVuc3VyZSBhIHZhbGlkIGJ1ZmZlclxuICAgICAgY29uc3QgYWxsb2NDb3VudCA9IE1hdGgubWF4KG51bUluc3RhbmNlcywgMSk7XG4gICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgICBjb25zdCB7c2l6ZSwgaXNFeHRlcm5hbEJ1ZmZlciwgYXV0b1VwZGF0ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICAgIGlmICghaXNFeHRlcm5hbEJ1ZmZlciAmJiBhdXRvVXBkYXRlKSB7XG4gICAgICAgICAgY29uc3QgQXJyYXlUeXBlID0gYXR0cmlidXRlLnR5cGUgfHwgRmxvYXQzMkFycmF5O1xuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBBcnJheVR5cGUoc2l6ZSAqIGFsbG9jQ291bnQpO1xuICAgICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgbG9nKDIsIGBhdXRvYWxsb2NhdGVkICR7YWxsb2NDb3VudH0gJHthdHRyaWJ1dGVOYW1lfSBmb3IgJHt0aGlzLmlkfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmFsbG9jZWRJbnN0YW5jZXMgPSBhbGxvY0NvdW50O1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXMsIGRhdGEsIGdldFZhbHVlLCBjb250ZXh0fSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG5cbiAgICAvLyBJZiBhcHAgc3VwcGxpZWQgYWxsIGF0dHJpYnV0ZXMsIG5vIG5lZWQgdG8gaXRlcmF0ZSBvdmVyIGRhdGFcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3Qge3VwZGF0ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICBpZiAoYXR0cmlidXRlLm5lZWRzVXBkYXRlICYmIGF0dHJpYnV0ZS5hdXRvVXBkYXRlKSB7XG4gICAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgICBsb2coMixcbiAgICAgICAgICAgIGBhdXRvdXBkYXRpbmcgJHtudW1JbnN0YW5jZXN9ICR7YXR0cmlidXRlTmFtZX0gZm9yICR7dGhpcy5pZH1gKTtcbiAgICAgICAgICB1cGRhdGUuY2FsbChjb250ZXh0LCBhdHRyaWJ1dGUsIG51bUluc3RhbmNlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nKDIsXG4gICAgICAgICAgICBgYXV0b2NhbGN1bGF0aW5nICR7bnVtSW5zdGFuY2VzfSAke2F0dHJpYnV0ZU5hbWV9IGZvciAke3RoaXMuaWR9YCk7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlQXR0cmlidXRlRnJvbURhdGEoYXR0cmlidXRlLCBkYXRhLCBnZXRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBdHRyaWJ1dGVGcm9tRGF0YShhdHRyaWJ1dGUsIGRhdGEgPSBbXSwgZ2V0VmFsdWUgPSB4ID0+IHgpIHtcblxuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBnZXRWYWx1ZShvYmplY3QpO1xuICAgICAgLy8gSWYgdGhpcyBhdHRyaWJ1dGUncyBidWZmZXIgd2Fzbid0IGNvcGllZCBmcm9tIHByb3BzLCBpbml0aWFsaXplIGl0XG4gICAgICBpZiAoIWF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgaWYgKHNpemUgPj0gMikge1xuICAgICAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2l6ZSA+PSAzKSB7XG4gICAgICAgICAgdmFsdWVbaSAqIHNpemUgKyAyXSA9IHZhbHVlc1thdHRyaWJ1dGVbMF1dO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaXplID49IDQpIHtcbiAgICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDNdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICAvLyBDaGVja3MgdGhhdCBhbnkgYXR0cmlidXRlIGJ1ZmZlcnMgaW4gcHJvcHMgYXJlIHZhbGlkXG4gIC8vIE5vdGU6IFRoaXMgaXMganVzdCB0byBoZWxwIGFwcCBjYXRjaCBtaXN0YWtlc1xuICBfY2hlY2tCdWZmZXJzKGJ1ZmZlck1hcCA9IHt9LCBvcHRzID0ge30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlcywgbnVtSW5zdGFuY2VzfSA9IHRoaXM7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYnVmZmVyTWFwKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3QgYnVmZmVyID0gYnVmZmVyTWFwW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUgJiYgIW9wdHMuaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGF0dHJpYnV0ZSBwcm9wICR7YXR0cmlidXRlTmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKCEoYnVmZmVyIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3BlcnRpZXMgbXVzdCBiZSBvZiB0eXBlIEZsb2F0MzJBcnJheScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRyaWJ1dGUuYXV0byAmJiBidWZmZXIubGVuZ3RoIDw9IG51bUluc3RhbmNlcyAqIGF0dHJpYnV0ZS5zaXplKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRyaWJ1dGUgcHJvcCBhcnJheSBtdXN0IG1hdGNoIGxlbmd0aCBhbmQgc2l6ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlZCB0byByZWdpc3RlciBhbiBhdHRyaWJ1dGVcbiAgX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycywgX2V4dHJhUHJvcHMgPSB7fSkge1xuXG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCB1cGRhdGVyID0gdXBkYXRlcnMgJiYgdXBkYXRlcnNbYXR0cmlidXRlTmFtZV07XG5cbiAgICAgIC8vIENoZWNrIGFsbCBmaWVsZHMgYW5kIGdlbmVyYXRlIGhlbHBmdWwgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHRoaXMuX3ZhbGlkYXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZSwgdXBkYXRlcik7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdGhlIGF0dHJpYnV0ZSBkZXNjcmlwdG9yLCB3aXRoIFdlYkdMIGFuZCBtZXRhZGF0YSBmaWVsZHNcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZURhdGEgPSB7XG4gICAgICAgIC8vIE1ldGFkYXRhXG4gICAgICAgIC4uLmF0dHJpYnV0ZSxcbiAgICAgICAgLi4udXBkYXRlcixcblxuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICBpc0V4dGVybmFsQnVmZmVyOiBmYWxzZSxcbiAgICAgICAgbmVlZHNVcGRhdGU6IHRydWUsXG5cbiAgICAgICAgLy8gUmVzZXJ2ZWQgZm9yIGFwcGxpY2F0aW9uXG4gICAgICAgIHVzZXJEYXRhOiB7fSxcblxuICAgICAgICAvLyBXZWJHTCBmaWVsZHNcbiAgICAgICAgc2l6ZTogYXR0cmlidXRlLnNpemUsXG4gICAgICAgIHZhbHVlOiBhdHRyaWJ1dGUudmFsdWUgfHwgbnVsbCxcblxuICAgICAgICAuLi5fZXh0cmFQcm9wc1xuICAgICAgfTtcbiAgICAgIC8vIFNhbml0eSAtIG5vIGFwcCBmaWVsZHMgb24gb3VyIGF0dHJpYnV0ZXMuIFVzZSB1c2VyRGF0YSBpbnN0ZWFkLlxuICAgICAgT2JqZWN0LnNlYWwoYXR0cmlidXRlRGF0YSk7XG5cbiAgICAgIC8vIEFkZCB0byBib3RoIGF0dHJpYnV0ZXMgbGlzdCAoZm9yIHJlZ2lzdHJhdGlvbiB3aXRoIG1vZGVsKVxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlRGF0YTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3QXR0cmlidXRlcztcbiAgfVxuXG4gIF92YWxpZGF0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUsIHVwZGF0ZXIpIHtcbiAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZS5zaXplID09PSAnbnVtYmVyJyxcbiAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIHNpemVgKTtcblxuICAgIC8vIENoZWNrIHRoYXQgdmFsdWUgZXh0cmFjdGlvbiBrZXlzIGFyZSBzZXRcbiAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVswXSA9PT0gJ3N0cmluZycsXG4gICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMGApO1xuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSAyKSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVsxXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAxYCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSAzKSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVsyXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAyYCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSA0KSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVszXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAzYCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIHVwZGF0ZXJcbiAgICBhc3NlcnQoIXVwZGF0ZXIgfHwgdHlwZW9mIHVwZGF0ZXIudXBkYXRlID09PSAnZnVuY3Rpb24nLFxuICAgICAgYEF0dHJpYnV0ZSB1cGRhdGVyIGZvciAke2F0dHJpYnV0ZU5hbWV9IG1pc3NpbmcgdXBkYXRlIG1ldGhvZGApO1xuICB9XG5cbn1cbiJdfQ==