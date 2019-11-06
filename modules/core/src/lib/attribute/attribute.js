/* eslint-disable complexity */
import {_Accessor as Accessor} from '@luma.gl/core';
import DataColumn from './data-column';
import assert from '../../utils/assert';
import {createIterable} from '../../utils/iterable-utils';
import {fillArray} from '../../utils/flatten';
import * as range from '../../utils/range';
import {normalizeTransitionSettings} from './attribute-transition-utils';

export default class Attribute extends DataColumn {
  constructor(gl, opts = {}) {
    super(gl, opts);

    const {
      // deck.gl fields
      offset = 0,
      transition = false,
      noAlloc = false,
      update = null,
      accessor = null,
      transform = null,
      bufferLayout = null
    } = opts;

    Object.assign(this.settings, {
      transition,
      noAlloc,
      update: update || (accessor && this._standardAccessor),
      accessor,
      elementOffset: offset / Accessor.getBytesPerElement({type: this.bufferType}),
      transform
    });

    Object.assign(this.state, {
      lastExternalBuffer: null,
      needsUpdate: true,
      needsRedraw: false,
      updateRanges: range.FULL,
      bufferLayout
    });

    Object.seal(this.settings);
    Object.seal(this.state);

    // Check all fields and generate helpful error messages
    this._validateAttributeUpdaters();
  }

  get bufferLayout() {
    return this.state.bufferLayout;
  }

  set bufferLayout(layout) {
    this.state.bufferLayout = layout;
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

  getAccessor() {
    return this.settings.accessor;
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

  updateBuffer({numInstances, bufferLayout, data, props, context}) {
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
        update.call(context, this, {data, startRow, endRow, props, numInstances, bufferLayout});
      }
      if (!this.value) {
        // no value was assigned during update
      } else if (this.constant || this.buffer.byteLength < this.value.byteLength) {
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
    this.state.needsRedraw = true;

    return updated;
  }

  // Use generic value
  // Returns true if successful
  setConstantValue(value) {
    const {state} = this;

    if (value === undefined || typeof value === 'function') {
      return false;
    }

    const hasChanged = super.setData({constant: true, value});

    state.needsRedraw = state.needsUpdate || hasChanged;
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
    state.needsRedraw = true;

    super.setData(buffer);

    return true;
  }

  getVertexOffset(row, bufferLayout = this.bufferLayout) {
    let offset = this.settings.elementOffset;
    if (bufferLayout) {
      let index = 0;
      for (const geometrySize of bufferLayout) {
        if (index >= row) {
          break;
        }
        offset += geometrySize * this.size;
        index++;
      }
      return offset;
    }
    return offset + row * this.size;
  }

  _standardAccessor(attribute, {data, startRow, endRow, props, numInstances, bufferLayout}) {
    const {settings, value, size} = attribute;

    const {accessor, transform} = settings;
    const accessorFunc = typeof accessor === 'function' ? accessor : props[accessor];

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let i = attribute.getVertexOffset(startRow, bufferLayout);
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;

      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        // transform callbacks could be bound to a particular layer instance.
        // always point `this` to the current layer.
        objectValue = transform.call(this, objectValue);
      }

      if (bufferLayout) {
        attribute._normalizeValue(objectValue, objectInfo.target);
        const numVertices = bufferLayout[objectInfo.index];
        fillArray({
          target: attribute.value,
          source: objectInfo.target,
          start: i,
          count: numVertices
        });
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
    attribute.constant = false;
    attribute.bufferLayout = bufferLayout;
  }

  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const {settings} = this;

    // Check that 'update' is a valid function
    const hasUpdater = settings.noAlloc || typeof settings.update === 'function';
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }

  _checkAttributeArray() {
    const {value} = this;
    if (value && value.length >= 4) {
      const valid =
        Number.isFinite(value[0]) &&
        Number.isFinite(value[1]) &&
        Number.isFinite(value[2]) &&
        Number.isFinite(value[3]);
      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
}
