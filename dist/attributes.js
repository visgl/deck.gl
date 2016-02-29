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

var Attributes = function () {

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

  function Attributes(_ref) {
    var _ref$id = _ref.id;
    var id = _ref$id === undefined ? '' : _ref$id;

    _classCallCheck(this, Attributes);

    this.id = id;
    this.attributes = {};
    this.instancedAttributes = {};
    this.numInstances = 0;
    this.allocedInstances = -1;
    this.needsRedraw = true;
    this.userData = {};
    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  // Returns attributes in a format suitable for use with Luma.gl objects
  //


  _createClass(Attributes, [{
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

      this.numInstances = numInstances;
      this._checkBuffers(buffers, opts);
      this._setBuffers(buffers);
      this._allocateBuffers();
      this._updateBuffers({ context: context, data: data, getValue: getValue });
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
    value: function _allocateBuffers() {
      var numInstances = this.numInstances;
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
            (0, _log2.default)(2, 'autoallocated ' + allocCount + ' ' + attributeName + ' for ' + this.id);
            attribute.value = new Float32Array(size * allocCount);
            attribute.needsUpdate = true;
          }
        }
        this.allocedInstances = allocCount;
      }
    }
  }, {
    key: '_updateBuffers',
    value: function _updateBuffers(_ref4) {
      var data = _ref4.data;
      var getValue = _ref4.getValue;
      var context = _ref4.context;
      var attributes = this.attributes;
      var numInstances = this.numInstances;

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

  return Attributes;
}();

exports.default = Attributes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdHRyaWJ1dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQVNxQjs7Ozs7Ozs7Ozs7OztBQVluQixXQVptQixVQVluQixPQUF1Qjt1QkFBVixHQUFVO1FBQVYsNkJBQUssYUFBSzs7MEJBWkosWUFZSTs7QUFDckIsU0FBSyxFQUFMLEdBQVUsRUFBVixDQURxQjtBQUVyQixTQUFLLFVBQUwsR0FBa0IsRUFBbEIsQ0FGcUI7QUFHckIsU0FBSyxtQkFBTCxHQUEyQixFQUEzQixDQUhxQjtBQUlyQixTQUFLLFlBQUwsR0FBb0IsQ0FBcEIsQ0FKcUI7QUFLckIsU0FBSyxnQkFBTCxHQUF3QixDQUFDLENBQUQsQ0FMSDtBQU1yQixTQUFLLFdBQUwsR0FBbUIsSUFBbkIsQ0FOcUI7QUFPckIsU0FBSyxRQUFMLEdBQWdCLEVBQWhCOztBQVBxQixVQVNyQixDQUFPLElBQVAsQ0FBWSxJQUFaLEVBVHFCO0dBQXZCOzs7Ozs7ZUFabUI7O29DQTBCSDtBQUNkLGFBQU8sS0FBSyxVQUFMLENBRE87Ozs7MENBSVk7VUFBWiw0QkFBWTs7QUFDMUIsVUFBTSxjQUFjLEtBQUssV0FBTCxDQURNO0FBRTFCLFVBQUksU0FBSixFQUFlO0FBQ2IsYUFBSyxXQUFMLEdBQW1CLEtBQW5CLENBRGE7T0FBZjtBQUdBLGFBQU8sV0FBUCxDQUwwQjs7Ozt3QkFReEIsWUFBWSxVQUFVO0FBQ3hCLFVBQU0sZ0JBQWdCLEtBQUssSUFBTCxDQUFVLFVBQVYsRUFBc0IsUUFBdEIsRUFBZ0MsRUFBaEMsQ0FBaEI7O0FBRGtCLFlBR3hCLENBQU8sTUFBUCxDQUFjLEtBQUssVUFBTCxFQUFpQixhQUEvQixFQUh3Qjs7OztpQ0FNYixZQUFZLFVBQVU7QUFDakMsVUFBTSxnQkFBZ0IsS0FBSyxJQUFMLENBQVUsVUFBVixFQUFzQixRQUF0QixFQUFnQztBQUNwRCxtQkFBVyxDQUFYO0FBQ0Esb0JBQVksSUFBWjtPQUZvQixDQUFo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QixRQUF4QixnQ0FDdUIsZ0NBRDlCLEVBRHVCO09BQXpCOzs7QUFmMkMsMkJBcUIzQyxDQUFPLENBQUMsT0FBRCxJQUFZLE9BQU8sUUFBUSxNQUFSLEtBQW1CLFVBQTFCLDZCQUNRLHdDQUQzQixFQXJCMkM7Ozs7U0EzTzFCIiwiZmlsZSI6ImF0dHJpYnV0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBndWFyZC1mb3ItaW4gKi9cbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5cbi8vIGF1dG86IC1cbi8vIGluc3RhbmNlZDogLSBpbXBsaWVzIGF1dG9cbi8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0dHJpYnV0ZXMge1xuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIE1hbmFnZXMgYSBsaXN0IG9mIGF0dHJpYnV0ZXMgYW5kIGFuIGluc3RhbmNlIGNvdW50XG4gICAqIEF1dG8gYWxsb2NhdGVzIGFuZCB1cGRhdGVzIFwiaW5zdGFuY2VkXCIgYXR0cmlidXRlcyBhcyBuZWNlc3NhcnlcbiAgICpcbiAgICogLSBrZWVwcyB0cmFjayBvZiB2YWxpZCBzdGF0ZSBmb3IgZWFjaCBhdHRyaWJ1dGVcbiAgICogLSBhdXRvIHJlYWxsb2NhdGVzIGF0dHJpYnV0ZXMgd2hlbiBuZWVkZWRcbiAgICogLSBhdXRvIHVwZGF0ZXMgYXR0cmlidXRlcyB3aXRoIHJlZ2lzdGVyZWQgdXBkYXRlciBmdW5jdGlvbnNcbiAgICogLSBhbGxvd3Mgb3ZlcnJpZGluZyB3aXRoIGFwcGxpY2F0aW9uIHN1cHBsaWVkIGJ1ZmZlcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHtpZCA9ICcnfSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLmluc3RhbmNlZEF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLm51bUluc3RhbmNlcyA9IDA7XG4gICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gLTE7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgdGhpcy51c2VyRGF0YSA9IHt9O1xuICAgIC8vIEZvciBkZWJ1Z2dpbmcgc2FuaXR5LCBwcmV2ZW50IHVuaW5pdGlhbGl6ZWQgbWVtYmVyc1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhdHRyaWJ1dGVzIGluIGEgZm9ybWF0IHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBMdW1hLmdsIG9iamVjdHNcbiAgLy9cbiAgZ2V0QXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzO1xuICB9XG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICBjb25zdCBuZWVkc1JlZHJhdyA9IHRoaXMubmVlZHNSZWRyYXc7XG4gICAgaWYgKGNsZWFyRmxhZykge1xuICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbmVlZHNSZWRyYXc7XG4gIH1cblxuICBhZGQoYXR0cmlidXRlcywgdXBkYXRlcnMpIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdGhpcy5fYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzLCB7fSk7XG4gICAgLy8gYW5kIGluc3RhbmNlZEF0dHJpYnV0ZXMgKGZvciB1cGRhdGluZyB3aGVuIGRhdGEgY2hhbmdlcylcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyk7XG4gIH1cblxuICBhZGRJbnN0YW5jZWQoYXR0cmlidXRlcywgdXBkYXRlcnMpIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdGhpcy5fYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzLCB7XG4gICAgICBpbnN0YW5jZWQ6IDEsXG4gICAgICBhdXRvVXBkYXRlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIG5ld0F0dHJpYnV0ZXMpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5pbnN0YW5jZWRBdHRyaWJ1dGVzLCBuZXdBdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIC8vIE1hcmtzIGFuIGF0dHJpYnV0ZSBmb3IgdXBkYXRlXG4gIGludmFsaWRhdGUoYXR0cmlidXRlTmFtZSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG4gICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICBhc3NlcnQoYXR0cmlidXRlKTtcbiAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG5cbiAgaW52YWxpZGF0ZUFsbCgpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBFbnN1cmUgYWxsIGF0dHJpYnV0ZSBidWZmZXJzIGFyZSB1cGRhdGVkIGZyb20gcHJvcHMgb3IgZGF0YVxuICB1cGRhdGUoe251bUluc3RhbmNlcywgYnVmZmVycyA9IHt9LCBjb250ZXh0LCBkYXRhLCBnZXRWYWx1ZSwgLi4ub3B0c30gPSB7fSkge1xuICAgIHRoaXMubnVtSW5zdGFuY2VzID0gbnVtSW5zdGFuY2VzO1xuICAgIHRoaXMuX2NoZWNrQnVmZmVycyhidWZmZXJzLCBvcHRzKTtcbiAgICB0aGlzLl9zZXRCdWZmZXJzKGJ1ZmZlcnMpO1xuICAgIHRoaXMuX2FsbG9jYXRlQnVmZmVycygpO1xuICAgIHRoaXMuX3VwZGF0ZUJ1ZmZlcnMoe2NvbnRleHQsIGRhdGEsIGdldFZhbHVlfSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIGJ1ZmZlcnMgZm9yIHRoZSBzdXBwbGllZCBhdHRyaWJ1dGVzXG4gIC8vIFVwZGF0ZSBhdHRyaWJ1dGUgYnVmZmVycyBmcm9tIGFueSBhdHRyaWJ1dGVzIGluIHByb3BzXG4gIC8vIERldGFjaCBhbnkgcHJldmlvdXNseSBzZXQgYnVmZmVycywgbWFya2luZyBhbGxcbiAgLy8gQXR0cmlidXRlcyBmb3IgYXV0byBhbGxvY2F0aW9uXG4gIF9zZXRCdWZmZXJzKGJ1ZmZlck1hcCwgb3B0KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcblxuICAgIC8vIENvcHkgdGhlIHJlZnMgb2YgYW55IHN1cHBsaWVkIGJ1ZmZlcnMgaW4gdGhlIHByb3BzXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCBidWZmZXIgPSBidWZmZXJNYXBbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgIGF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGlmIChhdHRyaWJ1dGUudmFsdWUgIT09IGJ1ZmZlcikge1xuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9IGJ1ZmZlcjtcbiAgICAgICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlLmlzRXh0ZXJuYWxCdWZmZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBdXRvIGFsbG9jYXRlcyBidWZmZXJzIGZvciBhdHRyaWJ1dGVzXG4gIC8vIE5vdGU6IFRvIHJlZHVjZSBhbGxvY2F0aW9ucywgb25seSBncm93cyBidWZmZXJzXG4gIC8vIE5vdGU6IE9ubHkgYWxsb2NhdGVzIGJ1ZmZlcnMgbm90IHNldCBieSBzZXRCdWZmZXJcbiAgX2FsbG9jYXRlQnVmZmVycygpIHtcbiAgICBjb25zdCB7bnVtSW5zdGFuY2VzLCBhbGxvY2VkSW5zdGFuY2VzLCBhdHRyaWJ1dGVzfSA9IHRoaXM7XG4gICAgYXNzZXJ0KG51bUluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKTtcblxuICAgIGlmIChudW1JbnN0YW5jZXMgPiBhbGxvY2VkSW5zdGFuY2VzKSB7XG4gICAgICAvLyBBbGxvY2F0ZSBhdCBsZWFzdCBvbmUgZWxlbWVudCB0byBlbnN1cmUgYSB2YWxpZCBidWZmZXJcbiAgICAgIGNvbnN0IGFsbG9jQ291bnQgPSBNYXRoLm1heChudW1JbnN0YW5jZXMsIDEpO1xuICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgICAgY29uc3Qge3NpemUsIGlzRXh0ZXJuYWxCdWZmZXIsIGF1dG9VcGRhdGV9ID0gYXR0cmlidXRlO1xuICAgICAgICBpZiAoIWlzRXh0ZXJuYWxCdWZmZXIgJiYgYXV0b1VwZGF0ZSkge1xuICAgICAgICAgIGxvZygyLCBgYXV0b2FsbG9jYXRlZCAke2FsbG9jQ291bnR9ICR7YXR0cmlidXRlTmFtZX0gZm9yICR7dGhpcy5pZH1gKTtcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUgKiBhbGxvY0NvdW50KTtcbiAgICAgICAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmFsbG9jZWRJbnN0YW5jZXMgPSBhbGxvY0NvdW50O1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVCdWZmZXJzKHtkYXRhLCBnZXRWYWx1ZSwgY29udGV4dH0pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlcywgbnVtSW5zdGFuY2VzfSA9IHRoaXM7XG5cbiAgICAvLyBJZiBhcHAgc3VwcGxpZWQgYWxsIGF0dHJpYnV0ZXMsIG5vIG5lZWQgdG8gaXRlcmF0ZSBvdmVyIGRhdGFcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3Qge3VwZGF0ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICBpZiAoYXR0cmlidXRlLm5lZWRzVXBkYXRlICYmIGF0dHJpYnV0ZS5hdXRvVXBkYXRlKSB7XG4gICAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgICBsb2coMixcbiAgICAgICAgICAgIGBhdXRvdXBkYXRpbmcgJHtudW1JbnN0YW5jZXN9ICR7YXR0cmlidXRlTmFtZX0gZm9yICR7dGhpcy5pZH1gKTtcbiAgICAgICAgICB1cGRhdGUuY2FsbChjb250ZXh0LCBhdHRyaWJ1dGUsIG51bUluc3RhbmNlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nKDIsXG4gICAgICAgICAgICBgYXV0b2NhbGN1bGF0aW5nICR7bnVtSW5zdGFuY2VzfSAke2F0dHJpYnV0ZU5hbWV9IGZvciAke3RoaXMuaWR9YCk7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlQXR0cmlidXRlRnJvbURhdGEoYXR0cmlidXRlLCBkYXRhLCBnZXRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBdHRyaWJ1dGVGcm9tRGF0YShhdHRyaWJ1dGUsIGRhdGEgPSBbXSwgZ2V0VmFsdWUgPSB4ID0+IHgpIHtcblxuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBnZXRWYWx1ZShvYmplY3QpO1xuICAgICAgLy8gSWYgdGhpcyBhdHRyaWJ1dGUncyBidWZmZXIgd2Fzbid0IGNvcGllZCBmcm9tIHByb3BzLCBpbml0aWFsaXplIGl0XG4gICAgICBpZiAoIWF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgaWYgKHNpemUgPj0gMikge1xuICAgICAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2l6ZSA+PSAzKSB7XG4gICAgICAgICAgdmFsdWVbaSAqIHNpemUgKyAyXSA9IHZhbHVlc1thdHRyaWJ1dGVbMF1dO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaXplID49IDQpIHtcbiAgICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDNdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICAvLyBDaGVja3MgdGhhdCBhbnkgYXR0cmlidXRlIGJ1ZmZlcnMgaW4gcHJvcHMgYXJlIHZhbGlkXG4gIC8vIE5vdGU6IFRoaXMgaXMganVzdCB0byBoZWxwIGFwcCBjYXRjaCBtaXN0YWtlc1xuICBfY2hlY2tCdWZmZXJzKGJ1ZmZlck1hcCA9IHt9LCBvcHRzID0ge30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlcywgbnVtSW5zdGFuY2VzfSA9IHRoaXM7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYnVmZmVyTWFwKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3QgYnVmZmVyID0gYnVmZmVyTWFwW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUgJiYgIW9wdHMuaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGF0dHJpYnV0ZSBwcm9wICR7YXR0cmlidXRlTmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKCEoYnVmZmVyIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3BlcnRpZXMgbXVzdCBiZSBvZiB0eXBlIEZsb2F0MzJBcnJheScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdHRyaWJ1dGUuYXV0byAmJiBidWZmZXIubGVuZ3RoIDw9IG51bUluc3RhbmNlcyAqIGF0dHJpYnV0ZS5zaXplKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRyaWJ1dGUgcHJvcCBhcnJheSBtdXN0IG1hdGNoIGxlbmd0aCBhbmQgc2l6ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlZCB0byByZWdpc3RlciBhbiBhdHRyaWJ1dGVcbiAgX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycywgX2V4dHJhUHJvcHMgPSB7fSkge1xuXG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCB1cGRhdGVyID0gdXBkYXRlcnMgJiYgdXBkYXRlcnNbYXR0cmlidXRlTmFtZV07XG5cbiAgICAgIC8vIENoZWNrIGFsbCBmaWVsZHMgYW5kIGdlbmVyYXRlIGhlbHBmdWwgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHRoaXMuX3ZhbGlkYXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZSwgdXBkYXRlcik7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdGhlIGF0dHJpYnV0ZSBkZXNjcmlwdG9yLCB3aXRoIFdlYkdMIGFuZCBtZXRhZGF0YSBmaWVsZHNcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZURhdGEgPSB7XG4gICAgICAgIC8vIE1ldGFkYXRhXG4gICAgICAgIC4uLmF0dHJpYnV0ZSxcbiAgICAgICAgLi4udXBkYXRlcixcblxuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICBpc0V4dGVybmFsQnVmZmVyOiBmYWxzZSxcbiAgICAgICAgbmVlZHNVcGRhdGU6IHRydWUsXG5cbiAgICAgICAgLy8gUmVzZXJ2ZWQgZm9yIGFwcGxpY2F0aW9uXG4gICAgICAgIHVzZXJEYXRhOiB7fSxcblxuICAgICAgICAvLyBXZWJHTCBmaWVsZHNcbiAgICAgICAgc2l6ZTogYXR0cmlidXRlLnNpemUsXG4gICAgICAgIHZhbHVlOiBhdHRyaWJ1dGUudmFsdWUgfHwgbnVsbCxcblxuICAgICAgICAuLi5fZXh0cmFQcm9wc1xuICAgICAgfTtcbiAgICAgIC8vIFNhbml0eSAtIG5vIGFwcCBmaWVsZHMgb24gb3VyIGF0dHJpYnV0ZXMuIFVzZSB1c2VyRGF0YSBpbnN0ZWFkLlxuICAgICAgT2JqZWN0LnNlYWwoYXR0cmlidXRlRGF0YSk7XG5cbiAgICAgIC8vIEFkZCB0byBib3RoIGF0dHJpYnV0ZXMgbGlzdCAoZm9yIHJlZ2lzdHJhdGlvbiB3aXRoIG1vZGVsKVxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlRGF0YTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3QXR0cmlidXRlcztcbiAgfVxuXG4gIF92YWxpZGF0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUsIHVwZGF0ZXIpIHtcbiAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZS5zaXplID09PSAnbnVtYmVyJyxcbiAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIHNpemVgKTtcblxuICAgIC8vIENoZWNrIHRoYXQgdmFsdWUgZXh0cmFjdGlvbiBrZXlzIGFyZSBzZXRcbiAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVswXSA9PT0gJ3N0cmluZycsXG4gICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMGApO1xuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSAyKSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVsxXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAxYCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSAzKSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVsyXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAyYCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGUuc2l6ZSA+PSA0KSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGF0dHJpYnV0ZVszXSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGBBdHRyaWJ1dGUgZGVmaW5pdGlvbiBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIGtleSAzYCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIHVwZGF0ZXJcbiAgICBhc3NlcnQoIXVwZGF0ZXIgfHwgdHlwZW9mIHVwZGF0ZXIudXBkYXRlID09PSAnZnVuY3Rpb24nLFxuICAgICAgYEF0dHJpYnV0ZSB1cGRhdGVyIGZvciAke2F0dHJpYnV0ZU5hbWV9IG1pc3NpbmcgdXBkYXRlIG1ldGhvZGApO1xuICB9XG5cbn1cbiJdfQ==