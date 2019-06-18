var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

/* eslint-disable guard-for-in */
import Stats from './stats';
import log from '../utils/log';
import { GL } from 'luma.gl';
import assert from 'assert';

var LOG_START_END_PRIORITY = 1;
var LOG_DETAIL_PRIORITY = 2;

function noop() {}

/* eslint-disable complexity */
export function glArrayFromType(glType) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$clamped = _ref.clamped,
      clamped = _ref$clamped === undefined ? true : _ref$clamped;

  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (glType) {
    case GL.FLOAT:
      return Float32Array;
    case GL.UNSIGNED_SHORT:
    case GL.UNSIGNED_SHORT_5_6_5:
    case GL.UNSIGNED_SHORT_4_4_4_4:
    case GL.UNSIGNED_SHORT_5_5_5_1:
      return Uint16Array;
    case GL.UNSIGNED_INT:
      return Uint32Array;
    case GL.UNSIGNED_BYTE:
      return clamped ? Uint8ClampedArray : Uint8Array;
    case GL.BYTE:
      return Int8Array;
    case GL.SHORT:
      return Int16Array;
    case GL.INT:
      return Int32Array;
    default:
      throw new Error('Failed to deduce type from array');
  }
}
/* eslint-enable complexity */

// Default loggers
var logFunctions = {
  savedMessages: null,
  timeStart: null,

  onLog: function onLog(_ref2) {
    var level = _ref2.level,
        message = _ref2.message;

    log.log(level, message);
  },
  onUpdateStart: function onUpdateStart(_ref3) {
    var level = _ref3.level,
        id = _ref3.id,
        numInstances = _ref3.numInstances;

    logFunctions.savedMessages = [];
    logFunctions.timeStart = new Date();
  },
  onUpdate: function onUpdate(_ref4) {
    var level = _ref4.level,
        message = _ref4.message;

    if (logFunctions.savedMessages) {
      logFunctions.savedMessages.push(message);
    }
  },
  onUpdateEnd: function onUpdateEnd(_ref5) {
    var level = _ref5.level,
        id = _ref5.id,
        numInstances = _ref5.numInstances;

    var timeMs = Math.round(new Date() - logFunctions.timeStart);
    var time = timeMs + 'ms';
    log.group(level, 'Updated attributes for ' + numInstances + ' instances in ' + id + ' in ' + time, { collapsed: true });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = logFunctions.savedMessages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var message = _step.value;

        log.log(level, message);
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

    log.groupEnd(level, 'Updated attributes for ' + numInstances + ' instances in ' + id + ' in ' + time);
    logFunctions.savedMessages = null;
  }
};

var AttributeManager = function () {
  _createClass(AttributeManager, null, [{
    key: 'setDefaultLogFunctions',

    /**
     * Sets log functions to help trace or time attribute updates.
     * Default logging uses deck logger.
     *
     * `onLog` is called for each attribute.
     *
     * To enable detailed control of timming and e.g. hierarchical logging,
     * hooks are also provided for update start and end.
     *
     * @param {Object} [opts]
     * @param {String} [opts.onLog=] - called to print
     * @param {String} [opts.onUpdateStart=] - called before update() starts
     * @param {String} [opts.onUpdateEnd=] - called after update() ends
     */
    value: function setDefaultLogFunctions() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          onLog = _ref6.onLog,
          onUpdateStart = _ref6.onUpdateStart,
          onUpdate = _ref6.onUpdate,
          onUpdateEnd = _ref6.onUpdateEnd;

      if (onLog !== undefined) {
        logFunctions.onLog = onLog || noop;
      }
      if (onUpdateStart !== undefined) {
        logFunctions.onUpdateStart = onUpdateStart || noop;
      }
      if (onUpdate !== undefined) {
        logFunctions.onUpdate = onUpdate || noop;
      }
      if (onUpdateEnd !== undefined) {
        logFunctions.onUpdateEnd = onUpdateEnd || noop;
      }
    }

    /**
     * @classdesc
     * Automated attribute generation and management. Suitable when a set of
     * vertex shader attributes are generated by iteration over a data array,
     * and updates to these attributes are needed either when the data itself
     * changes, or when other data relevant to the calculations change.
     *
     * - First the application registers descriptions of its dynamic vertex
     *   attributes using AttributeManager.add().
     * - Then, when any change that affects attributes is detected by the
     *   application, the app will call AttributeManager.invalidate().
     * - Finally before it renders, it calls AttributeManager.update() to
     *   ensure that attributes are automatically rebuilt if anything has been
     *   invalidated.
     *
     * The application provided update functions describe how attributes
     * should be updated from a data array and are expected to traverse
     * that data array (or iterable) and fill in the attribute's typed array.
     *
     * Note that the attribute manager intentionally does not do advanced
     * change detection, but instead makes it easy to build such detection
     * by offering the ability to "invalidate" each attribute separately.
     *
     * Summary:
     * - keeps track of valid state for each attribute
     * - auto reallocates attributes when needed
     * - auto updates attributes with registered updater functions
     * - allows overriding with application supplied buffers
     *
     * Limitations:
     * - There are currently no provisions for only invalidating a range of
     *   indices in an attribute.
     *
     * @class
     * @param {Object} [props]
     * @param {String} [props.id] - identifier (for debugging)
     */

  }]);

  function AttributeManager() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref7$id = _ref7.id,
        id = _ref7$id === undefined ? 'attribute-manager' : _ref7$id;

    _classCallCheck(this, AttributeManager);

    this.id = id;

    this.attributes = {};
    this.updateTriggers = {};
    this.accessors = {};
    this.allocedInstances = -1;
    this.needsRedraw = true;

    this.userData = {};
    this.stats = new Stats({ id: 'attr' });

    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  /**
   * Adds attributes
   * Takes a map of attribute descriptor objects
   * - keys are attribute names
   * - values are objects with attribute fields
   *
   * attribute.size - number of elements per object
   * attribute.updater - number of elements
   * attribute.instanced=0 - is this is an instanced attribute (a.k.a. divisor)
   * attribute.noAlloc=false - if this attribute should not be allocated
   *
   * @example
   * attributeManager.add({
   *   positions: {size: 2, update: calculatePositions}
   *   colors: {size: 3, update: calculateColors}
   * });
   *
   * @param {Object} attributes - attribute map (see above)
   * @param {Object} updaters - separate map of update functions (deprecated)
   */


  _createClass(AttributeManager, [{
    key: 'add',
    value: function add(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._add(attributes, updaters);
    }

    /**
      * Removes attributes
      * Takes an array of attribute names and delete them from
      * the attribute map if they exists
      *
      * @example
      * attributeManager.remove(['position']);
      *
      * @param {Object} attributeNameArray - attribute name array (see above)
      */

  }, {
    key: 'remove',
    value: function remove(attributeNameArray) {
      for (var i = 0; i < attributeNameArray.length; i++) {
        var name = attributeNameArray[i];
        if (this.attributes[name] !== undefined) {
          delete this.attributes[name];
        }
      }
    }

    /* Marks an attribute for update
     * @param {string} triggerName: attribute or accessor name
     */

  }, {
    key: 'invalidate',
    value: function invalidate(triggerName) {
      var invalidatedAttributes = this._invalidateTrigger(triggerName);

      // For performance tuning
      logFunctions.onLog({
        level: LOG_DETAIL_PRIORITY,
        message: 'invalidated attributes ' + invalidatedAttributes + ' (' + triggerName + ') for ' + this.id,
        id: this.identifier
      });
    }
  }, {
    key: 'invalidateAll',
    value: function invalidateAll() {
      for (var attributeName in this.attributes) {
        this.attributes[attributeName].needsUpdate = true;
      }

      // For performance tuning
      logFunctions.onLog({
        level: LOG_DETAIL_PRIORITY,
        message: 'invalidated all attributes for ' + this.id,
        id: this.identifier
      });
    }
  }, {
    key: '_invalidateTrigger',
    value: function _invalidateTrigger(triggerName) {
      var attributes = this.attributes,
          updateTriggers = this.updateTriggers;

      var invalidatedAttributes = updateTriggers[triggerName];

      if (!invalidatedAttributes) {
        var message = 'invalidating non-existent trigger ' + triggerName + ' for ' + this.id + '\n';
        message += 'Valid triggers: ' + Object.keys(attributes).join(', ');
        log.warn(message, invalidatedAttributes);
      }
      invalidatedAttributes.forEach(function (name) {
        var attribute = attributes[name];
        if (attribute) {
          attribute.needsUpdate = true;
        }
      });
      return invalidatedAttributes;
    }

    /**
     * Ensure all attribute buffers are updated from props or data.
     *
     * Note: Any preallocated buffers in "buffers" matching registered attribute
     * names will be used. No update will happen in this case.
     * Note: Calls onUpdateStart and onUpdateEnd log callbacks before and after.
     *
     * @param {Object} opts - options
     * @param {Object} opts.data - data (iterable object)
     * @param {Object} opts.numInstances - count of data
     * @param {Object} opts.buffers = {} - pre-allocated buffers
     * @param {Object} opts.props - passed to updaters
     * @param {Object} opts.context - Used as "this" context for updaters
     */

  }, {
    key: 'update',
    value: function update() {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref8.data,
          numInstances = _ref8.numInstances,
          _ref8$props = _ref8.props,
          props = _ref8$props === undefined ? {} : _ref8$props,
          _ref8$buffers = _ref8.buffers,
          buffers = _ref8$buffers === undefined ? {} : _ref8$buffers,
          _ref8$context = _ref8.context,
          context = _ref8$context === undefined ? {} : _ref8$context,
          _ref8$ignoreUnknownAt = _ref8.ignoreUnknownAttributes,
          ignoreUnknownAttributes = _ref8$ignoreUnknownAt === undefined ? false : _ref8$ignoreUnknownAt;

      // First apply any application provided buffers
      this._checkExternalBuffers({ buffers: buffers, ignoreUnknownAttributes: ignoreUnknownAttributes });
      this._setExternalBuffers(buffers);

      // Only initiate alloc/update (and logging) if actually needed
      if (this._analyzeBuffers({ numInstances: numInstances })) {
        logFunctions.onUpdateStart({ level: LOG_START_END_PRIORITY, id: this.id, numInstances: numInstances });
        this.stats.timeStart();
        this._updateBuffers({ numInstances: numInstances, data: data, props: props, context: context });
        this.stats.timeEnd();
        logFunctions.onUpdateEnd({ level: LOG_START_END_PRIORITY, id: this.id, numInstances: numInstances });
      }
    }

    /**
     * Returns all attribute descriptors
     * Note: Format matches luma.gl Model/Program.setAttributes()
     * @return {Object} attributes - descriptors
     */

  }, {
    key: 'getAttributes',
    value: function getAttributes() {
      return this.attributes;
    }

    /**
     * Returns changed attribute descriptors
     * This indicates which WebGLBuggers need to be updated
     * @return {Object} attributes - descriptors
     */

  }, {
    key: 'getChangedAttributes',
    value: function getChangedAttributes(_ref9) {
      var _ref9$clearChangedFla = _ref9.clearChangedFlags,
          clearChangedFlags = _ref9$clearChangedFla === undefined ? false : _ref9$clearChangedFla;
      var attributes = this.attributes;

      var changedAttributes = {};
      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        if (attribute.changed) {
          attribute.changed = attribute.changed && !clearChangedFlags;
          changedAttributes[attributeName] = attribute;
        }
      }
      return changedAttributes;
    }

    /**
     * Returns the redraw flag, optionally clearing it.
     * Redraw flag will be set if any attributes attributes changed since
     * flag was last cleared.
     *
     * @param {Object} [opts]
     * @param {String} [opts.clearRedrawFlags=false] - whether to clear the flag
     * @return {false|String} - reason a redraw is needed.
     */

  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw() {
      var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref10$clearRedrawFla = _ref10.clearRedrawFlags,
          clearRedrawFlags = _ref10$clearRedrawFla === undefined ? false : _ref10$clearRedrawFla;

      var redraw = this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !clearRedrawFlags;
      return redraw && this.id;
    }

    /**
     * Sets the redraw flag.
     * @param {Boolean} redraw=true
     * @return {AttributeManager} - for chaining
     */

  }, {
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.needsRedraw = true;
      return this;
    }

    // DEPRECATED METHODS

    /**
     * @deprecated since version 2.5, use add() instead
     * Adds attributes
     * @param {Object} attributes - attribute map (see above)
     * @param {Object} updaters - separate map of update functions (deprecated)
     */

  }, {
    key: 'addInstanced',
    value: function addInstanced(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._add(attributes, updaters, { instanced: 1 });
    }

    // PROTECTED METHODS - Only to be used by collaborating classes, not by apps

    /**
     * Returns object containing all accessors as keys, with non-null values
     * @return {Object} - accessors object
     */

  }, {
    key: 'getAccessors',
    value: function getAccessors() {
      return this.updateTriggers;
    }

    // PRIVATE METHODS

    // Used to register an attribute

  }, {
    key: '_add',
    value: function _add(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var newAttributes = {};

      for (var attributeName in attributes) {
        // support for separate update function map
        // For now, just copy any attributes from that map into the main map
        // TODO - Attribute maps are a deprecated feature, remove
        if (attributeName in updaters) {
          attributes[attributeName] = Object.assign({}, attributes[attributeName], updaters[attributeName]);
        }

        var attribute = attributes[attributeName];

        var isIndexed = attribute.isIndexed || attribute.elements;
        var size = attribute.elements && 1 || attribute.size;
        var value = attribute.value || null;

        // Initialize the attribute descriptor, with WebGL and metadata fields
        var attributeData = Object.assign({
          // Ensure that fields are present before Object.seal()
          target: undefined,
          userData: {} // Reserved for application
        },
        // Metadata
        attribute, {
          // State
          isExternalBuffer: false,
          needsAlloc: false,
          needsUpdate: false,
          changed: false,

          // Luma fields
          isIndexed: isIndexed,
          size: size,
          value: value
        }, _extraProps);
        // Sanity - no app fields on our attributes. Use userData instead.
        Object.seal(attributeData);

        // Check all fields and generate helpful error messages
        this._validateAttributeDefinition(attributeName, attributeData);

        // Add to both attributes list (for registration with model)
        newAttributes[attributeName] = attributeData;
      }

      Object.assign(this.attributes, newAttributes);

      this._mapUpdateTriggersToAttributes();
    }

    // build updateTrigger name to attribute name mapping

  }, {
    key: '_mapUpdateTriggersToAttributes',
    value: function _mapUpdateTriggersToAttributes() {
      var _this = this;

      var triggers = {};

      var _loop = function _loop(attributeName) {
        var attribute = _this.attributes[attributeName];
        var accessor = attribute.accessor;

        // Backards compatibility: allow attribute name to be used as update trigger key

        triggers[attributeName] = [attributeName];

        // use accessor name as update trigger key
        if (typeof accessor === 'string') {
          accessor = [accessor];
        }
        if (Array.isArray(accessor)) {
          accessor.forEach(function (accessorName) {
            if (!triggers[accessorName]) {
              triggers[accessorName] = [];
            }
            triggers[accessorName].push(attributeName);
          });
        }
      };

      for (var attributeName in this.attributes) {
        _loop(attributeName);
      }

      this.updateTriggers = triggers;
    }
  }, {
    key: '_validateAttributeDefinition',
    value: function _validateAttributeDefinition(attributeName, attribute) {
      assert(attribute.size >= 1 && attribute.size <= 4, 'Attribute definition for ' + attributeName + ' invalid size');

      // Check that either 'accessor' or 'update' is a valid function
      var hasUpdater = attribute.noAlloc || typeof attribute.update === 'function' || typeof attribute.accessor === 'string';
      if (!hasUpdater) {
        throw new Error('Attribute ' + attributeName + ' missing update or accessor');
      }
    }

    // Checks that any attribute buffers in props are valid
    // Note: This is just to help app catch mistakes

  }, {
    key: '_checkExternalBuffers',
    value: function _checkExternalBuffers() {
      var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref11$buffers = _ref11.buffers,
          buffers = _ref11$buffers === undefined ? {} : _ref11$buffers,
          _ref11$ignoreUnknownA = _ref11.ignoreUnknownAttributes,
          ignoreUnknownAttributes = _ref11$ignoreUnknownA === undefined ? false : _ref11$ignoreUnknownA;

      var attributes = this.attributes;

      for (var attributeName in buffers) {
        var attribute = attributes[attributeName];
        if (!attribute && !ignoreUnknownAttributes) {
          throw new Error('Unknown attribute prop ' + attributeName);
        }
        // const buffer = buffers[attributeName];
        // TODO - check buffer type
      }
    }

    // Set the buffers for the supplied attributes
    // Update attribute buffers from any attributes in props
    // Detach any previously set buffers, marking all
    // Attributes for auto allocation
    /* eslint-disable max-statements */

  }, {
    key: '_setExternalBuffers',
    value: function _setExternalBuffers(bufferMap) {
      var attributes = this.attributes,
          numInstances = this.numInstances;

      // Copy the refs of any supplied buffers in the props

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var buffer = bufferMap[attributeName];
        attribute.isExternalBuffer = false;
        if (buffer) {
          var ArrayType = glArrayFromType(attribute.type || GL.FLOAT);
          if (!(buffer instanceof ArrayType)) {
            throw new Error('Attribute ' + attributeName + ' must be of type ' + ArrayType.name);
          }
          if (attribute.auto && buffer.length <= numInstances * attribute.size) {
            throw new Error('Attribute prop array must match length and size');
          }

          attribute.isExternalBuffer = true;
          attribute.needsUpdate = false;
          if (attribute.value !== buffer) {
            attribute.value = buffer;
            attribute.changed = true;
            this.needsRedraw = true;
          }
        }
      }
    }
    /* eslint-enable max-statements */

    /* Checks that typed arrays for attributes are big enough
     * sets alloc flag if not
     * @return {Boolean} whether any updates are needed
     */

  }, {
    key: '_analyzeBuffers',
    value: function _analyzeBuffers(_ref12) {
      var numInstances = _ref12.numInstances;
      var attributes = this.attributes;

      assert(numInstances !== undefined, 'numInstances not defined');

      // Track whether any allocations or updates are needed
      var needsUpdate = false;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        if (!attribute.isExternalBuffer) {
          // Do we need to reallocate the attribute's typed array?
          var needsAlloc = attribute.value === null || attribute.value.length / attribute.size < numInstances;
          if (needsAlloc && (attribute.update || attribute.accessor)) {
            attribute.needsAlloc = true;
            needsUpdate = true;
          }
          if (attribute.needsUpdate) {
            needsUpdate = true;
          }
        }
      }

      return needsUpdate;
    }

    /**
     * @private
     * Calls update on any buffers that need update
     * TODO? - If app supplied all attributes, no need to iterate over data
     *
     * @param {Object} opts - options
     * @param {Object} opts.data - data (iterable object)
     * @param {Object} opts.numInstances - count of data
     * @param {Object} opts.buffers = {} - pre-allocated buffers
     * @param {Object} opts.props - passed to updaters
     * @param {Object} opts.context - Used as "this" context for updaters
     */
    /* eslint-disable max-statements, complexity */

  }, {
    key: '_updateBuffers',
    value: function _updateBuffers(_ref13) {
      var numInstances = _ref13.numInstances,
          data = _ref13.data,
          props = _ref13.props,
          context = _ref13.context;
      var attributes = this.attributes;

      // Allocate at least one element to ensure a valid buffer

      var allocCount = Math.max(numInstances, 1);

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        // Allocate a new typed array if needed
        if (attribute.needsAlloc) {
          var ArrayType = glArrayFromType(attribute.type || GL.FLOAT);
          attribute.value = new ArrayType(attribute.size * allocCount);
          logFunctions.onUpdate({
            level: LOG_DETAIL_PRIORITY,
            message: attributeName + ' allocated ' + allocCount,
            id: this.id
          });
          attribute.needsAlloc = false;
          attribute.needsUpdate = true;
        }
      }

      for (var _attributeName in attributes) {
        var _attribute = attributes[_attributeName];
        // Call updater function if needed
        if (_attribute.needsUpdate) {
          this._updateBuffer({ attribute: _attribute, attributeName: _attributeName, numInstances: numInstances, data: data, props: props, context: context });
        }
      }

      this.allocedInstances = allocCount;
    }
  }, {
    key: '_updateBuffer',
    value: function _updateBuffer(_ref14) {
      var attribute = _ref14.attribute,
          attributeName = _ref14.attributeName,
          numInstances = _ref14.numInstances,
          data = _ref14.data,
          props = _ref14.props,
          context = _ref14.context;
      var update = attribute.update,
          accessor = attribute.accessor;


      var timeStart = new Date();
      if (update) {
        // Custom updater - typically for non-instanced layers
        update.call(context, attribute, { data: data, props: props, numInstances: numInstances });
        this._checkAttributeArray(attribute, attributeName);
      } else if (accessor) {
        // Standard updater
        this._updateBufferViaStandardAccessor({ attribute: attribute, data: data, props: props });
        this._checkAttributeArray(attribute, attributeName);
      } else {
        logFunctions.onUpdate({
          level: LOG_DETAIL_PRIORITY,
          message: attributeName + ' missing update function',
          id: this.id
        });
      }
      var timeMs = Math.round(new Date() - timeStart);
      var time = timeMs + 'ms';
      logFunctions.onUpdate({
        level: LOG_DETAIL_PRIORITY,
        message: attributeName + ' updated ' + numInstances + ' ' + time,
        id: this.id
      });

      attribute.needsUpdate = false;
      attribute.changed = true;
      this.needsRedraw = true;
    }
    /* eslint-enable max-statements */

  }, {
    key: '_updateBufferViaStandardAccessor',
    value: function _updateBufferViaStandardAccessor(_ref15) {
      var attribute = _ref15.attribute,
          data = _ref15.data,
          props = _ref15.props;
      var accessor = attribute.accessor,
          value = attribute.value,
          size = attribute.size;

      var accessorFunc = props[accessor];

      assert(typeof accessorFunc === 'function', 'accessor "' + accessor + '" is not a function');

      var _attribute$defaultVal = attribute.defaultValue,
          defaultValue = _attribute$defaultVal === undefined ? [0, 0, 0, 0] : _attribute$defaultVal;

      defaultValue = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          var objectValue = accessorFunc(object);
          objectValue = Array.isArray(objectValue) ? objectValue : [objectValue];
          /* eslint-disable no-fallthrough, default-case */
          switch (size) {
            case 4:
              value[i + 3] = Number.isFinite(objectValue[3]) ? objectValue[3] : defaultValue[3];
            case 3:
              value[i + 2] = Number.isFinite(objectValue[2]) ? objectValue[2] : defaultValue[2];
            case 2:
              value[i + 1] = Number.isFinite(objectValue[1]) ? objectValue[1] : defaultValue[1];
            case 1:
              value[i + 0] = Number.isFinite(objectValue[0]) ? objectValue[0] : defaultValue[0];
          }
          i += size;
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
    key: '_checkAttributeArray',
    value: function _checkAttributeArray(attribute, attributeName) {
      var value = attribute.value;

      if (value && value.length >= 4) {
        var valid = Number.isFinite(value[0]) && Number.isFinite(value[1]) && Number.isFinite(value[2]) && Number.isFinite(value[3]);
        if (!valid) {
          throw new Error('Illegal attribute generated for ' + attributeName);
        }
      }
    }
  }]);

  return AttributeManager;
}();

export default AttributeManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9hdHRyaWJ1dGUtbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTdGF0cyIsImxvZyIsIkdMIiwiYXNzZXJ0IiwiTE9HX1NUQVJUX0VORF9QUklPUklUWSIsIkxPR19ERVRBSUxfUFJJT1JJVFkiLCJub29wIiwiZ2xBcnJheUZyb21UeXBlIiwiZ2xUeXBlIiwiY2xhbXBlZCIsIkZMT0FUIiwiRmxvYXQzMkFycmF5IiwiVU5TSUdORURfU0hPUlQiLCJVTlNJR05FRF9TSE9SVF81XzZfNSIsIlVOU0lHTkVEX1NIT1JUXzRfNF80XzQiLCJVTlNJR05FRF9TSE9SVF81XzVfNV8xIiwiVWludDE2QXJyYXkiLCJVTlNJR05FRF9JTlQiLCJVaW50MzJBcnJheSIsIlVOU0lHTkVEX0JZVEUiLCJVaW50OENsYW1wZWRBcnJheSIsIlVpbnQ4QXJyYXkiLCJCWVRFIiwiSW50OEFycmF5IiwiU0hPUlQiLCJJbnQxNkFycmF5IiwiSU5UIiwiSW50MzJBcnJheSIsIkVycm9yIiwibG9nRnVuY3Rpb25zIiwic2F2ZWRNZXNzYWdlcyIsInRpbWVTdGFydCIsIm9uTG9nIiwibGV2ZWwiLCJtZXNzYWdlIiwib25VcGRhdGVTdGFydCIsImlkIiwibnVtSW5zdGFuY2VzIiwiRGF0ZSIsIm9uVXBkYXRlIiwicHVzaCIsIm9uVXBkYXRlRW5kIiwidGltZU1zIiwiTWF0aCIsInJvdW5kIiwidGltZSIsImdyb3VwIiwiY29sbGFwc2VkIiwiZ3JvdXBFbmQiLCJBdHRyaWJ1dGVNYW5hZ2VyIiwidW5kZWZpbmVkIiwiYXR0cmlidXRlcyIsInVwZGF0ZVRyaWdnZXJzIiwiYWNjZXNzb3JzIiwiYWxsb2NlZEluc3RhbmNlcyIsIm5lZWRzUmVkcmF3IiwidXNlckRhdGEiLCJzdGF0cyIsIk9iamVjdCIsInNlYWwiLCJ1cGRhdGVycyIsIl9hZGQiLCJhdHRyaWJ1dGVOYW1lQXJyYXkiLCJpIiwibGVuZ3RoIiwibmFtZSIsInRyaWdnZXJOYW1lIiwiaW52YWxpZGF0ZWRBdHRyaWJ1dGVzIiwiX2ludmFsaWRhdGVUcmlnZ2VyIiwiaWRlbnRpZmllciIsImF0dHJpYnV0ZU5hbWUiLCJuZWVkc1VwZGF0ZSIsImtleXMiLCJqb2luIiwid2FybiIsImZvckVhY2giLCJhdHRyaWJ1dGUiLCJkYXRhIiwicHJvcHMiLCJidWZmZXJzIiwiY29udGV4dCIsImlnbm9yZVVua25vd25BdHRyaWJ1dGVzIiwiX2NoZWNrRXh0ZXJuYWxCdWZmZXJzIiwiX3NldEV4dGVybmFsQnVmZmVycyIsIl9hbmFseXplQnVmZmVycyIsIl91cGRhdGVCdWZmZXJzIiwidGltZUVuZCIsImNsZWFyQ2hhbmdlZEZsYWdzIiwiY2hhbmdlZEF0dHJpYnV0ZXMiLCJjaGFuZ2VkIiwiY2xlYXJSZWRyYXdGbGFncyIsInJlZHJhdyIsImluc3RhbmNlZCIsIl9leHRyYVByb3BzIiwibmV3QXR0cmlidXRlcyIsImFzc2lnbiIsImlzSW5kZXhlZCIsImVsZW1lbnRzIiwic2l6ZSIsInZhbHVlIiwiYXR0cmlidXRlRGF0YSIsInRhcmdldCIsImlzRXh0ZXJuYWxCdWZmZXIiLCJuZWVkc0FsbG9jIiwiX3ZhbGlkYXRlQXR0cmlidXRlRGVmaW5pdGlvbiIsIl9tYXBVcGRhdGVUcmlnZ2Vyc1RvQXR0cmlidXRlcyIsInRyaWdnZXJzIiwiYWNjZXNzb3IiLCJBcnJheSIsImlzQXJyYXkiLCJhY2Nlc3Nvck5hbWUiLCJoYXNVcGRhdGVyIiwibm9BbGxvYyIsInVwZGF0ZSIsImJ1ZmZlck1hcCIsImJ1ZmZlciIsIkFycmF5VHlwZSIsInR5cGUiLCJhdXRvIiwiYWxsb2NDb3VudCIsIm1heCIsIl91cGRhdGVCdWZmZXIiLCJjYWxsIiwiX2NoZWNrQXR0cmlidXRlQXJyYXkiLCJfdXBkYXRlQnVmZmVyVmlhU3RhbmRhcmRBY2Nlc3NvciIsImFjY2Vzc29yRnVuYyIsImRlZmF1bHRWYWx1ZSIsIm9iamVjdCIsIm9iamVjdFZhbHVlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ2YWxpZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FB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cHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBndWFyZC1mb3ItaW4gKi9cbmltcG9ydCBTdGF0cyBmcm9tICcuL3N0YXRzJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vdXRpbHMvbG9nJztcbmltcG9ydCB7R0x9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBMT0dfU1RBUlRfRU5EX1BSSU9SSVRZID0gMTtcbmNvbnN0IExPR19ERVRBSUxfUFJJT1JJVFkgPSAyO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdsQXJyYXlGcm9tVHlwZShnbFR5cGUsIHtjbGFtcGVkID0gdHJ1ZX0gPSB7fSkge1xuICAvLyBTb3J0ZWQgaW4gc29tZSBvcmRlciBvZiBsaWtlbGlob29kIHRvIHJlZHVjZSBhbW91bnQgb2YgY29tcGFyaXNvbnNcbiAgc3dpdGNoIChnbFR5cGUpIHtcbiAgY2FzZSBHTC5GTE9BVDpcbiAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICBjYXNlIEdMLlVOU0lHTkVEX1NIT1JUOlxuICBjYXNlIEdMLlVOU0lHTkVEX1NIT1JUXzVfNl81OlxuICBjYXNlIEdMLlVOU0lHTkVEX1NIT1JUXzRfNF80XzQ6XG4gIGNhc2UgR0wuVU5TSUdORURfU0hPUlRfNV81XzVfMTpcbiAgICByZXR1cm4gVWludDE2QXJyYXk7XG4gIGNhc2UgR0wuVU5TSUdORURfSU5UOlxuICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgY2FzZSBHTC5VTlNJR05FRF9CWVRFOlxuICAgIHJldHVybiBjbGFtcGVkID8gVWludDhDbGFtcGVkQXJyYXkgOiBVaW50OEFycmF5O1xuICBjYXNlIEdMLkJZVEU6XG4gICAgcmV0dXJuIEludDhBcnJheTtcbiAgY2FzZSBHTC5TSE9SVDpcbiAgICByZXR1cm4gSW50MTZBcnJheTtcbiAgY2FzZSBHTC5JTlQ6XG4gICAgcmV0dXJuIEludDMyQXJyYXk7XG4gIGRlZmF1bHQ6XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZGVkdWNlIHR5cGUgZnJvbSBhcnJheScpO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuLy8gRGVmYXVsdCBsb2dnZXJzXG5jb25zdCBsb2dGdW5jdGlvbnMgPSB7XG4gIHNhdmVkTWVzc2FnZXM6IG51bGwsXG4gIHRpbWVTdGFydDogbnVsbCxcblxuICBvbkxvZzogKHtsZXZlbCwgbWVzc2FnZX0pID0+IHtcbiAgICBsb2cubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSxcbiAgb25VcGRhdGVTdGFydDogKHtsZXZlbCwgaWQsIG51bUluc3RhbmNlc30pID0+IHtcbiAgICBsb2dGdW5jdGlvbnMuc2F2ZWRNZXNzYWdlcyA9IFtdO1xuICAgIGxvZ0Z1bmN0aW9ucy50aW1lU3RhcnQgPSBuZXcgRGF0ZSgpO1xuICB9LFxuICBvblVwZGF0ZTogKHtsZXZlbCwgbWVzc2FnZX0pID0+IHtcbiAgICBpZiAobG9nRnVuY3Rpb25zLnNhdmVkTWVzc2FnZXMpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5zYXZlZE1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgfVxuICB9LFxuICBvblVwZGF0ZUVuZDogKHtsZXZlbCwgaWQsIG51bUluc3RhbmNlc30pID0+IHtcbiAgICBjb25zdCB0aW1lTXMgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkgLSBsb2dGdW5jdGlvbnMudGltZVN0YXJ0KTtcbiAgICBjb25zdCB0aW1lID0gYCR7dGltZU1zfW1zYDtcbiAgICBsb2cuZ3JvdXAobGV2ZWwsXG4gICAgICBgVXBkYXRlZCBhdHRyaWJ1dGVzIGZvciAke251bUluc3RhbmNlc30gaW5zdGFuY2VzIGluICR7aWR9IGluICR7dGltZX1gLFxuICAgICAge2NvbGxhcHNlZDogdHJ1ZX1cbiAgICApO1xuICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBsb2dGdW5jdGlvbnMuc2F2ZWRNZXNzYWdlcykge1xuICAgICAgbG9nLmxvZyhsZXZlbCwgbWVzc2FnZSk7XG4gICAgfVxuICAgIGxvZy5ncm91cEVuZChsZXZlbCwgYFVwZGF0ZWQgYXR0cmlidXRlcyBmb3IgJHtudW1JbnN0YW5jZXN9IGluc3RhbmNlcyBpbiAke2lkfSBpbiAke3RpbWV9YCk7XG4gICAgbG9nRnVuY3Rpb25zLnNhdmVkTWVzc2FnZXMgPSBudWxsO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRyaWJ1dGVNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIFNldHMgbG9nIGZ1bmN0aW9ucyB0byBoZWxwIHRyYWNlIG9yIHRpbWUgYXR0cmlidXRlIHVwZGF0ZXMuXG4gICAqIERlZmF1bHQgbG9nZ2luZyB1c2VzIGRlY2sgbG9nZ2VyLlxuICAgKlxuICAgKiBgb25Mb2dgIGlzIGNhbGxlZCBmb3IgZWFjaCBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIFRvIGVuYWJsZSBkZXRhaWxlZCBjb250cm9sIG9mIHRpbW1pbmcgYW5kIGUuZy4gaGllcmFyY2hpY2FsIGxvZ2dpbmcsXG4gICAqIGhvb2tzIGFyZSBhbHNvIHByb3ZpZGVkIGZvciB1cGRhdGUgc3RhcnQgYW5kIGVuZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRzXVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMub25Mb2c9XSAtIGNhbGxlZCB0byBwcmludFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMub25VcGRhdGVTdGFydD1dIC0gY2FsbGVkIGJlZm9yZSB1cGRhdGUoKSBzdGFydHNcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLm9uVXBkYXRlRW5kPV0gLSBjYWxsZWQgYWZ0ZXIgdXBkYXRlKCkgZW5kc1xuICAgKi9cbiAgc3RhdGljIHNldERlZmF1bHRMb2dGdW5jdGlvbnMoe1xuICAgIG9uTG9nLFxuICAgIG9uVXBkYXRlU3RhcnQsXG4gICAgb25VcGRhdGUsXG4gICAgb25VcGRhdGVFbmRcbiAgfSA9IHt9KSB7XG4gICAgaWYgKG9uTG9nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyA9IG9uTG9nIHx8IG5vb3A7XG4gICAgfVxuICAgIGlmIChvblVwZGF0ZVN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZVN0YXJ0ID0gb25VcGRhdGVTdGFydCB8fCBub29wO1xuICAgIH1cbiAgICBpZiAob25VcGRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9nRnVuY3Rpb25zLm9uVXBkYXRlID0gb25VcGRhdGUgfHwgbm9vcDtcbiAgICB9XG4gICAgaWYgKG9uVXBkYXRlRW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZUVuZCA9IG9uVXBkYXRlRW5kIHx8IG5vb3A7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQXV0b21hdGVkIGF0dHJpYnV0ZSBnZW5lcmF0aW9uIGFuZCBtYW5hZ2VtZW50LiBTdWl0YWJsZSB3aGVuIGEgc2V0IG9mXG4gICAqIHZlcnRleCBzaGFkZXIgYXR0cmlidXRlcyBhcmUgZ2VuZXJhdGVkIGJ5IGl0ZXJhdGlvbiBvdmVyIGEgZGF0YSBhcnJheSxcbiAgICogYW5kIHVwZGF0ZXMgdG8gdGhlc2UgYXR0cmlidXRlcyBhcmUgbmVlZGVkIGVpdGhlciB3aGVuIHRoZSBkYXRhIGl0c2VsZlxuICAgKiBjaGFuZ2VzLCBvciB3aGVuIG90aGVyIGRhdGEgcmVsZXZhbnQgdG8gdGhlIGNhbGN1bGF0aW9ucyBjaGFuZ2UuXG4gICAqXG4gICAqIC0gRmlyc3QgdGhlIGFwcGxpY2F0aW9uIHJlZ2lzdGVycyBkZXNjcmlwdGlvbnMgb2YgaXRzIGR5bmFtaWMgdmVydGV4XG4gICAqICAgYXR0cmlidXRlcyB1c2luZyBBdHRyaWJ1dGVNYW5hZ2VyLmFkZCgpLlxuICAgKiAtIFRoZW4sIHdoZW4gYW55IGNoYW5nZSB0aGF0IGFmZmVjdHMgYXR0cmlidXRlcyBpcyBkZXRlY3RlZCBieSB0aGVcbiAgICogICBhcHBsaWNhdGlvbiwgdGhlIGFwcCB3aWxsIGNhbGwgQXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlKCkuXG4gICAqIC0gRmluYWxseSBiZWZvcmUgaXQgcmVuZGVycywgaXQgY2FsbHMgQXR0cmlidXRlTWFuYWdlci51cGRhdGUoKSB0b1xuICAgKiAgIGVuc3VyZSB0aGF0IGF0dHJpYnV0ZXMgYXJlIGF1dG9tYXRpY2FsbHkgcmVidWlsdCBpZiBhbnl0aGluZyBoYXMgYmVlblxuICAgKiAgIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBUaGUgYXBwbGljYXRpb24gcHJvdmlkZWQgdXBkYXRlIGZ1bmN0aW9ucyBkZXNjcmliZSBob3cgYXR0cmlidXRlc1xuICAgKiBzaG91bGQgYmUgdXBkYXRlZCBmcm9tIGEgZGF0YSBhcnJheSBhbmQgYXJlIGV4cGVjdGVkIHRvIHRyYXZlcnNlXG4gICAqIHRoYXQgZGF0YSBhcnJheSAob3IgaXRlcmFibGUpIGFuZCBmaWxsIGluIHRoZSBhdHRyaWJ1dGUncyB0eXBlZCBhcnJheS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBhdHRyaWJ1dGUgbWFuYWdlciBpbnRlbnRpb25hbGx5IGRvZXMgbm90IGRvIGFkdmFuY2VkXG4gICAqIGNoYW5nZSBkZXRlY3Rpb24sIGJ1dCBpbnN0ZWFkIG1ha2VzIGl0IGVhc3kgdG8gYnVpbGQgc3VjaCBkZXRlY3Rpb25cbiAgICogYnkgb2ZmZXJpbmcgdGhlIGFiaWxpdHkgdG8gXCJpbnZhbGlkYXRlXCIgZWFjaCBhdHRyaWJ1dGUgc2VwYXJhdGVseS5cbiAgICpcbiAgICogU3VtbWFyeTpcbiAgICogLSBrZWVwcyB0cmFjayBvZiB2YWxpZCBzdGF0ZSBmb3IgZWFjaCBhdHRyaWJ1dGVcbiAgICogLSBhdXRvIHJlYWxsb2NhdGVzIGF0dHJpYnV0ZXMgd2hlbiBuZWVkZWRcbiAgICogLSBhdXRvIHVwZGF0ZXMgYXR0cmlidXRlcyB3aXRoIHJlZ2lzdGVyZWQgdXBkYXRlciBmdW5jdGlvbnNcbiAgICogLSBhbGxvd3Mgb3ZlcnJpZGluZyB3aXRoIGFwcGxpY2F0aW9uIHN1cHBsaWVkIGJ1ZmZlcnNcbiAgICpcbiAgICogTGltaXRhdGlvbnM6XG4gICAqIC0gVGhlcmUgYXJlIGN1cnJlbnRseSBubyBwcm92aXNpb25zIGZvciBvbmx5IGludmFsaWRhdGluZyBhIHJhbmdlIG9mXG4gICAqICAgaW5kaWNlcyBpbiBhbiBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3Byb3BzLmlkXSAtIGlkZW50aWZpZXIgKGZvciBkZWJ1Z2dpbmcpXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7aWQgPSAnYXR0cmlidXRlLW1hbmFnZXInfSA9IHt9KSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy51cGRhdGVUcmlnZ2VycyA9IHt9O1xuICAgIHRoaXMuYWNjZXNzb3JzID0ge307XG4gICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gLTE7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG5cbiAgICB0aGlzLnVzZXJEYXRhID0ge307XG4gICAgdGhpcy5zdGF0cyA9IG5ldyBTdGF0cyh7aWQ6ICdhdHRyJ30pO1xuXG4gICAgLy8gRm9yIGRlYnVnZ2luZyBzYW5pdHksIHByZXZlbnQgdW5pbml0aWFsaXplZCBtZW1iZXJzXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhdHRyaWJ1dGVzXG4gICAqIFRha2VzIGEgbWFwIG9mIGF0dHJpYnV0ZSBkZXNjcmlwdG9yIG9iamVjdHNcbiAgICogLSBrZXlzIGFyZSBhdHRyaWJ1dGUgbmFtZXNcbiAgICogLSB2YWx1ZXMgYXJlIG9iamVjdHMgd2l0aCBhdHRyaWJ1dGUgZmllbGRzXG4gICAqXG4gICAqIGF0dHJpYnV0ZS5zaXplIC0gbnVtYmVyIG9mIGVsZW1lbnRzIHBlciBvYmplY3RcbiAgICogYXR0cmlidXRlLnVwZGF0ZXIgLSBudW1iZXIgb2YgZWxlbWVudHNcbiAgICogYXR0cmlidXRlLmluc3RhbmNlZD0wIC0gaXMgdGhpcyBpcyBhbiBpbnN0YW5jZWQgYXR0cmlidXRlIChhLmsuYS4gZGl2aXNvcilcbiAgICogYXR0cmlidXRlLm5vQWxsb2M9ZmFsc2UgLSBpZiB0aGlzIGF0dHJpYnV0ZSBzaG91bGQgbm90IGJlIGFsbG9jYXRlZFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBhdHRyaWJ1dGVNYW5hZ2VyLmFkZCh7XG4gICAqICAgcG9zaXRpb25zOiB7c2l6ZTogMiwgdXBkYXRlOiBjYWxjdWxhdGVQb3NpdGlvbnN9XG4gICAqICAgY29sb3JzOiB7c2l6ZTogMywgdXBkYXRlOiBjYWxjdWxhdGVDb2xvcnN9XG4gICAqIH0pO1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIGF0dHJpYnV0ZSBtYXAgKHNlZSBhYm92ZSlcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXJzIC0gc2VwYXJhdGUgbWFwIG9mIHVwZGF0ZSBmdW5jdGlvbnMgKGRlcHJlY2F0ZWQpXG4gICAqL1xuICBhZGQoYXR0cmlidXRlcywgdXBkYXRlcnMgPSB7fSkge1xuICAgIHRoaXMuX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycyk7XG4gIH1cblxuIC8qKlxuICAgKiBSZW1vdmVzIGF0dHJpYnV0ZXNcbiAgICogVGFrZXMgYW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCBkZWxldGUgdGhlbSBmcm9tXG4gICAqIHRoZSBhdHRyaWJ1dGUgbWFwIGlmIHRoZXkgZXhpc3RzXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFsncG9zaXRpb24nXSk7XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVOYW1lQXJyYXkgLSBhdHRyaWJ1dGUgbmFtZSBhcnJheSAoc2VlIGFib3ZlKVxuICAgKi9cbiAgcmVtb3ZlKGF0dHJpYnV0ZU5hbWVBcnJheSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlTmFtZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlTmFtZUFycmF5W2ldO1xuICAgICAgaWYgKHRoaXMuYXR0cmlidXRlc1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyogTWFya3MgYW4gYXR0cmlidXRlIGZvciB1cGRhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXJOYW1lOiBhdHRyaWJ1dGUgb3IgYWNjZXNzb3IgbmFtZVxuICAgKi9cbiAgaW52YWxpZGF0ZSh0cmlnZ2VyTmFtZSkge1xuICAgIGNvbnN0IGludmFsaWRhdGVkQXR0cmlidXRlcyA9IHRoaXMuX2ludmFsaWRhdGVUcmlnZ2VyKHRyaWdnZXJOYW1lKTtcblxuICAgIC8vIEZvciBwZXJmb3JtYW5jZSB0dW5pbmdcbiAgICBsb2dGdW5jdGlvbnMub25Mb2coe1xuICAgICAgbGV2ZWw6IExPR19ERVRBSUxfUFJJT1JJVFksXG4gICAgICBtZXNzYWdlOiBgaW52YWxpZGF0ZWQgYXR0cmlidXRlcyAke2ludmFsaWRhdGVkQXR0cmlidXRlc30gKCR7dHJpZ2dlck5hbWV9KSBmb3IgJHt0aGlzLmlkfWAsXG4gICAgICBpZDogdGhpcy5pZGVudGlmaWVyXG4gICAgfSk7XG4gIH1cblxuICBpbnZhbGlkYXRlQWxsKCkge1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gRm9yIHBlcmZvcm1hbmNlIHR1bmluZ1xuICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyh7XG4gICAgICBsZXZlbDogTE9HX0RFVEFJTF9QUklPUklUWSxcbiAgICAgIG1lc3NhZ2U6IGBpbnZhbGlkYXRlZCBhbGwgYXR0cmlidXRlcyBmb3IgJHt0aGlzLmlkfWAsXG4gICAgICBpZDogdGhpcy5pZGVudGlmaWVyXG4gICAgfSk7XG4gIH1cblxuICBfaW52YWxpZGF0ZVRyaWdnZXIodHJpZ2dlck5hbWUpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlcywgdXBkYXRlVHJpZ2dlcnN9ID0gdGhpcztcbiAgICBjb25zdCBpbnZhbGlkYXRlZEF0dHJpYnV0ZXMgPSB1cGRhdGVUcmlnZ2Vyc1t0cmlnZ2VyTmFtZV07XG5cbiAgICBpZiAoIWludmFsaWRhdGVkQXR0cmlidXRlcykge1xuICAgICAgbGV0IG1lc3NhZ2UgPVxuICAgICAgICBgaW52YWxpZGF0aW5nIG5vbi1leGlzdGVudCB0cmlnZ2VyICR7dHJpZ2dlck5hbWV9IGZvciAke3RoaXMuaWR9XFxuYDtcbiAgICAgIG1lc3NhZ2UgKz0gYFZhbGlkIHRyaWdnZXJzOiAke09iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmpvaW4oJywgJyl9YDtcbiAgICAgIGxvZy53YXJuKG1lc3NhZ2UsIGludmFsaWRhdGVkQXR0cmlidXRlcyk7XG4gICAgfVxuICAgIGludmFsaWRhdGVkQXR0cmlidXRlcy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaW52YWxpZGF0ZWRBdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSBhbGwgYXR0cmlidXRlIGJ1ZmZlcnMgYXJlIHVwZGF0ZWQgZnJvbSBwcm9wcyBvciBkYXRhLlxuICAgKlxuICAgKiBOb3RlOiBBbnkgcHJlYWxsb2NhdGVkIGJ1ZmZlcnMgaW4gXCJidWZmZXJzXCIgbWF0Y2hpbmcgcmVnaXN0ZXJlZCBhdHRyaWJ1dGVcbiAgICogbmFtZXMgd2lsbCBiZSB1c2VkLiBObyB1cGRhdGUgd2lsbCBoYXBwZW4gaW4gdGhpcyBjYXNlLlxuICAgKiBOb3RlOiBDYWxscyBvblVwZGF0ZVN0YXJ0IGFuZCBvblVwZGF0ZUVuZCBsb2cgY2FsbGJhY2tzIGJlZm9yZSBhbmQgYWZ0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIC0gb3B0aW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5kYXRhIC0gZGF0YSAoaXRlcmFibGUgb2JqZWN0KVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5udW1JbnN0YW5jZXMgLSBjb3VudCBvZiBkYXRhXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLmJ1ZmZlcnMgPSB7fSAtIHByZS1hbGxvY2F0ZWQgYnVmZmVyc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5wcm9wcyAtIHBhc3NlZCB0byB1cGRhdGVyc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5jb250ZXh0IC0gVXNlZCBhcyBcInRoaXNcIiBjb250ZXh0IGZvciB1cGRhdGVyc1xuICAgKi9cbiAgdXBkYXRlKHtcbiAgICBkYXRhLFxuICAgIG51bUluc3RhbmNlcyxcbiAgICBwcm9wcyA9IHt9LFxuICAgIGJ1ZmZlcnMgPSB7fSxcbiAgICBjb250ZXh0ID0ge30sXG4gICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMgPSBmYWxzZVxuICB9ID0ge30pIHtcbiAgICAvLyBGaXJzdCBhcHBseSBhbnkgYXBwbGljYXRpb24gcHJvdmlkZWQgYnVmZmVyc1xuICAgIHRoaXMuX2NoZWNrRXh0ZXJuYWxCdWZmZXJzKHtidWZmZXJzLCBpZ25vcmVVbmtub3duQXR0cmlidXRlc30pO1xuICAgIHRoaXMuX3NldEV4dGVybmFsQnVmZmVycyhidWZmZXJzKTtcblxuICAgIC8vIE9ubHkgaW5pdGlhdGUgYWxsb2MvdXBkYXRlIChhbmQgbG9nZ2luZykgaWYgYWN0dWFsbHkgbmVlZGVkXG4gICAgaWYgKHRoaXMuX2FuYWx5emVCdWZmZXJzKHtudW1JbnN0YW5jZXN9KSkge1xuICAgICAgbG9nRnVuY3Rpb25zLm9uVXBkYXRlU3RhcnQoe2xldmVsOiBMT0dfU1RBUlRfRU5EX1BSSU9SSVRZLCBpZDogdGhpcy5pZCwgbnVtSW5zdGFuY2VzfSk7XG4gICAgICB0aGlzLnN0YXRzLnRpbWVTdGFydCgpO1xuICAgICAgdGhpcy5fdXBkYXRlQnVmZmVycyh7bnVtSW5zdGFuY2VzLCBkYXRhLCBwcm9wcywgY29udGV4dH0pO1xuICAgICAgdGhpcy5zdGF0cy50aW1lRW5kKCk7XG4gICAgICBsb2dGdW5jdGlvbnMub25VcGRhdGVFbmQoe2xldmVsOiBMT0dfU1RBUlRfRU5EX1BSSU9SSVRZLCBpZDogdGhpcy5pZCwgbnVtSW5zdGFuY2VzfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIGF0dHJpYnV0ZSBkZXNjcmlwdG9yc1xuICAgKiBOb3RlOiBGb3JtYXQgbWF0Y2hlcyBsdW1hLmdsIE1vZGVsL1Byb2dyYW0uc2V0QXR0cmlidXRlcygpXG4gICAqIEByZXR1cm4ge09iamVjdH0gYXR0cmlidXRlcyAtIGRlc2NyaXB0b3JzXG4gICAqL1xuICBnZXRBdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBjaGFuZ2VkIGF0dHJpYnV0ZSBkZXNjcmlwdG9yc1xuICAgKiBUaGlzIGluZGljYXRlcyB3aGljaCBXZWJHTEJ1Z2dlcnMgbmVlZCB0byBiZSB1cGRhdGVkXG4gICAqIEByZXR1cm4ge09iamVjdH0gYXR0cmlidXRlcyAtIGRlc2NyaXB0b3JzXG4gICAqL1xuICBnZXRDaGFuZ2VkQXR0cmlidXRlcyh7Y2xlYXJDaGFuZ2VkRmxhZ3MgPSBmYWxzZX0pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGNvbnN0IGNoYW5nZWRBdHRyaWJ1dGVzID0ge307XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoYXR0cmlidXRlLmNoYW5nZWQpIHtcbiAgICAgICAgYXR0cmlidXRlLmNoYW5nZWQgPSBhdHRyaWJ1dGUuY2hhbmdlZCAmJiAhY2xlYXJDaGFuZ2VkRmxhZ3M7XG4gICAgICAgIGNoYW5nZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlZEF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVkcmF3IGZsYWcsIG9wdGlvbmFsbHkgY2xlYXJpbmcgaXQuXG4gICAqIFJlZHJhdyBmbGFnIHdpbGwgYmUgc2V0IGlmIGFueSBhdHRyaWJ1dGVzIGF0dHJpYnV0ZXMgY2hhbmdlZCBzaW5jZVxuICAgKiBmbGFnIHdhcyBsYXN0IGNsZWFyZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c11cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLmNsZWFyUmVkcmF3RmxhZ3M9ZmFsc2VdIC0gd2hldGhlciB0byBjbGVhciB0aGUgZmxhZ1xuICAgKiBAcmV0dXJuIHtmYWxzZXxTdHJpbmd9IC0gcmVhc29uIGEgcmVkcmF3IGlzIG5lZWRlZC5cbiAgICovXG4gIGdldE5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzID0gZmFsc2V9ID0ge30pIHtcbiAgICBjb25zdCByZWRyYXcgPSB0aGlzLm5lZWRzUmVkcmF3O1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0aGlzLm5lZWRzUmVkcmF3ICYmICFjbGVhclJlZHJhd0ZsYWdzO1xuICAgIHJldHVybiByZWRyYXcgJiYgdGhpcy5pZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSByZWRyYXcgZmxhZy5cbiAgICogQHBhcmFtIHtCb29sZWFufSByZWRyYXc9dHJ1ZVxuICAgKiBAcmV0dXJuIHtBdHRyaWJ1dGVNYW5hZ2VyfSAtIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgc2V0TmVlZHNSZWRyYXcocmVkcmF3ID0gdHJ1ZSkge1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gREVQUkVDQVRFRCBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIHNpbmNlIHZlcnNpb24gMi41LCB1c2UgYWRkKCkgaW5zdGVhZFxuICAgKiBBZGRzIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXMgLSBhdHRyaWJ1dGUgbWFwIChzZWUgYWJvdmUpXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVycyAtIHNlcGFyYXRlIG1hcCBvZiB1cGRhdGUgZnVuY3Rpb25zIChkZXByZWNhdGVkKVxuICAgKi9cbiAgYWRkSW5zdGFuY2VkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzID0ge30pIHtcbiAgICB0aGlzLl9hZGQoYXR0cmlidXRlcywgdXBkYXRlcnMsIHtpbnN0YW5jZWQ6IDF9KTtcbiAgfVxuXG4gIC8vIFBST1RFQ1RFRCBNRVRIT0RTIC0gT25seSB0byBiZSB1c2VkIGJ5IGNvbGxhYm9yYXRpbmcgY2xhc3Nlcywgbm90IGJ5IGFwcHNcblxuICAvKipcbiAgICogUmV0dXJucyBvYmplY3QgY29udGFpbmluZyBhbGwgYWNjZXNzb3JzIGFzIGtleXMsIHdpdGggbm9uLW51bGwgdmFsdWVzXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBhY2Nlc3NvcnMgb2JqZWN0XG4gICAqL1xuICBnZXRBY2Nlc3NvcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVHJpZ2dlcnM7XG4gIH1cblxuICAvLyBQUklWQVRFIE1FVEhPRFNcblxuICAvLyBVc2VkIHRvIHJlZ2lzdGVyIGFuIGF0dHJpYnV0ZVxuICBfYWRkKGF0dHJpYnV0ZXMsIHVwZGF0ZXJzID0ge30sIF9leHRyYVByb3BzID0ge30pIHtcblxuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAvLyBzdXBwb3J0IGZvciBzZXBhcmF0ZSB1cGRhdGUgZnVuY3Rpb24gbWFwXG4gICAgICAvLyBGb3Igbm93LCBqdXN0IGNvcHkgYW55IGF0dHJpYnV0ZXMgZnJvbSB0aGF0IG1hcCBpbnRvIHRoZSBtYWluIG1hcFxuICAgICAgLy8gVE9ETyAtIEF0dHJpYnV0ZSBtYXBzIGFyZSBhIGRlcHJlY2F0ZWQgZmVhdHVyZSwgcmVtb3ZlXG4gICAgICBpZiAoYXR0cmlidXRlTmFtZSBpbiB1cGRhdGVycykge1xuICAgICAgICBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID1cbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdLCB1cGRhdGVyc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG5cbiAgICAgIGNvbnN0IGlzSW5kZXhlZCA9IGF0dHJpYnV0ZS5pc0luZGV4ZWQgfHwgYXR0cmlidXRlLmVsZW1lbnRzO1xuICAgICAgY29uc3Qgc2l6ZSA9IChhdHRyaWJ1dGUuZWxlbWVudHMgJiYgMSkgfHwgYXR0cmlidXRlLnNpemU7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZS52YWx1ZSB8fCBudWxsO1xuXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBhdHRyaWJ1dGUgZGVzY3JpcHRvciwgd2l0aCBXZWJHTCBhbmQgbWV0YWRhdGEgZmllbGRzXG4gICAgICBjb25zdCBhdHRyaWJ1dGVEYXRhID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAge1xuICAgICAgICAgIC8vIEVuc3VyZSB0aGF0IGZpZWxkcyBhcmUgcHJlc2VudCBiZWZvcmUgT2JqZWN0LnNlYWwoKVxuICAgICAgICAgIHRhcmdldDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVzZXJEYXRhOiB7fSAgICAgICAgLy8gUmVzZXJ2ZWQgZm9yIGFwcGxpY2F0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIE1ldGFkYXRhXG4gICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAge1xuICAgICAgICAgIC8vIFN0YXRlXG4gICAgICAgICAgaXNFeHRlcm5hbEJ1ZmZlcjogZmFsc2UsXG4gICAgICAgICAgbmVlZHNBbGxvYzogZmFsc2UsXG4gICAgICAgICAgbmVlZHNVcGRhdGU6IGZhbHNlLFxuICAgICAgICAgIGNoYW5nZWQ6IGZhbHNlLFxuXG4gICAgICAgICAgLy8gTHVtYSBmaWVsZHNcbiAgICAgICAgICBpc0luZGV4ZWQsXG4gICAgICAgICAgc2l6ZSxcbiAgICAgICAgICB2YWx1ZVxuICAgICAgICB9LFxuICAgICAgICBfZXh0cmFQcm9wc1xuICAgICAgKTtcbiAgICAgIC8vIFNhbml0eSAtIG5vIGFwcCBmaWVsZHMgb24gb3VyIGF0dHJpYnV0ZXMuIFVzZSB1c2VyRGF0YSBpbnN0ZWFkLlxuICAgICAgT2JqZWN0LnNlYWwoYXR0cmlidXRlRGF0YSk7XG5cbiAgICAgIC8vIENoZWNrIGFsbCBmaWVsZHMgYW5kIGdlbmVyYXRlIGhlbHBmdWwgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHRoaXMuX3ZhbGlkYXRlQXR0cmlidXRlRGVmaW5pdGlvbihhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVEYXRhKTtcblxuICAgICAgLy8gQWRkIHRvIGJvdGggYXR0cmlidXRlcyBsaXN0IChmb3IgcmVnaXN0cmF0aW9uIHdpdGggbW9kZWwpXG4gICAgICBuZXdBdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlRGF0YTtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyk7XG5cbiAgICB0aGlzLl9tYXBVcGRhdGVUcmlnZ2Vyc1RvQXR0cmlidXRlcygpO1xuICB9XG5cbiAgLy8gYnVpbGQgdXBkYXRlVHJpZ2dlciBuYW1lIHRvIGF0dHJpYnV0ZSBuYW1lIG1hcHBpbmdcbiAgX21hcFVwZGF0ZVRyaWdnZXJzVG9BdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IHRyaWdnZXJzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBsZXQge2FjY2Vzc29yfSA9IGF0dHJpYnV0ZTtcblxuICAgICAgLy8gQmFja2FyZHMgY29tcGF0aWJpbGl0eTogYWxsb3cgYXR0cmlidXRlIG5hbWUgdG8gYmUgdXNlZCBhcyB1cGRhdGUgdHJpZ2dlciBrZXlcbiAgICAgIHRyaWdnZXJzW2F0dHJpYnV0ZU5hbWVdID0gW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyB1c2UgYWNjZXNzb3IgbmFtZSBhcyB1cGRhdGUgdHJpZ2dlciBrZXlcbiAgICAgIGlmICh0eXBlb2YgYWNjZXNzb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFjY2Vzc29yID0gW2FjY2Vzc29yXTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFjY2Vzc29yKSkge1xuICAgICAgICBhY2Nlc3Nvci5mb3JFYWNoKGFjY2Vzc29yTmFtZSA9PiB7XG4gICAgICAgICAgaWYgKCF0cmlnZ2Vyc1thY2Nlc3Nvck5hbWVdKSB7XG4gICAgICAgICAgICB0cmlnZ2Vyc1thY2Nlc3Nvck5hbWVdID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyaWdnZXJzW2FjY2Vzc29yTmFtZV0ucHVzaChhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVUcmlnZ2VycyA9IHRyaWdnZXJzO1xuICB9XG5cbiAgX3ZhbGlkYXRlQXR0cmlidXRlRGVmaW5pdGlvbihhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUpIHtcbiAgICBhc3NlcnQoYXR0cmlidXRlLnNpemUgPj0gMSAmJiBhdHRyaWJ1dGUuc2l6ZSA8PSA0LFxuICAgICAgYEF0dHJpYnV0ZSBkZWZpbml0aW9uIGZvciAke2F0dHJpYnV0ZU5hbWV9IGludmFsaWQgc2l6ZWApO1xuXG4gICAgLy8gQ2hlY2sgdGhhdCBlaXRoZXIgJ2FjY2Vzc29yJyBvciAndXBkYXRlJyBpcyBhIHZhbGlkIGZ1bmN0aW9uXG4gICAgY29uc3QgaGFzVXBkYXRlciA9IGF0dHJpYnV0ZS5ub0FsbG9jIHx8XG4gICAgICB0eXBlb2YgYXR0cmlidXRlLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgdHlwZW9mIGF0dHJpYnV0ZS5hY2Nlc3NvciA9PT0gJ3N0cmluZyc7XG4gICAgaWYgKCFoYXNVcGRhdGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dHJpYnV0ZSAke2F0dHJpYnV0ZU5hbWV9IG1pc3NpbmcgdXBkYXRlIG9yIGFjY2Vzc29yYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2tzIHRoYXQgYW55IGF0dHJpYnV0ZSBidWZmZXJzIGluIHByb3BzIGFyZSB2YWxpZFxuICAvLyBOb3RlOiBUaGlzIGlzIGp1c3QgdG8gaGVscCBhcHAgY2F0Y2ggbWlzdGFrZXNcbiAgX2NoZWNrRXh0ZXJuYWxCdWZmZXJzKHtcbiAgICBidWZmZXJzID0ge30sXG4gICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMgPSBmYWxzZVxuICB9ID0ge30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBidWZmZXJzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUgJiYgIWlnbm9yZVVua25vd25BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBhdHRyaWJ1dGUgcHJvcCAke2F0dHJpYnV0ZU5hbWV9YCk7XG4gICAgICB9XG4gICAgICAvLyBjb25zdCBidWZmZXIgPSBidWZmZXJzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgLy8gVE9ETyAtIGNoZWNrIGJ1ZmZlciB0eXBlXG4gICAgfVxuICB9XG5cbiAgLy8gU2V0IHRoZSBidWZmZXJzIGZvciB0aGUgc3VwcGxpZWQgYXR0cmlidXRlc1xuICAvLyBVcGRhdGUgYXR0cmlidXRlIGJ1ZmZlcnMgZnJvbSBhbnkgYXR0cmlidXRlcyBpbiBwcm9wc1xuICAvLyBEZXRhY2ggYW55IHByZXZpb3VzbHkgc2V0IGJ1ZmZlcnMsIG1hcmtpbmcgYWxsXG4gIC8vIEF0dHJpYnV0ZXMgZm9yIGF1dG8gYWxsb2NhdGlvblxuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBfc2V0RXh0ZXJuYWxCdWZmZXJzKGJ1ZmZlck1hcCkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzLCBudW1JbnN0YW5jZXN9ID0gdGhpcztcblxuICAgIC8vIENvcHkgdGhlIHJlZnMgb2YgYW55IHN1cHBsaWVkIGJ1ZmZlcnMgaW4gdGhlIHByb3BzXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCBidWZmZXIgPSBidWZmZXJNYXBbYXR0cmlidXRlTmFtZV07XG4gICAgICBhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlciA9IGZhbHNlO1xuICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICBjb25zdCBBcnJheVR5cGUgPSBnbEFycmF5RnJvbVR5cGUoYXR0cmlidXRlLnR5cGUgfHwgR0wuRkxPQVQpO1xuICAgICAgICBpZiAoIShidWZmZXIgaW5zdGFuY2VvZiBBcnJheVR5cGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRyaWJ1dGUgJHthdHRyaWJ1dGVOYW1lfSBtdXN0IGJlIG9mIHR5cGUgJHtBcnJheVR5cGUubmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cmlidXRlLmF1dG8gJiYgYnVmZmVyLmxlbmd0aCA8PSBudW1JbnN0YW5jZXMgKiBhdHRyaWJ1dGUuc2l6ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3AgYXJyYXkgbXVzdCBtYXRjaCBsZW5ndGggYW5kIHNpemUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGlmIChhdHRyaWJ1dGUudmFsdWUgIT09IGJ1ZmZlcikge1xuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9IGJ1ZmZlcjtcbiAgICAgICAgICBhdHRyaWJ1dGUuY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8qIENoZWNrcyB0aGF0IHR5cGVkIGFycmF5cyBmb3IgYXR0cmlidXRlcyBhcmUgYmlnIGVub3VnaFxuICAgKiBzZXRzIGFsbG9jIGZsYWcgaWYgbm90XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHdoZXRoZXIgYW55IHVwZGF0ZXMgYXJlIG5lZWRlZFxuICAgKi9cbiAgX2FuYWx5emVCdWZmZXJzKHtudW1JbnN0YW5jZXN9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBhc3NlcnQobnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQsICdudW1JbnN0YW5jZXMgbm90IGRlZmluZWQnKTtcblxuICAgIC8vIFRyYWNrIHdoZXRoZXIgYW55IGFsbG9jYXRpb25zIG9yIHVwZGF0ZXMgYXJlIG5lZWRlZFxuICAgIGxldCBuZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyKSB7XG4gICAgICAgIC8vIERvIHdlIG5lZWQgdG8gcmVhbGxvY2F0ZSB0aGUgYXR0cmlidXRlJ3MgdHlwZWQgYXJyYXk/XG4gICAgICAgIGNvbnN0IG5lZWRzQWxsb2MgPVxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZS5sZW5ndGggLyBhdHRyaWJ1dGUuc2l6ZSA8IG51bUluc3RhbmNlcztcbiAgICAgICAgaWYgKG5lZWRzQWxsb2MgJiYgKGF0dHJpYnV0ZS51cGRhdGUgfHwgYXR0cmlidXRlLmFjY2Vzc29yKSkge1xuICAgICAgICAgIGF0dHJpYnV0ZS5uZWVkc0FsbG9jID0gdHJ1ZTtcbiAgICAgICAgICBuZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgIG5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZWVkc1VwZGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBDYWxscyB1cGRhdGUgb24gYW55IGJ1ZmZlcnMgdGhhdCBuZWVkIHVwZGF0ZVxuICAgKiBUT0RPPyAtIElmIGFwcCBzdXBwbGllZCBhbGwgYXR0cmlidXRlcywgbm8gbmVlZCB0byBpdGVyYXRlIG92ZXIgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuZGF0YSAtIGRhdGEgKGl0ZXJhYmxlIG9iamVjdClcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMubnVtSW5zdGFuY2VzIC0gY291bnQgb2YgZGF0YVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5idWZmZXJzID0ge30gLSBwcmUtYWxsb2NhdGVkIGJ1ZmZlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMucHJvcHMgLSBwYXNzZWQgdG8gdXBkYXRlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuY29udGV4dCAtIFVzZWQgYXMgXCJ0aGlzXCIgY29udGV4dCBmb3IgdXBkYXRlcnNcbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG4gIF91cGRhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXMsIGRhdGEsIHByb3BzLCBjb250ZXh0fSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG5cbiAgICAvLyBBbGxvY2F0ZSBhdCBsZWFzdCBvbmUgZWxlbWVudCB0byBlbnN1cmUgYSB2YWxpZCBidWZmZXJcbiAgICBjb25zdCBhbGxvY0NvdW50ID0gTWF0aC5tYXgobnVtSW5zdGFuY2VzLCAxKTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyBBbGxvY2F0ZSBhIG5ldyB0eXBlZCBhcnJheSBpZiBuZWVkZWRcbiAgICAgIGlmIChhdHRyaWJ1dGUubmVlZHNBbGxvYykge1xuICAgICAgICBjb25zdCBBcnJheVR5cGUgPSBnbEFycmF5RnJvbVR5cGUoYXR0cmlidXRlLnR5cGUgfHwgR0wuRkxPQVQpO1xuICAgICAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgQXJyYXlUeXBlKGF0dHJpYnV0ZS5zaXplICogYWxsb2NDb3VudCk7XG4gICAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZSh7XG4gICAgICAgICAgbGV2ZWw6IExPR19ERVRBSUxfUFJJT1JJVFksXG4gICAgICAgICAgbWVzc2FnZTogYCR7YXR0cmlidXRlTmFtZX0gYWxsb2NhdGVkICR7YWxsb2NDb3VudH1gLFxuICAgICAgICAgIGlkOiB0aGlzLmlkXG4gICAgICAgIH0pO1xuICAgICAgICBhdHRyaWJ1dGUubmVlZHNBbGxvYyA9IGZhbHNlO1xuICAgICAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgLy8gQ2FsbCB1cGRhdGVyIGZ1bmN0aW9uIGlmIG5lZWRlZFxuICAgICAgaWYgKGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSkge1xuICAgICAgICB0aGlzLl91cGRhdGVCdWZmZXIoe2F0dHJpYnV0ZSwgYXR0cmlidXRlTmFtZSwgbnVtSW5zdGFuY2VzLCBkYXRhLCBwcm9wcywgY29udGV4dH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYWxsb2NlZEluc3RhbmNlcyA9IGFsbG9jQ291bnQ7XG4gIH1cblxuICBfdXBkYXRlQnVmZmVyKHthdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIG51bUluc3RhbmNlcywgZGF0YSwgcHJvcHMsIGNvbnRleHR9KSB7XG4gICAgY29uc3Qge3VwZGF0ZSwgYWNjZXNzb3J9ID0gYXR0cmlidXRlO1xuXG4gICAgY29uc3QgdGltZVN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICBpZiAodXBkYXRlKSB7XG4gICAgICAvLyBDdXN0b20gdXBkYXRlciAtIHR5cGljYWxseSBmb3Igbm9uLWluc3RhbmNlZCBsYXllcnNcbiAgICAgIHVwZGF0ZS5jYWxsKGNvbnRleHQsIGF0dHJpYnV0ZSwge2RhdGEsIHByb3BzLCBudW1JbnN0YW5jZXN9KTtcbiAgICAgIHRoaXMuX2NoZWNrQXR0cmlidXRlQXJyYXkoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lKTtcbiAgICB9IGVsc2UgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAvLyBTdGFuZGFyZCB1cGRhdGVyXG4gICAgICB0aGlzLl91cGRhdGVCdWZmZXJWaWFTdGFuZGFyZEFjY2Vzc29yKHthdHRyaWJ1dGUsIGRhdGEsIHByb3BzfSk7XG4gICAgICB0aGlzLl9jaGVja0F0dHJpYnV0ZUFycmF5KGF0dHJpYnV0ZSwgYXR0cmlidXRlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZSh7XG4gICAgICAgIGxldmVsOiBMT0dfREVUQUlMX1BSSU9SSVRZLFxuICAgICAgICBtZXNzYWdlOiBgJHthdHRyaWJ1dGVOYW1lfSBtaXNzaW5nIHVwZGF0ZSBmdW5jdGlvbmAsXG4gICAgICAgIGlkOiB0aGlzLmlkXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgdGltZU1zID0gTWF0aC5yb3VuZChuZXcgRGF0ZSgpIC0gdGltZVN0YXJ0KTtcbiAgICBjb25zdCB0aW1lID0gYCR7dGltZU1zfW1zYDtcbiAgICBsb2dGdW5jdGlvbnMub25VcGRhdGUoe1xuICAgICAgbGV2ZWw6IExPR19ERVRBSUxfUFJJT1JJVFksXG4gICAgICBtZXNzYWdlOiBgJHthdHRyaWJ1dGVOYW1lfSB1cGRhdGVkICR7bnVtSW5zdGFuY2VzfSAke3RpbWV9YCxcbiAgICAgIGlkOiB0aGlzLmlkXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGUubmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICBhdHRyaWJ1dGUuY2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIF91cGRhdGVCdWZmZXJWaWFTdGFuZGFyZEFjY2Vzc29yKHthdHRyaWJ1dGUsIGRhdGEsIHByb3BzfSkge1xuICAgIGNvbnN0IHthY2Nlc3NvciwgdmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGNvbnN0IGFjY2Vzc29yRnVuYyA9IHByb3BzW2FjY2Vzc29yXTtcblxuICAgIGFzc2VydCh0eXBlb2YgYWNjZXNzb3JGdW5jID09PSAnZnVuY3Rpb24nLCBgYWNjZXNzb3IgXCIke2FjY2Vzc29yfVwiIGlzIG5vdCBhIGZ1bmN0aW9uYCk7XG5cbiAgICBsZXQge2RlZmF1bHRWYWx1ZSA9IFswLCAwLCAwLCAwXX0gPSBhdHRyaWJ1dGU7XG4gICAgZGVmYXVsdFZhbHVlID0gQXJyYXkuaXNBcnJheShkZWZhdWx0VmFsdWUpID8gZGVmYXVsdFZhbHVlIDogW2RlZmF1bHRWYWx1ZV07XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGxldCBvYmplY3RWYWx1ZSA9IGFjY2Vzc29yRnVuYyhvYmplY3QpO1xuICAgICAgb2JqZWN0VmFsdWUgPSBBcnJheS5pc0FycmF5KG9iamVjdFZhbHVlKSA/IG9iamVjdFZhbHVlIDogW29iamVjdFZhbHVlXTtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWZhbGx0aHJvdWdoLCBkZWZhdWx0LWNhc2UgKi9cbiAgICAgIHN3aXRjaCAoc2l6ZSkge1xuICAgICAgY2FzZSA0OiB2YWx1ZVtpICsgM10gPSBOdW1iZXIuaXNGaW5pdGUob2JqZWN0VmFsdWVbM10pID8gb2JqZWN0VmFsdWVbM10gOiBkZWZhdWx0VmFsdWVbM107XG4gICAgICBjYXNlIDM6IHZhbHVlW2kgKyAyXSA9IE51bWJlci5pc0Zpbml0ZShvYmplY3RWYWx1ZVsyXSkgPyBvYmplY3RWYWx1ZVsyXSA6IGRlZmF1bHRWYWx1ZVsyXTtcbiAgICAgIGNhc2UgMjogdmFsdWVbaSArIDFdID0gTnVtYmVyLmlzRmluaXRlKG9iamVjdFZhbHVlWzFdKSA/IG9iamVjdFZhbHVlWzFdIDogZGVmYXVsdFZhbHVlWzFdO1xuICAgICAgY2FzZSAxOiB2YWx1ZVtpICsgMF0gPSBOdW1iZXIuaXNGaW5pdGUob2JqZWN0VmFsdWVbMF0pID8gb2JqZWN0VmFsdWVbMF0gOiBkZWZhdWx0VmFsdWVbMF07XG4gICAgICB9XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrQXR0cmlidXRlQXJyYXkoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lKSB7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoID49IDQpIHtcbiAgICAgIGNvbnN0IHZhbGlkID1cbiAgICAgICAgTnVtYmVyLmlzRmluaXRlKHZhbHVlWzBdKSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWVbMV0pICYmXG4gICAgICAgIE51bWJlci5pc0Zpbml0ZSh2YWx1ZVsyXSkgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlWzNdKTtcbiAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIGF0dHJpYnV0ZSBnZW5lcmF0ZWQgZm9yICR7YXR0cmlidXRlTmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==