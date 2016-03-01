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

  return Attributes;
}();

exports.default = Attributes;
//# sourceMappingURL=data:application/json;base64,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QUFDLE9BQUQsSUFBWSxPQUFPLFFBQVEsTUFBUixLQUFtQixVQUExQiw2QkFDUSx3Q0FEM0IsRUFyQjJDOzs7O1NBek8xQiIsImZpbGUiOiJhdHRyaWJ1dGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgZ3VhcmQtZm9yLWluICovXG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuXG4vLyBhdXRvOiAtXG4vLyBpbnN0YW5jZWQ6IC0gaW1wbGllcyBhdXRvXG4vL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRyaWJ1dGVzIHtcblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBNYW5hZ2VzIGEgbGlzdCBvZiBhdHRyaWJ1dGVzIGFuZCBhbiBpbnN0YW5jZSBjb3VudFxuICAgKiBBdXRvIGFsbG9jYXRlcyBhbmQgdXBkYXRlcyBcImluc3RhbmNlZFwiIGF0dHJpYnV0ZXMgYXMgbmVjZXNzYXJ5XG4gICAqXG4gICAqIC0ga2VlcHMgdHJhY2sgb2YgdmFsaWQgc3RhdGUgZm9yIGVhY2ggYXR0cmlidXRlXG4gICAqIC0gYXV0byByZWFsbG9jYXRlcyBhdHRyaWJ1dGVzIHdoZW4gbmVlZGVkXG4gICAqIC0gYXV0byB1cGRhdGVzIGF0dHJpYnV0ZXMgd2l0aCByZWdpc3RlcmVkIHVwZGF0ZXIgZnVuY3Rpb25zXG4gICAqIC0gYWxsb3dzIG92ZXJyaWRpbmcgd2l0aCBhcHBsaWNhdGlvbiBzdXBwbGllZCBidWZmZXJzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7aWQgPSAnJ30pIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5pbnN0YW5jZWRBdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gLTE7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgdGhpcy51c2VyRGF0YSA9IHt9O1xuICAgIC8vIEZvciBkZWJ1Z2dpbmcgc2FuaXR5LCBwcmV2ZW50IHVuaW5pdGlhbGl6ZWQgbWVtYmVyc1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhdHRyaWJ1dGVzIGluIGEgZm9ybWF0IHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBMdW1hLmdsIG9iamVjdHNcbiAgLy9cbiAgZ2V0QXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzO1xuICB9XG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICBjb25zdCBuZWVkc1JlZHJhdyA9IHRoaXMubmVlZHNSZWRyYXc7XG4gICAgaWYgKGNsZWFyRmxhZykge1xuICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbmVlZHNSZWRyYXc7XG4gIH1cblxuICBhZGQoYXR0cmlidXRlcywgdXBkYXRlcnMpIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdGhpcy5fYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzLCB7fSk7XG4gICAgLy8gYW5kIGluc3RhbmNlZEF0dHJpYnV0ZXMgKGZvciB1cGRhdGluZyB3aGVuIGRhdGEgY2hhbmdlcylcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyk7XG4gIH1cblxuICBhZGRJbnN0YW5jZWQoYXR0cmlidXRlcywgdXBkYXRlcnMpIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdGhpcy5fYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzLCB7XG4gICAgICBpbnN0YW5jZWQ6IDEsXG4gICAgICBhdXRvVXBkYXRlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIG5ld0F0dHJpYnV0ZXMpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5pbnN0YW5jZWRBdHRyaWJ1dGVzLCBuZXdBdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIC8vIE1hcmtzIGFuIGF0dHJpYnV0ZSBmb3IgdXBkYXRlXG4gIGludmFsaWRhdGUoYXR0cmlidXRlTmFtZSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG4gICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICBhc3NlcnQoYXR0cmlidXRlKTtcbiAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG5cbiAgaW52YWxpZGF0ZUFsbCgpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBFbnN1cmUgYWxsIGF0dHJpYnV0ZSBidWZmZXJzIGFyZSB1cGRhdGVkIGZyb20gcHJvcHMgb3IgZGF0YVxuICB1cGRhdGUoe251bUluc3RhbmNlcywgYnVmZmVycyA9IHt9LCBjb250ZXh0LCBkYXRhLCBnZXRWYWx1ZSwgLi4ub3B0c30gPSB7fSkge1xuICAgIHRoaXMuX2NoZWNrQnVmZmVycyhidWZmZXJzLCBvcHRzKTtcbiAgICB0aGlzLl9zZXRCdWZmZXJzKGJ1ZmZlcnMpO1xuICAgIHRoaXMuX2FsbG9jYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzfSk7XG4gICAgdGhpcy5fdXBkYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzLCBjb250ZXh0LCBkYXRhLCBnZXRWYWx1ZX0pO1xuICB9XG5cbiAgLy8gU2V0IHRoZSBidWZmZXJzIGZvciB0aGUgc3VwcGxpZWQgYXR0cmlidXRlc1xuICAvLyBVcGRhdGUgYXR0cmlidXRlIGJ1ZmZlcnMgZnJvbSBhbnkgYXR0cmlidXRlcyBpbiBwcm9wc1xuICAvLyBEZXRhY2ggYW55IHByZXZpb3VzbHkgc2V0IGJ1ZmZlcnMsIG1hcmtpbmcgYWxsXG4gIC8vIEF0dHJpYnV0ZXMgZm9yIGF1dG8gYWxsb2NhdGlvblxuICBfc2V0QnVmZmVycyhidWZmZXJNYXAsIG9wdCkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG5cbiAgICAvLyBDb3B5IHRoZSByZWZzIG9mIGFueSBzdXBwbGllZCBidWZmZXJzIGluIHRoZSBwcm9wc1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3QgYnVmZmVyID0gYnVmZmVyTWFwW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICBhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlciA9IHRydWU7XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoYXR0cmlidXRlLnZhbHVlICE9PSBidWZmZXIpIHtcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWUgPSBidWZmZXI7XG4gICAgICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXV0byBhbGxvY2F0ZXMgYnVmZmVycyBmb3IgYXR0cmlidXRlc1xuICAvLyBOb3RlOiBUbyByZWR1Y2UgYWxsb2NhdGlvbnMsIG9ubHkgZ3Jvd3MgYnVmZmVyc1xuICAvLyBOb3RlOiBPbmx5IGFsbG9jYXRlcyBidWZmZXJzIG5vdCBzZXQgYnkgc2V0QnVmZmVyXG4gIF9hbGxvY2F0ZUJ1ZmZlcnMoe251bUluc3RhbmNlc30pIHtcbiAgICBjb25zdCB7YWxsb2NlZEluc3RhbmNlcywgYXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGFzc2VydChudW1JbnN0YW5jZXMgIT09IHVuZGVmaW5lZCk7XG5cbiAgICBpZiAobnVtSW5zdGFuY2VzID4gYWxsb2NlZEluc3RhbmNlcykge1xuICAgICAgLy8gQWxsb2NhdGUgYXQgbGVhc3Qgb25lIGVsZW1lbnQgdG8gZW5zdXJlIGEgdmFsaWQgYnVmZmVyXG4gICAgICBjb25zdCBhbGxvY0NvdW50ID0gTWF0aC5tYXgobnVtSW5zdGFuY2VzLCAxKTtcbiAgICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICAgIGNvbnN0IHtzaXplLCBpc0V4dGVybmFsQnVmZmVyLCBhdXRvVXBkYXRlfSA9IGF0dHJpYnV0ZTtcbiAgICAgICAgaWYgKCFpc0V4dGVybmFsQnVmZmVyICYmIGF1dG9VcGRhdGUpIHtcbiAgICAgICAgICBsb2coMiwgYGF1dG9hbGxvY2F0ZWQgJHthbGxvY0NvdW50fSAke2F0dHJpYnV0ZU5hbWV9IGZvciAke3RoaXMuaWR9YCk7XG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheShzaXplICogYWxsb2NDb3VudCk7XG4gICAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gYWxsb2NDb3VudDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzLCBkYXRhLCBnZXRWYWx1ZSwgY29udGV4dH0pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuXG4gICAgLy8gSWYgYXBwIHN1cHBsaWVkIGFsbCBhdHRyaWJ1dGVzLCBubyBuZWVkIHRvIGl0ZXJhdGUgb3ZlciBkYXRhXG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGNvbnN0IHt1cGRhdGV9ID0gYXR0cmlidXRlO1xuICAgICAgaWYgKGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSAmJiBhdHRyaWJ1dGUuYXV0b1VwZGF0ZSkge1xuICAgICAgICBpZiAodXBkYXRlKSB7XG4gICAgICAgICAgbG9nKDIsXG4gICAgICAgICAgICBgYXV0b3VwZGF0aW5nICR7bnVtSW5zdGFuY2VzfSAke2F0dHJpYnV0ZU5hbWV9IGZvciAke3RoaXMuaWR9YCk7XG4gICAgICAgICAgdXBkYXRlLmNhbGwoY29udGV4dCwgYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZygyLFxuICAgICAgICAgICAgYGF1dG9jYWxjdWxhdGluZyAke251bUluc3RhbmNlc30gJHthdHRyaWJ1dGVOYW1lfSBmb3IgJHt0aGlzLmlkfWApO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUF0dHJpYnV0ZUZyb21EYXRhKGF0dHJpYnV0ZSwgZGF0YSwgZ2V0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQXR0cmlidXRlRnJvbURhdGEoYXR0cmlidXRlLCBkYXRhID0gW10sIGdldFZhbHVlID0geCA9PiB4KSB7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgdmFsdWVzID0gZ2V0VmFsdWUob2JqZWN0KTtcbiAgICAgIC8vIElmIHRoaXMgYXR0cmlidXRlJ3MgYnVmZmVyIHdhc24ndCBjb3BpZWQgZnJvbSBwcm9wcywgaW5pdGlhbGl6ZSBpdFxuICAgICAgaWYgKCFhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlcikge1xuICAgICAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDBdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIGlmIChzaXplID49IDIpIHtcbiAgICAgICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gdmFsdWVzW2F0dHJpYnV0ZVswXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpemUgPj0gMykge1xuICAgICAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSB2YWx1ZXNbYXR0cmlidXRlWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2l6ZSA+PSA0KSB7XG4gICAgICAgICAgdmFsdWVbaSAqIHNpemUgKyAzXSA9IHZhbHVlc1thdHRyaWJ1dGVbMF1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2tzIHRoYXQgYW55IGF0dHJpYnV0ZSBidWZmZXJzIGluIHByb3BzIGFyZSB2YWxpZFxuICAvLyBOb3RlOiBUaGlzIGlzIGp1c3QgdG8gaGVscCBhcHAgY2F0Y2ggbWlzdGFrZXNcbiAgX2NoZWNrQnVmZmVycyhidWZmZXJNYXAgPSB7fSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXMsIG51bUluc3RhbmNlc30gPSB0aGlzO1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGJ1ZmZlck1hcCkge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlck1hcFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmICghYXR0cmlidXRlICYmICFvcHRzLmlnbm9yZVVua25vd25BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBhdHRyaWJ1dGUgcHJvcCAke2F0dHJpYnV0ZU5hbWV9YCk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGlmICghKGJ1ZmZlciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dHJpYnV0ZSBwcm9wZXJ0aWVzIG11c3QgYmUgb2YgdHlwZSBGbG9hdDMyQXJyYXknKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cmlidXRlLmF1dG8gJiYgYnVmZmVyLmxlbmd0aCA8PSBudW1JbnN0YW5jZXMgKiBhdHRyaWJ1dGUuc2l6ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3AgYXJyYXkgbXVzdCBtYXRjaCBsZW5ndGggYW5kIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFVzZWQgdG8gcmVnaXN0ZXIgYW4gYXR0cmlidXRlXG4gIF9hZGQoYXR0cmlidXRlcywgdXBkYXRlcnMsIF9leHRyYVByb3BzID0ge30pIHtcblxuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgY29uc3QgdXBkYXRlciA9IHVwZGF0ZXJzICYmIHVwZGF0ZXJzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyBDaGVjayBhbGwgZmllbGRzIGFuZCBnZW5lcmF0ZSBoZWxwZnVsIGVycm9yIG1lc3NhZ2VzXG4gICAgICB0aGlzLl92YWxpZGF0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUsIHVwZGF0ZXIpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBhdHRyaWJ1dGUgZGVzY3JpcHRvciwgd2l0aCBXZWJHTCBhbmQgbWV0YWRhdGEgZmllbGRzXG4gICAgICBjb25zdCBhdHRyaWJ1dGVEYXRhID0ge1xuICAgICAgICAvLyBNZXRhZGF0YVxuICAgICAgICAuLi5hdHRyaWJ1dGUsXG4gICAgICAgIC4uLnVwZGF0ZXIsXG5cbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgaXNFeHRlcm5hbEJ1ZmZlcjogZmFsc2UsXG4gICAgICAgIG5lZWRzVXBkYXRlOiB0cnVlLFxuXG4gICAgICAgIC8vIFJlc2VydmVkIGZvciBhcHBsaWNhdGlvblxuICAgICAgICB1c2VyRGF0YToge30sXG5cbiAgICAgICAgLy8gV2ViR0wgZmllbGRzXG4gICAgICAgIHNpemU6IGF0dHJpYnV0ZS5zaXplLFxuICAgICAgICB2YWx1ZTogYXR0cmlidXRlLnZhbHVlIHx8IG51bGwsXG5cbiAgICAgICAgLi4uX2V4dHJhUHJvcHNcbiAgICAgIH07XG4gICAgICAvLyBTYW5pdHkgLSBubyBhcHAgZmllbGRzIG9uIG91ciBhdHRyaWJ1dGVzLiBVc2UgdXNlckRhdGEgaW5zdGVhZC5cbiAgICAgIE9iamVjdC5zZWFsKGF0dHJpYnV0ZURhdGEpO1xuXG4gICAgICAvLyBBZGQgdG8gYm90aCBhdHRyaWJ1dGVzIGxpc3QgKGZvciByZWdpc3RyYXRpb24gd2l0aCBtb2RlbClcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZURhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0F0dHJpYnV0ZXM7XG4gIH1cblxuICBfdmFsaWRhdGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlLCB1cGRhdGVyKSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGUuc2l6ZSA9PT0gJ251bWJlcicsXG4gICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBzaXplYCk7XG5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGV4dHJhY3Rpb24ga2V5cyBhcmUgc2V0XG4gICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMF0gPT09ICdzdHJpbmcnLFxuICAgICAgYEF0dHJpYnV0ZSBkZWZpbml0aW9uIGZvciAke2F0dHJpYnV0ZU5hbWV9IG1pc3Npbmcga2V5IDBgKTtcbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gMikge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMV0gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMWApO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gMykge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbMl0gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgMmApO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlLnNpemUgPj0gNCkge1xuICAgICAgYXNzZXJ0KHR5cGVvZiBhdHRyaWJ1dGVbM10gPT09ICdzdHJpbmcnLFxuICAgICAgICBgQXR0cmlidXRlIGRlZmluaXRpb24gZm9yICR7YXR0cmlidXRlTmFtZX0gbWlzc2luZyBrZXkgM2ApO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSB1cGRhdGVyXG4gICAgYXNzZXJ0KCF1cGRhdGVyIHx8IHR5cGVvZiB1cGRhdGVyLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyxcbiAgICAgIGBBdHRyaWJ1dGUgdXBkYXRlciBmb3IgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIHVwZGF0ZSBtZXRob2RgKTtcbiAgfVxuXG59XG4iXX0=