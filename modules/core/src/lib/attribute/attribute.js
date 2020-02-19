/* eslint-disable complexity */
import DataColumn from './data-column';
import assert from '../../utils/assert';
import {createIterable, getAccessorFromBuffer} from '../../utils/iterable-utils';
import {fillArray} from '../../utils/flatten';
import * as range from '../../utils/range';
import {normalizeTransitionSettings} from './attribute-transition-utils';

export default class Attribute extends DataColumn {
  constructor(gl, opts = {}) {
    super(gl, opts);

    const {
      // deck.gl fields
      transition = false,
      noAlloc = false,
      update = null,
      accessor = null,
      transform = null,
      startIndices = null
    } = opts;

    Object.assign(this.settings, {
      transition,
      noAlloc,
      update: update || (accessor && this._autoUpdater),
      accessor,
      transform
    });

    Object.assign(this.state, {
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      updateRanges: range.FULL,
      startIndices
    });

    Object.seal(this.settings);
    Object.seal(this.state);

    // Check all fields and generate helpful error messages
    this._validateAttributeUpdaters();
  }

  get startIndices() {
    return this.state.startIndices;
  }

  set startIndices(layout) {
    this.state.startIndices = layout;
  }

  needsUpdate() {
    return this.state.needsUpdate;
  }

  needsRedraw({clearChangedFlags = false} = {}) {
    const needsRedraw = this.state.needsRedraw;
    this.state.needsRedraw = needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }

  getUpdateTriggers() {
    const {accessor} = this.settings;

    // Backards compatibility: allow attribute name to be used as update trigger key
    return [this.id].concat((typeof accessor !== 'function' && accessor) || []);
  }

  supportsTransition() {
    return Boolean(this.settings.transition);
  }

  // Resolve transition settings object if transition is enabled, otherwise `null`
  getTransitionSetting(opts) {
    const {accessor} = this.settings;
    // TODO: have the layer resolve these transition settings itself?
    const layerSettings = this.settings.transition;
    if (!this.supportsTransition()) {
      return null;
    }
    // these are the transition settings passed in by the user
    const userSettings = Array.isArray(accessor)
      ? opts[accessor.find(a => opts[a])]
      : opts[accessor];

    // Shorthand: use duration instead of parameter object
    return normalizeTransitionSettings(userSettings, layerSettings);
  }

  setNeedsUpdate(reason = this.id, dataRange) {
    this.state.needsUpdate = this.state.needsUpdate || reason;
    this.setNeedsRedraw(reason);
    if (dataRange) {
      const {startRow = 0, endRow = Infinity} = dataRange;
      this.state.updateRanges = range.add(this.state.updateRanges, [startRow, endRow]);
    } else {
      this.state.updateRanges = range.FULL;
    }
  }

  clearNeedsUpdate() {
    this.state.needsUpdate = false;
    this.state.updateRanges = range.EMPTY;
  }

  setNeedsRedraw(reason = this.id) {
    this.state.needsRedraw = this.state.needsRedraw || reason;
  }

  update(opts) {
    // backward compatibility
    this.setData(opts);
  }

  allocate(numInstances) {
    const {state, settings} = this;

    if (settings.noAlloc) {
      // Data is provided through a Buffer object.
      return false;
    }

    if (settings.update) {
      assert(Number.isFinite(numInstances));
      super.allocate({
        numInstances,
        copy: state.updateRanges !== range.FULL
      });
      return true;
    }

    return false;
  }

  updateBuffer({numInstances, data, props, context}) {
    if (!this.needsUpdate()) {
      return false;
    }

    const {
      state: {updateRanges},
      settings: {update, noAlloc}
    } = this;

    let updated = true;
    if (update) {
      // Custom updater - typically for non-instanced layers
      for (const [startRow, endRow] of updateRanges) {
        update.call(context, this, {data, startRow, endRow, props, numInstances});
      }
      if (!this.value) {
        // no value was assigned during update
      } else if (
        this.constant ||
        this.buffer.byteLength < this.value.byteLength + this.byteOffset
      ) {
        this.setData({
          value: this.value,
          constant: this.constant
        });
      } else {
        for (const [startRow, endRow] of updateRanges) {
          const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
          const endOffset = Number.isFinite(endRow)
            ? this.getVertexOffset(endRow)
            : noAlloc || !Number.isFinite(numInstances)
              ? this.value.length
              : numInstances * this.size;

          super.updateSubBuffer({startOffset, endOffset});
        }
      }
      this._checkAttributeArray();
    } else {
      updated = false;
    }

    this.clearNeedsUpdate();
    this.setNeedsRedraw();

    return updated;
  }

  // Use generic value
  // Returns true if successful
  setConstantValue(value) {
    if (value === undefined || typeof value === 'function') {
      return false;
    }

    const hasChanged = this.setData({constant: true, value});

    if (hasChanged) {
      this.setNeedsRedraw();
    }
    this.clearNeedsUpdate();
    return true;
  }

  // Use external buffer
  // Returns true if successful
  // eslint-disable-next-line max-statements
  setExternalBuffer(buffer) {
    const {state} = this;

    if (!buffer) {
      state.lastExternalBuffer = null;
      return false;
    }

    this.clearNeedsUpdate();

    if (state.lastExternalBuffer === buffer) {
      return true;
    }
    state.lastExternalBuffer = buffer;
    this.setNeedsRedraw();
    this.setData(buffer);
    return true;
  }

  // Binary value is a typed array packed from mapping the source data with the accessor
  // If the returned value from the accessor is the same as the attribute value, set it directly
  // Otherwise use the auto updater for transform/normalization
  setBinaryValue(buffer, startIndices = null) {
    const {state, settings} = this;

    if (!buffer) {
      state.binaryValue = null;
      state.binaryAccessor = null;
      return false;
    }

    if (settings.noAlloc) {
      // Let the layer handle this
      return false;
    }

    if (state.binaryValue === buffer) {
      this.clearNeedsUpdate();
      return true;
    }
    state.binaryValue = buffer;
    this.setNeedsRedraw();

    if (ArrayBuffer.isView(buffer)) {
      buffer = {value: buffer};
    }
    const needsUpdate = settings.transform || startIndices !== this.startIndices;

    if (needsUpdate) {
      assert(ArrayBuffer.isView(buffer.value), `invalid ${settings.accessor}`);
      const needsNormalize = buffer.size && buffer.size !== this.size;

      state.binaryAccessor = getAccessorFromBuffer(buffer.value, {
        size: buffer.size || this.size,
        stride: buffer.stride,
        offset: buffer.offset,
        startIndices,
        nested: needsNormalize
      });
      // Fall through to auto updater
      return false;
    }

    this.clearNeedsUpdate();
    this.setData(buffer);
    return true;
  }

  getVertexOffset(row) {
    const {startIndices} = this;
    const vertexIndex = startIndices ? startIndices[row] : row;
    return vertexIndex * this.size;
  }

  getShaderAttributes() {
    const shaderAttributeDefs = this.settings.shaderAttributes || {[this.id]: null};
    const shaderAttributes = {};

    for (const shaderAttributeName in shaderAttributeDefs) {
      Object.assign(
        shaderAttributes,
        super.getShaderAttributes(shaderAttributeName, shaderAttributeDefs[shaderAttributeName])
      );
    }

    return shaderAttributes;
  }

  /* eslint-disable max-depth, max-statements */
  _autoUpdater(attribute, {data, startRow, endRow, props, numInstances}) {
    const {settings, state, value, size, startIndices} = attribute;

    const {accessor, transform} = settings;
    const accessorFunc =
      state.binaryAccessor || (typeof accessor === 'function' ? accessor : props[accessor]);

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let i = attribute.getVertexOffset(startRow);
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;

      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        // transform callbacks could be bound to a particular layer instance.
        // always point `this` to the current layer.
        objectValue = transform.call(this, objectValue);
      }

      if (startIndices) {
        const numVertices =
          (startIndices[objectInfo.index + 1] || numInstances) - startIndices[objectInfo.index];
        if (objectValue && Array.isArray(objectValue[0])) {
          let startIndex = i;
          for (const item of objectValue) {
            attribute._normalizeValue(item, value, startIndex);
            startIndex += size;
          }
        } else if (objectValue && objectValue.length > size) {
          value.set(objectValue, i);
        } else {
          attribute._normalizeValue(objectValue, objectInfo.target, 0);
          fillArray({
            target: value,
            source: objectInfo.target,
            start: i,
            count: numVertices
          });
        }
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
    attribute.constant = false;
  }
  /* eslint-enable max-depth, max-statements */

  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const {settings} = this;

    // Check that 'update' is a valid function
    const hasUpdater = settings.noAlloc || typeof settings.update === 'function';
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }

  // check that the first few elements of the attribute are reasonable
  /* eslint-disable no-fallthrough */
  _checkAttributeArray() {
    const {value} = this;
    const limit = Math.min(4, this.size);
    if (value && value.length >= limit) {
      let valid = true;
      switch (limit) {
        case 4:
          valid = valid && Number.isFinite(value[3]);
        case 3:
          valid = valid && Number.isFinite(value[2]);
        case 2:
          valid = valid && Number.isFinite(value[1]);
        case 1:
          valid = valid && Number.isFinite(value[0]);
          break;
        default:
          valid = false;
      }

      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
  /* eslint-enable no-fallthrough */
}
